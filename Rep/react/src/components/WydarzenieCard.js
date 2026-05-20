import React, { useContext, useEffect, useMemo, useState } from 'react';
import TicketProgress from './TicketProgress';
import { getEventHeroImageUrl } from '../hash_zdjec/eventHeroImage';
import { AuthContext } from '../context/AuthContext';
import {
  addObservedEvent,
  ensureObservedLoaded,
  isEventObserved,
  isEventStatusActive,
  OBSERVED_EVENTS_CHANGED,
} from '../utils/obserwowaneWydarzenia';

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

/** Ikona gwiazdki na karcie wydarzenia (pusta = można dodać, wypełniona = już obserwowane). */
const ObserveStarIcon = ({ filled }) => (
  <svg
    className="event-card-observe-icon"
    viewBox="0 0 24 24"
    width={22}
    height={22}
    aria-hidden="true"
  >
    <path
      d="M12 2.5l2.55 5.17 5.7.83-4.12 4.02.97 5.68L12 15.9l-5.1 2.68.97-5.68-4.12-4.02 5.7-.83L12 2.5z"
      fill={filled ? 'currentColor' : 'none'}
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinejoin="round"
    />
  </svg>
);

const WydarzenieCard = ({ item, currentUserRole, onMoreInfo, onPersonel, onPurchase }) => {
  const { currentUser, authCredentials } = useContext(AuthContext);
  const heroImageUrl = useMemo(
    () => getEventHeroImageUrl(item.id ?? item.tytul),
    [item.id, item.tytul],
  );

  const isUser = currentUserRole === 'USER';
  const isActive = isEventStatusActive(item.status);
  const [isObserved, setIsObserved] = useState(false);
  const [isObserving, setIsObserving] = useState(false);

  // Jednorazowe załadowanie cache obserwowanych (współdzielone między kartami) i ustawienie stanu gwiazdki.
  useEffect(() => {
    if (!isUser || !currentUser?.id) {
      setIsObserved(false);
      return undefined;
    }
    let cancelled = false;
    ensureObservedLoaded(authCredentials, currentUser.id)
      .then(() => {
        if (!cancelled) setIsObserved(isEventObserved(item.id));
      })
      .catch(() => {
        if (!cancelled) setIsObserved(false);
      });
    return () => { cancelled = true; };
  }, [isUser, currentUser?.id, item.id, authCredentials]);

  // Po dodaniu/usunięciu obserwowania na innej karcie lub w ustawieniach — zsynchronizuj gwiazdkę.
  useEffect(() => {
    const syncObserved = (event) => {
      if (event.detail?.userId != null && event.detail.userId !== currentUser?.id) return;
      setIsObserved(isEventObserved(item.id));
    };
    window.addEventListener(OBSERVED_EVENTS_CHANGED, syncObserved);
    return () => window.removeEventListener(OBSERVED_EVENTS_CHANGED, syncObserved);
  }, [currentUser?.id, item.id]);

  const observeDisabled = !isUser || !isActive || isObserved || isObserving;
  const observeTooltip = !isUser
    ? 'Dostępne tylko dla użytkownika USER'
    : !isActive
      ? 'Dostępne tylko dla wydarzeń o statusie aktywnym'
      : isObserved
        ? 'Wydarzenie jest już obserwowane'
        : 'Dodaj do obserwowanych';

  /** POST /api/obserwowane/{id} — tylko USER i wydarzenie AKTYWNE (warunki w observeDisabled). */
  const handleObserve = async () => {
    if (observeDisabled || !currentUser?.id) return;
    setIsObserving(true);
    try {
      const added = await addObservedEvent(authCredentials, currentUser.id, item);
      if (added) setIsObserved(true);
    } catch {
      // Stan pozostaje bez zmian; użytkownik może spróbować ponownie.
    } finally {
      setIsObserving(false);
    }
  };

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
        <span
          className={`permission-tooltip event-card-observe-wrap ${observeDisabled && observeTooltip ? 'has-tooltip' : ''}`}
          data-tooltip={observeTooltip}
        >
          <button
            type="button"
            className={`event-card-observe-btn ${isObserved ? 'is-observed' : ''}`}
            disabled={observeDisabled}
            aria-label={observeTooltip}
            onClick={handleObserve}
          >
            <ObserveStarIcon filled={isObserved} />
          </button>
        </span>
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
