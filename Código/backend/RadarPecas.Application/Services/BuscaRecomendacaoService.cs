using Microsoft.EntityFrameworkCore;
using RadarPecas.Application.DTOs.Busca;
using RadarPecas.Application.DTOs.Common;
using RadarPecas.Application.Interfaces;
using RadarPecas.Domain.Entities;

namespace RadarPecas.Application.Services;

public class BuscaRecomendacaoService : IBuscaRecomendacaoService
{
    private readonly IApplicationDbContext _context;
    private readonly IGeolocationService _geolocationService;
    private readonly ICompatibilidadeService _compatibilidadeService;

    public BuscaRecomendacaoService(
        IApplicationDbContext context,
        IGeolocationService _geoService,
        ICompatibilidadeService _compService)
    {
        _context = context;
        _geolocationService = _geoService;
        _compatibilidadeService = _compService;
    }

    public async Task<ApiResponse<BuscaResultadoResponse>> BuscarOfertasAsync(BuscaFiltrosRequest filtros, CancellationToken cancellationToken = default)
    {
        if (filtros.Page < 1) filtros.Page = 1;
        if (filtros.PageSize < 1) filtros.PageSize = 10;
        if (filtros.PageSize > 100) filtros.PageSize = 100;

        int? modeloMotoId = filtros.ModeloMotoId;
        int? anoFabricacao = filtros.AnoFabricacao;
        string? motoDescricao = null;

        // Se informou ID da Garagem Virtual, busca o veículo cadastrado
        if (filtros.GaragemVirtualId.HasValue)
        {
            var motoGaragem = await _context.GaragemVirtual
                .AsNoTracking()
                .Include(g => g.ModeloMoto)
                .FirstOrDefaultAsync(g => g.Id == filtros.GaragemVirtualId.Value, cancellationToken);

            if (motoGaragem != null)
            {
                modeloMotoId = motoGaragem.ModeloMotoId;
                anoFabricacao = motoGaragem.AnoFabricacao;
                motoDescricao = motoGaragem.ModeloMoto != null
                    ? $"{motoGaragem.ModeloMoto.Marca} {motoGaragem.ModeloMoto.Modelo} ({motoGaragem.AnoFabricacao})"
                    : $"Ano {motoGaragem.AnoFabricacao}";
            }
        }
        else if (modeloMotoId.HasValue)
        {
            var modelo = await _context.ModelosMoto
                .AsNoTracking()
                .FirstOrDefaultAsync(m => m.Id == modeloMotoId.Value, cancellationToken);

            if (modelo != null)
            {
                motoDescricao = anoFabricacao.HasValue
                    ? $"{modelo.Marca} {modelo.Modelo} ({anoFabricacao.Value})"
                    : $"{modelo.Marca} {modelo.Modelo}";
            }
        }

        // Consulta base de ofertas ativas (sem Include de Avaliacoes para evitar OOM)
        var query = _context.EstoqueLojas
            .AsNoTracking()
            .Where(e => e.Loja != null && e.Loja.Ativa && e.Peca != null);

        // Filtro de estoque disponível
        if (filtros.ApenasEmEstoque)
        {
            query = query.Where(e => e.QuantidadeEstoque > 0);
        }

        // Filtro textual via ILike/trigram no banco
        if (!string.IsNullOrWhiteSpace(filtros.Termo))
        {
            query = _context.FiltrarPorTexto(
                query,
                filtros.Termo,
                e => e.Peca!.Nome,
                e => e.Peca!.Descricao,
                e => e.Peca!.Sku,
                e => e.Peca!.CodigoEan,
                e => e.Peca!.Categoria,
                e => e.Loja!.NomeFantasia);
        }

        // Filtro de categoria (usa índice B-tree em lower(categoria))
        if (!string.IsNullOrWhiteSpace(filtros.Categoria))
        {
            var catLower = filtros.Categoria.Trim().ToLower();
            query = query.Where(e => e.Peca!.Categoria.ToLower() == catLower);
        }

        var hoje = DateOnly.FromDateTime(DateTime.UtcNow);

        // Filtro de promoção
        if (filtros.ApenasPromocoes)
        {
            query = query.Where(e => e.EmPromocao &&
                e.PrecoPromocional.HasValue &&
                (!e.DataInicioPromocao.HasValue || e.DataInicioPromocao.Value <= hoje) &&
                (!e.DataFimPromocao.HasValue || e.DataFimPromocao.Value >= hoje));
        }

        // Filtro de preço máximo efetivo traduzível para SQL
        if (filtros.PrecoMaximo.HasValue)
        {
            var max = filtros.PrecoMaximo.Value;
            query = query.Where(e =>
                ((e.EmPromocao && e.PrecoPromocional.HasValue &&
                  (!e.DataInicioPromocao.HasValue || e.DataInicioPromocao.Value <= hoje) &&
                  (!e.DataFimPromocao.HasValue || e.DataFimPromocao.Value >= hoje))
                    ? e.PrecoPromocional!.Value
                    : e.PrecoVenda) <= max);
        }

        // Filtro de marca/fabricante no banco
        if (!string.IsNullOrWhiteSpace(filtros.Marca))
        {
            var marcas = filtros.Marca.Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries);
            if (marcas.Length > 0)
            {
                query = _context.FiltrarPorTermosQualquer(
                    query,
                    marcas,
                    e => e.Peca!.Nome,
                    e => e.Peca!.Descricao,
                    e => e.Peca!.Sku);
            }
        }

