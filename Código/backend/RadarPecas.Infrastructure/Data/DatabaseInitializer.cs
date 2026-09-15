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

        await DatabaseSeeder.SeedAsync(dbContext, logger);
    }
}
