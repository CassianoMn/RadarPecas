# RadarPeças Web (`radarpecas-web`)

Interface SPA e PWA Mobile-First do **RadarPeças**, desenvolvida em **React 19 + TypeScript + Vite 8**, responsável pela experiência de descoberta geolocalizada de motopeças (mapa Leaflet/OSM, filtros de compatibilidade, Garagem Virtual) e pelo **Painel do Lojista** modularizado.

---

## Stack e Organização

- **Core:** React 19.2, TypeScript 6, Vite 8.2, React Router DOM 7
- **Mapas e Ícones:** Leaflet 1.9 + OpenStreetMap (lazy loaded), `lucide-react`
- **PWA e Performance:** `vite-plugin-pwa` (Workbox com `NetworkFirst` em `/api/*`, `CacheFirst` em imagens WebP e code splitting de vendors `< 200 kB`)
- **Testes:** Vitest 5 + Testing Library (`@testing-library/react`, `@testing-library/jest-dom`, `jsdom`)

```text
src/
├── auth/             # AuthContext, hook useAuth e controle de sessão JWT
├── components/       # UI base (ui.tsx), Layout/BottomNav, MapaExplorar, FilterSheet, SmartImage, Skeleton
├── context/          # ActiveMotoContext (moto ativa na garagem por userId)
├── lib/              # api.ts, formatters.ts (formatMoneyBR, horários), location.ts, buscaWarmup.ts
├── pages/
│   ├── lojista/      # Módulos do painel: Resumo, NovoProduto, Estoque, Ofertas, CriarOferta, MaisProcurados, Perfil
│   └── ...           # HomePage, BuscaPage, LojasPage, LojaDetalhesPage, OfertaDetalhesPage, GaragemPage, etc.
├── routes/           # RequireAuth, RequireLojista
└── types/            # Contratos TypeScript alinhados aos DTOs da API .NET
```

---

## Scripts Disponíveis

```bash
npm install           # Instala dependências
npm run dev           # Sobe servidor Vite em http://localhost:5173 com proxy /api -> :5150
npm run typecheck     # Verificação estrita TypeScript (tsc -b --noEmit)
npm run lint          # Análise estática ESLint
npm run test          # Executa suíte Vitest (run once)
npm run test:watch    # Executa Vitest em modo watch
npm run build         # Typecheck + build de produção + geração do Service Worker PWA
npm run preview       # Pré-visualização local do dist/ em :4173 com headers CSP/segurança
npm run lighthouse    # Auditoria Lighthouse CI (Slow 4G) conforme lighthouserc.json
```

---

## Variáveis de Ambiente, Proxy e Segurança (`vite.config.ts`)

- `VITE_API_BASE_URL`: URL base da API REST (ex.: `http://localhost:5150/api` localmente ou `https://radarpecas.onrender.com/api` na Vercel).
- **Proxy local:** requisições relativas a `/api/*` em ambiente `vite dev` são encaminhadas automaticamente para `http://localhost:5150`.
- **Headers de segurança (`dev` e `preview`):** `X-Content-Type-Options: nosniff`, `X-Frame-Options: SAMEORIGIN`, `Referrer-Policy: strict-origin-when-cross-origin` e `Content-Security-Policy` compatível com OpenStreetMap, Nominatim, Photon, imagens locais/HTTPS e Service Worker Workbox.
