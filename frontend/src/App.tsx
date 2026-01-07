import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import CadastroProduto from './pages/CadastroProduto';
import Estoque from './pages/Estoque';
import SaidaEstoque from './pages/SaidaEstoque';
import HistoricoSaidas from './pages/HistoricoSaidas';
import LogsExclusao from './pages/LogsExclusao';
import Login from './pages/Login';
import ProtectedRoute from './components/ProtectedRoute';
import { useAuth } from './context/AuthContext';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function App() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column',
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)',
        color: 'white',
        gap: '1rem'
      }}>
        <div style={{
          width: '50px',
          height: '50px',
          border: '5px solid rgba(100, 108, 255, 0.3)',
          borderTop: '5px solid #646cff',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }}></div>
        <p style={{ fontSize: '1.2rem', fontWeight: 500 }}>Carregando...</p>
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  return (
    <>
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
        <Route path="/login" element={user ? <Navigate to="/" replace /> : <Login />} />
        
        <Route path="/" element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }>
          <Route index element={<Dashboard />} />
          <Route path="cadastrar" element={<CadastroProduto />} />
          <Route path="saida" element={<SaidaEstoque />} />
          <Route path="historico-saidas" element={<HistoricoSaidas />} />
          <Route 
            path="estoque" 
            element={
              <ProtectedRoute requireAdmin>
                <Estoque />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="logs-exclusao" 
            element={
              <ProtectedRoute requireAdmin>
                <LogsExclusao />
              </ProtectedRoute>
            } 
          />
        </Route>
      </Routes>
    </>
  );
}

export default App;
