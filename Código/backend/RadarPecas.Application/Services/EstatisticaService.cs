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

        // Upsert atômico: evita lost update sob concorrência (INSERT ... ON CONFLICT).
        const string sql = """
            INSERT INTO estatisticas_oferta (id, estoque_loja_id, visualizacoes, cliques, data_registro)
            VALUES (gen_random_uuid(), {0}, 1, 0, CURRENT_DATE)
            ON CONFLICT (estoque_loja_id, data_registro)
            DO UPDATE SET visualizacoes = estatisticas_oferta.visualizacoes + 1;
            """;
        await _context.ExecuteSqlRawAsync(sql, estoqueId);
    }

    public async Task RegistrarCliqueAsync(Guid estoqueId, CancellationToken cancellationToken = default)
    {
        if (!await _context.EstoqueLojas.AnyAsync(e => e.Id == estoqueId, cancellationToken)) return;

        const string sql = """
            INSERT INTO estatisticas_oferta (id, estoque_loja_id, visualizacoes, cliques, data_registro)
            VALUES (gen_random_uuid(), {0}, 1, 1, CURRENT_DATE)
            ON CONFLICT (estoque_loja_id, data_registro)
            DO UPDATE SET cliques = estatisticas_oferta.cliques + 1;
            """;
        await _context.ExecuteSqlRawAsync(sql, estoqueId);
    }
}
