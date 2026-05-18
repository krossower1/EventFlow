import React, { useContext, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
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
  const { currentUser } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState('kategorie');

  const isAdmin = String(currentUser?.rola || '').toUpperCase() === 'ADMIN';

  if (!isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="settings-page admin-panel-page">
      <aside className="settings-sidebar">
        <h2>Panel administratora</h2>
        <nav className="settings-nav" aria-label="Zakładki panelu administratora">
          {ADMIN_TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              className={`settings-nav-item ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
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
