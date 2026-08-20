# TODO — RadarPeças

Lista de tarefas técnicas para orientar a implementação do RadarPeças.

> As tarefas abaixo transformam os requisitos e a arquitetura definidos na proposta de TCC em unidades de trabalho de código. Itens de infraestrutura, documentação acadêmica e pesquisa de requisitos não são priorizados aqui, exceto quando necessários para implementar o software.

## Estrutura de repositório sugerida

```text
radarpecas/
├── backend/
│   ├── RadarPecas.Api/
│   ├── RadarPecas.Application/
│   ├── RadarPecas.Domain/
│   └── RadarPecas.Infrastructure/
├── frontend/
│   └── radarpecas-web/
├── database/
│   ├── migrations/
│   └── seed/
├── docs/
├── tests/
│   ├── backend/
│   └── frontend/
├── .gitignore
├── README.md
└── TODO.md
```

A divisão acima é uma organização sugerida para a implementação. A proposta define a separação entre back-end e front-end, mas não determina nomes específicos de projetos ou pastas.


### Banco de dados

Configure uma instância PostgreSQL com PostGIS habilitado e informe as credenciais na configuração da API.

Exemplo conceitual:

```sql
CREATE EXTENSION IF NOT EXISTS postgis;
```

As configurações reais de conexão devem ser mantidas fora do código-fonte, preferencialmente por variáveis de ambiente ou mecanismos de configuração do .NET.

## Princípios de implementação

1. **Compatibilidade antes de recomendação:** uma oferta incompatível não deve aparecer como resultado recomendado para a motocicleta selecionada.
2. **Geolocalização no banco:** utilizar PostGIS para operações espaciais em vez de realizar todos os cálculos na aplicação.
3. **API REST:** manter a comunicação entre front-end e back-end baseada em HTTP/JSON.
4. **Mobile-First:** priorizar a experiência do motociclista em dispositivos móveis.
5. **Separação de responsabilidades:** manter regras de negócio fora dos controllers.
6. **Segurança:** não armazenar senhas em texto puro e não versionar credenciais.
7. **Validação:** validar dados recebidos pela API antes de persistí-los.
8. **Código modular:** favorecer componentes e serviços pequenos, testáveis e documentados.


## 1. Estrutura inicial

- [x] Criar solução .NET 8 para o back-end.
- [x] Criar projetos separados para API, domínio, aplicação e infraestrutura.
- [x] Criar projeto React 18 + TypeScript + Vite.
- [x] Configurar ESLint/formatter no front-end.
- [x] Configurar tratamento global de erros no back-end.
- [x] Criar configuração de ambientes Development e Production.
- [x] Configurar .gitignore para .NET, Node, IDEs e arquivos de ambiente.
- [x] Criar arquivo .env.example sem credenciais reais.
- [x] Configurar CORS para comunicação entre front-end e API.

## 2. Banco de dados

### PostgreSQL + PostGIS

- [ ] Criar banco PostgreSQL para desenvolvimento.
- [ ] Habilitar extensão PostGIS.
- [ ] Criar migrations iniciais.
- [ ] Configurar conexão do ASP.NET Core com PostgreSQL.
- [ ] Criar índices para campos utilizados em buscas frequentes.
- [ ] Criar índice espacial GiST para localização das lojas.
- [ ] Criar seed inicial para modelos de motocicletas.
- [ ] Criar seed de categorias de peças.

### Entidades

- [ ] Implementar `Usuario`.
- [ ] Implementar `Loja`.
- [ ] Implementar `GaragemVirtual`.
- [ ] Implementar `ModeloMoto`.
- [ ] Implementar `Peca`.
- [ ] Implementar `CompatibilidadePecaMoto`.
- [ ] Implementar `EstoqueLoja`.
- [ ] Implementar `AvaliacaoLoja`.
- [ ] Implementar `EstatisticaOferta`.
- [ ] Mapear relacionamentos e cardinalidades.
- [ ] Definir constraints de integridade.
- [ ] Definir tratamento para exclusão/ativação de registros.
- [ ] Mapear especificações técnicas das peças em `JSONB`.