        // Princípio 1: Compatibilidade antes de recomendação
        // Se houver motocicleta selecionada, filtrar apenas peças estritamente compatíveis
        bool filtroCompatibilidadeAtivo = modeloMotoId.HasValue;
        if (filtroCompatibilidadeAtivo)
        {
            var idsCompativeis = await _compatibilidadeService.ObterIdsPecasCompativeisAsync(modeloMotoId!.Value, anoFabricacao, cancellationToken);
            query = query.Where(e => idsCompativeis.Contains(e.PecaId));
        }

        // Pré-filtro espacial via bounding box (aproveita índice composto ativa + latitude + longitude)
        bool hasUserCoords = filtros.UserLatitude.HasValue && filtros.UserLongitude.HasValue;
        if (hasUserCoords && filtros.RaioKm.HasValue && filtros.RaioKm.Value > 0)
        {
            var (minLat, maxLat, minLon, maxLon) = _geolocationService.CalcularBoundingBox(
                filtros.UserLatitude!.Value,
                filtros.UserLongitude!.Value,
                filtros.RaioKm.Value);

            query = query.Where(e =>
                e.Loja!.Latitude >= minLat && e.Loja.Latitude <= maxLat &&
                e.Loja.Longitude >= minLon && e.Loja.Longitude <= maxLon);
        }

        const double degToRad = Math.PI / 180.0;
        double uLatRad = hasUserCoords ? (double)filtros.UserLatitude!.Value * degToRad : 0.0;
        double uLonRad = hasUserCoords ? (double)filtros.UserLongitude!.Value * degToRad : 0.0;
        double cosULat = hasUserCoords ? Math.Cos(uLatRad) : 1.0;

        // Projeção SQL com cálculo de preço efetivo, promoção ativa, média de avaliação e distância Haversine
        var projetada = query.Select(e => new
        {
            EstoqueId = e.Id,
            PecaId = e.Peca!.Id,
            NomePeca = e.Peca.Nome,
            Categoria = e.Peca.Categoria,
            FotoPecaUrl = e.Peca.FotoPecaUrl,
            Sku = e.Peca.Sku,
            CodigoEan = e.Peca.CodigoEan,
            Especificacoes = e.Peca.Especificacoes,
            LojaId = e.Loja!.Id,
            NomeLoja = e.Loja.NomeFantasia,
            EnderecoCompleto = e.Loja.EnderecoCompleto,
            TelefoneContato = e.Loja.TelefoneContato,
            Latitude = e.Loja.Latitude,
            Longitude = e.Loja.Longitude,
            TotalAvaliacoes = e.Loja.Avaliacoes.Count(),
            MediaAvaliacao = e.Loja.Avaliacoes.Any()
                ? e.Loja.Avaliacoes.Average(a => (double)a.Nota)
                : 5.0,
            e.PrecoVenda,
            e.EmPromocao,
            e.PrecoPromocional,
            PromocaoAtiva = e.EmPromocao &&
                e.PrecoPromocional.HasValue &&
                (!e.DataInicioPromocao.HasValue || e.DataInicioPromocao.Value <= hoje) &&
                (!e.DataFimPromocao.HasValue || e.DataFimPromocao.Value >= hoje),
            PrecoEfetivo = (e.EmPromocao &&
                e.PrecoPromocional.HasValue &&
                (!e.DataInicioPromocao.HasValue || e.DataInicioPromocao.Value <= hoje) &&
                (!e.DataFimPromocao.HasValue || e.DataFimPromocao.Value >= hoje))
                ? e.PrecoPromocional!.Value
                : e.PrecoVenda,
            e.QuantidadeEstoque,
            DistanciaDouble = hasUserCoords
                ? 2.0 * 6371.0 * Math.Asin(Math.Min(1.0, Math.Sqrt(
                    Math.Pow(Math.Sin(((double)e.Loja.Latitude * degToRad - uLatRad) / 2.0), 2.0) +
                    cosULat * Math.Cos((double)e.Loja.Latitude * degToRad) *
                    Math.Pow(Math.Sin(((double)e.Loja.Longitude * degToRad - uLonRad) / 2.0), 2.0))))
                : (double?)null
        });

