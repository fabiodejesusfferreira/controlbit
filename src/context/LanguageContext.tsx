import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Language, translations, TranslationKey } from '../i18n/translations';

const LANGUAGE_STORAGE_KEY = '@controlbit:language';

interface LanguageContextData {
    language: Language;
    setLanguage: (lang: Language) => Promise<void>;
    t: (key: TranslationKey) => string;
}

const LanguageContext = createContext<LanguageContextData>({} as LanguageContextData);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [language, setLanguageState] = useState<Language>('pt');

    useEffect(() => {
        AsyncStorage.getItem(LANGUAGE_STORAGE_KEY).then((stored) => {
            if (stored === 'pt' || stored === 'es' || stored === 'en') {
                setLanguageState(stored);
            }
        });
    }, []);

    const setLanguage = useCallback(async (lang: Language) => {
        setLanguageState(lang);
        await AsyncStorage.setItem(LANGUAGE_STORAGE_KEY, lang);
    }, []);

    const t = useCallback(
        (key: TranslationKey): string => {
            return translations[language][key] ?? key;
        },
        [language],
    );

    return (
        <LanguageContext.Provider value={{ language, setLanguage, t }}>
            {children}
        </LanguageContext.Provider>
    );
};

export const useLanguage = () => {
    const ctx = useContext(LanguageContext);
    if (!ctx) throw new Error('useLanguage must be used within LanguageProvider');
    return ctx;
};
