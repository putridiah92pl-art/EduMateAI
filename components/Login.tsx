import React, { useState } from 'react';
import Card from './Card';
import { User } from '../types';
import { translations, Language } from '../translations';

interface LoginProps {
  onLogin: (user: User) => void;
  setView: (view: 'login' | 'register') => void;
  language: Language;
}

const Login: React.FC<LoginProps> = ({ onLogin, setView, language }) => {
  const t = translations[language];
  const [email, setEmail] = useState('teacher@edumate.ai');
  const [password, setPassword] = useState('password123');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, you'd validate credentials against a backend.
    // Here, we'll simulate a successful login and derive the name from the email.
    const name = email.split('@')[0].replace(/\./g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    onLogin({ name, email });
  };

  return (
    <Card title={<h2 className="text-2xl font-bold font-display text-center">{t.loginToAccount}</h2>}>
      <form onSubmit={handleSubmit} className="space-y-4">
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
            className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-sky-blue focus:border-sky-blue sm:text-sm"
          />
        </div>
        <button
          type="submit"
          className="w-full inline-flex justify-center py-3 px-4 border border-transparent shadow-sm text-sm font-medium rounded-lg text-white bg-coral-peach hover:bg-red-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-coral-peach transition-transform hover:scale-105"
        >
          {t.login}
        </button>
      </form>
      <p className="mt-6 text-center text-sm text-gray-600">
        {t.noAccount}{' '}
        <button onClick={() => setView('register')} className="font-medium text-sky-blue hover:text-blue-500">
          {t.register}
        </button>
      </p>
    </Card>
  );
};

export default Login;
