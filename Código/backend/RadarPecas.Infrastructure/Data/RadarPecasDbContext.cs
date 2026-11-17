using System.Linq.Expressions;
using System.Reflection;
using Microsoft.EntityFrameworkCore;
using RadarPecas.Application.Interfaces;
using RadarPecas.Domain.Entities;
using RadarPecas.Domain.Enums;

namespace RadarPecas.Infrastructure.Data;

public class RadarPecasDbContext : DbContext, IApplicationDbContext
{
    private static readonly MethodInfo ILikeMethod = typeof(NpgsqlDbFunctionsExtensions).GetMethod(
        nameof(NpgsqlDbFunctionsExtensions.ILike),
        [typeof(DbFunctions), typeof(string), typeof(string), typeof(string)])!;

    private static readonly MethodInfo StringContainsMethod = typeof(string).GetMethod(
        nameof(string.Contains),
        [typeof(string), typeof(StringComparison)])!;

    public RadarPecasDbContext(DbContextOptions<RadarPecasDbContext> options) : base(options)
    {
    }

    public DbSet<Usuario> Usuarios => Set<Usuario>();
    public DbSet<Loja> Lojas => Set<Loja>();
    public DbSet<ModeloMoto> ModelosMoto => Set<ModeloMoto>();
    public DbSet<GaragemVirtual> GaragemVirtual => Set<GaragemVirtual>();
    public DbSet<Peca> Pecas => Set<Peca>();
    public DbSet<CompatibilidadePecaMoto> CompatibilidadesPecaMoto => Set<CompatibilidadePecaMoto>();
    public DbSet<EstoqueLoja> EstoqueLojas => Set<EstoqueLoja>();
    public DbSet<AvaliacaoLoja> AvaliacoesLoja => Set<AvaliacaoLoja>();
    public DbSet<EstatisticaOferta> EstatisticasOferta => Set<EstatisticaOferta>();

    public Task<int> ExecuteSqlRawAsync(string sql, params object[] parameters) =>
        Database.ExecuteSqlRawAsync(sql, parameters);

    public IQueryable<T> FiltrarPorTexto<T>(
        IQueryable<T> query,
        string termo,
        params Expression<Func<T, string?>>[] campos)
    {
        if (string.IsNullOrWhiteSpace(termo) || campos.Length == 0)
        {
            return query;
        }

        return FiltrarPorTermosQualquer(query, [termo.Trim()], campos);
    }

    public IQueryable<T> FiltrarPorTermosQualquer<T>(
        IQueryable<T> query,
        IReadOnlyCollection<string> termos,
        params Expression<Func<T, string?>>[] campos)
    {
        var termosLimpos = termos
            .Where(t => !string.IsNullOrWhiteSpace(t))
            .Select(t => t.Trim())
            .ToArray();

        if (termosLimpos.Length == 0 || campos.Length == 0)
        {
            return query;
        }

        var useNpgsql = Database.IsNpgsql();
        var param = Expression.Parameter(typeof(T), "x");
        var efFunctions = Expression.Property(null, typeof(EF), nameof(EF.Functions));
        var escapeChar = Expression.Constant("\\");
        Expression? combined = null;

        foreach (var termo in termosLimpos)
        {
            var pattern = $"%{EscapeLike(termo)}%";
            foreach (var campo in campos)
            {
                var body = new ParameterReplacer(campo.Parameters[0], param).Visit(campo.Body)!;
                Expression matchExpr;

                if (useNpgsql)
                {
                    matchExpr = Expression.AndAlso(
                        Expression.NotEqual(body, Expression.Constant(null, typeof(string))),
                        Expression.Call(
                            ILikeMethod,
                            efFunctions,
                            body,
                            Expression.Constant(pattern),
                            escapeChar));
                }
                else
                {
                    matchExpr = Expression.AndAlso(
                        Expression.NotEqual(body, Expression.Constant(null, typeof(string))),
                        Expression.Call(
                            body,
                            StringContainsMethod,
                            Expression.Constant(termo),
                            Expression.Constant(StringComparison.OrdinalIgnoreCase)));
                }

                combined = combined == null ? matchExpr : Expression.OrElse(combined, matchExpr);
            }
        }

        if (combined == null)
        {
            return query;
        }

        var predicate = Expression.Lambda<Func<T, bool>>(combined, param);
        return query.Where(predicate);
    }

