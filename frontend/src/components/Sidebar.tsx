import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  PackagePlus,
  LogOut,
  History,
  AlertTriangle,
  Settings,
  Box
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  return (
    <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
      <div className="sidebar-logo">
        <div className="logo-icon">
          <Box size={20} />
        </div>
        <div>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 700 }}>StockOS</h2>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Empresarial</span>
        </div>
      </div>

      <nav style={{ flex: 1 }}>
        <div className="sidebar-section">
          <div className="sidebar-label">Menu Principal</div>

          <NavLink to="/" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} onClick={onClose}>
            <LayoutDashboard size={20} />
            <span>Visão Geral</span>
          </NavLink>

          <NavLink to="/saida" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} onClick={onClose}>
            <LogOut size={20} />
            <span>Saída Rápida</span>
          </NavLink>

          <NavLink to="/cadastrar" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} onClick={onClose}>
            <PackagePlus size={20} />
            <span>Novo Produto</span>
          </NavLink>
        </div>

        <div className="sidebar-section">
          <div className="sidebar-label">Análises</div>

          <NavLink to="/historico-saidas" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} onClick={onClose}>
            <History size={20} />
            <span>Histórico</span>
          </NavLink>

          <NavLink to="/estoque-baixo" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} onClick={onClose}>
            <AlertTriangle size={20} />
            <span>Estoque Crítico</span>
          </NavLink>
        </div>

        <div className="sidebar-section">
          <div className="sidebar-label">Sistema</div>

          <NavLink to="/settings" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} onClick={onClose}>
            <Settings size={20} />
            <span>Configurações</span>
          </NavLink>
        </div>
      </nav>

      <div className="user-profile">
        <div className="avatar">
          <img src="https://ui-avatars.com/api/?name=Admin+User&background=0D8ABC&color=fff" alt="User" />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>Administrador</span>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>admin@stockos.io</span>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
