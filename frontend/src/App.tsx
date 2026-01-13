import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import CadastroProduto from './pages/CadastroProduto';
import SaidaEstoque from './pages/SaidaEstoque';
import HistoricoSaidas from './pages/HistoricoSaidas';
import ControleEstoque from './pages/ControleEstoque';
import Relatorios from './pages/Relatorios';
import Settings from './pages/Settings';
import LogsAdmin from './pages/LogsAdmin';
import SetupProfile from './pages/SetupProfile';
import Login from './pages/Login';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider, useAuth } from './context/AuthContext';

// Componente para rotas protegidas
const PrivateRoute = ({ children }: { children: JSX.Element }) => {
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
        <Routes>
          <Route path="/login" element={<Login />} />

          {/* Rota Protegida de Setup - Separate from main layout to avoid sidebar */}
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
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
