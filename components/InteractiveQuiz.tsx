
import React, { useState, useEffect } from 'react';
import { generateQuiz } from '../services/geminiService';
import { Quiz, QuizQuestion } from '../types';
import Card from './Card';
import { translations, Language } from '../translations';

const ConfettiPiece: React.FC<{ initialX: number; initialRotation: number; delay: number }> = ({ initialX, initialRotation, delay }) => {
  const colors = ['bg-sky-blue', 'bg-coral-peach', 'bg-mint-green', 'bg-yellow-300'];
  const color = colors[Math.floor(Math.random() * colors.length)];
  const duration = Math.random() * 2 + 3; // 3s to 5s fall time

  const style: React.CSSProperties = {
    left: `${initialX}%`,
    transform: `rotate(${initialRotation}deg)`,
    animation: `fall ${duration}s linear ${delay}s forwards`,
  };

  return (
    <div className={`absolute top-[-20px] w-3 h-3 ${color}`} style={style}>
        <style>{`
            @keyframes fall {
                to {
                    top: 110%;
                    transform: rotate(${initialRotation + 720}deg);
                }
            }
        `}</style>
    </div>
  );
};

const Confetti: React.FC = () => {
    const pieces = Array.from({ length: 50 }).map((_, i) => ({
        id: i,
        initialX: Math.random() * 100,
        initialRotation: Math.random() * 360,
        delay: Math.random() * 0.5,
    }));

    return (
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-50">
            {pieces.map(p => <ConfettiPiece key={p.id} {...p} />)}
        </div>
    );
};


interface InteractiveQuizProps {
  language: Language;
  setIsPreviewMode: (isPreview: boolean) => void;
}

