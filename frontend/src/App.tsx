import React, { Suspense } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Layout from './components/Layout';
import Login from './pages/Login';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider, useAuth } from './context/AuthContext';

// Lazy loading de páginas - carrega sob demanda
const Dashboard = React.lazy(() => import('./pages/Dashboard'));
const CadastroProduto = React.lazy(() => import('./pages/CadastroProduto'));
const SaidaEstoque = React.lazy(() => import('./pages/SaidaEstoque'));
const HistoricoSaidas = React.lazy(() => import('./pages/HistoricoSaidas'));
const ControleEstoque = React.lazy(() => import('./pages/ControleEstoque'));
const Relatorios = React.lazy(() => import('./pages/Relatorios'));
const Settings = React.lazy(() => import('./pages/Settings'));
const LogsAdmin = React.lazy(() => import('./pages/LogsAdmin'));
const SetupProfile = React.lazy(() => import('./pages/SetupProfile'));

// Componente para rotas protegidas
const PrivateRoute = ({ children }: { children: React.ReactNode }) => {
  const { session, loading, profile } = useAuth();
  const location = useLocation();

  if (loading) {
    return <div className="loading-screen">Carregando...</div>;
  }

  if (!session) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Force profile setup if no nickname, unless already on the setup page
  if (!profile?.nickname && location.pathname !== '/setup-profile') {
    return <Navigate to="/setup-profile" replace />;
  }

  return children;
};

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <ToastContainer
          position="bottom-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          aria-label="Notificações"
        />
        <Suspense fallback={
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '100vh',
            color: 'var(--text-muted)',
            fontSize: 'var(--text-sm)'
          }}>
            Carregando...
          </div>
        }>
          <Routes>
            <Route path="/login" element={<Login />} />

            <Route path="/setup-profile" element={
              <PrivateRoute>
                <SetupProfile />
              </PrivateRoute>
            } />

            <Route path="/" element={
              <PrivateRoute>
                <Layout />
              </PrivateRoute>
            }>
              <Route index element={<Dashboard />} />
              <Route path="cadastrar" element={<CadastroProduto />} />
              <Route path="saida" element={<SaidaEstoque />} />
              <Route path="historico-saidas" element={<HistoricoSaidas />} />
              <Route path="estoque" element={<ControleEstoque />} />
              <Route path="relatorios" element={<Relatorios />} />
              <Route path="settings" element={<Settings />} />
              <Route path="admin/logs" element={<LogsAdmin />} />
            </Route>
          </Routes>
        </Suspense>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
