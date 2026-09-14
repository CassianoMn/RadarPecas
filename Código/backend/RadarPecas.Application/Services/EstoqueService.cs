using Microsoft.EntityFrameworkCore;
using RadarPecas.Application.DTOs.Common;
using RadarPecas.Application.DTOs.Estoque;
using RadarPecas.Application.DTOs.Garagem;
using RadarPecas.Application.DTOs.Lojas;
using RadarPecas.Application.DTOs.Pecas;
using RadarPecas.Application.Interfaces;
using RadarPecas.Domain.Entities;

namespace RadarPecas.Application.Services;

public class EstoqueService : IEstoqueService
{
    private readonly IApplicationDbContext _context;
    private readonly IGeolocationService _geolocationService;

    public EstoqueService(IApplicationDbContext context, IGeolocationService geolocationService)
    {
        _context = context;
        _geolocationService = geolocationService;
    }

    public async Task<ApiResponse<PagedResult<EstoqueItemResponse>>> ListarEstoqueLojaAsync(Guid lojaId, string? busca = null, bool? apenasPromocao = null, int page = 1, int pageSize = 10, CancellationToken cancellationToken = default)
    {
        if (page < 1) page = 1;
        if (pageSize < 1) pageSize = 10;
        if (pageSize > 100) pageSize = 100;

        var query = _context.EstoqueLojas
            .AsNoTracking()
            .Include(e => e.Peca)
            .Include(e => e.Loja)
            .Where(e => e.LojaId == lojaId);

        if (!string.IsNullOrWhiteSpace(busca))
        {
            var b = busca.Trim().ToLower();
            query = query.Where(e =>
                e.Peca != null && (
                    e.Peca.Nome.ToLower().Contains(b) ||
                    e.Peca.Categoria.ToLower().Contains(b) ||
                    (e.Peca.Sku != null && e.Peca.Sku.ToLower().Contains(b)) ||
                    (e.Peca.CodigoEan != null && e.Peca.CodigoEan.Contains(b))
                ));
        }

        if (apenasPromocao.HasValue && apenasPromocao.Value)
        {
            var hoje = DateOnly.FromDateTime(DateTime.UtcNow);
            query = query.Where(e => e.EmPromocao &&
                (!e.DataInicioPromocao.HasValue || e.DataInicioPromocao.Value <= hoje) &&
                (!e.DataFimPromocao.HasValue || e.DataFimPromocao.Value >= hoje));
        }

        var totalCount = await query.CountAsync(cancellationToken);

        var estoques = await query
            .OrderBy(e => e.Peca != null ? e.Peca.Nome : "")
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(cancellationToken);

        var items = estoques.Select(e => new EstoqueItemResponse
        {
            Id = e.Id,
            LojaId = e.LojaId,
            NomeLoja = e.Loja?.NomeFantasia ?? string.Empty,
            PecaId = e.PecaId,
            NomePeca = e.Peca?.Nome ?? string.Empty,
            CategoriaPeca = e.Peca?.Categoria ?? string.Empty,
            FotoPecaUrl = e.Peca?.FotoPecaUrl,
            Sku = e.Peca?.Sku,
            CodigoEan = e.Peca?.CodigoEan,
            QuantidadeEstoque = e.QuantidadeEstoque,
            AlertaEstoqueMinimo = e.AlertaEstoqueMinimo,
            PrecoVenda = e.PrecoVenda,
            EmPromocao = e.EmPromocao,
            PrecoPromocional = e.PrecoPromocional,
            PrecoEfetivo = e.PrecoEfetivo,
            DataInicioPromocao = e.DataInicioPromocao,
            DataFimPromocao = e.DataFimPromocao,
            PromocaoAtiva = e.PromocaoAtiva,
            DataAtualizacao = e.DataAtualizacao
        }).ToList();

        var paged = new PagedResult<EstoqueItemResponse>(items, totalCount, page, pageSize);
        return ApiResponse<PagedResult<EstoqueItemResponse>>.Ok(paged);
    }

