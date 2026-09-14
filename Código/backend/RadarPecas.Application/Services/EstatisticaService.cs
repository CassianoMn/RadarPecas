using Microsoft.EntityFrameworkCore;
using RadarPecas.Application.Interfaces;
using RadarPecas.Domain.Entities;

namespace RadarPecas.Application.Services;

public class EstatisticaService : IEstatisticaService
{
    private readonly IApplicationDbContext _context;

    public EstatisticaService(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task RegistrarVisualizacaoAsync(Guid estoqueId, CancellationToken cancellationToken = default)
    {
        var hoje = DateOnly.FromDateTime(DateTime.UtcNow);

        var stat = await _context.EstatisticasOferta
            .FirstOrDefaultAsync(s => s.EstoqueLojaId == estoqueId && s.DataRegistro == hoje, cancellationToken);

        if (stat != null)
        {
            stat.Visualizacoes++;
        }
        else
        {
            var estoqueExiste = await _context.EstoqueLojas.AnyAsync(e => e.Id == estoqueId, cancellationToken);
            if (!estoqueExiste) return;

            stat = new EstatisticaOferta
            {
                EstoqueLojaId = estoqueId,
                Visualizacoes = 1,
                Cliques = 0,
                DataRegistro = hoje
            };
            await _context.EstatisticasOferta.AddAsync(stat, cancellationToken);
        }

        await _context.SaveChangesAsync(cancellationToken);
    }

    public async Task RegistrarCliqueAsync(Guid estoqueId, CancellationToken cancellationToken = default)
    {
        var hoje = DateOnly.FromDateTime(DateTime.UtcNow);

        var stat = await _context.EstatisticasOferta
            .FirstOrDefaultAsync(s => s.EstoqueLojaId == estoqueId && s.DataRegistro == hoje, cancellationToken);

        if (stat != null)
        {
            stat.Cliques++;
        }
        else
        {
            var estoqueExiste = await _context.EstoqueLojas.AnyAsync(e => e.Id == estoqueId, cancellationToken);
            if (!estoqueExiste) return;

            stat = new EstatisticaOferta
            {
                EstoqueLojaId = estoqueId,
                Visualizacoes = 1,
                Cliques = 1,
                DataRegistro = hoje
            };
            await _context.EstatisticasOferta.AddAsync(stat, cancellationToken);
        }

        await _context.SaveChangesAsync(cancellationToken);
    }
}
