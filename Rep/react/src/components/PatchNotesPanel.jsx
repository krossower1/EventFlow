import React, { useCallback, useContext, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AuthContext } from '../context/AuthContext';
import { apiClient, getAuthHeaders } from '../api/apiClient';

const PatchNotesPanel = () => {
  const { t } = useTranslation();
  const { currentUser, authCredentials } = useContext(AuthContext);
  const isAdmin = String(currentUser?.rola || '').toUpperCase() === 'ADMIN';
  const [patchNotes, setPatchNotes] = useState({ dateLabel: '', items: [] });
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({ dateLabel: '', itemsText: '' });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [status, setStatus] = useState({ type: '', message: '' });

  const getRequestConfig = useCallback(() => {
    const config = { withCredentials: true };
    if (authCredentials.login && authCredentials.password) {
      config.headers = getAuthHeaders(authCredentials.login, authCredentials.password);
    }
    return config;
  }, [authCredentials]);

  const loadPatchNotes = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await apiClient.get('/dashboard/patch-notes', getRequestConfig());
      setPatchNotes({
        dateLabel: response.data?.dateLabel || '',
        items: Array.isArray(response.data?.items) ? response.data.items : [],
      });
    } catch {
      setStatus({ type: 'error', message: t('dashboard.patchNotes.loadError') });
    } finally {
      setIsLoading(false);
    }
  }, [getRequestConfig, t]);

  useEffect(() => {
    loadPatchNotes();
  }, [loadPatchNotes]);

  const startEditing = () => {
    setEditForm({
      dateLabel: patchNotes.dateLabel,
      itemsText: patchNotes.items.join('\n'),
    });
    setStatus({ type: '', message: '' });
    setIsEditing(true);
  };

  const cancelEditing = () => {
    setIsEditing(false);
    setStatus({ type: '', message: '' });
  };

  const onSave = async (event) => {
    event.preventDefault();
    const items = editForm.itemsText
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean);

    if (!editForm.dateLabel.trim()) {
      setStatus({ type: 'error', message: t('dashboard.patchNotes.missingDateLabel') });
      return;
    }
    if (items.length === 0) {
      setStatus({ type: 'error', message: t('dashboard.patchNotes.missingItems') });
      return;
    }

    setIsSaving(true);
    setStatus({ type: '', message: '' });
    try {
      const response = await apiClient.put(
        '/dashboard/patch-notes',
        {
          dateLabel: editForm.dateLabel.trim(),
          items,
        },
        getRequestConfig()
      );
      setPatchNotes({
        dateLabel: response.data?.dateLabel || editForm.dateLabel.trim(),
        items: Array.isArray(response.data?.items) ? response.data.items : items,
      });
      setIsEditing(false);
      setStatus({ type: 'success', message: t('dashboard.patchNotes.saveSuccess') });
    } catch (error) {
      setStatus({
        type: 'error',
        message: error.response?.data?.message || t('dashboard.patchNotes.saveError'),
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <section className="dashboard-patch-notes">
      <div className="patch-notes-header">
        <h3 className="patch-notes-title">{t('dashboard.patchNotes.title')}</h3>
        {isAdmin && !isEditing ? (
          <button type="button" className="patch-notes-edit-btn" onClick={startEditing}>
            {t('dashboard.patchNotes.edit')}
          </button>
        ) : null}
      </div>

      {isLoading ? <p className="patch-notes-loading">{t('dashboard.patchNotes.loading')}</p> : null}

      {!isLoading && isEditing ? (
        <form className="patch-notes-form" onSubmit={onSave}>
          <label htmlFor="patch-notes-date">{t('dashboard.patchNotes.dateLabel')}</label>
          <input
            id="patch-notes-date"
            type="text"
            value={editForm.dateLabel}
            onChange={(event) => setEditForm((prev) => ({ ...prev, dateLabel: event.target.value }))}
            placeholder={t('dashboard.patchNotes.datePlaceholder')}
          />
          <label htmlFor="patch-notes-items">{t('dashboard.patchNotes.itemsLabel')}</label>
          <textarea
            id="patch-notes-items"
            value={editForm.itemsText}
            onChange={(event) => setEditForm((prev) => ({ ...prev, itemsText: event.target.value }))}
            rows={6}
            placeholder={t('dashboard.patchNotes.itemsPlaceholder')}
          />
          <div className="patch-notes-form-actions">
            <button type="submit" className="btn-new-event" disabled={isSaving}>
              {isSaving ? t('common.saving') : t('common.save')}
            </button>
            <button type="button" className="btn-back-tab" onClick={cancelEditing} disabled={isSaving}>
              {t('common.cancel')}
            </button>
          </div>
        </form>
      ) : null}

      {!isLoading && !isEditing ? (
        <>
          {patchNotes.dateLabel ? <p className="patch-notes-date">{patchNotes.dateLabel}</p> : null}
          {patchNotes.items.length > 0 ? (
            <ul>
              {patchNotes.items.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          ) : (
            <p className="patch-notes-empty">{t('dashboard.patchNotes.empty')}</p>
          )}
        </>
      ) : null}

      {status.message ? <p className={`patch-notes-status ${status.type}`}>{status.message}</p> : null}
    </section>
  );
};

export default PatchNotesPanel;
