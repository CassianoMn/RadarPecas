using Microsoft.EntityFrameworkCore;
using RadarPecas.Application.DTOs.Common;
using RadarPecas.Application.DTOs.Estoque;
using RadarPecas.Application.DTOs.Lojas;
using RadarPecas.Application.Interfaces;
using RadarPecas.Domain.Entities;

namespace RadarPecas.Application.Services;

public class LojaService : ILojaService
{
    private readonly IApplicationDbContext _context;
    private readonly IGeolocationService _geolocationService;
    private readonly INominatimGeocodingService _geocodingService;

    public LojaService(
        IApplicationDbContext context,
        IGeolocationService geolocationService,
        INominatimGeocodingService geocodingService)
    {
        _context = context;
        _geolocationService = geolocationService;
        _geocodingService = geocodingService;
    }

    public async Task<ApiResponse<List<LojaResponse>>> ListarLojasAsync(decimal? userLat = null, decimal? userLon = null, decimal? raioKm = null, CancellationToken cancellationToken = default)
    {
        var ordenacao = (userLat.HasValue && userLon.HasValue) ? "proximas" : "nome";
        var query = ConstruirConsultaLojas(userLat, userLon, raioKm, ordenacao);

        var rows = await query.ToListAsync(cancellationToken);
        var result = rows.Select(MapearLojaResponse).ToList();

        return ApiResponse<List<LojaResponse>>.Ok(result);
    }

    public async Task<ApiResponse<PagedResult<LojaResponse>>> ListarLojasPaginadoAsync(
        decimal? userLat = null,
        decimal? userLon = null,
        decimal? raioKm = null,
        string? ordenacao = "proximas",
        int page = 1,
        int pageSize = 12,
        CancellationToken cancellationToken = default)
    {
        if (page < 1) page = 1;
        if (pageSize < 1) pageSize = 12;
        if (pageSize > 100) pageSize = 100;

        var query = ConstruirConsultaLojas(userLat, userLon, raioKm, ordenacao);

        var totalCount = await query.CountAsync(cancellationToken);
        var rows = await query
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(cancellationToken);

        var items = rows.Select(MapearLojaResponse).ToList();
        var paged = new PagedResult<LojaResponse>(items, totalCount, page, pageSize);

        return ApiResponse<PagedResult<LojaResponse>>.Ok(paged);
    }

    private sealed class LojaProjetadaRow
    {
        public Guid Id { get; init; }
        public Guid UsuarioId { get; init; }
        public string NomeFantasia { get; init; } = string.Empty;
        public string? Cnpj { get; init; }
        public string EnderecoCompleto { get; init; } = string.Empty;
        public decimal Latitude { get; init; }
        public decimal Longitude { get; init; }
        public string? TelefoneContato { get; init; }
        public string? EmailContato { get; init; }
        public string? HorariosFuncionamento { get; init; }
        public string? FotoPerfilUrl { get; init; }
        public string[]? GaleriaFotosUrls { get; init; }
        public bool Ativa { get; init; }
        public int TotalAvaliacoes { get; init; }
        public double MediaAvaliacao { get; init; }
        public double? DistanciaDouble { get; init; }
    }