    public async Task<ApiResponse<EstoqueItemResponse>> ObterPorIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var e = await _context.EstoqueLojas
            .AsNoTracking()
            .Include(x => x.Peca)
            .Include(x => x.Loja)
            .FirstOrDefaultAsync(x => x.Id == id, cancellationToken);

        if (e == null)
        {
            return ApiResponse<EstoqueItemResponse>.Fail("Oferta/Estoque não encontrado.");
        }

        var response = new EstoqueItemResponse
        {
            Id = e.Id,
            LojaId = e.LojaId,
            NomeLoja = e.Loja?.NomeFantasia ?? string.Empty,
            PecaId = e.PecaId,
            NomePeca = e.Peca?.Nome ?? string.Empty,
            CategoriaPeca = e.Peca?.Categoria ?? string.Empty,
            FotoPecaUrl = e.Peca?.FotoPecaUrl,
            Sku = e.Peca?.Sku,
            CodigoEan = e.Peca?.CodigoEan,
            QuantidadeEstoque = e.QuantidadeEstoque,
            AlertaEstoqueMinimo = e.AlertaEstoqueMinimo,
            PrecoVenda = e.PrecoVenda,
            EmPromocao = e.EmPromocao,
            PrecoPromocional = e.PrecoPromocional,
            PrecoEfetivo = e.PrecoEfetivo,
            DataInicioPromocao = e.DataInicioPromocao,
            DataFimPromocao = e.DataFimPromocao,
            PromocaoAtiva = e.PromocaoAtiva,
            DataAtualizacao = e.DataAtualizacao
        };

