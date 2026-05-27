import React, { useContext } from 'react';
import { NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { AuthContext } from '../../context/AuthContext';

const Sidebar = () => {
  const { t } = useTranslation();
  const { isLoggedIn, sessionTimeoutEnabled, sessionTimeLeft } = useContext(AuthContext);

  if (!isLoggedIn) return null;

  const navItems =[
    { path: '/dashboard', label: t('sidebar.nav.dashboard'), icon: '/icons/home.png' },
    { path: '/wydarzenia', label: t('sidebar.nav.events'), icon: '/icons/events.png' },
    { path: '/bilety', label: t('sidebar.nav.tickets'), icon: '/icons/tickets.png' },
    { path: '/uczestnicy', label: t('sidebar.nav.participants'), icon: '/icons/users.png' },
    { path: '/miejsca', label: t('sidebar.nav.places'), icon: '/icons/places.png' },
    { path: '/analityka', label: t('sidebar.nav.analytics'), icon: '/icons/analytics.png' },
    { path: '/ustawienia', label: t('sidebar.nav.settings'), icon: '/icons/settings.png' }
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
        <img src="/icons/image(1).ico" alt="EventFlow" />
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
            <img src={item.icon} alt="" className="nav-button-icon" aria-hidden="true" />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>
      {sessionTimeoutEnabled && (
        <div className="sidebar-session">
          <span className="sidebar-session-label">{t('sidebar.session.expiresIn')}</span>
          <strong className="sidebar-session-time">{formatSessionTime(sessionTimeLeft)}</strong>
        </div>
      )}
    </aside>
  );
};

export default Sidebar;
