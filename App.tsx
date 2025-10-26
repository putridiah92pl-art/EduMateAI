import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import Header from './components/Header';
import { Feature } from './types';
import { Language } from './translations';

function App() {
  // FIX: Changed initial state to use a valid enum member 'ClassInsights' instead of 'Dashboard'.
  const [activeFeature, setActiveFeature] = useState<Feature>(Feature.ClassInsights);
  const [language, setLanguage] = useState<Language>('en');
  const [isPreviewMode, setIsPreviewMode] = useState(false);

  return (
    <div className="flex h-screen bg-slate-100">
      {!isPreviewMode && (
        <Sidebar 
          activeFeature={activeFeature} 
          setActiveFeature={setActiveFeature}
          language={language} 
        />
      )}
      <div className="flex-1 flex flex-col overflow-hidden">
        {!isPreviewMode && (
          <Header 
            activeFeature={activeFeature} 
            language={language}
            setLanguage={setLanguage}
          />
        )}
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-slate-50">
          <div className="container mx-auto px-6 py-8 h-full">
            <Dashboard 
              activeFeature={activeFeature} 
              language={language} 
              setIsPreviewMode={setIsPreviewMode}
            />
          </div>
        </main>
      </div>
    </div>
  );
}

export default App;
