import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import { useTheme } from '../context/ThemeContext';
import { Menu, Sun, Moon } from 'lucide-react';

const Layout: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  const closeSidebar = () => setIsSidebarOpen(false);
  const toggleCollapse = () => setIsCollapsed(!isCollapsed);

  return (
    <div className={`layout-container ${isCollapsed ? 'collapsed' : ''}`}>
      {isSidebarOpen && (
        <div className="mobile-overlay" onClick={closeSidebar} />
      )}

      <Sidebar
        isOpen={isSidebarOpen}
        onClose={closeSidebar}
        isCollapsed={isCollapsed}
        toggleCollapse={toggleCollapse}
      />

      <main className="content-area">
        <div className="mobile-header">
          <button
            onClick={toggleSidebar}
            className="btn-secondary"
            style={{ padding: 'var(--space-2) var(--space-3)' }}
          >
            <Menu size={20} />
            <span>Menu</span>
          </button>


        </div>

        <Outlet />
      </main>
    </div>
  );
};

export default Layout;
