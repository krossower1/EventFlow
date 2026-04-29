import React, { useContext } from 'react';
import { NavLink } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';

const Sidebar = () => {
  const { isLoggedIn, sessionTimeLeft } = useContext(AuthContext);

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

  const formatSessionTime = (totalSeconds) => {
    const safeSeconds = Math.max(0, totalSeconds || 0);
    const minutes = Math.floor(safeSeconds / 60);
    const seconds = safeSeconds % 60;
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  };

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
      <div className="sidebar-session">
        <span className="sidebar-session-label">Sesja wygasa za</span>
        <strong className="sidebar-session-time">{formatSessionTime(sessionTimeLeft)}</strong>
      </div>
    </aside>
  );
};

export default Sidebar;