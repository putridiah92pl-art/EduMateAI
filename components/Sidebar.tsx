import React from 'react';
import { Feature } from '../types';
import { translations, Language } from '../translations';

// Import icons
import DashboardIcon from './icons/DashboardIcon';
import LessonPlannerIcon from './icons/LessonPlannerIcon';
import ActivityGeneratorIcon from './icons/ActivityGeneratorIcon';
import AssessmentGeneratorIcon from './icons/AssessmentGeneratorIcon';
import AiGraderIcon from './icons/AiGraderIcon';
import InteractiveDiagramIcon from './icons/InteractiveDiagramIcon';
import SlideGeneratorIcon from './icons/SlideGeneratorIcon';
import ProfileIcon from './icons/ProfileIcon';

interface SidebarProps {
  currentFeature: Feature;
  setFeature: (feature: Feature) => void;
  language: Language;
}

const NavItem: React.FC<{
  feature: Feature;
  label: string;
  icon: React.ReactNode;
  currentFeature: Feature;
  setFeature: (feature: Feature) => void;
}> = ({ feature, label, icon, currentFeature, setFeature }) => {
  const isActive = currentFeature === feature;
  return (
    <button
      onClick={() => setFeature(feature)}
      className={`flex items-center w-full px-4 py-3 text-sm font-medium text-left rounded-lg transition-all duration-200 ${
        isActive
          ? 'bg-sky-blue text-brand-dark shadow-md'
          : 'text-gray-500 hover:bg-gray-100 hover:text-brand-dark'
      }`}
    >
      <div className="w-6 h-6 mr-3">{icon}</div>
      <span className="font-semibold">{label}</span>
    </button>
  );
};

const Sidebar: React.FC<SidebarProps> = ({ currentFeature, setFeature, language }) => {
  const t = translations[language];
  
  const featureMap: { feature: Feature; label: string; icon: React.ReactNode }[] = [
    { feature: 'dashboard', label: t.dashboardTitle, icon: <DashboardIcon /> },
    { feature: 'lesson-planner', label: t.createLessonPlan, icon: <LessonPlannerIcon /> },
    { feature: 'activity-generator', label: t.generateCreativeActivities, icon: <ActivityGeneratorIcon /> },
    { feature: 'assessment-generator', label: t.assessmentGeneratorTitle, icon: <AssessmentGeneratorIcon /> },
    { feature: 'ai-grader', label: t.aiGrader, icon: <AiGraderIcon /> },
    { feature: 'interactive-diagram', label: t.generateDiagram, icon: <InteractiveDiagramIcon /> },
    { feature: 'slide-generator', label: t.generatePromptForSlides, icon: <SlideGeneratorIcon /> },
    { feature: 'profile', label: t.profile, icon: <ProfileIcon /> },
  ];

  return (
    <div className="w-72 bg-white text-brand-dark flex-shrink-0 flex flex-col border-r border-gray-200 p-4">
      <div className="flex items-center px-2 py-4 mb-4">
        <svg className="h-10 w-10 mr-2 text-coral-peach" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25" />
        </svg>
        <h1 className="text-2xl font-bold font-display tracking-wider">EduMate AI</h1>
      </div>

      <nav className="flex-1 space-y-2">
        {featureMap.map(item => (
          <NavItem
            key={item.feature}
            feature={item.feature}
            label={item.label}
            icon={item.icon}
            currentFeature={currentFeature}
            setFeature={setFeature}
          />
        ))}
      </nav>
    </div>
  );
};

export default Sidebar;
