import React from 'react';
import { Language } from '../translations';

interface HeaderProps {
    activeFeature: string;
    language: Language;
    setLanguage: (language: Language) => void;
}

const Header: React.FC<HeaderProps> = ({ activeFeature, language, setLanguage }) => {
    return (
        <header className="flex items-center justify-between h-20 px-6 bg-white border-b border-gray-200">
            <h2 className="text-2xl font-semibold text-gray-800">{activeFeature}</h2>
            <div className="flex items-center space-x-4">
                <div className="flex items-center p-1 bg-gray-200 rounded-full">
                    <button 
                        onClick={() => setLanguage('en')}
                        className={`px-3 py-1 text-sm font-semibold rounded-full transition-colors ${language === 'en' ? 'bg-white text-gray-800 shadow' : 'bg-transparent text-gray-500'}`}
                    >
                        EN
                    </button>
                    <button 
                        onClick={() => setLanguage('id')}
                        className={`px-3 py-1 text-sm font-semibold rounded-full transition-colors ${language === 'id' ? 'bg-white text-gray-800 shadow' : 'bg-transparent text-gray-500'}`}
                    >
                        ID
                    </button>
                </div>
                <div className="w-10 h-10 bg-gray-300 rounded-full"></div>
            </div>
        </header>
    );
};

export default Header;