        return ApiResponse<EstoqueItemResponse>.Ok(response);
    }

    public async Task<ApiResponse<OfertaDetalheResponse>> ObterDetalhesOfertaAsync(Guid estoqueId, decimal? userLat = null, decimal? userLon = null, CancellationToken cancellationToken = default)
    {
        var e = await _context.EstoqueLojas
            .AsNoTracking()
            .Include(x => x.Peca)
                .ThenInclude(p => p!.Compatibilidades)
                    .ThenInclude(c => c.ModeloMoto)
            .Include(x => x.Loja)
                .ThenInclude(l => l!.Avaliacoes)
            .Include(x => x.Estatisticas)
            .FirstOrDefaultAsync(x => x.Id == estoqueId, cancellationToken);

        if (e == null || e.Peca == null || e.Loja == null)
        {
            return ApiResponse<OfertaDetalheResponse>.Fail("Oferta não encontrada.");
        }

        decimal? distancia = null;
        if (userLat.HasValue && userLon.HasValue)
        {
            distancia = _geolocationService.CalcularDistanciaKm(userLat.Value, userLon.Value, e.Loja.Latitude, e.Loja.Longitude);
        }

        var totalAvaliacoes = e.Loja.Avaliacoes.Count;
        var mediaAvaliacao = totalAvaliacoes > 0 ? Math.Round(e.Loja.Avaliacoes.Average(a => a.Nota), 1) : 5.0;

        var visualizacoes = e.Estatisticas.Sum(s => s.Visualizacoes);
        var cliques = e.Estatisticas.Sum(s => s.Cliques);

        var response = new OfertaDetalheResponse
        {
            EstoqueId = e.Id,
            Peca = new PecaResponse
            {
                Id = e.Peca.Id,
                Sku = e.Peca.Sku,
                CodigoEan = e.Peca.CodigoEan,
                Nome = e.Peca.Nome,
                Descricao = e.Peca.Descricao,
                Categoria = e.Peca.Categoria,
                FotoPecaUrl = e.Peca.FotoPecaUrl,
                Especificacoes = e.Peca.Especificacoes
            },
            Loja = new LojaResponse
            {
                Id = e.Loja.Id,
                UsuarioId = e.Loja.UsuarioId,
                NomeFantasia = e.Loja.NomeFantasia,
                Cnpj = e.Loja.Cnpj,
                EnderecoCompleto = e.Loja.EnderecoCompleto,
                Latitude = e.Loja.Latitude,
                Longitude = e.Loja.Longitude,
                TelefoneContato = e.Loja.TelefoneContato,
                EmailContato = e.Loja.EmailContato,
                HorariosFuncionamento = e.Loja.HorariosFuncionamento,
                FotoPerfilUrl = e.Loja.FotoPerfilUrl,
                GaleriaFotosUrls = e.Loja.GaleriaFotosUrls,
                Ativa = e.Loja.Ativa,
                MediaAvaliacao = mediaAvaliacao,
                TotalAvaliacoes = totalAvaliacoes,
                DistanciaKm = distancia
            },
            Compatibilidades = e.Peca.Compatibilidades
                .Where(c => c.ModeloMoto != null)
                .Select(c => new ModeloMotoResponse
                {
                    Id = c.ModeloMoto!.Id,
                    Marca = c.ModeloMoto.Marca,
                    Modelo = c.ModeloMoto.Modelo,
                    AnoInicio = c.ModeloMoto.AnoInicio,
                    AnoFim = c.ModeloMoto.AnoFim
                })
                .ToList(),
            QuantidadeEstoque = e.QuantidadeEstoque,
            PrecoVenda = e.PrecoVenda,
            EmPromocao = e.EmPromocao,
            PrecoPromocional = e.PrecoPromocional,
            PrecoEfetivo = e.PrecoEfetivo,
            PromocaoAtiva = e.PromocaoAtiva,
            DataInicioPromocao = e.DataInicioPromocao,
            DataFimPromocao = e.DataFimPromocao,
            DistanciaKm = distancia,
            Visualizacoes = visualizacoes,
            Cliques = cliques
        };

        return ApiResponse<OfertaDetalheResponse>.Ok(response);
    }

    public async Task<ApiResponse<EstoqueItemResponse>> AdicionarEstoqueAsync(CreateEstoqueRequest request, CancellationToken cancellationToken = default)
    {
        var lojaExiste = await _context.Lojas.AnyAsync(l => l.Id == request.LojaId, cancellationToken);
        if (!lojaExiste)
        {
            return ApiResponse<EstoqueItemResponse>.Fail("Loja não encontrada.");
        }

        var pecaExiste = await _context.Pecas.AnyAsync(p => p.Id == request.PecaId, cancellationToken);
        if (!pecaExiste)
        {
            return ApiResponse<EstoqueItemResponse>.Fail("Peça não encontrada.");
        }

        var jaCadastrado = await _context.EstoqueLojas.AnyAsync(e => e.LojaId == request.LojaId && e.PecaId == request.PecaId, cancellationToken);
        if (jaCadastrado)
        {
            return ApiResponse<EstoqueItemResponse>.Fail("Esta peça já está cadastrada no estoque desta loja. Atualize a quantidade existente.");
        }

        if (request.PrecoVenda <= 0)
        {
            return ApiResponse<EstoqueItemResponse>.Fail("O preço de venda deve ser maior que zero.");
        }

        if (request.QuantidadeEstoque < 0)
        {
            return ApiResponse<EstoqueItemResponse>.Fail("A quantidade em estoque não pode ser negativa.");
        }

        if (request.EmPromocao)
        {
            if (!request.PrecoPromocional.HasValue || request.PrecoPromocional.Value <= 0)
            {
                return ApiResponse<EstoqueItemResponse>.Fail("Para ofertas em promoção, informe um preço promocional válido.");
            }

            if (request.PrecoPromocional.Value >= request.PrecoVenda)
            {
                return ApiResponse<EstoqueItemResponse>.Fail("O preço promocional deve ser menor que o preço de venda padrão.");
            }

            if (request.DataInicioPromocao.HasValue && request.DataFimPromocao.HasValue && request.DataInicioPromocao > request.DataFimPromocao)
            {
                return ApiResponse<EstoqueItemResponse>.Fail("A data final da promoção não pode ser anterior à data inicial.");
            }
        }

        var estoque = new EstoqueLoja
        {
            LojaId = request.LojaId,
            PecaId = request.PecaId,
            QuantidadeEstoque = request.QuantidadeEstoque,
            AlertaEstoqueMinimo = request.AlertaEstoqueMinimo,
            PrecoVenda = request.PrecoVenda,
            EmPromocao = request.EmPromocao,
            PrecoPromocional = request.PrecoPromocional,
            DataInicioPromocao = request.DataInicioPromocao,
            DataFimPromocao = request.DataFimPromocao,
            DataAtualizacao = DateTime.UtcNow
        };

        await _context.EstoqueLojas.AddAsync(estoque, cancellationToken);
        await _context.SaveChangesAsync(cancellationToken);

        return await ObterPorIdAsync(estoque.Id, cancellationToken);
    }

    public async Task<ApiResponse<EstoqueItemResponse>> AtualizarEstoqueAsync(Guid id, UpdateEstoqueRequest request, CancellationToken cancellationToken = default)
    {
        var estoque = await _context.EstoqueLojas.FirstOrDefaultAsync(e => e.Id == id, cancellationToken);
        if (estoque == null)
        {
            return ApiResponse<EstoqueItemResponse>.Fail("Item de estoque não encontrado.");
        }

        if (request.QuantidadeEstoque < 0)
        {
            return ApiResponse<EstoqueItemResponse>.Fail("A quantidade em estoque não pode ser negativa.");
        }

        if (request.PrecoVenda <= 0)
        {
            return ApiResponse<EstoqueItemResponse>.Fail("O preço de venda deve ser maior que zero.");
        }

        estoque.QuantidadeEstoque = request.QuantidadeEstoque;
        estoque.AlertaEstoqueMinimo = request.AlertaEstoqueMinimo;
        estoque.PrecoVenda = request.PrecoVenda;
        estoque.DataAtualizacao = DateTime.UtcNow;

        await _context.SaveChangesAsync(cancellationToken);

        return await ObterPorIdAsync(estoque.Id, cancellationToken);
    }

    public async Task<ApiResponse<EstoqueItemResponse>> AtualizarPromocaoAsync(Guid id, AtualizarPromocaoRequest request, CancellationToken cancellationToken = default)
    {
        var estoque = await _context.EstoqueLojas.FirstOrDefaultAsync(e => e.Id == id, cancellationToken);
        if (estoque == null)
        {
            return ApiResponse<EstoqueItemResponse>.Fail("Item de estoque não encontrado.");
        }

        if (request.EmPromocao)
        {
            if (!request.PrecoPromocional.HasValue || request.PrecoPromocional.Value <= 0)
            {
                return ApiResponse<EstoqueItemResponse>.Fail("Informe um preço promocional válido.");
            }

            if (request.PrecoPromocional.Value >= estoque.PrecoVenda)
            {
                return ApiResponse<EstoqueItemResponse>.Fail("O preço promocional deve ser menor que o preço de venda atual.");
            }

            if (request.DataInicioPromocao.HasValue && request.DataFimPromocao.HasValue && request.DataInicioPromocao > request.DataFimPromocao)
            {
                return ApiResponse<EstoqueItemResponse>.Fail("A data final da promoção não pode ser anterior à data inicial.");
            }
        }

        estoque.EmPromocao = request.EmPromocao;
        estoque.PrecoPromocional = request.EmPromocao ? request.PrecoPromocional : null;
        estoque.DataInicioPromocao = request.EmPromocao ? request.DataInicioPromocao : null;
        estoque.DataFimPromocao = request.EmPromocao ? request.DataFimPromocao : null;
        estoque.DataAtualizacao = DateTime.UtcNow;

        await _context.SaveChangesAsync(cancellationToken);

        return await ObterPorIdAsync(estoque.Id, cancellationToken);
    }

    public async Task<ApiResponse<bool>> RemoverEstoqueAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var estoque = await _context.EstoqueLojas.FirstOrDefaultAsync(e => e.Id == id, cancellationToken);
        if (estoque == null)
        {
            return ApiResponse<bool>.Fail("Item de estoque não encontrado.");
        }

        _context.EstoqueLojas.Remove(estoque);
        await _context.SaveChangesAsync(cancellationToken);

        return ApiResponse<bool>.Ok(true, "Item removido do estoque com sucesso.");
    }
}
