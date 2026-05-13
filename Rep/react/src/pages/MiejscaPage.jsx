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
    iloscSal: '',
    opis: ''
  });
  const [salaForms, setSalaForms] = useState({});
  const [increaseForms, setIncreaseForms] = useState({});

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
    } else {
      // Dla nie-ORG, ustawiamy puste miejsca
      setMiejsca([]);
    }
  }, [currentUser, fetchMyMiejsca]);

  const onMiejsceSubmit = async (event) => {
    event.preventDefault();
    setStatus({ type: '', message: '' });
    try {
      await apiClient.post('/miejsca', {
        ...miejsceForm,
        iloscSal: Number(miejsceForm.iloscSal)
      }, getRequestConfig());
      setStatus({ type: 'success', message: 'Miejsce zostało dodane.' });
      setMiejsceForm({ nazwa: '', panstwo: 'Polska', miasto: '', ulica: '', kodPoczt: '', iloscSal: '', opis: '' });
      setView('list');
      fetchMyMiejsca();
    } catch (error) {
      setStatus({ type: 'error', message: error?.response?.data?.message || 'Nie udało się dodać miejsca.' });
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
      setStatus({ type: 'error', message: error?.response?.data?.message || 'Nie udało się dodać sali.' });
    }
  };

  const updateIncreaseForm = (miejsceId, value) => {
    setIncreaseForms(prev => ({ ...prev, [miejsceId]: value }));
  };

  const onIncreaseIloscSal = async (event, miejsce) => {
    event.preventDefault();
    const rawValue = increaseForms[miejsce.id];
    const nowaIloscSal = Number(rawValue);
    if (!rawValue || Number.isNaN(nowaIloscSal) || nowaIloscSal <= 0) {
      setStatus({ type: 'error', message: 'Podaj poprawną nową ilość sal.' });
      return;
    }

    const potwierdzenie = window.confirm(`Potwierdź zwiększenie ilości sal dla "${miejsce.nazwa}" do ${nowaIloscSal}.`);
    if (!potwierdzenie) {
      setStatus({ type: 'error', message: 'Anulowano zwiększenie ilości sal.' });
      return;
    }

    try {
      await apiClient.patch(`/miejsca/${miejsce.id}/ilosc-sal`, {
        nowaIloscSal,
        potwierdzenie: true
      }, getRequestConfig());
      setStatus({ type: 'success', message: 'Ilość sal została zwiększona.' });
      setIncreaseForms(prev => ({ ...prev, [miejsce.id]: '' }));
      fetchMyMiejsca();
    } catch (error) {
      setStatus({ type: 'error', message: error?.response?.data?.message || 'Nie udało się zwiększyć ilości sal.' });
    }
  };

  // Strona dostępna dla wszystkich, ale zarządzanie tylko dla organizatorów

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2>{currentUser?.rola === 'ORG' ? 'Zarządzaj miejscami' : 'Przeglądaj miejsca (zarządzanie tylko dla organizatorów)'}</h2>
        <div className="miejsca-page-toolbar-actions">
          <span
            className={`permission-tooltip ${currentUser?.rola !== 'ORG' ? 'has-tooltip' : ''}`}
            data-tooltip={currentUser?.rola !== 'ORG' ? 'Dostępne tylko dla organizatora' : ''}
          >
            <button
              type="button"
              className="btn-refresh-icon"
              onClick={fetchMyMiejsca}
              disabled={currentUser?.rola !== 'ORG'}
              aria-label="Odśwież"
              title="Odśwież"
            >
              <img src="/refresh.png" alt="" width={22} height={22} />
            </button>
          </span>
          <span
            className={`permission-tooltip ${currentUser?.rola !== 'ORG' ? 'has-tooltip' : ''}`}
            data-tooltip={currentUser?.rola !== 'ORG' ? 'Dostępne tylko dla organizatora' : ''}
          >
            <button
              className="btn-new-event"
              onClick={() => setView(view === 'list' ? 'add' : 'list')}
              disabled={currentUser?.rola !== 'ORG'}
            >
              {view === 'list' ? '+ Dodaj miejsce' : 'Powrót do listy'}
            </button>
          </span>
        </div>
      </div>

      {status.message && <p className={`status-message ${status.type}`}>{status.message}</p>}

      {view === 'add' ? (
        currentUser?.rola === 'ORG' ? (
          <div className="auth-form organizer-form miejsce-form-card">
            <h3>Nowe miejsce</h3>
            <form onSubmit={onMiejsceSubmit} className="miejsce-form-grid">
              <div className="miejsce-form-field miejsce-form-field--full">
                <label htmlFor="miejsce-nazwa">Nazwa</label>
                <input id="miejsce-nazwa" type="text" value={miejsceForm.nazwa} onChange={e => setMiejsceForm({...miejsceForm, nazwa: e.target.value})} required />
              </div>

              <div className="miejsce-form-field">
                <label htmlFor="miejsce-panstwo">Państwo</label>
                <input id="miejsce-panstwo" type="text" value="Polska" disabled />
              </div>

              <div className="miejsce-form-field">
                <label htmlFor="miejsce-miasto">Miasto</label>
                <input id="miejsce-miasto" type="text" value={miejsceForm.miasto} onChange={e => setMiejsceForm({...miejsceForm, miasto: e.target.value})} required />
              </div>

              <div className="miejsce-form-field">
                <label htmlFor="miejsce-ulica">Ulica</label>
                <input id="miejsce-ulica" type="text" value={miejsceForm.ulica} onChange={e => setMiejsceForm({...miejsceForm, ulica: e.target.value})} required />
              </div>

              <div className="miejsce-form-field">
                <label htmlFor="miejsce-kod">Kod pocztowy</label>
                <input id="miejsce-kod" type="text" value={miejsceForm.kodPoczt} onChange={e => setMiejsceForm({...miejsceForm, kodPoczt: e.target.value})} required />
              </div>

              <div className="miejsce-form-field miejsce-form-field--full">
                <label htmlFor="miejsce-ilosc-sal">Ilość sal (limit sal dla miejsca)</label>
                <input id="miejsce-ilosc-sal" type="number" value={miejsceForm.iloscSal} onChange={e => setMiejsceForm({...miejsceForm, iloscSal: e.target.value})} required />
              </div>

              <div className="miejsce-form-field miejsce-form-field--full">
                <label htmlFor="miejsce-opis">Opis</label>
                <textarea id="miejsce-opis" value={miejsceForm.opis} onChange={e => setMiejsceForm({...miejsceForm, opis: e.target.value})} />
              </div>

              <div className="miejsce-form-actions">
                <button type="submit">Zapisz miejsce</button>
              </div>
            </form>
          </div>
        ) : (
          <div style={{padding: '20px', textAlign: 'center', color: '#666'}}>
            <p>Dodawanie nowych miejsc dostępne tylko dla organizatorów.</p>
          </div>
        )
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
              <p><strong>Ilość sal (limit):</strong> {miejsce.iloscSal}</p>
              <p><strong>Wykorzystane:</strong> {miejsce.sale?.length || 0} / {miejsce.iloscSal}</p>
              <p>{miejsce.opis}</p>

              {currentUser?.rola === 'ORG' && (
                <div style={{ marginTop: '12px', padding: '12px', border: '1px dashed #666', borderRadius: '6px' }}>
                  <h5 style={{ marginTop: 0 }}>Zwiększ ilość sal (wymagane potwierdzenie)</h5>
                  <form onSubmit={(e) => onIncreaseIloscSal(e, miejsce)} style={{ display: 'flex', gap: '10px', alignItems: 'end' }}>
                    <div>
                      <label style={{fontSize: '12px'}}>Nowa ilość sal</label>
                      <input
                        type="number"
                        min={miejsce.iloscSal || 1}
                        value={increaseForms[miejsce.id] || ''}
                        onChange={e => updateIncreaseForm(miejsce.id, e.target.value)}
                        required
                      />
                    </div>
                    <button type="submit" style={{ padding: '8px 15px' }}>Zwiększ</button>
                  </form>
                </div>
              )}

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
                {currentUser?.rola === 'ORG' ? (
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
                  <button
                    type="submit"
                    style={{ padding: '8px 15px' }}
                    disabled={(miejsce.sale?.length || 0) >= (miejsce.iloscSal || 0)}
                    title={(miejsce.sale?.length || 0) >= (miejsce.iloscSal || 0) ? 'Osiągnięto limit sal. Najpierw zwiększ ilosc_sal.' : ''}
                  >
                    Dodaj
                  </button>
                </form>
                ) : (
                  <p style={{ color: '#666', textAlign: 'center' }}>Dodawanie sal dostępne tylko dla organizatorów.</p>
                )}
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