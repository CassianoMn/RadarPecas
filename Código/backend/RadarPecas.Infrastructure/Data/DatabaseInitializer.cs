using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace RadarPecas.Infrastructure.Data;

/// <summary>
/// Cria o schema a partir do script canônico da documentação
/// (<c>AnaliseProjeto/DB_radarPecas.sql</c>) quando o banco ainda está vazio,
/// e em seguida executa o seed de dados. Bancos já existentes são preservados.
/// </summary>
public static class DatabaseInitializer
{
    private const string SchemaScriptPath = "DbScripts/DB_radarPecas.sql";

    public static async Task InitializeAsync(
        RadarPecasDbContext dbContext,
        ILogger logger,
        CancellationToken cancellationToken = default)
    {
        // pgcrypto é necessária p/ os defaults gen_random_uuid() do script.
        // É extensão trusted desde o PG 13: o dono do banco pode criá-la.
        await dbContext.Database.ExecuteSqlRawAsync(
            "CREATE EXTENSION IF NOT EXISTS pgcrypto;", cancellationToken);

        var usuariosTable = await dbContext.Database
            .SqlQueryRaw<string>("SELECT to_regclass('public.usuarios')::text AS \"Value\"")
            .FirstOrDefaultAsync(cancellationToken);

        if (string.IsNullOrEmpty(usuariosTable))
        {
            var scriptFile = Path.Combine(AppContext.BaseDirectory, SchemaScriptPath);
            if (!File.Exists(scriptFile))
            {
                throw new FileNotFoundException(
                    $"Script de schema não encontrado em '{scriptFile}'. " +
                    "Verifique se o arquivo AnaliseProjeto/DB_radarPecas.sql foi copiado para a saída.");
            }

            logger.LogInformation("Banco vazio. Aplicando schema de {Script}...", scriptFile);
            var script = await File.ReadAllTextAsync(scriptFile, cancellationToken);
            await dbContext.Database.ExecuteSqlRawAsync(script, cancellationToken);
            logger.LogInformation("Schema aplicado com sucesso.");
        }
        else
        {
            logger.LogInformation("Schema já existente. Pulando criação das tabelas.");
        }

        await EnsureIndexesAsync(dbContext, logger, cancellationToken);
        await DatabaseSeeder.SeedAsync(dbContext, logger);
    }

    private static async Task EnsureIndexesAsync(
        RadarPecasDbContext dbContext,
        ILogger logger,
        CancellationToken cancellationToken)
    {
        var btreeIndexes = new[]
        {
            "CREATE INDEX IF NOT EXISTS idx_lojas_ativa_coords ON lojas (ativa, latitude, longitude);",
            "CREATE INDEX IF NOT EXISTS idx_estoque_loja_loja_qtd ON estoque_loja (loja_id, quantidade_estoque);",
            "CREATE INDEX IF NOT EXISTS idx_estoque_loja_peca ON estoque_loja (peca_id);",
            "CREATE INDEX IF NOT EXISTS idx_estoque_loja_promo ON estoque_loja (em_promocao, data_inicio_promocao, data_fim_promocao);",
            "CREATE INDEX IF NOT EXISTS idx_avaliacoes_loja_id ON avaliacoes_loja (loja_id);",
            "CREATE INDEX IF NOT EXISTS idx_estatisticas_oferta_lookup ON estatisticas_oferta (estoque_loja_id, data_registro);",
            "CREATE INDEX IF NOT EXISTS idx_pecas_categoria_lower ON pecas (lower(categoria));",
            "CREATE INDEX IF NOT EXISTS idx_garagem_usuario ON garagem_virtual (usuario_id);"
        };

        foreach (var sql in btreeIndexes)
        {
            await dbContext.Database.ExecuteSqlRawAsync(sql, cancellationToken);
        }

        try
        {
            await dbContext.Database.ExecuteSqlRawAsync(
                "CREATE EXTENSION IF NOT EXISTS pg_trgm;", cancellationToken);

            var trigramIndexes = new[]
            {
                "CREATE INDEX IF NOT EXISTS idx_pecas_nome_trgm ON pecas USING gin (nome gin_trgm_ops);",
                "CREATE INDEX IF NOT EXISTS idx_pecas_descricao_trgm ON pecas USING gin (descricao gin_trgm_ops);",
                "CREATE INDEX IF NOT EXISTS idx_pecas_sku_trgm ON pecas USING gin (sku gin_trgm_ops);",
                "CREATE INDEX IF NOT EXISTS idx_pecas_categoria_trgm ON pecas USING gin (categoria gin_trgm_ops);",
                "CREATE INDEX IF NOT EXISTS idx_lojas_nome_trgm ON lojas USING gin (nome_fantasia gin_trgm_ops);",
                "CREATE INDEX IF NOT EXISTS idx_modelos_moto_marca_trgm ON modelos_moto USING gin (marca gin_trgm_ops);",
                "CREATE INDEX IF NOT EXISTS idx_modelos_moto_modelo_trgm ON modelos_moto USING gin (modelo gin_trgm_ops);"
            };

            foreach (var sql in trigramIndexes)
            {
                await dbContext.Database.ExecuteSqlRawAsync(sql, cancellationToken);
            }
        }
        catch (Exception ex)
        {
            logger.LogWarning("Extensão pg_trgm ou índices GIN não aplicados: {Message}", ex.Message);
        }
    }
}