        // Filtro exato de raio Haversine no banco
        if (hasUserCoords && filtros.RaioKm.HasValue && filtros.RaioKm.Value > 0)
        {
            double raioMax = (double)filtros.RaioKm.Value;
            projetada = projetada.Where(x => x.DistanciaDouble <= raioMax);
        }

        // Estatísticas agregadas no banco (evita carregar lista completa em memória)
        var stats = await projetada
            .GroupBy(_ => 1)
            .Select(g => new
            {
                Total = g.Count(),
                MenorPreco = g.Min(x => x.PrecoEfetivo),
                MaiorPreco = g.Max(x => x.PrecoEfetivo),
                MaiorDistancia = g.Max(x => x.DistanciaDouble)
            })
            .FirstOrDefaultAsync(cancellationToken);

        var ordenacao = (filtros.Ordenacao ?? "recomendados").ToLower();

        if (stats == null || stats.Total == 0)
        {
            var vazio = new PagedResult<OfertaBuscaItemResponse>(new List<OfertaBuscaItemResponse>(), 0, filtros.Page, filtros.PageSize);
            return ApiResponse<BuscaResultadoResponse>.Ok(new BuscaResultadoResponse
            {
                Ofertas = vazio,
                MotoFiltroModeloId = modeloMotoId,
                MotoFiltroDescricao = motoDescricao,
                FiltroCompatibilidadeAtivo = filtroCompatibilidadeAtivo,
                RaioKmAplicado = filtros.RaioKm,
                OrdenacaoAplicada = ordenacao
            });
        }

        decimal menorPreco = stats.MenorPreco;
        decimal maiorPreco = stats.MaiorPreco;
        decimal? maiorDistanciaDec = stats.MaiorDistancia.HasValue
            ? Math.Round((decimal)stats.MaiorDistancia.Value, 2)
            : null;

        decimal precoDiff = maiorPreco > menorPreco ? (maiorPreco - menorPreco) : 0m;
        double maxDistVal = stats.MaiorDistancia.HasValue && stats.MaiorDistancia.Value > 0.0
            ? stats.MaiorDistancia.Value
            : 0.0;
        bool usarDistNoScore = hasUserCoords && maxDistVal > 0.0;

        var ordenada = ordenacao switch
        {
            "menor_preco" => projetada.OrderBy(x => x.PrecoEfetivo).ThenBy(x => x.DistanciaDouble ?? double.MaxValue),
            "maior_preco" => projetada.OrderByDescending(x => x.PrecoEfetivo).ThenBy(x => x.DistanciaDouble ?? double.MaxValue),
            "menor_distancia" => projetada.OrderBy(x => x.DistanciaDouble ?? double.MaxValue).ThenBy(x => x.PrecoEfetivo),
            "melhor_avaliacao" => projetada.OrderByDescending(x => x.MediaAvaliacao).ThenBy(x => x.PrecoEfetivo),
            _ => projetada.OrderByDescending(x =>
                0.35 * (precoDiff > 0m ? 1.0 - (double)(x.PrecoEfetivo - menorPreco) / (double)precoDiff : 1.0) +
                0.30 * (usarDistNoScore && x.DistanciaDouble.HasValue ? 1.0 - x.DistanciaDouble.Value / maxDistVal : 0.5) +
                0.20 * (x.MediaAvaliacao / 5.0) +
                0.15 * (x.PromocaoAtiva ? 1.0 : 0.0))
        };

