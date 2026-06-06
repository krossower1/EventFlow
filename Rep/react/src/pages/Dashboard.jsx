import React, { useState, useEffect, useContext, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { AuthContext } from '../context/AuthContext';
import { apiClient, getAuthHeaders } from '../api/apiClient';
import WydarzenieCard from '../components/WydarzenieCard';
import PurchaseModal from '../components/PurchaseModal';
import PatchNotesPanel from '../components/PatchNotesPanel';

const Dashboard = () => {
  const { t } = useTranslation();
  const { currentUser, authCredentials } = useContext(AuthContext);
  const navigate = useNavigate();
  const [openWydarzenia, setOpenWydarzenia] = useState([]);
  const [status, setStatus] = useState({ type: '', message: '' });
  const [zakupFormOpen, setZakupFormOpen] = useState(false);
  const [selectedZakupEvent, setSelectedZakupEvent] = useState(null);
  const [dostepneBilety, setDostepneBilety] = useState([]);
  const [zakupLoading, setZakupLoading] = useState(false);
  const [zakupForm, setZakupForm] = useState({ biletId: '', ilosc: '1', potwierdzPlatnosc: false, seatId: '' });

  const getRequestConfig = useCallback(() => {
    const config = { withCredentials: true };
    if (authCredentials.login && authCredentials.password) {
      config.headers = getAuthHeaders(authCredentials.login, authCredentials.password);
    }
    return config;
  }, [authCredentials]);

  const fetchOpenWydarzenia = useCallback(async () => {
    try {
      const response = await apiClient.get('/wydarzenia/open', getRequestConfig());
      setOpenWydarzenia(response.data);
    } catch (error) {
      setStatus({ type: 'error', message: t('dashboard.status.fetchOpenEventsError') });
    }
  }, [getRequestConfig, t]);

  useEffect(() => {
    fetchOpenWydarzenia();
  }, [fetchOpenWydarzenia]);

  const handleMoreInfo = (wydarzenieId) => {
    navigate(`/wydarzenia/${wydarzenieId}`);
  };

  const openZakupForm = async (eventItem) => {
    setZakupLoading(true);
    setStatus({ type: '', message: '' });

    try {
      const response = await apiClient.get(`/zakupy/wydarzenia/${eventItem.id}/bilety`, getRequestConfig());
      setDostepneBilety(response.data);
      setSelectedZakupEvent(eventItem);
      setZakupForm({
        biletId: response.data[0]?.biletId ? String(response.data[0].biletId) : '',
        ilosc: '1',
        potwierdzPlatnosc: false,
        seatId: ''
      });
      setZakupFormOpen(true);
    } catch (error) {
      setStatus({ type: 'error', message: t('events.status.availableTicketsError') });
    } finally {
      setZakupLoading(false);
    }
  };

  const onZakupSubmit = async (e) => {
    e.preventDefault();
    setZakupLoading(true);

    try {
      await apiClient.post(`/zakupy/wydarzenia/${selectedZakupEvent.id}`, {
        biletId: Number(zakupForm.biletId),
        ilosc: Number(zakupForm.ilosc),
        potwierdzPlatnosc: zakupForm.potwierdzPlatnosc,
        seatId: zakupForm.seatId || null
      }, getRequestConfig());
      setStatus({ type: 'success', message: t('events.status.purchaseSuccess') });
      setZakupFormOpen(false);
      fetchOpenWydarzenia();
    } catch (error) {
      setStatus({ type: 'error', message: t('events.status.purchaseError') });
    } finally {
      setZakupLoading(false);
    }
  };

  return (
    <div className="dashboard-home">
      <section className="dashboard-intro">
        <p className="dashboard-kicker">EventFlow</p>
        <h2>{t('dashboard.title')}</h2>
        <p>{t('dashboard.description')}</p>
        <div className="dashboard-tabs-guide">
          <span className="section-name"><strong>{t('sidebar.nav.events')}</strong> - {t('dashboard.guide.events')}</span>
          <span className="section-name"><strong>{t('sidebar.nav.tickets')}</strong> - {t('dashboard.guide.tickets')}</span>
          <span className="section-name"><strong>{t('sidebar.nav.participants')}</strong> - {t('dashboard.guide.participants')}</span>
          <span className="section-name"><strong>{t('sidebar.nav.places')}</strong> - {t('dashboard.guide.places')}</span>
          <span className="section-name"><strong>{t('sidebar.nav.analytics')}</strong> - {t('dashboard.guide.analytics')}</span>
          <span className="section-name"><strong>{t('sidebar.nav.settings')}</strong> - {t('dashboard.guide.settings')}</span>
          <span className="section-name"><strong>{t('topbar.adminPanel')}</strong> - {t('dashboard.guide.adminPanel')}</span>
        </div>
      </section>

      <PatchNotesPanel />

      {status.message && <p className={`status-message ${status.type}`}>{status.message}</p>}

      <div className="dashboard-events">
        <h3>{t('dashboard.events.title')}</h3>
        <div className="events-grid">
          {openWydarzenia.length > 0 ? (
            openWydarzenia.slice(0, 3).map((item) => (
              <WydarzenieCard
                key={item.id}
                item={item}
                currentUserRole={currentUser?.rola}
                onMoreInfo={handleMoreInfo}
                onPurchase={openZakupForm}
              />
            ))
          ) : (
            <p>{t('dashboard.events.empty')}</p>
          )}
        </div>
      </div>

      <PurchaseModal
        isOpen={zakupFormOpen}
        onClose={() => setZakupFormOpen(false)}
        selectedEvent={selectedZakupEvent}
        dostepneBilety={dostepneBilety}
        zakupForm={zakupForm}
        setZakupForm={setZakupForm}
        onSubmit={onZakupSubmit}
        loading={zakupLoading}
      />
    </div>
  );
};

export default Dashboard;
