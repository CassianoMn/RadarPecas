import { Suspense, lazy } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './auth/AuthContext';
import { ActiveMotoProvider } from './context/ActiveMotoContext';
import { ErrorBoundary } from './components/ErrorBoundary';
import { Layout } from './components/Layout';
import { PageSkeleton } from './components/Skeleton';
import { RequireAuth } from './routes/RequireAuth';
import { RequireLojista } from './routes/RequireLojista';

const HomePage = lazy(() => import('./pages/HomePage').then((m) => ({ default: m.HomePage })));
const LoginPage = lazy(() => import('./pages/LoginPage').then((m) => ({ default: m.LoginPage })));
const CadastroPage = lazy(() => import('./pages/CadastroPage').then((m) => ({ default: m.CadastroPage })));
const BuscaPage = lazy(() => import('./pages/BuscaPage').then((m) => ({ default: m.BuscaPage })));
const GaragemPage = lazy(() => import('./pages/GaragemPage').then((m) => ({ default: m.GaragemPage })));
const AdicionarMotoPage = lazy(() => import('./pages/AdicionarMotoPage').then((m) => ({ default: m.AdicionarMotoPage })));
const LojasPage = lazy(() => import('./pages/LojasPage').then((m) => ({ default: m.LojasPage })));
const LojaDetalhesPage = lazy(() => import('./pages/LojaDetalhesPage').then((m) => ({ default: m.LojaDetalhesPage })));
const AvaliarLojaPage = lazy(() => import('./pages/AvaliarLojaPage').then((m) => ({ default: m.AvaliarLojaPage })));
const OfertaDetalhesPage = lazy(() => import('./pages/OfertaDetalhesPage').then((m) => ({ default: m.OfertaDetalhesPage })));
const PerfilPage = lazy(() => import('./pages/PerfilPage').then((m) => ({ default: m.PerfilPage })));
const LojistaPage = lazy(() => import('./pages/LojistaPage').then((m) => ({ default: m.LojistaPage })));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage').then((m) => ({ default: m.NotFoundPage })));

export default function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <ActiveMotoProvider>
          <BrowserRouter>
            <Routes>
              <Route element={<Layout />}>
                <Route
                  index
                  element={
                    <Suspense fallback={<PageSkeleton />}>
                      <HomePage />
                    </Suspense>
                  }
                />
                <Route
                  path="login"
                  element={
                    <Suspense fallback={<PageSkeleton />}>
                      <LoginPage />
                    </Suspense>
                  }
                />
                <Route
                  path="cadastro"
                  element={
                    <Suspense fallback={<PageSkeleton />}>
                      <CadastroPage />
                    </Suspense>
                  }
                />
                <Route
                  path="busca"
                  element={
                    <Suspense fallback={<PageSkeleton />}>
                      <BuscaPage />
                    </Suspense>
                  }
                />
                <Route
                  path="lojista"
                  element={
                    <RequireLojista>
                      <Suspense fallback={<PageSkeleton />}>
                        <LojistaPage />
                      </Suspense>
                    </RequireLojista>
                  }
                />
                <Route
                  path="garagem"
                  element={
                    <RequireAuth>
                      <Suspense fallback={<PageSkeleton />}>
                        <GaragemPage />
                      </Suspense>
                    </RequireAuth>
                  }
                />
                <Route
                  path="garagem/adicionar"
                  element={
                    <RequireAuth>
                      <Suspense fallback={<PageSkeleton />}>
                        <AdicionarMotoPage />
                      </Suspense>
                    </RequireAuth>
                  }
                />
                <Route
                  path="lojas"
                  element={
                    <Suspense fallback={<PageSkeleton />}>
                      <LojasPage />
                    </Suspense>
                  }
                />
                <Route
                  path="lojas/:id"
                  element={
                    <Suspense fallback={<PageSkeleton />}>
                      <LojaDetalhesPage />
                    </Suspense>
                  }
                />
                <Route
                  path="lojas/:id/avaliar"
                  element={
                    <RequireAuth>
                      <Suspense fallback={<PageSkeleton />}>
                        <AvaliarLojaPage />
                      </Suspense>
                    </RequireAuth>
                  }
                />
                <Route
                  path="perfil"
                  element={
                    <RequireAuth>
                      <Suspense fallback={<PageSkeleton />}>
                        <PerfilPage />
                      </Suspense>
                    </RequireAuth>
                  }
                />
                <Route
                  path="ofertas/:id"
                  element={
                    <Suspense fallback={<PageSkeleton />}>
                      <OfertaDetalhesPage />
                    </Suspense>
                  }
                />
                <Route
                  path="*"
                  element={
                    <Suspense fallback={<PageSkeleton />}>
                      <NotFoundPage />
                    </Suspense>
                  }
                />
              </Route>
            </Routes>
          </BrowserRouter>
        </ActiveMotoProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}
