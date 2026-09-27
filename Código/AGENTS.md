# AGENTS.md — RadarPeças

Guia do projeto para agentes (e humanos). Lido antes de qualquer tarefa.
Última atualização: 2026-09-27. Branch principal: `main`. Remoto: `https://github.com/CassianoMn/RadarPecas.git`.
Detalhe de problemas e melhorias: ver `BACKLOG-MELHORIAS.md` (arquivo irmão, local).

## 1. O que é o projeto

Marketplace de dois lados (**two-sided market**) que conecta **motociclistas/mecânicos** a
**lojas físicas e oficinas** para busca geolocalizada de motopeças em estoque, comparação de
preços, promoções e compatibilidade técnica automática. TCC (Sistemas de Informação — UFS) de
Cassiano Menezes e Luiz Augusto. Foco narrativo: Itabaiana/SE; dados de seed: Aracaju/SE e São Paulo/SP.
Fundamento teórico: assimetria de informação (Akerlof) + mercados de dois lados (Rochet/Tirole).

### Personas e proposta de valor
- **Motociclista/mecânico**: acha a peça certa (compatível com sua moto), perto, com preço
  comparável — em vez de peregrinar por lojas e WhatsApp.
- **Lojista (loja física/oficina)**: publica catálogo e estoque uma vez e aparece no “radar”
  de quem está por perto, com promoções relâmpago e métricas do que é mais buscado na região.

### Conceitos centrais
- **Garagem Virtual**: o motociclista cadastra motos (marca/modelo/ano + apelido + foto);
  uma delas é a “ativa” e vira contexto da busca — o sistema só mostra peças compatíveis.
- **Busca geo + ranking**: ofertas ordenadas por preço, distância, disponibilidade e promoção,
  com filtros de categoria, marca, preço máximo, distância e “apenas promoções”.
- **Painel do Lojista**: 7 telas (resumo, novo produto, estoque, ofertas, criar oferta,
  mais procurados, perfil) para gerir catálogo, preços, promoções e ver métricas.
- **Avaliações**: nota 1–5 + comentário + “recomenda?” por loja (autorregulação do marketplace).

### Fluxos principais (end-to-end)
1. **Descoberta (motociclista anônimo)**: Home com mapa Leaflet/OSM + lojas próximas →
   Explorar Ofertas (`/busca`) com filtros → Detalhe da oferta (preço, specs, compatibilidade,
   loja) → “Reservar na Loja Física” (abre `wa.me`) / “Ir até a Loja” (abre Google Maps).
2. **Compra compatível (motociclista logado)**: cadastra moto na Garagem → marca como ativa →
   busca passa a filtrar por compatibilidade peça×moto → avalia a loja após a visita.
3. **Gestão (lojista)**: registra loja no cadastro → publica produtos (nome, categoria, marca,
   SKU, descrição, foto, compatibilidade com modelos, estoque, preço) → cria ofertas
   (desconto %, preço promocional, vigência, destaque no mapa) → acompanha buscas, views,
   cliques e ranking regional → ajusta preço/estoque na Gestão Rápida.

## 2. Mapa do repositório

```
RadarPeças/
├── README.md                    # visão, stack, arquitetura conceitual, como rodar, contas de teste
├── Código/
│   ├── backend/                 # .NET 8 — solução canônica: RadarPecas.sln (5 projetos)
│   │   ├── RadarPecas.Api/          # Controllers, Program.cs, Middlewares, Models, appsettings.*
│   │   ├── RadarPecas.Application/  # DTOs/, Interfaces/, Services/ (regras de negócio)
│   │   ├── RadarPecas.Domain/       # Entities/, Enums/
│   │   ├── RadarPecas.Infrastructure/ # Data/ (DbContext, Initializer, Seeder), Services/
│   │   └── RadarPecas.Tests/        # 5 suites xUnit, 21 testes
│   ├── frontend/radarpecas-web/ # React 19 + TS + Vite 8
│   │   └── src/                     # App.tsx, main.tsx, index.css, pages/, components/,
│   │                                # auth/, context/, routes/, lib/, types/, assets/
│   ├── .env.example             # modelo de variáveis (banco, JWT, URL da API)
│   ├── rodar-radarpecas.bat     # sobe API :5150 + Vite :5173 no Windows
│   └── TODO.md                  # backlog interno (atenção: trechos desatualizados)
├── AnaliseProjeto/              # DB_radarPecas.sql (DDL canônico), dump_radarPecas.sql,
│                                # update_imagens.sql, DER (imagem do modelo)
├── Requisitos/                  # Casos de Uso PNG, Protótipos de Alto Nível (17 telas:
│                                # 8 fluxo usuário + 8 fluxo lojista + login), Capturas/
│                                # (19 screenshots 1600×900 do app rodando — referência visual)
├── Gerenciamento/               # Proposta de TCC em PDF (visão, objetivos, metodologia, cronograma)
└── AGENTS.md / BACKLOG-MELHORIAS.md (guias locais, não commitar)
```

