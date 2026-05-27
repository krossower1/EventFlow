import React, { useContext, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
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
  <img
    src={filled ? '/icons/favorite (1).png' : '/icons/favorite.png'}
    alt=""
    width={22}
    height={22}
    className="event-card-observe-icon"
    aria-hidden
  />
);

const WydarzenieCard = ({ item, currentUserRole, onMoreInfo, onPersonel, onPurchase }) => {
  const { t } = useTranslation();
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
    ? t('events.tooltip.onlyUser')
    : !isActive
      ? t('eventsCard.observe.onlyActive')
      : isObserved
        ? t('eventsCard.observe.alreadyObserved')
        : t('eventsCard.observe.add');

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
    ? t('events.tooltip.onlyUser')
    : !item.maDostepneBilety
      ? t('eventsCard.purchase.noTickets')
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
            <strong>{t('eventsCard.labels.hall')}</strong>
          </div>
          <div className="event-card-row">
            <img src="/icons/building.png" alt="" width={22} height={22} />
            <strong>{t('eventsCard.labels.place')}</strong>
          </div>
          <div className="event-card-row">
            <img src="/icons/map.png" alt="" width={22} height={22} />
            <strong>{t('eventsCard.labels.address')}</strong>
          </div>
          <div className="event-card-row">
            <img src="/icons/calendar (1).png" alt="" width={22} height={22} />
            <strong>{t('eventsCard.labels.date')}</strong>
          </div>
          <div className="event-card-row">
            <img src="/icons/clock.png" alt="" width={22} height={22} />
            <strong>{t('eventsCard.labels.time')}</strong>
          </div>
          <div className="event-card-row">
            <img src="/icons/user.png" alt="" width={22} height={22} />
            <strong>{t('eventsCard.labels.creator')}</strong>
          </div>
          <div className="event-card-row">
            <img src="/icons/menu.png" alt="" width={22} height={22} />
            <strong>{t('eventsCard.labels.category')}</strong>
          </div>
        </div>
        <div className="event-card-column event-card-column--values">
          <div className="event-card-row">{item.salaNazwa || '-'}</div>
          <div className="event-card-row">{item.miejsceNazwa || '-'}</div>
          <div className="event-card-row">{item.ulica ? `${item.ulica}, ${item.kodPocztowy} ${item.miasto}` : '-'}</div>
          <div className="event-card-row">{formatEventDate(item.dataRozp)}</div>
          <div className="event-card-row">{formatEventTime(item.dataRozp)}</div>
          <div className="event-card-row">{item.creatorLogin || '-'}</div>
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
          {t('eventsCard.actions.moreInfo')}
        </button>
        {onPersonel ? (
          <span
            className={`permission-tooltip ${currentUserRole !== 'ORG' ? 'has-tooltip' : ''}`}
            data-tooltip={currentUserRole !== 'ORG' ? t('events.tooltip.onlyOrganizer') : ''}
          >
            <button
              type="button"
              className="btn-secondary"
              disabled={currentUserRole !== 'ORG'}
              onClick={() => onPersonel(item.id)}
            >
              {t('eventsCard.actions.personnel')}
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
            {t('eventsCard.actions.purchase')}
          </button>
        </span>
      </div>
    </article>
  );
};

export default WydarzenieCard;
