import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { AuthContext } from '../context/AuthContext';
import { apiClient, getAuthHeaders } from '../api/apiClient';
import SecurityInboxPage from './SecurityInboxPage';
import SystemCategoriesPanel from '../components/panel_admin/SystemCategoriesPanel';
import AdminRefundsPanel from '../components/panel_admin/AdminRefundsPanel';
import OrganizerRequestsPanel from '../components/panel_admin/OrganizerRequestsPanel';

const AdminPanelPage = () => {
  const { t } = useTranslation();
  const { currentUser, authCredentials } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState('kategorie');
  const [tabCounts, setTabCounts] = useState({
    zwroty: 0,
    wnioski: 0,
    zgłoszenia: 0,
  });

  const isAdmin = String(currentUser?.rola || '').toUpperCase() === 'ADMIN';
  const adminTabs = useMemo(() => ([
    { id: 'kategorie', label: t('admin.tabs.categories') },
    { id: 'zwroty', label: t('admin.tabs.refunds') },
    { id: 'wnioski', label: t('admin.tabs.requests') },
    { id: 'zgłoszenia', label: t('admin.tabs.security') }
  ]), [t]);

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

  const tabsWithCounts = useMemo(() => adminTabs.map((tab) => {
    const count = tabCounts[tab.id];
    const shouldShowCount = Number.isFinite(count);
    return {
      ...tab,
      displayLabel: shouldShowCount ? `${tab.label} (${count})` : tab.label,
    };
  }), [adminTabs, tabCounts]);

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
        <h2>{t('admin.title')}</h2>
        <nav className="settings-nav" aria-label={t('admin.nav.ariaLabel')}>
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
              <h3>{t('admin.categories.title')}</h3>
              <p>{t('admin.categories.subtitle')}</p>
              <SystemCategoriesPanel />
            </>
          )}

          {activeTab === 'zwroty' && (
            <>
              <h3>{t('admin.refunds.title')}</h3>
              <p>{t('admin.refunds.subtitle')}</p>
              <AdminRefundsPanel />
            </>
          )}

          {activeTab === 'wnioski' && (
            <>
              <h3>{t('admin.requests.title')}</h3>
              <p>{t('admin.requests.subtitle')}</p>
              <OrganizerRequestsPanel />
            </>
          )}

          {activeTab === 'zgłoszenia' && (
            <>
              <h3>{t('admin.security.title')}</h3>
              <p>{t('admin.security.subtitle')}</p>
              <SecurityInboxPage embedded />
            </>
          )}
        </div>
      </section>
    </div>
  );
};

export default AdminPanelPage;