## 3. Autenticação e usuários

- [ ] Criar endpoint de registro de usuário.
- [ ] Criar endpoint de registro de lojista.
- [ ] Criar endpoint de login.
- [ ] Implementar autenticação baseada em token.
- [ ] Implementar autorização por perfil.
- [ ] Hash de senha com algoritmo seguro.
- [ ] Criar endpoint para consultar o perfil autenticado.
- [ ] Criar endpoint para atualização de perfil.
- [ ] Validar e-mail e campos obrigatórios.
- [ ] Impedir acesso de usuário comum às rotas administrativas do lojista.

## 4. Garagem Virtual

- [ ] Criar CRUD de motocicletas do usuário.
- [ ] Criar endpoint para listar modelos disponíveis.
- [ ] Permitir seleção de modelo e ano.
- [ ] Armazenar a motocicleta associada ao usuário.
- [ ] Permitir múltiplas motocicletas na garagem.
- [ ] Permitir selecionar uma motocicleta como contexto da busca.
- [ ] Validar modelo/ano antes da persistência.
- [ ] Criar endpoint para remover uma motocicleta da garagem.

## 5. Catálogo de peças

- [ ] Criar CRUD de categorias.
- [ ] Criar CRUD de peças.
- [ ] Definir campos básicos da peça.
- [ ] Implementar armazenamento das especificações técnicas.
- [ ] Criar relacionamento peça × modelo de motocicleta.
- [ ] Criar endpoints para adicionar/remover compatibilidades.
- [ ] Validar duplicidade de compatibilidade.
- [ ] Criar busca por nome.
- [ ] Criar busca por categoria.
- [ ] Criar busca por referência/EAN quando aplicável.

## 6. Estoque e ofertas

- [ ] Criar CRUD de estoque por loja.
- [ ] Associar peça a uma loja.
- [ ] Permitir alteração de preço.
- [ ] Permitir alteração da quantidade disponível.
- [ ] Implementar status ativo/inativo da oferta.
- [ ] Criar cadastro de promoção.
- [ ] Definir início e fim da promoção.
- [ ] Validar período de validade.
- [ ] Impedir estoque negativo.
- [ ] Criar endpoint para listar ofertas ativas.
- [ ] Criar endpoint para consultar detalhes de uma oferta.

## 7. Compatibilidade

- [ ] Criar serviço de compatibilidade no back-end.
- [ ] Receber a motocicleta selecionada como contexto da busca.
- [ ] Consultar `compatibilidade_peca_moto`.
- [ ] Retornar somente ofertas compatíveis quando o filtro estiver ativo.
- [ ] Garantir que modelo e ano sejam considerados nas regras definidas.
- [ ] Separar a regra de compatibilidade da regra de ordenação.
- [ ] Criar testes unitários para casos compatíveis.
- [ ] Criar testes para casos incompatíveis.
- [ ] Criar testes para ausência de dados de compatibilidade.

## 8. Busca e recomendação

- [ ] Criar endpoint principal de busca de peças.
- [ ] Implementar filtros por texto.
- [ ] Implementar filtro por categoria.
- [ ] Implementar filtro por motocicleta da Garagem Virtual.
- [ ] Implementar filtro por disponibilidade.
- [ ] Implementar filtro por distância.
- [ ] Implementar ordenação por preço.
- [ ] Implementar ordenação por distância.
- [ ] Implementar consideração de promoções ativas.
- [ ] Implementar ranking combinado de ofertas.
- [ ] Definir uma função de pontuação para o ranking.
- [ ] Documentar os pesos utilizados no ranking.
- [ ] Criar testes unitários para o ranking.
- [ ] Garantir que ofertas incompatíveis não sejam recomendadas.

## 9. Geolocalização

- [ ] Adicionar campo espacial para localização da loja.
- [ ] Implementar geocodificação do endereço durante o cadastro/atualização da loja.
- [ ] Integrar Nominatim no back-end.
- [ ] Tratar falha de geocodificação.
- [ ] Implementar consulta PostGIS por raio.
- [ ] Calcular distância entre usuário e loja.
- [ ] Retornar distância na API.
- [ ] Implementar ordenação espacial.
- [ ] Evitar chamadas desnecessárias ao serviço de geocodificação.
- [ ] Validar consentimento antes de utilizar a localização do usuário.

