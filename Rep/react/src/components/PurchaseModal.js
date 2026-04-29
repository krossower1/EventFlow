import React from 'react';

const PurchaseModal = ({
  isOpen,
  onClose,
  selectedEvent,
  dostepneBilety,
  zakupForm,
  setZakupForm,
  onSubmit,
  loading
}) => {
  if (!isOpen || !selectedEvent) return null;

  return (
    <div
      className="modal-overlay"
      role="dialog"
      aria-modal="true"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="modal-card">
        <div className="modal-header">
          <div className="modal-title">
            Zakup biletów: <span className="header-accent">{selectedEvent.tytul}</span>
          </div>
          <button
            type="button"
            className="modal-close"
            onClick={onClose}
            aria-label="Zamknij"
          >
            ×
          </button>
        </div>

        <form onSubmit={onSubmit} className="auth-form organizer-form">
          <label htmlFor="zakup-bilet">Klasa biletu</label>
          <select
            id="zakup-bilet"
            value={zakupForm.biletId}
            onChange={(event) => setZakupForm({ ...zakupForm, biletId: event.target.value })}
            required
          >
            <option value="">Wybierz klasę biletu</option>
            {dostepneBilety.map((bilet) => (
              <option key={bilet.biletId} value={bilet.biletId}>
                {bilet.klasa} - {bilet.cena} {bilet.waluta} - dostępne: {bilet.ilosc || bilet.dostepnaIlosc}
              </option>
            ))}
          </select>

          <label htmlFor="zakup-ilosc">Ilość</label>
          <input
            id="zakup-ilosc"
            type="number"
            min="1"
            value={zakupForm.ilosc}
            onChange={(event) => setZakupForm({ ...zakupForm, ilosc: event.target.value })}
            required
          />

          <label htmlFor="zakup-potwierdzenie">
            <input
              id="zakup-potwierdzenie"
              type="checkbox"
              checked={zakupForm.potwierdzPlatnosc}
              onChange={(event) => setZakupForm({ ...zakupForm, potwierdzPlatnosc: event.target.checked })}
            />
            Potwierdzam płatność testową
          </label>

          <button type="submit" disabled={loading || dostepneBilety.length === 0}>
            Finalizuj zakup
          </button>
        </form>
      </div>
    </div>
  );
};

export default PurchaseModal;