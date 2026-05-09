import React from 'react';

const getSeatTone = (seatClass) => {
  const normalized = String(seatClass || '').trim().toLowerCase();
  if (!normalized) return 'is-unassigned';
  if (normalized.includes('vip')) return 'is-vip';
  if (normalized.includes('standard')) return 'is-standard';
  return 'is-other';
};

const SeatPlanMap = ({
  seats,
  seatClassById,
  occupiedSeatIds = [],
  selectedSeatIds = [],
  activeSeatId = '',
  selectableSeatIds = null,
  onSeatClick,
  showLegend = false
}) => (
  <div className="seat-plan-layout">
    <div className="purchase-seat-map">
      {seats.map((seat, index) => {
        const occupied = occupiedSeatIds.includes(seat.id);
        const selected = activeSeatId === seat.id || selectedSeatIds.includes(seat.id);
        const selectable = !selectableSeatIds || selectableSeatIds.has(seat.id) || selected;
        const clickable = Boolean(onSeatClick) && selectable && !occupied;
        return (
          <button
            key={seat.id || index}
            type="button"
            className={`purchase-seat ${getSeatTone(seatClassById?.[seat.id])} ${occupied ? 'is-occupied' : ''} ${selected ? 'is-selected' : ''} ${!clickable ? 'is-disabled' : ''}`}
            style={{
              left: seat.x,
              top: seat.y,
              width: seat.rotation === 90 ? 24 : 36,
              height: seat.rotation === 90 ? 36 : 24,
              transform: `rotate(${seat.rotation || 0}deg)`
            }}
            disabled={!clickable}
            onClick={() => onSeatClick?.(seat.id)}
          >
            {index + 1}
          </button>
        );
      })}
    </div>
    {showLegend && (
      <div className="seat-plan-legend">
        <div><span className="seat-plan-legend-swatch is-occupied" /> Zajete</div>
        <div><span className="seat-plan-legend-swatch is-vip" /> VIP</div>
        <div><span className="seat-plan-legend-swatch is-standard" /> Standard</div>
        <div><span className="seat-plan-legend-swatch is-other" /> Inne</div>
      </div>
    )}
  </div>
);

export default SeatPlanMap;
