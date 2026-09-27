# BACKLOG-MELHORIAS — RadarPeças

Levantamento de fraquezas, faltas e ajustes encontrados na análise completa
(código + docs + run com screenshots 16:9 em `Requisitos/Capturas/`).
Arquivo LOCAL — não commitar. Data-base: 2026-09-27, `main` @ `6e18671`.

Legenda: **P0** = crítico/segurança · **P1** = funcional/dados · **P2** = qualidade/docs/processo.
Marque `[x]` ao concluir.

## P0 — Segurança (fazer antes de qualquer deploy público)

- [ ] **IDOR do lojista**: `EstoqueService` (update/delete) e `LojaService.AtualizarLoja/Dashboard`
  nunca conferem `Loja.UsuarioId == userId` — qualquer LOJISTA edita/vê loja alheia e o
  catálogo global de peças. Passar `userId` do claim, retornar 403.
  (`Api/Controllers/LojasController.cs:98,143`, `EstoqueController.cs:47,62,77`)
- [ ] **Segredos commitados**: JWT + senha do banco em `Program.cs:22,72`,
  `JwtTokenService.cs:22`, `appsettings.json:10,13`, `.env.example`. Remover fallbacks
  (fail-fast via env), rotacionar o JWT atual.
- [ ] **XSS via Leaflet na Home + token em localStorage = sequestro de sessão**:
  escapar HTML antes de `divIcon html`/`bindPopup` (`HomePage.tsx:105-116,160-186`),
  `noopener/noreferrer` nos `window.open` (`OfertaDetalhesPage.tsx:42,49`); avaliar
  cookie httpOnly no futuro.
- [ ] **Sem guard de papel no front**: `RequireAuth.tsx` só checa login; `/lojista`
  abre para motociclista (`App.tsx:33-40`, `LojistaPage.tsx:173`). Criar `RequireLojista`.
- [ ] **Endpoints públicos sem throttle**: busca, lojas, ofertas (view/clique),
  geocoding (proxy Nominatim) — spam/DoS/abuso. Rate limit + `UPDATE views=views+1`
  atômico em vez de read-increment-save (`EstatisticaService.cs:20-71`, `OfertasController.cs:36`).
- [ ] **CORS/HSTS frouxos**: fallback `AllowAnyOrigin` (`Program.cs:64-66`) e
  `RequireHttpsMetadata=false` (`Program.cs:83`). Endurecer em produção.
- [ ] **Seed e política de senha fracos**: `123456` no seeder, mínimo 6 chars,
  e-mail validado com `Contains('@')` (`AuthService.cs:69,122,253,279`).

## P1 — Corretude, dados e fluxos

- [ ] **Busca/OOM**: `BuscaRecomendacaoService.cs:117` carrega tudo e filtra/pagina em
  memória; `LojaService.cs:28-32,344-350` full-scan + Haversine em C#. Mover filtros
  (`PrecoMaximo/Marca/RaioKm`), `Count/Skip/Take` e distância para o banco (ideal: PostGIS).
- [ ] **`ToLower().Contains` mata índices** (`BuscaRecomendacaoService`, `EstoqueService`,
  `PecaService`). Trocar por `ILIKE`/`citext`/trigram.
- [ ] **Fire-and-forget + condição de corrida** em visualização/clique de oferta
  (`OfertasController.cs:36`). `await` + idempotência.
- [ ] **Status HTTP errado**: login inválido retorna 400 (`AuthController.cs:28`), deveria 401
  (alinhar com o front antes de mudar).
- [ ] **Dados falsos persistidos**: endereço/telefone default de SP no registro de lojista
  (`AuthContext.tsx:110-111`, `AuthService.cs:108-143,181`), `LojaService` aceita `0,0`.
  Exigir campos ou `undefined` + validação de CNPJ/e-mail.
- [ ] **Seed compromete a demo** (visível nos prints): ~12 cards “MotoPeças Expresso”
  idênticos, e-mails `lojista.17902...@...`, fotos trocadas (placa-mãe=bateria, SUV=óleo,
  carro=filtro, ilustração=pneu), imagens quebradas na garagem, quase tudo “Novo” sem foto.
  Curar `DatabaseSeeder` + `update_imagens.sql` (fotos reais/consistentes, lojas distintas).
