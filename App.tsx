import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import Welcome from './components/Welcome';
import { Feature, User } from './types';
import { Language } from './translations';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [feature, setFeature] = useState<Feature>('dashboard');
  const [language, setLanguage] = useState<Language>('id');

  useEffect(() => {
    const storedUser = localStorage.getItem('eduMateUser');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const handleLogin = (loggedInUser: User) => {
    localStorage.setItem('eduMateUser', JSON.stringify(loggedInUser));
    setUser(loggedInUser);
  };

  const handleRegister = (registeredUser: User) => {
    // In a real app, this would also save to a database
    localStorage.setItem('eduMateUser', JSON.stringify(registeredUser));
    setUser(registeredUser);
  };

  const handleLogout = () => {
    localStorage.removeItem('eduMateUser');
    setUser(null);
    setFeature('dashboard'); // Reset to a default view
  };
  
  const handleUpdateUser = (updatedUser: User) => {
    setUser(updatedUser);
    localStorage.setItem('eduMateUser', JSON.stringify(updatedUser));
  }

  if (!user) {
    return <Welcome onLogin={handleLogin} onRegister={handleRegister} language={language} setLanguage={setLanguage} />;
  }

  return (
    <div className="flex h-screen bg-brand-off-white font-sans text-brand-dark">
      <Sidebar currentFeature={feature} setFeature={setFeature} language={language} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header 
          user={user} 
          onLogout={handleLogout} 
          setFeature={setFeature} 
          language={language} 
          setLanguage={setLanguage} 
        />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-brand-off-white p-4 md:p-8">
          <Dashboard 
            feature={feature} 
            language={language} 
            user={user} 
            onUpdateUser={handleUpdateUser} 
          />
        </main>
      </div>
    </div>
  );
};

export default App;