import React from 'react';
import { Feature } from '../types';
import { Language, translations } from '../translations';
import DashboardIcon from './icons/DashboardIcon';
import LessonPlannerIcon from './icons/LessonPlannerIcon';
import ActivityGeneratorIcon from './icons/ActivityGeneratorIcon';
import AssessmentGeneratorIcon from './icons/AssessmentGeneratorIcon';
import AiGraderIcon from './icons/AiGraderIcon';
import InteractiveDiagramIcon from './icons/InteractiveDiagramIcon';
import SlideGeneratorIcon from './icons/SlideGeneratorIcon';


interface SidebarProps {
  activeFeature: Feature;
  setActiveFeature: (feature: Feature) => void;
  language: Language;
}

const featureMap: { [key in Feature]: { icon: React.FC<{className?: string}>, translationKey: keyof typeof translations.en } } = {
  [Feature.ClassInsights]: { icon: DashboardIcon, translationKey: 'classInsights' },
  [Feature.LessonPlanner]: { icon: LessonPlannerIcon, translationKey: 'lessonPlanner' },
  [Feature.ActivityGenerator]: { icon: ActivityGeneratorIcon, translationKey: 'activityGenerator' },
  [Feature.QuizGenerator]: { icon: AssessmentGeneratorIcon, translationKey: 'quizGenerator' },
  [Feature.AiGrader]: { icon: AiGraderIcon, translationKey: 'aiGrader' },
  [Feature.InteractiveDiagram]: { icon: InteractiveDiagramIcon, translationKey: 'interactiveDiagram' },
  [Feature.SlideGenerator]: { icon: SlideGeneratorIcon, translationKey: 'slideGenerator' },
};

const Sidebar: React.FC<SidebarProps> = ({ activeFeature, setActiveFeature, language }) => {
  const t = translations[language];

  return (
    <div className="w-64 bg-gray-800 text-white flex flex-col">
      <div className="flex items-center justify-center h-20 border-b border-gray-700">
        <h1 className="text-2xl font-bold">EduMate AI</h1>
      </div>
      <nav className="flex-1 px-4 py-4 space-y-2">
        {Object.values(Feature).map((feature) => {
          const { icon: Icon, translationKey } = featureMap[feature];
          const isActive = activeFeature === feature;
          return (
            <button
              key={feature}
              onClick={() => setActiveFeature(feature)}
              className={`w-full flex items-center px-4 py-2 text-base font-medium rounded-md transition-colors text-left ${
                isActive
                  ? 'bg-gray-700 text-white'
                  : 'text-gray-300 hover:bg-gray-700 hover:text-white'
              }`}
            >
              <Icon className="w-6 h-6 mr-3 flex-shrink-0" />
              <span>{t[translationKey]}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
};

export default Sidebar;
