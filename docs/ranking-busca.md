# Fórmula de Ranking e Recomendação (`BuscaRecomendacaoService`)

Este documento especifica a regra de pontuação utilizada na ordenação padrão (`ordenacao=recomendados`) da busca de ofertas do RadarPeças.

## Pré-requisito (Regra Rígida de Compatibilidade)

Antes de calcular qualquer pontuação, se o usuário possuir uma **motocicleta selecionada** (`GaragemVirtualId` ou `ModeloMotoId` + `AnoFabricacao`), ofertas incompatíveis são **excluídas na consulta SQL** via `CompatibilidadeService`. Compatibilidade é um filtro binário eliminatório, não um peso de ranking.

## Fórmula Ponderada

Para cada oferta elegível retornada pelos filtros ativos, o `ScoreRecomendacao` varia de `0.000` a `1.000` (arredondado para 3 casas decimais):

```text
ScoreFinal = (0.35 × ScorePreço)
           + (0.30 × ScoreDistância)
           + (0.20 × ScoreAvaliação)
           + (0.15 × BônusPromoção)
```

### Componentes

| Critério | Peso | Cálculo | Observações |
|---|---:|---|---|
| **Preço Efetivo** | **35%** | `1 - (preco - menorPreco) / (maiorPreco - menorPreco)` | Se `maiorPreco == menorPreco`, vale `1.0`. Usa `PrecoPromocional` quando a promoção está vigente. |
| **Distância (km)** | **30%** | `1 - (distanciaKm / maiorDistancia)` | Limitado a `[0, 1]`. Se o usuário não informar coordenadas ou `maiorDistancia == 0`, assume valor neutro `0.5`. |
| **Avaliação da Loja** | **20%** | `clamp(mediaAvaliacao / 5.0, 0.0, 1.0)` | Lojas sem avaliações assumem nota inicial neutra/padrão `5.0` no catálogo. |
| **Promoção Ativa** | **15%** | `1.0` se `PromocaoAtiva == true`, senão `0.0` | Considera `EmPromocao == true`, `PrecoPromocional` definido e data atual dentro de `[DataInicioPromocao, DataFimPromocao]`. |

## Execução no Banco de Dados

Para evitar carregamento completo em memória (*OOM*), os agregados (`menorPreco`, `maiorPreco`, `maiorDistancia`) são obtidos em consulta agregada prévia no PostgreSQL e a expressão equivalente de `ScoreFinal` é aplicada diretamente no `ORDER BY ... DESC` com `LIMIT`/`OFFSET` (`Skip`/`Take`).
