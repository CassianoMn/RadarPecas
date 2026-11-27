using System.Linq.Expressions;
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

    bool IsRelationalDatabase { get; }

    Task ExecuteInTransactionAsync(Func<CancellationToken, Task> action, CancellationToken cancellationToken = default);

    /// <summary>Executa SQL bruto (ex.: increments atômicos). Preferir para contadores.</summary>
    Task<int> ExecuteSqlRawAsync(string sql, params object[] parameters);

    /// <summary>
    /// Filtra a consulta por substring case-insensitive em qualquer um dos campos informados,
    /// usando <c>EF.Functions.ILike</c> no PostgreSQL para aproveitamento de índices trigram.
    /// </summary>
    IQueryable<T> FiltrarPorTexto<T>(IQueryable<T> query, string termo, params Expression<Func<T, string?>>[] campos);

    /// <summary>
    /// Filtra a consulta exigindo correspondência para ao menos um dos termos em qualquer um dos campos.
    /// </summary>
    IQueryable<T> FiltrarPorTermosQualquer<T>(IQueryable<T> query, IReadOnlyCollection<string> termos, params Expression<Func<T, string?>>[] campos);
}
