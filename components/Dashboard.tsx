import React from 'react';
import { Feature } from '../types';
import { Language } from '../translations';
import SmartDashboard from './SmartDashboard';
import LessonPlanner from './LessonPlanner';
import ActivityGenerator from './ActivityGenerator';
import InteractiveQuiz from './InteractiveQuiz';
import AiGrader from './AiGrader';
import InteractiveDiagram from './InteractiveDiagram';
import SlideGenerator from './SlideGenerator';


interface DashboardProps {
  activeFeature: Feature;
  language: Language;
  setIsPreviewMode: (isPreview: boolean) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ activeFeature, language, setIsPreviewMode }) => {
  const renderFeature = () => {
    switch (activeFeature) {
      case Feature.ClassInsights:
        return <SmartDashboard language={language} />;
      case Feature.LessonPlanner:
        return <LessonPlanner language={language} />;
      case Feature.ActivityGenerator:
        return <ActivityGenerator language={language} />;
      case Feature.QuizGenerator:
        return <InteractiveQuiz language={language} setIsPreviewMode={setIsPreviewMode} />;
      case Feature.AiGrader:
        return <AiGrader language={language} />;
      case Feature.InteractiveDiagram:
        return <InteractiveDiagram language={language} />;
      case Feature.SlideGenerator:
        return <SlideGenerator language={language} />;
      default:
        // Render dashboard as default to prevent blank screen
        return <SmartDashboard language={language} />;
    }
  };

  return <>{renderFeature()}</>;
};

export default Dashboard;
