import React, { useState } from 'react';
import Card from './Card';
import { translations, Language } from '../translations';
import { auth } from '../services/firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';

interface LoginProps {
  setView: (view: 'login' | 'register') => void;
  language: Language;
}

const Login: React.FC<LoginProps> = ({ setView, language }) => {
  const t = translations[language];
  const [email, setEmail] = useState('teacher@edumate.ai');
  const [password, setPassword] = useState('password123');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      // The onAuthStateChanged listener in App.tsx will handle the redirect.
    } catch (err: any) {
      const errorCode = err.code;
      setError(t[errorCode] || `${t.error}: ${err.message}`);
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <Card title={<h2 className="text-2xl font-bold font-display text-center">{t.loginToAccount}</h2>}>
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <p className="text-red-500 text-sm text-center bg-red-50 p-3 rounded-md">{error}</p>}
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
          disabled={isLoading}
          className="w-full inline-flex justify-center py-3 px-4 border border-transparent shadow-sm text-sm font-medium rounded-lg text-white bg-coral-peach hover:bg-red-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-coral-peach transition-transform hover:scale-105 disabled:bg-red-300"
        >
          {isLoading ? `${t.generating}...` : t.login}
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