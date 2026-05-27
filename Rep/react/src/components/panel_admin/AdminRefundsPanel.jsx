import React, { useCallback, useContext, useEffect, useState } from 'react';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';
import { API_BASE_URL, getAuthHeaders } from '../../api/apiClient';

const AdminRefundsPanel = () => {
  const { authCredentials, isLoggedIn } = useContext(AuthContext);
  const [zwroty, setZwroty] = useState([]);
  const [status, setStatus] = useState({ type: '', message: '' });
  const [loading, setLoading] = useState(false);

  const getRequestConfig = useCallback(() => {
    const config = { withCredentials: true };
    if (authCredentials.login && authCredentials.password) {
      config.headers = getAuthHeaders(authCredentials.login, authCredentials.password);
    }
    return config;
  }, [authCredentials]);

  const fetchZwroty = useCallback(async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/zwroty`, getRequestConfig());
      setZwroty(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      setStatus({ type: 'error', message: 'Nie udało się pobrać próśb o zwrot.' });
    } finally {
      setLoading(false);
    }
  }, [getRequestConfig]);

  useEffect(() => {
    if (!isLoggedIn) return;
    fetchZwroty();
  }, [isLoggedIn, fetchZwroty]);

  const handleApprove = async (id) => {
    try {
      await axios.post(`${API_BASE_URL}/zwroty/${id}/approve`, {}, getRequestConfig());
      setStatus({ type: 'success', message: 'Zwrot zaakceptowany.' });
      fetchZwroty();
    } catch (error) {
      setStatus({ type: 'error', message: 'Nie udało się zaakceptować zwrotu.' });
    }
  };

  return (
    <div className="admin-panel-section">
      {status.message && <p className={`status-message ${status.type}`}>{status.message}</p>}
      {loading && <p>Ładowanie próśb o zwrot...</p>}
      <table className="participants-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Użytkownik</th>
            <th>Wydarzenie</th>
            <th>Klasa</th>
            <th>Kwota</th>
            <th>Powód</th>
            <th>Stan</th>
            <th>Akcje</th>
          </tr>
        </thead>
        <tbody>
          {zwroty.length > 0 ? zwroty.map((z) => (
            <tr key={z.id}>
              <td>{z.id}</td>
              <td>{z.userLogin}</td>
              <td>{z.wydarzenieTytul}</td>
              <td>{z.klasa}</td>
              <td>{z.kwota} {z.waluta}</td>
              <td>{z.powod}</td>
              <td>{z.stan}</td>
              <td>
                <button type="button" className="buttonv2" onClick={() => handleApprove(z.id)}>Akceptuj</button>
              </td>
            </tr>
          )) : (
            <tr>
              <td colSpan={8}>Brak próśb o zwrot.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default AdminRefundsPanel;
