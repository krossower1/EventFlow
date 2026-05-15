import React from 'react';

const CANVAS_WIDTH = 720;
const CANVAS_HEIGHT = 420;
const PADDING = 24;

const getSeatTone = (seatClass) => {
  const normalized = String(seatClass || '').trim().toLowerCase();
  if (!normalized) return 'is-unassigned';
  if (normalized.includes('vip')) return 'is-vip';
  if (normalized.includes('standard')) return 'is-standard';
  return 'is-other';
};

const getSeatSize = (seat) => {
  const rotation = seat?.rotation || 0;
  if (rotation === 45 || rotation === 135 || rotation === 225 || rotation === 315) {
    // For 45-degree rotations, scale down so the rotated seat appears the same size
    // The diagonal of a square with side s is s * sqrt(2)
    // To make the diagonal equal to 36, we use 36 / sqrt(2)
    const scaledSize = 36 / Math.sqrt(2);
    const diagonal = Math.sqrt(scaledSize * scaledSize + scaledSize * scaledSize);
    return { width: diagonal, height: diagonal };
  } else {
    return { width: 36, height: 36 };
  }
};

const normalizeSeats = (seats) => {
  if (!Array.isArray(seats) || seats.length === 0) {
    return [];
  }

  const bounds = seats.reduce((acc, seat) => {
    const size = getSeatSize(seat);
    return {
      minX: Math.min(acc.minX, Number(seat.x) || 0),
      minY: Math.min(acc.minY, Number(seat.y) || 0),
      maxX: Math.max(acc.maxX, (Number(seat.x) || 0) + size.width),
      maxY: Math.max(acc.maxY, (Number(seat.y) || 0) + size.height)
    };
  }, {
    minX: Number.POSITIVE_INFINITY,
    minY: Number.POSITIVE_INFINITY,
    maxX: Number.NEGATIVE_INFINITY,
    maxY: Number.NEGATIVE_INFINITY
  });

  const contentWidth = Math.max(bounds.maxX - bounds.minX, 1);
  const contentHeight = Math.max(bounds.maxY - bounds.minY, 1);
  const scale = Math.min(
    1,
    (CANVAS_WIDTH - PADDING * 2) / contentWidth,
    (CANVAS_HEIGHT - PADDING * 2) / contentHeight
  );
  const offsetX = (CANVAS_WIDTH - contentWidth * scale) / 2;
  const offsetY = (CANVAS_HEIGHT - contentHeight * scale) / 2;

  return seats.map((seat) => {
    const size = getSeatSize(seat);
    return {
      ...seat,
      renderX: (Number(seat.x) - bounds.minX) * scale + offsetX,
      renderY: (Number(seat.y) - bounds.minY) * scale + offsetY,
      renderWidth: size.width * scale,
      renderHeight: size.height * scale
    };
  });
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
}) => {
  const normalizedSeats = normalizeSeats(seats);

  return (
    <div className="seat-plan-layout">
      <div className="purchase-seat-map">
        {normalizedSeats.map((seat, index) => {
          const occupied = occupiedSeatIds.includes(seat.id);
          const selected = activeSeatId === seat.id || selectedSeatIds.includes(seat.id);
          const selectable = !selectableSeatIds || selectableSeatIds.has(seat.id) || selected;
          const clickable = Boolean(onSeatClick) && selectable && !occupied;
          return (
            <button
              key={seat.id || index}
              type="button"
              className={`purchase-seat ${getSeatTone(seatClassById?.[seat.id])} ${occupied ? 'is-occupied' : ''} ${selected ? 'is-selected' : ''} ${Boolean(onSeatClick) && !clickable ? 'is-disabled' : ''}`}
              style={{
                left: seat.renderX,
                top: seat.renderY,
                width: seat.renderWidth,
                height: seat.renderHeight,
                transform: `rotate(${seat.rotation || 0}deg)`
              }}
              disabled={Boolean(onSeatClick) ? !clickable : false}
              onClick={() => onSeatClick?.(seat.id)}
            >
              {index + 1}
            </button>
          );
        })}
      </div>
      {showLegend && (
        <div className="seat-plan-legend">
          <div><span className="seat-plan-legend-swatch is-occupied" /> Zajęte</div>
          <div><span className="seat-plan-legend-swatch is-vip" /> VIP</div>
          <div><span className="seat-plan-legend-swatch is-standard" /> Standard</div>
          <div><span className="seat-plan-legend-swatch is-other" /> Inne</div>
        </div>
      )}
    </div>
  );
};

export default SeatPlanMap;
