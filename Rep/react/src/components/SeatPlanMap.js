import React from 'react';
import { useTranslation } from 'react-i18next';

const DEFAULT_CANVAS_WIDTH = 540;
const DEFAULT_CANVAS_HEIGHT = 315;
const PADDING = 12;
const DEFAULT_BASE_SCALE = 0.75;

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
    const scaledSize = 36 / Math.sqrt(2);
    const diagonal = Math.sqrt(scaledSize * scaledSize + scaledSize * scaledSize);
    return { width: diagonal, height: diagonal };
  } else {
    return { width: 36, height: 36 };
  }
};

const isSeatElement = (seat) => String(seat?.type || 'SEAT').toUpperCase() !== 'ROW';

const normalizeSeats = (seats, canvasWidth, canvasHeight, baseScale) => {
  if (!Array.isArray(seats) || seats.length === 0) {
    return [];
  }

  // Filter out rows (groups) - only show seats
  const seatsOnly = seats.filter(isSeatElement);
  if (seatsOnly.length === 0) {
    return [];
  }

  const bounds = seatsOnly.reduce((acc, seat) => {
    const size = getSeatSize(seat);
    const x = Number(seat.x) || 0;
    const y = Number(seat.y) || 0;
    
    return {
      minX: Math.min(acc.minX, x),
      minY: Math.min(acc.minY, y),
      maxX: Math.max(acc.maxX, x + size.width),
      maxY: Math.max(acc.maxY, y + size.height)
    };
  }, {
    minX: Number.POSITIVE_INFINITY,
    minY: Number.POSITIVE_INFINITY,
    maxX: Number.NEGATIVE_INFINITY,
    maxY: Number.NEGATIVE_INFINITY
  });

  const contentWidth = Math.max(1, bounds.maxX - bounds.minX);
  const contentHeight = Math.max(1, bounds.maxY - bounds.minY);
  
  // Move the top-left seat close to the canvas border and keep the whole layout together.
  const scale = Math.min(
    baseScale,
    (canvasWidth - PADDING * 2) / contentWidth,
    (canvasHeight - PADDING * 2) / contentHeight
  );
  const offsetX = PADDING - bounds.minX * scale;
  const offsetY = PADDING - bounds.minY * scale;

  return seatsOnly.map((seat) => {
    const size = getSeatSize(seat);
    const x = Number(seat.x) || 0;
    const y = Number(seat.y) || 0;
    return {
      ...seat,
      renderX: x * scale + offsetX,
      renderY: y * scale + offsetY,
      renderWidth: size.width * scale,
      renderHeight: size.height * scale
    };
  });
};

const SeatPlanMap = ({
  seats,
  rows = [],
  seatClassById,
  occupiedSeatIds = [],
  selectedSeatIds = [],
  activeSeatId = '',
  selectableSeatIds = null,
  onSeatClick,
  showLegend = false,
  width = DEFAULT_CANVAS_WIDTH,
  height = DEFAULT_CANVAS_HEIGHT,
  baseScale = DEFAULT_BASE_SCALE
}) => {
  const { t } = useTranslation();
  const normalizedSeats = normalizeSeats(seats, width, height, baseScale);

  const getSeatDisplayLabel = (seat) => {
    const fallbackLabel = (() => {
      if (seat.baseLabel && !String(seat.baseLabel).startsWith('seat-')) {
        return seat.baseLabel;
      }
      const index = seats.findIndex((item) => item.id === seat.id);
      return index >= 0 ? String(index + 1) : '?';
    })();

    // Find the row that contains this seat
    const row = rows.find((item) => {
      const rowWidth = Number(item.width) || 200;
      const rowHeight = Number(item.height) || 50;
      const centerX = seat.x + 18;
      const centerY = seat.y + 18;
      return centerX >= item.x
        && centerX <= item.x + rowWidth
        && centerY >= item.y
        && centerY <= item.y + rowHeight;
    });

    if (!row || !row.rowLabel) {
      return fallbackLabel;
    }

    // Find all seats in this row
    const seatsInRow = seats
      .filter((item) => {
        if (!isSeatElement(item)) return false;
        const centerX = item.x + 18;
        const centerY = item.y + 18;
        const rowWidth = Number(row.width) || 200;
        const rowHeight = Number(row.height) || 50;
        return centerX >= row.x
          && centerX <= row.x + rowWidth
          && centerY >= row.y
          && centerY <= row.y + rowHeight;
      })
      .sort((a, b) => a.x - b.x || a.y - b.y);

    const index = seatsInRow.findIndex((item) => item.id === seat.id);
    return index >= 0 ? `${row.rowLabel}${index + 1}` : fallbackLabel;
  };

  return (
    <div className="seat-plan-layout">
      <div className="purchase-seat-map" style={{ width, height }}>
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
              {getSeatDisplayLabel(seat)}
            </button>
          );
        })}
      </div>
      {showLegend && (
        <div className="seat-plan-legend">
          <div><span className="seat-plan-legend-swatch is-occupied" /> {t('seatPlan.legend.occupied')}</div>
          <div><span className="seat-plan-legend-swatch is-vip" /> {t('seatPlan.legend.vip')}</div>
          <div><span className="seat-plan-legend-swatch is-standard" /> {t('seatPlan.legend.standard')}</div>
          <div><span className="seat-plan-legend-swatch is-other" /> {t('seatPlan.legend.other')}</div>
        </div>
      )}
    </div>
  );
};

export default SeatPlanMap;
