import React, { createContext, useState, useEffect, useCallback } from 'react';
import { authService } from '../services/authService';

export const AuthContext = createContext();
const SESSION_TIMEOUT_SECONDS = 10 * 60;

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
  const [sessionTimeLeft, setSessionTimeLeft] = useState(SESSION_TIMEOUT_SECONDS);

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
      setSessionTimeLeft(SESSION_TIMEOUT_SECONDS);
      document.cookie = "JSESSIONID=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    }
  }, []);

  const handleDeleteOwnAccount = useCallback(async () => {
    await authService.deleteOwnAccount();
    await handleLogout();
  }, [handleLogout]);

  useEffect(() => {
    if (!isLoggedIn) {
      setSessionTimeLeft(SESSION_TIMEOUT_SECONDS);
      return undefined;
    }

    let deadline = Date.now() + SESSION_TIMEOUT_SECONDS * 1000;
    const resetSessionCountdown = () => {
      deadline = Date.now() + SESSION_TIMEOUT_SECONDS * 1000;
      setSessionTimeLeft(SESSION_TIMEOUT_SECONDS);
    };

    const tick = () => {
      const secondsLeft = Math.max(0, Math.ceil((deadline - Date.now()) / 1000));
      setSessionTimeLeft(secondsLeft);
      if (secondsLeft <= 0) {
        handleLogout();
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
    };
  }, [isLoggedIn, handleLogout]);

  return (
    <AuthContext.Provider value={{
      isLoggedIn,
      sessionLoading,
      currentUser,
      authCredentials,
      sessionTimeLeft,
      applyAuthenticatedUser,
      handleLogout,
      handleDeleteOwnAccount
    }}>
      {children}
    </AuthContext.Provider>
  );
};