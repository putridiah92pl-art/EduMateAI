import React, { useState, useRef } from 'react';
import { gradeAnswerSheet } from '../services/geminiService';
import { GradedExam } from '../types';
import Card from './Card';
import { translations, Language } from '../translations';

interface AiGraderProps {
  language: Language;
}

const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve((reader.result as string).split(',')[1]);
    reader.onerror = (error) => reject(error);
  });
};

const ImageUpload: React.FC<{
  title: string;
  onFileSelect: (file: File | null) => void;
  language: Language;
}> = ({ title, onFileSelect, language }) => {
  const t = translations[language];
  const [preview, setPreview] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onFileSelect(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      onFileSelect(null);
      setPreview(null);
    }
  };

  const handleBoxClick = () => {
    inputRef.current?.click();
  };

  return (
    <div>
      <h4 className="font-semibold text-lg text-gray-800 mb-2">{title}</h4>
      <div
        onClick={handleBoxClick}
        className="w-full h-64 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center cursor-pointer hover:border-blue-500 transition-colors bg-slate-50"
      >
        <input
          type="file"
          ref={inputRef}
          onChange={handleFileChange}
          className="hidden"
          accept="image/png, image/jpeg, image/webp"
        />
        {preview ? (
          <img src={preview} alt="Preview" className="h-full w-full object-contain p-2 rounded-lg" />
        ) : (
          <div className="text-center text-gray-500">
            <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <p className="mt-2 text-sm">{t.uploadInstructions}</p>
          </div>
        )}
      </div>
    </div>
  );
};

const AiGrader: React.FC<AiGraderProps> = ({ language }) => {
  const t = translations[language];
  const [studentSheet, setStudentSheet] = useState<File | null>(null);
  const [answerKey, setAnswerKey] = useState<File | null>(null);
  const [gradingResult, setGradingResult] = useState<GradedExam | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGrade = async () => {
    if (!studentSheet || !answerKey) {
      setError('Please upload both the student answer sheet and the answer key.');
      return;
    }
    setIsLoading(true);
    setError(null);
    setGradingResult(null);

    try {
      const studentSheetBase64 = await fileToBase64(studentSheet);
      const answerKeyBase64 = await fileToBase64(answerKey);

      const result = await gradeAnswerSheet(
        { data: studentSheetBase64, mimeType: studentSheet.type },
        { data: answerKeyBase64, mimeType: answerKey.type },
        language
      );
      setGradingResult(result);
    } catch (err) {
      setError(t.errorGrading);
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <Card title={t.aiGrader}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <ImageUpload title={t.studentAnswers} onFileSelect={setStudentSheet} language={language} />
          <ImageUpload title={t.answerKey} onFileSelect={setAnswerKey} language={language} />
        </div>
        <div className="mt-6">
          <button
            onClick={handleGrade}
            disabled={!studentSheet || !answerKey || isLoading}
            className="w-full inline-flex justify-center py-3 px-4 border border-transparent shadow-sm text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-300"
          >
            {isLoading ? t.grading : t.gradeAnswers}
          </button>
        </div>
      </Card>

      {isLoading && <Card><div className="text-center">{t.grading}...</div></Card>}
      {error && <Card><div className="text-center text-red-500">{error}</div></Card>}

      {gradingResult && (
        <Card title={t.gradingResults}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-1 p-6 bg-blue-50 rounded-lg text-center">
              <p className="text-lg font-medium text-blue-800">{t.score}</p>
              <p className="text-6xl font-bold text-blue-600 mt-2">{gradingResult.score}%</p>
              <p className="text-md text-blue-700 mt-2">
                {gradingResult.correctAnswers} / {gradingResult.totalQuestions} {t.correct}
              </p>
            </div>
            <div className="md:col-span-2">
              <h4 className="font-semibold text-lg text-gray-800">{t.overallAnalysis}</h4>
              <p className="mt-2 text-gray-600">{gradingResult.analysis}</p>
            </div>
          </div>
          <div className="mt-8">
            <h4 className="font-semibold text-lg text-gray-800 mb-4">{t.questionBreakdown}</h4>
            <div className="space-y-3">
              {gradingResult.questionFeedback.map((item) => (
                <div key={item.questionNumber} className={`p-4 rounded-lg border-l-4 ${item.isCorrect ? 'bg-green-50 border-green-500' : 'bg-red-50 border-red-500'}`}>
                  <div className="flex items-start">
                    <div className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-white text-sm font-bold ${item.isCorrect ? 'bg-green-500' : 'bg-red-500'}`}>
                      {item.isCorrect ? '✓' : '✗'}
                    </div>
                    <div className="ml-4">
                      <p className="font-bold text-gray-800">{t.question} {item.questionNumber}</p>
                      <p className="mt-1 text-sm text-gray-600">{item.feedback}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};

export default AiGrader;
