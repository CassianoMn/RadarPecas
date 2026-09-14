using Microsoft.EntityFrameworkCore;
using RadarPecas.Application.Interfaces;

namespace RadarPecas.Application.Services;

public class CompatibilidadeService : ICompatibilidadeService
{
    private readonly IApplicationDbContext _context;

    public CompatibilidadeService(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<bool> IsPecaCompativelComModeloAsync(int pecaId, int modeloMotoId, int? anoFabricacao = null, CancellationToken cancellationToken = default)
    {
        var existeAssociacao = await _context.CompatibilidadesPecaMoto
            .AsNoTracking()
            .AnyAsync(c => c.PecaId == pecaId && c.ModeloMotoId == modeloMotoId, cancellationToken);

        if (!existeAssociacao)
        {
            return false;
        }

        if (anoFabricacao.HasValue)
        {
            var modelo = await _context.ModelosMoto
                .AsNoTracking()
                .FirstOrDefaultAsync(m => m.Id == modeloMotoId, cancellationToken);

            if (modelo != null && !ValidarAnoModelo(anoFabricacao.Value, modelo.AnoInicio, modelo.AnoFim))
            {
                return false;
            }
        }

        return true;
    }

    public async Task<List<int>> ObterIdsPecasCompativeisAsync(int modeloMotoId, int? anoFabricacao = null, CancellationToken cancellationToken = default)
    {
        if (anoFabricacao.HasValue)
        {
            var modelo = await _context.ModelosMoto
                .AsNoTracking()
                .FirstOrDefaultAsync(m => m.Id == modeloMotoId, cancellationToken);

            if (modelo != null && !ValidarAnoModelo(anoFabricacao.Value, modelo.AnoInicio, modelo.AnoFim))
            {
                return new List<int>();
            }
        }

        return await _context.CompatibilidadesPecaMoto
            .AsNoTracking()
            .Where(c => c.ModeloMotoId == modeloMotoId)
            .Select(c => c.PecaId)
            .Distinct()
            .ToListAsync(cancellationToken);
    }

    public bool ValidarAnoModelo(int anoFabricacao, int? anoInicio, int? anoFim)
    {
        if (anoInicio.HasValue && anoFabricacao < anoInicio.Value)
        {
            return false;
        }

        if (anoFim.HasValue && anoFabricacao > anoFim.Value)
        {
            return false;
        }

        return true;
    }
}
