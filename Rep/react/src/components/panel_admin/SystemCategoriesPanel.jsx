import React, { useCallback, useContext, useState } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { apiClient, getAuthHeaders } from '../../api/apiClient';

const SystemCategoriesPanel = () => {
  const { authCredentials } = useContext(AuthContext);
  const [systemCategoryForm, setSystemCategoryForm] = useState({ nazwa: '', opis: '' });
  const [status, setStatus] = useState({ type: '', message: '' });

  const getRequestConfig = useCallback(() => {
    const config = { withCredentials: true };
    if (authCredentials.login && authCredentials.password) {
      config.headers = getAuthHeaders(authCredentials.login, authCredentials.password);
    }
    return config;
  }, [authCredentials]);

  const onSystemCategorySubmit = async (event) => {
    event.preventDefault();
    setStatus({ type: '', message: '' });

    try {
      const response = await apiClient.post(
        '/wydarzenia/kategorie/systemowe',
        { nazwa: systemCategoryForm.nazwa, opis: systemCategoryForm.opis },
        getRequestConfig()
      );
      setStatus({ type: 'success', message: response.data || 'Systemowa kategoria została dodana.' });
      setSystemCategoryForm({ nazwa: '', opis: '' });
    } catch (error) {
      setStatus({
        type: 'error',
        message: error.response?.data?.message || 'Nie udało się dodać systemowej kategorii.'
      });
    }
  };

  return (
    <div className="admin-panel-section">
      {status.message && <p className={`status-message ${status.type}`}>{status.message}</p>}
      <form onSubmit={onSystemCategorySubmit} className="auth-form organizer-form event-form">
        <h4 style={{ marginTop: 0 }}>Dodaj systemową kategorię</h4>
        <label htmlFor="admin-sys-cat-name">Nazwa</label>
        <input
          id="admin-sys-cat-name"
          type="text"
          value={systemCategoryForm.nazwa}
          onChange={(event) => setSystemCategoryForm({ ...systemCategoryForm, nazwa: event.target.value })}
          required
        />
        <label htmlFor="admin-sys-cat-desc">Opis</label>
        <input
          id="admin-sys-cat-desc"
          type="text"
          value={systemCategoryForm.opis}
          onChange={(event) => setSystemCategoryForm({ ...systemCategoryForm, opis: event.target.value })}
        />
        <button type="submit" className="btn-new-event">Zapisz kategorię systemową</button>
      </form>
    </div>
  );
};

export default SystemCategoriesPanel;
