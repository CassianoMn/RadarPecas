using Microsoft.EntityFrameworkCore;
using RadarPecas.Application.DTOs.Common;
using RadarPecas.Application.DTOs.Garagem;
using RadarPecas.Application.DTOs.Pecas;
using RadarPecas.Application.Interfaces;
using RadarPecas.Domain.Entities;

namespace RadarPecas.Application.Services;

public class PecaService : IPecaService
{
    private readonly IApplicationDbContext _context;

    public PecaService(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<ApiResponse<PagedResult<PecaResponse>>> ListarPecasAsync(string? termo = null, string? categoria = null, int? modeloMotoId = null, int page = 1, int pageSize = 10, CancellationToken cancellationToken = default)
    {
        if (page < 1) page = 1;
        if (pageSize < 1) pageSize = 10;
        if (pageSize > 100) pageSize = 100;

        var query = _context.Pecas.AsNoTracking().AsQueryable();

        if (!string.IsNullOrWhiteSpace(termo))
        {
            var t = termo.Trim().ToLower();
            query = query.Where(p =>
                p.Nome.ToLower().Contains(t) ||
                (p.Descricao != null && p.Descricao.ToLower().Contains(t)) ||
                (p.Sku != null && p.Sku.ToLower().Contains(t)) ||
                (p.CodigoEan != null && p.CodigoEan.Contains(t)));
        }

        if (!string.IsNullOrWhiteSpace(categoria))
        {
            query = query.Where(p => p.Categoria.ToLower() == categoria.Trim().ToLower());
        }

        if (modeloMotoId.HasValue)
        {
            query = query.Where(p => p.Compatibilidades.Any(c => c.ModeloMotoId == modeloMotoId.Value));
        }

        var totalCount = await query.CountAsync(cancellationToken);

        var items = await query
            .OrderBy(p => p.Nome)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(p => new PecaResponse
            {
                Id = p.Id,
                Sku = p.Sku,
                CodigoEan = p.CodigoEan,
                Nome = p.Nome,
                Descricao = p.Descricao,
                Categoria = p.Categoria,
                FotoPecaUrl = p.FotoPecaUrl,
                Especificacoes = p.Especificacoes
            })
            .ToListAsync(cancellationToken);

        var paged = new PagedResult<PecaResponse>(items, totalCount, page, pageSize);
        return ApiResponse<PagedResult<PecaResponse>>.Ok(paged);
    }

    public async Task<ApiResponse<PecaDetalheResponse>> ObterPorIdAsync(int id, CancellationToken cancellationToken = default)
    {
        var peca = await _context.Pecas
            .AsNoTracking()
            .Include(p => p.Compatibilidades)
                .ThenInclude(c => c.ModeloMoto)
            .FirstOrDefaultAsync(p => p.Id == id, cancellationToken);

        if (peca == null)
        {
            return ApiResponse<PecaDetalheResponse>.Fail("Peça não encontrada.");
        }

        var response = new PecaDetalheResponse
        {
            Id = peca.Id,
            Sku = peca.Sku,
            CodigoEan = peca.CodigoEan,
            Nome = peca.Nome,
            Descricao = peca.Descricao,
            Categoria = peca.Categoria,
            FotoPecaUrl = peca.FotoPecaUrl,
            Especificacoes = peca.Especificacoes,
            Compatibilidades = peca.Compatibilidades
                .Where(c => c.ModeloMoto != null)
                .Select(c => new ModeloMotoResponse
                {
                    Id = c.ModeloMoto!.Id,
                    Marca = c.ModeloMoto.Marca,
                    Modelo = c.ModeloMoto.Modelo,
                    AnoInicio = c.ModeloMoto.AnoInicio,
                    AnoFim = c.ModeloMoto.AnoFim
                })
                .ToList()
        };

        return ApiResponse<PecaDetalheResponse>.Ok(response);
    }

    public async Task<ApiResponse<PecaResponse>> CriarPecaAsync(CreatePecaRequest request, CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(request.Nome) || string.IsNullOrWhiteSpace(request.Categoria))
        {
            return ApiResponse<PecaResponse>.Fail("Nome e categoria da peça são obrigatórios.");
        }

        if (!string.IsNullOrWhiteSpace(request.Sku))
        {
            var skuExiste = await _context.Pecas.AnyAsync(p => p.Sku == request.Sku.Trim(), cancellationToken);
            if (skuExiste)
            {
                return ApiResponse<PecaResponse>.Fail("Já existe uma peça cadastrada com este SKU.");
            }
        }

        if (!string.IsNullOrWhiteSpace(request.CodigoEan))
        {
            var eanExiste = await _context.Pecas.AnyAsync(p => p.CodigoEan == request.CodigoEan.Trim(), cancellationToken);
            if (eanExiste)
            {
                return ApiResponse<PecaResponse>.Fail("Já existe uma peça cadastrada com este Código EAN.");
            }
        }

        var peca = new Peca
        {
            Nome = request.Nome.Trim(),
            Descricao = request.Descricao?.Trim(),
            Categoria = request.Categoria.Trim(),
            Sku = request.Sku?.Trim(),
            CodigoEan = request.CodigoEan?.Trim(),
            FotoPecaUrl = request.FotoPecaUrl,
            Especificacoes = request.Especificacoes
        };

        await _context.Pecas.AddAsync(peca, cancellationToken);
        await _context.SaveChangesAsync(cancellationToken);

        if (request.ModelosMotoIds != null && request.ModelosMotoIds.Any())
        {
            var comps = request.ModelosMotoIds.Distinct().Select(mId => new CompatibilidadePecaMoto
            {
                PecaId = peca.Id,
                ModeloMotoId = mId
            });

            await _context.CompatibilidadesPecaMoto.AddRangeAsync(comps, cancellationToken);
            await _context.SaveChangesAsync(cancellationToken);
        }

        var response = new PecaResponse
        {
            Id = peca.Id,
            Sku = peca.Sku,
            CodigoEan = peca.CodigoEan,
            Nome = peca.Nome,
            Descricao = peca.Descricao,
            Categoria = peca.Categoria,
            FotoPecaUrl = peca.FotoPecaUrl,
            Especificacoes = peca.Especificacoes
        };

        return ApiResponse<PecaResponse>.Ok(response, "Peça cadastrada com sucesso no catálogo.");
    }

