import React, { useState } from 'react';
import Card from './Card';
import { User } from '../types';
import { translations, Language } from '../translations';

interface RegisterProps {
  onRegister: (user: User) => void;
  setView: (view: 'login' | 'register') => void;
  language: Language;
}

const Register: React.FC<RegisterProps> = ({ onRegister, setView, language }) => {
  const t = translations[language];
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, this would create a new user in the database.
    onRegister({ name, email });
  };

  return (
    <Card title={<h2 className="text-2xl font-bold font-display text-center">{t.createNewAccount}</h2>}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700">{t.name}</label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-sky-blue focus:border-sky-blue sm:text-sm"
          />
        </div>
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">{t.email}</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-sky-blue focus:border-sky-blue sm:text-sm"
          />
        </div>
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700">{t.password}</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={8}
            className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-sky-blue focus:border-sky-blue sm:text-sm"
          />
        </div>
        <button
          type="submit"
          className="w-full inline-flex justify-center py-3 px-4 border border-transparent shadow-sm text-sm font-medium rounded-lg text-white bg-coral-peach hover:bg-red-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-coral-peach transition-transform hover:scale-105"
        >
          {t.register}
        </button>
      </form>
      <p className="mt-6 text-center text-sm text-gray-600">
        {t.haveAccount}{' '}
        <button onClick={() => setView('login')} className="font-medium text-sky-blue hover:text-blue-500">
          {t.login}
        </button>
      </p>
    </Card>
  );
};

export default Register;
