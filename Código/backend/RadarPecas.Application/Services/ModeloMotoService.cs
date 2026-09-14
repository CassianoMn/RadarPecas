using Microsoft.EntityFrameworkCore;
using RadarPecas.Application.DTOs.Common;
using RadarPecas.Application.DTOs.Garagem;
using RadarPecas.Application.Interfaces;
using RadarPecas.Domain.Entities;

namespace RadarPecas.Application.Services;

public class ModeloMotoService : IModeloMotoService
{
    private readonly IApplicationDbContext _context;

    public ModeloMotoService(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<ApiResponse<List<ModeloMotoResponse>>> ListarModelosAsync(string? marca = null, string? busca = null, CancellationToken cancellationToken = default)
    {
        var query = _context.ModelosMoto.AsNoTracking().AsQueryable();

        if (!string.IsNullOrWhiteSpace(marca))
        {
            query = query.Where(m => m.Marca.ToLower() == marca.Trim().ToLower());
        }

        if (!string.IsNullOrWhiteSpace(busca))
        {
            var termo = busca.Trim().ToLower();
            query = query.Where(m => m.Modelo.ToLower().Contains(termo) || m.Marca.ToLower().Contains(termo));
        }

        var modelos = await query
            .OrderBy(m => m.Marca)
            .ThenBy(m => m.Modelo)
            .Select(m => new ModeloMotoResponse
            {
                Id = m.Id,
                Marca = m.Marca,
                Modelo = m.Modelo,
                AnoInicio = m.AnoInicio,
                AnoFim = m.AnoFim
            })
            .ToListAsync(cancellationToken);

        return ApiResponse<List<ModeloMotoResponse>>.Ok(modelos);
    }

    public async Task<ApiResponse<ModeloMotoResponse>> ObterPorIdAsync(int id, CancellationToken cancellationToken = default)
    {
        var m = await _context.ModelosMoto.AsNoTracking().FirstOrDefaultAsync(x => x.Id == id, cancellationToken);
        if (m == null)
        {
            return ApiResponse<ModeloMotoResponse>.Fail("Modelo de motocicleta não encontrado.");
        }

        var response = new ModeloMotoResponse
        {
            Id = m.Id,
            Marca = m.Marca,
            Modelo = m.Modelo,
            AnoInicio = m.AnoInicio,
            AnoFim = m.AnoFim
        };

        return ApiResponse<ModeloMotoResponse>.Ok(response);
    }

    public async Task<ApiResponse<ModeloMotoResponse>> CriarModeloAsync(CreateModeloMotoRequest request, CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(request.Marca) || string.IsNullOrWhiteSpace(request.Modelo))
        {
            return ApiResponse<ModeloMotoResponse>.Fail("Marca e Modelo são obrigatórios.");
        }

        if (request.AnoInicio.HasValue && request.AnoFim.HasValue && request.AnoInicio > request.AnoFim)
        {
            return ApiResponse<ModeloMotoResponse>.Fail("O ano de início não pode ser maior que o ano final.");
        }

        var modelo = new ModeloMoto
        {
            Marca = request.Marca.Trim(),
            Modelo = request.Modelo.Trim(),
            AnoInicio = request.AnoInicio,
            AnoFim = request.AnoFim
        };

        await _context.ModelosMoto.AddAsync(modelo, cancellationToken);
        await _context.SaveChangesAsync(cancellationToken);

        var response = new ModeloMotoResponse
        {
            Id = modelo.Id,
            Marca = modelo.Marca,
            Modelo = modelo.Modelo,
            AnoInicio = modelo.AnoInicio,
            AnoFim = modelo.AnoFim
        };

        return ApiResponse<ModeloMotoResponse>.Ok(response, "Modelo de motocicleta cadastrado com sucesso.");
    }

    public async Task<ApiResponse<List<string>>> ListarMarcasAsync(CancellationToken cancellationToken = default)
    {
        var marcas = await _context.ModelosMoto
            .AsNoTracking()
            .Select(m => m.Marca)
            .Distinct()
            .OrderBy(m => m)
            .ToListAsync(cancellationToken);

        return ApiResponse<List<string>>.Ok(marcas);
    }
}
