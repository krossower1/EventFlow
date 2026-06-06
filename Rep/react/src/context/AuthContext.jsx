import React, { createContext, useState, useEffect, useCallback, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { authService } from '../services/authService';
import { ensureObservedLoaded, invalidateObservedCache } from '../utils/obserwowaneWydarzenia';
import i18n from '../i18n';

export const AuthContext = createContext();
const DEFAULT_SESSION_TIMEOUT_MINUTES = 10;
const DEFAULT_SESSION_TIMEOUT_SECONDS = DEFAULT_SESSION_TIMEOUT_MINUTES * 60;
const DEFAULT_SESSION_WARNING_MINUTES = 1;
const DEFAULT_SESSION_EXPIRY_ACTION = 'LOGOUT';
const DEFAULT_SESSION_COUNT_MODE = 'RELATIVE';
const DEFAULT_LANGUAGE = 'pl';
const LANGUAGE_STORAGE_KEY = 'appLanguage';
const MIN_SESSION_TIMEOUT_MINUTES = 1;
const MAX_SESSION_TIMEOUT_MINUTES = 1440;
const SESSION_SETTINGS_STORAGE_KEY = 'sessionSettingsCache';

export const AuthProvider = ({ children }) => {
  const { t } = useTranslation();
  const getCachedLanguage = useCallback(() => {
    try {
      const raw = localStorage.getItem(LANGUAGE_STORAGE_KEY);
      return raw === 'en' ? 'en' : DEFAULT_LANGUAGE;
    } catch (error) {
      return DEFAULT_LANGUAGE;
    }
  }, []);

  const resolveLanguage = useCallback((language) => {
    if (language === 'en' || language === 'pl') {
      return language;
    }
    return getCachedLanguage();
  }, [getCachedLanguage]);

  const applyLanguagePreference = useCallback((language) => {
    const resolvedLanguage = resolveLanguage(language);
    i18n.changeLanguage(resolvedLanguage);
    document.documentElement.lang = resolvedLanguage;
    localStorage.setItem(LANGUAGE_STORAGE_KEY, resolvedLanguage);
    return resolvedLanguage;
  }, [resolveLanguage]);

  // Stan autoryzacji
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [sessionLoading, setSessionLoading] = useState(true);
  
  // Dane użytkownika
  const [currentUser, setCurrentUser] = useState({
    id: null,
    login: '',
    rola: '',
    imie: '',
    nazwisko: '',
    email: '',
    telefon: '',
    language: DEFAULT_LANGUAGE
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
      id: userSource.id != null ? Number(userSource.id) : null,
      login: userSource.login || '',
      rola: userSource.rola || '',
      imie: userSource.imie || '',
      nazwisko: userSource.nazwisko || '',
      email: userSource.email || userSource.mail || userSource.e_mail || '',
      telefon: userSource.telefon || userSource.phone || userSource.nrTelefonu || '',
      language: applyLanguagePreference(userSource.language)
    };
    setCurrentUser({
      ...normalizedUser
    });
    if (String(normalizedUser.rola || '').toUpperCase() === 'USER' && normalizedUser.id != null) {
      ensureObservedLoaded(credentials, normalizedUser.id).catch(() => {});
    }
  }, [applyLanguagePreference]);

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
        const userSource = resolvedUser?.user || resolvedUser;
        if (String(userSource?.rola || '').toUpperCase() === 'USER' && userSource?.id != null) {
          ensureObservedLoaded(null, Number(userSource.id)).catch(() => {});
        }
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
      
      // Inny użytkownik po ponownym logowaniu nie powinien widzieć poprzedniej listy obserwowanych z cache.
      invalidateObservedCache();
      setIsLoggedIn(false);
      setCurrentUser({ id: null, login: '', rola: '', imie: '', nazwisko: '', email: '', telefon: '', language: DEFAULT_LANGUAGE });
      applyLanguagePreference(DEFAULT_LANGUAGE);
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
  }, [applyLanguagePreference]);

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
      setUnlockError(t('session.lock.passwordRequired'));
      return;
    }
    setIsUnlocking(true);
    setUnlockError('');
    try {
      const loginResponse = await authService.login(currentUser.login, password);
      if (!loginResponse?.success) {
        throw new Error(loginResponse?.message || t('session.lock.unlockError'));
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
      setUnlockError(error?.response?.data?.message || error?.message || t('auth.login.errorInvalidCredentials'));
    } finally {
      setIsUnlocking(false);
    }
  }, [unlockPassword, currentUser, applyAuthenticatedUser, t]);

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
            <h3 id="session-warning-title">{t('session.warning.title')}</h3>
            <div className="session-warning-actions">
              <button type="button" className="btn-new-event" onClick={extendSession}>
                {t('topbar.common.yes')}
              </button>
              <button type="button" className="btn-secondary" onClick={dismissSessionWarning}>
                {t('topbar.common.no')}
              </button>
            </div>
          </div>
        </div>
      )}
      {isSessionLocked && (
        <div className="session-warning-overlay" role="dialog" aria-modal="true" aria-labelledby="session-lock-title">
          <div className="session-warning-modal">
            <h3 id="session-lock-title">{t('session.lock.title')}</h3>
            <div className="settings-verification-form">
              <input
                type="password"
                value={unlockPassword}
                onChange={(event) => setUnlockPassword(event.target.value)}
                placeholder={t('session.lock.passwordPlaceholder')}
              />
              {unlockError && <p className="status-message status-error">{unlockError}</p>}
              <div className="session-warning-actions">
                <button type="button" className="btn-new-event" onClick={handleUnlockSession} disabled={isUnlocking}>
                  {isUnlocking ? t('session.lock.unlocking') : t('session.lock.unlock')}
                </button>
                <button type="button" className="btn-secondary" onClick={handleLogout} disabled={isUnlocking}>
                  {t('topbar.logout')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </AuthContext.Provider>
  );
};