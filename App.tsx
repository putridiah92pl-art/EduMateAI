import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import Welcome from './components/Welcome';
import { Feature, User } from './types';
import { Language } from './translations';
import { auth } from './services/firebase';
import { onAuthStateChanged, signOut, updateProfile } from 'firebase/auth';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [feature, setFeature] = useState<Feature>('dashboard');
  const [language, setLanguage] = useState<Language>('id');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        setUser({
          name: firebaseUser.displayName || 'New User',
          email: firebaseUser.email || 'no-email@example.com',
        });
      } else {
        setUser(null);
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setUser(null);
      setFeature('dashboard'); // Reset to a default view
    } catch (error) {
      console.error("Error signing out: ", error);
    }
  };
  
  const handleUpdateUser = async (updatedUser: User) => {
    const firebaseUser = auth.currentUser;
    if (firebaseUser && updatedUser.name !== firebaseUser.displayName) {
        try {
            await updateProfile(firebaseUser, {
                displayName: updatedUser.name
            });
            setUser(updatedUser); // Optimistically update local state
        } catch (error) {
            console.error("Error updating profile: ", error);
            // Optionally revert state or show an error message
        }
    }
  }

  if (isLoading) {
      return (
          <div className="flex items-center justify-center h-screen">
              <svg className="animate-spin h-10 w-10 text-coral-peach" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
          </div>
      )
  }

  if (!user) {
    return <Welcome language={language} setLanguage={setLanguage} />;
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