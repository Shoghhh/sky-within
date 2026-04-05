import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { colors } from '../constants/theme';
import { api } from './api';
import { useAuth } from './auth';

export type ThemeMode = 'light' | 'dark';

interface PreferencesContextType {
  theme: ThemeMode;
  language: string;
  colors: typeof colors.light;
  refreshPreferences: () => Promise<void>;
  /** Full-screen overlay while app content reloads after a language change from Profile. */
  languageContentLoading: boolean;
  setLanguageContentLoading: (loading: boolean) => void;
}

const PreferencesContext = createContext<PreferencesContextType | null>(null);

export function PreferencesProvider({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  const [theme, setTheme] = useState<ThemeMode>('light');
  const [language, setLanguage] = useState('en');
  const [languageContentLoading, setLanguageContentLoading] = useState(false);

  const refreshPreferences = useCallback(async () => {
    try {
      const profile = await api.user.getProfile();
      if (profile.preferences?.theme === 'dark' || profile.preferences?.theme === 'light') {
        setTheme(profile.preferences.theme);
      }
      if (profile.preferences?.language) {
        setLanguage(profile.preferences.language);
      }
    } catch {
      // Not logged in or fetch failed - keep current values
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      refreshPreferences();
    } else {
      setTheme('light');
      setLanguage('en');
    }
  }, [isAuthenticated, refreshPreferences]);

  const palette: typeof colors.light = theme === 'dark' ? colors.dark : colors.light;

  return (
    <PreferencesContext.Provider
      value={{
        theme,
        language,
        colors: palette,
        refreshPreferences,
        languageContentLoading,
        setLanguageContentLoading,
      }}
    >
      {children}
    </PreferencesContext.Provider>
  );
}

export function usePreferences() {
  const ctx = useContext(PreferencesContext);
  if (!ctx) throw new Error('usePreferences must be used within PreferencesProvider');
  return ctx;
}
