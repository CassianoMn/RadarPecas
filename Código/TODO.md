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

- [x] Criar banco PostgreSQL para desenvolvimento.
- [x] Habilitar extensão PostGIS.
- [x] Criar migrations iniciais.
- [x] Configurar conexão do ASP.NET Core com PostgreSQL.
- [x] Criar índices para campos utilizados em buscas frequentes.
- [x] Criar índice espacial GiST para localização das lojas.
- [x] Criar seed inicial para modelos de motocicletas.
- [x] Criar seed de categorias de peças.

### Entidades

- [x] Implementar `Usuario`.
- [x] Implementar `Loja`.
- [x] Implementar `GaragemVirtual`.
- [x] Implementar `ModeloMoto`.
- [x] Implementar `Peca`.
- [x] Implementar `CompatibilidadePecaMoto`.
- [x] Implementar `EstoqueLoja`.
- [x] Implementar `AvaliacaoLoja`.
- [x] Implementar `EstatisticaOferta`.
- [x] Mapear relacionamentos e cardinalidades.
- [x] Definir constraints de integridade.
- [x] Definir tratamento para exclusão/ativação de registros.
- [x] Mapear especificações técnicas das peças em `JSONB`.

## 3. Autenticação e usuários

- [x] Criar endpoint de registro de usuário.
- [x] Criar endpoint de registro de lojista.
- [x] Criar endpoint de login.
- [x] Implementar autenticação baseada em token.
- [x] Implementar autorização por perfil.
- [x] Hash de senha com algoritmo seguro.
- [x] Criar endpoint para consultar o perfil autenticado.
- [x] Criar endpoint para atualização de perfil.
- [x] Validar e-mail e campos obrigatórios.
- [x] Impedir acesso de usuário comum às rotas administrativas do lojista.

## 4. Garagem Virtual

- [x] Criar CRUD de motocicletas do usuário.
- [x] Criar endpoint para listar modelos disponíveis.
- [x] Permitir seleção de modelo e ano.
- [x] Armazenar a motocicleta associada ao usuário.
- [x] Permitir múltiplas motocicletas na garagem.
- [x] Permitir selecionar uma motocicleta como contexto da busca.
- [x] Validar modelo/ano antes da persistência.
- [x] Criar endpoint para remover uma motocicleta da garagem.

## 5. Catálogo de peças

- [x] Criar CRUD de categorias.
- [x] Criar CRUD de peças.
- [x] Definir campos básicos da peça.
- [x] Implementar armazenamento das especificações técnicas.
- [x] Criar relacionamento peça × modelo de motocicleta.
- [x] Criar endpoints para adicionar/remover compatibilidades.
- [x] Validar duplicidade de compatibilidade.
- [x] Criar busca por nome.
- [x] Criar busca por categoria.
- [x] Criar busca por referência/EAN quando aplicável.

## 6. Estoque e ofertas

- [x] Criar CRUD de estoque por loja.
- [x] Associar peça a uma loja.
- [x] Permitir alteração de preço.
- [x] Permitir alteração da quantidade disponível.
- [x] Implementar status ativo/inativo da oferta.
- [x] Criar cadastro de promoção.
- [x] Definir início e fim da promoção.
- [x] Validar período de validade.
- [x] Impedir estoque negativo.
- [x] Criar endpoint para listar ofertas ativas.
- [x] Criar endpoint para consultar detalhes de uma oferta.

## 7. Compatibilidade

- [x] Criar serviço de compatibilidade no back-end.
- [x] Receber a motocicleta selecionada como contexto da busca.
- [x] Consultar `compatibilidade_peca_moto`.
- [x] Retornar somente ofertas compatíveis quando o filtro estiver ativo.
- [x] Garantir que modelo e ano sejam considerados nas regras definidas.
- [x] Separar a regra de compatibilidade da regra de ordenação.
- [x] Criar testes unitários para casos compatíveis.
- [x] Criar testes para casos incompatíveis.
- [x] Criar testes para ausência de dados de compatibilidade.

## 8. Busca e recomendação

