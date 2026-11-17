# ADR-002: Versionamento de Schema — Script SQL Canônico + Inicializador Idempotente vs. EF Core Migrations

- **Status:** Aceito (2026-11-16)
- **Contexto:** Issue #27 — formalização da estratégia de criação e evolução do schema PostgreSQL.

## Contexto

O projeto nasceu com o DDL canônico em `AnaliseProjeto/DB_radarPecas.sql` (alinhado ao DER e à documentação de TCC) e o `DatabaseInitializer.cs` executando esse script no boot quando o banco está vazio, seguido do `DatabaseSeeder.cs`. Não há histórico de `EF Migrations` gerado no projeto.

## Decisão

Manter a estratégia de **DDL canônico + rotinas idempotentes no `DatabaseInitializer`**, com as seguintes regras:

1. `AnaliseProjeto/DB_radarPecas.sql` permanece como a fonte única de verdade da estrutura inicial de tabelas, constraints e índices.
2. Evoluções incrementais não destrutivas (como criação de índices B-tree e índices GIN `pg_trgm`) devem estar **tanto** no `DB_radarPecas.sql` (para bancos novos) **quanto** em blocos idempotentes (`CREATE ... IF NOT EXISTS`) no `DatabaseInitializer.EnsureIndexesAsync` (para bancos já existentes).
3. Mudanças estruturais futuras que alterem colunas em produção deverão adotar **EF Core Migrations** ou scripts versionados em `AnaliseProjeto/migrations/` com controle explícito de versão.

## Consequências

- Preserva a arquitetura simples atual de `DatabaseInitializer` e o fluxo do `Dockerfile` (que copia explicitamente `AnaliseProjeto/DB_radarPecas.sql`).
- Garante que bancos já populados recebam os novos índices de performance automaticamente na inicialização da API.
