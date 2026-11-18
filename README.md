# 🏍️ RadarPeças

> **Plataforma de Geolocalização e Recomendação Inteligente para o Varejo de Motopeças**  
> *Trabalho de Conclusão de Curso (TCC) — Bacharelado em Sistemas de Informação — Universidade Federal de Sergipe (UFS)*

---

## 📌 Sobre o Projeto

O **RadarPeças** é uma plataforma web desenvolvida para mitigar a assimetria de informações e a pulverização no varejo regional de reposição de motopeças. Integrando um modelo de **mercado de dois lados (two-sided market)**, a plataforma conecta **motociclistas/mecânicos** a **lojas físicas e oficinas**, permitindo a busca geolocalizada em tempo real por estoque imediato, comparação de preços, visualização de promoções e compatibilidade técnica automatizada.

### 🌟 Diferenciais e Funcionalidades Principais

- **Garagem Virtual (Filtragem Baseada em Conhecimento):** O motociclista cadastra suas motos (marca, modelo e ano). O sistema filtra automaticamente o catálogo para exibir somente peças tecnicamente compatíveis, eliminando compras incorretas.
- **Busca Geolocalizada e Mapa Interativo:** Utilizando PostgreSQL (`DECIMAL(10,8)` / `DECIMAL(11,8)` com índice B-tree + Bounding Box + Haversine SQL e índices GIN `pg_trgm`, conforme [ADR-001](./docs/adr/001-geolocalizacao-haversine-vs-postgis.md)), Leaflet e OpenStreetMap, a plataforma localiza lojas num raio configurável e exibe as ofertas mais próximas e bem avaliadas.
- **Painel Administrativo do Lojista (Mobile-First & Baixa Fricção):** Painel modularizado em 7 visões (`Resumo`, `Novo Produto`, `Estoque e Preços`, `Ofertas Ativas`, `Criar Nova Oferta`, `Mais Procurados`, `Perfil da Loja`), alteração inline de preço/estoque/promoção, wizard com pré-visualização e métricas reais de visualizações e cliques.
- **Avaliações e Autorregulação:** Sistema de notas e feedbacks da experiência na loja física.

---

## 🛠️ Stack Tecnológica

| Camada | Tecnologia / Ferramenta | Detalhes |
|---|---|---|
| **Back-end** | C# / ASP.NET Core (.NET 8) | Web API RESTful (`Domain`, `Application`, `Infrastructure`, `Api`), Rate Limiting, Serilog estruturado |
| **Banco de Dados** | PostgreSQL 14+ (Supabase em prod) | Coordenadas `DECIMAL` + Bounding Box/Haversine SQL, índices B-tree e GIN `pg_trgm`, `JSONB` |
| **ORM & Schema** | Entity Framework Core 8 + Npgsql | DDL canônico (`AnaliseProjeto/DB_radarPecas.sql`) aplicado via `DatabaseInitializer` idempotente ([ADR-002](./docs/adr/002-schema-sql-vs-ef-migrations.md)) |
| **Front-end & PWA** | React 19 + TypeScript 6 + Vite 8 | SPA/PWA responsiva (`vite-plugin-pwa`), Design System CSS, code splitting por rota/vendor |
| **Mapas & Geocoding** | Leaflet 1.9 + OpenStreetMap + Nominatim/Photon | Base cartográfica aberta com proxy de autocomplete no servidor (`/api/geocoding/sugestoes`) |
| **Autenticação** | JWT (HMAC-SHA256) + BCrypt | Stateless por perfis (`Motociclista`, `LOJISTA`), validação horizontal (anti-IDOR) e persistência transacional |
| **Testes** | xUnit + Moq + `WebApplicationFactory` · Vitest + Testing Library | 67 testes no back-end + 9 testes no front-end + auditoria Lighthouse CI (Slow 4G) |

---

## Arquitetura conceitual

A aplicação é dividida em front-end e back-end, comunicando-se por uma API REST (publicada via **Vercel** no front-end e **Docker/Render + PostgreSQL Supabase** no back-end).