const InteractiveQuiz: React.FC<InteractiveQuizProps> = ({ language, setIsPreviewMode }) => {
  const t = translations[language];
  
  // Builder state
  const [topic, setTopic] = useState('The Solar System');
  const [gradeLevel, setGradeLevel] = useState('7th Grade');
  const [quizType, setQuizType] = useState<'Multiple Choice' | 'Short Answer' | 'Essay'>('Multiple Choice');
  const [numQuestions, setNumQuestions] = useState(5);
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showBuilder, setShowBuilder] = useState(true);

  // Live Quiz State
  const [mode, setMode] = useState<'builder' | 'live' | 'summary'>('builder');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<(string | null)[]>([]);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isAnswerRevealed, setIsAnswerRevealed] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setQuiz(null);
    setShowBuilder(false); // Animate out the builder
    try {
      const result = await generateQuiz(topic, quizType, numQuestions, gradeLevel, language);
      const quizWithIds: Quiz = {
          ...result,
          questions: result.questions.map(q => ({ ...q, id: crypto.randomUUID() }))
      };
      setQuiz(quizWithIds);
    } catch (err) {
      setError(t.errorGenerateQuiz);
      console.error(err);
      setShowBuilder(true); // Bring back builder on error
    } finally {
      setIsLoading(false);
    }
  };
  
  // --- Canvas Handlers ---
  const handleQuizChange = (questionId: string, field: keyof QuizQuestion, value: any) => {
      setQuiz(prevQuiz => {
          if (!prevQuiz) return null;
          return {
              ...prevQuiz,
              questions: prevQuiz.questions.map(q => 
                  q.id === questionId ? { ...q, [field]: value } : q
              )
          };
      });
  };

  const handleOptionChange = (questionId: string, optionIndex: number, newText: string) => {
    setQuiz(prevQuiz => {
        if (!prevQuiz) return null;
        return {
            ...prevQuiz,
            questions: prevQuiz.questions.map(q => {
                if (q.id === questionId && q.options) {
                    const newOptions = [...q.options];
                    newOptions[optionIndex] = newText;
                    return { ...q, options: newOptions };
                }
                return q;
            })
        };
    });
  };

  const handleCorrectAnswerChange = (questionId: string, newCorrectAnswer: string) => {
    setQuiz(prevQuiz => {
        if(!prevQuiz) return null;
        return {
            ...prevQuiz,
            questions: prevQuiz.questions.map(q => 
                q.id === questionId ? { ...q, correctAnswer: newCorrectAnswer } : q
            )
        };
    });
  };

  const handleDeleteQuestion = (questionId: string) => {
    setQuiz(prevQuiz => {
        if (!prevQuiz) return null;
        return {
            ...prevQuiz,
            questions: prevQuiz.questions.filter(q => q.id !== questionId)
        };
    });
  };

  const handleAddQuestion = () => {
    const newQuestion: QuizQuestion = {
        id: crypto.randomUUID(),
        question: 'New Question',
        type: 'Multiple Choice',
        options: ['Option 1', 'Option 2', 'Option 3', 'Option 4'],
        correctAnswer: 'Option 1',
        explanation: 'Explanation for the correct answer.'
    };
    setQuiz(prevQuiz => {
        if (!prevQuiz) return null;
        return {
            ...prevQuiz,
            questions: [...prevQuiz.questions, newQuestion]
        };
    });
  };
  // --- End Canvas Handlers ---

  const handleStartQuiz = () => {
    if (!quiz || quiz.questions.length === 0) return;
    setCurrentQuestionIndex(0);
    setUserAnswers(Array(quiz.questions.length).fill(null));
    setSelectedOption(null);
    setIsAnswerRevealed(false);
    setMode('live');
    setIsPreviewMode(true);
  };
  
  const handleSelectOption = (option: string) => {
    if (isAnswerRevealed) return;
    setSelectedOption(option);
  };
  
  const handleSubmitAnswer = () => {
    if (!selectedOption) return;
    const newAnswers = [...userAnswers];
    newAnswers[currentQuestionIndex] = selectedOption;
    setUserAnswers(newAnswers);
    setIsAnswerRevealed(true);
  };

  const handleNextQuestion = () => {
    setIsTransitioning(true);
    setTimeout(() => {
        if (quiz && currentQuestionIndex < quiz.questions.length - 1) {
            setCurrentQuestionIndex(currentQuestionIndex + 1);
            setSelectedOption(null);
            setIsAnswerRevealed(false);
        } else {
            setMode('summary');
        }
        setIsTransitioning(false);
    }, 500); // Match animation duration
  };

  const handleRestart = () => {
    setMode('builder');
    setQuiz(null);
    setShowBuilder(true);
    setIsPreviewMode(false);
  }

  const score = userAnswers.reduce((acc, answer, index) => {
      return quiz?.questions[index].correctAnswer === answer ? acc + 1 : acc;
  }, 0);

  if (mode === 'live' && quiz) {
    const question = quiz.questions[currentQuestionIndex];
    return (
        <div className="max-w-4xl mx-auto text-center flex items-center justify-center h-full">
            <div className={`transition-all duration-500 w-full ${isTransitioning ? 'animate-slide-out-left' : 'animate-slide-in-right'}`}>
                <Card className="bg-slate-800 text-white w-full">
                    <p className="text-sm font-medium text-blue-300">{t.topic}: {quiz.topic}</p>
                    <p className="text-sm font-medium text-blue-300">{`${t.question} ${currentQuestionIndex + 1} / ${quiz.questions.length}`}</p>
                    <h2 className="text-3xl font-bold mt-4 mb-8 min-h-[80px]">{question.question}</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {question.options?.map((option, i) => {
                            const isCorrect = option === question.correctAnswer;
                            const isSelected = option === selectedOption;
                            let buttonClass = "bg-blue-600 hover:bg-blue-700";
                            if(isAnswerRevealed) {
                               if(isCorrect) buttonClass = "bg-green-600 scale-105";
                               else if(isSelected) buttonClass = "bg-red-600";
                               else buttonClass = "bg-slate-500 opacity-50";
                            } else if (isSelected) {
                                buttonClass = "bg-yellow-500";
                            }
                            
                            return (
                                <button key={i} onClick={() => handleSelectOption(option)} disabled={isAnswerRevealed}
                                    className={`p-4 rounded-lg text-lg font-semibold text-white transition-all transform hover:scale-105 active:scale-100 ${buttonClass}`}>
                                    {option}
                                </button>
                            );
                        })}
                    </div>

                    {isAnswerRevealed && question.explanation && (
                        <div className="mt-6 text-left p-4 bg-slate-700 rounded-lg animate-fade-in-up">
                            <h4 className="font-bold text-blue-300">{t.explanation}</h4>
                            <p className="mt-1">{question.explanation}</p>
                        </div>
                    )}

                    <div className="mt-8">
                        {!isAnswerRevealed ? (
                            <button onClick={handleSubmitAnswer} disabled={!selectedOption}
                                className="w-full md:w-auto px-12 py-3 bg-green-500 text-white font-bold rounded-lg hover:bg-green-600 disabled:bg-gray-400">
                                {t.submitAnswer}
                            </button>
                        ) : (
                            <button onClick={handleNextQuestion}
                                className="w-full md:w-auto px-12 py-3 bg-indigo-500 text-white font-bold rounded-lg hover:bg-indigo-600">
                                {currentQuestionIndex < quiz.questions.length - 1 ? t.nextQuestion : t.finishQuiz}
                            </button>
                        )}
                    </div>
                </Card>
            </div>
        </div>
    );
  }

  if (mode === 'summary' && quiz) {
      const [displayScore, setDisplayScore] = useState(0);

      useEffect(() => {
          const timer = setTimeout(() => {
            if (displayScore < score) {
                setDisplayScore(displayScore + 1);
            }
          }, 100);
          return () => clearTimeout(timer);
      }, [displayScore, score]);

      return (
        <div className="max-w-2xl mx-auto text-center flex items-center justify-center h-full">
            <Card className="w-full relative animate-pop-in">
                <Confetti />
                <h2 className="text-4xl font-bold text-gray-800">{t.quizComplete}</h2>
                <p className="mt-4 text-xl text-gray-600">{t.yourScore}</p>
                <p className="my-8 text-7xl font-bold text-blue-600">{displayScore} / {quiz.questions.length}</p>
                <button onClick={handleRestart}
                    className="w-full md:w-auto px-8 py-3 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700">
                    {t.playAgain}
                </button>
            </Card>
        </div>
      );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
      <div className={`md:col-span-1 transition-all duration-500 ${showBuilder ? 'opacity-100' : 'opacity-0 -translate-x-8'}`}>
        <Card title={t.createQuiz}>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="topic" className="block text-sm font-medium text-gray-700">{t.topic}</label>
              <input type="text" id="topic" value={topic} onChange={(e) => setTopic(e.target.value)} className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
            </div>
            <div>
              <label htmlFor="gradeLevel" className="block text-sm font-medium text-gray-700">{t.gradeLevel}</label>
              <select id="gradeLevel" value={gradeLevel} onChange={(e) => setGradeLevel(e.target.value)} className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
                  {Array.from({ length: 12 }, (_, i) => {
                      const grade = i + 1;
                      const suffix = grade === 1 ? 'st' : grade === 2 ? 'nd' : grade === 3 ? 'rd' : 'th';
                      return <option key={grade}>{`${grade}${suffix} Grade`}</option>
                  })}
              </select>
            </div>
            <div>
              <label htmlFor="quizType" className="block text-sm font-medium text-gray-700">{t.questionType}</label>
              <select id="quizType" value={quizType} onChange={(e) => setQuizType(e.target.value as any)} className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
                <option>Multiple Choice</option>
                <option>Short Answer</option>
                <option>Essay</option>
              </select>
            </div>
            <div>
              <label htmlFor="numQuestions" className="block text-sm font-medium text-gray-700">{t.numQuestions}</label>
              <input type="number" id="numQuestions" value={numQuestions} min="1" max="20" onChange={(e) => setNumQuestions(Number(e.target.value))} className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
            </div>
            <button type="submit" disabled={isLoading} className="w-full inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-coral-peach hover:bg-red-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-coral-peach disabled:bg-red-300 transition-colors">
              {isLoading ? t.generating : t.generateQuiz}
            </button>
          </form>
        </Card>
      </div>

      <div className="md:col-span-2">
        {isLoading && <Card><div className="text-center">{t.buildingQuiz}</div></Card>}
        {error && <Card><div className="text-center text-red-500">{error}</div></Card>}
        {quiz && (
          <div className={`space-y-6 transition-opacity duration-500 ${showBuilder ? 'opacity-0' : 'opacity-100'}`}>
            <Card title={t.quizCanvas}>
                <div className="space-y-4">
                    {quiz.questions.map((q, i) => (
                        <div key={q.id} className="p-4 border rounded-lg bg-slate-50 relative animate-fade-in-up" style={{ animationDelay: `${i * 100}ms` }}>
                             <button onClick={() => handleDeleteQuestion(q.id!)} className="absolute top-2 right-2 text-gray-400 hover:text-red-600 p-1 rounded-full hover:bg-red-100 transition-colors">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm4 0a1 1 0 012 0v6a1 1 0 11-2 0V8z" clipRule="evenodd" />
                                </svg>
                            </button>
                            <label className="block text-sm font-medium text-gray-700">{t.question} {i + 1}</label>
                            <input type="text" value={q.question} onChange={e => handleQuizChange(q.id!, 'question', e.target.value)} className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"/>

                            {q.type === 'Multiple Choice' && q.options && (
                                <div className="mt-2 space-y-2">
                                    {q.options.map((opt, optIndex) => (
                                        <div key={optIndex} className="flex items-center">
                                            <input type="radio" name={`q_${q.id}_correct`} checked={q.correctAnswer === opt} onChange={() => handleCorrectAnswerChange(q.id!, opt)} className="h-4 w-4 text-indigo-600 border-gray-300 focus:ring-indigo-500"/>
                                            <input type="text" value={opt} onChange={e => handleOptionChange(q.id!, optIndex, e.target.value)} className="ml-3 block w-full text-sm px-2 py-1 bg-white border border-gray-300 rounded-md"/>
                                        </div>
                                    ))}
                                </div>
                            )}

                             <label className="block text-sm font-medium text-gray-700 mt-2">{t.explanation}</label>
                             <textarea value={q.explanation} onChange={e => handleQuizChange(q.id!, 'explanation', e.target.value)} className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" rows={2}/>
                        </div>
                    ))}
                </div>
                <button onClick={handleAddQuestion} className="mt-4 w-full text-sm font-medium text-blue-600 hover:text-blue-800 p-2 rounded-md border-2 border-dashed border-gray-300 hover:border-blue-500 transition-colors animate-fade-in-up" style={{ animationDelay: `${quiz.questions.length * 100}ms` }}>
                    + {t.addQuestion}
                </button>
            </Card>

            <button onClick={handleStartQuiz} className="w-full inline-flex justify-center py-3 px-4 border border-transparent shadow-sm text-base font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:bg-gray-400 transition-all hover:scale-105 animate-fade-in-up" disabled={!quiz || quiz.questions.length === 0} style={{ animationDelay: `${(quiz.questions.length + 1) * 100}ms` }}>
                {t.startQuiz}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default InteractiveQuiz;