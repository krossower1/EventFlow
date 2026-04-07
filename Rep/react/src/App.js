import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './App.css';

function App() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [mode, setMode] = useState('login');
  const [status, setStatus] = useState({ type: '', message: '' });
  const [loginForm, setLoginForm] = useState({ login: '', password: '' });
  const [registerForm, setRegisterForm] = useState({
    imie: '',
    nazwisko: '',
    email: '',
    login: '',
    password: ''
  });
  const [activeTab, setActiveTab] = useState('Panel główny');
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await axios.get('http://localhost:8081/api/users');
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
      fetchUsers();
    }
  }, [isLoggedIn]);

  const onLoginSubmit = async (event) => {
    event.preventDefault();
    setStatus({ type: '', message: '' });

    try {
      const response = await axios.post('http://localhost:8081/api/auth/login', loginForm);
      if (response.data.success) {
        setIsLoggedIn(true);
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
        setStatus({ type: 'success', message: 'Registration successful. You can now log in.' });
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

  return (
    <div className="app-layout">
      <aside className="sidebar">
        <div className="sidebar-logo">
          <img src="/eventflow_icon.png" alt="EventFlow" />
          <span>EventFlow</span>
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
        <header className="topbar">
          <div className="topbar-left"></div>
          <div className="topbar-right">
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
                    setData([]);
                    setStatus({ type: '', message: '' });
                    setLoginForm({ login: '', password: '' });
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
            </div>
          )}
          
          {activeTab === 'Wydarzenia' && (
            <div>
              <h2>Wydarzenia</h2>
              <p>Tutaj będą zarządzane wydarzenia.</p>
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
              <h2>Dane z tabeli users w bazie MySQL (EventFlow)</h2>
              {loading && <h3>Ładowanie danych z bazy MySQL...</h3>}
              
              <table border="1" cellPadding="10" style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
                <thead>
                  <tr style={{ backgroundColor: '#eee' }}>
                    <th>ID</th>
                    <th>Imię i Nazwisko</th>
                    <th>Email</th>
                    <th>Login</th>
                    <th>Rola</th>
                    <th>Status</th>
                    <th>Data Utworzenia</th>
                    <th>Płatność</th>
                    <th>Szczegóły Bezpieczeństwa</th>
                  </tr>
                </thead>
                <tbody>
                  {data.length > 0 ? data.map(user => (
                    <tr key={user.id}>
                      <td>{user.id}</td>
                      <td>{user.imie || '-'} {user.nazwisko || '-'}</td>
                      <td>{user.email}</td>
                      <td>{user.login}</td>
                      <td>{user.rola}</td>
                      <td>{user.aktywnosc ? "✅ Aktywny" : "❌ Nieaktywny"}</td>
                      <td>{user.dataUtw ? new Date(user.dataUtw).toLocaleString() : '-'}</td>
                      <td>{user.platnosc || 'Brak'}</td>
                      <td>
                        <details>
                          <summary>Pokaz haslo/salt</summary>
                          <div style={{ wordBreak: 'break-all', fontSize: '10px' }}>
                            <strong>Haslo:</strong> {user.haslo}<br/>
                            <strong>Salt:</strong> {user.salt}
                          </div>
                        </details>
                      </td>
                    </tr>
                  )) : (
                    <tr><td colSpan="9">Brak użytkowników w bazie danych.</td></tr>
                  )}
                </tbody>
              </table>
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
        </div>
      </main>
    </div>
  );
}

export default App;