# Dicionário de Dados — RadarPeças

Fonte canônica: [`AnaliseProjeto/DB_radarPecas.sql`](../AnaliseProjeto/DB_radarPecas.sql)  
Diagramas vinculados: [`AnaliseProjeto/DER.png`](../AnaliseProjeto/DER.png) e [`AnaliseProjeto/DER.mmd`](../AnaliseProjeto/DER.mmd)  
Decisão arquitetural: PostgreSQL 14+ com extensões `pgcrypto` (UUID) e `pg_trgm` (índices GIN textuais), conforme [ADR-001](./adr/001-geolocalizacao-haversine-vs-postgis.md) e [ADR-002](./adr/002-schema-sql-vs-ef-migrations.md).

---

## 1. `usuarios`
Armazena as credenciais e o perfil de acesso dos utilizadores da plataforma (motociclistas e lojistas).

| Coluna | Tipo SQL | Restrições / Default | Descrição |
|---|---|---|---|
| `id` | `UUID` | `PRIMARY KEY DEFAULT gen_random_uuid()` | Identificador único do usuário. |
| `nome` | `VARCHAR(100)` | `NOT NULL` | Nome completo ou nome do responsável pela loja. |
| `email` | `VARCHAR(150)` | `UNIQUE NOT NULL` | E-mail de login (normalizado em minúsculas). |
| `senha_hash` | `VARCHAR(255)` | `NOT NULL` | Hash BCrypt da senha (`work factor 11`). |
| `tipo_usuario` | `VARCHAR(20)` | `CHECK (tipo_usuario IN ('MOTOCICLISTA', 'LOJISTA'))` | Papel de autorização no sistema. |
| `data_cadastro` | `TIMESTAMP` | `DEFAULT CURRENT_TIMESTAMP` | Data/hora UTC de criação da conta. |

---

## 2. `lojas`
Representa os estabelecimentos físicos/oficinas parceiros vinculados a um usuário `LOJISTA`.

| Coluna | Tipo SQL | Restrições / Default | Descrição |
|---|---|---|---|
| `id` | `UUID` | `PRIMARY KEY DEFAULT gen_random_uuid()` | Identificador único da loja. |
| `usuario_id` | `UUID` | `REFERENCES usuarios(id) ON DELETE CASCADE` | Proprietário responsável pela loja. |
| `nome_fantasia` | `VARCHAR(150)` | `NOT NULL` | Nome comercial exibido no mapa e catálogo. |
| `cnpj` | `VARCHAR(18)` | `UNIQUE` | CNPJ opcional validado pelos dígitos verificadores. |
| `endereco_completo` | `TEXT` | `NOT NULL` | Endereço textual completo da loja física. |
| `latitude` | `DECIMAL(10, 8)` | `NOT NULL` | Coordenada geográfica de latitude (WGS84). |
| `longitude` | `DECIMAL(11, 8)` | `NOT NULL` | Coordenada geográfica de longitude (WGS84). |
| `telefone_contato` | `VARCHAR(20)` | `NULL` | Telefone / WhatsApp utilizado na reserva física. |
| `email_contato` | `VARCHAR(150)` | `NULL` | E-mail comercial de atendimento. |
| `horarios_funcionamento` | `JSONB` | `NULL` | Estrutura de horários por dia ou resumo (`[{dia, abre, fecha, fechado}]`). |
| `foto_perfil_url` | `TEXT` | `NULL` | URL ou Data URI da imagem de perfil da loja. |
| `galeria_fotos_urls` | `TEXT[]` | `NULL` | Lista de URLs da galeria da loja. |
| `ativa` | `BOOLEAN` | `DEFAULT TRUE` | Indica se a loja está visível nas buscas públicas. |

---

## 3. `modelos_moto`
Catálogo base de marcas, modelos e faixa de anos de fabricação das motocicletas.

