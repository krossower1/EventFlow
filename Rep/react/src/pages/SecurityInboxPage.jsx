import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { apiClient } from '../api/apiClient';
import { AuthContext } from '../context/AuthContext';

/**
 * Skrzynka zgłoszeń bezpieczeństwa (tylko ADMIN).
 *
 * Pobiera listę z /api/admin/security-tickets z filtrami, pozwala zmieniać status i przypisanie,
 * wykonywać szybkie akcje (blokada, reset hasła, odrzucenie), usuwać zgłoszenie oraz podglądać
 * opis + audyt (osobne GET .../audit po rozwinięciu wiersza).
 */

/**
 * Konfiguracja axios: sesja cookie + opcjonalnie Basic Auth z kontekstu (zgodnie z resztą aplikacji).
 */
const buildAuthConfig = (authCredentials) => {
  const config = { withCredentials: true };
  if (authCredentials?.login && authCredentials?.password) {
    const basicToken = btoa(`${authCredentials.login}:${authCredentials.password}`);
    config.headers = { Authorization: `Basic ${basicToken}` };
  }
  return config;
};

const SecurityInboxPage = ({ embedded = false }) => {
  const { t } = useTranslation();
  const { authCredentials, currentUser } = useContext(AuthContext);
  const getRequestConfig = useCallback(() => buildAuthConfig(authCredentials), [authCredentials]);
  const statusLabels = {
    NEW: t('securityInbox.statusLabels.NEW'),
    IN_PROGRESS: t('securityInbox.statusLabels.IN_PROGRESS'),
    RESOLVED: t('securityInbox.statusLabels.RESOLVED'),
    DISMISSED: t('securityInbox.statusLabels.DISMISSED')
  };
  const categoryLabels = {
    USER_FLAGGED_LOG: t('securityInbox.categoryLabels.USER_FLAGGED_LOG'),
    OTHER: t('securityInbox.categoryLabels.OTHER')
  };

  const isAdmin = String(currentUser?.rola || '').toUpperCase() === 'ADMIN';

  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  /** Komunikat sukcesu / błędu po akcjach na zgłoszeniu (jeden pasek nad tabelą). */
  const [actionNotice, setActionNotice] = useState({ type: '', message: '' });
  const [filterStatus, setFilterStatus] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterAffectedId, setFilterAffectedId] = useState('');
  /** Lista użytkowników ADMIN do selecta „Przypisano” (z GET /users, filtrowane po roli). */
  const [admins, setAdmins] = useState([]);
  /** ID wiersza rozwiniętego do podglądu opisu + audytu. */
  const [expandedId, setExpandedId] = useState(null);
  /** Audyty lazy: klucz = ticketId, wartość = tablica z API. */
  const [auditsByTicket, setAuditsByTicket] = useState({});
  /** Stan ładowania GET audytu (współdzielony — wystarczy do prostego „Ładowanie…” w rozwinięciu). */
  const [loadingAudits, setLoadingAudits] = useState(false);
  const [deleteConfirmTicketId, setDeleteConfirmTicketId] = useState(null);
  const [isDeletingTicket, setIsDeletingTicket] = useState(false);

  /**
   * Ładuje zgłoszenia z backendu z aktualnymi filtrami query.
   * Dla nie-admina kończy wcześniej (nie wywołuje API).
   */
  const loadTickets = useCallback(async () => {
    if (!isAdmin) {
      setLoading(false);
      return;
    }
    setError('');
    try {
      const params = new URLSearchParams();
      if (filterStatus) params.set('status', filterStatus);
      if (filterCategory) params.set('category', filterCategory);
      if (filterAffectedId) params.set('affectedUserId', filterAffectedId);
      const qs = params.toString();
      const url = qs ? `/admin/security-tickets?${qs}` : '/admin/security-tickets';
      const response = await apiClient.get(url, getRequestConfig());
      setTickets(Array.isArray(response?.data) ? response.data : []);
    } catch (e) {
      setError(e.response?.data?.message || t('securityInbox.status.fetchError'));
    } finally {
      setLoading(false);
    }
  }, [filterStatus, filterCategory, filterAffectedId, getRequestConfig, isAdmin, t]);

  /**
   * Lista administratorów do przypisania — endpoint ogólny GET /users (jak w innych miejscach projektu).
   */
  const loadAdmins = useCallback(async () => {
    if (!isAdmin) {
      setAdmins([]);
      return;
    }
    try {
      const response = await apiClient.get('/users', getRequestConfig());
      const list = Array.isArray(response?.data) ? response.data : [];
      setAdmins(list.filter((u) => String(u?.rola || '').toUpperCase() === 'ADMIN'));
    } catch {
      setAdmins([]);
    }
  }, [getRequestConfig, isAdmin]);

  useEffect(() => {
    if (!isAdmin) {
      setLoading(false);
      setTickets([]);
      return;
    }
    loadTickets();
  }, [loadTickets, isAdmin]);

  /** Odświeżenie listy co 60 s, żeby admin widział nowe zgłoszenia bez przeładowania strony. */
  useEffect(() => {
    if (!isAdmin) return undefined;
    const id = setInterval(() => {
      loadTickets();
    }, 60000);
    return () => clearInterval(id);
  }, [loadTickets, isAdmin]);

  useEffect(() => {
    if (!isAdmin) return undefined;
    loadAdmins();
    return undefined;
  }, [loadAdmins, isAdmin]);

  /**
   * Pobiera log audytu dla jednego zgłoszenia i zapisuje w auditsByTicket[ticketId].
   */
  const loadAudits = async (ticketId) => {
    setLoadingAudits(true);
    try {
      const response = await apiClient.get(`/admin/security-tickets/${ticketId}/audit`, getRequestConfig());
      setAuditsByTicket((prev) => ({ ...prev, [ticketId]: Array.isArray(response?.data) ? response.data : [] }));
    } catch {
      setAuditsByTicket((prev) => ({ ...prev, [ticketId]: [] }));
    } finally {
      setLoadingAudits(false);
    }
  };

  /**
   * Zwija / rozwija wiersz; przy pierwszym rozwinięciu doładowuje audyt, jeśli jeszcze go nie ma w pamięci.
   */
  const toggleExpand = (ticketId) => {
    if (expandedId === ticketId) {
      setExpandedId(null);
      return;
    }
    setExpandedId(ticketId);
    if (!auditsByTicket[ticketId]) {
      loadAudits(ticketId);
    }
  };

  /** PUT status — aktualizacja workflow zgłoszenia (np. IN_PROGRESS, RESOLVED). */
  const setStatus = async (ticketId, status) => {
    setActionNotice({ type: '', message: '' });
    try {
      await apiClient.put(`/admin/security-tickets/${ticketId}/status`, { status }, getRequestConfig());
      setActionNotice({ type: 'success', message: t('securityInbox.status.saved') });
      await loadTickets();
    } catch (e) {
      setActionNotice({ type: 'error', message: e.response?.data?.message || t('securityInbox.status.saveError') });
    }
  };

  /** PUT assign — przypisanie lub null (cofnięcie). */
  const assignTicket = async (ticketId, assignedAdminId) => {
    setActionNotice({ type: '', message: '' });
    try {
      await apiClient.put(
        `/admin/security-tickets/${ticketId}/assign`,
        { assignedAdminId: assignedAdminId === '' ? null : Number(assignedAdminId) },
        getRequestConfig()
      );
      setActionNotice({ type: 'success', message: t('securityInbox.assign.saved') });
      await loadTickets();
    } catch (e) {
      setActionNotice({ type: 'error', message: e.response?.data?.message || t('securityInbox.assign.error') });
    }
  };

  /**
   * Szybkie endpointy POST (.../quick-dismiss, quick-block, quick-unblock, quick-force-password-reset).
   * @param path fragment ścieżki po ID zgłoszenia, np. {@code 'quick-block'}
   */
  const quickAction = async (ticketId, path) => {
    setActionNotice({ type: '', message: '' });
    try {
      await apiClient.post(`/admin/security-tickets/${ticketId}/${path}`, {}, getRequestConfig());
      setActionNotice({ type: 'success', message: t('securityInbox.actions.done') });
      await loadTickets();
    } catch (e) {
      setActionNotice({ type: 'error', message: e.response?.data?.message || t('securityInbox.actions.error') });
    }
  };

  /**
   * Select „Status zgłoszenia…”: po wyborze wywołuje setStatus lub quick-dismiss, potem resetuje select do placeholdera.
   */
  const handleStatusActionMenuChange = async (ticketId, event) => {
    const select = event.target;
    const value = select.value;
    if (!value) return;
    select.selectedIndex = 0;
    if (value === 'IN_PROGRESS') {
      await setStatus(ticketId, 'IN_PROGRESS');
    } else if (value === 'RESOLVED') {
      await setStatus(ticketId, 'RESOLVED');
    } else if (value === 'DISMISS') {
      await quickAction(ticketId, 'quick-dismiss');
    }
  };

  /** DELETE zgłoszenia + czyszczenie lokalnej pamięci audytu i stanu modala. */
  const confirmDeleteTicket = async () => {
    if (deleteConfirmTicketId == null) return;
    setIsDeletingTicket(true);
    setActionNotice({ type: '', message: '' });
    try {
      await apiClient.delete(`/admin/security-tickets/${deleteConfirmTicketId}`, getRequestConfig());
      setActionNotice({ type: 'success', message: t('securityInbox.delete.success') });
      if (expandedId === deleteConfirmTicketId) {
        setExpandedId(null);
      }
      setAuditsByTicket((prev) => {
        const next = { ...prev };
        delete next[deleteConfirmTicketId];
        return next;
      });
      setDeleteConfirmTicketId(null);
      await loadTickets();
    } catch (e) {
      setActionNotice({ type: 'error', message: e.response?.data?.message || t('securityInbox.delete.error') });
    } finally {
      setIsDeletingTicket(false);
    }
  };

  /**
   * Unikalne konta „ofiary” z aktualnej strony wyników — opcje filtra „Konto (ofiary)”.
   * Nie zawiera wszystkich użytkowników systemu, tylko tych widocznych przy obecnych filtrach listy.
   */
  const affectedOptions = useMemo(() => {
    const map = new Map();
    tickets.forEach((t) => {
      if (t.affectedUserId && t.affectedLogin) {
        map.set(String(t.affectedUserId), t.affectedLogin);
      }
    });
    return [...map.entries()].sort((a, b) => a[1].localeCompare(b[1], 'pl'));
  }, [tickets]);

  const rootClass = 'security-inbox';

  if (!isAdmin) {
    return (
      <div className={rootClass}>
        <p className="status-message status-error">{t('securityInbox.onlyAdmin')}</p>
      </div>
    );
  }

  return (
    <div className={rootClass}>
      {!embedded && (
        <div className="security-inbox-header">
          <h2>{t('securityInbox.title')}</h2>
          <p className="security-inbox-lede">{t('securityInbox.subtitle')}</p>
        </div>
      )}

      <div className="security-inbox-filters">
        <label>
          {t('securityInbox.filters.status')}
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
            <option value="">{t('securityInbox.filters.all')}</option>
            <option value="NEW">{t('securityInbox.statusLabels.NEW')}</option>
            <option value="IN_PROGRESS">{t('securityInbox.statusLabels.IN_PROGRESS')}</option>
            <option value="RESOLVED">{t('securityInbox.statusLabels.RESOLVED')}</option>
            <option value="DISMISSED">{t('securityInbox.statusLabels.DISMISSED')}</option>
          </select>
        </label>
        <label>
          {t('securityInbox.filters.category')}
          <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)}>
            <option value="">{t('securityInbox.filters.all')}</option>
            <option value="USER_FLAGGED_LOG">{t('securityInbox.filters.categoryLog')}</option>
            <option value="OTHER">{t('securityInbox.categoryLabels.OTHER')}</option>
          </select>
        </label>
        <label>
          {t('securityInbox.filters.affectedAccount')}
          <select value={filterAffectedId} onChange={(e) => setFilterAffectedId(e.target.value)}>
            <option value="">{t('securityInbox.filters.all')}</option>
            {affectedOptions.map(([id, login]) => (
              <option key={id} value={id}>
                {login} (#{id})
              </option>
            ))}
          </select>
        </label>
        <button
          type="button"
          className="btn-refresh-icon"
          onClick={() => {
            setLoading(true);
            loadTickets();
          }}
          aria-label={t('securityInbox.refresh')}
          title={t('securityInbox.refresh')}
        >
          <img src="/icons/refresh.png" alt="" width={22} height={22} style={{ width: '22px', height: '22px' }} />
        </button>
      </div>

      {actionNotice.message && (
        <p className={`status-message ${actionNotice.type === 'error' ? 'status-error' : 'status-success'}`}>
          {actionNotice.message}
        </p>
      )}
      {error && <p className="status-message status-error">{error}</p>}
      {loading && <p>{t('securityInbox.loading')}</p>}

      {!loading && (
        <div className="security-inbox-table-wrap">
          <table className="security-inbox-table">
            <thead>
              <tr>
                <th>{t('securityInbox.table.id')}</th>
                <th>{t('securityInbox.table.createdAt')}</th>
                <th>{t('securityInbox.table.status')}</th>
                <th>{t('securityInbox.table.category')}</th>
                <th>{t('securityInbox.table.account')}</th>
                <th>{t('securityInbox.table.reporter')}</th>
                <th>{t('securityInbox.table.assigned')}</th>
                <th>{t('securityInbox.table.actions')}</th>
              </tr>
            </thead>
            <tbody>
              {tickets.length === 0 ? (
                <tr>
                  <td colSpan={8} className="security-inbox-empty">
                    {t('securityInbox.empty')}
                  </td>
                </tr>
              ) : (
                tickets.map((row) => (
                  <React.Fragment key={row.id}>
                    <tr className={row.status === 'NEW' ? 'security-inbox-row--new' : ''}>
                      <td>
                        <button type="button" className="security-inbox-expand" onClick={() => toggleExpand(row.id)}>
                          {expandedId === row.id ? '▼' : '▶'} #{row.id}
                        </button>
                      </td>
                      <td>{row.createdAt ? new Date(row.createdAt).toLocaleString('pl-PL') : '—'}</td>
                      <td>{statusLabels[row.status] || row.status}</td>
                      <td>{categoryLabels[row.category] || row.category}</td>
                      <td>{row.affectedLogin || row.affectedUserId}</td>
                      <td>{row.reporterLogin || t('securityInbox.common.missing')}</td>
                      <td>
                        <select
                          className="security-inbox-assign"
                          value={row.assignedAdminId ?? ''}
                          onChange={(e) => assignTicket(row.id, e.target.value)}
                        >
                          <option value="">{t('securityInbox.assign.unassigned')}</option>
                          {admins.map((a) => (
                            <option key={a.id} value={a.id}>
                              {a.login}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="security-inbox-actions">
                        <div className="security-inbox-actions-stack">
                          <div className="security-inbox-actions-row security-inbox-actions-row--status-line">
                            <select
                              className="security-inbox-status-menu"
                              aria-label={t('securityInbox.actions.quickStatusAria')}
                              defaultValue=""
                              onChange={(e) => {
                                void handleStatusActionMenuChange(row.id, e);
                              }}
                            >
                              <option value="">{t('securityInbox.actions.statusMenu')}</option>
                              <option value="IN_PROGRESS">{t('securityInbox.actions.markInProgress')}</option>
                              <option value="RESOLVED">{t('securityInbox.actions.markResolved')}</option>
                              <option value="DISMISS">{t('securityInbox.actions.dismiss')}</option>
                            </select>
                            <button
                              type="button"
                              className="security-inbox-delete-bin"
                              onClick={() => setDeleteConfirmTicketId(row.id)}
                              aria-label={t('securityInbox.actions.deleteTicket')}
                              title={t('securityInbox.actions.deleteTicket')}
                            >
                              <img src="/icons/bin.png" alt="" width={22} height={22} />
                            </button>
                          </div>
                          <div className="security-inbox-actions-row security-inbox-actions-row--reset-line">
                            {row.affectedUserActive === false ? (
                              <button type="button" className="btn-secondary" onClick={() => quickAction(row.id, 'quick-unblock')}>
                                {t('securityInbox.actions.unblock')}
                              </button>
                            ) : (
                              <button type="button" className="btn-secondary security-inbox-danger" onClick={() => quickAction(row.id, 'quick-block')}>
                                {t('securityInbox.actions.block')}
                              </button>
                            )}
                            <button type="button" className="btn-secondary" onClick={() => quickAction(row.id, 'quick-force-password-reset')}>
                              {t('securityInbox.actions.forcePasswordReset')}
                            </button>
                          </div>
                        </div>
                      </td>
                    </tr>
                    {expandedId === row.id && (
                      <tr className="security-inbox-detail-row">
                        <td colSpan={8}>
                          <div className="security-inbox-detail">
                            <h4>{t('securityInbox.details.description')}</h4>
                            <pre className="security-inbox-description">{row.description}</pre>
                            <h4>{t('securityInbox.details.auditLog')}</h4>
                            {loadingAudits && !auditsByTicket[row.id] && <p>{t('securityInbox.details.loadingAudit')}</p>}
                            <ul className="security-inbox-audit-list">
                              {(auditsByTicket[row.id] || []).map((a) => (
                                <li key={a.id}>
                                  <time dateTime={a.createdAt}>{a.createdAt ? new Date(a.createdAt).toLocaleString('pl-PL') : ''}</time>
                                  {' — '}
                                  {a.actorLogin ? `${a.actorLogin}: ` : `${t('securityInbox.details.system')}: `}
                                  {a.message}
                                </li>
                              ))}
                            </ul>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
      {deleteConfirmTicketId != null && (
        <div
          className="settings-report-overlay"
          role="dialog"
          aria-modal="true"
          aria-labelledby="security-delete-title"
          onClick={() => !isDeletingTicket && setDeleteConfirmTicketId(null)}
        >
          <div className="settings-report-dialog" onClick={(e) => e.stopPropagation()}>
            <h4 id="security-delete-title">{t('securityInbox.delete.confirmTitle')}</h4>
            <div className="settings-report-actions">
              <button
                type="button"
                className="btn-secondary"
                onClick={() => !isDeletingTicket && setDeleteConfirmTicketId(null)}
                disabled={isDeletingTicket}
              >
                {t('securityInbox.common.no')}
              </button>
              <button type="button" className="btn-new-event" onClick={confirmDeleteTicket} disabled={isDeletingTicket}>
                {isDeletingTicket ? t('securityInbox.delete.deleting') : t('securityInbox.common.yes')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SecurityInboxPage;
