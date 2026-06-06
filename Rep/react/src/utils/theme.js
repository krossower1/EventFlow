export const THEME_STORAGE_KEY = 'eventflow-theme';

export const THEMES = ['default', 'dark', 'light'];

export const getStoredTheme = () => {
  try {
    const theme = localStorage.getItem(THEME_STORAGE_KEY);
    return THEMES.includes(theme) ? theme : 'default';
  } catch {
    return 'default';
  }
};

export const applyTheme = (theme) => {
  const resolved = THEMES.includes(theme) ? theme : 'default';
  document.documentElement.setAttribute('data-theme', resolved);
  return resolved;
};

export const setStoredTheme = (theme) => {
  const resolved = applyTheme(theme);
  try {
    localStorage.setItem(THEME_STORAGE_KEY, resolved);
  } catch {
    // localStorage may be unavailable
  }
  return resolved;
};

export const initTheme = () => applyTheme(getStoredTheme());
