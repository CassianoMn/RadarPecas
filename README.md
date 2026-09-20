# 🏍️ RadarPeças

> **Plataforma de Geolocalização e Recomendação Inteligente para o Varejo de Motopeças**  
> *Trabalho de Conclusão de Curso (TCC) — Bacharelado em Sistemas de Informação — Universidade Federal de Sergipe (UFS)*

---

## 📌 Sobre o Projeto

O **RadarPeças** é uma plataforma web desenvolvida para mitigar a assimetria de informações e a pulverização no varejo regional de reposição de motopeças. Integrando um modelo de **mercado de dois lados (two-sided market)**, a plataforma conecta **motociclistas/mecânicos** a **lojas físicas e oficinas**, permitindo a busca geolocalizada em tempo real por estoque imediato, comparação de preços, visualização de promoções e compatibilidade técnica automatizada.

### 🌟 Diferenciais e Funcionalidades Principais

- **Garagem Virtual (Filtragem Baseada em Conhecimento):** O motociclista cadastra suas motos (marca, modelo, ano, cilindrada). O sistema filtra automaticamente o catálogo para exibir somente peças tecnicamente compatíveis, eliminando compras incorretas.
- **Busca Geolocalizada e Mapa Interativo:** Utilizando PostGIS, Leaflet e OpenStreetMap, a plataforma localiza lojas num raio configurável e plota as ofertas mais próximas em tempo real.
- **Painel Administrativo do Lojista (Mobile-First & Baixa Fricção):** Gestão simplificada de catálogo, estoque, alteração dinâmica de preços, cadastro de promoções relâmpago e visualização de métricas (peças mais buscadas e visualizações).
- **Avaliações e Autorregulação:** Sistema de notas e feedbacks da experiência na loja física.

---

## 🛠️ Stack Tecnológica

| Camada | Tecnologia / Ferramenta | Detalhes |
|---|---|---|
| **Back-end** | C# / ASP.NET Core (.NET 8) | Web API RESTful, Injeção de Dependências, Arquitetura Limpa/Modular |
| **Banco de Dados** | PostgreSQL + PostGIS | Tipos geométricos/geográficos, indexação espacial (GiST), JSONB para especificações de peças |
| **ORM / Migrations** | Entity Framework Core / Npgsql | Mapeamento relacional e suporte a dados geoespaciais (`NetTopologySuite`) |
| **Front-end** | React 19 + TypeScript + Vite | SPA responsiva (Mobile-First), Vanilla CSS com Design System personalizado |
| **Mapas & Geocoding** | Leaflet.js / React-Leaflet + OpenStreetMap + Nominatim | Base cartográfica aberta e geocodificação de endereços |
| **Autenticação** | JWT (JSON Web Token) + BCrypt / ASP.NET Identity | Autenticação stateless baseada em perfis (`Motociclista`, `Lojista`) |

---

## Arquitetura conceitual

A aplicação é dividida em front-end e back-end, comunicando-se por uma API REST.

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
│      PostgreSQL + PostGIS     │
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

As lojas possuem coordenadas geográficas. Endereços podem ser convertidos em latitude e longitude por meio do Nominatim, enquanto o PostGIS é responsável pelo armazenamento e pelas consultas espaciais.

O front-end utiliza Leaflet/React Leaflet para apresentar o mapa e os marcadores das lojas.

## Modelo de dados

O modelo definido na proposta possui, entre outras, as seguintes estruturas:

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

O banco de dados relacional e espacial é estruturado em quatro módulos centrais:

1. **Acesso e Perfis:** `usuarios` (motociclistas e lojistas) e `lojas` (dados cadastrais, contato, horário e coordenadas geográficas `GEOMETRY(Point, 4326)`).
2. **Catálogo e Compatibilidade:** `pecas` (código EAN, categoria, especificações via JSONB), `modelos_moto` (marca, modelo, cilindrada, anos inicial e final) e a tabela associativa `compatibilidade_peca_moto`.
3. **Garagem Virtual:** `garagem_virtual` vinculando os usuários aos seus veículos cadastrados.
4. **Inventário e Ofertas:** `estoque_loja` (quantidade física, preço normal, flag de promoção, preço promocional e vigência de datas).
5. **Engajamento e Métricas:** `avaliacoes_loja` (notas e comentários) e `estatisticas_oferta` (cliques e visualizações).

---

## 🚀 Como Executar o Projeto Localmente

### 📋 Pré-requisitos
- **.NET 8 SDK** (para compilar e rodar a API ASP.NET Core)
- **Node.js 18+ (LTS)** e **npm** (para o front-end React)
- **PostgreSQL 14+** com extensão **PostGIS** habilitada (porta padrão: `5432`)

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
Certifique-se de que o PostgreSQL está em execução na porta `5432` e crie o banco especificado no `appsettings.Development.json` (por exemplo, `radarpecas_db` ou `radarPecas`):

```sql
CREATE DATABASE "radarpecas_db";
\c "radarpecas_db";
CREATE EXTENSION IF NOT EXISTS postgis;
```

> **Nota:** Ao iniciar, a API executa automaticamente o script `AnaliseProjeto/DB_radarPecas.sql` por meio do `DatabaseInitializer` e popula a base com o `DatabaseSeeder`, caso a base esteja vazia.

#### 2. Back-end (ASP.NET Core .NET 8)
```bash
cd Código/backend
dotnet restore
dotnet run --project RadarPecas.Api --launch-profile http
```
- API Base: `http://localhost:5150`
- Swagger UI: `http://localhost:5150/swagger`
- Healthcheck: `http://localhost:5150/api/health`

#### 3. Front-end (React 19 + Vite)
```bash
cd Código/frontend/radarpecas-web
npm install
npm run dev -- --port 5173
```
- Aplicação Web: `http://localhost:5173`

---

## 🔑 Contas de Teste (Carga Inicial do Seeder)

O banco é pré-carregado com usuários demonstrativos e dados reais de oficinas e peças para testes:

| Perfil | E-mail | Senha | Descrição |
|---|---|---|---|
| **Motociclista** | `motociclista@radarpecas.com.br` | `123456` | Lucas Oliveira (garagem com Honda CG 160 e Yamaha FZ25) |
| **Lojista 1** | `lojista@gmail.com` | `123456` | Carlos Alberto — Radar Motos & Peças Central (Centro Aracaju) |
| **Lojista 2** | `mariana@gmail.com` | `123456` | Mariana Costa — MotoPower Peças & Oficina (Siqueira Campos) |

---

## 🗄️ Scripts do Banco de Dados (`AnaliseProjeto/`)

- **`DB_radarPecas.sql`**: Script DDL oficial com a definição das tabelas, tipos geométricos PostGIS, índices e constraints. É o arquivo consumido pelo `DatabaseInitializer.cs` para criar o banco de forma transparente no primeiro boot.
- **`dump_radarPecas.sql`**: Snapshot/backup completo gerado via `pg_dump` contendo o schema e uma carga estática de registros. É útil para restauração direta manual em bancos externos via `psql` ou ferramentas visuais (DBeaver, pgAdmin) sem passar pelo inicializador .NET.
