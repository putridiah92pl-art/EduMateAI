
// This file was previously causing errors due to being a duplicate.
// It has been corrected to define only the types it's responsible for.

export type Feature =
  | 'welcome'
  | 'dashboard'
  | 'lesson-planner'
  | 'activity-generator'
  | 'assessment-generator'
  | 'ai-grader'
  | 'interactive-diagram'
  | 'slide-generator'
  | 'profile';

export interface User {
  name: string;
  email: string;
}

// --- Added Missing Type Definitions ---

export interface LessonPlan {
  title: string;
  duration: number;
  objectives: string[];
  materials: string[];
  activities: {
    name: string;
    duration: number;
    description: string;
  }[];
  assessment: string;
}

export interface CreativeActivity {
  name: string;
  description: string;
  materials: string[];
  instructions: string;
}

export interface QuizQuestion {
  id?: string; // Optional ID for client-side keying
  question: string;
  type: 'Multiple Choice' | 'Short Answer' | 'Essay';
  options?: string[];
  correctAnswer?: string;
  explanation?: string;
}

export interface Quiz {
  topic: string;
  questions: QuizQuestion[];
}

export interface GradedExam {
  score: number;
  totalQuestions: number;
  correctAnswers: number;
  analysis: string;
  questionFeedback: {
    questionNumber: number;
    isCorrect: boolean;
    feedback: string;
  }[];
}

export interface DashboardInsights {
  summary: string;
  studentTiers: {
    studentName: string;
    tier: 'High' | 'Medium' | 'At-Risk';
    reason: string;
  }[];
  trends: {
    observation: string;
    implication: string;
  }[];
  suggestedActions: {
      title: string;
      description: string;
  }[];
}

export interface Annotation {
  id: string;
  x: number;
  y: number;
  text: string;
}
