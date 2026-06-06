import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import SoldTicketsPanel from './SoldTicketsPanel';

const BiletyTab = ({ currentUserRole, getRequestConfig, setStatus, API_BASE_URL, authCredentials, isLoggedIn }) => {
  const { t } = useTranslation();
  const [myBilety, setMyBilety] = useState([]);
  const [selectedZwrotBilet, setSelectedZwrotBilet] = useState(null);
  const [zwrotForm, setZwrotForm] = useState({ powod: '' });

  const normalizedRole = String(currentUserRole || '').toUpperCase();
  const isOrg = normalizedRole === 'ORG';
  const isAdmin = normalizedRole === 'ADMIN';
  const isRegularUser = !isOrg && !isAdmin;

  const fetchMyBilety = useCallback(async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/bilety/my`, getRequestConfig());
      setMyBilety(response.data);
    } catch (error) {
      setStatus({ type: 'error', message: t('tickets.status.fetchError') });
    }
  }, [API_BASE_URL, getRequestConfig, setStatus, t]);

  useEffect(() => {
    if (!isLoggedIn || !isRegularUser) return;
    fetchMyBilety();
  }, [isLoggedIn, isRegularUser, authCredentials, fetchMyBilety]);

  const onZwrotSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(`${API_BASE_URL}/zwroty/wyst-bilety/${selectedZwrotBilet.id}`,
        { powod: zwrotForm.powod }, getRequestConfig());
      setStatus({ type: 'success', message: response.data || t('tickets.status.refundSuccess') });
      setSelectedZwrotBilet(null);
      fetchMyBilety();
    } catch (error) {
      setStatus({ type: 'error', message: t('tickets.status.refundError') });
    }
  };

  return (
    <div>
      <h2>{t('tickets.page.title')}</h2>

      {(isOrg || isAdmin) && (
        <SoldTicketsPanel
          API_BASE_URL={API_BASE_URL}
          getRequestConfig={getRequestConfig}
          setStatus={setStatus}
        />
      )}

      {isRegularUser && (
        <div>
          <h3>{t('tickets.my.title')}</h3>
          <div className="events-grid">
            {myBilety.map(b => (
              <article key={b.id} className="event-card">
                <span className="event-badge">{b.stan}</span>
                <h3>{b.wydarzenieTytul}</h3>
                <p>{t('tickets.ticket.codeAndClass', { code: b.kod, class: b.klasa })}</p>
                {b.qrCode && (
                  <div style={{ marginTop: '10px', textAlign: 'center' }}>
                    <img
                      src={b.qrCode}
                      alt={t('tickets.ticket.qrAlt')}
                      style={{ width: '150px', height: '150px', border: '1px solid #ddd' }}
                    />
                  </div>
                )}
                <button
                  className="btn-new-event"
                  disabled={b.maProsbeZwrotu}
                  onClick={() => setSelectedZwrotBilet(b)}
                >
                  {b.maProsbeZwrotu ? t('tickets.refund.sent') : t('tickets.refund.request')}
                </button>
              </article>
            ))}
          </div>
        </div>
      )}

      {selectedZwrotBilet && (
        <div className="modal-overlay" onClick={() => setSelectedZwrotBilet(null)}>
          <div className="modal-card" onClick={e => e.stopPropagation()}>
            <h3>{t('tickets.refund.modalTitle', { title: selectedZwrotBilet.wydarzenieTytul })}</h3>
            <form onSubmit={onZwrotSubmit} className="auth-form">
              <label>{t('tickets.refund.reason')}</label>
              <textarea value={zwrotForm.powod} onChange={e => setZwrotForm({ powod: e.target.value })} required />
              <button type="submit">{t('tickets.refund.send')}</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default BiletyTab;
