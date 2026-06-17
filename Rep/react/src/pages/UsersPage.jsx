import React, { useState, useEffect, useContext, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { AuthContext } from '../context/AuthContext';
import { apiClient, getAuthHeaders } from '../api/apiClient';
import { cascadeAfterUserDelete } from '../utils/cascadeDelete';

const UsersPage = () => {
  const { t } = useTranslation();
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
      setStatus({ type: 'error', message: t('participants.status.fetchError') });
    }
  }, [getRequestConfig, t]);

  const fetchFavorites = useCallback(async () => {
    try {
      const response = await apiClient.get('/chat/favorites', getRequestConfig());
      setFavoriteIds((Array.isArray(response.data) ? response.data : []).map((item) => item.id));
    } catch (error) {
      setStatus({
        type: 'error',
        message: error.response?.data?.message || t('participants.status.favoritesFetchError')
      });
    }
  }, [getRequestConfig, t]);

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
      setStatus({
        type: 'success',
        message: t('participants.status.deactivateSuccess', { login: userLogin })
      });
      setConfirmAction(null);
      fetchUsers();
    } catch (error) {
      setStatus({ type: 'error', message: t('participants.status.deactivateError') });
    }
  };

  const onDeleteUser = async (userId, userLogin) => {
    try {
      await apiClient.delete(`/users/${userId}`, getRequestConfig());
      cascadeAfterUserDelete(userId, { setFavoriteIds, setSelectedUser, setData });
      setStatus({ type: 'success', message: t('participants.status.deleteSuccess') });
      setConfirmAction(null);
      fetchUsers();
    } catch (error) {
      setStatus({ type: 'error', message: t('participants.status.deleteError') });
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
      setStatus({
        type: 'error',
        message: error.response?.data?.message || t('participants.status.favoritesToggleError')
      });
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
      <h2>{t('participants.page.title')}</h2>
      {status.message && <p className={`status-message ${status.type}`}>{status.message}</p>}

      <div className={`events-user-cta participants-admin-cta ${currentUser.rola !== 'ADMIN' ? 'disabled-area' : ''}`}>
        <p>
          {currentUser.rola === 'ADMIN'
            ? t('participants.adminCta.adminText')
            : t('participants.adminCta.userText')}
        </p>
        <span
          className={`permission-tooltip ${currentUser.rola !== 'ADMIN' ? 'has-tooltip' : ''}`}
          data-tooltip={currentUser.rola !== 'ADMIN' ? t('participants.adminCta.onlyAdminTooltip') : ''}
        >
          <button type="button" className="show-admins-toggle" onClick={() => setHideAdmins(!hideAdmins)} disabled={currentUser.rola !== 'ADMIN'}>
            {hideAdmins ? t('participants.adminCta.showAdmins') : t('participants.adminCta.hideAdmins')}
          </button>
        </span>
      </div>

      <table className="participants-table">
        <thead>
          <tr>
            <th>{t('participants.table.id')}</th>
            <th>{t('participants.table.name')}</th>
            <th>{t('participants.table.email')}</th>
            <th>{t('participants.table.login')}</th>
            <th>{t('participants.table.role')}</th>
            <th>{t('participants.table.actions')}</th>
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
                      {favoriteIds.includes(user.id)
                        ? t('participants.actions.removeFavorite')
                        : t('participants.actions.addFavorite')}
                    </button>
                    <span
                    className={`permission-tooltip ${!favoriteIds.includes(user.id) ? 'has-tooltip' : ''}`}
                    data-tooltip={!favoriteIds.includes(user.id) ? t('participants.actions.chatTooltip') : ''}
                    >
                    <button
                      type="button"
                      className="buttonv2"
                      onClick={(e) => { e.stopPropagation(); onOpenChat(user); }}
                      disabled={!favoriteIds.includes(user.id)}
                      style={{ marginLeft: '8px' }}
                    >
                      {t('participants.actions.chat')}
                    </button>
                    </span>
                  </>
                ) : (
                  <span style={{ color: '#666' }}>{t('participants.actions.selfLabel')}</span>
                )}
                {currentUser.rola === 'ADMIN' && user.login !== currentUser.login && user.rola !== 'ADMIN' && (
                  <>
                    <span className="inline-confirm-anchor" style={{ display: 'inline-block', marginLeft: '8px' }}>
                      {confirmAction?.type === 'deactivate' && confirmAction?.userId === user.id ? (
                        <span className="inline-confirm-popover" role="group" aria-label={t('participants.confirm.deactivateAria')}>
                          <button
                            type="button"
                            className="btn-new-event inline-confirm-popover-btn"
                            onClick={(e) => { e.stopPropagation(); onDeactivateUser(user.id, user.login); }}
                          >
                            {t('participants.confirm.yes')}
                          </button>
                          <button
                            type="button"
                            className="btn-secondary inline-confirm-popover-btn"
                            onClick={(e) => { e.stopPropagation(); setConfirmAction(null); }}
                          >
                            {t('participants.confirm.no')}
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
                        {t('participants.actions.deactivate')}
                      </button>
                    </span>
                    <span className="inline-confirm-anchor" style={{ display: 'inline-block', marginLeft: '8px' }}>
                      {confirmAction?.type === 'delete' && confirmAction?.userId === user.id ? (
                        <span className="inline-confirm-popover" role="group" aria-label={t('participants.confirm.deleteAria')}>
                          <p className="inline-confirm-cascade-hint">{t('participants.confirm.deleteCascadeHint')}</p>
                          <button
                            type="button"
                            className="btn-new-event inline-confirm-popover-btn"
                            onClick={(e) => { e.stopPropagation(); onDeleteUser(user.id, user.login); }}
                          >
                            {t('participants.confirm.yes')}
                          </button>
                          <button
                            type="button"
                            className="btn-secondary inline-confirm-popover-btn"
                            onClick={(e) => { e.stopPropagation(); setConfirmAction(null); }}
                          >
                            {t('participants.confirm.no')}
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
                        {t('participants.actions.delete')}
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
              <div className="modal-title">{t('participants.modal.title', { login: selectedUser.login })}</div>
              <button className="modal-close" onClick={() => setSelectedUser(null)}>×</button>
            </div>
            <div className="modal-grid">
  <div className="modal-field"><span className="modal-label">{t('participants.modal.id')}</span><span className="modal-value">{selectedUser.id}</span></div>
  <div className="modal-field"><span className="modal-label">{t('participants.modal.login')}</span><span className="modal-value">{selectedUser.login || '-'}</span></div>
  <div className="modal-field"><span className="modal-label">{t('participants.modal.name')}</span><span className="modal-value">{selectedUser.imie || '-'} {selectedUser.nazwisko || '-'}</span></div>
  <div className="modal-field"><span className="modal-label">{t('participants.modal.email')}</span><span className="modal-value">{selectedUser.email || '-'}</span></div>
  <div className="modal-field"><span className="modal-label">{t('participants.modal.role')}</span><span className="modal-value">{selectedUser.rola || '-'}</span></div>
  <div className="modal-field"><span className="modal-label">{t('participants.modal.accountStatus')}</span><span className="modal-value">{selectedUser.aktywnosc === false ? t('participants.modal.accountStatusLocked') : t('participants.modal.accountStatusActive')}</span></div>
</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UsersPage;
