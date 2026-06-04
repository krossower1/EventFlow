import React, { useState, useEffect, useContext, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { apiClient, getAuthHeaders } from '../api/apiClient';
import { AuthContext } from '../context/AuthContext';
import WydarzenieCard from '../components/WydarzenieCard';
import PurchaseModal from '../components/PurchaseModal';
import SeatPlanMap from '../components/SeatPlanMap';
import { ensureObservedLoaded, getObservedEvents, OBSERVED_EVENTS_CHANGED } from '../utils/obserwowaneWydarzenia';

const TICKET_CATEGORY_SEAT = 'MIEJSCOWKA';
const isSeatTicketCategory = (value) => !String(value || TICKET_CATEGORY_SEAT).trim().toLowerCase().startsWith('wej');
const isSeatPlanElement = (item) => String(item?.type || 'SEAT').toUpperCase() !== 'ROW';

const WydarzeniaPage = () => {
  const { t } = useTranslation();
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
    status: '',
    dataRozp: '',
    dataZamk: '',
    createNowaKategoria: false,
    nowaKategoriaNazwa: '',
    nowaKategoriaOpis: '',
    bilety: [{ klasa: '', cena: '', ilosc: '', waluta: 'PLN', start_sprzedazy: '', koniec_sprzedazy: '', seatIds: [], kategoriaBiletu: 'miejscówka' }]
  });
  const [status, setStatus] = useState({ type: '', message: '' });
  const [ticketForms, setTicketForms] = useState({});
  const [openTicketFormEventId, setOpenTicketFormEventId] = useState(null);
  const [zakupFormOpen, setZakupFormOpen] = useState(false);
  const [selectedZakupEvent, setSelectedZakupEvent] = useState(null);
  const [dostepneBilety, setDostepneBilety] = useState([]);
  const [observedEventIds, setObservedEventIds] = useState(new Set());
  const [zakupLoading, setZakupLoading] = useState(false);
  const [zakupForm, setZakupForm] = useState({ biletId: '', ilosc: '1', potwierdzPlatnosc: false, seatId: '' });
  const [selectedInfoEvent, setSelectedInfoEvent] = useState(null);
  const [selectedPersonelEvent, setSelectedPersonelEvent] = useState(null);
  const [confirmEndEventId, setConfirmEndEventId] = useState(null);
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
  const selectedSalaSeatPlaces = useMemo(
    () => selectedSalaSeats.filter(isSeatPlanElement),
    [selectedSalaSeats]
  );
  const hasSelectedSalaPlan = Boolean(selectedSala?.maPlan) || selectedSalaSeatPlaces.length > 0;

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
      const miejscaResponse = await apiClient.get('/miejsca/my', getRequestConfig());
      const saleById = new Map(
        (Array.isArray(miejscaResponse.data) ? miejscaResponse.data : [])
          .flatMap((miejsce) => miejsce.sale || [])
          .map((sala) => [String(sala.id), sala])
      );
      const options = response.data || {};
      setWydarzenieOptions({
        ...options,
        sale: (options.sale || []).map((sala) => {
          const fullSala = saleById.get(String(sala.id));
          if (!fullSala) return sala;
          const seats = Array.isArray(sala.seats) && sala.seats.length > 0 ? sala.seats : (fullSala.seats || []);
          return {
            ...sala,
            maPlan: sala.maPlan ?? fullSala.maPlan,
            layoutWidth: fullSala.layoutWidth,
            layoutHeight: fullSala.layoutHeight,
            seats
          };
        })
      });
    } catch (error) {
      setStatus({ type: 'error', message: error.response?.data?.message || t('events.status.optionsFetchError') });
    } finally {
      setWydarzenieLoading(false);
    }
  }, [getRequestConfig, t]);

  const fetchMyWydarzenia = useCallback(async () => {
    try {
      const response = await apiClient.get('/wydarzenia/open', getRequestConfig());
      setMyWydarzenia(response.data);
    } catch (error) {
      setStatus({ type: 'error', message: error.response?.data?.message || t('events.status.listFetchError') });
    }
  }, [getRequestConfig, t]);

  useEffect(() => {
    if (confirmEndEventId == null) return undefined;
    const handleClickOutsideConfirm = (event) => {
      if (!event.target.closest('.inline-confirm-anchor')) {
        setConfirmEndEventId(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutsideConfirm);
    return () => document.removeEventListener('mousedown', handleClickOutsideConfirm);
  }, [confirmEndEventId]);

  const handleEndEventAsAdmin = async (eventId) => {
    try {
      await apiClient.put(`/wydarzenia/${eventId}/status`, { status: 'NIEAKTYWNY' }, getRequestConfig());
      await fetchMyWydarzenia();
      setConfirmEndEventId(null);
      setStatus({ type: 'success', message: t('events.status.endSuccess') });
    } catch (error) {
      setStatus({
        type: 'error',
        message: error.response?.data?.message || t('events.status.endError'),
      });
    }
  };

  const addBiletForm = () => {
    setWydarzenieForm(prev => ({
      ...prev,
      bilety: [...prev.bilety, { klasa: '', cena: '', ilosc: '', waluta: 'PLN', start_sprzedazy: '', koniec_sprzedazy: '', seatIds: [], kategoriaBiletu: 'miejscówka' }]
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
      selectedSalaSeatPlaces
        .map((seat) => seat.id)
        .filter((seatId) => !blocked.has(seatId) || currentSeatIds.includes(seatId))
    );
  };

  const onWydarzenieSubmit = async (event) => {
    event.preventDefault();
    setStatus({ type: '', message: '' });

    if (wydarzenieForm.bilety.length === 0) {
      setStatus({ type: 'error', message: t('events.status.mustAddTicketType') });
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
          seatIds: b.seatIds || [],
          kategoriaBiletu: b.kategoriaBiletu || 'miejscówka'
        }))
      });

      await apiClient.post(
        '/wydarzenia',
        {
          salaId: Number(wydarzenieForm.salaId),
          tytul: wydarzenieForm.tytul,
          opis: wydarzenieForm.opis,
          kategoriaId: wydarzenieForm.createNowaKategoria ? null : Number(wydarzenieForm.kategoriaId),
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
            seatIds: b.seatIds || [],
            kategoriaBiletu: b.kategoriaBiletu || 'miejscówka'
          }))
        },
        getRequestConfig()
      );

      setStatus({ type: 'success', message: t('events.status.addSuccess') });
      setShowWydarzenieForm(false);
      setWydarzenieForm({
        salaId: '', tytul: '', opis: '', kategoriaId: '', status: '',
        dataRozp: '', dataZamk: '', createNowaKategoria: false,
        nowaKategoriaNazwa: '', nowaKategoriaOpis: '',
        bilety: [{ klasa: '', cena: '', ilosc: '', waluta: 'PLN', start_sprzedazy: '', koniec_sprzedazy: '', seatIds: [], kategoriaBiletu: 'miejscówka' }]
      });
      fetchWydarzeniaOptions();
      fetchMyWydarzenia();
    } catch (error) {
      setStatus({ type: 'error', message: error.response?.data?.message || t('events.status.addError') });
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
      setStatus({ type: 'success', message: t('events.status.ticketPoolAdded') });
      setTicketForms(prev => ({ ...prev, [eventId]: { klasa: '', cena: '', ilosc: '', waluta: 'PLN', start_sprzedazy: '', koniec_sprzedazy: '' } }));
      setOpenTicketFormEventId(null);
      fetchMyWydarzenia(); // Odśwież listę, by zobaczyć zmiany
    } catch (error) {
      setStatus({ type: 'error', message: t('events.status.ticketPoolAddError') });
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
      setStatus({ type: 'error', message: error.response?.data?.message || t('events.status.availableTicketsError') });
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
      setStatus({ type: 'success', message: t('events.status.purchaseSuccess') });
      setZakupFormOpen(false);
      setSelectedZakupEvent(null);
      fetchMyWydarzenia();
    } catch (error) {
      const message = error.response?.data?.message
        || error.response?.data?.detail
        || (typeof error.response?.data === 'string' ? error.response.data : null)
        || t('events.status.purchaseError');
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
      setStatus({ type: 'error', message: error.response?.data?.message || t('events.status.eventDetailsError') });
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
      setStatus({ type: 'error', message: error.response?.data?.message || t('events.status.personnelDataError') });
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
      setStatus({ type: 'success', message: response.data || t('events.status.reviewAdded') });
      setOpiniaForm({ ocena: '5', opis: '' });
      await openInfoModal(selectedInfoEvent.id);
    } catch (error) {
      setStatus({ type: 'error', message: error.response?.data?.message || t('events.status.reviewAddError') });
    }
  };

  const onDeleteOpinia = async (opiniaId) => {
    if (!selectedInfoEvent) return;

    try {
      const response = await apiClient.delete(
        `/wydarzenia/${selectedInfoEvent.id}/opinie/${opiniaId}`,
        getRequestConfig()
      );
      setStatus({ type: 'success', message: response.data || t('events.status.reviewDeleted') });
      await openInfoModal(selectedInfoEvent.id);
    } catch (error) {
      setStatus({ type: 'error', message: error.response?.data?.message || t('events.status.reviewDeleteError') });
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
      setStatus({ type: 'success', message: response.data || t('events.status.personnelAdded') });
      setPersonelForm({ userId: '', rola: 'ochrona' });
      await openPersonelModal(selectedPersonelEvent.id);
    } catch (error) {
      setStatus({ type: 'error', message: error.response?.data?.message || t('events.status.personnelAddError') });
    }
  };

  const onDeletePersonel = async (personelId) => {
    if (!selectedPersonelEvent || currentUser?.rola !== 'ORG') return;

    try {
      const response = await apiClient.delete(
        `/wydarzenia/${selectedPersonelEvent.id}/personel/${personelId}`,
        getRequestConfig()
      );
      setStatus({ type: 'success', message: response.data || t('events.status.personnelRevoked') });
      await openPersonelModal(selectedPersonelEvent.id);
    } catch (error) {
      setStatus({ type: 'error', message: error.response?.data?.message || t('events.status.personnelRevokeError') });
    }
  };

  const onOrganizerRequestSubmit = async (event) => {
    event.preventDefault();
    if (currentUser?.rola !== 'USER') return;

    try {
      const response = await apiClient.post('/organizator/request', organizerForm, getRequestConfig());
      setStatus({ type: 'success', message: response.data || t('events.status.organizerRequestSent') });
      setOrganizerForm({ firma: '', kwalifikacje: '', strona: '' });
      setOrganizerRequestOpen(false);
    } catch (error) {
      const message = error.response?.data?.message || error.response?.data || t('events.status.organizerRequestError');
      setStatus({ type: 'error', message });
    }
  };

  useEffect(() => {
    fetchMyWydarzenia();
    if (currentUser?.rola === 'ORG') {
      fetchWydarzeniaOptions();
    }
  }, [currentUser, fetchWydarzeniaOptions, fetchMyWydarzenia]);

  useEffect(() => {
    if (currentUser?.rola !== 'USER' || !currentUser?.id) {
      setObservedEventIds(new Set());
      return undefined;
    }

    let cancelled = false;
    const syncObservedIds = () => {
      if (!cancelled) {
        setObservedEventIds(new Set(getObservedEvents().map((event) => event.id)));
      }
    };

    ensureObservedLoaded(authCredentials, currentUser.id)
      .then(syncObservedIds)
      .catch(() => {
        if (!cancelled) setObservedEventIds(new Set());
      });
    window.addEventListener(OBSERVED_EVENTS_CHANGED, syncObservedIds);

    return () => {
      cancelled = true;
      window.removeEventListener(OBSERVED_EVENTS_CHANGED, syncObservedIds);
    };
  }, [authCredentials, currentUser?.id, currentUser?.rola]);

  const filteredWydarzenia = myWydarzenia.filter((item) => {
    const matchesText = !wydarzeniaSearch
      || (item.tytul || "").toLowerCase().includes(wydarzeniaSearch.toLowerCase())
      || item.salaNazwa?.toLowerCase().includes(wydarzeniaSearch.toLowerCase());
    const matchesStatus = wydarzeniaStatusFilter === 'ALL'
      || (item.status || '').toUpperCase() === wydarzeniaStatusFilter;
    return matchesText && matchesStatus;
  }).sort((a, b) => {
    const aObserved = observedEventIds.has(a.id) ? 1 : 0;
    const bObserved = observedEventIds.has(b.id) ? 1 : 0;
    if (aObserved !== bObserved) return bObserved - aObserved;
    return new Date(a.dataRozp || 0) - new Date(b.dataRozp || 0);
  });

  return (
    <>
    <div>
      <h2>{t('events.page.title')}</h2>
      {status.message && <p className={`status-message ${status.type}`}>{status.message}</p>}
      
      <div className="events-view">
        <p>{currentUser?.rola === 'ORG' ? t('events.page.leadOrg') : t('events.page.leadUser')}</p>
        <div className="events-toolbar">
            <input
              type="text"
              className="events-search"
              placeholder={t('events.search.placeholder')}
              value={wydarzeniaSearch}
              onChange={(event) => setWydarzeniaSearch(event.target.value)}
            />
            <select
              className="events-filter"
              value={wydarzeniaStatusFilter}
              onChange={(event) => setWydarzeniaStatusFilter(event.target.value)}
            >
              <option value="ALL">{t('events.filter.all')}</option>
              <option value="AKTYWNE">{t('events.filter.active')}</option>
              <option value="SZKIC">{t('events.filter.draft')}</option>
              <option value="ZAMKNIETE">{t('events.filter.closed')}</option>
            </select>
            <div className="events-toolbar-actions">
              <span
                className={`permission-tooltip ${currentUser?.rola !== 'ORG' ? 'has-tooltip' : ''}`}
                data-tooltip={currentUser?.rola !== 'ORG' ? t('events.tooltip.onlyOrganizer') : ''}
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
                  {showWydarzenieForm ? t('events.toolbar.closeForm') : t('events.toolbar.newEvent')}
                </button>
              </span>
              <span
                className={`permission-tooltip ${currentUser?.rola !== 'USER' ? 'has-tooltip' : ''}`}
                data-tooltip={currentUser?.rola !== 'USER' ? t('events.tooltip.onlyUser') : ''}
              >
                <button
                  type="button"
                  className="btn-new-event"
                  disabled={currentUser?.rola !== 'USER'}
                  onClick={() => setOrganizerRequestOpen(true)}
                >
                  {t('events.toolbar.becomeOrganizer')}
                </button>
              </span>
            </div>
          </div>

          {showWydarzenieForm && (
            <form onSubmit={onWydarzenieSubmit} className="auth-form organizer-form event-form">
              <div className="event-form-layout">
                <div className="event-form-panel">
                  <label htmlFor="wyd-sala">{t('events.form.hall')}</label>
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
                    <option value="">{t('events.form.hallSelect')}</option>
                    {wydarzenieOptions.sale.map((item) => (
                      <option key={item.id} value={item.id}>{item.nazwa} ({item.miejsceNazwa})</option>
                    ))}
                  </select>

                  <label htmlFor="wyd-tytul">{t('events.form.title')}</label>
                  <input
                    id="wyd-tytul"
                    type="text"
                    value={wydarzenieForm.tytul}
                    onChange={(event) => setWydarzenieForm({ ...wydarzenieForm, tytul: event.target.value })}
                    required
                  />

                  <label htmlFor="wyd-opis">{t('events.form.description')}</label>
                  <input
                    id="wyd-opis"
                    type="text"
                    value={wydarzenieForm.opis}
                    onChange={(event) => setWydarzenieForm({ ...wydarzenieForm, opis: event.target.value })}
                  />

                  <label htmlFor="wyd-kategoria">{t('events.form.category')}</label>
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
                    <option value="">{t('events.form.categorySelect')}</option>
                    <optgroup label={t('events.form.categorySystem')}>
                      {wydarzenieOptions.kategorieSystemowe.map((item) => (
                        <option key={item.id} value={item.id}>{item.nazwa}</option>
                      ))}
                    </optgroup>
                    <optgroup label={t('events.form.categoryYours')}>
                      {wydarzenieOptions.kategorieUzytkownika.map((item) => (
                        <option key={item.id} value={item.id}>{item.nazwa}</option>
                      ))}
                      <option value="__NOWA_KATEGORIA__">{t('events.form.categoryCreate')}</option>
                    </optgroup>
                  </select>

                  {wydarzenieForm.createNowaKategoria && (
                    <>
                      <label htmlFor="wyd-nowa-kategoria-nazwa">{t('events.form.newCategoryName')}</label>
                      <input
                        id="wyd-nowa-kategoria-nazwa"
                        type="text"
                        value={wydarzenieForm.nowaKategoriaNazwa}
                        onChange={(event) => setWydarzenieForm({ ...wydarzenieForm, nowaKategoriaNazwa: event.target.value })}
                        required
                      />

                      <label htmlFor="wyd-nowa-kategoria-opis">{t('events.form.newCategoryDescription')}</label>
                      <input
                        id="wyd-nowa-kategoria-opis"
                        type="text"
                        value={wydarzenieForm.nowaKategoriaOpis}
                        onChange={(event) => setWydarzenieForm({ ...wydarzenieForm, nowaKategoriaOpis: event.target.value })}
                      />
                    </>
                  )}

                  <label htmlFor="wyd-status">{t('events.form.status')}</label>
                  <select id="wyd-status" value={wydarzenieForm.status} onChange={(e) => setWydarzenieForm({ ...wydarzenieForm, status: e.target.value })} required>
                    <option value="">{t('events.form.statusSelect')}</option>
                    <option value="AKTYWNY">AKTYWNY</option>
                    <option value="DRAFT">DRAFT</option>
                    <option value="NIEAKTYWNY">NIEAKTYWNY</option>
                  </select>

                  <label htmlFor="wyd-start">{t('events.form.dateStart')}</label>
                  <input id="wyd-start" type="datetime-local" value={wydarzenieForm.dataRozp} onChange={(e) => setWydarzenieForm({ ...wydarzenieForm, dataRozp: e.target.value })} required />

                  <label htmlFor="wyd-end">{t('events.form.dateEnd')}</label>
                  <input id="wyd-end" type="datetime-local" value={wydarzenieForm.dataZamk} onChange={(e) => setWydarzenieForm({ ...wydarzenieForm, dataZamk: e.target.value })} required />
                </div>

                <div className="event-form-panel event-form-panel--tickets">
                  <div className="event-ticket-section">
                    <div className="event-ticket-section-header">
                      <h4 style={{ margin: 0 }}>{t('events.tickets.sectionTitle')}</h4>
                      <div className="event-ticket-actions">
                        <button type="button" onClick={addBiletForm} className="btn-refresh">{t('events.tickets.addPool')}</button>
                        <button type="submit">{t('events.tickets.addEvent')}</button>
                      </div>
                    </div>
                    <div className="event-ticket-grid">
                      {wydarzenieForm.bilety.map((bilet, index) => (
                        <div key={index} className="event-ticket-card">
                          <label htmlFor={`bilet-kategoria-${index}`}>{t('events.tickets.ticketCategory')}</label>
                          <select id={`bilet-kategoria-${index}`} value={bilet.kategoriaBiletu || 'miejscówka'} onChange={(e) => updateBiletInForm(index, 'kategoriaBiletu', e.target.value)} required>
                            <option value="miejscówka">{t('events.tickets.categorySeat')}</option>
                            <option value="wejściówka">{t('events.tickets.categoryEntry')}</option>
                          </select>

                          <label htmlFor={`bilet-klasa-${index}`}>{t('events.tickets.class')}</label>
                          <select id={`bilet-klasa-${index}`} value={bilet.klasa} onChange={(e) => updateBiletInForm(index, 'klasa', e.target.value)} required>
                            <option value="">{t('events.tickets.classSelect')}</option>
                            <option value="Standard">Standard</option>
                            <option value="VIP">VIP</option>
                          </select>

                          <label htmlFor={`bilet-cena-${index}`}>{t('events.tickets.price')}</label>
                          <input id={`bilet-cena-${index}`} type="number" step="0.01" placeholder={t('events.tickets.price')} value={bilet.cena} onChange={(e) => updateBiletInForm(index, 'cena', e.target.value)} required />

                          <label htmlFor={`bilet-ilosc-${index}`}>{t('events.tickets.quantity')}</label>
                          <input id={`bilet-ilosc-${index}`} type="number" placeholder={t('events.tickets.quantity')} value={bilet.ilosc} onChange={(e) => updateBiletInForm(index, 'ilosc', e.target.value)} disabled={hasSelectedSalaPlan && isSeatTicketCategory(bilet.kategoriaBiletu)} required />

                          <label htmlFor={`bilet-waluta-${index}`}>{t('events.tickets.currency')}</label>
                          <select id={`bilet-waluta-${index}`} value={bilet.waluta} onChange={(e) => updateBiletInForm(index, 'waluta', e.target.value)} required>
                            <option value="PLN">PLN</option>
                            <option value="EUR">EUR</option>
                            <option value="USD">USD</option>
                          </select>

                          <label htmlFor={`bilet-start-${index}`}>{t('events.tickets.salesStart')}</label>
                          <input id={`bilet-start-${index}`} type="datetime-local" value={bilet.start_sprzedazy} onChange={(e) => updateBiletInForm(index, 'start_sprzedazy', e.target.value)} />

                          <label htmlFor={`bilet-koniec-${index}`}>{t('events.tickets.salesEnd')}</label>
                          <input id={`bilet-koniec-${index}`} type="datetime-local" value={bilet.koniec_sprzedazy} onChange={(e) => updateBiletInForm(index, 'koniec_sprzedazy', e.target.value)} />

                          {hasSelectedSalaPlan && isSeatTicketCategory(bilet.kategoriaBiletu) && (
                            <>
                              <p style={{ margin: '8px 0 0', color: '#cbd5e1' }}>{t('events.tickets.seatHint')}</p>
                              {selectedSalaSeatPlaces.length > 0 ? (
                                <SeatPlanMap
                                  seats={selectedSalaSeats}
                                  rows={selectedSalaSeats.filter((item) => String(item?.type || '').toUpperCase() === 'ROW')}
                                  seatClassById={getSeatClassById()}
                                  selectedSeatIds={bilet.seatIds || []}
                                  selectableSeatIds={getSelectableSeatIds(index)}
                                  onSeatClick={(seatId) => toggleBiletSeat(index, seatId)}
                                  showLegend
                                />
                              ) : (
                                <p className="status-message error">Nie udało się pobrać miejsc dla wybranej sali.</p>
                              )}
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

          {wydarzenieLoading && <h3>{t('events.loading')}</h3>}

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
                    <span className="inline-confirm-anchor" style={{ display: 'inline-block' }}>
                      {confirmEndEventId === item.id ? (
                        <span className="inline-confirm-popover" role="group" aria-label={t('events.admin.confirmEndAria')}>
                          <button
                            type="button"
                            className="btn-new-event inline-confirm-popover-btn"
                            onClick={() => handleEndEventAsAdmin(item.id)}
                          >
                            {t('events.common.yes')}
                          </button>
                          <button
                            type="button"
                            className="btn-secondary inline-confirm-popover-btn"
                            onClick={() => setConfirmEndEventId(null)}
                          >
                            {t('events.common.no')}
                          </button>
                        </span>
                      ) : null}
                      <button
                        type="button"
                        className="btn-secondary"
                        onClick={() => setConfirmEndEventId(item.id)}
                      >
                        {t('events.admin.endEvent')}
                      </button>
                    </span>
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
              <p>{t('events.empty')}</p>
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
              <div className="modal-title">{t('events.ticketPool.modalTitle')}</div>
              <button
                type="button"
                className="modal-close"
                onClick={() => setOpenTicketFormEventId(null)}
                aria-label={t('events.common.close')}
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
                <label htmlFor={`t-klasa-${openTicketFormEventId}`}>{t('events.ticketPool.classLabel')}</label>
                <input
                  id={`t-klasa-${openTicketFormEventId}`}
                  type="text"
                  placeholder={t('events.ticketPool.classPlaceholder')}
                  value={ticketForms[openTicketFormEventId]?.klasa || ''}
                  onChange={e => updateTicketForm(openTicketFormEventId, 'klasa', e.target.value)}
                  disabled={currentUser?.rola !== 'ORG'}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '15px' }}>
                <div>
                  <label htmlFor={`t-cena-${openTicketFormEventId}`}>{t('events.ticketPool.price')}</label>
                  <input
                    id={`t-cena-${openTicketFormEventId}`}
                    type="number" step="0.01" placeholder="0.00"
                    value={ticketForms[openTicketFormEventId]?.cena || ''}
                    onChange={e => updateTicketForm(openTicketFormEventId, 'cena', e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label htmlFor={`t-qty-${openTicketFormEventId}`}>{t('events.ticketPool.qty')}</label>
                  <input
                    id={`t-qty-${openTicketFormEventId}`}
                    type="number" placeholder="np. 50"
                    value={ticketForms[openTicketFormEventId]?.ilosc || ''}
                    onChange={e => updateTicketForm(openTicketFormEventId, 'ilosc', e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label htmlFor={`t-waluta-${openTicketFormEventId}`}>{t('events.ticketPool.currency')}</label>
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
                  <label htmlFor={`t-start-${openTicketFormEventId}`}>{t('events.ticketPool.salesStart')}</label>
                  <input
                    id={`t-start-${openTicketFormEventId}`}
                    type="datetime-local"
                    value={ticketForms[openTicketFormEventId]?.start_sprzedazy || ''}
                    onChange={e => updateTicketForm(openTicketFormEventId, 'start_sprzedazy', e.target.value)}
                  />
                </div>
                <div>
                  <label htmlFor={`t-end-${openTicketFormEventId}`}>{t('events.ticketPool.salesEnd')}</label>
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
                data-tooltip={currentUser?.rola !== 'ORG' ? t('events.tooltip.onlyOrganizer') : ''}
                style={{ width: '100%' }}
              >
                <button type="submit" className="btn-new-event" style={{ width: '100%' }} disabled={currentUser?.rola !== 'ORG'}>
                  {t('events.ticketPool.submit')}
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
              <div className="modal-title">{t('events.moreInfo.modalTitle')}</div>
              <button
                type="button"
                className="modal-close"
                onClick={() => setSelectedInfoEvent(null)}
                aria-label={t('events.common.close')}
              >
                ×
              </button>
            </div>
            <div className="modal-grid info-modal-layout">
              <div className="info-top-section">
                <p>{t('events.moreInfo.detailsPrefix', { title: selectedInfoEvent.tytul })}</p>
                {infoLoading && <p>{t('events.moreInfo.loading')}</p>}
              </div>

              <div className="event-detail-main info-left-section">
                <div className="event-detail-info">
                  <div className="event-detail-row">
                    <strong>Sala:</strong>
                    <span>{selectedInfoEvent.salaNazwa || '-'}</span>
                  </div>
                  <div className="event-detail-row">
                    <strong>Autor:</strong>
                    <span>{selectedInfoEvent.creatorLogin || '-'}</span>
                  </div>
                  <div className="event-detail-row">
                    <strong>Data rozpoczęcia:</strong>
                    <span>{selectedInfoEvent.dataRozp ? new Date(selectedInfoEvent.dataRozp).toLocaleString('pl-PL') : '-'}</span>
                  </div>
                  <div className="event-detail-row">
                    <strong>Data zakończenia:</strong>
                    <span>{selectedInfoEvent.dataZamk ? new Date(selectedInfoEvent.dataZamk).toLocaleString('pl-PL') : '-'}</span>
                  </div>
                  <div className="event-detail-row">
                    <strong>Pojemność sali:</strong>
                    <span>{selectedInfoEvent.salaPojemnosc || 0} miejsc</span>
                  </div>
                  <div className="event-detail-row">
                    <strong>Personel:</strong>
                    <span>{selectedInfoEvent.personel?.length || 0} osób</span>
                  </div>
                  <div className="event-detail-row">
                    <strong>Kategoria:</strong>
                    <span>{selectedInfoEvent.kategoriaNazwa || '-'}</span>
                  </div>
                  <div className="event-detail-row">
                    <strong>Średnia ocena:</strong>
                    <span>{selectedInfoEvent.averageRating != null && !isNaN(selectedInfoEvent.averageRating) ? selectedInfoEvent.averageRating.toFixed(1) : '-'}</span>
                  </div>
                  <div className="event-detail-row">
                    <strong>Miejsce:</strong>
                    <span>{selectedInfoEvent.miejsceNazwa || '-'}</span>
                  </div>
                  <div className="event-detail-row">
                    <strong>Adres:</strong>
                    <span>{selectedInfoEvent.ulica ? `${selectedInfoEvent.ulica}, ${selectedInfoEvent.kodPocztowy} ${selectedInfoEvent.miasto}` : '-'}</span>
                  </div>
                  <div className="event-detail-row">
                    <strong>Opis:</strong>
                    <span>{selectedInfoEvent.opis || '-'}</span>
                  </div>
                </div>
              </div>

              <div className="event-detail-opinie info-right-section">
                <h3>{t('events.moreInfo.reviews.title')}</h3>
                <form onSubmit={onOpiniaSubmit} className="auth-form organizer-form">
                  <label htmlFor="opinia-ocena">{t('events.moreInfo.reviews.rating')}</label>
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

                  <label htmlFor="opinia-opis">{t('events.moreInfo.reviews.description')}</label>
                  <textarea
                    id="opinia-opis"
                    value={opiniaForm.opis}
                    onChange={(event) => setOpiniaForm({ ...opiniaForm, opis: event.target.value })}
                    required
                  />

                  <button type="submit">{t('events.moreInfo.reviews.add')}</button>
                </form>

                <div className="events-grid">
                  {selectedInfoEvent.opinie?.length > 0 ? selectedInfoEvent.opinie.map((opinia) => (
                    <article key={opinia.id} className="event-card">
                      <span className="event-badge">{t('events.moreInfo.reviews.badge', { value: opinia.ocena })}</span>
                      <h3>{opinia.userLogin}</h3>
                      <p>{opinia.opis}</p>
                      <p>{opinia.data ? new Date(opinia.data).toLocaleString() : '-'}</p>
                      {(opinia.userLogin === currentUser.login || currentUser.rola === 'ADMIN') && (
                        <button
                          type="button"
                          className="btn-delete"
                          onClick={() => onDeleteOpinia(opinia.id)}
                        >
                          {t('events.moreInfo.reviews.delete')}
                        </button>
                      )}
                    </article>
                  )) : (
                    <p>{t('events.moreInfo.reviews.empty')}</p>
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
              <div className="modal-title">{t('events.personnel.modalTitle')}</div>
              <button
                type="button"
                className="modal-close"
                onClick={() => setSelectedPersonelEvent(null)}
                aria-label={t('events.common.close')}
              >
                ×
              </button>
            </div>
            <div className="modal-grid info-modal-layout">
              <div className="info-top-section">
                <p>{t('events.personnel.forEvent', { title: selectedPersonelEvent.tytul })}</p>
                {infoLoading && <p>{t('events.personnel.loading')}</p>}
              </div>
              <div className="event-detail-opinie info-left-section">
                <h3>{t('events.personnel.manageTitle')}</h3>
                <p>{currentUser?.rola === 'ORG' ? t('events.personnel.manageOrg') : t('events.personnel.manageReadOnly')}</p>
                <form onSubmit={onPersonelSubmit} className="auth-form organizer-form">
                  <label htmlFor="personel-user">{t('events.personnel.user')}</label>
                  <select
                    id="personel-user"
                    value={personelForm.userId}
                    onChange={(event) => setPersonelForm({ ...personelForm, userId: event.target.value })}
                    required
                    disabled={currentUser?.rola !== 'ORG'}
                  >
                    <option value="">{t('events.personnel.userSelect')}</option>
                    {personelUsers
                      .filter((user) => user.rola !== 'ADMIN' && user.aktywnosc !== false)
                      .map((user) => (
                        <option key={user.id} value={user.id}>
                          {user.login} ({user.imie || '-'} {user.nazwisko || '-'})
                        </option>
                      ))}
                  </select>

                  <label htmlFor="personel-rola">{t('events.personnel.role')}</label>
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
                    {t('events.personnel.add')}
                  </button>
                </form>
              </div>
              <div className="event-detail-opinie info-right-section">
                <h3>{t('events.personnel.currentTitle')}</h3>
                {selectedPersonelEvent.personel?.length > 0 ? (
                  <table className="participants-table">
                    <thead>
                      <tr>
                        <th>{t('events.personnel.table.id')}</th>
                        <th>{t('events.personnel.table.user')}</th>
                        <th>{t('events.personnel.table.role')}</th>
                        <th>{t('events.personnel.table.assignedAt')}</th>
                        <th>{t('events.personnel.table.actions')}</th>
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
                              {t('events.personnel.revoke')}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <p>{t('events.personnel.empty')}</p>
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
              <div className="modal-title">{t('events.organizerRequest.modalTitle')}</div>
              <button
                type="button"
                className="modal-close"
                onClick={() => setOrganizerRequestOpen(false)}
                aria-label={t('events.common.close')}
              >
                ×
              </button>
            </div>
            <form onSubmit={onOrganizerRequestSubmit} className="auth-form organizer-form" style={{ padding: '16px' }}>
              <label htmlFor="org-firma">{t('events.organizerRequest.company')}</label>
              <input
                id="org-firma"
                type="text"
                value={organizerForm.firma}
                onChange={(event) => setOrganizerForm({ ...organizerForm, firma: event.target.value })}
                required
                disabled={currentUser?.rola !== 'USER'}
              />

              <label htmlFor="org-kwalifikacje">{t('events.organizerRequest.qualifications')}</label>
              <input
                id="org-kwalifikacje"
                type="text"
                value={organizerForm.kwalifikacje}
                onChange={(event) => setOrganizerForm({ ...organizerForm, kwalifikacje: event.target.value })}
                required
                disabled={currentUser?.rola !== 'USER'}
              />

              <label htmlFor="org-strona">{t('events.organizerRequest.website')}</label>
              <input
                id="org-strona"
                type="text"
                value={organizerForm.strona}
                onChange={(event) => setOrganizerForm({ ...organizerForm, strona: event.target.value })}
                required
                disabled={currentUser?.rola !== 'USER'}
              />

              <button type="submit" disabled={currentUser?.rola !== 'USER'}>
                {t('events.organizerRequest.submit')}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default WydarzeniaPage;