    private static string EscapeLike(string value) =>
        value.Replace("\\", "\\\\").Replace("%", "\\%").Replace("_", "\\_");

    private sealed class ParameterReplacer : ExpressionVisitor
    {
        private readonly ParameterExpression _from;
        private readonly ParameterExpression _to;

        public ParameterReplacer(ParameterExpression from, ParameterExpression to)
        {
            _from = from;
            _to = to;
        }

        protected override Expression VisitParameter(ParameterExpression node) =>
            node == _from ? _to : base.VisitParameter(node);
    }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Configuração de Nomes de Tabelas
        modelBuilder.Entity<Usuario>().ToTable("usuarios");
        modelBuilder.Entity<Loja>().ToTable("lojas");
        modelBuilder.Entity<ModeloMoto>().ToTable("modelos_moto");
        modelBuilder.Entity<GaragemVirtual>().ToTable("garagem_virtual");
        modelBuilder.Entity<Peca>().ToTable("pecas");
        modelBuilder.Entity<CompatibilidadePecaMoto>().ToTable("compatibilidade_peca_moto");
        modelBuilder.Entity<EstoqueLoja>().ToTable("estoque_loja");
        modelBuilder.Entity<AvaliacaoLoja>().ToTable("avaliacoes_loja");
        modelBuilder.Entity<EstatisticaOferta>().ToTable("estatisticas_oferta");

