# Documentação da API REST — RadarPeças

- **Base URL local:** `http://localhost:5150/api`
- **Base URL produção (Render):** `https://radarpecas.onrender.com/api`
- **Swagger / OpenAPI (Development):** `http://localhost:5150/swagger` (`/swagger/v1/swagger.json`)

---

## Convenções Globais

### Envelope de Resposta (`ApiResponse<T>`)
Todas as rotas dos controllers retornam JSON padronizado no envelope:
```json
{
  "success": true,
  "message": "Operação realizada com sucesso.",
  "data": { ... },
  "errors": null
}
```
Listagens paginadas utilizam `ApiResponse<PagedResult<T>>` (`items`, `totalCount`, `page`, `pageSize`, `totalPages`, `hasPreviousPage`, `hasNextPage`).

### Mapeamento Semântico de Status HTTP
- `200 OK` / `201 Created`: operação concluída com sucesso.
- `400 BadRequest`: erro sintático de JSON, ModelState inválido ou ausência de campos obrigatórios.
- `401 Unauthorized`: token ausente/expirado ou credenciais inválidas no login.
- `403 Forbidden`: perfil sem permissão ou tentativa de acesso/alteração em loja/estoque de outro lojista (proteção IDOR).
- `404 NotFound`: recurso solicitado inexistente.
- `422 UnprocessableEntity`: violação de regra de domínio ou conflito negocial (e-mail/CNPJ/SKU/EAN duplicado, preço promocional >= preço de venda, endereço não geocodificável, ano fora da faixa do modelo).
- `429 TooManyRequests`: limite excedido nos endpoints públicos com rate limit (`busca`: 60 req/min; `metricas`: 120 req/min).

### Autenticação
Enviar header HTTP `Authorization: Bearer <token_jwt>`. Claims principais emitidas pelo `JwtTokenService`: `NameIdentifier`, `Email`, `Name`, `Role` (`Motociclista` ou `LOJISTA`), `tipo_usuario`, e (para lojistas) `loja_id` e `nome_loja`.

---

## Catálogo de Endpoints

### Saúde
| Método | Rota | Auth | Descrição |
|---|---|---|---|
| `GET` | `/api/health` | Pública | Verifica status (`Healthy`), versão e ambiente ativo. |

### Autenticação (`/api/auth`)
| Método | Rota | Auth | Descrição |
|---|---|---|---|
| `POST` | `/api/auth/login` | Pública | Autentica por e-mail/senha e retorna JWT + perfil + `lojaId` (se lojista). |
| `POST` | `/api/auth/register-motociclista` | Pública | Cria conta `Motociclista` e retorna JWT. |
| `POST` | `/api/auth/register-lojista` | Pública | Cria `Usuario (LOJISTA)` + `Loja` dentro de transação atômica e retorna JWT. |
| `GET` | `/api/auth/me` | Bearer | Retorna o perfil do usuário autenticado. |
| `PUT` | `/api/auth/profile` | Bearer | Atualiza nome, e-mail e/ou senha (exigindo senha atual). |

### Busca e Recomendação (`/api/busca`)
| Método | Rota | Auth / Limite | Descrição |
|---|---|---|---|
| `GET` | `/api/busca` | Pública · `busca` (60/min) | Busca paginada de ofertas com filtros `termo`, `categoria`, `marca`, `apenasPromocao`, `precoMaximo`, `garagemVirtualId`, `modeloMotoId`, `anoFabricacao`, `userLat`, `userLon`, `raioKm`, `ordenacao` (`recomendados`, `menor_preco`, `distancia`, `melhor_avaliacao`), `page`, `pageSize`. |

### Lojas e Avaliações (`/api/lojas`)
| Método | Rota | Auth / Limite | Descrição |
|---|---|---|---|
| `GET` | `/api/lojas` | Pública · `busca` | Lista lojas ativas com distância opcional (`userLat`, `userLon`, `raioKm`) e filtro textual `busca`. |
| `GET` | `/api/lojas/paginadas` | Pública · `busca` | Versão paginada de lojas (`ordenacao`, `page`, `pageSize`) sem carga excessiva. |
| `GET` | `/api/lojas/{id}` | Pública | Detalhes públicos da loja (contato, horários JSONB, média de avaliações). |
| `GET` | `/api/lojas/minha-loja` | `LOJISTA` | Retorna a loja associada ao usuário lojista autenticado. |
| `POST` | `/api/lojas` | `LOJISTA` | Cria estabelecimento adicional vinculado ao usuário autenticado. |
| `PUT` | `/api/lojas/{id}` | `LOJISTA` (Dono) | Atualiza dados cadastrais, horários e galeria da própria loja (`403` se de terceiros). |
| `GET` | `/api/lojas/{id}/estoque` | Pública | Lista paginada do estoque ativo da loja (`busca`, `apenasPromocao`, `page`, `pageSize`). |
| `GET` | `/api/lojas/{id}/avaliacoes` | Pública | Lista notas, comentários e percentual de recomendação da loja. |
| `POST` | `/api/lojas/{id}/avaliacoes` | Bearer | Registra avaliação (1–5 estrelas, comentário e `recomenda`). |
| `GET` | `/api/lojas/{id}/dashboard` | `LOJISTA` (Dono) | Retorna KPIs do painel e ranking regional de peças mais procuradas. |

