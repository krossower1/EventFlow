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
  loading,
  walletBalance
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

  const totalPrice = selectedBilet ? (selectedBilet.cena * (zakupForm.ilosc || 1)) : 0;
  const balanceAfterPurchase = walletBalance !== null ? (walletBalance - totalPrice) : null;
  const canAfford = walletBalance !== null && walletBalance >= totalPrice;

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
                width={500}
                height={292}
                baseScale={0.69}
              />
              <input type="hidden" name="seatId" value={zakupForm.seatId || ''} />
            </>
          )}

          <div className="wallet-info-section">
            <div className="wallet-balance-display">
              <span>Stan portfela: </span>
              <span className="wallet-balance-amount">{walletBalance !== null ? walletBalance.toFixed(2) + ' PLN' : 'Ładowanie...'}</span>
            </div>
            {selectedBilet && (
              <div className="wallet-purchase-info">
                <div className="wallet-total-price">
                  <span>Kwota zakupu: </span>
                  <span className="wallet-price-amount">{totalPrice.toFixed(2)} PLN</span>
                </div>
                {walletBalance !== null && (
                  <div className={`wallet-balance-after ${canAfford ? 'is-sufficient' : 'is-insufficient'}`}>
                    <span>Stan po zakupie: </span>
                    <span className="wallet-balance-after-amount">{balanceAfterPurchase.toFixed(2)} PLN</span>
                  </div>
                )}
                {!canAfford && walletBalance !== null && (
                  <p className="wallet-insufficient-funds">Niewystarczające środki w portfelu!</p>
                )}
              </div>
            )}
          </div>

          <label htmlFor="zakup-potwierdzenie">
            <input
              id="zakup-potwierdzenie"
              type="checkbox"
              checked={zakupForm.potwierdzPlatnosc}
              onChange={(event) => setZakupForm((prev) => ({ ...prev, potwierdzPlatnosc: event.target.checked }))}
            />
            {t('purchase.confirmTestPayment')}
          </label>

          <button type="submit" disabled={loading || dostepneBilety.length === 0 || (selectedBilet?.requiresSeatSelection && (selectedBilet.kategoriaBiletu || 'miejscówka') === 'miejscówka' && !zakupForm.seatId) || !canAfford}>
            {t('purchase.submit')}
          </button>
        </form>
      </div>
    </div>
  );
};

export default PurchaseModal;
