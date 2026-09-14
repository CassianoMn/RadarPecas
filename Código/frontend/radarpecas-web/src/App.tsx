import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './auth/AuthContext';
import { ErrorBoundary } from './components/ErrorBoundary';
import { Layout } from './components/Layout';
import { RequireAuth } from './routes/RequireAuth';
import { HomePage } from './pages/HomePage';
import { LoginPage } from './pages/LoginPage';
import { CadastroPage } from './pages/CadastroPage';
import { BuscaPage } from './pages/BuscaPage';
import { GaragemPage } from './pages/GaragemPage';
import { LojasPage } from './pages/LojasPage';
import { NotFoundPage } from './pages/NotFoundPage';

export default function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route element={<Layout />}>
              <Route index element={<HomePage />} />
              <Route path="login" element={<LoginPage />} />
              <Route path="cadastro" element={<CadastroPage />} />
              <Route path="busca" element={<BuscaPage />} />
              <Route
                path="garagem"
                element={
                  <RequireAuth>
                    <GaragemPage />
                  </RequireAuth>
                }
              />
              <Route path="lojas" element={<LojasPage />} />
              <Route path="*" element={<NotFoundPage />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ErrorBoundary>
  );
}