    private IQueryable<LojaProjetadaRow> ConstruirConsultaLojas(
        decimal? userLat,
        decimal? userLon,
        decimal? raioKm,
        string? ordenacao)
    {
        var query = _context.Lojas
            .AsNoTracking()
            .Where(l => l.Ativa);

        bool hasUserCoords = userLat.HasValue && userLon.HasValue;
        if (hasUserCoords && raioKm.HasValue && raioKm.Value > 0)
        {
            var (minLat, maxLat, minLon, maxLon) = _geolocationService.CalcularBoundingBox(
                userLat!.Value,
                userLon!.Value,
                raioKm.Value);

            query = query.Where(l =>
                l.Latitude >= minLat && l.Latitude <= maxLat &&
                l.Longitude >= minLon && l.Longitude <= maxLon);
        }

        const double degToRad = Math.PI / 180.0;
        double uLatRad = hasUserCoords ? (double)userLat!.Value * degToRad : 0.0;
        double uLonRad = hasUserCoords ? (double)userLon!.Value * degToRad : 0.0;
        double cosULat = hasUserCoords ? Math.Cos(uLatRad) : 1.0;

        var projetada = query.Select(l => new LojaProjetadaRow
        {
            Id = l.Id,
            UsuarioId = l.UsuarioId,
            NomeFantasia = l.NomeFantasia,
            Cnpj = l.Cnpj,
            EnderecoCompleto = l.EnderecoCompleto,
            Latitude = l.Latitude,
            Longitude = l.Longitude,
            TelefoneContato = l.TelefoneContato,
            EmailContato = l.EmailContato,
            HorariosFuncionamento = l.HorariosFuncionamento,
            FotoPerfilUrl = l.FotoPerfilUrl,
            GaleriaFotosUrls = l.GaleriaFotosUrls,
            Ativa = l.Ativa,
            TotalAvaliacoes = l.Avaliacoes.Count(),
            MediaAvaliacao = l.Avaliacoes.Any() ? l.Avaliacoes.Average(a => (double)a.Nota) : 5.0,
            DistanciaDouble = hasUserCoords
                ? 2.0 * 6371.0 * Math.Asin(Math.Min(1.0, Math.Sqrt(
                    Math.Pow(Math.Sin(((double)l.Latitude * degToRad - uLatRad) / 2.0), 2.0) +
                    cosULat * Math.Cos((double)l.Latitude * degToRad) *
                    Math.Pow(Math.Sin(((double)l.Longitude * degToRad - uLonRad) / 2.0), 2.0))))
                : (double?)null
        });

        if (hasUserCoords && raioKm.HasValue && raioKm.Value > 0)
        {
            double raioMax = (double)raioKm.Value;
            projetada = projetada.Where(x => x.DistanciaDouble <= raioMax);
        }

        var ord = (ordenacao ?? "proximas").ToLowerInvariant();
        return ord switch
        {
            "melhor_avaliacao" or "avaliacao" => projetada
                .OrderByDescending(x => x.MediaAvaliacao)
                .ThenBy(x => x.DistanciaDouble ?? double.MaxValue)
                .ThenBy(x => x.NomeFantasia),
            "nome" => projetada.OrderBy(x => x.NomeFantasia),
            _ => hasUserCoords
                ? projetada.OrderBy(x => x.DistanciaDouble ?? double.MaxValue).ThenBy(x => x.NomeFantasia)
                : projetada.OrderBy(x => x.NomeFantasia)
        };
    }

    private static LojaResponse MapearLojaResponse(LojaProjetadaRow row) => new()
    {
        Id = row.Id,
        UsuarioId = row.UsuarioId,
        NomeFantasia = row.NomeFantasia,
        Cnpj = row.Cnpj,
        EnderecoCompleto = row.EnderecoCompleto,
        Latitude = row.Latitude,
        Longitude = row.Longitude,
        TelefoneContato = row.TelefoneContato,
        EmailContato = row.EmailContato,
        HorariosFuncionamento = row.HorariosFuncionamento,
        FotoPerfilUrl = row.FotoPerfilUrl,
        GaleriaFotosUrls = row.GaleriaFotosUrls,
        Ativa = row.Ativa,
        MediaAvaliacao = Math.Round(row.MediaAvaliacao, 1),
        TotalAvaliacoes = row.TotalAvaliacoes,
        DistanciaKm = row.DistanciaDouble.HasValue ? Math.Round((decimal)row.DistanciaDouble.Value, 2) : null
    };

