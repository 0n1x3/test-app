'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import ru from '@/i18n/translations/ru.json';
import en from '@/i18n/translations/en.json';
import zh from '@/i18n/translations/zh.json';
import type { Language, Translation } from '@/types/i18n';

const translations: Record<Language, Translation> = { ru, en, zh };

interface I18nContextType {
  t: (key: string) => string;
  language: Language;
  setLanguage: (lang: Language) => void;
}

const I18nContext = createContext<I18nContextType | null>(null);

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>('ru');

  useEffect(() => {
    const savedLang = localStorage.getItem('language') as Language;
    if (savedLang && translations[savedLang]) {
      setLanguage(savedLang);
    }
  }, []);

  const t = (key: string) => {
    const keys = key.split('.');
    let value: any = translations[language];
    
    try {
      for (const k of keys) {
        if (value && typeof value === 'object' && k in value) {
          value = value[k];
        } else {
          console.warn(`Translation key not found: ${key}`);
          return key.split('.').pop() || key;
        }
      }
      
      return typeof value === 'string' ? value : key;
    } catch (error) {
      console.warn(`Error getting translation for key: ${key}`, error);
      return key;
    }
  };

  return (
    <I18nContext.Provider value={{ t, language, setLanguage }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useTranslation() {
  const locale = useLocale();
  
  const t = (key: string, params?: Record<string, any>) => {
    const translation = translations[locale][key] || key;
    
    if (!params) return translation;
    
    // Заменяем параметры в формате {{paramName}}
    return Object.entries(params).reduce(
      (result, [paramName, value]) => 
        result.replace(new RegExp(`{{${paramName}}}`, 'g'), String(value)),
      translation
    );
  };
  
  return { t };
} 