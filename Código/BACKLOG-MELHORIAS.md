# BACKLOG-MELHORIAS — RadarPeças

Levantamento de fraquezas, faltas e ajustes encontrados na análise completa
(código + docs + run com screenshots 16:9 em `Requisitos/Capturas/`).
Arquivo LOCAL — não commitar. Data-base: 2026-09-27, `main` @ `6e18671`.

Legenda: **P0** = crítico/segurança · **P1** = funcional/dados · **P2** = qualidade/docs/processo.
Marque `[x]` ao concluir.

## P0 — Segurança (resolvido na branch `26-seguranca-end-to-end`, issue #26)

- [x] **IDOR do lojista**: ownership check + 403 (verificado: cross-PUT, cross-dashboard e cross-estoque → 403; dono → 200).
- [x] **Segredos commitados**: fallbacks removidos (fail-fast), JWT rotacionado (só em `appsettings.Development.json`), `.env.example` com placeholder.
- [x] **XSS via Leaflet**: `escapeHtml` na Home; `noopener/noreferrer` na oferta. (cookie httpOnly: futuro)
- [x] **Guard de papel**: `RequireLojista` em `/lojista` (motociclista é redirecionado p/ `/`).
- [x] **Throttle + métricas**: RateLimiter (`busca` 60/min, `metricas` 120/min), upsert atômico, `await` na visualização, `limite` do geocoding clampado.
- [x] **CORS/HSTS**: fail-closed sem origens; `RequireHttpsMetadata` fora de Development.
- [x] **Senha/e-mail**: política 8+letra+número (`SegurancaValidacao` + 15 testes), `MailAddress`, fim dos defaults falsos no cadastro, seed com senhas fortes.

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