    public async Task<ApiResponse<LojaResponse>> ObterLojaPorIdAsync(Guid id, decimal? userLat = null, decimal? userLon = null, CancellationToken cancellationToken = default)
    {
        var l = await _context.Lojas
            .AsNoTracking()
            .Where(x => x.Id == id)
            .Select(x => new
            {
                x.Id,
                x.UsuarioId,
                x.NomeFantasia,
                x.Cnpj,
                x.EnderecoCompleto,
                x.Latitude,
                x.Longitude,
                x.TelefoneContato,
                x.EmailContato,
                x.HorariosFuncionamento,
                x.FotoPerfilUrl,
                x.GaleriaFotosUrls,
                x.Ativa,
                TotalAvaliacoes = x.Avaliacoes.Count(),
                MediaAvaliacao = x.Avaliacoes.Any() ? x.Avaliacoes.Average(a => (double)a.Nota) : 5.0
            })
            .FirstOrDefaultAsync(cancellationToken);

        if (l == null)
        {
            return ApiResponse<LojaResponse>.Fail("Loja não encontrada.");
        }

        decimal? distancia = null;
        if (userLat.HasValue && userLon.HasValue)
        {
            distancia = _geolocationService.CalcularDistanciaKm(userLat.Value, userLon.Value, l.Latitude, l.Longitude);
        }

        var response = new LojaResponse
        {
            Id = l.Id,
            UsuarioId = l.UsuarioId,
            NomeFantasia = l.NomeFantasia,
            Cnpj = l.Cnpj,
            EnderecoCompleto = l.EnderecoCompleto,
            Latitude = l.Latitude,
            Longitude = l.Longitude,
            TelefoneContato = l.TelefoneContato,
            EmailContato = l.EmailContato,
            HorariosFuncionamento = l.HorariosFuncionamento,
            FotoPerfilUrl = l.FotoPerfilUrl,
            GaleriaFotosUrls = l.GaleriaFotosUrls,
            Ativa = l.Ativa,
            MediaAvaliacao = Math.Round(l.MediaAvaliacao, 1),
            TotalAvaliacoes = l.TotalAvaliacoes,
            DistanciaKm = distancia
        };

        return ApiResponse<LojaResponse>.Ok(response);
    }

    public async Task<ApiResponse<LojaResponse>> ObterLojaPorUsuarioIdAsync(Guid usuarioId, CancellationToken cancellationToken = default)
    {
        var l = await _context.Lojas
            .AsNoTracking()
            .Where(x => x.UsuarioId == usuarioId)
            .Select(x => new
            {
                x.Id,
                x.UsuarioId,
                x.NomeFantasia,
                x.Cnpj,
                x.EnderecoCompleto,
                x.Latitude,
                x.Longitude,
                x.TelefoneContato,
                x.EmailContato,
                x.HorariosFuncionamento,
                x.FotoPerfilUrl,
                x.GaleriaFotosUrls,
                x.Ativa,
                TotalAvaliacoes = x.Avaliacoes.Count(),
                MediaAvaliacao = x.Avaliacoes.Any() ? x.Avaliacoes.Average(a => (double)a.Nota) : 5.0
            })
            .FirstOrDefaultAsync(cancellationToken);

        if (l == null)
        {
            return ApiResponse<LojaResponse>.Fail("Nenhuma loja vinculada a este usuário.");
        }

        var response = new LojaResponse
        {
            Id = l.Id,
            UsuarioId = l.UsuarioId,
            NomeFantasia = l.NomeFantasia,
            Cnpj = l.Cnpj,
            EnderecoCompleto = l.EnderecoCompleto,
            Latitude = l.Latitude,
            Longitude = l.Longitude,
            TelefoneContato = l.TelefoneContato,
            EmailContato = l.EmailContato,
            HorariosFuncionamento = l.HorariosFuncionamento,
            FotoPerfilUrl = l.FotoPerfilUrl,
            GaleriaFotosUrls = l.GaleriaFotosUrls,
            Ativa = l.Ativa,
            MediaAvaliacao = Math.Round(l.MediaAvaliacao, 1),
            TotalAvaliacoes = l.TotalAvaliacoes
        };

        return ApiResponse<LojaResponse>.Ok(response);
    }

