# Privacidade, Segurança e Conformidade LGPD — RadarPeças

Este documento registra as medidas técnicas adotadas no RadarPeças em alinhamento à Lei Geral de Proteção de Dados Pessoais (**Lei nº 13.709/2018 — LGPD**) para o escopo do TCC.

---

## 1. Inventário e Finalidade dos Dados Tratados

| Categoria | Dados Armazenados | Finalidade / Base Legal | Retenção e Descarte |
|---|---|---|---|
| **Conta de Usuário (`usuarios`)** | `nome`, `email`, `senha_hash` (BCrypt), `tipo_usuario` | Autenticação e execução de contrato/serviço solicitado pelo titular (Art. 7º, V). | Mantido enquanto a conta existir; exclusão propaga `ON DELETE CASCADE` em garagem, avaliações e lojas. |
| **Estabelecimento (`lojas`)** | `nome_fantasia`, `cnpj` (opcional), `endereco_completo`, `latitude/longitude`, `telefone_contato`, `email_contato` | Divulgação comercial B2C no mapa público para atendimento presencial. | Editável a qualquer momento no Painel do Lojista (`PUT /api/lojas/{id}`). |
| **Garagem Virtual (`garagem_virtual`)** | `modelo_moto_id`, `ano_fabricacao`, `apelido`, `foto_moto_url` | Personalização do filtro de compatibilidade peça × moto. | Usuário pode alterar/excluir veículos livremente via `/garagem`. |
| **Avaliações (`avaliacoes_loja`)** | `nota`, `comentario`, `recomenda`, `data_avaliacao` | Mecanismo de confiança e autorregulação do marketplace. | Associada ao usuário com exclusão em cascata. |
| **Geolocalização do Motociclista** | Coordenadas momentâneas (`lat`, `lon`) via Geolocation API do navegador ou seleção manual no autocomplete | Cálculo de distância até lojas próximas na requisição ativa. | **Não é armazenada em tabela de histórico no back-end**; permanece apenas em estado local do navegador quando o usuário escolhe uma localização. |

---

## 2. Medidas de Segurança e Minimização

1. **Proteção de Credenciais:** senhas nunca são persistidas em texto puro nem retornadas em DTOs. O hash utiliza **BCrypt (`work factor 11`)** com exigência de senha mínima de 8 caracteres combinando letras e números (`SegurancaValidacao`).
2. **Sessão Configurável pelo Usuário:** o formulário de login oferece a opção **"Lembrar-me"** funcional — tokens marcados ficam em `localStorage`; desmarcados permanecem apenas na aba atual em `sessionStorage` (`setToken`).
3. **Logs Estruturados Sem PII Sensível:** `Program.cs` utiliza `Serilog` com `UseSerilogRequestLogging`, registrando apenas método, rota, código HTTP, tempo de resposta e `UserId` (GUID interno opaco quando autenticado). Corpos de requisição (senhas/dados cadastrais), query tokens e cabeçalhos `Authorization` não são gravados nos logs.
4. **Prevenção de IDOR (Quebra de Controle de Acesso Horizontal):** todas as operações de escrita/leitura privada (`Dashboard`, `PUT /api/lojas/{id}`, `EstoqueController`, `GaragemController`) verificam a titularidade comparando o `ClaimTypes.NameIdentifier` do JWT com o proprietário no banco (`403 Forbidden` ou `404 NotFound`).
5. **Blindagem HTTP e Proxy no Front-end:** `vite.config.ts` configura `X-Content-Type-Options: nosniff`, `X-Frame-Options: SAMEORIGIN`, `Referrer-Policy: strict-origin-when-cross-origin` e política `Content-Security-Policy` restritiva para scripts, workers e conexões de API/geocoding.
6. **Segredos Fora do Repositório:** strings de conexão e chaves `Jwt:Secret` são injetadas por variáveis de ambiente (`DATABASE_URL`, `Jwt__Secret`, `Cors__AllowedOrigins`), sendo `.env` explicitamente ignorado no `.gitignore`.

---

## 3. Direitos do Titular no MVP Atual

- **Acesso e Retificação:** o titular visualiza e edita seus dados em `/perfil` (motociclista) e `/lojista` -> *Perfil da Loja* (lojista).
- **Eliminação de Preferências e Veículos:** remoção unitária de motocicletas na Garagem Virtual e limpeza imediata de sessão/tokens ao clicar em "Sair".
- **Evolução Recomendada Pós-TCC:** adicionar endpoint dedicado de autoexclusão completa da conta (`DELETE /api/auth/me`) com confirmação de senha atual e anonimização opcional de comentários publicados.
