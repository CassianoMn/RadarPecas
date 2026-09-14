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
        var lojas = await _context.Lojas
            .AsNoTracking()
            .Include(l => l.Avaliacoes)
            .Where(l => l.Ativa)
            .ToListAsync(cancellationToken);

        var result = new List<LojaResponse>();

        foreach (var l in lojas)
        {
            decimal? distancia = null;
            if (userLat.HasValue && userLon.HasValue)
            {
                distancia = _geolocationService.CalcularDistanciaKm(userLat.Value, userLon.Value, l.Latitude, l.Longitude);
                if (raioKm.HasValue && distancia.Value > raioKm.Value)
                {
                    continue;
                }
            }

            var totalAvaliacoes = l.Avaliacoes.Count;
            var mediaAvaliacao = totalAvaliacoes > 0 ? Math.Round(l.Avaliacoes.Average(a => a.Nota), 1) : 5.0;

            result.Add(new LojaResponse
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
                MediaAvaliacao = mediaAvaliacao,
                TotalAvaliacoes = totalAvaliacoes,
                DistanciaKm = distancia
            });
        }

        if (userLat.HasValue && userLon.HasValue)
        {
            result = result.OrderBy(r => r.DistanciaKm ?? decimal.MaxValue).ToList();
        }
        else
        {
            result = result.OrderBy(r => r.NomeFantasia).ToList();
        }

        return ApiResponse<List<LojaResponse>>.Ok(result);
    }

    public async Task<ApiResponse<LojaResponse>> ObterLojaPorIdAsync(Guid id, decimal? userLat = null, decimal? userLon = null, CancellationToken cancellationToken = default)
    {
        var l = await _context.Lojas
            .AsNoTracking()
            .Include(l => l.Avaliacoes)
            .FirstOrDefaultAsync(l => l.Id == id, cancellationToken);

        if (l == null)
        {
            return ApiResponse<LojaResponse>.Fail("Loja não encontrada.");
        }

        decimal? distancia = null;
        if (userLat.HasValue && userLon.HasValue)
        {
            distancia = _geolocationService.CalcularDistanciaKm(userLat.Value, userLon.Value, l.Latitude, l.Longitude);
        }

        var totalAvaliacoes = l.Avaliacoes.Count;
        var mediaAvaliacao = totalAvaliacoes > 0 ? Math.Round(l.Avaliacoes.Average(a => a.Nota), 1) : 5.0;

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
            MediaAvaliacao = mediaAvaliacao,
            TotalAvaliacoes = totalAvaliacoes,
            DistanciaKm = distancia
        };

        return ApiResponse<LojaResponse>.Ok(response);
    }

    public async Task<ApiResponse<LojaResponse>> ObterLojaPorUsuarioIdAsync(Guid usuarioId, CancellationToken cancellationToken = default)
    {
        var l = await _context.Lojas
            .AsNoTracking()
            .Include(l => l.Avaliacoes)
            .FirstOrDefaultAsync(l => l.UsuarioId == usuarioId, cancellationToken);

        if (l == null)
        {
            return ApiResponse<LojaResponse>.Fail("Nenhuma loja vinculada a este usuário.");
        }

        var totalAvaliacoes = l.Avaliacoes.Count;
        var mediaAvaliacao = totalAvaliacoes > 0 ? Math.Round(l.Avaliacoes.Average(a => a.Nota), 1) : 5.0;

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
            MediaAvaliacao = mediaAvaliacao,
            TotalAvaliacoes = totalAvaliacoes
        };

        return ApiResponse<LojaResponse>.Ok(response);
    }

    public async Task<ApiResponse<LojaResponse>> CriarLojaAsync(Guid usuarioId, CreateLojaRequest request, CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(request.NomeFantasia) || string.IsNullOrWhiteSpace(request.EnderecoCompleto))
        {
            return ApiResponse<LojaResponse>.Fail("Nome fantasia e endereço completo são obrigatórios.");
        }

        if (!string.IsNullOrWhiteSpace(request.Cnpj))
        {
            var cnpjExiste = await _context.Lojas.AnyAsync(l => l.Cnpj == request.Cnpj.Trim(), cancellationToken);
            if (cnpjExiste)
            {
                return ApiResponse<LojaResponse>.Fail("Já existe uma loja cadastrada com este CNPJ.");
            }
        }

        decimal lat = request.Latitude ?? 0;
        decimal lon = request.Longitude ?? 0;

        if (lat == 0 && lon == 0)
        {
            var coords = await _geocodingService.GeocodeAddressAsync(request.EnderecoCompleto, cancellationToken);
            if (coords.HasValue)
            {
                lat = coords.Value.Latitude;
                lon = coords.Value.Longitude;
            }
        }

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
            HorariosFuncionamento = request.HorariosFuncionamento,
            FotoPerfilUrl = request.FotoPerfilUrl,
            GaleriaFotosUrls = request.GaleriaFotosUrls,
            Ativa = true
        };

        await _context.Lojas.AddAsync(loja, cancellationToken);
        await _context.SaveChangesAsync(cancellationToken);

        return await ObterLojaPorIdAsync(loja.Id, null, null, cancellationToken);
    }

    public async Task<ApiResponse<LojaResponse>> AtualizarLojaAsync(Guid id, UpdateLojaRequest request, CancellationToken cancellationToken = default)
    {
        var loja = await _context.Lojas.FirstOrDefaultAsync(l => l.Id == id, cancellationToken);
        if (loja == null)
        {
            return ApiResponse<LojaResponse>.Fail("Loja não encontrada.");
        }

        if (string.IsNullOrWhiteSpace(request.NomeFantasia) || string.IsNullOrWhiteSpace(request.EnderecoCompleto))
        {
            return ApiResponse<LojaResponse>.Fail("Nome fantasia e endereço completo são obrigatórios.");
        }

        if (!string.IsNullOrWhiteSpace(request.Cnpj) && request.Cnpj != loja.Cnpj)
        {
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
            if (coords.HasValue)
            {
                loja.Latitude = coords.Value.Latitude;
                loja.Longitude = coords.Value.Longitude;
            }
        }
        else
        {
            if (request.Latitude.HasValue) loja.Latitude = request.Latitude.Value;
            if (request.Longitude.HasValue) loja.Longitude = request.Longitude.Value;
        }

        loja.NomeFantasia = request.NomeFantasia.Trim();
        loja.Cnpj = request.Cnpj?.Trim();
        loja.EnderecoCompleto = request.EnderecoCompleto.Trim();
        loja.TelefoneContato = request.TelefoneContato?.Trim();
        loja.EmailContato = request.EmailContato?.Trim();
        loja.HorariosFuncionamento = request.HorariosFuncionamento;
        loja.FotoPerfilUrl = request.FotoPerfilUrl;
        loja.GaleriaFotosUrls = request.GaleriaFotosUrls;
        if (request.Ativa.HasValue) loja.Ativa = request.Ativa.Value;

        await _context.SaveChangesAsync(cancellationToken);

        return await ObterLojaPorIdAsync(loja.Id, null, null, cancellationToken);
    }

    public async Task<ApiResponse<DashboardLojistaResponse>> ObterDashboardLojistaAsync(Guid lojaId, CancellationToken cancellationToken = default)
    {
        var loja = await _context.Lojas
            .AsNoTracking()
            .Include(l => l.Avaliacoes)
            .Include(l => l.Estoques)
                .ThenInclude(e => e.Peca)
            .Include(l => l.Estoques)
                .ThenInclude(e => e.Estatisticas)
            .FirstOrDefaultAsync(l => l.Id == lojaId, cancellationToken);

        if (loja == null)
        {
            return ApiResponse<DashboardLojistaResponse>.Fail("Loja não encontrada.");
        }

        var totalProdutos = loja.Estoques.Count;
        var totalEstoqueBaixo = loja.Estoques.Count(e => e.QuantidadeEstoque <= e.AlertaEstoqueMinimo);

        var totalVisualizacoes = loja.Estoques.SelectMany(e => e.Estatisticas).Sum(s => s.Visualizacoes);
        var totalCliques = loja.Estoques.SelectMany(e => e.Estatisticas).Sum(s => s.Cliques);

        var totalAvaliacoes = loja.Avaliacoes.Count;
        var mediaAvaliacao = totalAvaliacoes > 0 ? Math.Round(loja.Avaliacoes.Average(a => a.Nota), 1) : 5.0;

        var criticos = loja.Estoques
            .Where(e => e.QuantidadeEstoque <= e.AlertaEstoqueMinimo)
            .Select(e => new EstoqueItemResponse
            {
                Id = e.Id,
                LojaId = e.LojaId,
                NomeLoja = loja.NomeFantasia,
                PecaId = e.PecaId,
                NomePeca = e.Peca?.Nome ?? string.Empty,
                CategoriaPeca = e.Peca?.Categoria ?? string.Empty,
                QuantidadeEstoque = e.QuantidadeEstoque,
                AlertaEstoqueMinimo = e.AlertaEstoqueMinimo,
                PrecoVenda = e.PrecoVenda,
                EmPromocao = e.EmPromocao,
                PrecoPromocional = e.PrecoPromocional,
                PrecoEfetivo = e.PrecoEfetivo,
                PromocaoAtiva = e.PromocaoAtiva,
                DataAtualizacao = e.DataAtualizacao
            })
            .ToList();

        var maisAcessadas = loja.Estoques
            .Select(e => new OfertaMaisAcessadaItem
            {
                EstoqueId = e.Id,
                NomePeca = e.Peca?.Nome ?? string.Empty,
                Preco = e.PrecoEfetivo,
                Visualizacoes = e.Estatisticas.Sum(s => s.Visualizacoes),
                Cliques = e.Estatisticas.Sum(s => s.Cliques)
            })
            .OrderByDescending(o => o.Cliques + o.Visualizacoes)
            .Take(5)
            .ToList();

        var dashboard = new DashboardLojistaResponse
        {
            LojaId = loja.Id,
            NomeLoja = loja.NomeFantasia,
            TotalProdutosCadastrados = totalProdutos,
            TotalItensEstoqueBaixo = totalEstoqueBaixo,
            TotalVisualizacoesOfertas = totalVisualizacoes,
            TotalCliquesOfertas = totalCliques,
            MediaAvaliacaoLoja = mediaAvaliacao,
            TotalAvaliacoes = totalAvaliacoes,
            ItensEstoqueCritico = criticos,
            OfertasMaisAcessadas = maisAcessadas
        };

        return ApiResponse<DashboardLojistaResponse>.Ok(dashboard);
    }
}
