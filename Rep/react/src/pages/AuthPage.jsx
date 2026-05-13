import React, { useState, useContext, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import { authService } from '../services/authService';

const AuthPage = () => {
  const { applyAuthenticatedUser } = useContext(AuthContext);
  const [mode, setMode] = useState('login');
  const[status, setStatus] = useState({ type: '', message: '' });

  // Stany formularzy
  const[loginForm, setLoginForm] = useState({ login: '', password: '' });
  const [login2faCode, setLogin2faCode] = useState('');
  const [pending2faLogin, setPending2faLogin] = useState({ login: '', password: '' });
  const[rememberMe, setRememberMe] = useState(false);
  
  const [registerForm, setRegisterForm] = useState({
    imie: '', nazwisko: '', email: '', login: '', password: ''
  });
  const [registerSubmitting, setRegisterSubmitting] = useState(false);
  const[pendingVerificationEmail, setPendingVerificationEmail] = useState('');
  
  const [verificationForm, setVerificationForm] = useState({ email: '', code: '' });

  useEffect(() => {
    const savedRememberMe = localStorage.getItem('rememberMe') === 'true';
    const savedLogin = localStorage.getItem('rememberedLogin') || '';
    setRememberMe(savedRememberMe);
    if (savedLogin) setLoginForm((prev) => ({ ...prev, login: savedLogin }));
  },[]);

  useEffect(() => {
    localStorage.setItem('rememberMe', rememberMe ? 'true' : 'false');
    if (!rememberMe) {
      localStorage.removeItem('rememberedLogin');
    }
  }, [rememberMe]);

  const onLoginSubmit = async (event) => {
    event.preventDefault();
    setStatus({ type: '', message: '' });

    try {
      const response = await authService.login(loginForm.login, loginForm.password);
      if (response.requiresTwoFactor) {
        setPending2faLogin({ login: loginForm.login, password: loginForm.password });
        setLogin2faCode('');
        setMode('login-2fa');
        setStatus({ type: 'success', message: 'Podaj kod 2FA z aplikacji uwierzytelniającej.' });
        return;
      }
      if (response.success) {
        localStorage.removeItem('explicitLogout');
        let sessionUser = null;
        try {
          sessionUser = await authService.checkSession();
        } catch (sessionError) {
          sessionUser = null;
        }

        const resolvedUser = sessionUser && sessionUser.login
          ? sessionUser
          : {
            login: loginForm.login,
            rola: response.rola || '',
            imie: response.imie || '',
            nazwisko: response.nazwisko || '',
            email: response.email || response.mail || response.user?.email || response.user?.mail || '',
            telefon: response.telefon || response.phone || response.user?.telefon || response.user?.phone || ''
          };

        if (!resolvedUser.email && !resolvedUser.mail) {
          try {
            const ownProfile = await authService.getOwnProfile({
              withCredentials: true,
              headers: {
                Authorization: `Basic ${btoa(`${loginForm.login}:${loginForm.password}`)}`
              }
            });
            if (ownProfile) Object.assign(resolvedUser, ownProfile);
          } catch (profileError) {
            // Fallback pozostaje bez emaila, jeśli endpoint profilu jest niedostępny.
          }
        }

        applyAuthenticatedUser(
          resolvedUser,
          { login: loginForm.login, password: loginForm.password }
        );

        if (rememberMe) {
          localStorage.setItem('rememberMe', 'true');
          localStorage.setItem('rememberedLogin', loginForm.login);
        } else {
          localStorage.removeItem('rememberMe');
          localStorage.removeItem('rememberedLogin');
        }
      } else {
        setStatus({ type: 'error', message: response.message || 'Login failed.' });
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Niepoprawny login lub hasło.';
      setStatus({ type: 'error', message });
    }
  };

  const onLogin2faSubmit = async (event) => {
    event.preventDefault();
    setStatus({ type: '', message: '' });

    if (!pending2faLogin.login || !pending2faLogin.password) {
      setStatus({ type: 'error', message: 'Sesja logowania wygasła. Zaloguj się ponownie.' });
      setMode('login');
      return;
    }

    try {
      const response = await authService.loginWithTwoFactor(
        pending2faLogin.login,
        pending2faLogin.password,
        login2faCode
      );
      if (response.success) {
        localStorage.removeItem('explicitLogout');
        let sessionUser = null;
        try {
          sessionUser = await authService.checkSession();
        } catch (sessionError) {
          sessionUser = null;
        }

        const resolvedUser = sessionUser && sessionUser.login
          ? sessionUser
          : {
            login: pending2faLogin.login,
            rola: response.rola || '',
            imie: response.imie || '',
            nazwisko: response.nazwisko || '',
            email: response.email || response.mail || response.user?.email || response.user?.mail || '',
            telefon: response.telefon || response.phone || response.user?.telefon || response.user?.phone || ''
          };

        if (!resolvedUser.email && !resolvedUser.mail) {
          try {
            const ownProfile = await authService.getOwnProfile({
              withCredentials: true,
              headers: {
                Authorization: `Basic ${btoa(`${pending2faLogin.login}:${pending2faLogin.password}`)}`
              }
            });
            if (ownProfile) Object.assign(resolvedUser, ownProfile);
          } catch (profileError) {
            // Profil opcjonalny
          }
        }

        applyAuthenticatedUser(
          resolvedUser,
          { login: pending2faLogin.login, password: pending2faLogin.password }
        );
        if (rememberMe) {
          localStorage.setItem('rememberMe', 'true');
          localStorage.setItem('rememberedLogin', pending2faLogin.login);
        } else {
          localStorage.removeItem('rememberMe');
          localStorage.removeItem('rememberedLogin');
        }
        setPending2faLogin({ login: '', password: '' });
        setLogin2faCode('');
      } else {
        setStatus({ type: 'error', message: response.message || 'Weryfikacja 2FA nie powiodła się.' });
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Weryfikacja 2FA nie powiodła się.';
      setStatus({ type: 'error', message });
    }
  };

  const onRegisterSubmit = async (event) => {
    event.preventDefault();
    setStatus({ type: '', message: '' });
    setRegisterSubmitting(true);

    try {
      const response = await authService.register(registerForm);
      if (response.success) {
        setStatus({ type: 'success', message: 'Konto utworzone poprawnie.' });
        setPendingVerificationEmail(registerForm.email);
        setMode('login');
        setLoginForm({ login: registerForm.login, password: '' });
      } else {
        setStatus({ type: 'error', message: response.message || 'Registration failed.' });
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Registration failed.';
      setStatus({ type: 'error', message });
    } finally {
      setRegisterSubmitting(false);
    }
  };

  const onVerifySubmit = async (event) => {
    event.preventDefault();
    setStatus({ type: '', message: '' });

    try {
      const response = await authService.verifyEmail(verificationForm.email, verificationForm.code);
      if (response.success) {
        setStatus({ type: 'success', message: 'Konto zostało zweryfikowane. Możesz się teraz zalogować.' });
        setVerificationForm({ email: '', code: '' });
        setPendingVerificationEmail('');
        setMode('login');
      } else {
        setStatus({ type: 'error', message: response.message || 'Weryfikacja nie powiodła się.' });
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Weryfikacja nie powiodła się.';
      setStatus({ type: 'error', message });
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1>
          <img src="/image(1).ico" alt="EventFlow Icon" className="logo-icon" />
          EventFlow
        </h1>
        {mode !== 'verify' && (
          <div className="auth-tabs">
            <button
              type="button"
              className={mode === 'login' ? 'active' : ''}
              onClick={() => {
                setMode('login');
                setStatus({ type: '', message: '' });
              }}
            >
              Logowanie
            </button>
            <button
              type="button"
              className={mode === 'register' ? 'active' : ''}
              onClick={() => {
                setMode('register');
                setStatus({ type: '', message: '' });
              }}
            >
              Rejestracja
            </button>
          </div>
        )}

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
            {pendingVerificationEmail && (
              <div className="verification-note">
                <button
                  type="button"
                  className="weryfikacja"
                  onClick={() => {
                    setMode('verify');
                    setVerificationForm((prev) => ({ ...prev, email: pendingVerificationEmail, code: '' }));
                    setStatus({ type: '', message: '' });
                  }}
                >
                  Naciśnij
                </button> aby zweryfikować.
              </div>
            )}
          </form>
        ) : mode === 'login-2fa' ? (
          <form onSubmit={onLogin2faSubmit} className="auth-form">
            <label htmlFor="login-2fa-code">Kod 2FA</label>
            <input
              id="login-2fa-code"
              type="text"
              inputMode="numeric"
              pattern="[0-9]{6}"
              maxLength={6}
              value={login2faCode}
              onChange={(event) => setLogin2faCode(event.target.value.replace(/\D/g, '').slice(0, 6))}
              required
            />
            <button type="submit">Zweryfikuj i zaloguj</button>
            <button
              type="button"
              className="btn-secondary"
              onClick={() => {
                setMode('login');
                setPending2faLogin({ login: '', password: '' });
                setLogin2faCode('');
                setStatus({ type: '', message: '' });
              }}
            >
              Powrót do logowania
            </button>
          </form>
        ) : mode === 'register' ? (
          <form onSubmit={onRegisterSubmit} className="auth-form">
            <label htmlFor="imie">Imię</label>
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

            <button type="submit" disabled={registerSubmitting} className={registerSubmitting ? 'auth-submit-loading' : ''}>
              {registerSubmitting ? 'Tworzenie konta...' : 'Utwórz konto'}
            </button>
          </form>
        ) : (
          <form onSubmit={onVerifySubmit} className="auth-form">
            <label htmlFor="verify-email">Email</label>
            <input
              id="verify-email"
              type="email"
              value={verificationForm.email}
              onChange={(event) => setVerificationForm({ ...verificationForm, email: event.target.value })}
              required
            />

            <label htmlFor="verify-code">Kod weryfikacyjny</label>
            <input
              id="verify-code"
              type="text"
              value={verificationForm.code}
              onChange={(event) => setVerificationForm({ ...verificationForm, code: event.target.value })}
              required
            />

            <button type="submit">Zweryfikuj konto</button>
            <button
              type="button"
              className="btn-secondary"
              onClick={() => {
                setMode('login');
                setStatus({ type: '', message: '' });
              }}
            >
              Powrót do logowania
            </button>
          </form>
        )}

        {status.message && <p className={`status-message ${status.type}`}>{status.message}</p>}
      </div>
    </div>
  );
};

export default AuthPage;