# Registro de Acompanhamento e Decisões Técnicas (Atas) — RadarPeças

Este arquivo consolida o histórico objetivo das decisões arquiteturais e de produto tomadas ao longo dos ciclos de desenvolvimento registrados nas Pull Requests e Issues do repositório (`CassianoMn/RadarPecas`).

---

## Registro 01 — Calibração Regional e Seed de Dados (#34 / PR #35)
- **Contexto:** necessidade de substituir registros genéricos por estabelecimentos georreferenciados em Itabaiana/SE, Aracaju/SE e municípios próximos para demonstrar descoberta real no mapa.
- **Decisão:** calibração de coordenadas reais das lojas no `DatabaseSeeder` e atualização de `AnaliseProjeto/dump_radarPecas.sql`, preservando vigência das promoções no banco.

## Registro 02 — Publicação em Nuvem (PR #40)
- **Contexto:** validar o marketplace fora do ambiente local com custo compatível ao TCC.
- **Decisão:** hospedar front-end SPA/PWA na **Vercel** (`vercel.json` com fallback para `index.html`), back-end .NET 8 em container Docker no **Render** (`Dockerfile`) e PostgreSQL gerenciado no **Supabase** via variável `DATABASE_URL`.

## Registro 03 — Escala SQL, Experiência Mobile e Performance 4G (#27, #28, #37, #38 / PR #41)
- **Decisões Arquiteturais:**
  - Formalizadas em [`docs/adr/001-geolocalizacao-haversine-vs-postgis.md`](../docs/adr/001-geolocalizacao-haversine-vs-postgis.md) (Haversine SQL + `pg_trgm` sem PostGIS) e [`docs/adr/002-schema-sql-vs-ef-migrations.md`](../docs/adr/002-schema-sql-vs-ef-migrations.md) (DDL canônico + rotinas idempotentes de índices).
- **Decisões de Produto e UX:**
  - Registradas em [`docs/decisoes-produto.md`](../docs/decisoes-produto.md): conversão direta via WhatsApp/Google Maps com mini-mapa Leaflet na oferta, remoção de botões OAuth simulados, persistência real no "Lembrar-me" e troca de imagens de seed quebradas por assets WebP locais.
  - Navegação móvel via *BottomNav* + *FilterSheet* + busca sincronizada na URL.
  - Desempenho Slow 4G validado com Lighthouse CI abaixo do teto de `5s` (`RNF04`).

## Registro 04 — Confiabilidade, Refatoração e Documentação Final (#29, #30)
- **Qualidade e Observabilidade (#29):**
  - Adoção de **Serilog** (`UseSerilogRequestLogging`) sem registro de corpos ou headers sensíveis.
  - Mapeamento uniforme de falhas negociais nos controllers (`401`/`403`/`404`/`422`/`400`) mantendo compatibilidade com o cliente HTTP (`ApiError`).
  - Persistência transacional de `Usuario + Loja` no cadastro de lojista (`ExecuteInTransactionAsync`).
  - Ampliação da suíte do back-end para **67 testes** (incluindo testes HTTP/IDOR via `WebApplicationFactory`) e implantação do **Vitest** no front-end (**9 testes** iniciais).
- **Refatoração, Docs e Higiene (#30):**
  - Modularização da `LojistaPage.tsx` (7 componentes de aba + `LojistaSidebar` em `src/pages/lojista/`), unificação de `formatMoneyBR` e `parseHorariosEditor` e extração de estilos para `src/index.css`.
  - Adição de proxy `/api` e headers de segurança (`Content-Security-Policy`) no `vite.config.ts`.
  - Remoção da solução duplicada `RadarPecas.slnx`, extensão em `AnaliseProjeto/DER.png` + fonte `DER.mmd`, correção do `Código/rodar-radarpecas.bat` e entrega da documentação completa em `docs/` e `Gerenciamento/`.
