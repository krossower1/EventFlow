import React, { useState, useEffect, useContext, useCallback } from 'react';
import { AuthContext } from '../context/AuthContext';
import { apiClient, getAuthHeaders } from '../api/apiClient';

const UsersPage = () => {
  const { currentUser, authCredentials } = useContext(AuthContext);
  const [data, setData] = useState([]);
  const [hideAdmins, setHideAdmins] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [favoriteIds, setFavoriteIds] = useState([]);
  const [status, setStatus] = useState({ type: '', message: '' });
  const [confirmAction, setConfirmAction] = useState(null);

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

  useEffect(() => {
    if (!confirmAction) return undefined;
    const handleClickOutsideConfirm = (event) => {
      if (!event.target.closest('.inline-confirm-anchor')) {
        setConfirmAction(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutsideConfirm);
    return () => document.removeEventListener('mousedown', handleClickOutsideConfirm);
  }, [confirmAction]);

  const onDeactivateUser = async (userId, userLogin) => {
    try {
      await apiClient.put(`/users/${userId}/deactivate`, {}, getRequestConfig());
      setStatus({ type: 'success', message: `Użytkownik ${userLogin} zablokowany.` });
      setConfirmAction(null);
      fetchUsers();
    } catch (error) {
      setStatus({ type: 'error', message: 'Błąd dezaktywacji.' });
    }
  };

  const onDeleteUser = async (userId, userLogin) => {
    try {
      await apiClient.delete(`/users/${userId}`, getRequestConfig());
      setStatus({ type: 'success', message: 'Użytkownik usunięty.' });
      setConfirmAction(null);
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

  return (
    <div>
      <h2>Uczestnicy</h2>
      {status.message && <p className={`status-message ${status.type}`}>{status.message}</p>}

      <div className={`events-user-cta participants-admin-cta ${currentUser.rola !== 'ADMIN' ? 'disabled-area' : ''}`}>
        <p>{currentUser.rola === 'ADMIN' ? 'Zarządzaj rolami i użytkownikami. Wnioski organizatora — w panelu administratora.' : 'Przeglądaj listę uczestników.'}</p>
        <span
          className={`permission-tooltip ${currentUser.rola !== 'ADMIN' ? 'has-tooltip' : ''}`}
          data-tooltip={currentUser.rola !== 'ADMIN' ? 'Dostępne tylko dla administratora' : ''}
        >
          <button type="button" className="show-admins-toggle" onClick={() => setHideAdmins(!hideAdmins)} disabled={currentUser.rola !== 'ADMIN'}>
            {hideAdmins ? 'Pokaż adminów' : 'Schowaj adminów'}
          </button>
        </span>
      </div>

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
                    <button type="button" className="buttonv2" onClick={(e) => { e.stopPropagation(); onToggleFavorite(user); }}>
                      {favoriteIds.includes(user.id) ? 'Usuń z ulub.' : 'Dodaj do ulub.'}
                    </button>
                    <span
                    className={`permission-tooltip ${!favoriteIds.includes(user.id) ? 'has-tooltip' : ''}`}
                    data-tooltip={!favoriteIds.includes(user.id) ? 'Najpierw dodaj do ulubionych' : ''}
                    >
                    <button
                      type="button"
                      className="buttonv2"
                      onClick={(e) => { e.stopPropagation(); onOpenChat(user); }}
                      disabled={!favoriteIds.includes(user.id)}
                      style={{ marginLeft: '8px' }}
                    >
                      Czat
                    </button>
                    </span>
                  </>
                ) : (
                  <span style={{ color: '#666' }}>To Ty</span>
                )}
                {currentUser.rola === 'ADMIN' && user.login !== currentUser.login && user.rola !== 'ADMIN' && (
                  <>
                    <span className="inline-confirm-anchor" style={{ display: 'inline-block', marginLeft: '8px' }}>
                      {confirmAction?.type === 'deactivate' && confirmAction?.userId === user.id ? (
                        <span className="inline-confirm-popover" role="group" aria-label="Potwierdź dezaktywację użytkownika">
                          <button
                            type="button"
                            className="btn-new-event inline-confirm-popover-btn"
                            onClick={(e) => { e.stopPropagation(); onDeactivateUser(user.id, user.login); }}
                          >
                            Tak
                          </button>
                          <button
                            type="button"
                            className="btn-secondary inline-confirm-popover-btn"
                            onClick={(e) => { e.stopPropagation(); setConfirmAction(null); }}
                          >
                            Nie
                          </button>
                        </span>
                      ) : null}
                      <button
                        type="button"
                        className="btn-delete"
                        onClick={(e) => {
                          e.stopPropagation();
                          setConfirmAction({ type: 'deactivate', userId: user.id });
                        }}
                      >
                        Dezaktywuj
                      </button>
                    </span>
                    <span className="inline-confirm-anchor" style={{ display: 'inline-block', marginLeft: '8px' }}>
                      {confirmAction?.type === 'delete' && confirmAction?.userId === user.id ? (
                        <span className="inline-confirm-popover" role="group" aria-label="Potwierdź usunięcie użytkownika">
                          <button
                            type="button"
                            className="btn-new-event inline-confirm-popover-btn"
                            onClick={(e) => { e.stopPropagation(); onDeleteUser(user.id, user.login); }}
                          >
                            Tak
                          </button>
                          <button
                            type="button"
                            className="btn-secondary inline-confirm-popover-btn"
                            onClick={(e) => { e.stopPropagation(); setConfirmAction(null); }}
                          >
                            Nie
                          </button>
                        </span>
                      ) : null}
                      <button
                        type="button"
                        className="btn-delete"
                        onClick={(e) => {
                          e.stopPropagation();
                          setConfirmAction({ type: 'delete', userId: user.id });
                        }}
                      >
                        Usuń
                      </button>
                    </span>
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
  <div className="modal-field"><span className="modal-label">ID</span><span className="modal-value">{selectedUser.id}</span></div>
  <div className="modal-field"><span className="modal-label">Login</span><span className="modal-value">{selectedUser.login || '-'}</span></div>
  <div className="modal-field"><span className="modal-label">Imię i nazwisko</span><span className="modal-value">{selectedUser.imie || '-'} {selectedUser.nazwisko || '-'}</span></div>
  <div className="modal-field"><span className="modal-label">Email</span><span className="modal-value">{selectedUser.email || '-'}</span></div>
  <div className="modal-field"><span className="modal-label">Rola</span><span className="modal-value">{selectedUser.rola || '-'}</span></div>
  <div className="modal-field"><span className="modal-label">Status konta</span><span className="modal-value">{selectedUser.aktywnosc === false ? 'Zablokowane' : 'Aktywne'}</span></div>
</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UsersPage;
