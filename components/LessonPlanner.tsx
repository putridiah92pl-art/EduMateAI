import React, { useState, useRef } from 'react';
import { generateLessonPlan } from '../services/geminiService';
import { LessonPlan } from '../types';
import Card from './Card';
import { translations, Language } from '../translations';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

interface LessonPlannerProps {
  language: Language;
}

// FIX: Refactored the Section component to use a dedicated interface for props.
// This improves type safety and readability, and can prevent subtle type inference errors.
interface SectionProps {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}

const Section: React.FC<SectionProps> = ({ title, icon, children }) => (
  <div>
      <div className="flex items-center space-x-3 mb-3">
          <div className="bg-indigo-100 p-2 rounded-full text-indigo-600">
              {icon}
          </div>
          <h4 className="text-xl font-bold text-gray-800">{title}</h4>
      </div>
      <div className="pl-12 text-gray-700">
          {children}
      </div>
  </div>
);

const LessonPlanner: React.FC<LessonPlannerProps> = ({ language }) => {
  const t = translations[language];
  const [topic, setTopic] = useState('Introduction to Photosynthesis');
  const [duration, setDuration] = useState(45);
  const [gradeLevel, setGradeLevel] = useState('1st Grade');
  const [subject, setSubject] = useState('Science');
  const [lessonPlan, setLessonPlan] = useState<LessonPlan | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState(false);
  const lessonPlanRef = useRef<HTMLDivElement>(null);


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setLessonPlan(null);
    try {
      const combinedGradeLevel = `${gradeLevel} ${subject}`;
      const plan = await generateLessonPlan(topic, duration, combinedGradeLevel, language);
      setLessonPlan(plan);
    } catch (err) {
      setError(t.errorGenerateLessonPlan);
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    if (!lessonPlan) return;
    const plainText = `
Topic: ${lessonPlan.title}
Duration: ${lessonPlan.duration} minutes

${t.learningObjectives.toUpperCase()}:
${lessonPlan.objectives.map(obj => `- ${obj}`).join('\n')}

${t.materials.toUpperCase()}:
${lessonPlan.materials.map(mat => `- ${mat}`).join('\n')}

${t.activities.toUpperCase()}:
${lessonPlan.activities.map(act => `
- ${act.name} (${act.duration} mins):
  ${act.description}
`).join('\n')}

${t.assessment.toUpperCase()}:
${lessonPlan.assessment}
    `;
    navigator.clipboard.writeText(plainText.trim());
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleDownloadPdf = () => {
    if (!lessonPlanRef.current) return;
    const input = lessonPlanRef.current;
    
    // Hide buttons during capture
    const buttons = input.querySelector('.action-buttons') as HTMLElement;
    if (buttons) buttons.style.display = 'none';

    html2canvas(input, { scale: 2 }).then(canvas => {
      // Restore buttons after capture
      if (buttons) buttons.style.display = 'flex';
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const canvasWidth = canvas.width;
      const canvasHeight = canvas.height;
      const ratio = canvasWidth / canvasHeight;
      const width = pdfWidth - 20; // with margin
      const height = width / ratio;

      let position = 10;
      pdf.addImage(imgData, 'PNG', 10, position, width, height);
      pdf.save(`lesson-plan-${lessonPlan?.title.replace(/ /g, '-')}.pdf`);
    });
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
      <div className="md:col-span-1">
        <Card title={t.createLessonPlan}>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="topic" className="block text-sm font-medium text-gray-700">{t.topic}</label>
              <input type="text" id="topic" value={topic} onChange={(e) => setTopic(e.target.value)} className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
            </div>
            <div>
              <label htmlFor="duration" className="block text-sm font-medium text-gray-700">{t.duration}</label>
              <input type="number" id="duration" value={duration} onChange={(e) => setDuration(Number(e.target.value))} className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
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
              <label htmlFor="subject" className="block text-sm font-medium text-gray-700">{t.subject}</label>
              <select id="subject" value={subject} onChange={(e) => setSubject(e.target.value)} className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
                  <option>Science</option>
                  <option>Biology</option>
                  <option>Chemistry</option>
                  <option>Physics</option>
                  <option>History</option>
                  <option>Geography</option>
                  <option>Math</option>
                  <option>English</option>
                  <option>Art</option>
              </select>
            </div>
            <button type="submit" disabled={isLoading} className="w-full inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-300">
              {isLoading ? t.generating : t.generatePlan}
            </button>
          </form>
        </Card>
      </div>

      <div className="md:col-span-2">
        {isLoading && <Card><div className="text-center">{t.generating}...</div></Card>}
        {error && <Card><div className="text-center text-red-500">{error}</div></Card>}
        {lessonPlan && (
          <Card>
            <div ref={lessonPlanRef} className="p-4">
              <div className="text-center mb-8">
                  <h2 className="text-3xl font-extrabold text-gray-900">{lessonPlan.title}</h2>
                  <p className="text-md text-gray-500 mt-1">{t.lessonPlanFor} {gradeLevel} {subject} ({lessonPlan.duration} {t.duration.toLowerCase()})</p>
              </div>

              <div className="space-y-8">
                  <Section title={t.learningObjectives} icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>}>
                      <ul className="list-disc list-inside space-y-2">
                          {lessonPlan.objectives.map((obj, i) => <li key={i}>{obj}</li>)}
                      </ul>
                  </Section>

                  <Section title={t.materials} icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>}>
                      <ul className="list-disc list-inside space-y-2">
                          {lessonPlan.materials.map((mat, i) => <li key={i}>{mat}</li>)}
                      </ul>
                  </Section>

                  <Section title={t.activities} icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a2 2 0 01-2-2V7a2 2 0 012-2h4M9 12l2 2 4-4" /></svg>}>
                      <div className="border-l-3 border-indigo-300 pl-6 space-y-6">
                          {lessonPlan.activities.map((act, i) => (
                              <div key={i} className="relative">
                                  <div className="absolute -left-7 h-full w-2 flex items-center justify-center">
                                      <div className="h-4 w-4 bg-indigo-500 rounded-full border-4 border-white"></div>
                                  </div>
                                  <p className="font-bold text-lg text-indigo-800">{act.name} <span className="text-sm font-medium text-gray-500">({act.duration} mins)</span></p>
                                  <p className="mt-1">{act.description}</p>
                              </div>
                          ))}
                      </div>
                  </Section>

                  <Section title={t.assessment} icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg>}>
                      <p>{lessonPlan.assessment}</p>
                  </Section>
              </div>

              <div className="action-buttons flex items-center justify-end gap-3 mt-8 pt-4 border-t">
                  <button onClick={handleDownloadPdf} className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                    {t.downloadPdf}
                  </button>
                  <button onClick={handleCopy} className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                    {isCopied ? t.copied : t.copy}
                  </button>
              </div>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};

export default LessonPlanner;