- [ ] **“Carregar mais lojas” não pagina** — só recarrega a lista (`LojasPage.tsx:233-249`).
- [ ] **Paginação do estoque incoerente**: “1-10 de 10” com páginas 1-2-3 (`14-lojista-estoque.png`).
- [ ] **Mini-mapa da oferta é imagem estática** de mapa-múndi, não Leaflet (`07-oferta-detalhes.png`).
- [ ] **Foto da oferta ausente** (placeholder de engrenagem) para item com estoque.
- [ ] **Reserva/agendamento e rotas in-app não existem**: hoje é `wa.me` + link Google Maps.
  Ou remover do diagrama/protótipo ou criar entidade mínima de reserva.
- [ ] **Login social, “Lembrar-me”, “Esqueceu a senha”**: protótipo promete, código dá `alert`.
  Decidir (implementar ou remover do protótipo) e abrir issues.
- [ ] **Erros silenciados no front**: `catch(()=>[])` no lojista, `alert()` em login/avaliação/garagem
  (`LojistaPage.tsx:256-259`, `AvaliarLojaPage.tsx:57`, `GaragemPage.tsx:124,151`). Usar `ErrorState`.
- [ ] **Sem EF Migrations**: schema via SQL bruto no boot (`DatabaseInitializer.cs:31-41`),
  sem versionamento. Adotar migrations ou documentar a decisão (ADR).
- [ ] **Pesos do ranking (35/30/20/15) só existem no código** (`BuscaRecomendacaoService` + testes).
  Documentar fórmula fora do código.

## P2 — Qualidade, docs e processo

- [ ] **Frontend sem testes** (zero `*.test.*`). Começar com vitest em `api.ts/formatters.ts/RequireAuth`
  + script `typecheck`; gitignorar `dist/`.
- [ ] **Backend sem testes de integração/authZ** (só unitários puros, 21). Cobrir IDOR e controllers
  (WebApplicationFactory/Testcontainers).
- [ ] **`LojistaPage.tsx` monolito** (3200+ linhas, 7 abas) + `index.css` 1900 linhas + 683 inline styles.
  Quebrar em componentes/páginas por aba; extrair utils duplicados (`formatMoney` ×4,
  `parseHorarios` incompatíveis).
- [ ] **Validação declarativa**: DataAnnotations nos DTOs (hoje só `if` manual disperso).
- [ ] **Observabilidade**: Serilog/request logging, mapear `ApiResponse.Fail` para 401/404/422,
  transação em `RegisterLojistaAsync` e concorrência otimista nas métricas.
- [ ] **Sincronizar `TODO.md`** (§§14, 15, 19, 75, 184) com a realidade — hoje induz ao erro.
- [ ] **Alinhar PostGIS**: ou migra o DDL para `GEOGRAPHY+GiST` (cumpre README) ou corrige
  README/proposta para `DECIMAL+Haversine` + ADR.
- [ ] **Criar `docs/`**: SRS textual, dicionário de dados, `api.md` (export Swagger), LGPD/privacidade,
  plano de testes, ADR Haversine×PostGIS; substituir `frontend/.../README.md` (template Vite inútil).
- [ ] **Gestão**: atas, riscos, cronograma realizado×previsto em `Gerenciamento/`; fonte versionada do DER
  (`.dbml`); evidenciar RNF04 (5s em 4G) antes da defesa.
- [ ] **Repo**: remover `RadarPecas.slnx` duplicada (canônica = `.sln` com Tests); dar extensão ao
  `AnaliseProjeto/DER`; corrigir `rodar-radarpecas.bat` (espaço antes do `&&` injeta espaço na URL);
  evitar acentos/espaços em pastas/arquivos (quebra CI Linux e CLIs); `vite.config` sem proxy/CSP;
  warning chunk >500kB (code-split futuro).
- [ ] **Convenções**: seguir Conventional Commits + `resolves #N` + merge na `main` (padrão já usado nas PRs).
