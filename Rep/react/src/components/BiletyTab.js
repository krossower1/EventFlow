import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

const BiletyTab = ({ currentUserRole, getRequestConfig, setStatus, API_BASE_URL, authCredentials, isLoggedIn }) => {
  const [myBilety, setMyBilety] = useState([]);
  const [zwroty, setZwroty] = useState([]);
  const [selectedZwrotBilet, setSelectedZwrotBilet] = useState(null);
  const [zwrotForm, setZwrotForm] = useState({ powod: '' });

  const fetchMyBilety = useCallback(async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/bilety/my`, getRequestConfig());
      setMyBilety(response.data);
    } catch (error) {
      setStatus({ type: 'error', message: 'Nie udalo sie pobrac biletow.' });
    }
  }, [API_BASE_URL, getRequestConfig, setStatus]);

  const fetchZwroty = useCallback(async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/zwroty`, getRequestConfig());
      setZwroty(response.data);
    } catch (error) {
      setStatus({ type: 'error', message: 'Nie udalo sie pobrac prosb o zwrot.' });
    }
  }, [API_BASE_URL, getRequestConfig, setStatus]);

  useEffect(() => {
    if (!isLoggedIn) return;
    if (currentUserRole === 'ADMIN') {
      fetchZwroty();
    } else {
      fetchMyBilety();
    }
  }, [isLoggedIn, currentUserRole, authCredentials, fetchMyBilety, fetchZwroty]);

  const onZwrotSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(`${API_BASE_URL}/zwroty/wyst-bilety/${selectedZwrotBilet.id}`, 
        { powod: zwrotForm.powod }, getRequestConfig());
      setStatus({ type: 'success', message: response.data || 'Prosba o zwrot zostala wyslana.' });
      setSelectedZwrotBilet(null);
      fetchMyBilety();
    } catch (error) {
      setStatus({ type: 'error', message: 'Blad podczas wysylania zwrotu.' });
    }
  };

  const handleApprove = async (id) => {
    await axios.post(`${API_BASE_URL}/zwroty/${id}/approve`, {}, getRequestConfig());
    fetchZwroty();
  };

  return (
    <div>
      <h2>Panel Biletów</h2>

      <div className={currentUserRole !== 'ADMIN' ? 'disabled-area' : ''} style={{ marginBottom: '40px' }}>
        <h3>Zarządzanie zwrotami (ADMIN)</h3>
        <table className="participants-table">
          <thead>
            <tr>
              <th>ID</th><th>Uzytkownik</th><th>Wydarzenie</th><th>Klasa</th><th>Kwota</th><th>Powod</th><th>Stan</th><th>Akcje</th>
            </tr>
          </thead>
          <tbody>
            {zwroty.map(z => (
              <tr key={z.id}>
                <td>{z.id}</td><td>{z.userLogin}</td><td>{z.wydarzenieTytul}</td><td>{z.klasa}</td><td>{z.kwota} {z.waluta}</td><td>{z.powod}</td><td>{z.stan}</td>
                <td>
                  <button disabled={currentUserRole !== 'ADMIN'} onClick={() => handleApprove(z.id)}>Akceptuj</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className={currentUserRole === 'ADMIN' ? 'disabled-area' : ''}>
        <h3>Moje Bilety</h3>
        <div className="events-grid">
            {myBilety.map(b => (
              <article key={b.id} className="event-card">
                <span className="event-badge">{b.stan}</span>
                <h3>{b.wydarzenieTytul}</h3>
                <p>Kod: {b.kod} | Klasa: {b.klasa}</p>
                {b.qrCode && (
                  <div style={{ marginTop: '10px', textAlign: 'center' }}>
                    <img 
                      src={b.qrCode} 
                      alt="QR Code biletu" 
                      style={{ width: '150px', height: '150px', border: '1px solid #ddd' }}
                    />
                  </div>
                )}
                <button 
                  className="btn-new-event" 
                  disabled={currentUserRole === 'ADMIN' || b.maProsbeZwrotu} 
                  onClick={() => setSelectedZwrotBilet(b)}
                >
                  {b.maProsbeZwrotu ? 'Wysłano prośbę' : 'Prośba o zwrot'}
                </button>
              </article>
            ))}
        </div>
      </div>

      {selectedZwrotBilet && (
        <div className="modal-overlay" onClick={() => setSelectedZwrotBilet(null)}>
          <div className="modal-card" onClick={e => e.stopPropagation()}>
            <h3>Zwrot biletu: {selectedZwrotBilet.wydarzenieTytul}</h3>
            <form onSubmit={onZwrotSubmit} className="auth-form">
              <label>Powód</label>
              <textarea value={zwrotForm.powod} onChange={e => setZwrotForm({powod: e.target.value})} required />
              <button type="submit">Wyślij</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default BiletyTab;
