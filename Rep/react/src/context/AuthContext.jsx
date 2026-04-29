import React, { createContext, useState, useEffect, useCallback } from 'react';
import { authService } from '../services/authService';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  // Stan autoryzacji
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [sessionLoading, setSessionLoading] = useState(true);
  
  // Dane użytkownika
  const [currentUser, setCurrentUser] = useState({
    login: '',
    rola: '',
    imie: '',
    nazwisko: ''
  });
  
  // Poświadczenia potrzebne do Basic Auth w innych zapytaniach
  const [authCredentials, setAuthCredentials] = useState({ login: '', password: '' });

  // Funkcja aplikująca usera (przeniesiona z App.js)
  const applyAuthenticatedUser = useCallback((user, credentials = null) => {
    if (credentials) setAuthCredentials(credentials);
    setIsLoggedIn(true);
    setCurrentUser({
      login: user.login || '',
      rola: user.rola || '',
      imie: user.imie || '',
      nazwisko: user.nazwisko || ''
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
        applyAuthenticatedUser(data);
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

  const handleLogout = async () => {
    try {
      await authService.logout();
    } catch (error) {
      console.error('Błąd wylogowywania:', error);
    } finally {
      localStorage.removeItem('rememberedLogin');
      localStorage.removeItem('rememberMe');
      localStorage.setItem('explicitLogout', 'true');
      
      setIsLoggedIn(false);
      setCurrentUser({ login: '', rola: '', imie: '', nazwisko: '' });
      setAuthCredentials({ login: '', password: '' });
      document.cookie = "JSESSIONID=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    }
  };

  return (
    <AuthContext.Provider value={{
      isLoggedIn,
      sessionLoading,
      currentUser,
      authCredentials,
      applyAuthenticatedUser,
      handleLogout
    }}>
      {children}
    </AuthContext.Provider>
  );
};