import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { apiClient, getAuthHeaders } from '../api/apiClient';
import SecurityInboxPage from './SecurityInboxPage';
import SystemCategoriesPanel from '../components/panel_admin/SystemCategoriesPanel';
import AdminRefundsPanel from '../components/panel_admin/AdminRefundsPanel';
import OrganizerRequestsPanel from '../components/panel_admin/OrganizerRequestsPanel';

const ADMIN_TABS = [
  { id: 'kategorie', label: 'Kategorie systemowe' },
  { id: 'zwroty', label: 'Zarządzanie zwrotami' },
  { id: 'wnioski', label: 'Wnioski' },
  { id: 'zgłoszenia', label: 'Zgłoszenia' }
];

const AdminPanelPage = () => {
  const { currentUser, authCredentials } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState('kategorie');
  const [tabCounts, setTabCounts] = useState({
    zwroty: 0,
    wnioski: 0,
    zgłoszenia: 0,
  });

  const isAdmin = String(currentUser?.rola || '').toUpperCase() === 'ADMIN';

  const getRequestConfig = useCallback(() => {
    const config = { withCredentials: true };
    if (authCredentials?.login && authCredentials?.password) {
      config.headers = getAuthHeaders(authCredentials.login, authCredentials.password);
    }
    return config;
  }, [authCredentials]);

  const loadTabCounts = useCallback(async () => {
    if (!isAdmin) return;
    try {
      const requestConfig = getRequestConfig();
      const [refundsRes, organizerRes, securityRes] = await Promise.all([
        apiClient.get('/zwroty', requestConfig),
        apiClient.get('/organizator', requestConfig),
        apiClient.get('/admin/security-tickets?status=NEW', requestConfig),
      ]);

      const refunds = Array.isArray(refundsRes?.data) ? refundsRes.data : [];
      const requests = Array.isArray(organizerRes?.data) ? organizerRes.data : [];
      const tickets = Array.isArray(securityRes?.data) ? securityRes.data : [];

      setTabCounts({
        zwroty: refunds.filter((item) => String(item?.stan || '').toLowerCase() === 'oczekuje').length,
        wnioski: requests.filter((item) => item?.zweryfikow !== true).length,
        zgłoszenia: tickets.length,
      });
    } catch {
    }
  }, [getRequestConfig, isAdmin]);

  const tabsWithCounts = useMemo(() => ADMIN_TABS.map((tab) => {
    const count = tabCounts[tab.id];
    const shouldShowCount = Number.isFinite(count);
    return {
      ...tab,
      displayLabel: shouldShowCount ? `${tab.label} (${count})` : tab.label,
    };
  }), [tabCounts]);

  useEffect(() => {
    if (!isAdmin) return undefined;
    loadTabCounts();
    const intervalId = window.setInterval(loadTabCounts, 30000);
    return () => window.clearInterval(intervalId);
  }, [isAdmin, loadTabCounts]);

  if (!isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="settings-page admin-panel-page">
      <aside className="settings-sidebar">
        <h2>Panel administratora</h2>
        <nav className="settings-nav" aria-label="Zakładki panelu administratora">
          {tabsWithCounts.map((tab) => (
            <button
              key={tab.id}
              type="button"
              className={`settings-nav-item ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.displayLabel}
            </button>
          ))}
        </nav>
      </aside>

      <section className="settings-content">
        <div className="settings-panel">
          {activeTab === 'kategorie' && (
            <>
              <h3>Kategorie systemowe</h3>
              <p>Dodawaj globalne kategorie wydarzeń widoczne dla wszystkich organizatorów.</p>
              <SystemCategoriesPanel />
            </>
          )}

          {activeTab === 'zwroty' && (
            <>
              <h3>Zarządzanie zwrotami</h3>
              <p>Przeglądaj i akceptuj prośby użytkowników o zwrot biletów.</p>
              <AdminRefundsPanel />
            </>
          )}

          {activeTab === 'wnioski' && (
            <>
              <h3>Wnioski o rolę organizatora</h3>
              <p>Zatwierdzaj lub odrzucaj wnioski użytkowników o rolę ORG.</p>
              <OrganizerRequestsPanel />
            </>
          )}

          {activeTab === 'zgłoszenia' && (
            <>
              <h3>Zgłoszenia bezpieczeństwa</h3>
              <p>Wspólna skrzynka alertów. Nowe pozycje są widoczne dla wszystkich administratorów.</p>
              <SecurityInboxPage embedded />
            </>
          )}
        </div>
      </section>
    </div>
  );
};

export default AdminPanelPage;
