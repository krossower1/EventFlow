import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { apiClient, getAuthHeaders } from '../../api/apiClient';

const OrganizerRequestsPanel = () => {
  const { authCredentials } = useContext(AuthContext);
  const [organizerRequests, setOrganizerRequests] = useState([]);
  const [status, setStatus] = useState({ type: '', message: '' });
  const [loading, setLoading] = useState(false);

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
      setStatus({ type: 'error', message: 'Nie udało się pobrać wniosków organizatora.' });
    } finally {
      setLoading(false);
    }
  }, [getRequestConfig]);

  useEffect(() => {
    fetchOrganizerRequests();
  }, [fetchOrganizerRequests]);

  const onApproveOrganizer = async (id) => {
    try {
      await apiClient.post(`/organizator/${id}/approve`, {}, getRequestConfig());
      setStatus({ type: 'success', message: 'Wniosek zatwierdzony.' });
      fetchOrganizerRequests();
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

  const sortedOrganizerRequests = useMemo(() => (
    [...organizerRequests].sort((a, b) => {
      if (a.zweryfikow === b.zweryfikow) return 0;
      return a.zweryfikow ? 1 : -1;
    })
  ), [organizerRequests]);

  return (
    <div className="admin-panel-section">
      {status.message && <p className={`status-message ${status.type}`}>{status.message}</p>}
      {loading && <p>Ładowanie wniosków...</p>}
      <table className="participants-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Użytkownik</th>
            <th>Email</th>
            <th>Firma</th>
            <th>Kwalifikacje</th>
            <th>Zweryfikowano</th>
            <th>Akcje</th>
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
            <tr>
              <td colSpan={7}>Brak wniosków organizatora.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default OrganizerRequestsPanel;
