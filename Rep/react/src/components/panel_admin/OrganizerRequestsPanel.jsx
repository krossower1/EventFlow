import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AuthContext } from '../../context/AuthContext';
import { apiClient, getAuthHeaders } from '../../api/apiClient';

const OrganizerRequestsPanel = () => {
  const { t } = useTranslation();
  const { authCredentials } = useContext(AuthContext);
  const [organizerRequests, setOrganizerRequests] = useState([]);
  const [status, setStatus] = useState({ type: '', message: '' });
  const [loading, setLoading] = useState(false);
  const [deleteConfirmRequestId, setDeleteConfirmRequestId] = useState(null);

  const getRequestConfig = useCallback(() => {
    const config = { withCredentials: true };
    if (authCredentials.login && authCredentials.password) {
      config.headers = getAuthHeaders(authCredentials.login, authCredentials.password);
    }
    return config;
  }, [authCredentials]);

  const fetchOrganizerRequests = useCallback(async () => {
    setLoading(true);
    try {
      const response = await apiClient.get('/organizator', getRequestConfig());
      setOrganizerRequests(response.data || []);
    } catch (error) {
      setStatus({ type: 'error', message: t('adminRequests.status.fetchError') });
    } finally {
      setLoading(false);
    }
  }, [getRequestConfig, t]);

  useEffect(() => {
    fetchOrganizerRequests();
  }, [fetchOrganizerRequests]);

  useEffect(() => {
    if (deleteConfirmRequestId == null) return undefined;
    const handleClickOutsideConfirm = (event) => {
      if (!event.target.closest('.inline-confirm-anchor')) {
        setDeleteConfirmRequestId(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutsideConfirm);
    return () => document.removeEventListener('mousedown', handleClickOutsideConfirm);
  }, [deleteConfirmRequestId]);

  const onApproveOrganizer = async (id) => {
    try {
      await apiClient.post(`/organizator/${id}/approve`, {}, getRequestConfig());
      setStatus({ type: 'success', message: t('adminRequests.status.approveSuccess') });
      fetchOrganizerRequests();
    } catch (error) {
      setStatus({ type: 'error', message: t('adminRequests.status.approveError') });
    }
  };

  const onRejectOrganizer = async (id) => {
    try {
      await apiClient.delete(`/organizator/${id}/reject`, getRequestConfig());
      setStatus({ type: 'success', message: t('adminRequests.status.rejectSuccess') });
      fetchOrganizerRequests();
    } catch (error) {
      setStatus({ type: 'error', message: t('adminRequests.status.rejectError') });
    }
  };

  const onDeleteOrganizerRequest = async (id) => {
    try {
      await apiClient.delete(`/organizator/${id}`, getRequestConfig());
      setStatus({ type: 'success', message: t('adminRequests.status.deleteSuccess') });
      setDeleteConfirmRequestId(null);
      fetchOrganizerRequests();
    } catch (error) {
      setStatus({ type: 'error', message: t('adminRequests.status.deleteError') });
    }
  };

  const sortedOrganizerRequests = useMemo(() => (
    [...organizerRequests].sort((a, b) => {
      if (a.zweryfikow === b.zweryfikow) return 0;
      return a.zweryfikow ? 1 : -1;
    })
  ), [organizerRequests]);

  return (
    <div className="admin-panel-section">
      {status.message && <p className={`status-message ${status.type}`}>{status.message}</p>}
      {loading && <p>{t('adminRequests.loading')}</p>}
      <table className="participants-table">
        <thead>
          <tr>
            <th>{t('adminRequests.table.id')}</th>
            <th>{t('adminRequests.table.user')}</th>
            <th>{t('adminRequests.table.email')}</th>
            <th>{t('adminRequests.table.company')}</th>
            <th>{t('adminRequests.table.qualifications')}</th>
            <th>{t('adminRequests.table.verified')}</th>
            <th>{t('adminRequests.table.actions')}</th>
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
              <td>{item.zweryfikow ? t('adminRequests.common.yes') : t('adminRequests.common.no')}</td>
              <td>
                {!item.zweryfikow ? (
                  <>
                    <button type="button" className="buttonv2" onClick={() => onApproveOrganizer(item.id)}>{t('adminRequests.actions.approve')}</button>
                    <button type="button" className="buttonv2" onClick={() => onRejectOrganizer(item.id)} style={{ marginLeft: '8px' }}>{t('adminRequests.actions.reject')}</button>
                    <span className="inline-confirm-anchor" style={{ display: 'inline-block', marginLeft: '8px' }}>
                      {deleteConfirmRequestId === item.id ? (
                        <span className="inline-confirm-popover" role="group" aria-label={t('adminRequests.actions.confirmDeleteAria')}>
                          <button type="button" className="btn-new-event inline-confirm-popover-btn" onClick={() => onDeleteOrganizerRequest(item.id)}>
                            {t('adminRequests.common.yes')}
                          </button>
                          <button type="button" className="btn-secondary inline-confirm-popover-btn" onClick={() => setDeleteConfirmRequestId(null)}>
                            {t('adminRequests.common.no')}
                          </button>
                        </span>
                      ) : null}
                      <button type="button" className="buttonv2" onClick={() => setDeleteConfirmRequestId(item.id)}>{t('adminRequests.actions.deleteFromDb')}</button>
                    </span>
                  </>
                ) : (
                  <>
                    <span>{t('adminRequests.actions.approved')}</span>
                    <span className="inline-confirm-anchor" style={{ display: 'inline-block', marginLeft: '8px' }}>
                      {deleteConfirmRequestId === item.id ? (
                        <span className="inline-confirm-popover" role="group" aria-label={t('adminRequests.actions.confirmDeleteAria')}>
                          <button type="button" className="btn-new-event inline-confirm-popover-btn" onClick={() => onDeleteOrganizerRequest(item.id)}>
                            {t('adminRequests.common.yes')}
                          </button>
                          <button type="button" className="btn-secondary inline-confirm-popover-btn" onClick={() => setDeleteConfirmRequestId(null)}>
                            {t('adminRequests.common.no')}
                          </button>
                        </span>
                      ) : null}
                      <button type="button" className="buttonv2" onClick={() => setDeleteConfirmRequestId(item.id)}>{t('adminRequests.actions.deleteFromDb')}</button>
                    </span>
                  </>
                )}
              </td>
            </tr>
          )) : (
            <tr>
              <td colSpan={7}>{t('adminRequests.empty')}</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default OrganizerRequestsPanel;
