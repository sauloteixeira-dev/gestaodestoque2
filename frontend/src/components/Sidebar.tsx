<<<<<<< HEAD
import React, { useState, useEffect, useRef } from 'react';
=======

import React from 'react';
>>>>>>> 50a17daf1625e8ecbeb04f2620eefa2e0a6894b5
import { NavLink } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import {
  LayoutDashboard,
  PackagePlus,
  LogOut,
  History,
<<<<<<< HEAD
=======
  AlertTriangle,
>>>>>>> 50a17daf1625e8ecbeb04f2620eefa2e0a6894b5
  Settings,
  Box,
  FileText,
  Sun,
<<<<<<< HEAD
  Moon,
  ChevronLeft,
  ChevronRight
=======
  Moon
>>>>>>> 50a17daf1625e8ecbeb04f2620eefa2e0a6894b5
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { theme, toggleTheme } = useTheme();
<<<<<<< HEAD
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };

    if (isUserMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isUserMenuOpen]);

  return (
    <>
      <aside className={`sidebar ${isOpen ? 'open' : ''} ${isCollapsed ? 'collapsed' : ''}`}>
        <div className="sidebar-logo">
          <div className="logo-icon">
            <Box size={18} />
          </div>
          {!isCollapsed && (
            <div style={{ flex: 1, lineHeight: 1.2 }}>
              <h2 style={{
                fontSize: 'var(--text-md)',
                fontWeight: 'var(--font-bold)',
                letterSpacing: '-0.01em'
              }}>
                StockOS
              </h2>
              <span style={{
                fontSize: 'var(--text-xs)',
                color: 'var(--text-faint)'
              }}>
                Empresarial
              </span>
            </div>
          )}
        </div>

      <nav style={{ flex: 1 }}>
        <div className="sidebar-section">
          {!isCollapsed && <div className="sidebar-label">Menu Principal</div>}

          <NavLink to="/" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} end onClick={onClose} title="Dashboard">
            <LayoutDashboard size={18} />
            {!isCollapsed && <span>Dashboard</span>}
          </NavLink>

          <NavLink to="/cadastrar" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} onClick={onClose} title="Novo Produto">
            <PackagePlus size={18} />
            {!isCollapsed && <span>Novo Produto</span>}
          </NavLink>

          <NavLink to="/saida" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} onClick={onClose} title="Saída de Produtos">
            <LogOut size={18} />
            {!isCollapsed && <span>Saída de Produtos</span>}
          </NavLink>

          <NavLink to="/historico-saidas" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} onClick={onClose} title="Comprovante">
            <History size={18} />
            {!isCollapsed && <span>Comprovante</span>}
          </NavLink>
        </div>

        <div className="sidebar-section">
          {!isCollapsed && <div className="sidebar-label">Análises</div>}

          <NavLink to="/estoque" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} onClick={onClose} title="Controle de Estoque">
            <Box size={18} />
            {!isCollapsed && <span>Controle de Estoque</span>}
          </NavLink>

          <NavLink to="/relatorios" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} onClick={onClose} title="Relatórios">
            <FileText size={18} />
            {!isCollapsed && <span>Relatórios</span>}
          </NavLink>
        </div>

        <div className="sidebar-section">
          {!isCollapsed && <div className="sidebar-label">Sistema</div>}

          <NavLink to="/settings" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} onClick={onClose} title="Parâmetros">
            <Settings size={18} />
            {!isCollapsed && <span>Parâmetros</span>}
          </NavLink>
        </div>
      </nav>

      {!isCollapsed && (
        <div ref={userMenuRef} style={{ position: 'relative' }}>
          <button
            onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
            className="user-profile"
            style={{
              width: '100%',
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              padding: 0
            }}
          >
            <div className="avatar">
              <img src="https://ui-avatars.com/api/?name=Admin+User&background=3b82f6&color=fff" alt="User" />
            </div>
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              lineHeight: 1.3,
              overflow: 'hidden',
              textAlign: 'left'
            }}>
              <span style={{
                fontSize: 'var(--text-sm)',
                fontWeight: 'var(--font-semibold)',
                color: 'var(--text-primary)'
              }}>
                Administrador
              </span>
              <span className="mono" style={{
                fontSize: 'var(--text-xs)',
                color: 'var(--text-faint)',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap'
              }}>
                admin@stockos.io
              </span>
            </div>
          </button>

          {/* Dropdown Menu */}
          {isUserMenuOpen && (
            <div style={{
              position: 'absolute',
              bottom: '100%',
              left: 0,
              right: 0,
              marginBottom: 'var(--space-2)',
              background: 'var(--bg-secondary)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-md)',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
              overflow: 'hidden',
              zIndex: 1000
            }}>
              <button
                onClick={() => {
                  toggleTheme();
                  setIsUserMenuOpen(false);
                }}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--space-3)',
                  padding: 'var(--space-3)',
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--text-primary)',
                  cursor: 'pointer',
                  fontSize: 'var(--text-sm)',
                  transition: 'background-color 0.15s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--hover-bg)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }}
              >
                {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
                <span>{theme === 'dark' ? 'Tema Claro' : 'Tema Escuro'}</span>
              </button>
            </div>
          )}
        </div>
      )}
      </aside>

      {/* Collapse Button - Floating outside sidebar */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="sidebar-collapse-btn"
        style={{
          position: 'fixed',
          left: isCollapsed ? '68px' : '248px',
          top: 'var(--space-6)',
          background: 'var(--bg-secondary)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-md)',
          color: 'var(--text-secondary)',
          cursor: 'pointer',
          padding: 'var(--space-2)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          width: '32px',
          height: '32px',
          zIndex: 100,
          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = 'var(--border-strong)';
          e.currentTarget.style.backgroundColor = 'var(--hover-bg)';
          e.currentTarget.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.15)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = 'var(--border)';
          e.currentTarget.style.backgroundColor = 'var(--bg-secondary)';
          e.currentTarget.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.1)';
        }}
        title={isCollapsed ? 'Expandir Menu' : 'Colapsar Menu'}
      >
        {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
      </button>
    </>
=======

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
>>>>>>> 50a17daf1625e8ecbeb04f2620eefa2e0a6894b5
  );
};

export default Sidebar;