    public async Task<ApiResponse<LojaResponse>> CriarLojaAsync(Guid usuarioId, CreateLojaRequest request, CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(request.NomeFantasia) || string.IsNullOrWhiteSpace(request.EnderecoCompleto))
        {
            return ApiResponse<LojaResponse>.Fail("Nome fantasia e endereço completo são obrigatórios.");
        }

        if (!string.IsNullOrWhiteSpace(request.EmailContato) && !SegurancaValidacao.EmailValido(request.EmailContato))
        {
            return ApiResponse<LojaResponse>.Fail("Informe um e-mail de contato válido.");
        }

        if (!string.IsNullOrWhiteSpace(request.Cnpj))
        {
            if (!SegurancaValidacao.CnpjValido(request.Cnpj))
            {
                return ApiResponse<LojaResponse>.Fail("CNPJ inválido. Verifique os dígitos informados.");
            }

            var cnpjExiste = await _context.Lojas.AnyAsync(l => l.Cnpj == request.Cnpj.Trim(), cancellationToken);
            if (cnpjExiste)
            {
                return ApiResponse<LojaResponse>.Fail("Já existe uma loja cadastrada com este CNPJ.");
            }
        }

        decimal lat = request.Latitude ?? 0m;
        decimal lon = request.Longitude ?? 0m;

        if (!SegurancaValidacao.CoordenadasValidas(lat, lon))
        {
            var coords = await _geocodingService.GeocodeAddressAsync(request.EnderecoCompleto, cancellationToken);
            if (coords.HasValue && SegurancaValidacao.CoordenadasValidas(coords.Value.Latitude, coords.Value.Longitude))
            {
                lat = coords.Value.Latitude;
                lon = coords.Value.Longitude;
            }
            else
            {
                return ApiResponse<LojaResponse>.Fail(
                    "Não foi possível localizar as coordenadas do endereço informado. Informe rua, número, cidade e UF completos.");
            }
        }

        var rawHorarios = string.IsNullOrWhiteSpace(request.HorariosFuncionamento)
            ? "Segunda a Sexta: 08:00 às 18:00 | Sábado: 08:00 às 13:00 | Domingo: Fechado"
            : request.HorariosFuncionamento.Trim();
        var horariosJson = rawHorarios.StartsWith("{") || rawHorarios.StartsWith("[") || rawHorarios.StartsWith("\"")
            ? rawHorarios
            : System.Text.Json.JsonSerializer.Serialize(rawHorarios);

        var loja = new Loja
        {
            UsuarioId = usuarioId,
            NomeFantasia = request.NomeFantasia.Trim(),
            Cnpj = request.Cnpj?.Trim(),
            EnderecoCompleto = request.EnderecoCompleto.Trim(),
            Latitude = lat,
            Longitude = lon,
            TelefoneContato = request.TelefoneContato?.Trim(),
            EmailContato = request.EmailContato?.Trim(),
            HorariosFuncionamento = horariosJson,
            FotoPerfilUrl = request.FotoPerfilUrl,
            GaleriaFotosUrls = request.GaleriaFotosUrls,
            Ativa = true
        };

        await _context.Lojas.AddAsync(loja, cancellationToken);
        await _context.SaveChangesAsync(cancellationToken);

