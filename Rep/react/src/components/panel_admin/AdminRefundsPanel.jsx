import React, { useCallback, useContext, useEffect, useState } from 'react';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import { AuthContext } from '../../context/AuthContext';
import { API_BASE_URL, getAuthHeaders } from '../../api/apiClient';

const AdminRefundsPanel = () => {
  const { t } = useTranslation();
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
      setStatus({ type: 'error', message: t('adminRefunds.status.fetchError') });
    } finally {
      setLoading(false);
    }
  }, [getRequestConfig, t]);

  useEffect(() => {
    if (!isLoggedIn) return;
    fetchZwroty();
  }, [isLoggedIn, fetchZwroty]);

  const handleApprove = async (id) => {
    try {
      await axios.post(`${API_BASE_URL}/zwroty/${id}/approve`, {}, getRequestConfig());
      setStatus({ type: 'success', message: t('adminRefunds.status.approveSuccess') });
      fetchZwroty();
    } catch (error) {
      setStatus({ type: 'error', message: t('adminRefunds.status.approveError') });
    }
  };

  return (
    <div className="admin-panel-section">
      {status.message && <p className={`status-message ${status.type}`}>{status.message}</p>}
      {loading && <p>{t('adminRefunds.loading')}</p>}
      <table className="participants-table">
        <thead>
          <tr>
            <th>{t('adminRefunds.table.id')}</th>
            <th>{t('adminRefunds.table.user')}</th>
            <th>{t('adminRefunds.table.event')}</th>
            <th>{t('adminRefunds.table.class')}</th>
            <th>{t('adminRefunds.table.amount')}</th>
            <th>{t('adminRefunds.table.reason')}</th>
            <th>{t('adminRefunds.table.state')}</th>
            <th>{t('adminRefunds.table.actions')}</th>
          </tr>
        </thead>
        <tbody>
          {zwroty.length > 0 ? zwroty.map((z) => {
            const approved = z.przyznany === true || String(z.stan || '').toLowerCase() === 'zaakceptowana';
            return (
              <tr key={z.id}>
                <td>{z.id}</td>
                <td>{z.userLogin}</td>
                <td>{z.wydarzenieTytul}</td>
                <td>{z.klasa}</td>
                <td>{z.kwota} {z.waluta}</td>
                <td>{z.powod}</td>
                <td>{z.stan}</td>
                <td>
                  {!approved && (
                    <button type="button" className="buttonv2" onClick={() => handleApprove(z.id)}>{t('adminRefunds.actions.approve')}</button>
                  )}
                  {approved && <span>Zaakceptowano</span>}
                </td>
              </tr>
            );
          }) : (
            <tr>
              <td colSpan={8}>{t('adminRefunds.empty')}</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default AdminRefundsPanel;
