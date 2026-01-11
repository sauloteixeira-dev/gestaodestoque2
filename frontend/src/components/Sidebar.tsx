
import React from 'react';
import { NavLink } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import {
  LayoutDashboard,
  PackagePlus,
  LogOut,
  History,
  AlertTriangle,
  Settings,
  Box,
  FileText,
  Sun,
  Moon
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { theme, toggleTheme } = useTheme();

  return (
    <aside className={`sidebar ${isOpen ? 'open' : ''} `}>
      <div className="sidebar-logo">
        <div className="logo-icon">
          <Box size={20} />
        </div>
        <div style={{ flex: 1 }}>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 700 }}>STockOS</h2>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Empresarial</span>
        </div>
        <button
          onClick={toggleTheme}
          style={{
            background: 'transparent',
            border: 'none',
            color: 'var(--text-secondary)',
            cursor: 'pointer',
            padding: '4px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
          title={theme === 'dark' ? 'Mudar para Tema Claro' : 'Mudar para Tema Escuro'}
        >
          {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
        </button>
      </div>

      <nav style={{ flex: 1 }}>
        <div className="sidebar-section">
          <div className="sidebar-label">MENU PRINCIPAL</div>

          <NavLink to="/" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} end onClick={onClose}>
            <LayoutDashboard size={20} />
            <span>Dashboard</span>
          </NavLink>

          <NavLink to="/cadastrar" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} onClick={onClose}>
            <PackagePlus size={20} />
            <span>Novo Produto</span>
          </NavLink>

          <NavLink to="/saida" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} onClick={onClose}>
            <LogOut size={20} />
            <span>Saída de Produtos</span>
          </NavLink>

          <NavLink to="/historico-saidas" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} onClick={onClose}>
            <History size={20} />
            <span>Comprovante</span>
          </NavLink>
        </div>

        <div className="sidebar-section">
          <div className="sidebar-label">ANÁLISES</div>

          <NavLink to="/relatorios" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} onClick={onClose}>
            <FileText size={20} />
            <span>Relatórios</span>
          </NavLink>

          <NavLink to="/estoque-baixo" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} onClick={onClose}>
            <AlertTriangle size={20} />
            <span>Estoque</span>
          </NavLink>
        </div>

        <div className="sidebar-section">
          <div className="sidebar-label">Sistema</div>

          <NavLink to="/settings" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} onClick={onClose}>
            <Settings size={20} />
            <span>Parâmetros</span>
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
