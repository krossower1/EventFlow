import React from 'react';
import TicketProgress from './TicketProgress';

const WydarzenieCard = ({ item, currentUserRole, onMoreInfo, onPurchase }) => {
  const isUser = currentUserRole === 'USER';

  return (
    <article className="event-card">
      <span className="event-badge">{(item.status || 'aktywne').toLowerCase()}</span>
      <h3>{item.tytul}</h3>
      <div className="event-card-grid">
        <div className="event-card-column event-card-column--labels">
          <div className="event-card-row"><strong>Nazwa</strong></div>
          <div className="event-card-row"><strong>Od</strong></div>
          <div className="event-card-row"><strong>Do</strong></div>
          <div className="event-card-row"><strong>Kategoria</strong></div>
        </div>
        <div className="event-card-column event-card-column--values">
          <div className="event-card-row">{item.miejsceNazwa}</div>
          <div className="event-card-row">{item.dataRozp ? new Date(item.dataRozp).toLocaleString() : '-'}</div>
          <div className="event-card-row">{item.dataZamk ? new Date(item.dataZamk).toLocaleString() : '-'}</div>
          <div className="event-card-row">{item.kategoriaNazwa}</div>
        </div>
      </div>
      <TicketProgress postepy={item.postepyBiletow} />
      <button
        type="button"
        className="btn-secondary"
        onClick={() => onMoreInfo(item.id)}
      >
        Więcej informacji
      </button>
      <button 
        type="button" 
        className="btn-new-event" 
        disabled={!isUser || !item.maDostepneBilety}
        onClick={() => onPurchase(item)}
      >
        Zakup
      </button>
    </article>
  );
};

export default WydarzenieCard;