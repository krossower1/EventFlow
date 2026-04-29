import React, { useContext, useState, useCallback } from 'react';
import { AuthContext } from '../context/AuthContext';
import { API_BASE_URL, getAuthHeaders } from '../api/apiClient';
import BiletyTab from '../components/BiletyTab';

const BiletyPage = () => {
  const { currentUser, authCredentials, isLoggedIn } = useContext(AuthContext);
  const [status, setStatus] = useState({ type: '', message: '' });

  // Funkcja przekazywana do Twojego komponentu BiletyTab, aby mógł pobierać dane
  const getRequestConfig = useCallback(() => {
    const config = { withCredentials: true };
    if (authCredentials.login && authCredentials.password) {
      config.headers = getAuthHeaders(authCredentials.login, authCredentials.password);
    }
    return config;
  }, [authCredentials]);

  return (
    <div>
      {status.message && <p className={`status-message ${status.type}`}>{status.message}</p>}
      <BiletyTab 
        currentUserRole={currentUser.rola}
        currentUserLogin={currentUser.login}
        getRequestConfig={getRequestConfig}
        setStatus={setStatus}
        API_BASE_URL={API_BASE_URL}
        authCredentials={authCredentials}
        isLoggedIn={isLoggedIn}
      />
    </div>
  );
};

export default BiletyPage;