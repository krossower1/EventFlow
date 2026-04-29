import React, { useState, useEffect, useContext, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiClient, getAuthHeaders } from '../api/apiClient';
import { AuthContext } from '../context/AuthContext';
import WydarzenieCard from '../components/WydarzenieCard';

const WydarzeniaPage = () => {
  const { currentUser, authCredentials } = useContext(AuthContext);
  const navigate = useNavigate();

  const [wydarzenieOptions, setWydarzenieOptions] = useState({ miejsca: [], kategorie: [] });
  const [wydarzenieLoading, setWydarzenieLoading] = useState(false);
  const [myWydarzenia, setMyWydarzenia] = useState([]);
  const [showWydarzenieForm, setShowWydarzenieForm] = useState(false);
  const [wydarzeniaSearch, setWydarzeniaSearch] = useState('');
  const [wydarzeniaStatusFilter, setWydarzeniaStatusFilter] = useState('ALL');
  const [wydarzenieForm, setWydarzenieForm] = useState({
    miejsceId: '',
    tytul: '',
    opis: '',
    kategoriaId: '',
    rola: '',
    status: '',
    dataRozp: '',
    dataZamk: '',
    createNowaKategoria: false,
    nowaKategoriaNazwa: '',
    nowaKategoriaOpis: '',
    bilety: [{ klasa: '', cena: '', ilosc: '', waluta: 'PLN', start_sprzedazy: '', koniec_sprzedazy: '' }]
  });
  const [status, setStatus] = useState({ type: '', message: '' });
  const [ticketForms, setTicketForms] = useState({});

  const getRequestConfig = useCallback(() => {
    const config = { withCredentials: true };
    if (authCredentials.login && authCredentials.password) {
      config.headers = getAuthHeaders(authCredentials.login, authCredentials.password);
    }
    return config;
  }, [authCredentials]);

  const fetchWydarzeniaOptions = useCallback(async () => {
    setWydarzenieLoading(true);
    try {
      const response = await apiClient.get('/wydarzenia/options', getRequestConfig());
      setWydarzenieOptions(response.data);
    } catch (error) {
      setStatus({ type: 'error', message: error.response?.data?.message || 'Nie udalo sie pobrac opcji formularza wydarzenia.' });
    } finally {
      setWydarzenieLoading(false);
    }
  }, [getRequestConfig]);

  const fetchMyWydarzenia = useCallback(async () => {
    try {
      const response = await apiClient.get('/wydarzenia/my', getRequestConfig());
      setMyWydarzenia(response.data);
    } catch (error) {
      setStatus({ type: 'error', message: error.response?.data?.message || 'Nie udalo sie pobrac listy wydarzen.' });
    }
  }, [getRequestConfig]);

  const addBiletForm = () => {
    setWydarzenieForm(prev => ({
      ...prev,
      bilety: [...prev.bilety, { klasa: '', cena: '', ilosc: '', waluta: 'PLN', start_sprzedazy: '', koniec_sprzedazy: '' }]
    }));
  };

  const removeBiletForm = (index) => {
    setWydarzenieForm(prev => ({
      ...prev,
      bilety: prev.bilety.filter((_, i) => i !== index)
    }));
  };

  const updateBiletInForm = (index, field, value) => {
    setWydarzenieForm(prev => {
      const newBilety = [...prev.bilety];
      newBilety[index] = { ...newBilety[index], [field]: value };
      return { ...prev, bilety: newBilety };
    });
  };

  const onWydarzenieSubmit = async (event) => {
    event.preventDefault();
    setStatus({ type: '', message: '' });

    if (wydarzenieForm.bilety.length === 0) {
      setStatus({ type: 'error', message: 'Musisz dodać co najmniej jeden typ biletu.' });
      return;
    }

    try {
      console.log('Wysyłanie wydarzenia z biletami:', {
        miejsceId: Number(wydarzenieForm.miejsceId),
        tytul: wydarzenieForm.tytul,
        bilety: wydarzenieForm.bilety.map(b => ({
          klasa: b.klasa,
          cena: Number(b.cena),
          ilosc: Number(b.ilosc),
          waluta: b.waluta,
          startSprzedazy: b.start_sprzedazy || null,
          koniecSprzedazy: b.koniec_sprzedazy || null
        }))
      });

      await apiClient.post(
        '/wydarzenia',
        {
          miejsceId: Number(wydarzenieForm.miejsceId),
          tytul: wydarzenieForm.tytul,
          opis: wydarzenieForm.opis,
          kategoriaId: wydarzenieForm.createNowaKategoria ? null : Number(wydarzenieForm.kategoriaId),
          rola: wydarzenieForm.rola,
          status: wydarzenieForm.status,
          dataRozp: wydarzenieForm.dataRozp,
          dataZamk: wydarzenieForm.dataZamk,
          createNowaKategoria: wydarzenieForm.createNowaKategoria,
          nowaKategoriaNazwa: wydarzenieForm.nowaKategoriaNazwa,
          nowaKategoriaOpis: wydarzenieForm.nowaKategoriaOpis,
          bilety: wydarzenieForm.bilety.map(b => ({
            klasa: b.klasa,
            cena: Number(b.cena),
            waluta: b.waluta,
            ilosc: Number(b.ilosc),
            startSprzedazy: b.start_sprzedazy || null,
            koniecSprzedazy: b.koniec_sprzedazy || null
          }))
        },
        getRequestConfig()
      );

      setStatus({ type: 'success', message: 'Wydarzenie zostalo dodane.' });
      setShowWydarzenieForm(false);
      setWydarzenieForm({
        miejsceId: '', tytul: '', opis: '', kategoriaId: '', rola: '', status: '',
        dataRozp: '', dataZamk: '', createNowaKategoria: false,
        nowaKategoriaNazwa: '', nowaKategoriaOpis: '',
        bilety: [{ klasa: '', cena: '', ilosc: '', waluta: 'PLN', start_sprzedazy: '', koniec_sprzedazy: '' }]
      });
      fetchWydarzeniaOptions();
      fetchMyWydarzenia();
    } catch (error) {
      setStatus({ type: 'error', message: error.response?.data?.message || 'Nie udalo sie dodac wydarzenia.' });
    }
  };

  const updateTicketForm = (eventId, field, value) => {
    setTicketForms(prev => ({
      ...prev,
      [eventId]: {
        ...(prev[eventId] || { klasa: '', cena: '', ilosc: '', waluta: 'PLN', start_sprzedazy: '', koniec_sprzedazy: '' }),
        [field]: value
      }
    }));
  };

  const onTicketSubmit = async (event, eventId) => {
    event.preventDefault();
    const form = ticketForms[eventId];
    if (!form) return;
    try {
      console.log('Wysyłanie nowej puli biletów:', {
        klasa: form.klasa,
        cena: Number(form.cena),
        ilosc: Number(form.ilosc),
        waluta: form.waluta || 'PLN',
        startSprzedazy: form.start_sprzedazy || null,
        koniecSprzedazy: form.koniec_sprzedazy || null
      });

      await apiClient.post(`/wydarzenia/${eventId}/bilety`, {
        klasa: form.klasa,
        cena: Number(form.cena),
        ilosc: Number(form.ilosc),
        waluta: form.waluta || 'PLN',
        startSprzedazy: form.start_sprzedazy || null,
        koniecSprzedazy: form.koniec_sprzedazy || null
      }, getRequestConfig());
      setStatus({ type: 'success', message: 'Pula biletów została dodana.' });
      setTicketForms(prev => ({ ...prev, [eventId]: { klasa: '', cena: '', ilosc: '', waluta: 'PLN', start_sprzedazy: '', koniec_sprzedazy: '' } }));
      fetchMyWydarzenia(); // Odśwież listę, by zobaczyć zmiany
    } catch (error) {
      setStatus({ type: 'error', message: 'Nie udało się dodać biletów.' });
    }
  };

  useEffect(() => {
    if (currentUser?.rola === 'ORG') {
      fetchWydarzeniaOptions();
      fetchMyWydarzenia();
    }
  }, [currentUser, fetchWydarzeniaOptions, fetchMyWydarzenia]);

  const filteredWydarzenia = myWydarzenia.filter((item) => {
    const matchesText = !wydarzeniaSearch
      || (item.tytul || "").toLowerCase().includes(wydarzeniaSearch.toLowerCase())
      || item.miejsceNazwa?.toLowerCase().includes(wydarzeniaSearch.toLowerCase());
    const matchesStatus = wydarzeniaStatusFilter === 'ALL'
      || (item.status || '').toUpperCase() === wydarzeniaStatusFilter;
    return matchesText && matchesStatus;
  });

  return (
    <div>
      <h2>Wydarzenia</h2>
      {status.message && <p className={`status-message ${status.type}`}>{status.message}</p>}
      
      {currentUser?.rola === 'ORG' ? (
        <div className="events-view">
          <p>Zarzadzaj wszystkimi swoimi wydarzeniami w jednym miejscu.</p>
          <div className="events-toolbar">
            <input
              type="text"
              className="events-search"
              placeholder="Szukaj wydarzeń..."
              value={wydarzeniaSearch}
              onChange={(event) => setWydarzeniaSearch(event.target.value)}
            />
            <select
              className="events-filter"
              value={wydarzeniaStatusFilter}
              onChange={(event) => setWydarzeniaStatusFilter(event.target.value)}
            >
              <option value="ALL">Filtry: wszystkie</option>
              <option value="AKTYWNE">aktywne</option>
              <option value="SZKIC">szkic</option>
              <option value="ZAMKNIETE">zamkniete</option>
            </select>
            <button
              type="button"
              className="btn-new-event"
              onClick={() => {
                setShowWydarzenieForm((prev) => !prev);
                if (!showWydarzenieForm) fetchWydarzeniaOptions();
              }}
            >
              {showWydarzenieForm ? 'Zamknij formularz' : '+ Nowe wydarzenie'}
            </button>
          </div>

          {showWydarzenieForm && (
            <form onSubmit={onWydarzenieSubmit} className="auth-form organizer-form event-form">
              <label htmlFor="wyd-miejsce">Miejsce</label>
              <select
                id="wyd-miejsce"
                value={wydarzenieForm.miejsceId}
                onChange={(event) => setWydarzenieForm({ ...wydarzenieForm, miejsceId: event.target.value })}
                required
              >
                <option value="">Wybierz miejsce</option>
                {wydarzenieOptions.miejsca.map((item) => (
                  <option key={item.id} value={item.id}>{item.nazwa}</option>
                ))}
              </select>

              <label htmlFor="wyd-tytul">Tytul</label>
              <input
                id="wyd-tytul"
                type="text"
                value={wydarzenieForm.tytul}
                onChange={(event) => setWydarzenieForm({ ...wydarzenieForm, tytul: event.target.value })}
                required
              />

              <label htmlFor="wyd-opis">Opis</label>
              <input
                id="wyd-opis"
                type="text"
                value={wydarzenieForm.opis}
                onChange={(event) => setWydarzenieForm({ ...wydarzenieForm, opis: event.target.value })}
              />

              <label htmlFor="wyd-kategoria">Kategoria</label>
              <select
                id="wyd-kategoria"
                value={wydarzenieForm.createNowaKategoria ? '__NOWA_KATEGORIA__' : wydarzenieForm.kategoriaId}
                onChange={(event) => {
                  const isNew = event.target.value === '__NOWA_KATEGORIA__';
                  setWydarzenieForm({
                    ...wydarzenieForm,
                    createNowaKategoria: isNew,
                    kategoriaId: isNew ? '' : event.target.value
                  });
                }}
                required
              >
                <option value="">Wybierz kategorie</option>
                {wydarzenieOptions.kategorie.map((item) => (
                  <option key={item.id} value={item.id}>{item.nazwa}</option>
                ))}
                <option value="__NOWA_KATEGORIA__">+ Utworz nowa kategorie</option>
              </select>

              {/* ... Nowa kategoria inputs ... */}

              <label htmlFor="wyd-rola">Rola</label>
              <input id="wyd-rola" type="text" value={wydarzenieForm.rola} onChange={(e) => setWydarzenieForm({ ...wydarzenieForm, rola: e.target.value })} required />

              <label htmlFor="wyd-status">Status</label>
              <input id="wyd-status" type="text" value={wydarzenieForm.status} onChange={(e) => setWydarzenieForm({ ...wydarzenieForm, status: e.target.value })} required />

              <label htmlFor="wyd-start">Data rozpoczecia</label>
              <input id="wyd-start" type="datetime-local" value={wydarzenieForm.dataRozp} onChange={(e) => setWydarzenieForm({ ...wydarzenieForm, dataRozp: e.target.value })} required />

              <label htmlFor="wyd-end">Data zakonczenia</label>
              <input id="wyd-end" type="datetime-local" value={wydarzenieForm.dataZamk} onChange={(e) => setWydarzenieForm({ ...wydarzenieForm, dataZamk: e.target.value })} required />

              {/* Sekcja biletów w głównym formularzu */}
              <div className="event-ticket-creation-section" style={{ gridColumn: '1 / -1', marginTop: '20px', padding: '25px', background: '#1a1d24', borderRadius: '10px', border: '1px solid #e0e0e0' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                  <h4 style={{ margin: 0 }}>Konfiguracja Biletów</h4>
                  <button type="button" onClick={addBiletForm} className="btn-refresh">+ Dodaj pulę</button>
                </div>
                {wydarzenieForm.bilety.map((bilet, index) => (
                  <div key={index} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr auto auto auto', gap: '10px', marginBottom: '10px' }}>
                    <input placeholder="Klasa biletu" value={bilet.klasa} onChange={(e) => updateBiletInForm(index, 'klasa', e.target.value)} required />
                    <input type="number" step="0.01" placeholder="Cena" value={bilet.cena} onChange={(e) => updateBiletInForm(index, 'cena', e.target.value)} required />
                    <input type="number" placeholder="Ilość" value={bilet.ilosc} onChange={(e) => updateBiletInForm(index, 'ilosc', e.target.value)} required />
                    <select value={bilet.waluta} onChange={(e) => updateBiletInForm(index, 'waluta', e.target.value)} required>
                      <option value="PLN">PLN</option>
                      <option value="EUR">EUR</option>
                      <option value="USD">USD</option>
                    </select>
                    <input type="datetime-local" placeholder="Start sprzedaży" value={bilet.start_sprzedazy} onChange={(e) => updateBiletInForm(index, 'start_sprzedazy', e.target.value)} />
                    <input type="datetime-local" placeholder="Koniec sprzedaży" value={bilet.koniec_sprzedazy} onChange={(e) => updateBiletInForm(index, 'koniec_sprzedazy', e.target.value)} />
                    <button type="button" onClick={() => removeBiletForm(index)} className="btn-delete">X</button>
                  </div>
                ))}
              </div>
              <button type="submit" style={{ marginTop: '20px' }}>Dodaj wydarzenie</button>
            </form>
          )}

          {wydarzenieLoading && <h3>Ladowanie...</h3>}

          <div className="events-grid">
            {filteredWydarzenia.length > 0 ? filteredWydarzenia.map((item) => (
              <div key={item.id} className="event-management-wrapper" style={{ border: '1px solid #ddd', borderRadius: '12px', padding: '15px', backgroundColor: '#1a1d24' }}>
                <WydarzenieCard
                  item={item}
                  currentUserRole={currentUser?.rola}
                  onMoreInfo={(id) => navigate(`/wydarzenia/${id}`)}
                />
                
                {/* DOSTOSOWANY FORMULARZ NOWEJ PULI BILETÓW */}
                <div style={{ marginTop: '20px', padding: '20px', background: '#1a1d24', borderRadius: '10px', border: '1px solid #e0e0e0' }}>
                  <h5 style={{ margin: '0 0 15px 0', color: '#333', fontWeight: 'bold' }}>+ Nowa pula biletów</h5>
                  <form 
                    onSubmit={e => onTicketSubmit(e, item.id)} 
                    className="auth-form organizer-form event-form"
                    style={{ display: 'grid', gap: '15px', padding: '0' }}
                  >
                    <div>
                      <label htmlFor={`t-klasa-${item.id}`}>Klasa biletu (np. VIP)</label>
                      <input
                        id={`t-klasa-${item.id}`}
                        type="text"
                        placeholder="Wpisz klasę..."
                        value={ticketForms[item.id]?.klasa || ''}
                        onChange={e => updateTicketForm(item.id, 'klasa', e.target.value)}
                        required
                      />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '15px' }}>
                      <div>
                        <label htmlFor={`t-cena-${item.id}`}>Cena</label>
                        <input 
                          id={`t-cena-${item.id}`}
                          type="number" step="0.01" placeholder="0.00" 
                          value={ticketForms[item.id]?.cena || ''} 
                          onChange={e => updateTicketForm(item.id, 'cena', e.target.value)} 
                          required 
                        />
                      </div>
                      <div>
                        <label htmlFor={`t-qty-${item.id}`}>Liczba biletów</label>
                        <input
                          id={`t-qty-${item.id}`}
                          type="number" placeholder="np. 50"
                          value={ticketForms[item.id]?.ilosc || ''}
                          onChange={e => updateTicketForm(item.id, 'ilosc', e.target.value)}
                          required
                        />
                      </div>
                      <div>
                        <label htmlFor={`t-waluta-${item.id}`}>Waluta</label>
                        <select
                          id={`t-waluta-${item.id}`}
                          value={ticketForms[item.id]?.waluta || 'PLN'}
                          onChange={e => updateTicketForm(item.id, 'waluta', e.target.value)}
                          required
                        >
                          <option value="PLN">PLN</option>
                          <option value="EUR">EUR</option>
                          <option value="USD">USD</option>
                        </select>
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginTop: '15px' }}>
                      <div>
                        <label htmlFor={`t-start-${item.id}`}>Start sprzedaży</label>
                        <input
                          id={`t-start-${item.id}`}
                          type="datetime-local"
                          value={ticketForms[item.id]?.start_sprzedazy || ''}
                          onChange={e => updateTicketForm(item.id, 'start_sprzedazy', e.target.value)}
                        />
                      </div>
                      <div>
                        <label htmlFor={`t-end-${item.id}`}>Koniec sprzedaży</label>
                        <input
                          id={`t-end-${item.id}`}
                          type="datetime-local"
                          value={ticketForms[item.id]?.koniec_sprzedazy || ''}
                          onChange={e => updateTicketForm(item.id, 'koniec_sprzedazy', e.target.value)}
                        />
                      </div>
                    </div>

                    <button type="submit" className="btn-new-event" style={{ width: '100%' }}>
                      Dodaj pulę biletów
                    </button>
                  </form>
                </div>
              </div>
            )) : (
              <p>Brak wydarzen.</p>
            )}
          </div>
        </div>
      ) : (
        <p>Brak uprawnień lub nie jesteś zalogowany jako organizator.</p>
      )}
    </div>
  );
};

export default WydarzeniaPage;