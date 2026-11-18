# Plano de Testes e Evidências de Qualidade — RadarPeças

Este documento consolida a estratégia de verificação automatizada (back-end e front-end), validação de segurança/IDOR e evidências de desempenho móvel (**RNF04**).

---

## 1. Pirâmide de Testes Implementada

### 1.1 Back-end (.NET 8 + xUnit + Moq + `WebApplicationFactory`)
Comando: `dotnet test Código/backend/RadarPecas.sln`  
Resultado verificado após os últimos commits da entrega P2: **67 testes aprovados, 0 falhas, 0 ignorados** (`RadarPecas.Tests`).

| Suíte | Escopo Coberto |
|---|---|
| `AuthServiceTests` | Registro, hash BCrypt, validação de e-mail/senha, bloqueio de duplicidade, login e geração de claims JWT. |
| `SegurancaValidacaoTests` | Regras de força de senha, validação matemática de CNPJ, coordenadas geográficas válidas e filtros anti-abuso. |
| `GeolocationServiceTests` | Cálculo Haversine entre coordenadas reais (Itabaiana/SE ↔ Aracaju/SE) e limites do *bounding box* SQL. |
| `CompatibilidadeServiceTests` | Filtragem rigorosa peça × modelo × faixa `ano_inicio..ano_fim`. |
| `BuscaRecomendacaoRankingTests` | Pesos do ranking (35% preço, 30% distância, 20% avaliação, 15% promoção), desempate e edge cases. |
| `EstoquePromocaoTests` | Vigência promocional por data, validação `precoPromocional < precoVenda` e preço efetivo. |
| `BuscaELojasIntegracaoTests` | Consultas de busca por raio, paginação de lojas, geocoding mockado e agregações com EF Core InMemory. |
| `LojaPerfilEDashboardTests` | Perfil público, horários de funcionamento e cálculo real de métricas em `estatisticas_oferta`. |
| `ApiIntegracaoTests` (`CustomWebApplicationFactory`) | **Testes ponta a ponta da pipeline HTTP ASP.NET Core:** `/api/health` (200), rotas públicas (200), login inválido retornando **401** com mensagem útil, oferta inexistente retornando **404**, cadastro duplicado/CNPJ inválido retornando **422**, bloqueio de rotas privadas sem token (**401**), bloqueio de motociclista em rotas de lojista (**403**), **IDOR** Lojista A vs. Lojista B retornando **403**, criação atômica `Usuario + Loja` e registro de visualizações/cliques. |

---

### 1.2 Front-end (React 19 + TypeScript + Vitest + Testing Library)
Comandos:
- Tipagem estrita: `npm run typecheck` (`tsc -b --noEmit`) — **0 erros**
- Lint: `npm run lint` (`eslint .`) — **0 erros/warnings**
- Testes unitários/componentes: `npm run test` (`vitest run`) — **3 suítes, 9 testes aprovados**
- Build de produção + PWA: `npm run build` (`tsc -b && vite build`) — chunks vendor/página abaixo de `190 kB` (máximo `react-vendor`: `189.59 kB` / `gzip: 59.61 kB`).

| Arquivo de Teste | Cenários Verificados |
|---|---|
| `src/lib/__tests__/api.test.ts` | Persistência diferenciada `localStorage` vs. `sessionStorage` (`setToken`), injeção do header `Authorization: Bearer`, desembrulhamento de `ApiResponse<T>.data` e lançamento tipado de `ApiError` em HTTP `401`. |
| `src/lib/__tests__/formatters.test.ts` | Formatação monetária `formatMoneyBR` (pt-BR / BRL), parser de horários legados e estruturados sem prefixo `"Resumo:"` (`parseHorariosFuncionamento` e `formatHorariosFuncionamento`) e gerador dos 7 dias editáveis do painel (`parseHorariosEditor`). |
| `src/routes/__tests__/RequireAuth.test.tsx` | Exibição de estado de carregamento (`loading=true`), redirecionamento para `/login` preservando `state.from` para anônimos e renderização dos filhos para usuários autenticados. |

---

## 2. Evidência de Desempenho RNF04 (`LCP <= 5s` em Slow 4G)

O orçamento de desempenho está codificado em [`Código/frontend/radarpecas-web/lighthouserc.json`](../Código/frontend/radarpecas-web/lighthouserc.json) com **3 execuções consecutivas** sobre o build de produção (`vite preview` em `:4173`) e asserções estritas:

- **Limites configurados (`lighthouserc.json`):**
  - `/` (Home com mapa): `Performance >= 0.80`, `Accessibility >= 0.95`, `Best Practices >= 0.95`, `LCP <= 4.500 ms`, `CLS <= 0.1`, `TBT <= 200 ms`, `total-byte-weight <= 500 kB`.
  - `/busca` (Explorar Ofertas): `Performance >= 0.90`, `Accessibility >= 0.95`, `Best Practices >= 0.95`, `LCP <= 2.500 ms`, `CLS <= 0.1`, `TBT <= 200 ms`, `total-byte-weight <= 500 kB`.
- **Resultados medidos na auditoria Lighthouse CI (Slow 4G simulado, entrega P1 `#38`):**
  - `/busca`: LCP entre **2.337 ms e 2.365 ms** (abaixo dos `2.500 ms` do orçamento e muito abaixo do teto **RNF04 de 5.000 ms**).
  - `/`: LCP entre **4.079 ms e 4.102 ms** (abaixo dos `4.500 ms` configurados e dentro do teto **RNF04 de 5.000 ms**).
- **Para reproduzir localmente (com a API rodando na porta `5150`):**
  ```bash
  cd Código/frontend/radarpecas-web
  npm run build
  npm run lighthouse
  ```

---

## 3. Verificação Manual E2E (Desktop 1280×800 e Mobile 390×844)

Fluxos validados contra PostgreSQL local e ambiente publicado (Vercel + Render + Supabase):
1. **Home (`/`)**: renderização do mapa Leaflet/OSM, busca por cidade/bairro com autocomplete e seleção de loja.
2. **Explorar (`/busca`)**: aplicação e persistência de filtros na URL, *FilterSheet* no mobile e ordenação por compatibilidade/recomendação.
3. **Garagem (`/garagem`)** e **Oferta (`/ofertas/:id`)**: ativação de moto, cálculo automático de compatibilidade, mini-mapa Leaflet e conversão via WhatsApp/Google Maps.
4. **Painel Lojista (`/lojista`)**: navegação entre as 7 abas moduladas, edição rápida inline e publicação de ofertas promocionais.