```text
┌───────────────────────────────┐
│          React + TS           │
│        Vite / React Leaflet   │
└───────────────┬───────────────┘
                │ HTTP / JSON
                ▼
┌───────────────────────────────┐
│        ASP.NET Core .NET 8    │
│                               │
│ Controllers                   │
│ Services / Regras de negócio  │
│ Repositórios / Acesso a dados │
│ Geolocalização                 │
│ Compatibilidade / Ranking     │
└───────────────┬───────────────┘
                │ SQL
                ▼
┌───────────────────────────────┐
│      PostgreSQL 14+           │
│                               │
│ Usuários / Lojas              │
│ Garagem / Modelos              │
│ Peças / Compatibilidade       │
│ Estoque / Ofertas             │
│ Avaliações / Estatísticas     │
└───────────────────────────────┘
```

## Principais módulos

### Usuário
- Autenticação e gerenciamento de perfil.
- Gerenciamento da Garagem Virtual.
- Cadastro de modelo e ano da motocicleta.
- Pesquisa de peças.
- Visualização de ofertas.
- Visualização de lojas no mapa.
- Avaliação de lojas.

### Lojista
- Cadastro e gerenciamento da loja.
- Cadastro de produtos.
- Gerenciamento de estoque.
- Atualização de preços.
- Ativação/inativação de ofertas.
- Criação de promoções com validade.
- Visualização de indicadores e produtos mais procurados.

### Compatibilidade

A compatibilidade utiliza principalmente uma abordagem baseada em conhecimento: os atributos da motocicleta cadastrada são cruzados com uma tabela de compatibilidade entre peças e modelos de motocicleta.

Fluxo simplificado:

```text
Usuário
   │
   ▼
Garagem Virtual
   │
   ├── Modelo
   ├── Ano
   └── Cilindrada
          │
          ▼
Compatibilidade peça × moto
          │
          ▼
Ofertas compatíveis
          │
          ▼
Ranking por preço / distância /
disponibilidade / promoção
```

### Geolocalização

As lojas possuem coordenadas geográficas (`latitude`, `longitude`). Endereços são sugeridos e convertidos via proxy de geocoding no back-end (Nominatim / Photon), enquanto o PostgreSQL executa pré-filtro por *bounding box* sobre índice B-tree composto e calcula distâncias via Haversine SQL ([ADR-001](./docs/adr/001-geolocalizacao-haversine-vs-postgis.md)).

O front-end utiliza Leaflet para apresentar o mapa principal e o mini-mapa de localização das lojas.

## Modelo de dados

O modelo definido na proposta possui as 9 tabelas documentadas em [`AnaliseProjeto/DER.png`](./AnaliseProjeto/DER.png), [`AnaliseProjeto/DER.mmd`](./AnaliseProjeto/DER.mmd) e [`docs/dicionario-dados.md`](./docs/dicionario-dados.md):

- `usuarios`
- `lojas`
- `garagem_virtual`
- `modelos_moto`
- `pecas`
- `compatibilidade_peca_moto`
- `estoque_loja`
- `avaliacoes_loja`
- `estatisticas_oferta`

A tabela `estoque_loja` representa a relação entre catálogo e loja, armazenando informações variáveis como preço, quantidade disponível e períodos de promoção.


## 🏛️ Arquitetura do Banco de Dados

O banco de dados relacional é estruturado em cinco grupos centrais:

1. **Acesso e Perfis:** `usuarios` (motociclistas e lojistas) e `lojas` (dados cadastrais, contato, horários em `JSONB` e coordenadas geográficas `DECIMAL`).
2. **Catálogo e Compatibilidade:** `pecas` (SKU/EAN, categoria, imagem, especificações via `JSONB`), `modelos_moto` (marca, modelo, anos inicial e final) e a tabela associativa `compatibilidade_peca_moto`.
3. **Garagem Virtual:** `garagem_virtual` vinculando os usuários aos seus veículos cadastrados.
4. **Inventário e Ofertas:** `estoque_loja` (quantidade física, preço normal, flag de promoção, preço promocional e vigência de datas).
5. **Engajamento e Métricas:** `avaliacoes_loja` (notas e comentários) e `estatisticas_oferta` (cliques e visualizações incrementados atomicamente).

---

## 🚀 Como Executar o Projeto Localmente

