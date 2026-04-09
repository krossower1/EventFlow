import React, { useCallback, useEffect, useRef, useState } from 'react';
import axios from 'axios';
import './App.css';

function App() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUserRole, setCurrentUserRole] = useState('');
  const [authCredentials, setAuthCredentials] = useState({ login: '', password: '' });
  const [currentUserName, setCurrentUserName] = useState({ imie: '', nazwisko: '' });
  const [mode, setMode] = useState('login');
  const [status, setStatus] = useState({ type: '', message: '' });
  const [loginForm, setLoginForm] = useState({ login: '', password: '' });
  const [rememberMe, setRememberMe] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [registerForm, setRegisterForm] = useState({
    imie: '',
    nazwisko: '',
    email: '',
    login: '',
    password: ''
  });

  useEffect(() => {
    const savedRememberMe = localStorage.getItem('rememberMe') === 'true';
    const savedLogin = localStorage.getItem('rememberedLogin') || '';

    setRememberMe(savedRememberMe);

    if (savedLogin) {
      setLoginForm((prev) => ({ ...prev, login: savedLogin }));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('rememberMe', rememberMe ? 'true' : 'false');

    if (!rememberMe) {
      localStorage.removeItem('rememberedLogin');
    }
  }, [rememberMe]);
  const [activeTab, setActiveTab] = useState('Panel główny');
  const [tabHistory, setTabHistory] = useState([]);
  // Flaga blokuje dopisywanie historii przy cofnięciu, żeby nie tworzyć pętli nawigacji.
  const skipTabHistoryPushRef = useRef(false);
  const prevActiveTabRef = useRef('Panel główny');

  useEffect(() => {
    if (skipTabHistoryPushRef.current) {
      skipTabHistoryPushRef.current = false;
      prevActiveTabRef.current = activeTab;
      return;
    }
    const prev = prevActiveTabRef.current;
    if (prev !== activeTab) {
      setTabHistory((h) => [...h, prev]);
    }
    prevActiveTabRef.current = activeTab;
  }, [activeTab]);

  const goBackTab = useCallback(() => {
    setTabHistory((h) => {
      if (h.length === 0) return h;
      const target = h[h.length - 1];
      skipTabHistoryPushRef.current = true;
      setActiveTab(target);
      return h.slice(0, -1);
    });
  }, []);

  const [accountMenuOpen, setAccountMenuOpen] = useState(false);
  const [organizerForm, setOrganizerForm] = useState({ firma: '', kwalifikacje: '', strona: '' });
  const [organizerRequests, setOrganizerRequests] = useState([]);
  const [organizerLoading, setOrganizerLoading] = useState(false);
  const [miejsca, setMiejsca] = useState([]);
  const [miejscaLoading, setMiejscaLoading] = useState(false);
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
  const [wydarzenieOptions, setWydarzenieOptions] = useState({ miejsca: [], kategorie: [] });
  const [wydarzenieLoading, setWydarzenieLoading] = useState(false);
  const [myWydarzenia, setMyWydarzenia] = useState([]);
  const [openWydarzenia, setOpenWydarzenia] = useState([]);
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
    nowaKategoriaOpis: ''
  });

  const getAuthHeaders = () => {
    const basicToken = btoa(`${authCredentials.login}:${authCredentials.password}`);
    return { Authorization: `Basic ${basicToken}` };
  };

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await axios.get('http://localhost:8081/api/users', {
        headers: getAuthHeaders()
      });
      setData(response.data);
    } catch (error) {
      console.error('Error loading users:', error);
      setStatus({ type: 'error', message: 'Could not load users data.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isLoggedIn) {
      // Dane globalne dostępne dla wszystkich ról po zalogowaniu.
      fetchUsers();
      fetchOpenWydarzenia();
    }
  }, [isLoggedIn, authCredentials]);

  useEffect(() => {
    if (isLoggedIn && currentUserRole === 'ORG') {
      fetchMyMiejsca();
      fetchWydarzeniaOptions();
      fetchMyWydarzenia();
    }
  }, [isLoggedIn, currentUserRole, authCredentials]);

  const fetchOrganizerRequests = async () => {
    setOrganizerLoading(true);
    try {
      const response = await axios.get('http://localhost:8081/api/organizator', {
        headers: getAuthHeaders()
      });
      setOrganizerRequests(response.data);
    } catch (error) {
      const message = error.response?.data?.message || 'Nie udalo sie pobrac wnioskow organizatora.';
      setStatus({ type: 'error', message });
    } finally {
      setOrganizerLoading(false);
    }
  };

  const onLoginSubmit = async (event) => {
    event.preventDefault();
    setStatus({ type: '', message: '' });

    try {
      const response = await axios.post('http://localhost:8081/api/auth/login', loginForm);
      if (response.data.success) {
        setAuthCredentials({ login: loginForm.login, password: loginForm.password });
        setIsLoggedIn(true);
        setCurrentUserRole(response.data.rola || '');
        setCurrentUserName({
          imie: response.data.imie || '',
          nazwisko: response.data.nazwisko || ''
        });

        if (rememberMe) {
          localStorage.setItem('rememberMe', 'true');
          localStorage.setItem('rememberedLogin', loginForm.login);
        } else {
          localStorage.removeItem('rememberMe');
          localStorage.removeItem('rememberedLogin');
        }

        setStatus({ type: 'success', message: 'Login successful.' });
      } else {
        setStatus({ type: 'error', message: response.data.message || 'Login failed.' });
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Invalid login or password.';
      setStatus({ type: 'error', message });
    }
  };

  const onRegisterSubmit = async (event) => {
    event.preventDefault();
    setStatus({ type: '', message: '' });

    try {
      const response = await axios.post('http://localhost:8081/api/auth/register', registerForm);
      if (response.data.success) {
        setStatus({ type: 'success', message: 'Rejestracja udana. Możesz się teraz zalogować.' });
        setMode('login');
        setLoginForm({
          login: registerForm.login,
          password: ''
        });
      } else {
        setStatus({ type: 'error', message: response.data.message || 'Registration failed.' });
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Registration failed.';
      setStatus({ type: 'error', message });
    }
  };

  const onOrganizerRequestSubmit = async (event) => {
    event.preventDefault();
    setStatus({ type: '', message: '' });

    try {
      const response = await axios.post(
        'http://localhost:8081/api/organizator/request',
        organizerForm,
        { headers: getAuthHeaders() }
      );
      setStatus({ type: 'success', message: response.data || 'Wniosek zostal wyslany.' });
      setOrganizerForm({ firma: '', kwalifikacje: '', strona: '' });
    } catch (error) {
      const message = error.response?.data?.message || error.response?.data || 'Nie udalo sie wyslac wniosku.';
      setStatus({ type: 'error', message });
    }
  };

  const onApproveOrganizer = async (id) => {
    try {
      await axios.post(
        `http://localhost:8081/api/organizator/${id}/approve`,
        {},
        { headers: getAuthHeaders() }
      );
      setStatus({ type: 'success', message: 'Wniosek zatwierdzony.' });
      fetchOrganizerRequests();
      fetchUsers();
    } catch (error) {
      const message = error.response?.data?.message || error.response?.data || 'Nie udalo sie zatwierdzic wniosku.';
      setStatus({ type: 'error', message });
    }
  };

  const onRejectOrganizer = async (id) => {
    try {
      await axios.delete(`http://localhost:8081/api/organizator/${id}/reject`, {
        headers: getAuthHeaders()
      });
      setStatus({ type: 'success', message: 'Wniosek odrzucony i usuniety.' });
      fetchOrganizerRequests();
    } catch (error) {
      const message = error.response?.data?.message || error.response?.data || 'Nie udalo sie odrzucic wniosku.';
      setStatus({ type: 'error', message });
    }
  };

  const onDeleteUser = async (userId, userLogin) => {
    if (!window.confirm(`Czy na pewno chcesz usunąć użytkownika ${userLogin}?`)) {
      return;
    }

    try {
      await axios.delete(`http://localhost:8081/api/users/${userId}`, {
        headers: getAuthHeaders()
      });
      setStatus({ type: 'success', message: `Użytkownik ${userLogin} został usunięty.` });
      fetchUsers();
    } catch (error) {
      const message = error.response?.data?.message || error.response?.data || 'Nie udało się usunąć użytkownika.';
      setStatus({ type: 'error', message });
    }
  };

  const onDeactivateUser = async (userId, userLogin) => {
    if (!window.confirm(`Czy na pewno chcesz dezaktywować użytkownika ${userLogin}?`)) {
      return;
    }

    try {
      await axios.put(`http://localhost:8081/api/users/${userId}/deactivate`, {}, {
        headers: getAuthHeaders()
      });
      setStatus({ type: 'success', message: `Użytkownik ${userLogin} został dezaktywowany.` });
      fetchUsers();
    } catch (error) {
      const message = error.response?.data?.message || error.response?.data || 'Nie udało się dezaktywować użytkownika.';
      setStatus({ type: 'error', message });
    }
  };

  const fetchMyMiejsca = async () => {
    setMiejscaLoading(true);
    try {
      const response = await axios.get('http://localhost:8081/api/miejsca/my', {
        headers: getAuthHeaders()
      });
      setMiejsca(response.data);
    } catch (error) {
      const message = error.response?.data?.message || 'Nie udalo sie pobrac miejsc.';
      setStatus({ type: 'error', message });
    } finally {
      setMiejscaLoading(false);
    }
  };

  const onMiejsceSubmit = async (event) => {
    event.preventDefault();
    setStatus({ type: '', message: '' });

    try {
      await axios.post(
        'http://localhost:8081/api/miejsca',
        {
          ...miejsceForm,
          pojemnosc: Number(miejsceForm.pojemnosc),
          panstwo: 'Polska'
        },
        { headers: getAuthHeaders() }
      );
      setStatus({ type: 'success', message: 'Miejsce zostalo dodane.' });
      setMiejsceForm({
        nazwa: '',
        panstwo: 'Polska',
        miasto: '',
        ulica: '',
        kodPoczt: '',
        pojemnosc: '',
        opis: ''
      });
      fetchMyMiejsca();
    } catch (error) {
      const message = error.response?.data?.message || error.response?.data || 'Nie udalo sie dodac miejsca.';
      setStatus({ type: 'error', message });
    }
  };

  const updateSalaForm = (miejsceId, field, value) => {
    setSalaForms((prev) => ({
      ...prev,
      [miejsceId]: {
        nazwa: prev[miejsceId]?.nazwa || '',
        pojemnosc: prev[miejsceId]?.pojemnosc || '',
        pietro: prev[miejsceId]?.pietro || '',
        maPlan: prev[miejsceId]?.maPlan ?? false,
        ...prev[miejsceId],
        [field]: value
      }
    }));
  };

  const onSalaSubmit = async (event, miejsceId) => {
    event.preventDefault();
    const form = salaForms[miejsceId];
    if (!form) return;

    try {
      await axios.post(
        `http://localhost:8081/api/miejsca/${miejsceId}/sale`,
        {
          nazwa: form.nazwa,
          pojemnosc: Number(form.pojemnosc),
          pietro: Number(form.pietro),
          maPlan: Boolean(form.maPlan)
        },
        { headers: getAuthHeaders() }
      );
      setStatus({ type: 'success', message: 'Sala zostala dodana.' });
      setSalaForms((prev) => ({
        ...prev,
        [miejsceId]: { nazwa: '', pojemnosc: '', pietro: '', maPlan: false }
      }));
      fetchMyMiejsca();
    } catch (error) {
      const message = error.response?.data?.message || error.response?.data || 'Nie udalo sie dodac sali.';
      setStatus({ type: 'error', message });
    }
  };

  const fetchWydarzeniaOptions = async () => {
    setWydarzenieLoading(true);
    try {
      const response = await axios.get('http://localhost:8081/api/wydarzenia/options', {
        headers: getAuthHeaders()
      });
      setWydarzenieOptions(response.data);
    } catch (error) {
      const message = error.response?.data?.message || 'Nie udalo sie pobrac opcji formularza wydarzenia.';
      setStatus({ type: 'error', message });
    } finally {
      setWydarzenieLoading(false);
    }
  };

  const fetchMyWydarzenia = async () => {
    try {
      const response = await axios.get('http://localhost:8081/api/wydarzenia/my', {
        headers: getAuthHeaders()
      });
      setMyWydarzenia(response.data);
    } catch (error) {
      const message = error.response?.data?.message || 'Nie udalo sie pobrac listy wydarzen.';
      setStatus({ type: 'error', message });
    }
  };

  const fetchOpenWydarzenia = async () => {
    try {
      // Endpoint zwraca tylko wydarzenia, które jeszcze się nie zakończyły.
      const response = await axios.get('http://localhost:8081/api/wydarzenia/open', {
        headers: getAuthHeaders()
      });
      setOpenWydarzenia(response.data);
    } catch (error) {
      const message = error.response?.data?.message || 'Nie udalo sie pobrac aktualnych wydarzen.';
      setStatus({ type: 'error', message });
    }
  };

  const onWydarzenieSubmit = async (event) => {
    event.preventDefault();
    setStatus({ type: '', message: '' });

    try {
      await axios.post(
        'http://localhost:8081/api/wydarzenia',
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
          nowaKategoriaOpis: wydarzenieForm.nowaKategoriaOpis
        },
        { headers: getAuthHeaders() }
      );

      setStatus({ type: 'success', message: 'Wydarzenie zostalo dodane.' });
      setShowWydarzenieForm(false);
      setWydarzenieForm({
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
        nowaKategoriaOpis: ''
      });
      fetchWydarzeniaOptions();
      fetchMyWydarzenia();
    } catch (error) {
      const message = error.response?.data?.message || error.response?.data || 'Nie udalo sie dodac wydarzenia.';
      setStatus({ type: 'error', message });
    }
  };

  if (!isLoggedIn) {
    return (
      <div className="auth-page">
        <div className="auth-card">
          <h1>
            <img src="/eventflow_icon.png" alt="EventFlow Icon" className="logo-icon" />
            EventFlow
          </h1>
          <div className="auth-tabs">
            <button
              type="button"
              className={mode === 'login' ? 'active' : ''}
              onClick={() => setMode('login')}
            >
              Logowanie
            </button>
            <button
              type="button"
              className={mode === 'register' ? 'active' : ''}
              onClick={() => setMode('register')}
            >
              Rejestracja
            </button>
          </div>

          {mode === 'login' ? (
            <form onSubmit={onLoginSubmit} className="auth-form">
              <label htmlFor="login-auth">Login</label>
              <input
                id="login-auth"
                type="text"
                value={loginForm.login}
                onChange={(event) => setLoginForm({ ...loginForm, login: event.target.value })}
                required
              />

              <label htmlFor="password">Hasło</label>
              <input
                id="password"
                type="password"
                value={loginForm.password}
                onChange={(event) => setLoginForm({ ...loginForm, password: event.target.value })}
                required
              />

              <div className="remember-me">
                <label htmlFor="remember-me-checkbox">
                  <input
                    id="remember-me-checkbox"
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(event) => setRememberMe(event.target.checked)}
                  />
                  <span id="remember-me-text">Zapamiętaj mnie </span>
                </label>
              </div>

              <button type="submit">Zaloguj się</button>
            </form>
          ) : (
            <form onSubmit={onRegisterSubmit} className="auth-form">
              <label htmlFor="imie">Imie</label>
              <input
                id="imie"
                type="text"
                value={registerForm.imie}
                onChange={(event) => setRegisterForm({ ...registerForm, imie: event.target.value })}
                required
              />

              <label htmlFor="nazwisko">Nazwisko</label>
              <input
                id="nazwisko"
                type="text"
                value={registerForm.nazwisko}
                onChange={(event) => setRegisterForm({ ...registerForm, nazwisko: event.target.value })}
                required
              />

              <label htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                value={registerForm.email}
                onChange={(event) => setRegisterForm({ ...registerForm, email: event.target.value })}
                required
              />

              <label htmlFor="login">Login</label>
              <input
                id="login"
                type="text"
                value={registerForm.login}
                onChange={(event) => setRegisterForm({ ...registerForm, login: event.target.value })}
                required
              />

              <label htmlFor="new-password">Hasło</label>
              <input
                id="new-password"
                type="password"
                value={registerForm.password}
                onChange={(event) => setRegisterForm({ ...registerForm, password: event.target.value })}
                minLength={6}
                required
              />

              <button type="submit">Utwórz konto</button>
            </form>
          )}

          {status.message && <p className={`status-message ${status.type}`}>{status.message}</p>}
        </div>
      </div>
    );
  }

  const navItems = ['Panel główny', 'Wydarzenia', 'Bilety', 'Uczestnicy', 'Miejsca', 'Analityka', 'Ustawienia'];
  // Nie pokazujemy kont nieaktywnych w tabeli Uczestnicy.
  const visibleParticipants = data.filter((user) => user.aktywnosc !== false);
  const filteredWydarzenia = myWydarzenia.filter((item) => {
    const matchesText = !wydarzeniaSearch
      || item.tytul?.toLowerCase().includes(wydarzeniaSearch.toLowerCase())
      || item.miejsceNazwa?.toLowerCase().includes(wydarzeniaSearch.toLowerCase());
    const matchesStatus = wydarzeniaStatusFilter === 'ALL'
      || (item.status || '').toUpperCase() === wydarzeniaStatusFilter;
    return matchesText && matchesStatus;
  });

  return (
    <div className="app-layout">
      <aside className="sidebar">
        <div className="sidebar-logo">
          <img src="/eventflow_icon.png" alt="EventFlow" />
          <div className="logo-text">
            <span>EventFlow</span>
          </div>
        </div>
        <nav className="sidebar-nav">
          {navItems.map((item) => (
            <button
              key={item}
              type="button"
              className={`nav-button ${activeTab === item ? 'active' : ''}`}
              onClick={() => setActiveTab(item)}
            >
              {item}
            </button>
          ))}
        </nav>
      </aside>

      <main className="main-area">
        {(loading || organizerLoading) && (
          <div className="loading-toast" role="status" aria-live="polite">
            <span className="loading-toast__spinner" aria-hidden="true" />
            <span>
              {loading
                ? 'Ładowanie danych z bazy MySQL…'
                : 'Ładowanie wniosków…'}
            </span>
          </div>
        )}
        <header className="topbar">
          <div className="topbar-left">
            <div className="topbar-left-row">
              <button
                type="button"
                className="btn-back-tab"
                onClick={goBackTab}
                disabled={tabHistory.length === 0}
                title="Cofnij do poprzedniej zakładki"
              >
                Wstecz
              </button>
              <button
                type="button"
                onClick={fetchUsers}
                className="btn-icon btn-icon--topbar"
                aria-label="Odśwież listę użytkowników"
                title="Odśwież listę użytkowników"
                disabled={loading}
              >
                <svg
                  className={loading ? 'spin' : ''}
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  aria-hidden="true"
                >
                  <path
                    d="M20 12a8 8 0 1 1-2.34-5.66"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                  <path
                    d="M20 4v6h-6"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
              <div className="header-user-meta">
                <div className="header-user-line">
                  Twoja rola: <span className="header-accent">{currentUserRole}</span>
                </div>
                <div className="header-user-line">
                  Zalogowany jako: <span className="header-accent">{currentUserName.imie} {currentUserName.nazwisko}</span>
                </div>
              </div>
            </div>
          </div>
          <div className="topbar-right">
            {currentUserRole === 'ORG' && miejsca.length > 0 && (
              <button
                type="button"
                className="btn-quick-action"
                onClick={() => {
                  setActiveTab('Zarzadzaj miejscami ORG');
                  fetchMyMiejsca();
                }}
              >
                Zarzadzaj miejscami
              </button>
            )}

            {currentUserRole === 'ORG' && (
              <button
                type="button"
                className="btn-quick-action"
                onClick={() => setActiveTab('Dodaj miejsce ORG')}
              >
                Dodaj miejsce
              </button>
            )}

            <div className="account-menu-wrapper">
              <button
                type="button"
                className="btn-icon"
                aria-label="Konto"
                onClick={() => setAccountMenuOpen((open) => !open)}
              >
                <img src="/account.png" alt="Konto" />
              </button>
              <div className={`account-menu ${accountMenuOpen ? 'open' : ''}`}>
                <button
                  type="button"
                  className="account-menu-item"
                  onClick={() => {
                    setAccountMenuOpen(false);
                    setIsLoggedIn(false);
                    setCurrentUserRole('');
                    setAuthCredentials({ login: '', password: '' });
                    setCurrentUserName({ imie: '', nazwisko: '' });
                    setData([]);
                    setOrganizerRequests([]);
                    setOrganizerForm({ firma: '', kwalifikacje: '', strona: '' });
                    setMiejsca([]);
                    setMiejsceForm({
                      nazwa: '',
                      panstwo: 'Polska',
                      miasto: '',
                      ulica: '',
                      kodPoczt: '',
                      pojemnosc: '',
                      opis: ''
                    });
                    setSalaForms({});
                    setWydarzenieOptions({ miejsca: [], kategorie: [] });
                    setMyWydarzenia([]);
                    setOpenWydarzenia([]);
                    setShowWydarzenieForm(false);
                    setWydarzeniaSearch('');
                    setWydarzeniaStatusFilter('ALL');
                    setWydarzenieForm({
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
                      nowaKategoriaOpis: ''
                    });
                    setStatus({ type: '', message: '' });
                    setLoginForm({ login: '', password: '' });
                    setTabHistory([]);
                    skipTabHistoryPushRef.current = true;
                    prevActiveTabRef.current = 'Panel główny';
                    setActiveTab('Panel główny');
                  }}
                >
                  Wyloguj
                </button>
              </div>
            </div>
          </div>
        </header>

        <div className="content-area">
          {activeTab === 'Panel główny' && (
            <div>
              <h2>Panel główny</h2>
              <p>Witaj w dashboardzie EventFlow! Wybierz zakładkę, aby zarządzać różnymi aspektami aplikacji.</p>
              <div className="dashboard-events">
                <h3>Trwające i nadchodzące wydarzenia</h3>
                <div className="events-grid">
                  {/* Karty na dashboardzie celowo używają tego samego stylu co zakładka Wydarzenia. */}
                  {openWydarzenia.length > 0 ? openWydarzenia.map((item) => (
                    <article key={item.id} className="event-card">
                      <span className="event-badge">{(item.status || 'aktywne').toLowerCase()}</span>
                      <h3>{item.tytul}</h3>
                      <p>{item.miejsceNazwa}</p>
                      <p>{item.dataRozp ? new Date(item.dataRozp).toLocaleString() : '-'}</p>
                      <p>Do: {item.dataZamk ? new Date(item.dataZamk).toLocaleString() : '-'}</p>
                      <p>Kategoria: {item.kategoriaNazwa}</p>
                    </article>
                  )) : (
                    <p>Brak wydarzeń, które jeszcze się nie zakończyły.</p>
                  )}
                </div>
              </div>
            </div>
          )}
          
          {activeTab === 'Wydarzenia' && (
            <div>
              <h2>Wydarzenia</h2>
              {currentUserRole === 'ORG' ? (
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
                        if (!showWydarzenieForm) {
                          fetchWydarzeniaOptions();
                        }
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

                      {wydarzenieForm.createNowaKategoria && (
                        <>
                          <label htmlFor="nowa-kat-nazwa">Nowa kategoria - nazwa</label>
                          <input
                            id="nowa-kat-nazwa"
                            type="text"
                            value={wydarzenieForm.nowaKategoriaNazwa}
                            onChange={(event) => setWydarzenieForm({ ...wydarzenieForm, nowaKategoriaNazwa: event.target.value })}
                            required
                          />
                          <label htmlFor="nowa-kat-opis">Nowa kategoria - opis</label>
                          <input
                            id="nowa-kat-opis"
                            type="text"
                            value={wydarzenieForm.nowaKategoriaOpis}
                            onChange={(event) => setWydarzenieForm({ ...wydarzenieForm, nowaKategoriaOpis: event.target.value })}
                          />
                        </>
                      )}

                      <label htmlFor="wyd-rola">Rola</label>
                      <input
                        id="wyd-rola"
                        type="text"
                        value={wydarzenieForm.rola}
                        onChange={(event) => setWydarzenieForm({ ...wydarzenieForm, rola: event.target.value })}
                        required
                      />

                      <label htmlFor="wyd-status">Status</label>
                      <input
                        id="wyd-status"
                        type="text"
                        value={wydarzenieForm.status}
                        onChange={(event) => setWydarzenieForm({ ...wydarzenieForm, status: event.target.value })}
                        required
                      />

                      <label htmlFor="wyd-start">Data rozpoczecia</label>
                      <input
                        id="wyd-start"
                        type="datetime-local"
                        value={wydarzenieForm.dataRozp}
                        onChange={(event) => setWydarzenieForm({ ...wydarzenieForm, dataRozp: event.target.value })}
                        required
                      />

                      <label htmlFor="wyd-end">Data zakonczenia</label>
                      <input
                        id="wyd-end"
                        type="datetime-local"
                        value={wydarzenieForm.dataZamk}
                        onChange={(event) => setWydarzenieForm({ ...wydarzenieForm, dataZamk: event.target.value })}
                        required
                      />

                      <button type="submit">Dodaj wydarzenie</button>
                    </form>
                  )}

                  {wydarzenieLoading && <h3>Ladowanie opcji...</h3>}
                  <div className="events-grid">
                    {filteredWydarzenia.length > 0 ? filteredWydarzenia.map((item) => (
                      <article key={item.id} className="event-card">
                        <span className="event-badge">{(item.status || 'szkic').toLowerCase()}</span>
                        <h3>{item.tytul}</h3>
                        <p>{item.miejsceNazwa}</p>
                        <p>{item.dataRozp ? new Date(item.dataRozp).toLocaleString() : '-'}</p>
                        <p>Kategoria: {item.kategoriaNazwa}</p>
                      </article>
                    )) : (
                      <p>Brak wydarzen do wyswietlenia.</p>
                    )}
                  </div>
                </div>
              ) : currentUserRole === 'USER' ? (
                <div className="events-user-cta">
                  <p>Tylko organizator moze tworzyc wydarzenia.</p>
                  <button
                    type="button"
                    className="btn-new-event"
                    onClick={() => setActiveTab('Wniosek organizatora')}
                  >
                    Zostan Organizatorem
                  </button>
                </div>
              ) : currentUserRole === 'ADMIN' ? (
                <p>Administratorzy nie mogą tworzyć wydarzeń.</p>
              ) : (
                <p>Tutaj będą zarządzane wydarzenia.</p>
              )}
            </div>
          )}
          
          
          {activeTab === 'Bilety' && (
            <div>
              <h2>Bilety</h2>
              <p>Tutaj będą zarządzane bilety.</p>
            </div>
          )}
          
          
          {activeTab === 'Uczestnicy' && (
            <div>
              <h2>Uczestnicy</h2>
              {currentUserRole === 'ADMIN' && (
                <div className="events-user-cta participants-admin-cta">
                  <p>Rozważ proźby uczestników o zostanie organizatorem</p>
                  <button
                    type="button"
                    className="btn-new-event"
                    onClick={() => {
                      fetchOrganizerRequests();
                      setActiveTab('Wnioski organizatora');
                    }}
                  >
                    Sprawdź proźby
                  </button>
                </div>
              )}

              <table className="participants-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Imię i Nazwisko</th>
                    <th>Email</th>
                    <th>Login</th>
                    <th>Rola</th>
                    <th>Data Utworzenia</th>
                    <th>Płatność</th>
                    {currentUserRole === 'ADMIN' && <th>Akcje</th>}
                  </tr>
                </thead>
                <tbody>
                  {visibleParticipants.length > 0 ? visibleParticipants.map(user => (
                    <tr
                      key={user.id}
                      className="participants-row"
                      onClick={() => setSelectedUser(user)}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') setSelectedUser(user);
                      }}
                    >
                      <td>{user.id}</td>
                      <td>{user.imie || '-'} {user.nazwisko || '-'}</td>
                      <td>{user.email}</td>
                      <td>{user.login}</td>
                      <td>{user.rola}</td>
                      <td>{user.dataUtw ? new Date(user.dataUtw).toLocaleString() : '-'}</td>
                      <td>{user.platnosc || 'Brak'}</td>
                      {currentUserRole === 'ADMIN' && (
                        <td>
                          {/* Admin nie może modyfikować własnego konta ani kont innych adminów. */}
                          {user.login !== authCredentials.login && user.rola !== 'ADMIN' && (
                            <>
                              <button
                                type="button"
                                className="btn-delete"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onDeactivateUser(user.id, user.login);
                                }}
                              >
                                Dezaktywuj
                              </button>
                              <button
                                type="button"
                                className="btn-delete"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onDeleteUser(user.id, user.login);
                                }}
                                style={{ marginLeft: '8px' }}
                              >
                                Usuń
                              </button>
                            </>
                          )}
                        </td>
                      )}
                    </tr>
                  )) : (
                    <tr><td colSpan={currentUserRole === 'ADMIN' ? 8 : 7}>Brak użytkowników w bazie danych.</td></tr>
                  )}
                </tbody>
              </table>

              {selectedUser && (
                <div
                  className="modal-overlay"
                  role="dialog"
                  aria-modal="true"
                  onMouseDown={(e) => {
                    if (e.target === e.currentTarget) setSelectedUser(null);
                  }}
                >
                  <div className="modal-card">
                    <div className="modal-header">
                      <div className="modal-title">
                        Dane osoby: <span className="header-accent">{selectedUser.imie || '-'} {selectedUser.nazwisko || '-'} </span>
                      </div>
                      <button
                        type="button"
                        className="modal-close"
                        onClick={() => setSelectedUser(null)}
                        aria-label="Zamknij"
                      >
                        ×
                      </button>
                    </div>

                    <div className="modal-grid">
                      <div className="modal-field">
                        <span className="modal-label">Imię i nazwisko</span>
                        <span className="modal-value">{selectedUser.imie || '-'} {selectedUser.nazwisko || '-'}</span>
                      </div>
                      <div className="modal-field">
                        <span className="modal-label">Login</span>
                        <span className="modal-value">{selectedUser.login || '-'}</span>
                      </div>
                      <div className="modal-field">
                        <span className="modal-label">Email</span>
                        <span className="modal-value">{selectedUser.email || '-'}</span>
                      </div>
                      <div className="modal-field">
                        <span className="modal-label">Rola</span>
                        <span className="modal-value">{selectedUser.rola || '-'}</span>
                      </div>
                      <div className="modal-field">
                        <span className="modal-label">Status</span>
                        <span className="modal-value">{selectedUser.aktywnosc ? 'Aktywny' : 'Nieaktywny'}</span>
                      </div>
                      <div className="modal-field">
                        <span className="modal-label">Data utworzenia</span>
                        <span className="modal-value">{selectedUser.dataUtw ? new Date(selectedUser.dataUtw).toLocaleString() : '-'}</span>
                      </div>
                      <div className="modal-field">
                        <span className="modal-label">Płatność</span>
                        <span className="modal-value">{selectedUser.platnosc || 'Brak'}</span>
                      </div>
                    </div>

                    {currentUserRole === 'ADMIN' && (
                      <div className="modal-admin">
                        <details>
                          <summary>Szczegóły bezpieczeństwa (ADMIN)</summary>
                          <div className="modal-admin-details">
                            <div><strong>Haslo:</strong> {selectedUser.haslo || '-'}</div>
                            <div><strong>Salt:</strong> {selectedUser.salt || '-'}</div>
                          </div>
                        </details>

                        {selectedUser.login !== authCredentials.login && selectedUser.rola !== 'ADMIN' && (
                          <button
                            type="button"
                            className="btn-delete"
                            onClick={() => onDeleteUser(selectedUser.id, selectedUser.login)}
                          >
                            Usuń użytkownika
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
          
          {activeTab === 'Miejsca' && (
            <div>
              <h2>Miejsca</h2>
              <p>Tutaj będą zarządzane miejsca.</p>
            </div>
          )}
          
          {activeTab === 'Analityka' && (
            <div>
              <h2>Analityka</h2>
              <p>Tutaj będą wyświetlane analizy i statystyki.</p>
            </div>
          )}
          
          {activeTab === 'Ustawienia' && (
            <div>
              <h2>Ustawienia</h2>
              <p>Tutaj będą ustawienia aplikacji.</p>
            </div>
          )}

          {activeTab === 'Dodaj miejsce ORG' && currentUserRole === 'ORG' && (
            <div>
              <h2>Dodaj miejsce</h2>
              <p>Uzupelnij dane miejsca. Pole panstwo jest stale ustawione na Polska.</p>
              <form onSubmit={onMiejsceSubmit} className="auth-form organizer-form">
                <label htmlFor="miejsce-nazwa">Nazwa</label>
                <input
                  id="miejsce-nazwa"
                  type="text"
                  value={miejsceForm.nazwa}
                  onChange={(event) => setMiejsceForm({ ...miejsceForm, nazwa: event.target.value })}
                  required
                />

                <label htmlFor="miejsce-panstwo">Panstwo</label>
                <input id="miejsce-panstwo" type="text" value="Polska" disabled />

                <label htmlFor="miejsce-miasto">Miasto</label>
                <input
                  id="miejsce-miasto"
                  type="text"
                  value={miejsceForm.miasto}
                  onChange={(event) => setMiejsceForm({ ...miejsceForm, miasto: event.target.value })}
                  required
                />

                <label htmlFor="miejsce-ulica">Ulica</label>
                <input
                  id="miejsce-ulica"
                  type="text"
                  value={miejsceForm.ulica}
                  onChange={(event) => setMiejsceForm({ ...miejsceForm, ulica: event.target.value })}
                  required
                />

                <label htmlFor="miejsce-kod">Kod pocztowy</label>
                <input
                  id="miejsce-kod"
                  type="text"
                  value={miejsceForm.kodPoczt}
                  onChange={(event) => setMiejsceForm({ ...miejsceForm, kodPoczt: event.target.value })}
                  required
                />

                <label htmlFor="miejsce-pojemnosc">Pojemnosc</label>
                <input
                  id="miejsce-pojemnosc"
                  type="number"
                  value={miejsceForm.pojemnosc}
                  onChange={(event) => setMiejsceForm({ ...miejsceForm, pojemnosc: event.target.value })}
                  required
                />

                <label htmlFor="miejsce-opis">Opis</label>
                <input
                  id="miejsce-opis"
                  type="text"
                  value={miejsceForm.opis}
                  onChange={(event) => setMiejsceForm({ ...miejsceForm, opis: event.target.value })}
                />

                <button type="submit">Dodaj miejsce</button>
              </form>
            </div>
          )}

          {activeTab === 'Zarzadzaj miejscami ORG' && currentUserRole === 'ORG' && (
            <div>
              <h2>Zarzadzaj miejscami</h2>
              <button type="button" className="btn-refresh" onClick={fetchMyMiejsca}>
                Odswiez
              </button>
              {miejscaLoading && <h3>Ladowanie miejsc...</h3>}
              {miejsca.length > 0 ? miejsca.map((miejsce) => (
                <div key={miejsce.id} className="miejsce-card">
                  <h3>{miejsce.nazwa}</h3>
                  <p>
                    {miejsce.panstwo}, {miejsce.miasto}, {miejsce.ulica}, {miejsce.kodPoczt}
                  </p>
                  <p>Pojemnosc: {miejsce.pojemnosc}</p>
                  <p>Opis: {miejsce.opis || '-'}</p>

                  <h4>Sale</h4>
                  {miejsce.sale && miejsce.sale.length > 0 ? (
                    <table border="1" cellPadding="10" style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
                      <thead>
                        <tr style={{ backgroundColor: '#eee' }}>
                          <th>ID</th>
                          <th>Nazwa</th>
                          <th>Pojemnosc</th>
                          <th>Pietro</th>
                          <th>Plan</th>
                        </tr>
                      </thead>
                      <tbody>
                        {miejsce.sale.map((sala) => (
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
                    <p>Brak sal przypisanych do tego miejsca.</p>
                  )}

                  <h4>Przypisz sale</h4>
                  <form onSubmit={(event) => onSalaSubmit(event, miejsce.id)} className="auth-form organizer-form">
                    <label htmlFor={`sala-nazwa-${miejsce.id}`}>Nazwa</label>
                    <input
                      id={`sala-nazwa-${miejsce.id}`}
                      type="text"
                      value={salaForms[miejsce.id]?.nazwa || ''}
                      onChange={(event) => updateSalaForm(miejsce.id, 'nazwa', event.target.value)}
                      required
                    />

                    <label htmlFor={`sala-pojemnosc-${miejsce.id}`}>Pojemnosc</label>
                    <input
                      id={`sala-pojemnosc-${miejsce.id}`}
                      type="number"
                      value={salaForms[miejsce.id]?.pojemnosc || ''}
                      onChange={(event) => updateSalaForm(miejsce.id, 'pojemnosc', event.target.value)}
                      required
                    />

                    <label htmlFor={`sala-pietro-${miejsce.id}`}>Pietro</label>
                    <input
                      id={`sala-pietro-${miejsce.id}`}
                      type="number"
                      value={salaForms[miejsce.id]?.pietro || ''}
                      onChange={(event) => updateSalaForm(miejsce.id, 'pietro', event.target.value)}
                      required
                    />

                    <label htmlFor={`sala-plan-${miejsce.id}`}>Ma plan</label>
                    <select
                      id={`sala-plan-${miejsce.id}`}
                      value={String(salaForms[miejsce.id]?.maPlan ?? false)}
                      onChange={(event) => updateSalaForm(miejsce.id, 'maPlan', event.target.value === 'true')}
                    >
                      <option value="false">Nie</option>
                      <option value="true">Tak</option>
                    </select>

                    <button type="submit">Dodaj sale</button>
                  </form>
                </div>
              )) : (
                <p>Nie masz jeszcze zadnych miejsc.</p>
              )}
            </div>
          )}

          {activeTab === 'Wniosek organizatora' && (
            <div>
              <h2>Zgloszenie organizatora</h2>
              <p>Wypelnij formularz. Po akceptacji przez administratora Twoja rola zostanie zmieniona na ORG.</p>
              <form onSubmit={onOrganizerRequestSubmit} className="auth-form organizer-form">
                <label htmlFor="firma">Firma</label>
                <input
                  id="firma"
                  type="text"
                  value={organizerForm.firma}
                  onChange={(event) => setOrganizerForm({ ...organizerForm, firma: event.target.value })}
                  required
                />

                <label htmlFor="kwalifikacje">Kwalifikacje</label>
                <input
                  id="kwalifikacje"
                  type="text"
                  value={organizerForm.kwalifikacje}
                  onChange={(event) => setOrganizerForm({ ...organizerForm, kwalifikacje: event.target.value })}
                  required
                />

                <label htmlFor="strona">Strona</label>
                <input
                  id="strona"
                  type="text"
                  value={organizerForm.strona}
                  onChange={(event) => setOrganizerForm({ ...organizerForm, strona: event.target.value })}
                  required
                />

                <button type="submit">Wyslij wniosek</button>
              </form>
              {status.message && <p className={`status-message ${status.type}`}>{status.message}</p>}
            </div>
          )}

          {activeTab === 'Wnioski organizatora' && currentUserRole === 'ADMIN' && (
            <div>
              <h2>Wnioski organizatora</h2>
              <table class="participants-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Uzytkownik</th>
                    <th>Email</th>
                    <th>Firma</th>
                    <th>Kwalifikacje</th>
                    <th>Strona</th>
                    <th>Zweryfikowano</th>
                    <th>Data utworzenia</th>
                    <th>Akcje</th>
                  </tr>
                </thead>
                <tbody>
                  {organizerRequests.length > 0 ? organizerRequests.map((item) => (
                    <tr key={item.id}>
                      <td>{item.id}</td>
                      <td>{item.userLogin}</td>
                      <td>{item.userEmail}</td>
                      <td>{item.firma}</td>
                      <td>{item.kwalifikacje}</td>
                      <td>{item.strona}</td>
                      <td>{item.zweryfikow ? 'Tak' : 'Nie'}</td>
                      <td>{item.dataUtw ? new Date(item.dataUtw).toLocaleString() : '-'}</td>
                      <td>
                        {!item.zweryfikow ? (
                          <>
                            <button type="button" onClick={() => onApproveOrganizer(item.id)}>Zatwierdz</button>
                            <button type="button" onClick={() => onRejectOrganizer(item.id)} style={{ marginLeft: '8px' }}>Odrzuc</button>
                          </>
                        ) : (
                          'Zatwierdzono'
                        )}
                      </td>
                    </tr>
                  )) : (
                    <tr><td colSpan="9">Brak wnioskow organizatora.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default App;