import React from 'react';
import { Feature, User } from '../types';
import { Language } from '../translations';

// Import all feature components
import SmartDashboard from './SmartDashboard';
import LessonPlanner from './LessonPlanner';
import ActivityGenerator from './ActivityGenerator';
import AssessmentGenerator from './AssessmentGenerator';
import AiGrader from './AiGrader';
import InteractiveDiagram from './InteractiveDiagram';
import SlideGenerator from './SlideGenerator';
import Profile from './Profile';

interface DashboardProps {
  feature: Feature;
  language: Language;
  user: User;
  onUpdateUser: (user: User) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ feature, language, user, onUpdateUser }) => {
  const renderFeature = () => {
    switch (feature) {
      case 'dashboard':
        return <SmartDashboard language={language} />;
      case 'lesson-planner':
        return <LessonPlanner language={language} />;
      case 'activity-generator':
        return <ActivityGenerator language={language} />;
      case 'assessment-generator':
        return <AssessmentGenerator language={language} />;
      case 'ai-grader':
        return <AiGrader language={language} />;
      case 'interactive-diagram':
        return <InteractiveDiagram language={language} />;
      case 'slide-generator':
        return <SlideGenerator language={language} />;
      case 'profile':
        return <Profile user={user} onUpdateUser={onUpdateUser} language={language} />;
      default:
        return <SmartDashboard language={language} />;
    }
  };

  return (
    <div>
      {renderFeature()}
    </div>
  );
};

export default Dashboard;
