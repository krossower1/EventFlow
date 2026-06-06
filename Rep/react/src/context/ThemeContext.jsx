import React, { createContext, useContext, useState } from 'react';
import { getStoredTheme, setStoredTheme, THEMES } from '../utils/theme';

const ThemeContext = createContext(null);

export const ThemeProvider = ({ children }) => {
  const [theme, setThemeState] = useState(getStoredTheme);

  const setTheme = (nextTheme) => {
    if (!THEMES.includes(nextTheme)) return;
    const resolved = setStoredTheme(nextTheme);
    setThemeState(resolved);
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme, themes: THEMES }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
};
