using Microsoft.EntityFrameworkCore;
using RadarPecas.Application.DTOs.Common;
using RadarPecas.Application.DTOs.Garagem;
using RadarPecas.Application.Interfaces;
using RadarPecas.Domain.Entities;

namespace RadarPecas.Application.Services;

public class GaragemService : IGaragemService
{
    private readonly IApplicationDbContext _context;

    public GaragemService(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<ApiResponse<List<GaragemItemResponse>>> GetMotosDoUsuarioAsync(Guid usuarioId, CancellationToken cancellationToken = default)
    {
        var motos = await _context.GaragemVirtual
            .AsNoTracking()
            .Include(g => g.ModeloMoto)
            .Where(g => g.UsuarioId == usuarioId)
            .OrderByDescending(g => g.AnoFabricacao)
            .Select(g => new GaragemItemResponse
            {
                Id = g.Id,
                UsuarioId = g.UsuarioId,
                ModeloMotoId = g.ModeloMotoId,
                Marca = g.ModeloMoto != null ? g.ModeloMoto.Marca : string.Empty,
                Modelo = g.ModeloMoto != null ? g.ModeloMoto.Modelo : string.Empty,
                AnoInicio = g.ModeloMoto != null ? g.ModeloMoto.AnoInicio : null,
                AnoFim = g.ModeloMoto != null ? g.ModeloMoto.AnoFim : null,
                AnoFabricacao = g.AnoFabricacao,
                Apelido = g.Apelido,
                FotoMotoUrl = g.FotoMotoUrl
            })
            .ToListAsync(cancellationToken);

        return ApiResponse<List<GaragemItemResponse>>.Ok(motos);
    }

    public async Task<ApiResponse<GaragemItemResponse>> GetMotoPorIdAsync(Guid usuarioId, Guid garagemId, CancellationToken cancellationToken = default)
    {
        var g = await _context.GaragemVirtual
            .AsNoTracking()
            .Include(g => g.ModeloMoto)
            .FirstOrDefaultAsync(g => g.Id == garagemId && g.UsuarioId == usuarioId, cancellationToken);

        if (g == null)
        {
            return ApiResponse<GaragemItemResponse>.Fail("Motocicleta não encontrada na sua garagem.");
        }

        var response = new GaragemItemResponse
        {
            Id = g.Id,
            UsuarioId = g.UsuarioId,
            ModeloMotoId = g.ModeloMotoId,
            Marca = g.ModeloMoto != null ? g.ModeloMoto.Marca : string.Empty,
            Modelo = g.ModeloMoto != null ? g.ModeloMoto.Modelo : string.Empty,
            AnoInicio = g.ModeloMoto != null ? g.ModeloMoto.AnoInicio : null,
            AnoFim = g.ModeloMoto != null ? g.ModeloMoto.AnoFim : null,
            AnoFabricacao = g.AnoFabricacao,
            Apelido = g.Apelido,
            FotoMotoUrl = g.FotoMotoUrl
        };

        return ApiResponse<GaragemItemResponse>.Ok(response);
    }

    public async Task<ApiResponse<GaragemItemResponse>> AdicionarMotoAsync(Guid usuarioId, AddGaragemMotoRequest request, CancellationToken cancellationToken = default)
    {
        var modelo = await _context.ModelosMoto.FirstOrDefaultAsync(m => m.Id == request.ModeloMotoId, cancellationToken);
        if (modelo == null)
        {
            return ApiResponse<GaragemItemResponse>.Fail("Modelo de motocicleta selecionado não existe.");
        }

        var anoAtual = DateTime.UtcNow.Year + 1;
        if (request.AnoFabricacao < 1950 || request.AnoFabricacao > anoAtual)
        {
            return ApiResponse<GaragemItemResponse>.Fail($"Ano de fabricação deve estar entre 1950 e {anoAtual}.");
        }

        if (modelo.AnoInicio.HasValue && request.AnoFabricacao < modelo.AnoInicio.Value)
        {
            return ApiResponse<GaragemItemResponse>.Fail($"O modelo {modelo.Modelo} começou a ser fabricado a partir de {modelo.AnoInicio.Value}.");
        }

        if (modelo.AnoFim.HasValue && request.AnoFabricacao > modelo.AnoFim.Value)
        {
            return ApiResponse<GaragemItemResponse>.Fail($"O modelo {modelo.Modelo} foi fabricado até {modelo.AnoFim.Value}.");
        }

        var garagemItem = new GaragemVirtual
        {
            UsuarioId = usuarioId,
            ModeloMotoId = request.ModeloMotoId,
            AnoFabricacao = request.AnoFabricacao,
            Apelido = request.Apelido?.Trim(),
            FotoMotoUrl = request.FotoMotoUrl
        };

        await _context.GaragemVirtual.AddAsync(garagemItem, cancellationToken);
        await _context.SaveChangesAsync(cancellationToken);

        var response = new GaragemItemResponse
        {
            Id = garagemItem.Id,
            UsuarioId = garagemItem.UsuarioId,
            ModeloMotoId = modelo.Id,
            Marca = modelo.Marca,
            Modelo = modelo.Modelo,
            AnoInicio = modelo.AnoInicio,
            AnoFim = modelo.AnoFim,
            AnoFabricacao = garagemItem.AnoFabricacao,
            Apelido = garagemItem.Apelido,
            FotoMotoUrl = garagemItem.FotoMotoUrl
        };

        return ApiResponse<GaragemItemResponse>.Ok(response, "Motocicleta adicionada à sua Garagem Virtual.");
    }

    public async Task<ApiResponse<GaragemItemResponse>> AtualizarMotoAsync(Guid usuarioId, Guid garagemId, UpdateGaragemMotoRequest request, CancellationToken cancellationToken = default)
    {
        var item = await _context.GaragemVirtual
            .Include(g => g.ModeloMoto)
            .FirstOrDefaultAsync(g => g.Id == garagemId && g.UsuarioId == usuarioId, cancellationToken);

        if (item == null)
        {
            return ApiResponse<GaragemItemResponse>.Fail("Motocicleta não encontrada na sua garagem.");
        }

        var anoAtual = DateTime.UtcNow.Year + 1;
        if (request.AnoFabricacao < 1950 || request.AnoFabricacao > anoAtual)
        {
            return ApiResponse<GaragemItemResponse>.Fail($"Ano de fabricação deve estar entre 1950 e {anoAtual}.");
        }

        if (item.ModeloMoto != null)
        {
            if (item.ModeloMoto.AnoInicio.HasValue && request.AnoFabricacao < item.ModeloMoto.AnoInicio.Value)
            {
                return ApiResponse<GaragemItemResponse>.Fail($"O modelo {item.ModeloMoto.Modelo} começou a ser fabricado a partir de {item.ModeloMoto.AnoInicio.Value}.");
            }

            if (item.ModeloMoto.AnoFim.HasValue && request.AnoFabricacao > item.ModeloMoto.AnoFim.Value)
            {
                return ApiResponse<GaragemItemResponse>.Fail($"O modelo {item.ModeloMoto.Modelo} foi fabricado até {item.ModeloMoto.AnoFim.Value}.");
            }
        }

        item.AnoFabricacao = request.AnoFabricacao;
        item.Apelido = request.Apelido?.Trim();
        item.FotoMotoUrl = request.FotoMotoUrl;

        await _context.SaveChangesAsync(cancellationToken);

        var response = new GaragemItemResponse
        {
            Id = item.Id,
            UsuarioId = item.UsuarioId,
            ModeloMotoId = item.ModeloMotoId,
            Marca = item.ModeloMoto?.Marca ?? string.Empty,
            Modelo = item.ModeloMoto?.Modelo ?? string.Empty,
            AnoInicio = item.ModeloMoto?.AnoInicio,
            AnoFim = item.ModeloMoto?.AnoFim,
            AnoFabricacao = item.AnoFabricacao,
            Apelido = item.Apelido,
            FotoMotoUrl = item.FotoMotoUrl
        };

        return ApiResponse<GaragemItemResponse>.Ok(response, "Motocicleta atualizada com sucesso.");
    }

    public async Task<ApiResponse<bool>> RemoverMotoAsync(Guid usuarioId, Guid garagemId, CancellationToken cancellationToken = default)
    {
        var item = await _context.GaragemVirtual
            .FirstOrDefaultAsync(g => g.Id == garagemId && g.UsuarioId == usuarioId, cancellationToken);

        if (item == null)
        {
            return ApiResponse<bool>.Fail("Motocicleta não encontrada na sua garagem.");
        }

        _context.GaragemVirtual.Remove(item);
        await _context.SaveChangesAsync(cancellationToken);

        return ApiResponse<bool>.Ok(true, "Motocicleta removida da Garagem Virtual.");
    }
}
