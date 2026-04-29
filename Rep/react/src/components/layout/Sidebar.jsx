import React, { useContext } from 'react';
import { NavLink } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';

const Sidebar = () => {
  const { isLoggedIn } = useContext(AuthContext);

  if (!isLoggedIn) return null;

  const navItems =[
    { path: '/dashboard', label: 'Panel główny' },
    { path: '/wydarzenia', label: 'Wydarzenia' },
    { path: '/bilety', label: 'Bilety' },
    { path: '/uczestnicy', label: 'Uczestnicy' },
    { path: '/miejsca', label: 'Miejsca' },
    { path: '/analityka', label: 'Analityka' },
    { path: '/ustawienia', label: 'Ustawienia' }
  ];

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <img src="/image(1).ico" alt="EventFlow" />
        <div className="logo-text">
          <span>EventFlow</span>
        </div>
      </div>
      <nav className="sidebar-nav">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => `nav-button ${isActive ? 'active' : ''}`}
          >
            {item.label}
          </NavLink>
        ))}
      </nav>
      {/* Licznik sesji dodamy tu później za pomocą hooka useSessionTimeout */}
    </aside>
  );
};

export default Sidebar;