import React, { useState, useEffect, useContext, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { apiClient, getAuthHeaders } from '../api/apiClient';
import { AuthContext } from '../context/AuthContext';
import { cascadeAfterMiejsceDelete, cascadeAfterSalaDelete } from '../utils/cascadeDelete';

const MiejscaPage = () => {
  const { t } = useTranslation();
  const { currentUser, authCredentials } = useContext(AuthContext);
  const [miejsca, setMiejsca] = useState([]);
  const [loading, setLoading] = useState(false);
  const [view, setView] = useState('list'); // 'list' lub 'add'
  const [status, setStatus] = useState({ type: '', message: '' });

  const [miejsceForm, setMiejsceForm] = useState({
    nazwa: '',
    panstwo: 'Polska',
    miasto: '',
    ulica: '',
    kodPoczt: '',
    iloscSal: '',
    opis: ''
  });
  const [salaForms, setSalaForms] = useState({});
  const [increaseForms, setIncreaseForms] = useState({});
  const [confirmIncreaseMiejsceId, setConfirmIncreaseMiejsceId] = useState(null);
  const [confirmDeleteMiejsceId, setConfirmDeleteMiejsceId] = useState(null);
  const [confirmDeleteSala, setConfirmDeleteSala] = useState(null);

  const getRequestConfig = useCallback(() => {
    const config = { withCredentials: true };
    if (authCredentials.login && authCredentials.password) {
      config.headers = getAuthHeaders(authCredentials.login, authCredentials.password);
    }
    return config;
  }, [authCredentials]);

  const fetchMyMiejsca = useCallback(async () => {
    setLoading(true);
    try {
      const response = await apiClient.get('/miejsca/my', getRequestConfig());
      setMiejsca(response.data);
    } catch (error) {
      setStatus({ type: 'error', message: t('places.status.fetchError') });
    } finally {
      setLoading(false);
    }
  }, [getRequestConfig]);

  useEffect(() => {
    if (currentUser?.rola === 'ORG') {
      fetchMyMiejsca();
    } else {
      // Dla nie-ORG, ustawiamy puste miejsca
      setMiejsca([]);
    }
  }, [currentUser, fetchMyMiejsca]);

  useEffect(() => {
    if (confirmIncreaseMiejsceId == null) return undefined;
    const handleClickOutsideConfirm = (event) => {
      if (!event.target.closest('.inline-confirm-anchor')) {
        setConfirmIncreaseMiejsceId(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutsideConfirm);
    return () => document.removeEventListener('mousedown', handleClickOutsideConfirm);
  }, [confirmIncreaseMiejsceId]);

  useEffect(() => {
    if (confirmDeleteMiejsceId == null && confirmDeleteSala == null) return undefined;
    const handleClickOutsideConfirm = (event) => {
      if (!event.target.closest('.inline-confirm-anchor')) {
        setConfirmDeleteMiejsceId(null);
        setConfirmDeleteSala(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutsideConfirm);
    return () => document.removeEventListener('mousedown', handleClickOutsideConfirm);
  }, [confirmDeleteMiejsceId, confirmDeleteSala]);

  const onMiejsceSubmit = async (event) => {
    event.preventDefault();
    setStatus({ type: '', message: '' });
    try {
      await apiClient.post('/miejsca', {
        ...miejsceForm,
        iloscSal: Number(miejsceForm.iloscSal)
      }, getRequestConfig());
      setStatus({ type: 'success', message: t('places.status.addSuccess') });
      setMiejsceForm({ nazwa: '', panstwo: 'Polska', miasto: '', ulica: '', kodPoczt: '', iloscSal: '', opis: '' });
      setView('list');
      fetchMyMiejsca();
    } catch (error) {
      setStatus({ type: 'error', message: error?.response?.data?.message || t('places.status.addError') });
    }
  };

  const updateSalaForm = (miejsceId, field, value) => {
    setSalaForms(prev => ({
      ...prev,
      [miejsceId]: {
        ...(prev[miejsceId] || { nazwa: '', pojemnosc: '', pietro: '', maPlan: false }),
        [field]: value
      }
    }));
  };

  const onSalaSubmit = async (event, miejsceId) => {
    event.preventDefault();
    const form = salaForms[miejsceId];
    if (!form) return;
    try {
      await apiClient.post(`/miejsca/${miejsceId}/sale`, {
        nazwa: form.nazwa,
        pojemnosc: Number(form.pojemnosc),
        pietro: Number(form.pietro),
        maPlan: Boolean(form.maPlan)
      }, getRequestConfig());
      setStatus({ type: 'success', message: t('places.status.roomAddSuccess') });
      setSalaForms(prev => ({ ...prev, [miejsceId]: { nazwa: '', pojemnosc: '', pietro: '', maPlan: false } }));
      fetchMyMiejsca();
    } catch (error) {
      setStatus({ type: 'error', message: error?.response?.data?.message || t('places.status.roomAddError') });
    }
  };

  const updateIncreaseForm = (miejsceId, value) => {
    setIncreaseForms(prev => ({ ...prev, [miejsceId]: value }));
  };

  const onIncreaseIloscSal = async (miejsce) => {
    const rawValue = increaseForms[miejsce.id];
    const nowaIloscSal = Number(rawValue);
    if (!rawValue || Number.isNaN(nowaIloscSal) || nowaIloscSal <= 0) {
      setStatus({ type: 'error', message: t('places.status.increaseInvalid') });
      return;
    }

    try {
      await apiClient.patch(`/miejsca/${miejsce.id}/ilosc-sal`, {
        nowaIloscSal,
        potwierdzenie: true
      }, getRequestConfig());
      setStatus({ type: 'success', message: t('places.status.increaseSuccess') });
      setIncreaseForms(prev => ({ ...prev, [miejsce.id]: '' }));
      setConfirmIncreaseMiejsceId(null);
      fetchMyMiejsca();
    } catch (error) {
      setStatus({ type: 'error', message: error?.response?.data?.message || t('places.status.increaseError') });
    }
  };

  const onDeleteMiejsce = async (miejsceId) => {
    try {
      const response = await apiClient.delete(`/miejsca/${miejsceId}`, getRequestConfig());
      cascadeAfterMiejsceDelete(miejsceId, setMiejsca);
      setConfirmDeleteMiejsceId(null);
      setStatus({ type: 'success', message: response.data || t('places.status.deleteSuccess') });
    } catch (error) {
      setStatus({ type: 'error', message: error?.response?.data?.message || t('places.status.deleteError') });
    }
  };

  const onDeleteSala = async (miejsceId, salaId) => {
    try {
      const response = await apiClient.delete(`/miejsca/sale/${salaId}`, getRequestConfig());
      cascadeAfterSalaDelete(miejsceId, salaId, setMiejsca);
      setConfirmDeleteSala(null);
      setStatus({ type: 'success', message: response.data || t('places.status.roomDeleteSuccess') });
    } catch (error) {
      setStatus({ type: 'error', message: error?.response?.data?.message || t('places.status.roomDeleteError') });
    }
  };

  // Strona dostępna dla wszystkich, ale zarządzanie tylko dla organizatorów

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2>{currentUser?.rola === 'ORG' ? t('places.page.titleOrg') : t('places.page.titleViewer')}</h2>
        <div className="miejsca-page-toolbar-actions">
          <span
            className={`permission-tooltip ${currentUser?.rola !== 'ORG' ? 'has-tooltip' : ''}`}
            data-tooltip={currentUser?.rola !== 'ORG' ? t('places.tooltip.onlyOrganizer') : ''}
          >
            <button
              type="button"
              className="btn-refresh-icon"
              onClick={fetchMyMiejsca}
              aria-label={t('places.toolbar.refreshAriaLabel')}
            >
              <img src="/icons/refresh.png" alt="" width={22} height={22} />
            </button>
          </span>
          <span
            className={`permission-tooltip ${currentUser?.rola !== 'ORG' ? 'has-tooltip' : ''}`}
            data-tooltip={currentUser?.rola !== 'ORG' ? t('places.tooltip.onlyOrganizer') : ''}
          >
            <button
              className="btn-new-event"
              onClick={() => setView(view === 'list' ? 'add' : 'list')}
              disabled={currentUser?.rola !== 'ORG'}
            >
              {view === 'list' ? t('places.toolbar.add') : t('places.toolbar.backToList')}
            </button>
          </span>
        </div>
      </div>

      {status.message && <p className={`status-message ${status.type}`}>{status.message}</p>}

      {view === 'add' ? (
        currentUser?.rola === 'ORG' ? (
          <div className="auth-form organizer-form miejsce-form-card">
            <h3>{t('places.form.newPlaceTitle')}</h3>
            <form onSubmit={onMiejsceSubmit} className="miejsce-form-grid">
              <div className="miejsce-form-field miejsce-form-field--full">
                <label htmlFor="miejsce-nazwa">{t('places.form.name')}</label>
                <input id="miejsce-nazwa" type="text" value={miejsceForm.nazwa} onChange={e => setMiejsceForm({...miejsceForm, nazwa: e.target.value})} maxLength={255} required />
              </div>

              <div className="miejsce-form-field">
                <label htmlFor="miejsce-panstwo">{t('places.form.country')}</label>
                <input id="miejsce-panstwo" type="text" value={t('places.form.countryDefault')} disabled maxLength={255} />
              </div>

              <div className="miejsce-form-field">
                <label htmlFor="miejsce-miasto">{t('places.form.city')}</label>
                <input id="miejsce-miasto" type="text" value={miejsceForm.miasto} onChange={e => setMiejsceForm({...miejsceForm, miasto: e.target.value})} maxLength={255} required />
              </div>

              <div className="miejsce-form-field">
                <label htmlFor="miejsce-ulica">{t('places.form.street')}</label>
                <input id="miejsce-ulica" type="text" value={miejsceForm.ulica} onChange={e => setMiejsceForm({...miejsceForm, ulica: e.target.value})} maxLength={255} required />
              </div>

              <div className="miejsce-form-field">
                <label htmlFor="miejsce-kod">{t('places.form.postalCode')}</label>
                <input id="miejsce-kod" type="text" value={miejsceForm.kodPoczt} onChange={e => setMiejsceForm({...miejsceForm, kodPoczt: e.target.value})} maxLength={20} required />
              </div>

              <div className="miejsce-form-field miejsce-form-field--full">
                <label htmlFor="miejsce-ilosc-sal">{t('places.form.roomsLimit')}</label>
                <input id="miejsce-ilosc-sal" type="number" value={miejsceForm.iloscSal} onChange={e => setMiejsceForm({...miejsceForm, iloscSal: e.target.value})} required />
              </div>

              <div className="miejsce-form-field miejsce-form-field--full">
                <label htmlFor="miejsce-opis">{t('places.form.description')}</label>
                <textarea id="miejsce-opis" value={miejsceForm.opis} onChange={e => setMiejsceForm({...miejsceForm, opis: e.target.value})} />
              </div>

              <div className="miejsce-form-actions">
                <button type="submit">{t('places.form.savePlace')}</button>
              </div>
            </form>
          </div>
        ) : (
          <div style={{padding: '20px', textAlign: 'center', color: '#666'}}>
            <p>{t('places.form.onlyOrganizer')}</p>
          </div>
        )
      ) : (
        <div className="miejsca-list">
          {loading && <h3>{t('places.loading')}</h3>}
          {miejsca.length > 0 ? miejsca.map((miejsce) => (
            <div key={miejsce.id} className="miejsce-card" style={{ marginBottom: '30px', padding: '20px', border: '1px solid #ddd', borderRadius: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <h3>{miejsce.nazwa}</h3>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <span className="event-badge">ID: {miejsce.id}</span>
                  {currentUser?.rola === 'ORG' ? (
                    <span className="inline-confirm-anchor" style={{ display: 'inline-block' }}>
                      {confirmDeleteMiejsceId === miejsce.id ? (
                        <span className="inline-confirm-popover" role="group" aria-label={t('places.confirm.deletePlaceAria')}>
                          <p className="inline-confirm-cascade-hint">{t('places.confirm.deletePlaceCascadeHint')}</p>
                          <button type="button" className="btn-delete inline-confirm-popover-btn" onClick={() => onDeleteMiejsce(miejsce.id)}>
                            {t('places.confirm.yes')}
                          </button>
                          <button type="button" className="btn-secondary inline-confirm-popover-btn" onClick={() => setConfirmDeleteMiejsceId(null)}>
                            {t('places.confirm.no')}
                          </button>
                        </span>
                      ) : null}
                      <button type="button" className="btn-delete" onClick={() => setConfirmDeleteMiejsceId(miejsce.id)}>
                        {t('places.actions.deletePlace')}
                      </button>
                    </span>
                  ) : null}
                </div>
              </div>
              <p><strong>{t('places.card.addressLabel')}</strong> {miejsce.ulica}, {miejsce.kodPoczt} {miejsce.miasto}, {miejsce.panstwo}</p>
              <p><strong>{t('places.card.roomsLimitLabel')}</strong> {miejsce.iloscSal}</p>
              <p><strong>{t('places.card.usedLabel')}</strong> {miejsce.sale?.length || 0} / {miejsce.iloscSal}</p>
              <p>{miejsce.opis}</p>

              {currentUser?.rola === 'ORG' && (
                <div style={{ marginTop: '12px', padding: '12px', border: '1px dashed #666', borderRadius: '6px' }}>
                  <h5 style={{ marginTop: 0 }}>{t('places.increaseRooms.title')}</h5>
                  <form onSubmit={(e) => e.preventDefault()} style={{ display: 'flex', gap: '10px', alignItems: 'end' }}>
                    <div>
                      <input
                        type="number"
                        className="buttonv2"
                        min={miejsce.iloscSal || 1}
                        value={increaseForms[miejsce.id] || ''}
                        onChange={e => updateIncreaseForm(miejsce.id, e.target.value)}
                        required
                      />
                    </div>
                    <span className="inline-confirm-anchor" style={{ display: 'inline-block' }}>
                      {confirmIncreaseMiejsceId === miejsce.id ? (
                        <span className="inline-confirm-popover" role="group" aria-label={t('places.increaseRooms.confirmAria')}>
                          <button
                            type="button"
                            className="btn-new-event inline-confirm-popover-btn"
                            onClick={() => onIncreaseIloscSal(miejsce)}
                          >
                            {t('places.increaseRooms.confirmYes')}
                          </button>
                          <button
                            type="button"
                            className="btn-secondary inline-confirm-popover-btn"
                            onClick={() => setConfirmIncreaseMiejsceId(null)}
                          >
                            {t('places.increaseRooms.confirmNo')}
                          </button>
                        </span>
                      ) : null}
                      <button
                        type="button"
                        className="buttonv2"
                        onClick={() => setConfirmIncreaseMiejsceId(miejsce.id)}
                      >
                        {t('places.increaseRooms.button')}
                      </button>
                    </span>
                  </form>
                </div>
              )}

              <h4 style={{ marginTop: '20px' }}>{t('places.rooms.sectionTitle')}</h4>
              {miejsce.sale && miejsce.sale.length > 0 ? (
                <table className="participants-table" style={{ fontSize: '0.9em' }}>
                  <thead>
                    <tr>
                      <th>{t('places.rooms.table.id')}</th>
                      <th>{t('places.rooms.table.name')}</th>
                      <th>{t('places.rooms.table.capacity')}</th>
                      <th>{t('places.rooms.table.floor')}</th>
                      <th>{t('places.rooms.table.plan')}</th>
                      {currentUser?.rola === 'ORG' ? <th>{t('places.rooms.table.actions')}</th> : null}
                    </tr>
                  </thead>
                  <tbody>
                    {miejsce.sale.map(sala => (
                      <tr key={sala.id}>
                        <td>{sala.id}</td>
                        <td>{sala.nazwa}</td>
                        <td>{sala.pojemnosc}</td>
                        <td>{sala.pietro}</td>
                        <td>{sala.maPlan ? t('places.rooms.table.planYes') : t('places.rooms.table.planNo')}</td>
                        {currentUser?.rola === 'ORG' ? (
                          <td>
                            <span className="inline-confirm-anchor" style={{ display: 'inline-block' }}>
                              {confirmDeleteSala?.miejsceId === miejsce.id && confirmDeleteSala?.salaId === sala.id ? (
                                <span className="inline-confirm-popover" role="group" aria-label={t('places.confirm.deleteRoomAria')}>
                                  <p className="inline-confirm-cascade-hint">{t('places.confirm.deleteRoomCascadeHint')}</p>
                                  <button type="button" className="btn-delete inline-confirm-popover-btn" onClick={() => onDeleteSala(miejsce.id, sala.id)}>
                                    {t('places.confirm.yes')}
                                  </button>
                                  <button type="button" className="btn-secondary inline-confirm-popover-btn" onClick={() => setConfirmDeleteSala(null)}>
                                    {t('places.confirm.no')}
                                  </button>
                                </span>
                              ) : null}
                              <button type="button" className="btn-delete" onClick={() => setConfirmDeleteSala({ miejsceId: miejsce.id, salaId: sala.id })}>
                                {t('places.actions.deleteRoom')}
                              </button>
                            </span>
                          </td>
                        ) : null}
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p>{t('places.card.noRoomsDefined')}</p>
              )}

              <div id='xxx'>
                <h5>{t('places.addRoom.titlePrefix')} {miejsce.nazwa}</h5>
                {currentUser?.rola === 'ORG' ? (
                  <form onSubmit={e => onSalaSubmit(e, miejsce.id)} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr auto', gap: '10px', alignItems: 'end' }}>
                  <div>
                    <label style={{fontSize: '15px', paddingRight: '10px'}}>{t('places.addRoom.name')}</label>
                    <input 
                      type="text" 
                      className="buttonv2"
                      value={salaForms[miejsce.id]?.nazwa || ''} 
                      onChange={e => updateSalaForm(miejsce.id, 'nazwa', e.target.value)} 
                      required 
                    />
                  </div>
                  <div>
                    <label style={{fontSize: '15px', paddingRight: '10px'}}>{t('places.addRoom.capacity')}</label>
                    <input 
                      type="number" 
                      className="buttonv2"
                      value={salaForms[miejsce.id]?.pojemnosc || ''} 
                      onChange={e => updateSalaForm(miejsce.id, 'pojemnosc', e.target.value)} 
                      required 
                    />
                  </div>
                  <div>
                    <label style={{fontSize: '15px', paddingRight: '10px'}}>{t('places.addRoom.floor')}</label>
                    <input 
                      type="number" 
                      className="buttonv2"
                      value={salaForms[miejsce.id]?.pietro || ''} 
                      onChange={e => updateSalaForm(miejsce.id, 'pietro', e.target.value)} 
                      required 
                    />
                  </div>
                  <div>
                    <label style={{fontSize: '15px', paddingRight: '10px'}}>{t('places.addRoom.plan')}</label>
                    <select 
                      className="buttonv2"
                      value={salaForms[miejsce.id]?.maPlan || false} 
                      onChange={e => updateSalaForm(miejsce.id, 'maPlan', e.target.value === 'true')}
                    >
                      <option value="false" style={{backgroundColor: '#0d0f14', color: '#ffffff'}}>{t('places.rooms.table.planNo')}</option>
                      <option value="true" style={{backgroundColor: '#0d0f14', color: '#ffffff'}}>{t('places.rooms.table.planYes')}</option>
                    </select>
                  </div>
                  <button
                    type="submit"
                    className="buttonv2"
                    style={{padding: '4px 8px'}}
                    disabled={(miejsce.sale?.length || 0) >= (miejsce.iloscSal || 0)}
                    title={(miejsce.sale?.length || 0) >= (miejsce.iloscSal || 0) ? t('places.addRoom.roomLimitReached') : ''}
                  >
                    {t('places.addRoom.submit')}
                  </button>
                </form>
                ) : (
                  <p style={{ color: '#666', textAlign: 'center' }}>{t('places.addRoom.onlyOrganizer')}</p>
                )}
              </div>
            </div>
          )) : (
            <p>{t('places.empty')}</p>
          )}
        </div>
      )}
    </div>
  );
};

export default MiejscaPage;