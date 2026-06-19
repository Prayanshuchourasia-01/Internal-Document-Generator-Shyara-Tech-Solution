import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FaBars, FaTimes, FaHome, FaBuilding, FaHistory, FaFileAlt, FaPlus, FaCog } from 'react-icons/fa';
import logo from '../assets/logo.png'; // ← ADD THIS IMPORT

function Layout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  const menuItems = [
    { path: '/', label: 'Home', icon: <FaHome /> },
    { path: '/departments', label: 'Departments', icon: <FaBuilding /> },
    { path: '/history', label: 'History', icon: <FaHistory /> },
    { path: '/templates', label: 'Templates', icon: <FaFileAlt /> },
    { path: '/generate-document', label: 'Generate Document', icon: <FaPlus /> },
    { path: '/settings', label: 'Settings', icon: <FaCog /> },
  ];

  return (
    <div className="layout">
      {/* Mobile Menu Button */}
      <button 
        className="mobile-menu-btn"
        onClick={() => setSidebarOpen(!sidebarOpen)}
      >
        {sidebarOpen ? <FaTimes /> : <FaBars />}
      </button>

      {/* Overlay */}
      <div 
        className={`sidebar-overlay ${sidebarOpen ? 'active' : ''}`}
        onClick={() => setSidebarOpen(false)}
      />

      {/* Sidebar */}
      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        {/* FIXED: Use imported logo instead of public URL */}
        <div className="logo">
          <img src={logo} alt="Shyara" />
        </div>

        <nav className="menu">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`menu-item ${location.pathname === item.path ? 'active' : ''}`}
              onClick={() => setSidebarOpen(false)}
            >
              {item.icon}
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>

        <div className="version">
          Shyara DocuFlow v1.0
        </div>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        <div className="header">
          <h2 style={{ margin: 0, color: '#333', fontSize: '18px' }}>
            Internal Document Automation & Management
          </h2>
        </div>
        <div className="page-container">
          {children}
        </div>
      </main>
    </div>
  );
}

export default Layout;