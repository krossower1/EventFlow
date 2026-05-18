import React, { useMemo } from 'react';
import TicketProgress from './TicketProgress';
import { getEventHeroImageUrl } from '../hash_zdjec/eventHeroImage';

const formatEventDate = (value) => {
  if (!value) return '-';
  return new Date(value).toLocaleDateString('pl-PL', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
};

const formatEventTime = (value) => {
  if (!value) return '-';
  return new Date(value).toLocaleTimeString('pl-PL', {
    hour: '2-digit',
    minute: '2-digit',
  });
};

const WydarzenieCard = ({ item, currentUserRole, onMoreInfo, onPersonel, onPurchase }) => {
  const heroImageUrl = useMemo(
    () => getEventHeroImageUrl(item.id ?? item.tytul),
    [item.id, item.tytul],
  );

  const isUser = currentUserRole === 'USER';
  const zakupDisabled = !isUser || !item.maDostepneBilety;
  const zakupTooltip = !isUser
    ? 'Dostępne tylko dla użytkownika USER'
    : !item.maDostepneBilety
      ? 'Brak dostępnych biletów'
      : '';

  return (
    <article className="event-card">
      <div
        className="event-card-hero"
        style={heroImageUrl ? { backgroundImage: `url(${heroImageUrl})` } : undefined}
      >
        <span className="event-badge">{(item.status || 'aktywne').toLowerCase()}</span>
        <h3>{item.tytul}</h3>
      </div>
      <div className="event-card-grid">
        <div className="event-card-column event-card-column--labels">
          <div className="event-card-row">
            <img src="/icons/location.png" alt="" width={22} height={22} />
            <strong>Sala:</strong>
          </div>
          <div className="event-card-row">
            <img src="/icons/calendar (1).png" alt="" width={22} height={22} />
            <strong>Data:</strong>
          </div>
          <div className="event-card-row">
            <img src="/icons/clock.png" alt="" width={22} height={22} />
            <strong>Czas:</strong>
          </div>
          <div className="event-card-row">
            <img src="/icons/menu.png" alt="" width={22} height={22} />
            <strong>Kategoria:</strong>
          </div>
        </div>
        <div className="event-card-column event-card-column--values">
          <div className="event-card-row">{item.salaNazwa || '-'}</div>
          <div className="event-card-row">{formatEventDate(item.dataRozp)}</div>
          <div className="event-card-row">{formatEventTime(item.dataRozp)}</div>
          <div className="event-card-row">{item.kategoriaNazwa || '-'}</div>
        </div>
      </div>
      <TicketProgress postepy={item.postepyBiletow} />
      <div className="event-card-actions">
        <button
          type="button"
          className="btn-secondary"
          onClick={() => onMoreInfo(item.id)}
        >
          Więcej informacji
        </button>
        {onPersonel ? (
          <span
            className={`permission-tooltip ${currentUserRole !== 'ORG' ? 'has-tooltip' : ''}`}
            data-tooltip={currentUserRole !== 'ORG' ? 'Dostępne tylko dla organizatora' : ''}
          >
            <button
              type="button"
              className="btn-secondary"
              disabled={currentUserRole !== 'ORG'}
              onClick={() => onPersonel(item.id)}
            >
              Personel
            </button>
          </span>
        ) : null}
        <span
          className={`permission-tooltip event-card-actions__purchase-wrap ${zakupDisabled && zakupTooltip ? 'has-tooltip' : ''}`}
          data-tooltip={zakupTooltip}
        >
          <button
            type="button"
            className="btn-new-event event-card-actions__purchase"
            disabled={zakupDisabled}
            onClick={() => onPurchase(item)}
          >
            Zakup
          </button>
        </span>
      </div>
    </article>
  );
};

export default WydarzenieCard;
