import React, { useState } from 'react';
import { generateSlides } from '../services/geminiService';
import Card from './Card';
import { translations, Language } from '../translations';

interface SlideGeneratorProps {
  language: Language;
}

const SlideGenerator: React.FC<SlideGeneratorProps> = ({ language }) => {
  const t = translations[language];
  const [topic, setTopic] = useState('The History of the Internet');
  const [audience, setAudience] = useState('8th Grade Students');
  const [numSlides, setNumSlides] = useState(7);
  const [generatedPrompt, setGeneratedPrompt] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setGeneratedPrompt(null);
    setIsCopied(false);
    try {
      const result = await generateSlides(topic, audience, numSlides, language);
      setGeneratedPrompt(result);
    } catch (err) {
      setError(t.errorGeneratePrompt);
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    if (!generatedPrompt) return;
    navigator.clipboard.writeText(generatedPrompt);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <div>
        <Card title={t.generatePromptForSlides}>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                <div className="md:col-span-2">
                    <label htmlFor="topic" className="block text-sm font-medium text-gray-700">{t.presentationTopic}</label>
                    <input type="text" id="topic" value={topic} onChange={(e) => setTopic(e.target.value)} className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
                </div>
                <div>
                    <label htmlFor="audience" className="block text-sm font-medium text-gray-700">{t.targetAudience}</label>
                    <input type="text" id="audience" value={audience} onChange={(e) => setAudience(e.target.value)} className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
                </div>
                <div>
                    <label htmlFor="numSlides" className="block text-sm font-medium text-gray-700">{t.numSlides}</label>
                    <input type="number" id="numSlides" value={numSlides} min="3" max="20" onChange={(e) => setNumSlides(Number(e.target.value))} className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
                </div>
                <div className="md:col-span-4">
                    <button type="submit" disabled={isLoading} className="w-full inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-300">
                    {isLoading ? t.generatingPrompt : t.generatePrompt}
                    </button>
                </div>
            </form>
        </Card>

        <div className="mt-8">
            {isLoading && <Card><div className="text-center">{t.generatingPrompt}...</div></Card>}
            {error && <Card><div className="text-center text-red-500">{error}</div></Card>}
            {generatedPrompt && (
                <Card title={t.generatedPromptTitle}>
                    <div className="relative">
                        <button 
                            onClick={handleCopy}
                            className="absolute top-2 right-2 px-3 py-1 bg-gray-700 text-white text-xs font-bold rounded-md hover:bg-gray-800"
                        >
                            {isCopied ? t.promptCopied : t.copyPrompt}
                        </button>
                        <p className="text-sm text-gray-600 mb-4">{t.promptInstructions}</p>
                        <pre className="p-4 bg-slate-100 rounded-md text-sm text-gray-800 whitespace-pre-wrap font-sans">
                            {generatedPrompt}
                        </pre>
                    </div>
                </Card>
            )}
        </div>
    </div>
  );
};

export default SlideGenerator;