export enum Feature {
  ClassInsights = 'Class Insights',
  LessonPlanner = 'Lesson Planner',
  ActivityGenerator = 'Activity Generator',
  QuizGenerator = 'Quiz Generator',
  AiGrader = 'AI Grader',
  InteractiveDiagram = 'Interactive Diagram',
  SlideGenerator = 'Slide Generator Prompt',
}

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
  id?: string;
  question: string;
  type: string;
  options?: string[];
  correctAnswer: string;
  explanation: string;
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

export interface Annotation {
  id: string;
  x: number;
  y: number;
  text: string;
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
