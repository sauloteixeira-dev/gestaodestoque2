import React, { useState, useEffect, useRef } from 'react';
import { NavLink } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  PackagePlus,
  LogOut,
  History,
  Settings,
  Box,
  FileText,
  Sun,
  Moon,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  isCollapsed: boolean;
  toggleCollapse: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose, isCollapsed, toggleCollapse }) => {
  const { theme, toggleTheme } = useTheme();
  const { user, signOut } = useAuth();
  // Internal state removed: isCollapsed is now controlled by parent
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
          <div className="sidebar-logo-text" style={{ flex: 1, lineHeight: 1.2 }}>
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

          <button
            onClick={toggleTheme}
            style={{
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--text-secondary)',
              padding: '4px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: 'var(--radius-md)',
              transition: 'all 0.2s ease'
            }}
            title={theme === 'dark' ? 'Mudar para Tema Claro' : 'Mudar para Tema Escuro'}
            className="theme-toggle-btn"
          >
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>
        </div>

        <nav style={{ flex: 1 }}>
          <div className="sidebar-section">
            <div className="sidebar-label">Menu Principal</div>

            <NavLink to="/" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} end onClick={onClose} title="Dashboard">
              <LayoutDashboard size={18} />
              <span>Dashboard</span>
            </NavLink>

            <NavLink to="/cadastrar" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} onClick={onClose} title="Novo Produto">
              <PackagePlus size={18} />
              <span>Novo Produto</span>
            </NavLink>

            <NavLink to="/saida" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} onClick={onClose} title="Saída de Produtos">
              <LogOut size={18} />
              <span>Saída de Produtos</span>
            </NavLink>

            <NavLink to="/historico-saidas" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} onClick={onClose} title="Comprovante">
              <History size={18} />
              <span>Comprovante</span>
            </NavLink>
          </div>

          <div className="sidebar-section">
            <div className="sidebar-label">Análises</div>

            <NavLink to="/estoque" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} onClick={onClose} title="Controle de Estoque">
              <Box size={18} />
              <span>Controle de Estoque</span>
            </NavLink>

            <NavLink to="/relatorios" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} onClick={onClose} title="Relatórios">
              <FileText size={18} />
              <span>Relatórios</span>
            </NavLink>
          </div>

          <div className="sidebar-section">
            <div className="sidebar-label">Sistema</div>

            <NavLink to="/settings" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} onClick={onClose} title="Parâmetros">
              <Settings size={18} />
              <span>Parâmetros</span>
            </NavLink>
          </div>
        </nav>


        <div ref={userMenuRef} className="user-profile-container" style={{ position: 'relative' }}>
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
              <img src={`https://ui-avatars.com/api/?name=${user?.email || 'User'}&background=3b82f6&color=fff`} alt="User" />
            </div>
            <div className="user-profile-info" style={{
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
                Usuário
              </span>
              <span className="mono" style={{
                fontSize: 'var(--text-xs)',
                color: 'var(--text-faint)',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap'
              }}>
                {user?.email}
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
              zIndex: 1000,
              padding: 'var(--space-2)'
            }}>
              <button
                onClick={() => {
                  signOut();
                  setIsUserMenuOpen(false);
                }}
                className="btn-danger-ghost w-full"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--space-2)',
                  fontSize: 'var(--font-sm)',
                  justifyContent: 'flex-start',
                  padding: 'var(--space-2)'
                }}
              >
                <LogOut size={16} />
                Sair do Sistema
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* Collapse Button - Floating outside sidebar */}
      <button
        onClick={toggleCollapse}
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
  );
};

export default Sidebar;
