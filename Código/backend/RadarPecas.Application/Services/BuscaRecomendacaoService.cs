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

        // Consulta base de ofertas ativas
        var query = _context.EstoqueLojas
            .AsNoTracking()
            .Include(e => e.Peca)
            .Include(e => e.Loja)
                .ThenInclude(l => l!.Avaliacoes)
            .Where(e => e.Loja != null && e.Loja.Ativa && e.Peca != null);

        // Filtro de estoque disponível
        if (filtros.ApenasEmEstoque)
        {
            query = query.Where(e => e.QuantidadeEstoque > 0);
        }

        // Filtro textual
        if (!string.IsNullOrWhiteSpace(filtros.Termo))
        {
            var t = filtros.Termo.Trim().ToLower();
            query = query.Where(e =>
                e.Peca!.Nome.ToLower().Contains(t) ||
                (e.Peca.Descricao != null && e.Peca.Descricao.ToLower().Contains(t)) ||
                (e.Peca.Sku != null && e.Peca.Sku.ToLower().Contains(t)) ||
                (e.Peca.CodigoEan != null && e.Peca.CodigoEan.Contains(t)) ||
                e.Peca.Categoria.ToLower().Contains(t) ||
                e.Loja!.NomeFantasia.ToLower().Contains(t));
        }

        // Filtro de categoria
        if (!string.IsNullOrWhiteSpace(filtros.Categoria))
        {
            query = query.Where(e => e.Peca!.Categoria.ToLower() == filtros.Categoria.Trim().ToLower());
        }

        // Filtro de promoção
        if (filtros.ApenasPromocoes)
        {
            var hoje = DateOnly.FromDateTime(DateTime.UtcNow);
            query = query.Where(e => e.EmPromocao &&
                (!e.DataInicioPromocao.HasValue || e.DataInicioPromocao.Value <= hoje) &&
                (!e.DataFimPromocao.HasValue || e.DataFimPromocao.Value >= hoje));
        }

        // Princípio 1: Compatibilidade antes de recomendação
        // Se houver motocicleta selecionada, filtrar apenas peças estritamente compatíveis
        bool filtroCompatibilidadeAtivo = modeloMotoId.HasValue;
        if (filtroCompatibilidadeAtivo)
        {
            var idsCompativeis = await _compatibilidadeService.ObterIdsPecasCompativeisAsync(modeloMotoId!.Value, anoFabricacao, cancellationToken);
            query = query.Where(e => idsCompativeis.Contains(e.PecaId));
        }

        var ofertasDb = await query.ToListAsync(cancellationToken);

        // Mapeamento e enriquecimento em memória (distâncias, scores e ordenação)
        var itens = new List<OfertaBuscaItemResponse>();

        foreach (var e in ofertasDb)
        {
            var loja = e.Loja!;
            var peca = e.Peca!;

            decimal? distancia = null;
            if (filtros.UserLatitude.HasValue && filtros.UserLongitude.HasValue)
            {
                distancia = _geolocationService.CalcularDistanciaKm(
                    filtros.UserLatitude.Value,
                    filtros.UserLongitude.Value,
                    loja.Latitude,
                    loja.Longitude);

                // Filtro por raio máximo de distância
                if (filtros.RaioKm.HasValue && distancia.Value > filtros.RaioKm.Value)
                {
                    continue;
                }
            }

            var totalAvaliacoes = loja.Avaliacoes.Count;
            var mediaAvaliacao = totalAvaliacoes > 0 ? Math.Round(loja.Avaliacoes.Average(a => a.Nota), 1) : 5.0;

            itens.Add(new OfertaBuscaItemResponse
            {
                EstoqueId = e.Id,
                PecaId = peca.Id,
                NomePeca = peca.Nome,
                Categoria = peca.Categoria,
                FotoPecaUrl = peca.FotoPecaUrl,
                Sku = peca.Sku,
                CodigoEan = peca.CodigoEan,
                Especificacoes = peca.Especificacoes,
                LojaId = loja.Id,
                NomeLoja = loja.NomeFantasia,
                EnderecoCompleto = loja.EnderecoCompleto,
                TelefoneContato = loja.TelefoneContato,
                Latitude = loja.Latitude,
                Longitude = loja.Longitude,
                MediaAvaliacaoLoja = mediaAvaliacao,
                TotalAvaliacoesLoja = totalAvaliacoes,
                PrecoVenda = e.PrecoVenda,
                EmPromocao = e.EmPromocao,
                PrecoPromocional = e.PrecoPromocional,
                PrecoEfetivo = e.PrecoEfetivo,
                PromocaoAtiva = e.PromocaoAtiva,
                QuantidadeEstoque = e.QuantidadeEstoque,
                DistanciaKm = distancia,
                Compativel = true // Já filtrado se moto foi informada
            });
        }

        // Calcular ranking combinado se necessário
        if (itens.Any())
        {
            var menorPreco = itens.Min(i => i.PrecoEfetivo);
            var maiorPreco = itens.Max(i => i.PrecoEfetivo);
            var distancias = itens.Where(i => i.DistanciaKm.HasValue).Select(i => i.DistanciaKm!.Value).ToList();
            var maiorDistancia = distancias.Any() ? distancias.Max() : (decimal?)null;

            foreach (var item in itens)
            {
                item.ScoreRecomendacao = CalcularScoreRecomendacao(
                    item.PrecoEfetivo,
                    menorPreco,
                    maiorPreco,
                    item.DistanciaKm,
                    maiorDistancia,
                    item.MediaAvaliacaoLoja,
                    item.PromocaoAtiva);
            }
        }

        // Ordenação
        var ordenacao = (filtros.Ordenacao ?? "recomendados").ToLower();
        IEnumerable<OfertaBuscaItemResponse> itensOrdenados = ordenacao switch
        {
            "menor_preco" => itens.OrderBy(i => i.PrecoEfetivo),
            "maior_preco" => itens.OrderByDescending(i => i.PrecoEfetivo),
            "menor_distancia" => itens.OrderBy(i => i.DistanciaKm ?? decimal.MaxValue),
            "melhor_avaliacao" => itens.OrderByDescending(i => i.MediaAvaliacaoLoja).ThenBy(i => i.PrecoEfetivo),
            _ => itens.OrderByDescending(i => i.ScoreRecomendacao) // "recomendados"
        };

        var listaOrdenada = itensOrdenados.ToList();
        var totalCount = listaOrdenada.Count;

        var paginados = listaOrdenada
            .Skip((filtros.Page - 1) * filtros.PageSize)
            .Take(filtros.PageSize)
            .ToList();

        var pagedResult = new PagedResult<OfertaBuscaItemResponse>(paginados, totalCount, filtros.Page, filtros.PageSize);

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