- [x] Criar endpoint principal de busca de peças.
- [x] Implementar filtros por texto.
- [x] Implementar filtro por categoria.
- [x] Implementar filtro por motocicleta da Garagem Virtual.
- [x] Implementar filtro por disponibilidade.
- [x] Implementar filtro por distância.
- [x] Implementar ordenação por preço.
- [x] Implementar ordenação por distância.
- [x] Implementar consideração de promoções ativas.
- [x] Implementar ranking combinado de ofertas.
- [x] Definir uma função de pontuação para o ranking.
- [x] Documentar os pesos utilizados no ranking.
- [x] Criar testes unitários para o ranking.
- [x] Garantir que ofertas incompatíveis não sejam recomendadas.

## 9. Geolocalização

- [x] Adicionar campo espacial para localização da loja.
- [x] Implementar geocodificação do endereço durante o cadastro/atualização da loja.
- [x] Integrar Nominatim no back-end.
- [x] Tratar falha de geocodificação.
- [x] Implementar consulta PostGIS por raio.
- [x] Calcular distância entre usuário e loja.
- [x] Retornar distância na API.
- [x] Implementar ordenação espacial.
- [x] Evitar chamadas desnecessárias ao serviço de geocodificação.
- [x] Validar consentimento antes de utilizar a localização do usuário.

## 10. API REST

- [x] Padronizar respostas HTTP.
- [x] Padronizar erros da API.
- [x] Criar DTOs para entrada e saída.
- [x] Evitar expor diretamente entidades do banco.
- [x] Implementar validação dos DTOs.
- [x] Criar paginação para listas potencialmente grandes.
- [x] Adicionar documentação dos endpoints.
- [x] Configurar Swagger/OpenAPI.
- [x] Implementar logs de erros e operações relevantes.

## 11. Front-end — base

- [x] Criar estrutura de rotas.
- [x] Criar layout principal.
- [x] Criar sistema de autenticação no cliente.
- [x] Criar gerenciamento do usuário autenticado.
- [x] Criar camada de comunicação HTTP com a API.
- [x] Criar tratamento global de erros.
- [x] Criar componentes reutilizáveis de formulário.
- [x] Criar componentes reutilizáveis de cards.
- [x] Criar estados de loading, vazio e erro.
- [x] Garantir responsividade Mobile-First.

## 12. Front-end — usuário

- [x] Implementar tela de login.
- [x] Implementar tela de cadastro de motociclista.
- [x] Implementar tela da Garagem Virtual.
- [x] Implementar cadastro de motocicleta.
- [x] Implementar edição/remoção de motocicleta.
- [x] Implementar tela inicial de exploração.
- [x] Implementar busca de peças.
- [x] Implementar filtros.
- [x] Implementar cards de ofertas.
- [x] Implementar detalhes da peça.
- [x] Implementar indicação de compatibilidade.
- [x] Implementar tela de manter cadastro de usuário (gerenciar conta / editar perfil de motociclista).
- [x] Implementar tela de lojas.
- [x] Implementar avaliação da loja.

> **Nota de Implementação (Protótipos de Alto Nível & Dados Reais)**:
> - Todas as telas do motociclista foram adaptadas e alinhadas aos protótipos de alta fidelidade em `Requisitos/Prototipos de Alto Nivel/`:
>   - Tela de Login (`Tela Login.png`) e Cadastro (`1.Tela Cadastro Usuário.png`) com logo oficial `radarPecasLogo.png`, alternador de visibilidade de senha e design limpo.
>   - Tela inicial de exploração (`2.Tela inicial explorar .png`) em layout split-screen com barra lateral de filtros/busca e mapa interativo.
>   - Garagem Virtual (`3. Tela Garagem Virtual.png`) em duas colunas (motos do usuário e peças recomendadas com contagem real).
>   - Adição de Motocicleta (`4. Tela Adicionar Moto.png`) com seletores dependentes de marca/modelo/ano e upload de foto.
>   - Busca e Filtros (`5. Tela Busca e Filtros.png`) com filtros de categoria, marca, preço e pílulas de raio.
>   - Detalhes da Oferta (`6. Tela Detalhes do Produto.png`) com especificações técnicas reais, botão WhatsApp e verificação de compatibilidade.
>   - Catálogo de Lojas (`7. Tela Catalogo de Lojas.png`) e Avaliação de Loja (`8. Tela Avaliar Loja.png`) com estrelas interativas.
> - **Consistência de dados**: Remoção total de dados fictícios em todas as telas (distâncias só são exibidas quando calculadas via geolocalização `distanciaKm != null`, compatibilidade só é marcada quando a moto ativa do usuário é validada contra o catálogo, e ausência de dados exibe estados vazios `EmptyState` em vez de mocks).

