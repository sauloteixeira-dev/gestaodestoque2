import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Sidebar.css';

const Sidebar: React.FC = () => {
  const { user, isAdmin, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    } finally {
      navigate('/login');
    }
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <h2>Estoque App</h2>
        {user && (
          <>
            <div className="user-info">
              <p className="user-name">{user.nome}</p>
              <p className="user-role">{isAdmin ? '👑 Admin' : '👤 Usuário'}</p>
            </div>
            <button onClick={handleLogout} className="btn-logout">
              🚪 Sair
            </button>
          </>
        )}
      </div>
      <nav className="sidebar-nav">
        <NavLink to="/" className={({ isActive }) => (isActive ? 'active' : '')}>
          📊 Dashboard
        </NavLink>
        
        <NavLink to="/cadastrar" className={({ isActive }) => (isActive ? 'active' : '')}>
          ➕ Cadastrar Produto
        </NavLink>
        
        <NavLink to="/saida" className={({ isActive }) => (isActive ? 'active' : '')}>
          📤 Saída de Estoque
        </NavLink>
        
        <NavLink to="/historico-saidas" className={({ isActive }) => (isActive ? 'active' : '')}>
          📋 Histórico de Saídas
        </NavLink>
        
        {/* Rotas apenas para Admin */}
        {isAdmin && (
          <>
            <NavLink to="/estoque" className={({ isActive }) => (isActive ? 'active' : '')}>
              📦 Gerenciar Estoque
            </NavLink>
            <NavLink to="/logs-exclusao" className={({ isActive }) => (isActive ? 'active' : '')}>
              🗑️ Logs de Exclusão
            </NavLink>
          </>
        )}
      </nav>
    </aside>
  );
};

export default Sidebar;
