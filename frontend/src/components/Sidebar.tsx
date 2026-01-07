import React from 'react';
import { NavLink } from 'react-router-dom';


interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  return (
    <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
      <div className="sidebar-header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
          <h2>Controle de Estoque</h2>
          <button className="btn-close-sidebar" onClick={onClose}>×</button>
        </div>
      </div>
      <nav className="sidebar-nav">
        <NavLink to="/" className={({ isActive }) => (isActive ? 'active' : '')} onClick={onClose}>
          📊 Dashboard
        </NavLink>

        <NavLink to="/cadastrar" className={({ isActive }) => (isActive ? 'active' : '')} onClick={onClose}>
          ➕ Cadastrar Produto
        </NavLink>

        <NavLink to="/saida" className={({ isActive }) => (isActive ? 'active' : '')} onClick={onClose}>
          📤 Saída de Estoque
        </NavLink>

        <NavLink to="/historico-saidas" className={({ isActive }) => (isActive ? 'active' : '')} onClick={onClose}>
          📋 Histórico de Saídas
        </NavLink>

        <NavLink to="/estoque" className={({ isActive }) => (isActive ? 'active' : '')} onClick={onClose}>
          📦 Gerenciar Estoque
        </NavLink>

        <NavLink to="/estoque-baixo" className={({ isActive }) => (isActive ? 'active' : '')} onClick={onClose}>
          📉 Estoque Baixo
        </NavLink>

        <NavLink to="/logs-exclusao" className={({ isActive }) => (isActive ? 'active' : '')} onClick={onClose}>
          🗑️ Logs de Exclusão
        </NavLink>

        <NavLink to="/settings" className={({ isActive }) => (isActive ? 'active' : '')} onClick={onClose}>
          ⚙️ Configurações
        </NavLink>
      </nav>
    </aside>
  );
};

export default Sidebar;