| Coluna | Tipo SQL | Restrições / Default | Descrição |
|---|---|---|---|
| `id` | `SERIAL` | `PRIMARY KEY` | Identificador sequencial do modelo. |
| `marca` | `VARCHAR(50)` | `NOT NULL` | Fabricante (ex.: Honda, Yamaha, Suzuki). |
| `modelo` | `VARCHAR(100)` | `NOT NULL` | Nome do modelo (ex.: CG 160 Titan, Fazer FZ25). |
| `ano_inicio` | `INTEGER` | `NULL` | Primeiro ano compatível de produção do modelo. |
| `ano_fim` | `INTEGER` | `NULL` | Último ano compatível de produção (ou `NULL` se ativo). |

---

## 4. `garagem_virtual`
Motocicletas cadastradas pelo usuário para contextualizar a busca por compatibilidade.

| Coluna | Tipo SQL | Restrições / Default | Descrição |
|---|---|---|---|
| `id` | `UUID` | `PRIMARY KEY DEFAULT gen_random_uuid()` | Identificador único do veículo na garagem. |
| `usuario_id` | `UUID` | `REFERENCES usuarios(id) ON DELETE CASCADE` | Proprietário do veículo. |
| `modelo_moto_id` | `INTEGER` | `REFERENCES modelos_moto(id) ON DELETE RESTRICT` | Modelo base de referência técnica. |
| `ano_fabricacao` | `INTEGER` | `NOT NULL` | Ano específico da moto do motociclista. |
| `apelido` | `VARCHAR(50)` | `NULL` | Nome amigável dado pelo usuário (ex.: "Minha Titan"). |
| `foto_moto_url` | `TEXT` | `NULL` | URL ou Data URI opcional da motocicleta. |

---

## 5. `pecas`
Catálogo mestre global de peças automotivas/motopeças disponíveis para vinculação por lojas.

| Coluna | Tipo SQL | Restrições / Default | Descrição |
|---|---|---|---|
| `id` | `SERIAL` | `PRIMARY KEY` | Identificador sequencial da peça. |
| `sku` | `VARCHAR(50)` | `UNIQUE` | Código de referência/SKU do fabricante ou loja. |
| `codigo_ean` | `VARCHAR(13)` | `UNIQUE` | Código de barras EAN-13 opcional. |
| `nome` | `VARCHAR(150)` | `NOT NULL` | Nome comercial da peça. |
| `descricao` | `TEXT` | `NULL` | Descrição detalhada e notas de aplicação. |
| `categoria` | `VARCHAR(50)` | `NOT NULL` | Categoria principal (Freios, Transmissão, Pneus, etc.). |
| `foto_peca_url` | `TEXT` | `NULL` | Caminho ou URL da imagem do produto (`/seed/*.webp`). |
| `especificacoes` | `JSONB` | `NULL` | Metadados técnicos flexíveis (marca, material, dimensões). |

---

## 6. `compatibilidade_peca_moto`
Relação N:N entre catálogo de peças e modelos de motocicletas compatíveis.

| Coluna | Tipo SQL | Restrições / Default | Descrição |
|---|---|---|---|
| `peca_id` | `INTEGER` | `PRIMARY KEY, REFERENCES pecas(id) ON DELETE CASCADE` | Peça do catálogo global. |
| `modelo_moto_id` | `INTEGER` | `PRIMARY KEY, REFERENCES modelos_moto(id) ON DELETE CASCADE` | Modelo de moto tecnicamente compatível. |

---

## 7. `estoque_loja`
Inventário, precificação e vigência promocional de cada peça dentro de uma loja física.