        // 1. Usuario
        modelBuilder.Entity<Usuario>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Id).HasDefaultValueSql("gen_random_uuid()");
            entity.Property(e => e.Nome).HasMaxLength(100).IsRequired();
            entity.Property(e => e.Email).HasMaxLength(150).IsRequired();
            entity.HasIndex(e => e.Email).IsUnique();
            entity.Property(e => e.SenhaHash).HasMaxLength(255).IsRequired();
            entity.Property(e => e.TipoUsuario)
                  .HasConversion<string>()
                  .HasMaxLength(20)
                  .IsRequired();
            entity.Property(e => e.DataCadastro).HasDefaultValueSql("CURRENT_TIMESTAMP");
        });

        // 2. Loja
        modelBuilder.Entity<Loja>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Id).HasDefaultValueSql("gen_random_uuid()");
            entity.Property(e => e.NomeFantasia).HasMaxLength(150).IsRequired();
            entity.Property(e => e.Cnpj).HasMaxLength(18);
            entity.HasIndex(e => e.Cnpj).IsUnique();
            entity.Property(e => e.EnderecoCompleto).IsRequired();
            entity.Property(e => e.Latitude).HasPrecision(10, 8).IsRequired();
            entity.Property(e => e.Longitude).HasPrecision(11, 8).IsRequired();
            entity.Property(e => e.TelefoneContato).HasMaxLength(20);
            entity.Property(e => e.EmailContato).HasMaxLength(150);
            entity.Property(e => e.HorariosFuncionamento).HasColumnType("jsonb");
            entity.Property(e => e.GaleriaFotosUrls).HasColumnType("text[]");
            entity.Property(e => e.Ativa).HasDefaultValue(true);

            entity.HasOne(e => e.Usuario)
                  .WithMany(u => u.Lojas)
                  .HasForeignKey(e => e.UsuarioId)
                  .OnDelete(DeleteBehavior.Cascade);
        });

        // 3. ModeloMoto
        modelBuilder.Entity<ModeloMoto>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Id).ValueGeneratedOnAdd();
            entity.Property(e => e.Marca).HasMaxLength(50).IsRequired();
            entity.Property(e => e.Modelo).HasMaxLength(100).IsRequired();
        });

        // 4. GaragemVirtual
        modelBuilder.Entity<GaragemVirtual>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Id).HasDefaultValueSql("gen_random_uuid()");
            entity.Property(e => e.AnoFabricacao).IsRequired();
            entity.Property(e => e.Apelido).HasMaxLength(50);

            entity.HasOne(e => e.Usuario)
                  .WithMany(u => u.MotosGaragem)
                  .HasForeignKey(e => e.UsuarioId)
                  .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(e => e.ModeloMoto)
                  .WithMany(m => m.Garagens)
                  .HasForeignKey(e => e.ModeloMotoId)
                  .OnDelete(DeleteBehavior.Restrict);
        });

        // 5. Peca
        modelBuilder.Entity<Peca>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Id).ValueGeneratedOnAdd();
            entity.Property(e => e.Sku).HasMaxLength(50);
            entity.HasIndex(e => e.Sku).IsUnique();
            entity.Property(e => e.CodigoEan).HasMaxLength(13);
            entity.HasIndex(e => e.CodigoEan).IsUnique();
            entity.Property(e => e.Nome).HasMaxLength(150).IsRequired();
            entity.Property(e => e.Categoria).HasMaxLength(50).IsRequired();
            entity.Property(e => e.Especificacoes).HasColumnType("jsonb");
        });

        // 6. CompatibilidadePecaMoto
        modelBuilder.Entity<CompatibilidadePecaMoto>(entity =>
        {
            entity.HasKey(e => new { e.PecaId, e.ModeloMotoId });

            entity.HasOne(e => e.Peca)
                  .WithMany(p => p.Compatibilidades)
                  .HasForeignKey(e => e.PecaId)
                  .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(e => e.ModeloMoto)
                  .WithMany(m => m.Compatibilidades)
                  .HasForeignKey(e => e.ModeloMotoId)
                  .OnDelete(DeleteBehavior.Cascade);
        });

        // 7. EstoqueLoja
        modelBuilder.Entity<EstoqueLoja>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Id).HasDefaultValueSql("gen_random_uuid()");
            entity.Property(e => e.QuantidadeEstoque).HasDefaultValue(0);
            entity.Property(e => e.AlertaEstoqueMinimo).HasDefaultValue(5);
            entity.Property(e => e.PrecoVenda).HasPrecision(10, 2).IsRequired();
            entity.Property(e => e.EmPromocao).HasDefaultValue(false);
            entity.Property(e => e.PrecoPromocional).HasPrecision(10, 2);
            entity.Property(e => e.DataAtualizacao).HasDefaultValueSql("CURRENT_TIMESTAMP");

            entity.HasOne(e => e.Loja)
                  .WithMany(l => l.Estoques)
                  .HasForeignKey(e => e.LojaId)
                  .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(e => e.Peca)
                  .WithMany(p => p.Estoques)
                  .HasForeignKey(e => e.PecaId)
                  .OnDelete(DeleteBehavior.Restrict);

            entity.Ignore(e => e.PrecoEfetivo);
            entity.Ignore(e => e.PromocaoAtiva);
        });

        // 8. AvaliacaoLoja
        modelBuilder.Entity<AvaliacaoLoja>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Id).HasDefaultValueSql("gen_random_uuid()");
            entity.Property(e => e.Nota).IsRequired();
            entity.Property(e => e.Recomenda).IsRequired();
            entity.Property(e => e.DataAvaliacao).HasDefaultValueSql("CURRENT_TIMESTAMP");

            entity.HasOne(e => e.Loja)
                  .WithMany(l => l.Avaliacoes)
                  .HasForeignKey(e => e.LojaId)
                  .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(e => e.Usuario)
                  .WithMany(u => u.Avaliacoes)
                  .HasForeignKey(e => e.UsuarioId)
                  .OnDelete(DeleteBehavior.Cascade);
        });

        // 9. EstatisticaOferta
        modelBuilder.Entity<EstatisticaOferta>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Id).HasDefaultValueSql("gen_random_uuid()");
            entity.Property(e => e.Visualizacoes).HasDefaultValue(0);
            entity.Property(e => e.Cliques).HasDefaultValue(0);
            entity.Property(e => e.DataRegistro).HasDefaultValueSql("CURRENT_DATE");

            entity.HasIndex(e => new { e.EstoqueLojaId, e.DataRegistro }).IsUnique();

            entity.HasOne(e => e.EstoqueLoja)
                  .WithMany(s => s.Estatisticas)
                  .HasForeignKey(e => e.EstoqueLojaId)
                  .OnDelete(DeleteBehavior.Cascade);
        });
    }
}
