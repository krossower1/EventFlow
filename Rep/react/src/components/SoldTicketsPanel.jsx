import React, { useCallback, useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { useTranslation } from 'react-i18next';

const SoldTicketsPanel = ({ API_BASE_URL, getRequestConfig, setStatus }) => {
  const { t } = useTranslation();
  const [soldTickets, setSoldTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterSearch, setFilterSearch] = useState('');
  const [filterEvent, setFilterEvent] = useState('');
  const [filterClass, setFilterClass] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  const fetchSoldTickets = useCallback(async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/bilety/sold`, getRequestConfig());
      setSoldTickets(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      setStatus({ type: 'error', message: t('tickets.sold.fetchError') });
      setSoldTickets([]);
    } finally {
      setLoading(false);
    }
  }, [API_BASE_URL, getRequestConfig, setStatus, t]);

  useEffect(() => {
    fetchSoldTickets();
  }, [fetchSoldTickets]);

  const eventOptions = useMemo(() => {
    const titles = [...new Set(soldTickets.map((item) => item.wydarzenieTytul).filter(Boolean))];
    return titles.sort((a, b) => a.localeCompare(b, 'pl'));
  }, [soldTickets]);

  const classOptions = useMemo(() => {
    const classes = [...new Set(soldTickets.map((item) => item.klasa).filter(Boolean))];
    return classes.sort((a, b) => a.localeCompare(b, 'pl'));
  }, [soldTickets]);

  const statusOptions = useMemo(() => {
    const statuses = [...new Set(soldTickets.map((item) => item.stan).filter(Boolean))];
    return statuses.sort((a, b) => a.localeCompare(b, 'pl'));
  }, [soldTickets]);

  const filteredTickets = useMemo(() => {
    const search = filterSearch.trim().toLowerCase();
    return soldTickets.filter((ticket) => {
      if (filterEvent && ticket.wydarzenieTytul !== filterEvent) return false;
      if (filterClass && ticket.klasa !== filterClass) return false;
      if (filterStatus && ticket.stan !== filterStatus) return false;
      if (!search) return true;
      const fullName = `${ticket.imie || ''} ${ticket.nazwisko || ''}`.trim().toLowerCase();
      return fullName.includes(search)
        || String(ticket.imie || '').toLowerCase().includes(search)
        || String(ticket.nazwisko || '').toLowerCase().includes(search);
    });
  }, [soldTickets, filterSearch, filterEvent, filterClass, filterStatus]);

  const formatPrice = (ticket) => {
    if (ticket.cena == null) return '-';
    return `${ticket.cena} ${ticket.waluta || 'PLN'}`;
  };

  return (
    <div>
      <h3>{t('tickets.sold.title')}</h3>
      <p>{t('tickets.sold.lead')}</p>

      <div className="security-inbox-filters">
        <label>
          {t('tickets.sold.filters.search')}
          <input
            type="text"
            value={filterSearch}
            onChange={(e) => setFilterSearch(e.target.value)}
            placeholder={t('tickets.sold.filters.searchPlaceholder')}
          />
        </label>
        <label>
          {t('tickets.sold.filters.event')}
          <select value={filterEvent} onChange={(e) => setFilterEvent(e.target.value)}>
            <option value="">{t('tickets.sold.filters.all')}</option>
            {eventOptions.map((title) => (
              <option key={title} value={title}>{title}</option>
            ))}
          </select>
        </label>
        <label>
          {t('tickets.sold.filters.class')}
          <select value={filterClass} onChange={(e) => setFilterClass(e.target.value)}>
            <option value="">{t('tickets.sold.filters.all')}</option>
            {classOptions.map((klasa) => (
              <option key={klasa} value={klasa}>{klasa}</option>
            ))}
          </select>
        </label>
        <label>
          {t('tickets.sold.filters.status')}
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
            <option value="">{t('tickets.sold.filters.all')}</option>
            {statusOptions.map((stan) => (
              <option key={stan} value={stan}>{stan}</option>
            ))}
          </select>
        </label>
      </div>

      {loading && <p>{t('tickets.sold.loading')}</p>}

      {!loading && (
        <table className="participants-table">
          <thead>
            <tr>
              <th>{t('tickets.sold.table.firstName')}</th>
              <th>{t('tickets.sold.table.lastName')}</th>
              <th>{t('tickets.sold.table.event')}</th>
              <th>{t('tickets.sold.table.type')}</th>
              <th>{t('tickets.sold.table.price')}</th>
              <th>{t('tickets.sold.table.identifier')}</th>
            </tr>
          </thead>
          <tbody>
            {filteredTickets.length > 0 ? filteredTickets.map((ticket) => (
              <tr key={ticket.id}>
                <td>{ticket.imie || '-'}</td>
                <td>{ticket.nazwisko || '-'}</td>
                <td>{ticket.wydarzenieTytul || '-'}</td>
                <td>{ticket.klasa || '-'}</td>
                <td>{formatPrice(ticket)}</td>
                <td>{ticket.kod || '-'}</td>
              </tr>
            )) : (
              <tr>
                <td colSpan={6}>{t('tickets.sold.empty')}</td>
              </tr>
            )}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default SoldTicketsPanel;
