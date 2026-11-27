# Cronograma Executado, Marcos e Matriz de Riscos — RadarPeças

Documento de acompanhamento do projeto de TCC (Cassiano Menezes e Luiz Augusto — BSI/UFS), consolidado a partir dos marcos reais versionados no repositório Git.

---

## 1. Linha do Tempo e Marcos de Entrega

| Marco / Entrega | Data (Ref. Git) | Escopo Concluído |
|---|---|---|
| **Proposta de TCC e Modelagem** | Base inicial | Definição teórica (assimetria de informação / mercado de dois lados), casos de uso, 17 protótipos de tela e DDL canônico `DB_radarPecas.sql`. |
| **MVP Core + Seed Sergipe (#34, PR #35)** | 2026-11-03 – 2026-11-05 | API .NET 8 funcional, SPA React 19, mapa Leaflet/OSM, calibração de coordenadas reais em Itabaiana/SE, Aracaju e cidades vizinhas. |
| **Responsividade Mobile (#17, PR #36)** | 2026-11-05 – 2026-11-16 | Adaptação mobile-first das páginas públicas, catálogos e painel do lojista. |
| **Infraestrutura Cloud (PR #40)** | 2026-11-16 | Dockerfile multi-stage para API no **Render**, PostgreSQL gerenciado no **Supabase** e SPA publicada na **Vercel** (`vercel.json`). |
| **Super PR P1 (#27, #28, #37, #38 — PR #41)** | 2026-11-16 – 2026-11-17 | Geolocalização e ranking em SQL (*bounding box* + Haversine + `pg_trgm`), paginação real, assets WebP locais, *bottom nav* / *filter sheet*, PWA offline e auditoria Lighthouse CI Slow 4G (`LCP <= 5s`). |
| **Super PR P2 (#29, #30)** | 2026-11-17 – 2026-11-18 | Testes de integração (`WebApplicationFactory`, IDOR, status `401/403/404/422`), `Vitest` no front-end, Serilog estruturado, transação em `RegisterLojistaAsync`, refatoração modular da `LojistaPage`, documentação completa (`docs/`) e higiene do repositório. |

---

## 2. Matriz de Riscos Técnicos e Mitigações

| Risco Identificado | Probabilidade | Impacto | Mitigação Aplicada | Status |
|---|---|---|---|---|
| **Carregamento completo de lojas/ofertas em memória (OOM)** | Média | Alto | Pré-filtro geográfico via *bounding box* + cálculo Haversine e ordenação diretamente no PostgreSQL ([ADR-001](../docs/adr/001-geolocalizacao-haversine-vs-postgis.md)). | Mitigado |
| **Indisponibilidade da extensão PostGIS em banco gerenciado gratuito** | Alta | Alto | Adoção de coordenadas `DECIMAL` com índices B-tree e `pg_trgm` nativos do PostgreSQL 14+ sem depender de PostGIS. | Mitigado |
| **Condição de corrida em contadores de visualizações/cliques** | Média | Médio | Upsert atômico `INSERT ... ON CONFLICT DO UPDATE` em `EstatisticaService`. | Mitigado |
| **Falha parcial no cadastro de lojista deixando usuário sem loja** | Baixa | Alto | Persistência atômica `Usuario + Loja` encapsulada em `ExecuteInTransactionAsync` no PostgreSQL. | Mitigado |
| **Acesso cruzado entre lojistas (IDOR)** | Baixa | Crítico | Verificação explícita de titularidade (`403 Forbidden`) nos services + cobertura automática em `ApiIntegracaoTests`. | Mitigado |
| **Atraso de renderização em 4G móvel por mapas e imagens externas** | Alta | Médio | Lazy load do Leaflet, vendor code-splitting (`< 200 kB`), assets locais em WebP e verificação via Lighthouse CI (`docs/plano-de-testes.md`). | Mitigado |
| **Monolito de UI em `LojistaPage.tsx` (3.600+ linhas)** | Alta | Médio | Refatoração por abas em `src/pages/lojista/`, helpers unificados (`formatMoneyBR`, `parseHorariosEditor`) e classes CSS semânticas. | Mitigado |
| **Desatualização de coordenadas pontuais no mapa (#42)** | Baixa | Baixo | Mapeado como melhoria visual incremental separada (*issue #42*), sem impactar os fluxos principais de busca e oferta. | Monitorado |
