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
      {/* Mobile Overlay */}
      {isSidebarOpen && (
        <div className="mobile-overlay" onClick={closeSidebar} />
      )}

      {/* Sidebar */}
      <Sidebar isOpen={isSidebarOpen} onClose={closeSidebar} />

      {/* Main Content */}
      <main className="content-area">
        {/* Mobile Header */}
        <div className="mobile-header">
          <button onClick={toggleSidebar} style={{ background: 'none', border: 'none', color: 'var(--text-primary)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Menu size={24} />
            <span style={{ fontWeight: 600 }}>Menu</span>
          </button>
        </div>

        <Outlet />
      </main>
    </div>
  );
};

export default Layout;
