import React, { createContext, useContext, useState, useEffect } from 'react';

interface TranslationContextProps {
  locale: string;
  setLocale: (locale: string) => void;
  t: (key: string, fallback?: string) => string;
  loading: boolean;
  refreshTranslations: () => Promise<void>;
}

const TranslationContext = createContext<TranslationContextProps | undefined>(undefined);

export const TranslationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [locale, setLocale] = useState<string>(() => localStorage.getItem('adminLocale') || 'en-US');
  const [dictionary, setDictionary] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState<boolean>(true);

  const fetchTranslations = async (currentLocale: string) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/translations/ADMIN_FRONT/ADMIN/${currentLocale}`);
      if (response.ok) {
        const data = await response.json();
        setDictionary(data);
      } else {
        console.error('Failed to fetch translations');
      }
    } catch (error) {
      console.error('Error fetching translations:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    localStorage.setItem('adminLocale', locale);
    fetchTranslations(locale);
  }, [locale]);

  const t = (key: string, fallback?: string): string => {
    return dictionary[key] || fallback || key;
  };

  return (
    <TranslationContext.Provider value={{ locale, setLocale, t, loading, refreshTranslations: () => fetchTranslations(locale) }}>
      {children}
    </TranslationContext.Provider>
  );
};

export const useTranslation = () => {
  const context = useContext(TranslationContext);
  if (!context) {
    throw new Error('useTranslation must be used within a TranslationProvider');
  }
  return context;
};