    public async Task<ApiResponse<PecaResponse>> AtualizarPecaAsync(int id, UpdatePecaRequest request, CancellationToken cancellationToken = default)
    {
        var peca = await _context.Pecas.FirstOrDefaultAsync(p => p.Id == id, cancellationToken);
        if (peca == null)
        {
            return ApiResponse<PecaResponse>.Fail("Peça não encontrada.");
        }

        if (string.IsNullOrWhiteSpace(request.Nome) || string.IsNullOrWhiteSpace(request.Categoria))
        {
            return ApiResponse<PecaResponse>.Fail("Nome e categoria são obrigatórios.");
        }

        if (!string.IsNullOrWhiteSpace(request.Sku) && request.Sku != peca.Sku)
        {
            var skuExiste = await _context.Pecas.AnyAsync(p => p.Sku == request.Sku.Trim() && p.Id != id, cancellationToken);
            if (skuExiste)
            {
                return ApiResponse<PecaResponse>.Fail("Já existe uma outra peça cadastrada com este SKU.");
            }
        }

        if (!string.IsNullOrWhiteSpace(request.CodigoEan) && request.CodigoEan != peca.CodigoEan)
        {
            var eanExiste = await _context.Pecas.AnyAsync(p => p.CodigoEan == request.CodigoEan.Trim() && p.Id != id, cancellationToken);
            if (eanExiste)
            {
                return ApiResponse<PecaResponse>.Fail("Já existe uma outra peça cadastrada com este Código EAN.");
            }
        }

        peca.Nome = request.Nome.Trim();
        peca.Descricao = request.Descricao?.Trim();
        peca.Categoria = request.Categoria.Trim();
        peca.Sku = request.Sku?.Trim();
        peca.CodigoEan = request.CodigoEan?.Trim();
        peca.FotoPecaUrl = request.FotoPecaUrl;
        peca.Especificacoes = request.Especificacoes;

        await _context.SaveChangesAsync(cancellationToken);

        var response = new PecaResponse
        {
            Id = peca.Id,
            Sku = peca.Sku,
            CodigoEan = peca.CodigoEan,
            Nome = peca.Nome,
            Descricao = peca.Descricao,
            Categoria = peca.Categoria,
            FotoPecaUrl = peca.FotoPecaUrl,
            Especificacoes = peca.Especificacoes
        };

        return ApiResponse<PecaResponse>.Ok(response, "Peça atualizada com sucesso.");
    }

