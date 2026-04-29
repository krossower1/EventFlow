import React, { useState, useEffect, useContext, useCallback } from 'react';
import { apiClient, getAuthHeaders } from '../api/apiClient';
import { AuthContext } from '../context/AuthContext';

const MiejscaPage = () => {
  const { currentUser, authCredentials } = useContext(AuthContext);
  const [miejsca, setMiejsca] = useState([]);
  const [loading, setLoading] = useState(false);
  const [view, setView] = useState('list'); // 'list' lub 'add'
  const [status, setStatus] = useState({ type: '', message: '' });

  const [miejsceForm, setMiejsceForm] = useState({
    nazwa: '',
    panstwo: 'Polska',
    miasto: '',
    ulica: '',
    kodPoczt: '',
    pojemnosc: '',
    opis: ''
  });
  const [salaForms, setSalaForms] = useState({});

  const getRequestConfig = useCallback(() => {
    const config = { withCredentials: true };
    if (authCredentials.login && authCredentials.password) {
      config.headers = getAuthHeaders(authCredentials.login, authCredentials.password);
    }
    return config;
  }, [authCredentials]);

  const fetchMyMiejsca = useCallback(async () => {
    setLoading(true);
    try {
      const response = await apiClient.get('/miejsca/my', getRequestConfig());
      setMiejsca(response.data);
    } catch (error) {
      setStatus({ type: 'error', message: 'Nie udało się pobrać miejsc.' });
    } finally {
      setLoading(false);
    }
  }, [getRequestConfig]);

  useEffect(() => {
    if (currentUser?.rola === 'ORG') {
      fetchMyMiejsca();
    }
  }, [currentUser, fetchMyMiejsca]);

  const onMiejsceSubmit = async (event) => {
    event.preventDefault();
    setStatus({ type: '', message: '' });
    try {
      await apiClient.post('/miejsca', {
        ...miejsceForm,
        pojemnosc: Number(miejsceForm.pojemnosc)
      }, getRequestConfig());
      setStatus({ type: 'success', message: 'Miejsce zostało dodane.' });
      setMiejsceForm({ nazwa: '', panstwo: 'Polska', miasto: '', ulica: '', kodPoczt: '', pojemnosc: '', opis: '' });
      setView('list');
      fetchMyMiejsca();
    } catch (error) {
      setStatus({ type: 'error', message: 'Nie udało się dodać miejsca.' });
    }
  };

  const updateSalaForm = (miejsceId, field, value) => {
    setSalaForms(prev => ({
      ...prev,
      [miejsceId]: {
        ...(prev[miejsceId] || { nazwa: '', pojemnosc: '', pietro: '', maPlan: false }),
        [field]: value
      }
    }));
  };

  const onSalaSubmit = async (event, miejsceId) => {
    event.preventDefault();
    const form = salaForms[miejsceId];
    if (!form) return;
    try {
      await apiClient.post(`/miejsca/${miejsceId}/sale`, {
        nazwa: form.nazwa,
        pojemnosc: Number(form.pojemnosc),
        pietro: Number(form.pietro),
        maPlan: Boolean(form.maPlan)
      }, getRequestConfig());
      setStatus({ type: 'success', message: 'Sala została dodana.' });
      setSalaForms(prev => ({ ...prev, [miejsceId]: { nazwa: '', pojemnosc: '', pietro: '', maPlan: false } }));
      fetchMyMiejsca();
    } catch (error) {
      setStatus({ type: 'error', message: 'Nie udało się dodać sali.' });
    }
  };

  if (currentUser?.rola !== 'ORG') {
    return <div style={{padding: '20px'}}>Tylko organizatorzy mogą zarządzać miejscami.</div>;
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2>Zarządzaj miejscami</h2>
        <div>
          <button className="btn-refresh" onClick={fetchMyMiejsca} style={{marginRight: '10px'}}>Odśwież</button>
          <button 
            className="btn-new-event" 
            onClick={() => setView(view === 'list' ? 'add' : 'list')}
          >
            {view === 'list' ? '+ Dodaj miejsce' : 'Powrót do listy'}
          </button>
        </div>
      </div>

      {status.message && <p className={`status-message ${status.type}`}>{status.message}</p>}

      {view === 'add' ? (
        <div className="auth-form organizer-form">
          <h3>Nowe miejsce</h3>
          <form onSubmit={onMiejsceSubmit}>
            <label>Nazwa</label>
            <input type="text" value={miejsceForm.nazwa} onChange={e => setMiejsceForm({...miejsceForm, nazwa: e.target.value})} required />
            
            <label>Państwo</label>
            <input type="text" value="Polska" disabled />

            <label>Miasto</label>
            <input type="text" value={miejsceForm.miasto} onChange={e => setMiejsceForm({...miejsceForm, miasto: e.target.value})} required />

            <label>Ulica</label>
            <input type="text" value={miejsceForm.ulica} onChange={e => setMiejsceForm({...miejsceForm, ulica: e.target.value})} required />

            <label>Kod pocztowy</label>
            <input type="text" value={miejsceForm.kodPoczt} onChange={e => setMiejsceForm({...miejsceForm, kodPoczt: e.target.value})} required />

            <label>Pojemność całkowita</label>
            <input type="number" value={miejsceForm.pojemnosc} onChange={e => setMiejsceForm({...miejsceForm, pojemnosc: e.target.value})} required />

            <label>Opis</label>
            <textarea value={miejsceForm.opis} onChange={e => setMiejsceForm({...miejsceForm, opis: e.target.value})} />

            <button type="submit">Zapisz miejsce</button>
          </form>
        </div>
      ) : (
        <div className="miejsca-list">
          {loading && <h3>Ładowanie...</h3>}
          {miejsca.length > 0 ? miejsca.map((miejsce) => (
            <div key={miejsce.id} className="miejsce-card" style={{ marginBottom: '30px', padding: '20px', border: '1px solid #ddd', borderRadius: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <h3>{miejsce.nazwa}</h3>
                <span className="event-badge">ID: {miejsce.id}</span>
              </div>
              <p><strong>Adres:</strong> {miejsce.ulica}, {miejsce.kodPoczt} {miejsce.miasto}, {miejsce.panstwo}</p>
              <p><strong>Pojemność:</strong> {miejsce.pojemnosc} osób</p>
              <p>{miejsce.opis}</p>

              <h4 style={{ marginTop: '20px' }}>Sale w tym miejscu</h4>
              {miejsce.sale && miejsce.sale.length > 0 ? (
                <table className="participants-table" style={{ fontSize: '0.9em' }}>
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Nazwa</th>
                      <th>Pojemność</th>
                      <th>Piętro</th>
                      <th>Plan</th>
                    </tr>
                  </thead>
                  <tbody>
                    {miejsce.sale.map(sala => (
                      <tr key={sala.id}>
                        <td>{sala.id}</td>
                        <td>{sala.nazwa}</td>
                        <td>{sala.pojemnosc}</td>
                        <td>{sala.pietro}</td>
                        <td>{sala.maPlan ? 'Tak' : 'Nie'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p>Brak zdefiniowanych sal.</p>
              )}

              <div style={{ marginTop: '15px', color: 'white', border: '1px solid white', backgroundColor: '#0d0f14', padding: '15px', borderRadius: '5px' }}>
                <h5>+ Dodaj salę do {miejsce.nazwa}</h5>
                <form onSubmit={e => onSalaSubmit(e, miejsce.id)} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr auto', gap: '10px', alignItems: 'end' }}>
                  <div>
                    <label style={{fontSize: '12px'}}>Nazwa</label>
                    <input 
                      type="text" 
                      value={salaForms[miejsce.id]?.nazwa || ''} 
                      onChange={e => updateSalaForm(miejsce.id, 'nazwa', e.target.value)} 
                      required 
                    />
                  </div>
                  <div>
                    <label style={{fontSize: '12px'}}>Pojemność</label>
                    <input 
                      type="number" 
                      value={salaForms[miejsce.id]?.pojemnosc || ''} 
                      onChange={e => updateSalaForm(miejsce.id, 'pojemnosc', e.target.value)} 
                      required 
                    />
                  </div>
                  <div>
                    <label style={{fontSize: '12px'}}>Piętro</label>
                    <input 
                      type="number" 
                      value={salaForms[miejsce.id]?.pietro || ''} 
                      onChange={e => updateSalaForm(miejsce.id, 'pietro', e.target.value)} 
                      required 
                    />
                  </div>
                  <div>
                    <label style={{fontSize: '12px'}}>Plan</label>
                    <select 
                      value={salaForms[miejsce.id]?.maPlan || false} 
                      onChange={e => updateSalaForm(miejsce.id, 'maPlan', e.target.value === 'true')}
                    >
                      <option value="false">Nie</option>
                      <option value="true">Tak</option>
                    </select>
                  </div>
                  <button type="submit" style={{ padding: '8px 15px' }}>Dodaj</button>
                </form>
              </div>
            </div>
          )) : (
            <p>Nie masz jeszcze dodanych żadnych miejsc.</p>
          )}
        </div>
      )}
    </div>
  );
};

export default MiejscaPage;