## 10. API REST

- [ ] Padronizar respostas HTTP.
- [ ] Padronizar erros da API.
- [ ] Criar DTOs para entrada e saída.
- [ ] Evitar expor diretamente entidades do banco.
- [ ] Implementar validação dos DTOs.
- [ ] Criar paginação para listas potencialmente grandes.
- [ ] Adicionar documentação dos endpoints.
- [ ] Configurar Swagger/OpenAPI.
- [ ] Implementar logs de erros e operações relevantes.

## 11. Front-end — base

- [ ] Criar estrutura de rotas.
- [ ] Criar layout principal.
- [ ] Criar sistema de autenticação no cliente.
- [ ] Criar gerenciamento do usuário autenticado.
- [ ] Criar camada de comunicação HTTP com a API.
- [ ] Criar tratamento global de erros.
- [ ] Criar componentes reutilizáveis de formulário.
- [ ] Criar componentes reutilizáveis de cards.
- [ ] Criar estados de loading, vazio e erro.
- [ ] Garantir responsividade Mobile-First.

## 12. Front-end — usuário

- [ ] Implementar tela de login.
- [ ] Implementar tela de cadastro de motociclista.
- [ ] Implementar tela da Garagem Virtual.
- [ ] Implementar cadastro de motocicleta.
- [ ] Implementar edição/remoção de motocicleta.
- [ ] Implementar tela inicial de exploração.
- [ ] Implementar busca de peças.
- [ ] Implementar filtros.
- [ ] Implementar cards de ofertas.
- [ ] Implementar detalhes da peça.
- [ ] Implementar indicação de compatibilidade.
- [ ] Implementar tela de lojas.
- [ ] Implementar avaliação da loja.

## 13. Front-end — mapa

- [ ] Integrar Leaflet.
- [ ] Integrar React Leaflet.
- [ ] Exibir localização do usuário quando houver consentimento.
- [ ] Exibir marcadores das lojas.
- [ ] Criar popup com informações básicas da loja.
- [ ] Exibir preço da oferta no contexto do resultado.
- [ ] Exibir distância aproximada.
- [ ] Sincronizar filtros da busca com os marcadores.
- [ ] Ajustar o mapa para diferentes tamanhos de tela.
- [ ] Tratar ausência/perda de localização.

## 14. Front-end — lojista

- [ ] Implementar login/área do lojista.
- [ ] Implementar cadastro da loja.
- [ ] Implementar perfil da loja.
- [ ] Implementar dashboard.
- [ ] Implementar gestão de estoque.
- [ ] Implementar cadastro de produto.
- [ ] Implementar edição de produto/oferta.
- [ ] Implementar ativação/inativação de estoque.
- [ ] Implementar criação de promoções.
- [ ] Implementar listagem de ofertas ativas.
- [ ] Implementar produtos mais procurados.
- [ ] Implementar indicadores de ofertas.

## 15. Avaliações e métricas

- [ ] Criar endpoint para avaliação da loja.
- [ ] Validar nota dentro da faixa permitida.
- [ ] Impedir avaliações inválidas/duplicadas conforme regra definida.
- [ ] Calcular média de avaliação da loja.
- [ ] Exibir avaliação no front-end.
- [ ] Registrar visualizações das ofertas.
- [ ] Atualizar `estatisticas_oferta`.
- [ ] Disponibilizar métricas necessárias ao dashboard.

## 16. Segurança e LGPD

- [ ] Não armazenar senhas em texto puro.
- [ ] Não versionar secrets.
- [ ] Validar dados de entrada da API.
- [ ] Configurar políticas de autorização.
- [ ] Restringir endpoints administrativos.
- [ ] Solicitar consentimento para localização.
- [ ] Evitar persistir localização do usuário sem necessidade.
- [ ] Revisar exposição de dados pessoais nas respostas da API.
- [ ] Configurar HTTPS no ambiente de produção.
- [ ] Revisar CORS antes da publicação.