    public async Task<ApiResponse<bool>> DeletarPecaAsync(int id, CancellationToken cancellationToken = default)
    {
        var peca = await _context.Pecas.FirstOrDefaultAsync(p => p.Id == id, cancellationToken);
        if (peca == null)
        {
            return ApiResponse<bool>.Fail("Peça não encontrada.");
        }

        var temEstoque = await _context.EstoqueLojas.AnyAsync(e => e.PecaId == id, cancellationToken);
        if (temEstoque)
        {
            return ApiResponse<bool>.Fail("Não é possível excluir esta peça pois existem ofertas/estoques vinculados a ela.");
        }

        _context.Pecas.Remove(peca);
        await _context.SaveChangesAsync(cancellationToken);

        return ApiResponse<bool>.Ok(true, "Peça removida com sucesso do catálogo.");
    }

    public async Task<ApiResponse<List<string>>> ListarCategoriasAsync(CancellationToken cancellationToken = default)
    {
        var categorias = await _context.Pecas
            .AsNoTracking()
            .Select(p => p.Categoria)
            .Distinct()
            .OrderBy(c => c)
            .ToListAsync(cancellationToken);

        return ApiResponse<List<string>>.Ok(categorias);
    }

    public async Task<ApiResponse<bool>> AdicionarCompatibilidadeAsync(int pecaId, int modeloMotoId, CancellationToken cancellationToken = default)
    {
        var pecaExiste = await _context.Pecas.AnyAsync(p => p.Id == pecaId, cancellationToken);
        if (!pecaExiste)
        {
            return ApiResponse<bool>.Fail("Peça não encontrada.");
        }

        var modeloExiste = await _context.ModelosMoto.AnyAsync(m => m.Id == modeloMotoId, cancellationToken);
        if (!modeloExiste)
        {
            return ApiResponse<bool>.Fail("Modelo de moto não encontrado.");
        }

        var jaCompativel = await _context.CompatibilidadesPecaMoto
            .AnyAsync(c => c.PecaId == pecaId && c.ModeloMotoId == modeloMotoId, cancellationToken);

        if (jaCompativel)
        {
            return ApiResponse<bool>.Fail("Esta compatibilidade já está cadastrada.");
        }

        var comp = new CompatibilidadePecaMoto
        {
            PecaId = pecaId,
            ModeloMotoId = modeloMotoId
        };

        await _context.CompatibilidadesPecaMoto.AddAsync(comp, cancellationToken);
        await _context.SaveChangesAsync(cancellationToken);

        return ApiResponse<bool>.Ok(true, "Compatibilidade adicionada com sucesso.");
    }

    public async Task<ApiResponse<bool>> RemoverCompatibilidadeAsync(int pecaId, int modeloMotoId, CancellationToken cancellationToken = default)
    {
        var comp = await _context.CompatibilidadesPecaMoto
            .FirstOrDefaultAsync(c => c.PecaId == pecaId && c.ModeloMotoId == modeloMotoId, cancellationToken);

        if (comp == null)
        {
            return ApiResponse<bool>.Fail("Compatibilidade não encontrada.");
        }

        _context.CompatibilidadesPecaMoto.Remove(comp);
        await _context.SaveChangesAsync(cancellationToken);

        return ApiResponse<bool>.Ok(true, "Compatibilidade removida com sucesso.");
    }
}
