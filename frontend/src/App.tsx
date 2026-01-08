import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import CadastroProduto from './pages/CadastroProduto';
import SaidaEstoque from './pages/SaidaEstoque';
import HistoricoSaidas from './pages/HistoricoSaidas';
import EstoqueBaixo from './pages/EstoqueBaixo';
import Settings from './pages/Settings';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function App() {
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
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="cadastrar" element={<CadastroProduto />} />
          <Route path="saida" element={<SaidaEstoque />} />
          <Route path="historico-saidas" element={<HistoricoSaidas />} />
          <Route path="estoque-baixo" element={<EstoqueBaixo />} />
          <Route path="settings" element={<Settings />} />
        </Route>
      </Routes>
    </>
  );
}

export default App;
