# Especificação de Requisitos de Software (SRS) — RadarPeças

- **Versão:** 1.0 (alinhada às entregas P0, P1 e P2 do TCC)
- **Autores:** Cassiano Menezes, Luiz Augusto (BSI — Universidade Federal de Sergipe)
- **Contexto:** Marketplace de dois lados (*two-sided market*) para busca geolocalizada de motopeças em estoque imediato nas lojas físicas e oficinas locais (foco narrativo em Itabaiana/SE e Grande Aracaju).

---

## 1. Visão Geral e Personas

1. **Motociclista / Mecânico:** necessita localizar peças compatíveis com a sua motocicleta em lojas próximas, comparando preço à vista, promoções vigentes, avaliação da loja e rota até o estabelecimento sem depender de consultas manuais dispersas.
2. **Lojista / Oficina:** necessita publicar catálogo, manter estoque e preços atualizados com baixa fricção, destacar promoções no mapa e acompanhar demanda regional (peças mais procuradas, visualizações e cliques em rota/reserva).

---

## 2. Requisitos Funcionais (RF)

| Código | Requisito | Estado Atual / Mapeamento |
|---|---|---|
| **RF01** | **Cadastro e Autenticação Multi-Perfil** | Registro de `Motociclista` (`POST /api/auth/register-motociclista`) e `LOJISTA` (`POST /api/auth/register-lojista` com persistência transacional Usuário + Loja), login JWT (`POST /api/auth/login`), opção funcional de persistência (`localStorage` vs `sessionStorage`) e edição de perfil/senha (`PUT /api/auth/profile`). |
| **RF02** | **Garagem Virtual e Motocicleta Ativa** | CRUD autenticado (`/api/garagem`) vinculado a `modelos_moto` (marca, modelo e faixa de anos `ano_inicio..ano_fim`). A moto marcada como ativa define automaticamente o filtro de compatibilidade técnica na busca. |
| **RF03** | **Busca Geolocalizada e Filtros Combinados** | Consulta paginada (`GET /api/busca`) com filtro por termo textual (via índice `pg_trgm`/`ILike`), categoria, marca, preço máximo, raio em km (Bounding Box + Haversine SQL conforme ADR-001), "apenas promoções" e compatibilidade obrigatória com a moto selecionada. |
| **RF04** | **Ranking Inteligente de Ofertas** | Ordenação padrão `recomendados` ponderando Preço (35%), Distância (30%), Avaliação da loja (20%) e Promoção ativa (15%), além de ordenações por menor preço, menor distância e melhor avaliação (`docs/ranking-busca.md`). |
| **RF05** | **Exploração em Mapa Interativo e Autocomplete** | Página inicial (`/`) e mini-mapa em detalhes da oferta (`/ofertas/:id`) em Leaflet + OpenStreetMap, com busca de endereços via proxy `/api/geocoding/sugestoes` (Nominatim/Photon) e cards com horários formatados. |
| **RF06** | **Detalhe da Oferta, Reserva e Conversão** | Página `/ofertas/:id` exibe preço normal/promocional, especificações JSONB, modelos compatíveis, mini-mapa e CTAs **"Reservar na Loja Física"** (WhatsApp `wa.me`) e **"Ir até a Loja"** (Google Maps), contabilizando visualizações e cliques em `estatisticas_oferta` (`POST /api/ofertas/{id}/visualizacao` e `/clique`). |
| **RF07** | **Catálogo de Lojas e Avaliações** | Listagem paginada (`/api/lojas/paginadas`), página pública da loja (`/lojas/:id`) com estoque paginado e histórico de avaliações, além de envio de avaliação autenticada (nota 1–5, comentário e indicação `recomenda`). |
| **RF08** | **Gestão de Catálogo, Estoque e Promoções do Lojista** | Painel `/lojista` dividido por abas (`Resumo`, `Novo Produto`, `Estoque e Preços`, `Ofertas Ativas`, `Criar Nova Oferta`, `Mais Procurados`, `Perfil da Loja`), edição inline de preço/estoque/promoção, wizard de ofertas com pré-visualização e exportação CSV. |
| **RF09** | **Inteligência Regional e Dashboard do Lojista** | Endpoint `GET /api/lojas/{id}/dashboard` retorna KPIs reais (produtos, estoque baixo, buscas 24h, ofertas ativas, visualizações, cliques) e ranking regional de peças mais procuradas (`CompatibilidadeService` + demanda real). |

---

## 3. Requisitos Não Funcionais (RNF)

| Código | Requisito | Implementação e Verificação |
|---|---|---|
| **RNF01** | **Arquitetura em Camadas & API REST** | ASP.NET Core .NET 8 (`Domain`, `Application`, `Infrastructure`, `Api`) + SPA React 19 / TypeScript / Vite 8 comunicando-se via JSON com envelope `ApiResponse<T>` e `PagedResult<T>`. |
| **RNF02** | **Segurança, Autenticação e Isolamento (IDOR)** | Senhas com BCrypt (`work factor 11`), JWT HMAC-SHA256 com expiração configurável e `ClockSkew = 0`, validação de posse (*ownership*) nos serviços para impedir acesso cruzado entre lojistas (`403 Forbidden`), rate limiting (`busca`: 60/min, `metricas`: 120/min), CORS *fail-closed* e headers CSP no Vite. |
| **RNF03** | **Escalabilidade Espacial e Textual** | Filtragem geográfica (*bounding box* B-tree + Haversine SQL) e textual (`pg_trgm` GIN + `ILike`) executadas integralmente no PostgreSQL 14+ com paginação no banco, sem carregamento completo em memória. |
| **RNF04** | **Desempenho em Rede Móvel (Slow 4G <= 5s)** | Code splitting por rota/vendor (chunks `< 200 kB`), carregamento lazy do Leaflet, assets locais em WebP (`public/seed/*.webp`) e Service Worker Workbox, atingindo **LCP <= 4,1s na Home e ~2,3s na Busca** no Lighthouse CI Slow 4G (`docs/plano-de-testes.md`). |
| **RNF05** | **Observabilidade e Consistência HTTP** | Logging estruturado com **Serilog** (`UseSerilogRequestLogging`, sem PII de corpo/headers), mapeamento semântico uniforme de respostas HTTP (`400`, `401`, `403`, `404`, `422`) e persistência atômica transacional em `RegisterLojistaAsync` e upsert atômico SQL em `EstatisticaService`. |
| **RNF06** | **Usabilidade Mobile-First e Acessibilidade** | Bottom tab bar mobile, *FilterSheet* em gaveta inferior, contraste WCAG adequado, `aria-labels` e auditoria automatizada (`categories:accessibility >= 0.95` no `lighthouserc.json`). |
