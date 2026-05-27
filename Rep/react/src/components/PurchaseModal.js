import React from 'react';
import { useTranslation } from 'react-i18next';
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
  const { t } = useTranslation();
  if (!isOpen || !selectedEvent) return null;

  const selectedBilet = dostepneBilety.find((bilet) => String(bilet.biletId) === String(zakupForm.biletId));
  const seats = Array.isArray(selectedBilet?.salaSeats) ? selectedBilet.salaSeats : [];
  const rows = Array.isArray(selectedBilet?.salaSeats) ? selectedBilet.salaSeats.filter((item) => (item.type || 'SEAT') === 'ROW') : [];
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
      <div className="modal-card modal-card--w600">
        <div className="modal-header">
          <div className="modal-title">
            {t('purchase.modalTitle')} <span className="header-accent">{selectedEvent.tytul}</span>
          </div>
          <button
            type="button"
            className="modal-close"
            onClick={onClose}
            aria-label={t('events.common.close')}
          >
            ×
          </button>
        </div>

        <form onSubmit={onSubmit} className="auth-form organizer-form">
          <label htmlFor="zakup-bilet">{t('purchase.ticketClass')}</label>
          <select
            id="zakup-bilet"
            value={zakupForm.biletId}
            onChange={(event) => setZakupForm((prev) => ({ ...prev, biletId: event.target.value, seatId: '' }))}
            required
          >
            <option value="">{t('purchase.ticketClassSelect')}</option>
            {dostepneBilety.map((bilet) => (
              <option key={bilet.biletId} value={bilet.biletId}>
                {bilet.klasa} - {bilet.cena} {bilet.waluta} - dostępne: {bilet.ilosc || bilet.dostepnaIlosc}
              </option>
            ))}
          </select>

          <label htmlFor="zakup-ilosc">{t('purchase.quantity')}</label>
          <input
            id="zakup-ilosc"
            type="number"
            min="1"
            value={zakupForm.ilosc}
            onChange={(event) => setZakupForm((prev) => ({ ...prev, ilosc: event.target.value }))}
            disabled={Boolean(selectedBilet?.requiresSeatSelection) && (selectedBilet.kategoriaBiletu || 'miejscówka') === 'miejscówka'}
            required
          />

          {selectedBilet?.requiresSeatSelection && (selectedBilet.kategoriaBiletu || 'miejscówka') === 'miejscówka' && (
            <>
              <p>{t('purchase.seatPickHint')}</p>
              <SeatPlanMap
                seats={seats}
                rows={rows}
                seatClassById={seatClassById}
                occupiedSeatIds={occupiedSeatIds}
                activeSeatId={zakupForm.seatId}
                selectableSeatIds={selectableSeatIds}
                onSeatClick={(seatId) => setZakupForm((prev) => ({ ...prev, seatId, ilosc: '1' }))}
                showLegend
              />
              <input type="hidden" name="seatId" value={zakupForm.seatId || ''} />
            </>
          )}

          <label htmlFor="zakup-potwierdzenie">
            <input
              id="zakup-potwierdzenie"
              type="checkbox"
              checked={zakupForm.potwierdzPlatnosc}
              onChange={(event) => setZakupForm((prev) => ({ ...prev, potwierdzPlatnosc: event.target.checked }))}
            />
            {t('purchase.confirmTestPayment')}
          </label>

          <button type="submit" disabled={loading || dostepneBilety.length === 0 || (selectedBilet?.requiresSeatSelection && (selectedBilet.kategoriaBiletu || 'miejscówka') === 'miejscówka' && !zakupForm.seatId)}>
            {t('purchase.submit')}
          </button>
        </form>
      </div>
    </div>
  );
};

export default PurchaseModal;
