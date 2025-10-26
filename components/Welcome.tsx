import React, { useState } from 'react';
import Login from './Login';
import Register from './Register';
import { translations, Language } from '../translations';

interface WelcomeProps {
  language: Language;
  setLanguage: (language: Language) => void;
}

const Welcome: React.FC<WelcomeProps> = ({ language, setLanguage }) => {
  const [view, setView] = useState<'login' | 'register'>('login');
  const t = translations[language];

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-brand-off-white p-4">
        <div className="absolute top-4 right-4">
            <div className="relative">
                <select
                    value={language}
                    onChange={(e) => setLanguage(e.target.value as Language)}
                    className="appearance-none bg-white border border-gray-300 rounded-lg py-2 pl-3 pr-8 text-sm leading-5 text-brand-dark hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-sky-blue focus:border-sky-blue transition"
                >
                    <option value="en">English</option>
                    <option value="id">Bahasa Indonesia</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                </div>
            </div>
        </div>
        <div className="text-center mb-8">
            <div className="flex items-center justify-center">
                <svg className="h-12 w-12 mr-3 text-coral-peach" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25" />
                </svg>
                <h1 className="text-4xl font-bold font-display tracking-wider">EduMate AI</h1>
            </div>
            <p className="mt-4 text-lg text-gray-600 max-w-md">{t.welcomeDescription}</p>
        </div>

        <div className="w-full max-w-sm">
            {view === 'login' ? (
                <Login setView={setView} language={language} />
            ) : (
                <Register setView={setView} language={language} />
            )}
        </div>
    </div>
  );
};

export default Welcome;