        var pagina = await ordenada
            .Skip((filtros.Page - 1) * filtros.PageSize)
            .Take(filtros.PageSize)
            .ToListAsync(cancellationToken);

        var paginados = pagina.Select(x =>
        {
            var distanciaKm = x.DistanciaDouble.HasValue
                ? Math.Round((decimal)x.DistanciaDouble.Value, 2)
                : (decimal?)null;
            var mediaArredondada = Math.Round(x.MediaAvaliacao, 1);

            return new OfertaBuscaItemResponse
            {
                EstoqueId = x.EstoqueId,
                PecaId = x.PecaId,
                NomePeca = x.NomePeca,
                Categoria = x.Categoria,
                FotoPecaUrl = x.FotoPecaUrl,
                Sku = x.Sku,
                CodigoEan = x.CodigoEan,
                Especificacoes = x.Especificacoes,
                LojaId = x.LojaId,
                NomeLoja = x.NomeLoja,
                EnderecoCompleto = x.EnderecoCompleto,
                TelefoneContato = x.TelefoneContato,
                Latitude = x.Latitude,
                Longitude = x.Longitude,
                MediaAvaliacaoLoja = mediaArredondada,
                TotalAvaliacoesLoja = x.TotalAvaliacoes,
                PrecoVenda = x.PrecoVenda,
                EmPromocao = x.EmPromocao,
                PrecoPromocional = x.PrecoPromocional,
                PrecoEfetivo = x.PrecoEfetivo,
                PromocaoAtiva = x.PromocaoAtiva,
                QuantidadeEstoque = x.QuantidadeEstoque,
                DistanciaKm = distanciaKm,
                Compativel = true,
                ScoreRecomendacao = CalcularScoreRecomendacao(
                    x.PrecoEfetivo,
                    menorPreco,
                    maiorPreco,
                    distanciaKm,
                    maiorDistanciaDec,
                    mediaArredondada,
                    x.PromocaoAtiva)
            };
        }).ToList();

        var pagedResult = new PagedResult<OfertaBuscaItemResponse>(paginados, stats.Total, filtros.Page, filtros.PageSize);

        var resultado = new BuscaResultadoResponse
        {
            Ofertas = pagedResult,
            MotoFiltroModeloId = modeloMotoId,
            MotoFiltroDescricao = motoDescricao,
            FiltroCompatibilidadeAtivo = filtroCompatibilidadeAtivo,
            RaioKmAplicado = filtros.RaioKm,
            OrdenacaoAplicada = ordenacao
        };

        return ApiResponse<BuscaResultadoResponse>.Ok(resultado);
    }

    public double CalcularScoreRecomendacao(
        decimal preco,
        decimal menorPreco,
        decimal maiorPreco,
        decimal? distanciaKm,
        decimal? maiorDistancia,
        double mediaAvaliacaoLoja,
        bool promocaoAtiva)
    {
        // 1. Score Preço (Peso 35%) - Quanto mais barato, maior a nota
        double scorePreco;
        if (maiorPreco > menorPreco)
        {
            scorePreco = 1.0 - (double)((preco - menorPreco) / (maiorPreco - menorPreco));
        }
        else
        {
            scorePreco = 1.0;
        }

        // 2. Score Distância (Peso 30%) - Quanto mais perto, maior a nota
        double scoreDistancia;
        if (distanciaKm.HasValue && maiorDistancia.HasValue && maiorDistancia.Value > 0)
        {
            scoreDistancia = 1.0 - (double)(distanciaKm.Value / maiorDistancia.Value);
            if (scoreDistancia < 0) scoreDistancia = 0;
        }
        else
        {
            scoreDistancia = 0.5; // Neutro se distância não informada
        }

        // 3. Score Avaliação da Loja (Peso 20%) - 1 a 5 estrelas normalizadas de 0.0 a 1.0
        double scoreAvaliacao = Math.Clamp(mediaAvaliacaoLoja / 5.0, 0.0, 1.0);

        // 4. Bônus Promoção Ativa (Peso 15%) - 1.0 se ativo, 0.0 se não
        double bonusPromocao = promocaoAtiva ? 1.0 : 0.0;

        // Ranking Ponderado
        var scoreFinal = (0.35 * scorePreco) + (0.30 * scoreDistancia) + (0.20 * scoreAvaliacao) + (0.15 * bonusPromocao);

        return Math.Round(scoreFinal, 3);
    }
}
