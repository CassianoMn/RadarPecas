# ADR-001: Geolocalização — DECIMAL + Bounding Box + Haversine SQL vs. PostGIS

- **Status:** Aceito (2026-11-16)
- **Contexto:** Issue #27 — alinhamento entre a documentação inicial (que citava PostgreSQL + PostGIS) e a implementação real do banco (`AnaliseProjeto/DB_radarPecas.sql`), garantindo escalabilidade da busca por raio sem risco de OOM nem falha de deploy em provedores gerenciados.

## Contexto e Problema

O schema canônico (`DB_radarPecas.sql`) modela coordenadas das lojas como `latitude DECIMAL(10, 8)` e `longitude DECIMAL(11, 8)`, sem extensão PostGIS nem `NetTopologySuite` no backend. Na versão anterior, `BuscaRecomendacaoService` e `LojaService` carregavam todas as ofertas/lojas ativas para a memória e aplicavam Haversine em C#, causando risco de esgotamento de memória (`OOM`) com crescimento da base.

## Opções Consideradas

1. **Migrar `lojas` para `GEOGRAPHY(Point, 4326)` + índice `GiST` + `NetTopologySuite`:**
   - Prós: suporte nativo a operações espaciais complexas (`ST_DWithin`, polígonos).
   - Contras: exige extensão `postgis` habilitada no PostgreSQL de produção (nem sempre disponível em instâncias gratuitas/gerenciadas como Render sem imagem customizada), quebra scripts SQL/dump existentes e aumenta acoplamento no `Infrastructure`/`Domain`.
2. **Manter `DECIMAL(10, 8)` / `DECIMAL(11, 8)` com índice B-tree composto `(ativa, latitude, longitude)` + Bounding Box + Haversine traduzido em SQL:**
   - Prós: funciona em qualquer PostgreSQL 14+ padrão sem extensões privilegiadas; mantém compatibilidade com `DB_radarPecas.sql`, `dump_radarPecas.sql` e testes unitários; filtra por retângulo envolvente (*bounding box*) usando o índice B-tree antes de avaliar Haversine no próprio banco (`COUNT`, `ORDER BY`, `SKIP`, `TAKE`).
   - Contras: menor flexibilidade caso o produto evolua no futuro para consultas poligonais ou rotas geográficas complexas dentro do banco.

## Decisão

Adotar a **Opção 2** para o escopo atual do RadarPeças:

1. Índice composto `idx_lojas_ativa_coords ON lojas (ativa, latitude, longitude)` aplicado no `DB_radarPecas.sql` e garantido pelo `DatabaseInitializer`.
2. Pré-filtro por *bounding box* calculado em `GeolocationService.CalcularBoundingBox` para eliminar lojas fora do raio ainda no índice B-tree.
3. Cálculo Haversine traduzido pelo EF Core/Npgsql diretamente para funções trigonométricas SQL (`sin`, `cos`, `asin`, `sqrt`), permitindo filtrar `RaioKm`, ordenar por distância e paginar (`Skip`/`Take`) integralmente no banco de dados.

## Consequências

- A API não carrega mais a tabela completa de ofertas/lojas em memória.
- O deploy em Docker/Render com PostgreSQL padrão permanece 100% plug-and-play.
- Caso o projeto escale para múltiplas regiões com buscas espaciais avançadas (polígonos de entrega, clustering server-side), a migração futura para `PostGIS + NetTopologySuite` continua possível de forma isolada atrás de `IGeolocationService`.
