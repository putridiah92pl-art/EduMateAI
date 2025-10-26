// FIX: Created AssessmentGenerator component to wrap the InteractiveQuiz and manage layout.
import React, { useState } from 'react';
import InteractiveQuiz from './InteractiveQuiz';
import { translations, Language } from '../translations';
import Card from './Card';

interface AssessmentGeneratorProps {
  language: Language;
}

const AssessmentGenerator: React.FC<AssessmentGeneratorProps> = ({ language }) => {
  const t = translations[language];
  const [isPreviewMode, setIsPreviewMode] = useState(false);

  return (
    <div className={`transition-all duration-500 ${isPreviewMode ? 'bg-slate-900 -m-8 p-8 min-h-full flex flex-col' : ''}`}>
      {!isPreviewMode && (
        <div className="mb-8">
          <Card>
            <h3 className="font-display text-2xl font-semibold text-brand-dark">{t.assessmentGeneratorTitle}</h3>
            <p className="text-gray-600 mt-2">{t.assessmentGeneratorDescription}</p>
          </Card>
        </div>
      )}
      <InteractiveQuiz language={language} setIsPreviewMode={setIsPreviewMode} />
    </div>
  );
};

export default AssessmentGenerator;