        return await ObterLojaPorIdAsync(loja.Id, null, null, cancellationToken);
    }

    public async Task<ApiResponse<LojaResponse>> AtualizarLojaAsync(Guid id, UpdateLojaRequest request, Guid usuarioId, CancellationToken cancellationToken = default)
    {
        var loja = await _context.Lojas.FirstOrDefaultAsync(l => l.Id == id, cancellationToken);
        if (loja == null)
        {
            return ApiResponse<LojaResponse>.Fail("Loja não encontrada.");
        }

        if (loja.UsuarioId != usuarioId)
        {
            return ApiResponse<LojaResponse>.Fail("Acesso negado: esta loja pertence a outro lojista.");
        }

        if (string.IsNullOrWhiteSpace(request.NomeFantasia) || string.IsNullOrWhiteSpace(request.EnderecoCompleto))
        {
            return ApiResponse<LojaResponse>.Fail("Nome fantasia e endereço completo são obrigatórios.");
        }

        if (!string.IsNullOrWhiteSpace(request.EmailContato) && !SegurancaValidacao.EmailValido(request.EmailContato))
        {
            return ApiResponse<LojaResponse>.Fail("Informe um e-mail de contato válido.");
        }

        if (!string.IsNullOrWhiteSpace(request.Cnpj) && request.Cnpj.Trim() != loja.Cnpj)
        {
            if (!SegurancaValidacao.CnpjValido(request.Cnpj))
            {
                return ApiResponse<LojaResponse>.Fail("CNPJ inválido. Verifique os dígitos informados.");
            }

            var cnpjExiste = await _context.Lojas.AnyAsync(l => l.Cnpj == request.Cnpj.Trim() && l.Id != id, cancellationToken);
            if (cnpjExiste)
            {
                return ApiResponse<LojaResponse>.Fail("Já existe uma outra loja com este CNPJ.");
            }
        }

        // Se o endereço mudou e coordenadas não foram informadas, geocodifica novamente
        if (request.EnderecoCompleto.Trim() != loja.EnderecoCompleto && (!request.Latitude.HasValue || !request.Longitude.HasValue))
        {
            var coords = await _geocodingService.GeocodeAddressAsync(request.EnderecoCompleto, cancellationToken);
            if (coords.HasValue && SegurancaValidacao.CoordenadasValidas(coords.Value.Latitude, coords.Value.Longitude))
            {
                loja.Latitude = coords.Value.Latitude;
                loja.Longitude = coords.Value.Longitude;
            }
            else
            {
                return ApiResponse<LojaResponse>.Fail(
                    "Não foi possível localizar as coordenadas do novo endereço. Informe rua, número, cidade e UF completos.");
            }
        }
        else if (request.Latitude.HasValue || request.Longitude.HasValue)
        {
            var newLat = request.Latitude ?? loja.Latitude;
            var newLon = request.Longitude ?? loja.Longitude;
            if (!SegurancaValidacao.CoordenadasValidas(newLat, newLon))
            {
                return ApiResponse<LojaResponse>.Fail("Coordenadas geográficas inválidas.");
            }
            loja.Latitude = newLat;
            loja.Longitude = newLon;
        }

        loja.NomeFantasia = request.NomeFantasia.Trim();
        loja.Cnpj = request.Cnpj?.Trim();
        loja.EnderecoCompleto = request.EnderecoCompleto.Trim();
        loja.TelefoneContato = request.TelefoneContato?.Trim();
        loja.EmailContato = request.EmailContato?.Trim();
        if (!string.IsNullOrWhiteSpace(request.HorariosFuncionamento))
        {
            var rawH = request.HorariosFuncionamento.Trim();
            loja.HorariosFuncionamento = rawH.StartsWith("{") || rawH.StartsWith("[") || rawH.StartsWith("\"")
                ? rawH
                : System.Text.Json.JsonSerializer.Serialize(rawH);
        }
        loja.FotoPerfilUrl = string.IsNullOrWhiteSpace(request.FotoPerfilUrl) ? null : request.FotoPerfilUrl.Trim();
        loja.GaleriaFotosUrls = request.GaleriaFotosUrls;
        if (request.Ativa.HasValue) loja.Ativa = request.Ativa.Value;

        await _context.SaveChangesAsync(cancellationToken);

        return await ObterLojaPorIdAsync(loja.Id, null, null, cancellationToken);
    }

    public async Task<ApiResponse<DashboardLojistaResponse>> ObterDashboardLojistaAsync(Guid lojaId, Guid usuarioId, CancellationToken cancellationToken = default)
    {
        var lojaInfo = await _context.Lojas
            .AsNoTracking()
            .Where(l => l.Id == lojaId)
            .Select(l => new
            {
                l.Id,
                l.UsuarioId,
                l.NomeFantasia,
                TotalAvaliacoes = l.Avaliacoes.Count(),
                MediaAvaliacao = l.Avaliacoes.Any() ? l.Avaliacoes.Average(a => (double)a.Nota) : 5.0
            })
            .FirstOrDefaultAsync(cancellationToken);

        if (lojaInfo == null)
        {
            return ApiResponse<DashboardLojistaResponse>.Fail("Loja não encontrada.");
        }

        if (lojaInfo.UsuarioId != usuarioId)
        {
            return ApiResponse<DashboardLojistaResponse>.Fail("Acesso negado: esta loja pertence a outro lojista.");
        }

        var hoje = DateOnly.FromDateTime(DateTime.UtcNow);
        var limite24h = hoje.AddDays(-1);

        // KPIs agregados do estoque diretamente no banco
        var resumoEstoque = await _context.EstoqueLojas
            .AsNoTracking()
            .Where(e => e.LojaId == lojaId)
            .GroupBy(_ => 1)
            .Select(g => new
            {
                TotalProdutos = g.Count(),
                TotalEstoqueBaixo = g.Count(e => e.QuantidadeEstoque <= e.AlertaEstoqueMinimo),
                TotalOfertasAtivas = g.Count(e =>
                    e.EmPromocao ||
                    (e.EmPromocao && e.PrecoPromocional.HasValue &&
                     (!e.DataInicioPromocao.HasValue || e.DataInicioPromocao.Value <= hoje) &&
                     (!e.DataFimPromocao.HasValue || e.DataFimPromocao.Value >= hoje)))
            })
            .FirstOrDefaultAsync(cancellationToken);

        var totalProdutos = resumoEstoque?.TotalProdutos ?? 0;
        var totalEstoqueBaixo = resumoEstoque?.TotalEstoqueBaixo ?? 0;
        var totalOfertasAtivas = resumoEstoque?.TotalOfertasAtivas ?? 0;

        // Métricas agregadas no banco
        var resumoStats = await _context.EstatisticasOferta
            .AsNoTracking()
            .Where(s => s.EstoqueLoja != null && s.EstoqueLoja.LojaId == lojaId)
            .GroupBy(_ => 1)
            .Select(g => new
            {
                TotalViews = g.Sum(s => s.Visualizacoes),
                TotalCliques = g.Sum(s => s.Cliques),
                Buscas24h = g.Where(s => s.DataRegistro >= limite24h).Sum(s => s.Visualizacoes + s.Cliques)
            })
            .FirstOrDefaultAsync(cancellationToken);

        var totalVisualizacoes = resumoStats?.TotalViews ?? 0;
        var totalCliques = resumoStats?.TotalCliques ?? 0;
        var buscas24h = resumoStats?.Buscas24h ?? 0;
        if (buscas24h == 0)
        {
            buscas24h = totalVisualizacoes + totalCliques;
        }

        var totalAvaliacoes = lojaInfo.TotalAvaliacoes;
        var mediaAvaliacao = Math.Round(lojaInfo.MediaAvaliacao, 1);

        // Itens críticos (projeção direta)
        var criticosRaw = await _context.EstoqueLojas
            .AsNoTracking()
            .Where(e => e.LojaId == lojaId && e.QuantidadeEstoque <= e.AlertaEstoqueMinimo)
            .OrderBy(e => e.QuantidadeEstoque)
            .Select(e => new
            {
                e.Id,
                e.LojaId,
                e.PecaId,
                NomePeca = e.Peca != null ? e.Peca.Nome : string.Empty,
                CategoriaPeca = e.Peca != null ? e.Peca.Categoria : string.Empty,
                Sku = e.Peca != null ? e.Peca.Sku : null,
                e.QuantidadeEstoque,
                e.AlertaEstoqueMinimo,
                e.PrecoVenda,
                e.EmPromocao,
                e.PrecoPromocional,
                e.DataInicioPromocao,
                e.DataFimPromocao,
                e.DataAtualizacao
            })
            .ToListAsync(cancellationToken);

        var criticos = criticosRaw.Select(e =>
        {
            var promoAtiva = e.EmPromocao && e.PrecoPromocional.HasValue &&
                (!e.DataInicioPromocao.HasValue || e.DataInicioPromocao.Value <= hoje) &&
                (!e.DataFimPromocao.HasValue || e.DataFimPromocao.Value >= hoje);
            return new EstoqueItemResponse
            {
                Id = e.Id,
                LojaId = e.LojaId,
                NomeLoja = lojaInfo.NomeFantasia,
                PecaId = e.PecaId,
                NomePeca = e.NomePeca,
                CategoriaPeca = e.CategoriaPeca,
                Sku = e.Sku,
                QuantidadeEstoque = e.QuantidadeEstoque,
                AlertaEstoqueMinimo = e.AlertaEstoqueMinimo,
                PrecoVenda = e.PrecoVenda,
                EmPromocao = e.EmPromocao,
                PrecoPromocional = e.PrecoPromocional,
                PrecoEfetivo = promoAtiva ? e.PrecoPromocional!.Value : e.PrecoVenda,
                PromocaoAtiva = promoAtiva,
                DataAtualizacao = e.DataAtualizacao
            };
        }).ToList();

        // Top 5 ofertas mais acessadas da loja (agregação e Take(5) no banco)
        var maisAcessadas = await _context.EstoqueLojas
            .AsNoTracking()
            .Where(e => e.LojaId == lojaId)
            .Select(e => new
            {
                EstoqueId = e.Id,
                NomePeca = e.Peca != null ? e.Peca.Nome : string.Empty,
                Preco = (e.EmPromocao && e.PrecoPromocional.HasValue &&
                         (!e.DataInicioPromocao.HasValue || e.DataInicioPromocao.Value <= hoje) &&
                         (!e.DataFimPromocao.HasValue || e.DataFimPromocao.Value >= hoje))
                    ? e.PrecoPromocional!.Value
                    : e.PrecoVenda,
                Visualizacoes = e.Estatisticas.Sum(s => (int?)s.Visualizacoes) ?? 0,
                Cliques = e.Estatisticas.Sum(s => (int?)s.Cliques) ?? 0
            })
            .OrderByDescending(o => o.Cliques + o.Visualizacoes)
            .Take(5)
            .Select(o => new OfertaMaisAcessadaItem
            {
                EstoqueId = o.EstoqueId,
                NomePeca = o.NomePeca,
                Preco = o.Preco,
                Visualizacoes = o.Visualizacoes,
                Cliques = o.Cliques
            })
            .ToListAsync(cancellationToken);

        // Top 12 peças mais procuradas no Radar (ranking e Take(12) no banco)
        var topPecas = await _context.Pecas
            .AsNoTracking()
            .Select(p => new
            {
                p.Id,
                p.Nome,
                p.Categoria,
                ViewsGlobais = p.Estoques.SelectMany(e => e.Estatisticas).Sum(s => (int?)s.Visualizacoes) ?? 0,
                CliquesGlobais = p.Estoques.SelectMany(e => e.Estatisticas).Sum(s => (int?)s.Cliques) ?? 0
            })
            .OrderByDescending(x => x.ViewsGlobais + x.CliquesGlobais)
            .ThenBy(x => x.Nome)
            .Take(12)
            .ToListAsync(cancellationToken);

        var topPecaIds = topPecas.Select(p => p.Id).ToList();

        var compsPorPeca = topPecaIds.Count == 0
            ? new Dictionary<int, List<string>>()
            : (await _context.CompatibilidadesPecaMoto
                .AsNoTracking()
                .Where(c => topPecaIds.Contains(c.PecaId) && c.ModeloMoto != null)
                .Select(c => new
                {
                    c.PecaId,
                    Label = c.ModeloMoto!.Marca + " " + c.ModeloMoto.Modelo + " (" + c.ModeloMoto.AnoInicio + "-" + (c.ModeloMoto.AnoFim ?? 2025) + ")"
                })
                .ToListAsync(cancellationToken))
                .GroupBy(x => x.PecaId)
                .ToDictionary(g => g.Key, g => g.Select(x => x.Label).Distinct().ToList());

        var estoqueLojaPorPeca = topPecaIds.Count == 0
            ? new Dictionary<int, (Guid Id, int QuantidadeEstoque, decimal PrecoEfetivo)>()
            : (await _context.EstoqueLojas
                .AsNoTracking()
                .Where(e => e.LojaId == lojaId && topPecaIds.Contains(e.PecaId))
                .Select(e => new
                {
                    e.PecaId,
                    e.Id,
                    e.QuantidadeEstoque,
                    e.PrecoVenda,
                    e.EmPromocao,
                    e.PrecoPromocional,
                    e.DataInicioPromocao,
                    e.DataFimPromocao
                })
                .ToListAsync(cancellationToken))
                .GroupBy(e => e.PecaId)
                .ToDictionary(g => g.Key, g =>
                {
                    var first = g.First();
                    var promoAtiva = first.EmPromocao && first.PrecoPromocional.HasValue &&
                        (!first.DataInicioPromocao.HasValue || first.DataInicioPromocao.Value <= hoje) &&
                        (!first.DataFimPromocao.HasValue || first.DataFimPromocao.Value >= hoje);
                    return (Id: first.Id, QuantidadeEstoque: first.QuantidadeEstoque, PrecoEfetivo: promoAtiva ? first.PrecoPromocional!.Value : first.PrecoVenda);
                });

        var maisProcuradosRegiao = topPecas.Select(p =>
        {
            var interacoesReais = p.ViewsGlobais + p.CliquesGlobais;
            compsPorPeca.TryGetValue(p.Id, out var comps);
            var temEstoque = estoqueLojaPorPeca.TryGetValue(p.Id, out var estLoja);
            var crescimento = p.ViewsGlobais > 0
                ? Math.Min(100, (int)Math.Round((double)p.CliquesGlobais / p.ViewsGlobais * 100))
                : 0;

            return new ItemMaisProcuradoRegiao
            {
                PecaId = p.Id,
                NomePeca = p.Nome,
                Categoria = p.Categoria,
                CompatibilidadeResumo = comps != null && comps.Count > 0 ? string.Join(", ", comps) : "Universal",
                TotalBuscas7d = interacoesReais,
                CrescimentoPercentual = crescimento,
                QuantidadeEstoqueLoja = temEstoque ? estLoja.QuantidadeEstoque : 0,
                EstoqueIdLoja = temEstoque ? estLoja.Id : null,
                PrecoVendaLoja = temEstoque ? estLoja.PrecoEfetivo : null
            };
        }).ToList();

        var dashboard = new DashboardLojistaResponse
        {
            LojaId = lojaInfo.Id,
            NomeLoja = lojaInfo.NomeFantasia,
            TotalProdutosCadastrados = totalProdutos,
            TotalItensEstoqueBaixo = totalEstoqueBaixo,
            TotalOfertasAtivas = totalOfertasAtivas,
            BuscasRadar24h = buscas24h,
            TotalVisualizacoesOfertas = totalVisualizacoes,
            TotalCliquesOfertas = totalCliques,
            MediaAvaliacaoLoja = mediaAvaliacao,
            TotalAvaliacoes = totalAvaliacoes,
            ItensEstoqueCritico = criticos,
            OfertasMaisAcessadas = maisAcessadas,
            MaisProcuradosRegiao = maisProcuradosRegiao
        };

        return ApiResponse<DashboardLojistaResponse>.Ok(dashboard);
    }
}
