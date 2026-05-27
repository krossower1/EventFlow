import React, { useState, useContext, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { AuthContext } from '../context/AuthContext';
import { authService } from '../services/authService';

const AuthPage = () => {
  const { applyAuthenticatedUser } = useContext(AuthContext);
  const { t, i18n } = useTranslation();
  const [mode, setMode] = useState('login');
  const[status, setStatus] = useState({ type: '', message: '' });
  const language = i18n.language === 'en' ? 'en' : 'pl';

  const handleLanguageChange = (nextLanguage) => {
    const normalized = nextLanguage === 'en' ? 'en' : 'pl';
    localStorage.setItem('uiLanguage', normalized);
    i18n.changeLanguage(normalized);
  };

  // Stany formularzy
  const[loginForm, setLoginForm] = useState({ login: '', password: '' });
  const [login2faCode, setLogin2faCode] = useState('');
  const [pending2faLogin, setPending2faLogin] = useState({ login: '', password: '' });
  const[rememberMe, setRememberMe] = useState(false);
  
  const [registerForm, setRegisterForm] = useState({
    imie: '', nazwisko: '', email: '', login: '', password: '', confirmPassword: ''
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
        setStatus({ type: 'success', message: t('auth.login2fa.pendingMessage') });
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
        setStatus({ type: 'error', message: response.message || t('auth.login.errorGeneric') });
      }
    } catch (error) {
      const message = error.response?.data?.message || t('auth.login.errorInvalidCredentials');
      setStatus({ type: 'error', message });
    }
  };

  const onLogin2faSubmit = async (event) => {
    event.preventDefault();
    setStatus({ type: '', message: '' });

    if (!pending2faLogin.login || !pending2faLogin.password) {
      setStatus({ type: 'error', message: t('auth.login2fa.sessionExpired') });
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
        setStatus({ type: 'error', message: response.message || t('auth.login2fa.errorGeneric') });
      }
    } catch (error) {
      const message = error.response?.data?.message || t('auth.login2fa.errorGeneric');
      setStatus({ type: 'error', message });
    }
  };

  const onRegisterSubmit = async (event) => {
    event.preventDefault();
    setStatus({ type: '', message: '' });

    const password = registerForm.password.trim();
    const confirmPassword = registerForm.confirmPassword.trim();

    if (password !== confirmPassword) {
      setStatus({ type: 'error', message: t('auth.register.passwordMismatch') });
      return;
    }

    setRegisterSubmitting(true);

    try {
      const response = await authService.register({
        imie: registerForm.imie,
        nazwisko: registerForm.nazwisko,
        email: registerForm.email,
        login: registerForm.login,
        password
      });
      if (response.success) {
        setStatus({ type: 'success', message: t('auth.register.success') });
        setPendingVerificationEmail(registerForm.email);
        setMode('login');
        setLoginForm({ login: registerForm.login, password: '' });
      } else {
        setStatus({ type: 'error', message: response.message || t('auth.register.errorGeneric') });
      }
    } catch (error) {
      const message = error.response?.data?.message || t('auth.register.errorGeneric') ;
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
        setStatus({ type: 'success', message: t('auth.verify.success') });
        setVerificationForm({ email: '', code: '' });
        setPendingVerificationEmail('');
        setMode('login');
      } else {
        setStatus({ type: 'error', message: response.message || t('auth.verify.errorGeneric') });
      }
    } catch (error) {
      const message = error.response?.data?.message || t('auth.verify.errorGeneric');
      setStatus({ type: 'error', message });
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-header">
          <h1>
            <img src="/icons/image(1).ico" alt="EventFlow Icon" className="logo-icon" />
            EventFlow
          </h1>
          <div className="auth-language" aria-label="Wybór języka">
            <button
              type="button"
              className={`auth-language-btn ${language === 'pl' ? 'is-active' : ''}`}
              onClick={() => handleLanguageChange('pl')}
              aria-pressed={language === 'pl'}
            >
              PL
            </button>
            <span className="auth-language-sep" aria-hidden="true">|</span>
            <button
              type="button"
              className={`auth-language-btn ${language === 'en' ? 'is-active' : ''}`}
              onClick={() => handleLanguageChange('en')}
              aria-pressed={language === 'en'}
            >
              EN
            </button>
          </div>
        </div>
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
              {t('auth.tabs.login')}
            </button>
            <button
              type="button"
              className={mode === 'register' ? 'active' : ''}
              onClick={() => {
                setMode('register');
                setStatus({ type: '', message: '' });
              }}
            >
              {t('auth.tabs.register')}
            </button>
          </div>
        )}

        {mode === 'login' ? (
          <form onSubmit={onLoginSubmit} className="auth-form">
            <label htmlFor="login-auth">{t('auth.login.loginLabel')}</label>
            <input
              id="login-auth"
              type="text"
              value={loginForm.login}
              onChange={(event) => setLoginForm({ ...loginForm, login: event.target.value })}
              required
            />

            <label htmlFor="password">{t('auth.login.passwordLabel')}</label>
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
                <span id="remember-me-text">{t('auth.login.rememberMe')}</span>
              </label>
            </div>

            <button type="submit">{t('auth.login.submit')}</button>
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
                  {t('auth.verify.promptButton')}
                </button> {t('auth.verify.promptText')}
              </div>
            )}
          </form>
        ) : mode === 'login-2fa' ? (
          <form onSubmit={onLogin2faSubmit} className="auth-form">
            <label htmlFor="login-2fa-code">{t('auth.login2fa.codeLabel')}</label>
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
            <button type="submit">{t('auth.login2fa.submit')}</button>
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
              {t('auth.login2fa.backToLogin')}
            </button>
          </form>
        ) : mode === 'register' ? (
          <form onSubmit={onRegisterSubmit} className="auth-form">
            <label htmlFor="imie">{t('auth.register.firstName')}</label>
            <input
              id="imie"
              type="text"
              value={registerForm.imie}
              onChange={(event) => setRegisterForm({ ...registerForm, imie: event.target.value })}
              required
            />

            <label htmlFor="nazwisko">{t('auth.register.lastName')}</label>
            <input
              id="nazwisko"
              type="text"
              value={registerForm.nazwisko}
              onChange={(event) => setRegisterForm({ ...registerForm, nazwisko: event.target.value })}
              required
            />

            <label htmlFor="email">{t('auth.register.emailLabel')}</label>
            <input
              id="email"
              type="email"
              value={registerForm.email}
              onChange={(event) => setRegisterForm({ ...registerForm, email: event.target.value })}
              required
            />

            <label htmlFor="login">{t('auth.register.loginLabel')}</label>
            <input
              id="login"
              type="text"
              value={registerForm.login}
              onChange={(event) => setRegisterForm({ ...registerForm, login: event.target.value })}
              required
            />

            <label htmlFor="new-password">{t('auth.register.passwordLabel')}</label>
            <input
              id="new-password"
              type="password"
              value={registerForm.password}
              onChange={(event) => setRegisterForm({ ...registerForm, password: event.target.value })}
              minLength={6}
              required
            />

            <label htmlFor="confirm-password">{t('auth.register.confirmPasswordLabel')}</label>
            <input
              id="confirm-password"
              type="password"
              value={registerForm.confirmPassword}
              onChange={(event) => setRegisterForm({ ...registerForm, confirmPassword: event.target.value })}
              minLength={6}
              required
            />

            <button type="submit" disabled={registerSubmitting} className={registerSubmitting ? 'auth-submit-loading' : ''}>
              {registerSubmitting ? t('auth.register.submitting') : t('auth.register.submit')}
            </button>
          </form>
        ) : (
          <form onSubmit={onVerifySubmit} className="auth-form">
            <label htmlFor="verify-email">{t('auth.verify.emailLabel')}</label>
            <input
              id="verify-email"
              type="email"
              value={verificationForm.email}
              onChange={(event) => setVerificationForm({ ...verificationForm, email: event.target.value })}
              required
            />

            <label htmlFor="verify-code">{t('auth.verify.codeLabel')}</label>
            <input
              id="verify-code"
              type="text"
              value={verificationForm.code}
              onChange={(event) => setVerificationForm({ ...verificationForm, code: event.target.value })}
              required
            />

            <button type="submit">{t('auth.verify.submit')}</button>
            <button
              type="button"
              className="btn-secondary"
              onClick={() => {
                setMode('login');
                setStatus({ type: '', message: '' });
              }}
            >
              {t('auth.verify.backToLogin')}
            </button>
          </form>
        )}

        {status.message && <p className={`status-message ${status.type}`}>{status.message}</p>}
      </div>
    </div>
  );
};

export default AuthPage;