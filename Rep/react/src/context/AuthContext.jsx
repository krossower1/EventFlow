import React, { createContext, useState, useEffect, useCallback, useRef } from 'react';
import { authService } from '../services/authService';

export const AuthContext = createContext();
const DEFAULT_SESSION_TIMEOUT_MINUTES = 10;
const DEFAULT_SESSION_TIMEOUT_SECONDS = DEFAULT_SESSION_TIMEOUT_MINUTES * 60;
const DEFAULT_SESSION_WARNING_MINUTES = 1;
const DEFAULT_SESSION_EXPIRY_ACTION = 'LOGOUT';
const DEFAULT_SESSION_COUNT_MODE = 'RELATIVE';
const MIN_SESSION_TIMEOUT_MINUTES = 1;
const MAX_SESSION_TIMEOUT_MINUTES = 1440;
const SESSION_SETTINGS_STORAGE_KEY = 'sessionSettingsCache';

export const AuthProvider = ({ children }) => {
  // Stan autoryzacji
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [sessionLoading, setSessionLoading] = useState(true);
  
  // Dane użytkownika
  const [currentUser, setCurrentUser] = useState({
    login: '',
    rola: '',
    imie: '',
    nazwisko: '',
    email: '',
    telefon: ''
  });
  
  // Poświadczenia potrzebne do Basic Auth w innych zapytaniach
  const [authCredentials, setAuthCredentials] = useState({ login: '', password: '' });
  const [sessionTimeoutEnabled, setSessionTimeoutEnabled] = useState(true);
  const [sessionTimeoutMinutes, setSessionTimeoutMinutes] = useState(DEFAULT_SESSION_TIMEOUT_MINUTES);
  const [sessionWarningMinutes, setSessionWarningMinutes] = useState(DEFAULT_SESSION_WARNING_MINUTES);
  const [sessionExpiryAction, setSessionExpiryAction] = useState(DEFAULT_SESSION_EXPIRY_ACTION);
  const [sessionCountMode, setSessionCountMode] = useState(DEFAULT_SESSION_COUNT_MODE);
  const [sessionTimeLeft, setSessionTimeLeft] = useState(DEFAULT_SESSION_TIMEOUT_SECONDS);
  const [showSessionWarningModal, setShowSessionWarningModal] = useState(false);
  const [warningDismissed, setWarningDismissed] = useState(false);
  const [sessionResetCounter, setSessionResetCounter] = useState(0);
  const [isSessionLocked, setIsSessionLocked] = useState(false);
  const [unlockPassword, setUnlockPassword] = useState('');
  const [unlockError, setUnlockError] = useState('');
  const [isUnlocking, setIsUnlocking] = useState(false);
  const showSessionWarningModalRef = useRef(false);
  const warningDismissedRef = useRef(false);

  const normalizeSessionTimeoutMinutes = useCallback((minutes) => {
    const parsed = Number(minutes);
    if (!Number.isFinite(parsed)) {
      return DEFAULT_SESSION_TIMEOUT_MINUTES;
    }
    return Math.min(MAX_SESSION_TIMEOUT_MINUTES, Math.max(MIN_SESSION_TIMEOUT_MINUTES, Math.round(parsed)));
  }, []);

  const getCachedSessionSettings = useCallback(() => {
    // Cache zabezpiecza UI przed resetem ustawień, gdy backend chwilowo nie zwróci nowych pól sesji.
    try {
      const raw = localStorage.getItem(SESSION_SETTINGS_STORAGE_KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      if (!parsed || typeof parsed !== 'object') return null;
      return parsed;
    } catch (error) {
      return null;
    }
  }, []);

  const applySessionSettings = useCallback((settings) => {
    // Jeden punkt wejścia do aktualizacji konfiguracji sesji: timeout, ostrzeżenie, akcja i tryb liczenia.
    const enabled = settings?.enabled !== false;
    const normalizedMinutes = normalizeSessionTimeoutMinutes(settings?.durationMinutes);
    const normalizedWarningMinutes = Math.min(
      normalizedMinutes - 1,
      Math.max(0, Math.round(Number(settings?.warningMinutes) || DEFAULT_SESSION_WARNING_MINUTES))
    );
    const normalizedExpiryAction = settings?.expiryAction === 'LOCK_SCREEN' ? 'LOCK_SCREEN' : 'LOGOUT';
    const normalizedCountMode = settings?.countMode === 'ABSOLUTE' ? 'ABSOLUTE' : 'RELATIVE';
    setSessionTimeoutEnabled(enabled);
    setSessionTimeoutMinutes(normalizedMinutes);
    setSessionWarningMinutes(normalizedWarningMinutes);
    setSessionExpiryAction(normalizedExpiryAction);
    setSessionCountMode(normalizedCountMode);
    setSessionTimeLeft(enabled ? normalizedMinutes * 60 : null);
    setShowSessionWarningModal(false);
    setWarningDismissed(false);
    localStorage.setItem(
      SESSION_SETTINGS_STORAGE_KEY,
      JSON.stringify({
        enabled,
        durationMinutes: normalizedMinutes,
        warningMinutes: normalizedWarningMinutes,
        expiryAction: normalizedExpiryAction,
        countMode: normalizedCountMode
      })
    );
  }, [normalizeSessionTimeoutMinutes]);

  useEffect(() => {
    showSessionWarningModalRef.current = showSessionWarningModal;
  }, [showSessionWarningModal]);

  useEffect(() => {
    warningDismissedRef.current = warningDismissed;
  }, [warningDismissed]);

  // Funkcja aplikująca usera (przeniesiona z App.js)
  const applyAuthenticatedUser = useCallback((user, credentials = null) => {
    if (credentials) setAuthCredentials(credentials);
    setIsLoggedIn(true);
    const userSource = user?.user || user;
    const normalizedUser = {
      login: userSource.login || '',
      rola: userSource.rola || '',
      imie: userSource.imie || '',
      nazwisko: userSource.nazwisko || '',
      email: userSource.email || userSource.mail || userSource.e_mail || '',
      telefon: userSource.telefon || userSource.phone || userSource.nrTelefonu || ''
    };
    setCurrentUser({
      ...normalizedUser
    });
  },[]);

  // Sprawdzanie sesji przy starcie
  const checkExistingSession = useCallback(async () => {
    if (localStorage.getItem('explicitLogout') === 'true') {
      setSessionLoading(false);
      return;
    }
    try {
      const data = await authService.checkSession();
      if (data && data.login) {
        let resolvedUser = data;
        if (!data.email && !data.mail && !data.e_mail) {
          try {
            const ownProfile = await authService.getOwnProfile({ withCredentials: true });
            resolvedUser = { ...data, ...(ownProfile || {}) };
          } catch (profileError) {
            resolvedUser = data;
          }
        }
        applyAuthenticatedUser(resolvedUser);
      } else {
        setIsLoggedIn(false);
      }
    } catch (error) {
      setIsLoggedIn(false);
    } finally {
      setSessionLoading(false);
    }
  },[applyAuthenticatedUser]);

  useEffect(() => {
    checkExistingSession();
  }, [checkExistingSession]);

  const loadSessionSettings = useCallback(async () => {
    // Pobiera konfigurację sesji po zalogowaniu; fallbackuje do cache, aby nie tracić preferencji po odświeżeniu.
    if (!isLoggedIn) return;
    try {
      const settings = await authService.getSessionSettings();
      const cached = getCachedSessionSettings();
      applySessionSettings({
        enabled: settings?.enabled,
        durationMinutes: settings?.durationMinutes,
        warningMinutes: settings?.warningMinutes ?? cached?.warningMinutes ?? DEFAULT_SESSION_WARNING_MINUTES
        ,
        expiryAction: settings?.expiryAction ?? cached?.expiryAction ?? DEFAULT_SESSION_EXPIRY_ACTION,
        countMode: settings?.countMode ?? cached?.countMode ?? DEFAULT_SESSION_COUNT_MODE
      });
    } catch (error) {
      const cached = getCachedSessionSettings();
      applySessionSettings({
        enabled: cached?.enabled ?? true,
        durationMinutes: cached?.durationMinutes ?? DEFAULT_SESSION_TIMEOUT_MINUTES,
        warningMinutes: cached?.warningMinutes ?? DEFAULT_SESSION_WARNING_MINUTES
        ,
        expiryAction: cached?.expiryAction ?? DEFAULT_SESSION_EXPIRY_ACTION,
        countMode: cached?.countMode ?? DEFAULT_SESSION_COUNT_MODE
      });
    }
  }, [isLoggedIn, applySessionSettings, getCachedSessionSettings]);

  useEffect(() => {
    loadSessionSettings();
  }, [loadSessionSettings]);

  const handleLogout = useCallback(async () => {
    try {
      await authService.logout();
    } catch (error) {
      console.error('Błąd wylogowywania:', error);
    } finally {
      localStorage.removeItem('rememberedLogin');
      localStorage.removeItem('rememberMe');
      localStorage.setItem('explicitLogout', 'true');
      
      setIsLoggedIn(false);
      setCurrentUser({ login: '', rola: '', imie: '', nazwisko: '', email: '', telefon: '' });
      setAuthCredentials({ login: '', password: '' });
      setSessionTimeoutEnabled(true);
      setSessionTimeoutMinutes(DEFAULT_SESSION_TIMEOUT_MINUTES);
      setSessionWarningMinutes(DEFAULT_SESSION_WARNING_MINUTES);
      setSessionExpiryAction(DEFAULT_SESSION_EXPIRY_ACTION);
      setSessionCountMode(DEFAULT_SESSION_COUNT_MODE);
      setSessionTimeLeft(DEFAULT_SESSION_TIMEOUT_SECONDS);
      setShowSessionWarningModal(false);
      setWarningDismissed(false);
      setSessionResetCounter(0);
      setIsSessionLocked(false);
      setUnlockPassword('');
      setUnlockError('');
      document.cookie = "JSESSIONID=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    }
  }, []);

  const handleDeleteOwnAccount = useCallback(async () => {
    await authService.deleteOwnAccount();
    await handleLogout();
  }, [handleLogout]);

  useEffect(() => {
    // Główna pętla sesji: odliczanie, próg ostrzeżenia, reakcja na wygaśnięcie i reset od aktywności.
    if (!isLoggedIn) {
      setSessionTimeLeft(DEFAULT_SESSION_TIMEOUT_SECONDS);
      return undefined;
    }

    if (isSessionLocked) {
      setSessionTimeLeft(0);
      return undefined;
    }

    if (!sessionTimeoutEnabled) {
      setSessionTimeLeft(null);
      setShowSessionWarningModal(false);
      setWarningDismissed(false);
      return undefined;
    }

    const timeoutSeconds = sessionTimeoutMinutes * 60;
    const warningThresholdSeconds = Math.max(0, sessionWarningMinutes * 60);
    let deadline = Date.now() + timeoutSeconds * 1000;
    const resetSessionCountdown = () => {
      // W trybie ABSOLUTE aktywność nie resetuje timera; przy otwartym modalu ostrzeżenia też blokujemy reset.
      if (sessionCountMode === 'ABSOLUTE') {
        return;
      }
      if (showSessionWarningModalRef.current) {
        return;
      }
      deadline = Date.now() + timeoutSeconds * 1000;
      setSessionTimeLeft(timeoutSeconds);
      setShowSessionWarningModal(false);
      setWarningDismissed(false);
    };

    const tick = () => {
      const secondsLeft = Math.max(0, Math.ceil((deadline - Date.now()) / 1000));
      setSessionTimeLeft(secondsLeft);
      if (!warningDismissedRef.current && warningThresholdSeconds > 0 && secondsLeft > 0 && secondsLeft <= warningThresholdSeconds) {
        setShowSessionWarningModal(true);
      }
      if (secondsLeft <= 0) {
        if (sessionExpiryAction === 'LOCK_SCREEN') {
          setShowSessionWarningModal(false);
          setWarningDismissed(false);
          setIsSessionLocked(true);
          setUnlockPassword('');
          setUnlockError('');
        } else {
          handleLogout();
        }
      }
    };

    const activityEvents = ['click', 'keydown', 'mousemove', 'mousedown', 'scroll', 'touchstart'];
    activityEvents.forEach((eventName) => {
      window.addEventListener(eventName, resetSessionCountdown, { passive: true });
    });

    const countdownInterval = window.setInterval(tick, 1000);

    return () => {
      window.clearInterval(countdownInterval);
      activityEvents.forEach((eventName) => {
        window.removeEventListener(eventName, resetSessionCountdown);
      });
      setShowSessionWarningModal(false);
    };
  }, [isLoggedIn, handleLogout, sessionTimeoutEnabled, sessionTimeoutMinutes, sessionWarningMinutes, sessionResetCounter, sessionExpiryAction, sessionCountMode, isSessionLocked]);

  const extendSession = useCallback(() => {
    // Przedłużenie sesji realizujemy przez inkrementację licznika resetu, co restartuje pętlę z nowym deadline.
    if (!sessionTimeoutEnabled) return;
    setShowSessionWarningModal(false);
    setWarningDismissed(false);
    setSessionResetCounter((prev) => prev + 1);
  }, [sessionTimeoutEnabled]);

  const dismissSessionWarning = useCallback(() => {
    // Użytkownik świadomie odrzuca przedłużenie; sesja dalej odlicza do wygaśnięcia.
    setShowSessionWarningModal(false);
    setWarningDismissed(true);
  }, []);

  const handleUnlockSession = useCallback(async () => {
    // Tryb LOCK_SCREEN: odblokowanie wymaga ponownej autoryzacji hasłem bieżącego użytkownika.
    const password = unlockPassword.trim();
    if (!password || !currentUser.login) {
      setUnlockError('Podaj hasło, aby odblokować ekran.');
      return;
    }
    setIsUnlocking(true);
    setUnlockError('');
    try {
      const loginResponse = await authService.login(currentUser.login, password);
      if (!loginResponse?.success) {
        throw new Error(loginResponse?.message || 'Nie udało się odblokować sesji.');
      }
      applyAuthenticatedUser(
        {
          ...currentUser,
          ...loginResponse
        },
        { login: currentUser.login, password }
      );
      setIsSessionLocked(false);
      setUnlockPassword('');
      setUnlockError('');
      setSessionResetCounter((prev) => prev + 1);
    } catch (error) {
      setUnlockError(error?.response?.data?.message || error?.message || 'Niepoprawne hasło.');
    } finally {
      setIsUnlocking(false);
    }
  }, [unlockPassword, currentUser, applyAuthenticatedUser]);

  return (
    <AuthContext.Provider value={{
      isLoggedIn,
      sessionLoading,
      currentUser,
      authCredentials,
      sessionTimeoutEnabled,
      sessionTimeoutMinutes,
      sessionWarningMinutes,
      sessionExpiryAction,
      sessionCountMode,
      sessionTimeLeft,
      applySessionSettings,
      applyAuthenticatedUser,
      handleLogout,
      handleDeleteOwnAccount,
      extendSession
    }}>
      {children}
      {showSessionWarningModal && (
        <div className="session-warning-overlay" role="dialog" aria-modal="true" aria-labelledby="session-warning-title">
          <div className="session-warning-modal">
            <h3 id="session-warning-title">Czy chcesz przedłużyć sesję?</h3>
            <div className="session-warning-actions">
              <button type="button" className="btn-new-event" onClick={extendSession}>
                Tak
              </button>
              <button type="button" className="btn-secondary" onClick={dismissSessionWarning}>
                Nie
              </button>
            </div>
          </div>
        </div>
      )}
      {isSessionLocked && (
        <div className="session-warning-overlay" role="dialog" aria-modal="true" aria-labelledby="session-lock-title">
          <div className="session-warning-modal">
            <h3 id="session-lock-title">Sesja wygasła. Ekran został zablokowany.</h3>
            <div className="settings-verification-form">
              <input
                type="password"
                value={unlockPassword}
                onChange={(event) => setUnlockPassword(event.target.value)}
                placeholder="Wpisz hasło, aby odblokować"
              />
              {unlockError && <p className="status-message status-error">{unlockError}</p>}
              <div className="session-warning-actions">
                <button type="button" className="btn-new-event" onClick={handleUnlockSession} disabled={isUnlocking}>
                  {isUnlocking ? 'Odblokowywanie...' : 'Odblokuj'}
                </button>
                <button type="button" className="btn-secondary" onClick={handleLogout} disabled={isUnlocking}>
                  Wyloguj
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </AuthContext.Provider>
  );
};