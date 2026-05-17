import React, { useState, useEffect, useContext, useCallback } from 'react';
import { AuthContext } from '../context/AuthContext';
import { apiClient, getAuthHeaders } from '../api/apiClient';

const UsersPage = () => {
  const { currentUser, authCredentials } = useContext(AuthContext);
  const [data, setData] = useState([]);
  const [hideAdmins, setHideAdmins] = useState(false);
  const [organizerRequests, setOrganizerRequests] = useState([]);
  const [showOrganizerRequests, setShowOrganizerRequests] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [favoriteIds, setFavoriteIds] = useState([]);
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

  const fetchFavorites = useCallback(async () => {
    try {
      const response = await apiClient.get('/chat/favorites', getRequestConfig());
      setFavoriteIds((Array.isArray(response.data) ? response.data : []).map((item) => item.id));
    } catch (error) {
      setStatus({ type: 'error', message: error.response?.data?.message || 'Nie udało się pobrać ulubionych.' });
    }
  }, [getRequestConfig]);

  useEffect(() => {
    fetchUsers();
    fetchFavorites();
  }, [fetchUsers, fetchFavorites]);

  const fetchOrganizerRequests = useCallback(async () => {
    try {
      const response = await apiClient.get('/organizator', getRequestConfig());
      setOrganizerRequests(response.data || []);
    } catch (error) {
      setStatus({ type: 'error', message: 'Nie udało się pobrać wniosków organizatora.' });
    }
  }, [getRequestConfig]);

  useEffect(() => {
    if (currentUser.rola === 'ADMIN') {
      fetchOrganizerRequests();
    }
  }, [currentUser.rola, fetchOrganizerRequests]);

  const onApproveOrganizer = async (id) => {
    try {
      await apiClient.post(`/organizator/${id}/approve`, {}, getRequestConfig());
      setStatus({ type: 'success', message: 'Wniosek zatwierdzony.' });
      fetchOrganizerRequests();
      fetchUsers();
    } catch (error) {
      setStatus({ type: 'error', message: 'Nie udało się zatwierdzić wniosku.' });
    }
  };

  const onRejectOrganizer = async (id) => {
    try {
      await apiClient.delete(`/organizator/${id}/reject`, getRequestConfig());
      setStatus({ type: 'success', message: 'Wniosek odrzucony.' });
      fetchOrganizerRequests();
    } catch (error) {
      setStatus({ type: 'error', message: 'Nie udało się odrzucić wniosku.' });
    }
  };

  const onDeleteOrganizerRequest = async (id) => {
    if (!window.confirm('Czy na pewno chcesz trwale usunąć ten wniosek z bazy?')) return;
    try {
      await apiClient.delete(`/organizator/${id}`, getRequestConfig());
      setStatus({ type: 'success', message: 'Wniosek usunięty z bazy.' });
      fetchOrganizerRequests();
    } catch (error) {
      setStatus({ type: 'error', message: 'Nie udało się usunąć wniosku.' });
    }
  };

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
      setStatus({ type: 'success', message: 'Użytkownik usunięty.' });
      fetchUsers();
      setSelectedUser(null);
    } catch (error) {
      setStatus({ type: 'error', message: 'Błąd usuwania.' });
    }
  };

  const onToggleFavorite = async (user) => {
    try {
      if (favoriteIds.includes(user.id)) {
        await apiClient.delete(`/chat/favorites/${user.id}`, getRequestConfig());
      } else {
        await apiClient.post(`/chat/favorites/${user.id}`, {}, getRequestConfig());
      }
      fetchFavorites();
    } catch (error) {
      setStatus({ type: 'error', message: error.response?.data?.message || 'Nie udało się zmienić ulubionych.' });
    }
  };

  const onOpenChat = (user) => {
    window.dispatchEvent(new CustomEvent('eventflow-open-chat', {
      detail: {
        userId: user.id,
        login: user.login,
        imie: user.imie,
        nazwisko: user.nazwisko
      }
    }));
  };

  const visibleParticipants = data.filter((user) => user.aktywnosc !== false && (!hideAdmins || user.rola !== 'ADMIN'));
  const pendingOrganizerRequestCount = organizerRequests.filter((item) => !item.zweryfikow).length;
  const sortedOrganizerRequests = [...organizerRequests].sort((a, b) => {
    if (a.zweryfikow === b.zweryfikow) return 0;
    return a.zweryfikow ? 1 : -1;
  });

  return (
    <div>
      <h2>Uczestnicy</h2>
      {status.message && <p className={`status-message ${status.type}`}>{status.message}</p>}

      <div className={`events-user-cta participants-admin-cta ${currentUser.rola !== 'ADMIN' ? 'disabled-area' : ''}`}>
        <p>{currentUser.rola === 'ADMIN' ? 'Zarządzaj rolami i użytkownikami.' : 'Przeglądaj listę uczestników.'}</p>
        <span
          className={`permission-tooltip ${currentUser.rola !== 'ADMIN' ? 'has-tooltip' : ''}`}
          data-tooltip={currentUser.rola !== 'ADMIN' ? 'Dostępne tylko dla administratora' : ''}
        >
          <button
            type="button"
            className="btn-new-event"
            onClick={() => {
              if (currentUser.rola !== 'ADMIN') return;
              setShowOrganizerRequests((prev) => !prev);
            }}
            disabled={currentUser.rola !== 'ADMIN'}
          >
            Wnioski
            {pendingOrganizerRequestCount > 0 && ` (${pendingOrganizerRequestCount})`}
          </button>
        </span>
        <span
          className={`permission-tooltip ${currentUser.rola !== 'ADMIN' ? 'has-tooltip' : ''}`}
          data-tooltip={currentUser.rola !== 'ADMIN' ? 'Dostępne tylko dla administratora' : ''}
        >
          <button type="button" className="show-admins-toggle" onClick={() => setHideAdmins(!hideAdmins)} disabled={currentUser.rola !== 'ADMIN'}>
            {hideAdmins ? 'Pokaż adminów' : 'Schowaj adminów'}
          </button>
        </span>
      </div>

      {showOrganizerRequests && (
        <table className="participants-table" style={{ marginBottom: '20px' }}>
          <thead>
            <tr>
              <th>ID</th><th>Użytkownik</th><th>Email</th><th>Firma</th><th>Kwalifikacje</th><th>Zweryfikowano</th><th>Akcje</th>
            </tr>
          </thead>
          <tbody>
            {sortedOrganizerRequests.length > 0 ? sortedOrganizerRequests.map((item) => (
              <tr key={item.id}>
                <td>{item.id}</td>
                <td>{item.userLogin}</td>
                <td>{item.userEmail}</td>
                <td>{item.firma}</td>
                <td>{item.kwalifikacje}</td>
                <td>{item.zweryfikow ? 'Tak' : 'Nie'}</td>
                <td>
                  {!item.zweryfikow ? (
                    <>
                      <button type="button" onClick={() => onApproveOrganizer(item.id)}>Zatwierdź</button>
                      <button type="button" onClick={() => onRejectOrganizer(item.id)} style={{ marginLeft: '8px' }}>Odrzuć</button>
                      <button type="button" onClick={() => onDeleteOrganizerRequest(item.id)} style={{ marginLeft: '8px' }}>Usuń z DB</button>
                    </>
                  ) : (
                    <>
                      <span>Zatwierdzono</span>
                      <button type="button" onClick={() => onDeleteOrganizerRequest(item.id)} style={{ marginLeft: '8px' }}>Usuń z DB</button>
                    </>
                  )}
                </td>
              </tr>
            )) : (
              <tr><td colSpan="7">Brak wniosków organizatora.</td></tr>
            )}
          </tbody>
        </table>
      )}

      <table className="participants-table">
        <thead>
          <tr>
            <th>ID</th><th>Imię i Nazwisko</th><th>Email</th><th>Login</th><th>Rola</th><th>Akcje</th>
          </tr>
        </thead>
        <tbody>
          {visibleParticipants.map((user) => (
            <tr key={user.id} className="participants-row" onClick={() => setSelectedUser(user)}>
              <td>{user.id}</td>
              <td>{user.imie || '-'} {user.nazwisko || '-'}</td>
              <td>{user.email}</td>
              <td>{user.login}</td>
              <td>{user.rola}</td>
              <td>
                {user.id !== currentUser.id ? (
                  <>
                    <button type="button" onClick={(e) => { e.stopPropagation(); onToggleFavorite(user); }}>
                      {favoriteIds.includes(user.id) ? 'Usuń z ulub.' : 'Do ulub.'}
                    </button>
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); onOpenChat(user); }}
                      disabled={!favoriteIds.includes(user.id)}
                      style={{ marginLeft: '8px' }}
                    >
                      Czat
                    </button>
                  </>
                ) : (
                  <span style={{ color: '#666' }}>To Ty</span>
                )}
                {currentUser.rola === 'ADMIN' && user.login !== currentUser.login && user.rola !== 'ADMIN' && (
                  <>
                    <button type="button" className="btn-delete" onClick={(e) => { e.stopPropagation(); onDeactivateUser(user.id, user.login); }} style={{ marginLeft: '8px' }}>Dezaktywuj</button>
                    <button type="button" className="btn-delete" onClick={(e) => { e.stopPropagation(); onDeleteUser(user.id, user.login); }} style={{ marginLeft: '8px' }}>Usuń</button>
                  </>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {selectedUser && (
        <div className="modal-overlay" onClick={() => setSelectedUser(null)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
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