| Coluna | Tipo SQL | Restrições / Default | Descrição |
|---|---|---|---|
| `id` | `UUID` | `PRIMARY KEY DEFAULT gen_random_uuid()` | Identificador da oferta/estoque da loja. |
| `loja_id` | `UUID` | `REFERENCES lojas(id) ON DELETE CASCADE` | Loja ofertante. |
| `peca_id` | `INTEGER` | `REFERENCES pecas(id) ON DELETE RESTRICT` | Peça associada do catálogo global. |
| `quantidade_estoque` | `INTEGER` | `DEFAULT 0` | Unidades disponíveis para retirada física. |
| `alerta_estoque_minimo` | `INTEGER` | `DEFAULT 5` | Limite para sinalização de "Estoque Baixo" no painel. |
| `preco_venda` | `DECIMAL(10, 2)` | `NOT NULL` | Preço padrão à vista (BRL). |
| `em_promocao` | `BOOLEAN` | `DEFAULT FALSE` | Flag de ativação de campanha promocional. |
| `preco_promocional` | `DECIMAL(10, 2)` | `NULL` | Preço reduzido exibido quando a promoção está vigente. |
| `data_inicio_promocao` | `DATE` | `NULL` | Data inicial da vigência promocional (inclusiva). |
| `data_fim_promocao` | `DATE` | `NULL` | Data final da vigência promocional (inclusiva). |
| `data_atualizacao` | `TIMESTAMP` | `DEFAULT CURRENT_TIMESTAMP` | Última atualização de quantidade ou preço. |

---

## 8. `avaliacoes_loja`
Avaliações pós-visita enviadas por usuários autenticados sobre a experiência nas lojas.

| Coluna | Tipo SQL | Restrições / Default | Descrição |
|---|---|---|---|
| `id` | `UUID` | `PRIMARY KEY DEFAULT gen_random_uuid()` | Identificador único da avaliação. |
| `loja_id` | `UUID` | `REFERENCES lojas(id) ON DELETE CASCADE` | Loja avaliada. |
| `usuario_id` | `UUID` | `REFERENCES usuarios(id) ON DELETE CASCADE` | Autor da avaliação. |
| `nota` | `INTEGER` | `CHECK (nota >= 1 AND nota <= 5) NOT NULL` | Nota de 1 a 5 estrelas. |
| `comentario` | `TEXT` | `NULL` | Comentário opcional sobre atendimento, preço e peça. |
| `recomenda` | `BOOLEAN` | `NOT NULL` | Indica se o cliente recomenda o estabelecimento. |
| `data_avaliacao` | `TIMESTAMP` | `DEFAULT CURRENT_TIMESTAMP` | Data/hora do envio da avaliação. |

---

## 9. `estatisticas_oferta`
Contabilização agregada diária de visualizações e cliques em conversão (WhatsApp/Maps) por item de estoque.

| Coluna | Tipo SQL | Restrições / Default | Descrição |
|---|---|---|---|
| `id` | `UUID` | `PRIMARY KEY DEFAULT gen_random_uuid()` | Identificador da linha diária. |
| `estoque_loja_id` | `UUID` | `REFERENCES estoque_loja(id) ON DELETE CASCADE` | Oferta monitorada. |
| `visualizacoes` | `INTEGER` | `DEFAULT 0` | Total de aberturas da oferta no dia. |
| `cliques` | `INTEGER` | `DEFAULT 0` | Total de cliques em reserva/rota no dia. |
| `data_registro` | `DATE` | `DEFAULT CURRENT_DATE` | Data de agregação (`UNIQUE(estoque_loja_id, data_registro)` para upsert atômico). |

---

## Índices de Performance (B-tree e GIN `pg_trgm`)

1. **Geolocalização e estoque:** `idx_lojas_ativa_coords`, `idx_estoque_loja_loja_qtd`, `idx_estoque_loja_peca`, `idx_estoque_loja_promo`, `idx_garagem_usuario`, `idx_avaliacoes_loja_id`, `idx_estatisticas_oferta_lookup`, `idx_pecas_categoria_lower`.
2. **Busca textual case-insensitive (`pg_trgm` GIN):** `idx_pecas_nome_trgm`, `idx_pecas_descricao_trgm`, `idx_pecas_sku_trgm`, `idx_pecas_categoria_trgm`, `idx_lojas_nome_trgm`, `idx_modelos_moto_marca_trgm`, `idx_modelos_moto_modelo_trgm`.
