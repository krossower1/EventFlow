import React, { useState, useEffect, useContext, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiClient, getAuthHeaders } from '../api/apiClient';
import { AuthContext } from '../context/AuthContext';
import WydarzenieCard from '../components/WydarzenieCard';
import PurchaseModal from '../components/PurchaseModal';
import SeatPlanMap from '../components/SeatPlanMap';

const WydarzeniaPage = () => {
  const { currentUser, authCredentials } = useContext(AuthContext);
  const navigate = useNavigate();

  const [wydarzenieOptions, setWydarzenieOptions] = useState({ sale: [], kategorieSystemowe: [], kategorieUzytkownika: [] });
  const [wydarzenieLoading, setWydarzenieLoading] = useState(false);
  const [myWydarzenia, setMyWydarzenia] = useState([]);
  const [showWydarzenieForm, setShowWydarzenieForm] = useState(false);
  const [wydarzeniaSearch, setWydarzeniaSearch] = useState('');
  const [wydarzeniaStatusFilter, setWydarzeniaStatusFilter] = useState('ALL');
  const [wydarzenieForm, setWydarzenieForm] = useState({
    salaId: '',
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
    bilety: [{ klasa: '', cena: '', ilosc: '', waluta: 'PLN', start_sprzedazy: '', koniec_sprzedazy: '', seatIds: [] }]
  });
  const [status, setStatus] = useState({ type: '', message: '' });
  const [ticketForms, setTicketForms] = useState({});
  const [openTicketFormEventId, setOpenTicketFormEventId] = useState(null);
  const [zakupFormOpen, setZakupFormOpen] = useState(false);
  const [selectedZakupEvent, setSelectedZakupEvent] = useState(null);
  const [dostepneBilety, setDostepneBilety] = useState([]);
  const [zakupLoading, setZakupLoading] = useState(false);
  const [zakupForm, setZakupForm] = useState({ biletId: '', ilosc: '1', potwierdzPlatnosc: false, seatId: '' });
  const [selectedInfoEvent, setSelectedInfoEvent] = useState(null);
  const [selectedPersonelEvent, setSelectedPersonelEvent] = useState(null);
  const [infoLoading, setInfoLoading] = useState(false);
  const [opiniaForm, setOpiniaForm] = useState({ ocena: '5', opis: '' });
  const [organizerRequestOpen, setOrganizerRequestOpen] = useState(false);
  const [organizerForm, setOrganizerForm] = useState({ firma: '', kwalifikacje: '', strona: '' });
  const [personelForm, setPersonelForm] = useState({ userId: '', rola: 'ochrona' });
  const [personelUsers, setPersonelUsers] = useState([]);
  const PERSONEL_ROLE_OPTIONS = ['ochrona', 'konferansjer', 'manager', 'prelegent', 'partner finansowy', 'gastronomia', 'animator', 'inne'];
  const selectedSala = useMemo(
    () => wydarzenieOptions.sale.find((item) => String(item.id) === String(wydarzenieForm.salaId)) || null,
    [wydarzenieOptions.sale, wydarzenieForm.salaId]
  );
  const selectedSalaSeats = useMemo(
    () => Array.isArray(selectedSala?.seats) ? selectedSala.seats : [],
    [selectedSala]
  );
  const hasSelectedSalaPlan = Boolean(selectedSala?.maPlan && selectedSalaSeats.length > 0);

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
      const response = await apiClient.get('/wydarzenia', getRequestConfig());
      setMyWydarzenia(response.data);
    } catch (error) {
      setStatus({ type: 'error', message: error.response?.data?.message || 'Nie udalo sie pobrac listy wydarzen.' });
    }
  }, [getRequestConfig]);

  const handleEndEventAsAdmin = async (eventId) => {
    if (!window.confirm('Ustawić status wydarzenia na NIEAKTYWNY? Obserwujący otrzymają powiadomienie.')) {
      return;
    }
    try {
      await apiClient.put(`/wydarzenia/${eventId}/status`, { status: 'NIEAKTYWNY' }, getRequestConfig());
      await fetchMyWydarzenia();
      setStatus({ type: 'success', message: 'Wydarzenie zostało zakończone (NIEAKTYWNY).' });
    } catch (error) {
      setStatus({
        type: 'error',
        message: error.response?.data?.message || 'Nie udało się zmienić statusu wydarzenia.',
      });
    }
  };

  const addBiletForm = () => {
    setWydarzenieForm(prev => ({
      ...prev,
      bilety: [...prev.bilety, { klasa: '', cena: '', ilosc: '', waluta: 'PLN', start_sprzedazy: '', koniec_sprzedazy: '', seatIds: [] }]
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

  const toggleBiletSeat = (index, seatId) => {
    setWydarzenieForm((prev) => {
      const currentSeatIds = prev.bilety[index]?.seatIds || [];
      const nextSeatIds = currentSeatIds.includes(seatId)
        ? currentSeatIds.filter((item) => item !== seatId)
        : [...currentSeatIds, seatId];
      const newBilety = [...prev.bilety];
      newBilety[index] = {
        ...newBilety[index],
        seatIds: nextSeatIds,
        ilosc: String(nextSeatIds.length)
      };
      return { ...prev, bilety: newBilety };
    });
  };

  const getSeatClassById = () => wydarzenieForm.bilety.reduce((acc, bilet) => {
    (bilet.seatIds || []).forEach((seatId) => {
      acc[seatId] = bilet.klasa;
    });
    return acc;
  }, {});

  const getSelectableSeatIds = (index) => {
    const currentSeatIds = wydarzenieForm.bilety[index]?.seatIds || [];
    const blocked = new Set(
      wydarzenieForm.bilety.flatMap((bilet, biletIndex) => (biletIndex === index ? [] : (bilet.seatIds || [])))
    );
    return new Set(
      selectedSalaSeats
        .map((seat) => seat.id)
        .filter((seatId) => !blocked.has(seatId) || currentSeatIds.includes(seatId))
    );
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
        salaId: Number(wydarzenieForm.salaId),
        tytul: wydarzenieForm.tytul,
        bilety: wydarzenieForm.bilety.map(b => ({
          klasa: b.klasa,
          cena: Number(b.cena),
          ilosc: Number(b.ilosc),
          waluta: b.waluta,
          startSprzedazy: b.start_sprzedazy || null,
          koniecSprzedazy: b.koniec_sprzedazy || null,
          seatIds: b.seatIds || []
        }))
      });

      await apiClient.post(
        '/wydarzenia',
        {
          salaId: Number(wydarzenieForm.salaId),
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
            koniecSprzedazy: b.koniec_sprzedazy || null,
            seatIds: b.seatIds || []
          }))
        },
        getRequestConfig()
      );

      setStatus({ type: 'success', message: 'Wydarzenie zostalo dodane.' });
      setShowWydarzenieForm(false);
      setWydarzenieForm({
        salaId: '', tytul: '', opis: '', kategoriaId: '', rola: '', status: '',
        dataRozp: '', dataZamk: '', createNowaKategoria: false,
        nowaKategoriaNazwa: '', nowaKategoriaOpis: '',
        bilety: [{ klasa: '', cena: '', ilosc: '', waluta: 'PLN', start_sprzedazy: '', koniec_sprzedazy: '', seatIds: [] }]
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
      setOpenTicketFormEventId(null);
      fetchMyWydarzenia(); // Odśwież listę, by zobaczyć zmiany
    } catch (error) {
      setStatus({ type: 'error', message: 'Nie udało się dodać biletów.' });
    }
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
      setStatus({ type: 'error', message: error.response?.data?.message || 'Nie udało się pobrać dostępnych biletów.' });
    } finally {
      setZakupLoading(false);
    }
  };

  const onZakupSubmit = async (e) => {
    e.preventDefault();
    if (!selectedZakupEvent) return;
    setZakupLoading(true);

    try {
      await apiClient.post(`/zakupy/wydarzenia/${selectedZakupEvent.id}`, {
        biletId: Number(zakupForm.biletId),
        ilosc: Number(zakupForm.ilosc),
        potwierdzPlatnosc: zakupForm.potwierdzPlatnosc,
        seatId: zakupForm.seatId || null
      }, getRequestConfig());
      setStatus({ type: 'success', message: 'Zakup zakończony pomyślnie.' });
      setZakupFormOpen(false);
      setSelectedZakupEvent(null);
      fetchMyWydarzenia();
    } catch (error) {
      const message = error.response?.data?.message
        || error.response?.data?.detail
        || (typeof error.response?.data === 'string' ? error.response.data : null)
        || 'Nie udało się zakończyć zakupu.';
      setStatus({ type: 'error', message });
    } finally {
      setZakupLoading(false);
    }
  };

  const openInfoModal = async (eventId) => {
    setInfoLoading(true);
    try {
      const eventResponse = await apiClient.get(`/wydarzenia/${eventId}`, getRequestConfig());
      setSelectedInfoEvent(eventResponse.data);
      setOpiniaForm({ ocena: '5', opis: '' });
    } catch (error) {
      setStatus({ type: 'error', message: error.response?.data?.message || 'Nie udalo sie pobrac szczegolow wydarzenia.' });
    } finally {
      setInfoLoading(false);
    }
  };

  const openPersonelModal = async (eventId) => {
    setInfoLoading(true);
    try {
      const [eventResponse, usersResponse] = await Promise.all([
        apiClient.get(`/wydarzenia/${eventId}`, getRequestConfig()),
        apiClient.get('/users', getRequestConfig())
      ]);
      setSelectedPersonelEvent(eventResponse.data);
      setPersonelUsers(usersResponse.data || []);
      setPersonelForm({ userId: '', rola: 'ochrona' });
    } catch (error) {
      setStatus({ type: 'error', message: error.response?.data?.message || 'Nie udalo sie pobrac danych personelu.' });
    } finally {
      setInfoLoading(false);
    }
  };

  const onOpiniaSubmit = async (event) => {
    event.preventDefault();
    if (!selectedInfoEvent) return;

    try {
      const response = await apiClient.post(
        `/wydarzenia/${selectedInfoEvent.id}/opinie`,
        { ocena: Number(opiniaForm.ocena), opis: opiniaForm.opis },
        getRequestConfig()
      );
      setStatus({ type: 'success', message: response.data || 'Opinia zostala dodana.' });
      setOpiniaForm({ ocena: '5', opis: '' });
      await openInfoModal(selectedInfoEvent.id);
    } catch (error) {
      setStatus({ type: 'error', message: error.response?.data?.message || 'Nie udalo sie dodac opinii.' });
    }
  };

  const onDeleteOpinia = async (opiniaId) => {
    if (!selectedInfoEvent) return;

    try {
      const response = await apiClient.delete(
        `/wydarzenia/${selectedInfoEvent.id}/opinie/${opiniaId}`,
        getRequestConfig()
      );
      setStatus({ type: 'success', message: response.data || 'Opinia zostala usunieta.' });
      await openInfoModal(selectedInfoEvent.id);
    } catch (error) {
      setStatus({ type: 'error', message: error.response?.data?.message || 'Nie udalo sie usunac opinii.' });
    }
  };

  const onPersonelSubmit = async (event) => {
    event.preventDefault();
    if (!selectedPersonelEvent || currentUser?.rola !== 'ORG') return;

    try {
      const response = await apiClient.post(
        `/wydarzenia/${selectedPersonelEvent.id}/personel`,
        { userId: Number(personelForm.userId), rola: personelForm.rola },
        getRequestConfig()
      );
      setStatus({ type: 'success', message: response.data || 'Personel zostal dodany.' });
      setPersonelForm({ userId: '', rola: 'ochrona' });
      await openPersonelModal(selectedPersonelEvent.id);
    } catch (error) {
      setStatus({ type: 'error', message: error.response?.data?.message || 'Nie udalo sie dodac personelu.' });
    }
  };

  const onDeletePersonel = async (personelId) => {
    if (!selectedPersonelEvent || currentUser?.rola !== 'ORG') return;

    try {
      const response = await apiClient.delete(
        `/wydarzenia/${selectedPersonelEvent.id}/personel/${personelId}`,
        getRequestConfig()
      );
      setStatus({ type: 'success', message: response.data || 'Rola personelu zostala anulowana.' });
      await openPersonelModal(selectedPersonelEvent.id);
    } catch (error) {
      setStatus({ type: 'error', message: error.response?.data?.message || 'Nie udalo sie anulowac roli.' });
    }
  };

  const onOrganizerRequestSubmit = async (event) => {
    event.preventDefault();
    if (currentUser?.rola !== 'USER') return;

    try {
      const response = await apiClient.post('/organizator/request', organizerForm, getRequestConfig());
      setStatus({ type: 'success', message: response.data || 'Wniosek zostal wyslany.' });
      setOrganizerForm({ firma: '', kwalifikacje: '', strona: '' });
      setOrganizerRequestOpen(false);
    } catch (error) {
      const message = error.response?.data?.message || error.response?.data || 'Nie udalo sie wyslac wniosku.';
      setStatus({ type: 'error', message });
    }
  };

  useEffect(() => {
    fetchMyWydarzenia();
    if (currentUser?.rola === 'ORG') {
      fetchWydarzeniaOptions();
    }
  }, [currentUser, fetchWydarzeniaOptions, fetchMyWydarzenia]);

  const filteredWydarzenia = myWydarzenia.filter((item) => {
    const matchesText = !wydarzeniaSearch
      || (item.tytul || "").toLowerCase().includes(wydarzeniaSearch.toLowerCase())
      || item.salaNazwa?.toLowerCase().includes(wydarzeniaSearch.toLowerCase());
    const matchesStatus = wydarzeniaStatusFilter === 'ALL'
      || (item.status || '').toUpperCase() === wydarzeniaStatusFilter;
    return matchesText && matchesStatus;
  });

  return (
    <>
    <div>
      <h2>Wydarzenia</h2>
      {status.message && <p className={`status-message ${status.type}`}>{status.message}</p>}
      
      <div className="events-view">
        <p>{currentUser?.rola === 'ORG' ? 'Zarzadzaj wszystkimi swoimi wydarzeniami w jednym miejscu.' : 'Przeglądaj wszystkie wydarzenia dostępne w systemie.'}</p>
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
            <div className="events-toolbar-actions">
              <span
                className={`permission-tooltip ${currentUser?.rola !== 'ORG' ? 'has-tooltip' : ''}`}
                data-tooltip={currentUser?.rola !== 'ORG' ? 'Dostępne tylko dla organizatora' : ''}
              >
                <button
                  type="button"
                  className="btn-new-event"
                  disabled={currentUser?.rola !== 'ORG'}
                  onClick={() => {
                    if (currentUser?.rola !== 'ORG') return;
                    setShowWydarzenieForm((prev) => !prev);
                    if (!showWydarzenieForm) fetchWydarzeniaOptions();
                  }}
                >
                  {showWydarzenieForm ? 'Zamknij formularz' : '+ Nowe wydarzenie'}
                </button>
              </span>
              <span
                className={`permission-tooltip ${currentUser?.rola !== 'USER' ? 'has-tooltip' : ''}`}
                data-tooltip={currentUser?.rola !== 'USER' ? 'Dostępne tylko dla użytkownika' : ''}
              >
                <button
                  type="button"
                  className="btn-new-event"
                  disabled={currentUser?.rola !== 'USER'}
                  onClick={() => setOrganizerRequestOpen(true)}
                >
                  Zostań organizatorem
                </button>
              </span>
            </div>
          </div>

          {showWydarzenieForm && (
            <form onSubmit={onWydarzenieSubmit} className="auth-form organizer-form event-form">
              <div className="event-form-layout">
                <div className="event-form-panel">
                  <label htmlFor="wyd-sala">Sala</label>
                  <select
                    id="wyd-sala"
                    value={wydarzenieForm.salaId}
                    onChange={(event) => {
                      const nextSala = wydarzenieOptions.sale.find((item) => String(item.id) === String(event.target.value));
                      setWydarzenieForm({
                        ...wydarzenieForm,
                        salaId: event.target.value,
                        bilety: wydarzenieForm.bilety.map((bilet) => ({
                          ...bilet,
                          seatIds: [],
                          ilosc: nextSala?.maPlan ? '' : bilet.ilosc
                        }))
                      });
                    }}
                    required
                  >
                    <option value="">Wybierz salę</option>
                    {wydarzenieOptions.sale.map((item) => (
                      <option key={item.id} value={item.id}>{item.nazwa} ({item.miejsceNazwa})</option>
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
                    <optgroup label="Systemowe (ADMIN)">
                      {wydarzenieOptions.kategorieSystemowe.map((item) => (
                        <option key={item.id} value={item.id}>{item.nazwa}</option>
                      ))}
                    </optgroup>
                    <optgroup label="Twoje (ORG)">
                      {wydarzenieOptions.kategorieUzytkownika.map((item) => (
                        <option key={item.id} value={item.id}>{item.nazwa}</option>
                      ))}
                      <option value="__NOWA_KATEGORIA__">+ Utworz nowa kategorie</option>
                    </optgroup>
                  </select>

                  {wydarzenieForm.createNowaKategoria && (
                    <>
                      <label htmlFor="wyd-nowa-kategoria-nazwa">Nowa kategoria - nazwa</label>
                      <input
                        id="wyd-nowa-kategoria-nazwa"
                        type="text"
                        value={wydarzenieForm.nowaKategoriaNazwa}
                        onChange={(event) => setWydarzenieForm({ ...wydarzenieForm, nowaKategoriaNazwa: event.target.value })}
                        required
                      />

                      <label htmlFor="wyd-nowa-kategoria-opis">Nowa kategoria - opis</label>
                      <input
                        id="wyd-nowa-kategoria-opis"
                        type="text"
                        value={wydarzenieForm.nowaKategoriaOpis}
                        onChange={(event) => setWydarzenieForm({ ...wydarzenieForm, nowaKategoriaOpis: event.target.value })}
                      />
                    </>
                  )}

                  <label htmlFor="wyd-rola">Rola</label>
                  <input id="wyd-rola" type="text" value={wydarzenieForm.rola} onChange={(e) => setWydarzenieForm({ ...wydarzenieForm, rola: e.target.value })} required />

                  <label htmlFor="wyd-status">Status</label>
                  <input id="wyd-status" type="text" value={wydarzenieForm.status} onChange={(e) => setWydarzenieForm({ ...wydarzenieForm, status: e.target.value })} required />

                  <label htmlFor="wyd-start">Data rozpoczecia</label>
                  <input id="wyd-start" type="datetime-local" value={wydarzenieForm.dataRozp} onChange={(e) => setWydarzenieForm({ ...wydarzenieForm, dataRozp: e.target.value })} required />

                  <label htmlFor="wyd-end">Data zakonczenia</label>
                  <input id="wyd-end" type="datetime-local" value={wydarzenieForm.dataZamk} onChange={(e) => setWydarzenieForm({ ...wydarzenieForm, dataZamk: e.target.value })} required />
                </div>

                <div className="event-form-panel event-form-panel--tickets">
                  <div className="event-ticket-section">
                    <div className="event-ticket-section-header">
                      <h4 style={{ margin: 0 }}>Konfiguracja Biletów</h4>
                      <div className="event-ticket-actions">
                        <button type="button" onClick={addBiletForm} className="btn-refresh">+ Dodaj pulę</button>
                        <button type="submit">Dodaj wydarzenie</button>
                      </div>
                    </div>
                    <div className="event-ticket-grid">
                      {wydarzenieForm.bilety.map((bilet, index) => (
                        <div key={index} className="event-ticket-card">
                          <label htmlFor={`bilet-klasa-${index}`}>Klasa biletu</label>
                          <input id={`bilet-klasa-${index}`} placeholder="Klasa biletu" value={bilet.klasa} onChange={(e) => updateBiletInForm(index, 'klasa', e.target.value)} required />

                          <label htmlFor={`bilet-cena-${index}`}>Cena</label>
                          <input id={`bilet-cena-${index}`} type="number" step="0.01" placeholder="Cena" value={bilet.cena} onChange={(e) => updateBiletInForm(index, 'cena', e.target.value)} required />

                          <label htmlFor={`bilet-ilosc-${index}`}>Ilość</label>
                          <input id={`bilet-ilosc-${index}`} type="number" placeholder="Ilość" value={bilet.ilosc} onChange={(e) => updateBiletInForm(index, 'ilosc', e.target.value)} disabled={hasSelectedSalaPlan} required />

                          <label htmlFor={`bilet-waluta-${index}`}>Waluta</label>
                          <select id={`bilet-waluta-${index}`} value={bilet.waluta} onChange={(e) => updateBiletInForm(index, 'waluta', e.target.value)} required>
                            <option value="PLN">PLN</option>
                            <option value="EUR">EUR</option>
                            <option value="USD">USD</option>
                          </select>

                          <label htmlFor={`bilet-start-${index}`}>Start sprzedaży</label>
                          <input id={`bilet-start-${index}`} type="datetime-local" value={bilet.start_sprzedazy} onChange={(e) => updateBiletInForm(index, 'start_sprzedazy', e.target.value)} />

                          <label htmlFor={`bilet-koniec-${index}`}>Koniec sprzedaży</label>
                          <input id={`bilet-koniec-${index}`} type="datetime-local" value={bilet.koniec_sprzedazy} onChange={(e) => updateBiletInForm(index, 'koniec_sprzedazy', e.target.value)} />

                          {hasSelectedSalaPlan && (
                            <>
                              <p style={{ margin: '8px 0 0', color: '#cbd5e1' }}>Wybierz miejsca tej klasy. Ilość ustala się automatycznie.</p>
                              <SeatPlanMap
                                seats={selectedSalaSeats}
                                rows={selectedSalaSeats.filter((item) => (item.type || 'SEAT') === 'ROW')}
                                seatClassById={getSeatClassById()}
                                selectedSeatIds={bilet.seatIds || []}
                                selectableSeatIds={getSelectableSeatIds(index)}
                                onSeatClick={(seatId) => toggleBiletSeat(index, seatId)}
                                showLegend
                              />
                            </>
                          )}

                          <button type="button" onClick={() => removeBiletForm(index)} className="btn-delete">X</button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </form>
          )}

          {wydarzenieLoading && <h3>Ladowanie...</h3>}

          <div className="events-grid events-grid--wydarzenia">
            {filteredWydarzenia.length > 0 ? filteredWydarzenia.map((item) => (
              <div key={item.id} className="event-management-wrapper" style={{ border: '1px solid #ddd', borderRadius: '12px', padding: '15px', backgroundColor: '#1a1d24', minWidth: 0, overflow: 'visible' }}>
                <WydarzenieCard
                  item={item}
                  currentUserRole={currentUser?.rola}
                  onMoreInfo={openInfoModal}
                  onPersonel={openPersonelModal}
                  onPurchase={openZakupForm}
                />

                {currentUser?.rola === 'ADMIN' && String(item.status || '').toUpperCase() === 'AKTYWNY' ? (
                  <div style={{ marginTop: '12px' }}>
                    <button
                      type="button"
                      className="btn-secondary"
                      onClick={() => handleEndEventAsAdmin(item.id)}
                    >
                      Zakończ wydarzenie
                    </button>
                  </div>
                ) : null}

                {/* Dlaczego zakomentowane: należy dodać warunek że tylko autor wydarzenia może dodać nową pulę biletów dla swojego wydarzenia. Jak jest teraz: niezależnie od tego kto jest autorem, może dodać nową pulę biletów dla każdego wydarzenia co jest bardzo niebezpieczne.
                <div style={{ marginTop: '20px' }}>
                  <span
                    className={`permission-tooltip ${currentUser?.rola !== 'ORG' ? 'has-tooltip' : ''}`}
                    data-tooltip={currentUser?.rola !== 'ORG' ? 'Dostępne tylko dla organizatora' : ''}
                  >
                    <button
                      type="button"
                      className="btn-secondary"
                      disabled={currentUser?.rola !== 'ORG'}
                      onClick={() => setOpenTicketFormEventId(item.id)}
                    >
                      + Nowa pula biletów
                    </button>
                  </span>
                </div>
                */}
              </div>
            )) : (
              <p>Brak wydarzen.</p>
            )}
          </div>
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
      {openTicketFormEventId && (
        <div
          className="modal-overlay"
          role="dialog"
          aria-modal="true"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setOpenTicketFormEventId(null);
          }}
        >
          <div className="modal-card info-modal-card">
            <div className="modal-header">
              <div className="modal-title">Formularz nowej puli biletów</div>
              <button
                type="button"
                className="modal-close"
                onClick={() => setOpenTicketFormEventId(null)}
                aria-label="Zamknij"
              >
                ×
              </button>
            </div>

            <form
              onSubmit={e => onTicketSubmit(e, openTicketFormEventId)}
              className="auth-form organizer-form event-form"
              style={{ display: 'grid', gap: '15px', padding: '0', opacity: currentUser?.rola === 'ORG' ? 1 : 0.5 }}
            >
              <div>
                <label htmlFor={`t-klasa-${openTicketFormEventId}`}>Klasa biletu (np. VIP)</label>
                <input
                  id={`t-klasa-${openTicketFormEventId}`}
                  type="text"
                  placeholder="Wpisz klasę..."
                  value={ticketForms[openTicketFormEventId]?.klasa || ''}
                  onChange={e => updateTicketForm(openTicketFormEventId, 'klasa', e.target.value)}
                  disabled={currentUser?.rola !== 'ORG'}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '15px' }}>
                <div>
                  <label htmlFor={`t-cena-${openTicketFormEventId}`}>Cena</label>
                  <input
                    id={`t-cena-${openTicketFormEventId}`}
                    type="number" step="0.01" placeholder="0.00"
                    value={ticketForms[openTicketFormEventId]?.cena || ''}
                    onChange={e => updateTicketForm(openTicketFormEventId, 'cena', e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label htmlFor={`t-qty-${openTicketFormEventId}`}>Liczba biletów</label>
                  <input
                    id={`t-qty-${openTicketFormEventId}`}
                    type="number" placeholder="np. 50"
                    value={ticketForms[openTicketFormEventId]?.ilosc || ''}
                    onChange={e => updateTicketForm(openTicketFormEventId, 'ilosc', e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label htmlFor={`t-waluta-${openTicketFormEventId}`}>Waluta</label>
                  <select
                    id={`t-waluta-${openTicketFormEventId}`}
                    value={ticketForms[openTicketFormEventId]?.waluta || 'PLN'}
                    onChange={e => updateTicketForm(openTicketFormEventId, 'waluta', e.target.value)}
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
                  <label htmlFor={`t-start-${openTicketFormEventId}`}>Start sprzedaży</label>
                  <input
                    id={`t-start-${openTicketFormEventId}`}
                    type="datetime-local"
                    value={ticketForms[openTicketFormEventId]?.start_sprzedazy || ''}
                    onChange={e => updateTicketForm(openTicketFormEventId, 'start_sprzedazy', e.target.value)}
                  />
                </div>
                <div>
                  <label htmlFor={`t-end-${openTicketFormEventId}`}>Koniec sprzedaży</label>
                  <input
                    id={`t-end-${openTicketFormEventId}`}
                    type="datetime-local"
                    value={ticketForms[openTicketFormEventId]?.koniec_sprzedazy || ''}
                    onChange={e => updateTicketForm(openTicketFormEventId, 'koniec_sprzedazy', e.target.value)}
                  />
                </div>
              </div>

              <span
                className={`permission-tooltip ${currentUser?.rola !== 'ORG' ? 'has-tooltip' : ''}`}
                data-tooltip={currentUser?.rola !== 'ORG' ? 'Dostępne tylko dla organizatora' : ''}
                style={{ width: '100%' }}
              >
                <button type="submit" className="btn-new-event" style={{ width: '100%' }} disabled={currentUser?.rola !== 'ORG'}>
                  Dodaj pulę biletów
                </button>
              </span>
            </form>
          </div>
        </div>
      )}
      {selectedInfoEvent && (
        <div
          className="modal-overlay"
          role="dialog"
          aria-modal="true"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setSelectedInfoEvent(null);
          }}
        >
          <div className="modal-card modal-card--w600">
            <div className="modal-header">
              <div className="modal-title">Więcej informacji</div>
              <button
                type="button"
                className="modal-close"
                onClick={() => setSelectedInfoEvent(null)}
                aria-label="Zamknij"
              >
                ×
              </button>
            </div>
            <div className="modal-grid info-modal-layout">
              <div className="info-top-section">
                <p>Szczegóły na temat: {selectedInfoEvent.tytul}</p>
                <p>do rozbudowania</p>
                {infoLoading && <p>Ladowanie szczegolow...</p>}
              </div>

              <div className="event-detail-opinie info-left-section">
                <h3>Opinie</h3>
                <form onSubmit={onOpiniaSubmit} className="auth-form organizer-form">
                  <label htmlFor="opinia-ocena">Ocena</label>
                  <select
                    id="opinia-ocena"
                    value={opiniaForm.ocena}
                    onChange={(event) => setOpiniaForm({ ...opiniaForm, ocena: event.target.value })}
                  >
                    <option value="5">5</option>
                    <option value="4">4</option>
                    <option value="3">3</option>
                    <option value="2">2</option>
                    <option value="1">1</option>
                  </select>

                  <label htmlFor="opinia-opis">Opis</label>
                  <textarea
                    id="opinia-opis"
                    value={opiniaForm.opis}
                    onChange={(event) => setOpiniaForm({ ...opiniaForm, opis: event.target.value })}
                    required
                  />

                  <button type="submit">Dodaj opinię</button>
                </form>

                <div className="events-grid">
                  {selectedInfoEvent.opinie?.length > 0 ? selectedInfoEvent.opinie.map((opinia) => (
                    <article key={opinia.id} className="event-card">
                      <span className="event-badge">ocena {opinia.ocena}/5</span>
                      <h3>{opinia.userLogin}</h3>
                      <p>{opinia.opis}</p>
                      <p>{opinia.data ? new Date(opinia.data).toLocaleString() : '-'}</p>
                      {(opinia.userLogin === currentUser.login || currentUser.rola === 'ADMIN') && (
                        <button
                          type="button"
                          className="btn-delete"
                          onClick={() => onDeleteOpinia(opinia.id)}
                        >
                          Usuń opinię
                        </button>
                      )}
                    </article>
                  )) : (
                    <p>Brak opinii dla tego wydarzenia.</p>
                  )}
                </div>
              </div>

            </div>
          </div>
        </div>
      )}
      {selectedPersonelEvent && (
        <div
          className="modal-overlay"
          role="dialog"
          aria-modal="true"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setSelectedPersonelEvent(null);
          }}
        >
          <div className="modal-card modal-card--w600">
            <div className="modal-header">
              <div className="modal-title">Personel</div>
              <button
                type="button"
                className="modal-close"
                onClick={() => setSelectedPersonelEvent(null)}
                aria-label="Zamknij"
              >
                ×
              </button>
            </div>
            <div className="modal-grid info-modal-layout">
              <div className="info-top-section">
                <p>Personel dla wydarzenia: {selectedPersonelEvent.tytul}</p>
                {infoLoading && <p>Ladowanie danych...</p>}
              </div>
              <div className="event-detail-opinie info-left-section">
                <h3>Zarządzanie personelem</h3>
                <p>{currentUser?.rola === 'ORG' ? 'Możesz dodawać i usuwać personel.' : 'Edycja tylko dla organizatora.'}</p>
                <form onSubmit={onPersonelSubmit} className="auth-form organizer-form">
                  <label htmlFor="personel-user">Użytkownik</label>
                  <select
                    id="personel-user"
                    value={personelForm.userId}
                    onChange={(event) => setPersonelForm({ ...personelForm, userId: event.target.value })}
                    required
                    disabled={currentUser?.rola !== 'ORG'}
                  >
                    <option value="">Wybierz użytkownika</option>
                    {personelUsers
                      .filter((user) => user.rola !== 'ADMIN' && user.aktywnosc !== false)
                      .map((user) => (
                        <option key={user.id} value={user.id}>
                          {user.login} ({user.imie || '-'} {user.nazwisko || '-'})
                        </option>
                      ))}
                  </select>

                  <label htmlFor="personel-rola">Rola</label>
                  <select
                    id="personel-rola"
                    value={personelForm.rola}
                    onChange={(event) => setPersonelForm({ ...personelForm, rola: event.target.value })}
                    disabled={currentUser?.rola !== 'ORG'}
                  >
                    {PERSONEL_ROLE_OPTIONS.map((role) => (
                      <option key={role} value={role}>{role}</option>
                    ))}
                  </select>

                  <button type="submit" disabled={currentUser?.rola !== 'ORG'}>
                    Dodaj personel
                  </button>
                </form>
              </div>
              <div className="event-detail-opinie info-right-section">
                <h3>Aktualny personel</h3>
                {selectedPersonelEvent.personel?.length > 0 ? (
                  <table className="participants-table">
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Użytkownik</th>
                        <th>Rola</th>
                        <th>Data zajęcia</th>
                        <th>Akcje</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedPersonelEvent.personel.map((item) => (
                        <tr key={item.id}>
                          <td>{item.id}</td>
                          <td>{item.userLogin} ({item.userImie} {item.userNazwisko})</td>
                          <td>{item.rola}</td>
                          <td>{item.dataZajet ? new Date(item.dataZajet).toLocaleString() : '-'}</td>
                          <td>
                            <button
                              type="button"
                              onClick={() => onDeletePersonel(item.id)}
                              disabled={currentUser?.rola !== 'ORG'}
                            >
                              Anuluj
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <p>Brak przypisanego personelu.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
      {organizerRequestOpen && (
        <div
          className="modal-overlay"
          role="dialog"
          aria-modal="true"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setOrganizerRequestOpen(false);
          }}
        >
          <div className="modal-card">
            <div className="modal-header">
              <div className="modal-title">Wniosek o rolę organizatora</div>
              <button
                type="button"
                className="modal-close"
                onClick={() => setOrganizerRequestOpen(false)}
                aria-label="Zamknij"
              >
                ×
              </button>
            </div>
            <form onSubmit={onOrganizerRequestSubmit} className="auth-form organizer-form" style={{ padding: '16px' }}>
              <label htmlFor="org-firma">Firma</label>
              <input
                id="org-firma"
                type="text"
                value={organizerForm.firma}
                onChange={(event) => setOrganizerForm({ ...organizerForm, firma: event.target.value })}
                required
                disabled={currentUser?.rola !== 'USER'}
              />

              <label htmlFor="org-kwalifikacje">Kwalifikacje</label>
              <input
                id="org-kwalifikacje"
                type="text"
                value={organizerForm.kwalifikacje}
                onChange={(event) => setOrganizerForm({ ...organizerForm, kwalifikacje: event.target.value })}
                required
                disabled={currentUser?.rola !== 'USER'}
              />

              <label htmlFor="org-strona">Strona</label>
              <input
                id="org-strona"
                type="text"
                value={organizerForm.strona}
                onChange={(event) => setOrganizerForm({ ...organizerForm, strona: event.target.value })}
                required
                disabled={currentUser?.rola !== 'USER'}
              />

              <button type="submit" disabled={currentUser?.rola !== 'USER'}>
                Wyślij wniosek
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default WydarzeniaPage;
