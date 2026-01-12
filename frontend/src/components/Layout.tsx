import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import { Menu } from 'lucide-react';

const Layout: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  const closeSidebar = () => setIsSidebarOpen(false);

  return (
    <div className="layout-container">
      {isSidebarOpen && (
        <div className="mobile-overlay" onClick={closeSidebar} />
      )}

      <Sidebar isOpen={isSidebarOpen} onClose={closeSidebar} />

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
