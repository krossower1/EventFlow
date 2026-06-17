import React from 'react';

const TicketProgress = ({ postepy = [] }) => {
  if (!postepy || postepy.length === 0) return null;

  return (
    <div className="ticket-progress-list">
      {postepy.map((postep) => {
        const wszystkie = postep.wszystkie || 0;
        const sprzedane = postep.sprzedane || 0;
        const percentage = wszystkie > 0 ? Math.min((sprzedane / wszystkie) * 100, 100) : 0;
        const kategoriaBiletu = postep.kategoriaBiletu || 'miejscówka';
        const isMiejscowka = kategoriaBiletu.toLowerCase() === 'miejscówka';
        const displayName = isMiejscowka 
          ? `${postep.klasa} (${kategoriaBiletu.charAt(0).toUpperCase() + kategoriaBiletu.slice(1)})`
          : postep.klasa;

        return (
          <div key={postep.biletId || postep.klasa} className="ticket-progress-item">
            <div className="ticket-progress-meta">
              <span>{displayName}</span>
              <span>{sprzedane}/{wszystkie}</span>
            </div>
            <div className="ticket-progress-bar">
              <span className="ticket-progress-fill" style={{ width: `${percentage}%` }} />
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default TicketProgress;