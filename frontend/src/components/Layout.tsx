import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';


const Layout: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  const closeSidebar = () => setIsSidebarOpen(false);

  return (
    <div className="layout">
      {/* Overlay para mobile */}
      {isSidebarOpen && (
        <div
          className="sidebar-overlay"
          onClick={closeSidebar}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            zIndex: 999,
            display: 'none' // Será sobrescrito pelo media query
          }}
        />
      )}

      <div className="mobile-topbar" style={{ justifyContent: 'flex-end' }}>
        <button
          className="mobile-menu-btn"
          onClick={toggleSidebar}
          aria-label="Menu"
        >
          ☰
        </button>
      </div>

      <Sidebar isOpen={isSidebarOpen} onClose={closeSidebar} />

      <main className="content">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;
