import React, { useState, useRef } from 'react';
import { generateCreativeActivities } from '../services/geminiService';
import { CreativeActivity } from '../types';
import Card from './Card';
import { translations, Language } from '../translations';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

interface ActivityGeneratorProps {
  language: Language;
}

const ActivityGenerator: React.FC<ActivityGeneratorProps> = ({ language }) => {
  const t = translations[language];
  const [theme, setTheme] = useState('Ancient Rome');
  const [gradeLevel, setGradeLevel] = useState('7th Grade');
  const [subject, setSubject] = useState('History');
  const [activityType, setActivityType] = useState('Group Project');
  const [activities, setActivities] = useState<CreativeActivity[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState(false);
  const activitiesRef = useRef<HTMLDivElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setActivities([]);
    try {
      const combinedGradeSubject = `${gradeLevel} ${subject}`;
      const result = await generateCreativeActivities(theme, combinedGradeSubject, activityType, language);
      setActivities(result);
    } catch (err) {
      setError(t.errorGenerateActivities);
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleCopy = () => {
    if (!activities || activities.length === 0) return;
    const plainText = activities.map(activity => `
## ${activity.name}

**${t.description}:**
${activity.description}

**${t.materials.toUpperCase()}:**
${activity.materials.map(mat => `- ${mat}`).join('\n')}

**${t.instructions.toUpperCase()}:**
${activity.instructions}
`).join('\n\n---\n');

    navigator.clipboard.writeText(plainText.trim());
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleDownloadPdf = () => {
    if (!activitiesRef.current) return;
    const input = activitiesRef.current;
    
    // Hide buttons during capture
    const buttons = input.querySelector('.action-buttons') as HTMLElement;
    if (buttons) buttons.style.display = 'none';

    html2canvas(input, { scale: 2 }).then(canvas => {
      // Restore buttons after capture
      if (buttons) buttons.style.display = 'flex';
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      // const pdfHeight = pdf.internal.pageSize.getHeight();
      const canvasWidth = canvas.width;
      const canvasHeight = canvas.height;
      const ratio = canvasWidth / canvasHeight;
      const width = pdfWidth - 20; // with margin
      let height = width / ratio;
      let position = 10;
      
      const pageHeight = pdf.internal.pageSize.getHeight() - 20;
      let heightLeft = height;

      pdf.addImage(imgData, 'PNG', 10, position, width, height);
      heightLeft -= pageHeight;
      
      while (heightLeft > 0) {
        position = heightLeft - height + 10; // top margin
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 10, position, width, height);
        heightLeft -= pageHeight;
      }
      
      pdf.save(`creative-activities-${theme.replace(/ /g, '-')}.pdf`);
    });
  };

  const cardThemes = [
    {
      bg: 'bg-teal-50',
      border: 'border-teal-300',
      headerText: 'text-teal-800',
      iconBg: 'bg-teal-100',
      iconText: 'text-teal-600',
    },
    {
      bg: 'bg-amber-50',
      border: 'border-amber-300',
      headerText: 'text-amber-800',
      iconBg: 'bg-amber-100',
      iconText: 'text-amber-600',
    },
    {
      bg: 'bg-rose-50',
      border: 'border-rose-300',
      headerText: 'text-rose-800',
      iconBg: 'bg-rose-100',
      iconText: 'text-rose-600',
    },
    {
      bg: 'bg-indigo-50',
      border: 'border-indigo-300',
      headerText: 'text-indigo-800',
      iconBg: 'bg-indigo-100',
      iconText: 'text-indigo-600',
    },
  ];

  return (
    <div>
      <Card title={t.generateCreativeActivities}>
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
            <div className="md:col-span-3">
              <label htmlFor="theme" className="block text-sm font-medium text-gray-700">{t.themeTopic}</label>
              <input type="text" id="theme" value={theme} onChange={(e) => setTheme(e.target.value)} className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
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
            <div>
              <label htmlFor="activityType" className="block text-sm font-medium text-gray-700">{t.activityType}</label>
              <select id="activityType" value={activityType} onChange={(e) => setActivityType(e.target.value)} className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
                <option>Group Project</option>
                <option>Individual Game</option>
                <option>Icebreaker</option>
                <option>Debate</option>
              </select>
            </div>
          </div>
          <button type="submit" disabled={isLoading} className="mt-4 w-full inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-300">
            {isLoading ? t.generating : t.generateIdeas}
          </button>
        </form>
      </Card>

      <div className="mt-8">
        {isLoading && <Card><div className="text-center">{t.brainstorming}</div></Card>}
        {error && <Card><div className="text-center text-red-500">{error}</div></Card>}
        {activities.length > 0 && (
          <div ref={activitiesRef} className="p-1">
            <div className="action-buttons flex items-center justify-end gap-3 mb-4">
                  <button onClick={handleDownloadPdf} className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                    {t.downloadPdf}
                  </button>
                  <button onClick={handleCopy} className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                    {isCopied ? t.copied : t.copy}
                  </button>
              </div>
            <div className="space-y-6">
              {activities.map((activity, index) => {
                const theme = cardThemes[index % cardThemes.length];
                return (
                  <Card key={index} className={`border ${theme.border} ${theme.bg}`}>
                    <div className="flex items-center gap-4 mb-4">
                        <div className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center ${theme.iconBg}`}>
                            <svg xmlns="http://www.w3.org/2000/svg" className={`h-6 w-6 ${theme.iconText}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                            </svg>
                        </div>
                        <h4 className={`text-xl font-bold ${theme.headerText}`}>{activity.name}</h4>
                    </div>
                    <div className="space-y-4 pl-16">
                      <p className="text-gray-600">{activity.description}</p>
                      <div>
                        <h5 className="font-semibold text-gray-800">{t.materials}</h5>
                        <ul className="list-disc list-inside text-gray-600">
                          {activity.materials.map((m, i) => <li key={i}>{m}</li>)}
                        </ul>
                      </div>
                      <div>
                        <h5 className="font-semibold text-gray-800">{t.instructions}</h5>
                         <ol className="list-decimal list-inside text-gray-600 space-y-1 mt-2">
                            {activity.instructions.split(/\d+\.\s*/).filter(step => step.trim()).map((instruction, i) => (
                                <li key={i}>{instruction.trim()}</li>
                            ))}
                          </ol>
                      </div>
                    </div>
                  </Card>
                )
            })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ActivityGenerator;