### 📋 Pré-requisitos
- **.NET 8 SDK** (para compilar e rodar a API ASP.NET Core)
- **Node.js 20+ (LTS)** e **npm** (para o front-end React)
- **PostgreSQL 14+** (porta padrão: `5432`)

---

### ⚡ Execução Rápida (Windows)

Na raiz da pasta `Código`, execute o script utilitário batch:

```bat
cd Código
rodar-radarpecas.bat
```

Esse script verifica as dependências, valida a conexão com o PostgreSQL, instala os pacotes do front-end na primeira execução e sobe simultaneamente a API (.NET) e o front-end (Vite) em terminais dedicados.

---

### 🔧 Execução Manual

#### 1. Banco de Dados
Certifique-se de que o PostgreSQL está em execução na porta `5432` e crie o banco especificado no `appsettings.Development.json` (`radarPecas`, usuário padrão `postgres`):

```sql
CREATE DATABASE "radarPecas";
```

> **Nota:** Ao iniciar, a API executa automaticamente o script `AnaliseProjeto/DB_radarPecas.sql` e rotinas idempotentes de índices (`pg_trgm`) por meio do `DatabaseInitializer`, populando a base inicial com `DatabaseSeeder` caso o banco esteja vazio ([ADR-002](./docs/adr/002-schema-sql-vs-ef-migrations.md)).

#### 2. Back-end (ASP.NET Core .NET 8)
```bash
cd Código/backend
dotnet restore RadarPecas.sln
dotnet test RadarPecas.sln
dotnet run --project RadarPecas.Api --launch-profile http
```
- API Base: `http://localhost:5150`
- Swagger UI: `http://localhost:5150/swagger`
- Healthcheck: `http://localhost:5150/api/health`

#### 3. Front-end (React 19 + Vite 8)
```bash
cd Código/frontend/radarpecas-web
npm install
npm run typecheck
npm run lint
npm run test
npm run dev -- --port 5173
```
- Aplicação Web: `http://localhost:5173`
- Auditoria Lighthouse CI (rodar contra `npm run build` + `npm run preview` com a API local ativa): `npm run lighthouse`

---

## 📚 Documentação Técnica (`docs/`)

- [Especificação de Requisitos (SRS)](./docs/srs.md)
- [Dicionário de Dados](./docs/dicionario-dados.md) · [DER Visual](./AnaliseProjeto/DER.png) · [DER Editável (Mermaid)](./AnaliseProjeto/DER.mmd)
- [Documentação da API REST](./docs/api.md)
- [Ranking e Recomendação](./docs/ranking-busca.md)
- [Privacidade, Segurança e LGPD](./docs/lgpd.md)
- [Plano de Testes e Evidência RNF04](./docs/plano-de-testes.md)
- [ADR-001: Haversine/Bounding Box vs PostGIS](./docs/adr/001-geolocalizacao-haversine-vs-postgis.md)
- [ADR-002: DDL SQL + Inicializador Idempotente vs EF Migrations](./docs/adr/002-schema-sql-vs-ef-migrations.md)
- [Decisões de Produto](./docs/decisoes-produto.md)
- [Cronograma, Marcos e Riscos](./Gerenciamento/cronograma-e-riscos.md) · [Registro de Acompanhamento](./Gerenciamento/atas.md)

---

## 🔑 Contas de Teste (Carga Inicial do Seeder)

O banco é pré-carregado com usuários demonstrativos e dados reais de oficinas e peças para testes:

