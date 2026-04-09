import React, { createContext, useContext, useState, useEffect } from 'react';

const translations = {
  en: {
    nav: { dashboard: 'Overview', map: 'Live Map', volunteers: 'Directory', ingest: 'Ingest', analytics: 'Insights' },
    auth: { login: 'Sign in', google: 'Continue with Google', subtitle: 'Global Resource Allocation Network' },
    dash: { totalNeeds: 'Total Active Needs', active: 'Critical Alerts', volunteers: 'Available Personnel', matched: 'Success Rate' },
    status: { critical: 'Critical', high: 'High', medium: 'Medium', resolved: 'Resolved', open: 'Open', assigned: 'Assigned', done: 'Done' },
    actions: { search: 'Search resources...', filter: 'Filter', add: 'New Entry', upload: 'Select File', submit: 'Process Data' },
    ingest: { title: 'Data Ingestion', dropzone: 'Drop unstructured data or files here', manual: 'Manual', image: 'Image', text: 'Text Stream' }
  },
  hi: {
    nav: { dashboard: 'अवलोकन', map: 'लाइव मैप', volunteers: 'निर्देशिका', ingest: 'डेटा दर्ज करें', analytics: 'इनसाइट्स' },
    auth: { login: 'साइन इन करें', google: 'Google के साथ जारी रखें', subtitle: 'वैश्विक संसाधन आवंटन नेटवर्क' },
    dash: { totalNeeds: 'कुल सक्रिय ज़रूरतें', active: 'महत्वपूर्ण अलर्ट', volunteers: 'उपलब्ध कर्मचारी', matched: 'सफलता दर' },
    status: { critical: 'गंभीर', high: 'उच्च', medium: 'मध्यम', resolved: 'हल हो गया', open: 'खुला', assigned: 'नियुक्त', done: 'पूर्ण' },
    actions: { search: 'खोजें...', filter: 'फ़िल्टर', add: 'नया जोड़ें', upload: 'फ़ाइल चुनें', submit: 'प्रोसेस करें' },
    ingest: { title: 'डेटा प्रविष्टि', dropzone: 'डेटा या फ़ाइलें यहाँ छोड़ें', manual: 'मैन्युअल', image: 'छवि', text: 'टेक्स्ट' }
  }
};

const I18nContext = createContext();

export const useTranslation = () => useContext(I18nContext);

export function I18nProvider({ children }) {
  const [lang, setLang] = useState(localStorage.getItem('lang') || 'en');

  useEffect(() => {
    localStorage.setItem('lang', lang);
  }, [lang]);

  const t = (path) =>
    path.split('.').reduce((obj, key) => obj?.[key], translations[lang]) || path;

  return (
    <I18nContext.Provider value={{ lang, setLang, t }}>
      {children}
    </I18nContext.Provider>
  );
}