## 13. Front-end — mapa

- [x] Integrar Leaflet.
- [x] Integrar React Leaflet / Leaflet nativo com ciclo de vida React (`useRef`/`useEffect`).
- [x] Integrar OpenStreetMap oficial (`tileLayer` aberto e sem necessidade de API key, eliminando "api key required").
- [x] Exibir localização do usuário quando houver consentimento (marcador estilo radar pulsante).
- [x] Exibir marcadores das lojas (pins customizados com nome e ícone).
- [x] Criar popup com informações básicas da loja (nome, endereço, nota média e link para ver estoque).
- [x] Exibir preço da oferta no contexto do resultado.
- [x] Exibir distância aproximada (calculada via API PostGIS).
- [x] Sincronizar filtros da busca com os marcadores.
- [x] Ajustar o mapa para diferentes tamanhos de tela (responsividade desktop split-screen e mobile).
- [x] Tratar ausência/perda de localização (fallback gracioso para coordenadas padrão da capital e busca sem coordenadas).

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

- [x] Criar endpoint para avaliação da loja.
- [x] Validar nota dentro da faixa permitida.
- [x] Impedir avaliações inválidas/duplicadas conforme regra definida.
- [x] Calcular média de avaliação da loja.
- [ ] Exibir avaliação no front-end.
- [x] Registrar visualizações das ofertas.
- [x] Atualizar `estatisticas_oferta`.
- [x] Disponibilizar métricas necessárias ao dashboard.

## 16. Segurança e LGPD

- [x] Não armazenar senhas em texto puro.
- [x] Não versionar secrets.
- [x] Validar dados de entrada da API.
- [x] Configurar políticas de autorização.
- [x] Restringir endpoints administrativos.
- [x] Solicitar consentimento para localização.
- [x] Evitar persistir localização do usuário sem necessidade.
- [x] Revisar exposição de dados pessoais nas respostas da API.
- [x] Configurar HTTPS no ambiente de produção.
- [x] Revisar CORS antes da publicação.

## 17. Testes

### Back-end

- [x] Testar autenticação.
- [x] Testar autorização por perfil.
- [x] Testar CRUD da Garagem Virtual.
- [x] Testar CRUD de peças.
- [x] Testar CRUD de estoque.
- [x] Testar regras de compatibilidade.
- [x] Testar consultas geoespaciais.
- [x] Testar ranking de ofertas.
- [x] Testar validações de entrada.
- [x] Testar tratamento de erros.

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

- [x] Padronizar nomenclatura do código.
- [x] Remover código duplicado.
- [x] Adicionar documentação às regras de negócio complexas.
- [x] Configurar análise estática/lint.
- [x] Revisar queries SQL.
- [x] Revisar índices do banco.
- [x] Revisar tratamento de exceções.
- [x] Revisar logs.
- [x] Criar README de setup atualizado.
- [x] Criar documentação da API.
- [ ] Revisar configuração de produção.

## 19. MVP — ordem sugerida de implementação

### Fase 1 — Fundação

- [x] Estrutura do back-end.
- [x] Estrutura do front-end.
- [x] PostgreSQL + PostGIS.
- [x] Migrations.
- [x] Configuração de ambiente.
- [ ] Comunicação front-end ↔ API.

### Fase 2 — Acesso

- [x] Usuário.
- [x] Lojista.
- [x] Autenticação.
- [x] Autorização.

### Fase 3 — Dados essenciais

- [x] Modelos de motocicletas.
- [x] Garagem Virtual.
- [x] Peças.
- [x] Compatibilidades.
- [x] Lojas.
- [x] Estoque/ofertas.

### Fase 4 — Busca

- [x] Busca textual.
- [x] Filtros.
- [x] Compatibilidade.
- [x] Ordenação por preço.
- [x] Ordenação por distância.
- [x] Promoções.

### Fase 5 — Geolocalização

- [x] Nominatim.
- [x] PostGIS.
- [x] Consulta por proximidade.
- [ ] Leaflet.
- [ ] Marcadores.
- [x] Distância.

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