### Ofertas e Métricas (`/api/ofertas`)
| Método | Rota | Auth / Limite | Descrição |
|---|---|---|---|
| `GET` | `/api/ofertas/{id}` | Pública | Detalhe completo da oferta (`estoqueId`), compatibilidades, parcelas e coordenadas para mini-mapa. |
| `POST` | `/api/ofertas/{id}/visualizacao` | Pública · `metricas` (120/min) | Incrementa `visualizacoes` do dia via upsert SQL atômico (`INSERT ... ON CONFLICT DO UPDATE`). |
| `POST` | `/api/ofertas/{id}/clique` | Pública · `metricas` (120/min) | Incrementa `cliques` (conversão WhatsApp/Rota) do dia de forma atômica. |

### Estoque (`/api/estoque`)
| Método | Rota | Auth | Descrição |
|---|---|---|---|
| `GET` | `/api/estoque/{id}` | Pública | Consulta item específico de `estoque_loja`. |
| `POST` | `/api/estoque` | `LOJISTA` (Dono) | Publica peça existente do catálogo global no estoque da própria loja. |
| `PUT` | `/api/estoque/{id}` | `LOJISTA` (Dono) | Atualiza quantidade, alerta mínimo e preço de venda (`403` se outra loja). |
| `PUT` | `/api/estoque/{id}/promocao` | `LOJISTA` (Dono) | Ativa, edita ou encerra promoção com vigência de datas. |
| `DELETE` | `/api/estoque/{id}` | `LOJISTA` (Dono) | Remove item de estoque da própria loja. |

### Catálogo Global de Peças (`/api/pecas`)
| Método | Rota | Auth | Descrição |
|---|---|---|---|
| `GET` | `/api/pecas` | Pública | Lista paginada de peças (`busca`, `categoria`, `page`, `pageSize`). |
| `GET` | `/api/pecas/categorias` | Pública | Lista categorias cadastradas sem duplicatas. |
| `GET` | `/api/pecas/{id}` | Pública | Detalhe de peça + modelos de moto compatíveis. |
| `POST` | `/api/pecas` | `LOJISTA` | Cadastra nova peça e associa compatibilidades iniciais. |
| `PUT` | `/api/pecas/{id}` | `LOJISTA` | Atualiza nome, SKU, EAN, descrição e especificações. |
| `DELETE` | `/api/pecas/{id}` | `LOJISTA` | Exclui peça se não houver ofertas vinculadas (`422` caso contrário). |
| `POST` | `/api/pecas/{id}/compatibilidades` | `LOJISTA` | Vincula um `modeloMotoId` à peça. |
| `DELETE` | `/api/pecas/{id}/compatibilidades/{modeloMotoId}` | `LOJISTA` | Remove compatibilidade entre peça e modelo de moto. |

### Garagem Virtual (`/api/garagem`) e Modelos de Moto (`/api/modelos-moto`)
| Método | Rota | Auth | Descrição |
|---|---|---|---|
| `GET` | `/api/garagem` | Bearer | Lista motos da garagem do usuário autenticado. |
| `GET` | `/api/garagem/{id}` | Bearer | Consulta uma moto da própria garagem (`404` se inexistente ou de outro usuário). |
| `POST` | `/api/garagem` | Bearer | Adiciona motocicleta validando modelo e intervalo `ano_inicio..ano_fim`. |
| `PUT` | `/api/garagem/{id}` | Bearer | Atualiza apelido, ano ou foto da moto do usuário. |
| `DELETE` | `/api/garagem/{id}` | Bearer | Remove motocicleta da garagem do usuário. |
| `GET` | `/api/modelos-moto` | Pública | Lista modelos disponíveis (`marca`, `busca`). |
| `GET` | `/api/modelos-moto/marcas` | Pública | Lista fabricantes distintos. |
| `GET` | `/api/modelos-moto/{id}` | Pública | Detalha um modelo de motocicleta. |
| `POST` | `/api/modelos-moto` | `LOJISTA` | Cadastra novo modelo de motocicleta. |

### Geocoding Proxy (`/api/geocoding`)
| Método | Rota | Auth / Limite | Descrição |
|---|---|---|---|
| `GET` | `/api/geocoding/sugestoes` | Pública · `busca` | Autocomplete de endereços (mínimo 2 caracteres, `limite` 1..15) mediado pelo servidor contra Nominatim/Photon. |