Notas de navegação: a pasta `Código/` tem acento; `RadarPecas.slnx` é uma solução alternativa
(só 4 projetos, sem Tests) — a canônica é a `.sln`. O `Infrastructure.csproj` importa o DDL via
`Link` (`DbScripts/DB_radarPecas.sql` ← `AnaliseProjeto/DB_radarPecas.sql`); não mover pastas sem
ajustar. `AnaliseProjeto/DER` é a imagem do modelo de dados (sem extensão no nome).

### Stack (versões pinadas)

| Camada | Tecnologia |
|---|---|
| Backend | .NET 8, ASP.NET Core (controllers), EF Core 8.0.11 + Npgsql + EFCore.NamingConventions, JWT Bearer + BCrypt.Net-Next, Swashbuckle 6.6.2 |
| Banco | PostgreSQL 14+ (coordenadas `DECIMAL lat/lon` + Haversine em C#; Nominatim/Photon p/ geocoding) |
| Frontend | React 19.2 + TS + Vite 8.2 + React Router 7, Leaflet 1.9 + OSM, lucide-react, CSS vanilla (sem Tailwind, sem axios/store/query lib) |
| Testes | xUnit + Moq + coverlet (backend); frontend sem suite |

## 3. Backend — como é organizado

Estilo: camadas simplificadas. `Api` chama `Application` (Services via Interfaces);
`Infrastructure` implementa persistência e serviços externos; `Domain` só tem entidades e enums.
Controllers finos (HTTP + auth), regra de negócio nos Services. Sem Repository/UoW, MediatR,
AutoMapper ou FluentValidation — validação é manual nos Services e DTOs não usam DataAnnotations.

### Pipeline (`RadarPecas.Api/Program.cs`)
`appsettings` + `DATABASE_URL` → EF Npgsql (snake_case) → DI dos 12 services + `IApplicationDbContext`
→ JWT Bearer → CORS (5173/3000) → `GlobalExceptionMiddleware` → `DatabaseInitializer` (cria schema
via SQL + seed se vazio) → Swagger (só Development) → `GET /api/health` (pública).

### Auth
JWT HMAC-SHA256, 24h, `ClockSkew` zero; claims `NameIdentifier/Email/Name/Role/tipo_usuario/loja_id/nome_loja`.
Senha com BCrypt (work factor 11). Perfis: `Motociclista` e `LOJISTA`. Respostas no envelope
`ApiResponse<T> {success, message, data, errors}`.

### Controllers × Services (base `http://localhost:5150/api`)

| Controller | Responsabilidade | Rotas principais |
|---|---|---|
| `AuthController` → `AuthService`, `JwtTokenService` | login, registro 2 perfis, me/profile | `POST /auth/login`, `POST /auth/register-motociclista`, `POST /auth/register-lojista`, `GET /auth/me`, `PUT /auth/profile` |
| `LojasController` → `LojaService`, `AvaliacaoService` | CRUD loja, dashboard do lojista, avaliações | `GET /lojas`, `GET /lojas/{id}`, `GET /lojas/minha-loja`, `PUT /lojas/{id}`, `GET /lojas/{id}/estoque`, `GET /lojas/{id}/avaliacoes`, `POST /lojas/{id}/avaliacoes`, `GET /lojas/{id}/dashboard` |
| `EstoqueController` → `EstoqueService` | itens de estoque da loja (preço, qtd, promo) | `GET /estoque/{id}` + CRUD (LOJISTA) |
| `PecasController` → `PecaService`, `CompatibilidadeService` | catálogo global + compatibilidades | `GET /pecas`, `GET /pecas/categorias`, `GET /pecas/{id}`, `POST /pecas/{id}/compatibilidades` |
| `OfertasController` → `EstatisticaService` | detalhe da oferta + contadores | `GET /ofertas/{estoqueId}`, `POST /ofertas/{id}/visualizacao`, `POST /ofertas/{id}/clique` |
| `BuscaController` → `BuscaRecomendacaoService` | busca com filtros + ranking + paginação | `GET /busca` |
| `GaragemController` → `GaragemService` | motos do usuário (auth) | `GET /garagem`, CRUD `/garagem/{id}` |
| `ModelosMotoController` → `ModeloMotoService` | marcas/modelos/anos (base do cadastro) | `GET /modelos-moto/marcas`, `GET /modelos-moto/{id}` |
| `GeocodingController` → `NominatimGeocodingService` | autocomplete de endereços (proxy) | `GET /geocoding/sugestoes` |

DTOs espelham isso em `Application/DTOs/`: `Auth/`, `Lojas/`, `Estoque/`, `Pecas/`,
`Busca/`, `Garagem/`, `Avaliacoes/`, `Geocoding/`, `Common/` (`ApiResponse`, `PagedResult`).

### Modelo de dados (9 tabelas)

`usuarios` (1:N) `lojas`, `garagem_virtual`; `modelos_moto` (N:N via `compatibilidade_peca_moto`)
`pecas`; `lojas` (1:N) `estoque_loja` → `pecas`; `lojas` (1:N) `avaliacoes_loja`;
`estoque_loja` (1:N) `estatisticas_oferta`. Índices únicos em e-mail, CNPJ, SKU/EAN; UUIDs via `pgcrypto`.
Geolocalização: `lojas.latitude/longitude DECIMAL` + `GeolocationService` (Haversine).

### Seed e contas de teste
- Motociclista `motociclista@radarpecas.com.br` / `123456` (Lucas Oliveira; garagem: Honda CG 160 + Yamaha FZ25)
- Lojista `lojista@gmail.com` / `123456` (Carlos Alberto — Radar Motos & Peças Central)
- Lojista `mariana@gmail.com` / `123456` (Mariana Costa)
- IDs úteis p/ teste manual: loja com estoque `370bfb3d-4ee2-4308-bc91-b05fba2ab7f2`,
  oferta `bed7cc2f-5d7b-4b3c-b84b-a2e73a335423`.

## 4. Frontend — como é organizado

SPA (`main.tsx` → `App.tsx` → `Layout` → `Routes`). Sem axios/store/query lib: `fetch`
centralizado em `src/lib/api.ts` (lê o envelope, lança `ApiError`, injeta `Bearer` do
`localStorage` chave `radarpecas:token`, base em `VITE_API_BASE_URL` com fallback
`http://localhost:5150/api`). Estado só com Context: `AuthContext` (usuário, login, registro,
`refreshUser`, logout) + `ActiveMotoContext` (moto ativa, escopada por `userId` no storage).
Guarda de rota: `routes/RequireAuth.tsx`. Utilidades: `lib/formatters.ts` (moeda, horários),
`lib/location.ts` (coords guardadas), `types/index.ts` (Loja, Peca, EstoqueItem, etc.).
Design system próprio em CSS vanilla (`index.css`, variáveis `:root` + classes `.card/.btn/.chip/…`)
mais ~683 estilos inline; componentes base em `components/ui.tsx` (Button, Field, TextInput,
InputWithIcon, Chip, Card, Loading/EmptyState/ErrorState, ícones e `RadarLogo`).

### Páginas (13)

| Rota | Página | O que faz |
|---|---|---|
| `/` | `HomePage` | mapa Leaflet/OSM + busca de localização (autocomplete via backend) + sidebar de lojas próximas + chips de categoria |
| `/login` | `LoginPage` | e-mail/senha, lembrar-me (visual), social (visual), redireciona LOJISTA→`/lojista` |
| `/cadastro` | `CadastroPage` | abas Sou Motociclista / Tenho uma Loja, confirmação de senha |
| `/busca` | `BuscaPage` | Explorar Ofertas: filtros (promoções, categoria, marca, preço máx, distância, GPS), ordenação, “garagem ativa”, paginação “carregar mais” |
| `/lojas` | `LojasPage` | Catálogo: pills “Mais Próximas”/“Melhor Avaliação”, cards com badge, “Ver Estoque” |
| `/lojas/:id` | `LojaDetalhesPage` | contato/horários, abas Estoque/Avaliações, busca no estoque, “Ver Oferta” |
| `/ofertas/:id` | `OfertaDetalhesPage` | preço/parcelas, specs + compatibilidade, “Reservar na Loja Física” (`wa.me`), “Ir até a Loja” (Maps), mini-mapa |
| `/garagem` | `GaragemPage` | motos do usuário (ativa com badge), peças recomendadas p/ moto ativa, editar/excluir |
| `/garagem/adicionar` | `AdicionarMotoPage` | marca→modelo→ano encadeados (via `/modelos-moto`), apelido, foto por upload ou URL |
| `/lojas/:id/avaliar` | `AvaliarLojaPage` | estrelas 1–5, comentário, Sim/Não recomendar |
| `/perfil` | `PerfilPage` | dados pessoais, troca de senha, resumo da garagem, sair |
| `/lojista` | `LojistaPage` | painel em 7 abas por estado local (abaixo) |
| `*` | `NotFoundPage` | “Página não encontrada” + voltar |

### Painel do Lojista (`/lojista`, 1 rota + 7 abas em estado)
Sidebar: Resumo, Estoque e Preços, Ofertas Ativas, Mais Procurados, Perfil da Loja
(+ sub-telas Novo Produto e Criar Nova Oferta via botões).
- **resumo**: 4 KPIs (produtos, baixo estoque, buscas 24h, ofertas) + Gestão Rápida (edita
  estoque/preço/promo inline) + “Em Alta no Radar” regional.
- **novo-produto**: form (nome, categoria ou nova, marca, SKU, descrição, foto upload,
  qtd/alerta/preço/promo, compatibilidade com modelos) → “Salvar e Publicar no Radar”.
- **estoque**: tabela com busca/filtros, Exportar CSV, paginação.
- **ofertas**: KPIs (em oferta, views, cliques WhatsApp/rota, expirando) + cards com
  desconto, vigência, métricas, editar/excluir.
- **criar-oferta**: wizard 3 passos (produto → desconto/preço com economia calculada →
  vigência + destaque no mapa) com **pré-visualização ao vivo**.
- **mais-procurados**: ranking regional (buscas, moto top, horário de pico, sem estoque)
  com ação direta (“Criar Oferta” / “Cadastrar Peça”).
- **perfil**: dados públicos, horários dia a dia, “Aberto Agora”, galeria de fotos.

## 5. Testes e scripts
- Backend: `dotnet test RadarPecas.sln` → 21/21 (unitários de lógica pura: auth, ranking,
  compatibilidade, promoção, geolocalização). Build: `dotnet run --project RadarPecas.Api`.
- Frontend: `npm run dev -- --port 5173 --strictPort` · `npm run build` (`tsc -b && vite build`,
  warning de chunk >500kB é pré-existente) · `npm run lint` (eslint) · `npm run format` (prettier).
- Banco: sobe via `DatabaseInitializer` no boot; `AnaliseProjeto/dump_radarPecas.sql` permite
  restauração manual; `update_imagens.sql` ajusta fotos do seed.

## 6. Convenções de git
Conventional Commits (`feat/fix/docs/chore`), PR por issue (`resolves #N`), merge commit na
`main`, branches por issue (`22-corrigir-tela-de-...`). Nunca commitar `bin/obj/node_modules/dist/.env`.
`AGENTS.md` e `BACKLOG-MELHORIAS.md` são locais: não commitar.

## 7. Como rodar (modo visível)
1. PostgreSQL em `localhost:5432` com database `radarPecas` (postgres/123456).
2.
...[truncated 1791 chars]