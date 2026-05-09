import React from 'react';
import SeatPlanMap from './SeatPlanMap';

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
  const seatClassById = dostepneBilety.reduce((acc, bilet) => {
    (bilet.assignedSeatIds || []).forEach((seatId) => {
      acc[seatId] = bilet.klasa;
    });
    return acc;
  }, {});
  const selectableSeatIds = new Set(selectedBilet?.assignedSeatIds || []);

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
              <p>Wybierz wolne miejsce przypisane do tej klasy biletu.</p>
              <SeatPlanMap
                seats={seats}
                seatClassById={seatClassById}
                occupiedSeatIds={occupiedSeatIds}
                activeSeatId={zakupForm.seatId}
                selectableSeatIds={selectableSeatIds}
                onSeatClick={(seatId) => setZakupForm({ ...zakupForm, seatId, ilosc: '1' })}
                showLegend
              />
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
