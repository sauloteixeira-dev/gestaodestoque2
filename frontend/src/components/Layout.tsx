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
<<<<<<< HEAD
=======
      {/* Mobile Overlay */}
>>>>>>> 50a17daf1625e8ecbeb04f2620eefa2e0a6894b5
      {isSidebarOpen && (
        <div className="mobile-overlay" onClick={closeSidebar} />
      )}

<<<<<<< HEAD
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
=======
      {/* Sidebar */}
      <Sidebar isOpen={isSidebarOpen} onClose={closeSidebar} />

      {/* Main Content */}
      <main className="content-area">
        {/* Mobile Header */}
        <div className="mobile-header">
          <button onClick={toggleSidebar} style={{ background: 'none', border: 'none', color: 'var(--text-primary)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Menu size={24} />
            <span style={{ fontWeight: 600 }}>Menu</span>
>>>>>>> 50a17daf1625e8ecbeb04f2620eefa2e0a6894b5
          </button>
        </div>

        <Outlet />
      </main>
    </div>
  );
};

export default Layout;
