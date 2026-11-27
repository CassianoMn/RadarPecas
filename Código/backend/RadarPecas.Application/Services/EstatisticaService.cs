using Microsoft.EntityFrameworkCore;
using RadarPecas.Application.Interfaces;

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
        // Id inválido: no-op (comportamento anterior).
        if (!await _context.EstoqueLojas.AnyAsync(e => e.Id == estoqueId, cancellationToken)) return;

        if (_context.IsRelationalDatabase)
        {
            // Upsert atômico no PostgreSQL: evita lost update sob concorrência (INSERT ... ON CONFLICT).
            const string sql = """
                INSERT INTO estatisticas_oferta (id, estoque_loja_id, visualizacoes, cliques, data_registro)
                VALUES (gen_random_uuid(), {0}, 1, 0, CURRENT_DATE)
                ON CONFLICT (estoque_loja_id, data_registro)
                DO UPDATE SET visualizacoes = estatisticas_oferta.visualizacoes + 1;
                """;
            await _context.ExecuteSqlRawAsync(sql, estoqueId);
            return;
        }

        await IncrementarEmMemoriaAsync(estoqueId, incrementoVisualizacoes: 1, incrementoCliques: 0, cancellationToken);
    }

    public async Task RegistrarCliqueAsync(Guid estoqueId, CancellationToken cancellationToken = default)
    {
        if (!await _context.EstoqueLojas.AnyAsync(e => e.Id == estoqueId, cancellationToken)) return;

        if (_context.IsRelationalDatabase)
        {
            const string sql = """
                INSERT INTO estatisticas_oferta (id, estoque_loja_id, visualizacoes, cliques, data_registro)
                VALUES (gen_random_uuid(), {0}, 1, 1, CURRENT_DATE)
                ON CONFLICT (estoque_loja_id, data_registro)
                DO UPDATE SET cliques = estatisticas_oferta.cliques + 1;
                """;
            await _context.ExecuteSqlRawAsync(sql, estoqueId);
            return;
        }

        // Mantém consistência com o upsert SQL: primeiro clique no dia garante ao menos 1 visualização.
        await IncrementarEmMemoriaAsync(estoqueId, incrementoVisualizacoes: 0, incrementoCliques: 1, cancellationToken);
    }

    private async Task IncrementarEmMemoriaAsync(
        Guid estoqueId,
        int incrementoVisualizacoes,
        int incrementoCliques,
        CancellationToken cancellationToken)
    {
        var hoje = DateOnly.FromDateTime(DateTime.UtcNow);
        var registro = await _context.EstatisticasOferta
            .FirstOrDefaultAsync(e => e.EstoqueLojaId == estoqueId && e.DataRegistro == hoje, cancellationToken);

        if (registro is null)
        {
            registro = new Domain.Entities.EstatisticaOferta
            {
                EstoqueLojaId = estoqueId,
                DataRegistro = hoje,
                Visualizacoes = incrementoVisualizacoes > 0 ? incrementoVisualizacoes : 1,
                Cliques = incrementoCliques,
            };
            await _context.EstatisticasOferta.AddAsync(registro, cancellationToken);
        }
        else
        {
            registro.Visualizacoes += incrementoVisualizacoes;
            registro.Cliques += incrementoCliques;
        }

        await _context.SaveChangesAsync(cancellationToken);
    }
}
