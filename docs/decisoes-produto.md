# Decisões de Produto — Demo e Fluxos do Usuário (Issue #28)

Este registro documenta as decisões de produto tomadas para alinhar protótipo, interface e implementação na entrega P1:

## 1. Reserva de Peças e Rotas até a Loja
- **Decisão:** Manter a arquitetura de conversão direta via **WhatsApp (`wa.me`)** para reserva com a loja física e **Google Maps** para traçado de rota externa, complementada pelo **mini-mapa Leaflet interativo** na página de detalhes da oferta (`/ofertas/:id`).
- **Justificativa:** O RadarPeças atua como plataforma de descoberta, compatibilidade e conexão (*lead generation* para lojas físicas locais), sem intermediar checkout ou logística própria nesta etapa do TCC. A métrica de conversão é contabilizada via `POST /api/ofertas/{id}/clique`.

## 2. Login Social, "Lembrar-me" e Recuperação de Senha
- **Login Social (Google/Apple):** Removidos os botões visuais simulados que exibiam `alert()`, evitando prometer fluxos OAuth inexistentes no MVP.
- **"Lembrar-me":** Implementado de forma funcional — quando marcado, o JWT é persistido em `localStorage`; quando desmarcado, fica restrito à sessão atual em `sessionStorage`.
- **"Esqueceu a senha?":** Substituído o `alert()` nativo por painel informativo inline acessível (`role="status"`), orientando sobre alteração de senha via perfil autenticado ou suporte.

## 3. Imagens do Seed e Dados Fictícios
- Links externos quebrados ou com placeholder de CDN (MercadoLivre/Motokart/Wikimedia) foram substituídos por assets otimizados locais em `public/seed/*.webp` (mantendo fallback automático no frontend).
- Removido o comportamento do painel que criava uma loja fictícia em São Paulo (`MotoPeças Expresso` / `(11) 98765-4321`) caso a consulta inicial falhasse.
