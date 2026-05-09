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

  const selectedBilet = dostepneBilety.find((bilet) => String(bilet.biletId) === String(zakupForm.biletId));
  let seats = [];
  try {
    seats = selectedBilet?.salaPlanJson ? (JSON.parse(selectedBilet.salaPlanJson)?.seats || []) : [];
  } catch (error) {
    seats = [];
  }
  const occupiedSeatIds = selectedBilet?.occupiedSeatIds || [];

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
            onChange={(event) => setZakupForm({ ...zakupForm, biletId: event.target.value, seatId: '' })}
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
            disabled={Boolean(selectedBilet?.requiresSeatSelection)}
            required
          />

          {selectedBilet?.requiresSeatSelection && (
            <>
              <p>Wybierz wolne miejsce z planu sali.</p>
              <div className="purchase-seat-map">
                {seats.map((seat, index) => {
                  const occupied = occupiedSeatIds.includes(seat.id);
                  const selected = zakupForm.seatId === seat.id;
                  return (
                    <button
                      key={seat.id || index}
                      type="button"
                      className={`purchase-seat ${occupied ? 'is-occupied' : ''} ${selected ? 'is-selected' : ''}`}
                      style={{
                        left: seat.x,
                        top: seat.y,
                        width: seat.rotation === 90 ? 24 : 36,
                        height: seat.rotation === 90 ? 36 : 24,
                        transform: `rotate(${seat.rotation || 0}deg)`
                      }}
                      disabled={occupied}
                      onClick={() => setZakupForm({ ...zakupForm, seatId: seat.id, ilosc: '1' })}
                    >
                      {index + 1}
                    </button>
                  );
                })}
              </div>
            </>
          )}

          <label htmlFor="zakup-potwierdzenie">
            <input
              id="zakup-potwierdzenie"
              type="checkbox"
              checked={zakupForm.potwierdzPlatnosc}
              onChange={(event) => setZakupForm({ ...zakupForm, potwierdzPlatnosc: event.target.checked })}
            />
            Potwierdzam płatność testową
          </label>

          <button type="submit" disabled={loading || dostepneBilety.length === 0 || (selectedBilet?.requiresSeatSelection && !zakupForm.seatId)}>
            Finalizuj zakup
          </button>
        </form>
      </div>
    </div>
  );
};

export default PurchaseModal;