| Perfil | E-mail | Senha | Descrição |
|---|---|---|---|
| **Motociclista** | `motociclista@radarpecas.com.br` | `Moto#2026` | Lucas Oliveira (garagem com Honda CG 160 e Yamaha FZ25) |
| **Lojista (Itabaiana 1)** | `everton@itabaianamotos.com.br` | `Loja#2026` | Everton Lima — Itabaiana Motos Honda (Marianga, Itabaiana) |
| **Lojista (Itabaiana 2)** | `halley@halleymotopecas.com.br` | `Loja#2026` | Halley Santos — Halley Moto Peças (Marianga, Itabaiana) |
| **Lojista (Itabaiana 3)** | `osias@osiasmotopecas.com.br` | `Loja#2026` | Osias Mendonça — Osias Moto Peças (Bananeiras, Itabaiana) |
| **Lojista (Itabaiana 4)** | `marcos@joyamotopecas.com.br` | `Loja#2026` | Marcos Joya — Joya Moto Peças (Mamede Paes Mendonça, Itabaiana) |
| **Lojista (Itabaiana 5)** | `rafael@rafaelluzmotopecas.com.br` | `Loja#2026` | Rafael Luz — Motopeças Rafael Luz (Centro, Itabaiana) |
| **Lojista (Itabaiana 6)** | `luis@luismotopecas.com.br` | `Loja#2026` | Luís Fernando — Luís Moto Peças (Centro, Itabaiana) |
| **Lojista (Malhador)** | `marcelo@marcelomotopecas.com.br` | `Loja#2026` | Marcelo Santos — Marcelo Moto Peças (Centro, Malhador) |
| **Lojista (Ribeirópolis 1)** | `tadeu@tadeumotopecas.com.br` | `Loja#2026` | Tadeu Teixeira — Tadeu Moto Peças (Centro, Ribeirópolis) |
| **Lojista (Ribeirópolis 2)** | `marcos@marcossouzamotos.com.br` | `Loja#2026` | Marcos Souza — Motopeças Marcos Souza (Centro, Ribeirópolis) |
| **Lojista (Moita Bonita 1)** | `yuri@yurimotopecas.com.br` | `Loja#2026` | Yuri Santana — Yuri Moto Peças (Centro, Moita Bonita) |
| **Lojista (Moita Bonita 2)** | `nene@nenemotopecas.com.br` | `Loja#2026` | José Carlos Nenê — Nenê Moto Peças (Centro, Moita Bonita) |
| **Lojista (Campo do Brito 1)** | `britense@britensemotopecas.com.br` | `Loja#2026` | Claudemir Britense — Moto Peças Britense (Centro, Campo do Brito) |
| **Lojista (Campo do Brito 2)** | `victor@victorsantosmotos.com.br` | `Loja#2026` | Victor Santos — Oficina & Peças Victor Santos (Centro, Campo do Brito) |
| **Lojista (Lagarto 1)** | `geraldo@geralmotopecas.com.br` | `Loja#2026` | Geraldo Andrade — Geral Moto Peças (Centro, Lagarto) |
| **Lojista (Lagarto 2)** | `neto@netomotos.com.br` | `Loja#2026` | José Neto — Neto Motos (Novo Horizonte, Lagarto) |
| **Lojista (Lagarto 3)** | `marcio@pimentinhamotopecas.com.br` | `Loja#2026` | Márcio Pimentinha — Pimentinha Moto Peças (Centro, Lagarto) |
| **Lojista (Aracaju 1)** | `lojista@gmail.com` | `Loja#2026` | Carlos Alberto — Radar Motos & Peças Central (Centro, Aracaju) |
| **Lojista (Aracaju 2)** | `mariana@gmail.com` | `Loja#2026` | Mariana Costa — MotoPower Peças & Oficina (Siqueira Campos, Aracaju) |
| **Lojista (Aracaju 3)** | `jorge@jcmotos.com.br` | `Loja#2026` | Jorge Cavalcante — J&C Motos e Peças (Siqueira Campos, Aracaju) |
| **Lojista (Aracaju 4)** | `gilvan@ciclomotosaju.com.br` | `Loja#2026` | Gilvan Matos — Ciclo Motos Peças (Siqueira Campos, Aracaju) |

---

## 🗄️ Scripts do Banco de Dados (`AnaliseProjeto/`)

- **`DB_radarPecas.sql`**: Script DDL oficial com a definição das 9 tabelas, extensões (`pgcrypto`, `pg_trgm`), índices B-tree/GIN e constraints. É o arquivo consumido pelo `DatabaseInitializer.cs` no primeiro boot.
- **`dump_radarPecas.sql`**: Snapshot/backup completo gerado via `pg_dump` contendo o schema e carga de registros para restauração manual via `psql`, DBeaver ou pgAdmin.
- **`DER.png` / `DER.mmd`**: Diagrama Entidade-Relacionamento visual e sua fonte versionada em Mermaid.
