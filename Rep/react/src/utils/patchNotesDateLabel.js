const TODAY_SHORTCUTS = ['dzis', 'dziś', 'dzisiaj', 'today', 'teraz'];

export const formatTodayDateParts = () => {
  const today = new Date();
  return {
    day: String(today.getDate()).padStart(2, '0'),
    month: String(today.getMonth() + 1).padStart(2, '0'),
    year: String(today.getFullYear()),
  };
};

export const buildTodayDateLabel = () => {
  const { day, month, year } = formatTodayDateParts();
  return `Dzisiejsze zmiany ${day}.${month}.${year}`;
};

/** Odwzorowanie fn_patch_notes_etykieta_daty z MySQL. */
export const normalizePatchNotesDateLabel = (input) => {
  const trimmed = (input ?? '').trim();
  const todayLabel = buildTodayDateLabel();
  const { day, month, year } = formatTodayDateParts();
  const todayFormatted = `${day}.${month}.${year}`;

  if (!trimmed) {
    return todayLabel;
  }

  if (trimmed.toUpperCase() === 'CURDATE') {
    return todayLabel;
  }

  if (TODAY_SHORTCUTS.includes(trimmed.toLowerCase())) {
    return todayLabel;
  }

  if (trimmed === 'Dzisiejsze zmiany' || /^Dzisiejsze zmiany\s*$/i.test(trimmed)) {
    return todayLabel;
  }

  if (/CURDATE/i.test(trimmed)) {
    return trimmed.replace(/CURDATE/gi, todayFormatted);
  }

  return trimmed;
};

export const shouldAutoApplyDateLabel = (input) => {
  const trimmed = (input ?? '').trim();
  if (!trimmed) {
    return false;
  }

  if (trimmed.toUpperCase() === 'CURDATE') {
    return true;
  }

  if (TODAY_SHORTCUTS.includes(trimmed.toLowerCase())) {
    return true;
  }

  if (trimmed === 'Dzisiejsze zmiany' || /^Dzisiejsze zmiany\s*$/i.test(trimmed)) {
    return true;
  }

  if (/CURDATE/i.test(trimmed)) {
    return true;
  }

  return false;
};
