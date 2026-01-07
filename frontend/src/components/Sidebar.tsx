import React from 'react';
import { NavLink } from 'react-router-dom';
import './Sidebar.css';

const Sidebar: React.FC = () => {
  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <h2>Estoque App</h2>
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

        <NavLink to="/estoque" className={({ isActive }) => (isActive ? 'active' : '')}>
          📦 Gerenciar Estoque
        </NavLink>

        <NavLink to="/logs-exclusao" className={({ isActive }) => (isActive ? 'active' : '')}>
          🗑️ Logs de Exclusão
        </NavLink>
      </nav>
    </aside>
  );
};

export default Sidebar;
