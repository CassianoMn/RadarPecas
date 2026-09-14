using Microsoft.EntityFrameworkCore;
using RadarPecas.Domain.Entities;

namespace RadarPecas.Application.Interfaces;

public interface IApplicationDbContext
{
    DbSet<Usuario> Usuarios { get; }
    DbSet<Loja> Lojas { get; }
    DbSet<ModeloMoto> ModelosMoto { get; }
    DbSet<GaragemVirtual> GaragemVirtual { get; }
    DbSet<Peca> Pecas { get; }
    DbSet<CompatibilidadePecaMoto> CompatibilidadesPecaMoto { get; }
    DbSet<EstoqueLoja> EstoqueLojas { get; }
    DbSet<AvaliacaoLoja> AvaliacoesLoja { get; }
    DbSet<EstatisticaOferta> EstatisticasOferta { get; }

    Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
}