## 17. Testes

### Back-end

- [ ] Testar autenticação.
- [ ] Testar autorização por perfil.
- [ ] Testar CRUD da Garagem Virtual.
- [ ] Testar CRUD de peças.
- [ ] Testar CRUD de estoque.
- [ ] Testar regras de compatibilidade.
- [ ] Testar consultas geoespaciais.
- [ ] Testar ranking de ofertas.
- [ ] Testar validações de entrada.
- [ ] Testar tratamento de erros.

### Front-end

- [ ] Testar componentes críticos.
- [ ] Testar fluxo de login.
- [ ] Testar fluxo da Garagem Virtual.
- [ ] Testar busca de peças.
- [ ] Testar filtros de compatibilidade.
- [ ] Testar mapa.
- [ ] Testar fluxo de gestão do lojista.

### Validação

- [ ] Executar teste de usabilidade com usuários representativos.
- [ ] Verificar precisão das recomendações da Garagem Virtual.
- [ ] Medir tempo das consultas geolocalizadas.
- [ ] Verificar carregamento do mapa em rede 4G estável.
- [ ] Corrigir problemas encontrados na validação.

## 18. Qualidade e manutenção

- [ ] Padronizar nomenclatura do código.
- [ ] Remover código duplicado.
- [ ] Adicionar documentação às regras de negócio complexas.
- [ ] Configurar análise estática/lint.
- [ ] Revisar queries SQL.
- [ ] Revisar índices do banco.
- [ ] Revisar tratamento de exceções.
- [ ] Revisar logs.
- [ ] Criar README de setup atualizado.
- [ ] Criar documentação da API.
- [ ] Revisar configuração de produção.

## 19. MVP — ordem sugerida de implementação

### Fase 1 — Fundação

- [x] Estrutura do back-end.
- [x] Estrutura do front-end.
- [ ] PostgreSQL + PostGIS.
- [ ] Migrations.
- [x] Configuração de ambiente.
- [ ] Comunicação front-end ↔ API.

### Fase 2 — Acesso

- [ ] Usuário.
- [ ] Lojista.
- [ ] Autenticação.
- [ ] Autorização.

### Fase 3 — Dados essenciais

- [ ] Modelos de motocicletas.
- [ ] Garagem Virtual.
- [ ] Peças.
- [ ] Compatibilidades.
- [ ] Lojas.
- [ ] Estoque/ofertas.

### Fase 4 — Busca

- [ ] Busca textual.
- [ ] Filtros.
- [ ] Compatibilidade.
- [ ] Ordenação por preço.
- [ ] Ordenação por distância.
- [ ] Promoções.

### Fase 5 — Geolocalização

- [ ] Nominatim.
- [ ] PostGIS.
- [ ] Consulta por proximidade.
- [ ] Leaflet.
- [ ] Marcadores.
- [ ] Distância.

### Fase 6 — Interfaces

- [ ] Fluxo completo do motociclista.
- [ ] Garagem Virtual.
- [ ] Detalhes da peça.
- [ ] Fluxo completo do lojista.
- [ ] Gestão de estoque.
- [ ] Dashboard.

### Fase 7 — Qualidade

- [ ] Testes.
- [ ] Segurança.
- [ ] LGPD.
- [ ] Performance.
- [ ] Teste de usabilidade.
- [ ] Correções finais.

## Critério de conclusão do MVP

O MVP pode ser considerado funcional quando um motociclista conseguir:

```text
Cadastrar-se
   ↓
Cadastrar sua motocicleta
   ↓
Pesquisar uma peça
   ↓
Filtrar pela compatibilidade
   ↓
Visualizar ofertas disponíveis
   ↓
Comparar preço/distância
   ↓
Encontrar a loja no mapa
```

E quando um lojista conseguir:

```text
Cadastrar a loja
   ↓
Cadastrar produtos
   ↓
Definir compatibilidades
   ↓
Cadastrar estoque/preço
   ↓
Criar uma promoção
   ↓
Ter a oferta exibida na busca
```
