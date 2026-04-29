import React, { useState, useEffect, useContext, useCallback } from 'react';
import { AuthContext } from '../context/AuthContext';
import { apiClient, getAuthHeaders } from '../api/apiClient';

const UsersPage = () => {
  const { currentUser, authCredentials } = useContext(AuthContext);
  const [data, setData] = useState([]);
  const[hideAdmins, setHideAdmins] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [status, setStatus] = useState({ type: '', message: '' });

  const getRequestConfig = useCallback(() => {
    const config = { withCredentials: true };
    if (authCredentials.login && authCredentials.password) {
      config.headers = getAuthHeaders(authCredentials.login, authCredentials.password);
    }
    return config;
  }, [authCredentials]);

  const fetchUsers = useCallback(async () => {
    try {
      const response = await apiClient.get('/users', getRequestConfig());
      setData(response.data);
    } catch (error) {
      setStatus({ type: 'error', message: 'Nie udało się pobrać uczestników.' });
    }
  }, [getRequestConfig]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const onDeactivateUser = async (userId, userLogin) => {
    if (!window.confirm(`Czy na pewno chcesz dezaktywować użytkownika ${userLogin}?`)) return;
    try {
      await apiClient.put(`/users/${userId}/deactivate`, {}, getRequestConfig());
      setStatus({ type: 'success', message: `Użytkownik ${userLogin} zablokowany.` });
      fetchUsers();
    } catch (error) {
      setStatus({ type: 'error', message: 'Błąd dezaktywacji.' });
    }
  };

  const onDeleteUser = async (userId, userLogin) => {
    if (!window.confirm(`Czy na pewno chcesz usunąć użytkownika ${userLogin}?`)) return;
    try {
      await apiClient.delete(`/users/${userId}`, getRequestConfig());
      setStatus({ type: 'success', message: `Użytkownik usunięty.` });
      fetchUsers();
      setSelectedUser(null);
    } catch (error) {
      setStatus({ type: 'error', message: 'Błąd usuwania.' });
    }
  };

  const visibleParticipants = data.filter((user) => user.aktywnosc !== false && (!hideAdmins || user.rola !== 'ADMIN'));

  return (
    <div>
      <h2>Uczestnicy</h2>
      {status.message && <p className={`status-message ${status.type}`}>{status.message}</p>}
      
      <div className={`events-user-cta participants-admin-cta ${currentUser.rola !== 'ADMIN' ? 'disabled-area' : ''}`}>
        <p>Zarządzaj rolami i użytkownikami.</p>
        <button type="button" className="show-admins-toggle" onClick={() => setHideAdmins(!hideAdmins)}>
          {hideAdmins ? 'Pokaż adminów' : 'Schowaj adminów'}
        </button>
      </div>

      <table className="participants-table">
        <thead>
          <tr>
            <th>ID</th><th>Imię i Nazwisko</th><th>Email</th><th>Login</th><th>Rola</th><th>Akcje</th>
          </tr>
        </thead>
        <tbody>
          {visibleParticipants.map(user => (
            <tr key={user.id} className="participants-row" onClick={() => setSelectedUser(user)}>
              <td>{user.id}</td>
              <td>{user.imie || '-'} {user.nazwisko || '-'}</td>
              <td>{user.email}</td>
              <td>{user.login}</td>
              <td>{user.rola}</td>
              {currentUser.rola === 'ADMIN' && (
                <td>
                  {user.login !== currentUser.login && user.rola !== 'ADMIN' && (
                    <>
                      <button type="button" className="btn-delete" onClick={(e) => { e.stopPropagation(); onDeactivateUser(user.id, user.login); }}>Dezaktywuj</button>
                      <button type="button" className="btn-delete" onClick={(e) => { e.stopPropagation(); onDeleteUser(user.id, user.login); }} style={{ marginLeft: '8px' }}>Usuń</button>
                    </>
                  )}
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>

      {selectedUser && (
        <div className="modal-overlay" onClick={() => setSelectedUser(null)}>
          <div className="modal-card" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title">Szczegóły: {selectedUser.login}</div>
              <button className="modal-close" onClick={() => setSelectedUser(null)}>×</button>
            </div>
            <div className="modal-grid">
              <div className="modal-field"><span className="modal-label">Email</span><span className="modal-value">{selectedUser.email}</span></div>
              <div className="modal-field"><span className="modal-label">Rola</span><span className="modal-value">{selectedUser.rola}</span></div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UsersPage;