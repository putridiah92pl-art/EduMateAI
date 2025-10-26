import React from 'react';
import { Language } from '../translations';
import { Feature, User } from '../types';

interface HeaderProps {
  user: User;
  onLogout: () => void;
  setFeature: (feature: Feature) => void;
  language: Language;
  setLanguage: (language: Language) => void;
}

const getInitials = (name: string) => {
    const names = name.split(' ');
    if (names.length > 1) {
        return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
}

const Header: React.FC<HeaderProps> = ({ user, onLogout, setFeature, language, setLanguage }) => {
  return (
    <header className="bg-white shadow-sm p-4 flex justify-end items-center flex-shrink-0">
      <div className="flex items-center space-x-4">
        {/* Language Selector */}
        <div className="relative">
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value as Language)}
            className="appearance-none bg-gray-100 border border-gray-200 rounded-lg py-2 pl-3 pr-8 text-sm leading-5 text-brand-dark hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-sky-blue focus:border-sky-blue transition"
          >
            <option value="en">English</option>
            <option value="id">Bahasa Indonesia</option>
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
          </div>
        </div>
        
        {/* Logout Button */}
        <button 
          onClick={onLogout}
          className="p-2 rounded-full text-gray-500 hover:bg-gray-100 hover:text-coral-peach transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-coral-peach"
          aria-label="Logout"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
        </button>

        {/* Profile Avatar */}
        <button 
          onClick={() => setFeature('profile')}
          className="flex items-center justify-center h-10 w-10 rounded-full bg-coral-peach text-white font-bold text-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-coral-peach"
        >
          {getInitials(user.name)}
        </button>
      </div>
    </header>
  );
};

export default Header;
