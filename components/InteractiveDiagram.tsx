import React, { useState, useRef, useEffect } from 'react';
import { generateInteractiveDiagram } from '../services/geminiService';
import Card from './Card';
import { translations, Language } from '../translations';
import { Annotation } from '../types';

interface InteractiveDiagramProps {
  language: Language;
}

const InteractiveDiagram: React.FC<InteractiveDiagramProps> = ({ language }) => {
  const t = translations[language];
  const [concept, setConcept] = useState('The Water Cycle');
  const [style, setStyle] = useState('Vibrant');
  const [diagramType, setDiagramType] = useState('Illustration');
  const [diagram, setDiagram] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Interaction & Annotation state
  const [isEditingAnnotations, setIsEditingAnnotations] = useState(false);
  const [annotations, setAnnotations] = useState<Annotation[]>([]);
  const diagramContainerRef = useRef<HTMLDivElement>(null);
  const [activeDragId, setActiveDragId] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [activeNodeId, setActiveNodeId] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setDiagram(null);
    setAnnotations([]); // Clear annotations for new diagram
    setIsEditingAnnotations(false);
    setActiveNodeId(null);
    try {
      const result = await generateInteractiveDiagram(concept, style, diagramType, language);
      setDiagram(result);
    } catch (err) {
      setError(t.errorGenerateDiagram);
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Effect to add click handlers for revealing details
  useEffect(() => {
    if (!diagram || !diagramContainerRef.current) return;
    
    const svgContainer = diagramContainerRef.current;
    const interactiveGroups = svgContainer.querySelectorAll('.interactive-group');
    
    const handleClick = (e: Event) => {
      // Don't trigger if we are in annotation mode
      if (isEditingAnnotations) return;

      const target = e.currentTarget as SVGElement;
      const id = target.id;
      
      setActiveNodeId(prevId => prevId === id ? null : id); // Toggle active state
      e.stopPropagation();
    };

    interactiveGroups.forEach(group => {
      group.addEventListener('click', handleClick);
    });

    return () => {
      interactiveGroups.forEach(group => {
        group.removeEventListener('click', handleClick);
      });
    };
  }, [diagram, isEditingAnnotations]);

  // Effect to manage the 'active' class on SVG nodes based on state
  useEffect(() => {
    if (!diagramContainerRef.current) return;

    const svgContainer = diagramContainerRef.current;
    const allGroups = svgContainer.querySelectorAll('.interactive-group');
    
    allGroups.forEach(group => {
      if (group.id === activeNodeId) {
        group.classList.add('active');
      } else {
        group.classList.remove('active');
      }
    });
  }, [activeNodeId]);


  const handleContainerClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isEditingAnnotations || !diagramContainerRef.current) return;
    // Prevent adding a note when clicking on an existing annotation or an interactive SVG element
    if ((e.target as HTMLElement).closest('.annotation-note, .interactive-group')) return;

    const rect = diagramContainerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const newAnnotation: Annotation = {
      id: crypto.randomUUID(),
      x,
      y,
      text: t.typeYourNote,
    };
    setAnnotations(prev => [...prev, newAnnotation]);
  };

  const handleAnnotationTextChange = (id: string, text: string) => {
    setAnnotations(prev => prev.map(ann => ann.id === id ? { ...ann, text } : ann));
  };

  const handleDeleteAnnotation = (id: string) => {
    setAnnotations(prev => prev.filter(ann => ann.id !== id));
  };
  
  const handleDragStart = (e: React.MouseEvent<HTMLDivElement>, id: string) => {
    if (!isEditingAnnotations) return;
    const annotationElement = e.currentTarget;
    const startX = e.clientX;
    const startY = e.clientY;
    const { left, top } = annotationElement.getBoundingClientRect();
    
    setDragOffset({ x: startX - left, y: startY - top });
    setActiveDragId(id);
    e.stopPropagation();
  };

  useEffect(() => {
    if (!activeDragId || !diagramContainerRef.current) return;

    const containerRect = diagramContainerRef.current.getBoundingClientRect();

    const handleDrag = (e: MouseEvent) => {
        const newX = e.clientX - containerRect.left - dragOffset.x;
        const newY = e.clientY - containerRect.top - dragOffset.y;

        setAnnotations(prev => prev.map(ann => 
            ann.id === activeDragId 
            ? { ...ann, x: newX, y: newY } 
            : ann
        ));
    };

    const handleDragEnd = () => {
        setActiveDragId(null);
    };

    window.addEventListener('mousemove', handleDrag);
    window.addEventListener('mouseup', handleDragEnd);

    return () => {
        window.removeEventListener('mousemove', handleDrag);
        window.removeEventListener('mouseup', handleDragEnd);
    };
  }, [activeDragId, dragOffset]);

  return (
    <div>
      <Card title={t.generateDiagram}>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
          <div className="md:col-span-2">
            <label htmlFor="concept" className="block text-sm font-medium text-gray-700">{t.diagramConcept}</label>
            <input type="text" id="concept" value={concept} onChange={(e) => setConcept(e.target.value)} className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
          </div>
           <div>
            <label htmlFor="diagramType" className="block text-sm font-medium text-gray-700">{t.diagramType}</label>
            <select id="diagramType" value={diagramType} onChange={(e) => setDiagramType(e.target.value)} className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
                <option value="Illustration">{t.illustration}</option>
                <option value="Mind Map">{t.mindMap}</option>
                <option value="Flowchart">{t.flowchart}</option>
            </select>
          </div>
          <div>
            <label htmlFor="style" className="block text-sm font-medium text-gray-700">{t.visualStyle}</label>
            <select id="style" value={style} onChange={(e) => setStyle(e.target.value)} className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
              <option value="Vibrant">{t.vibrant}</option>
              <option value="Minimalist">{t.minimalist}</option>
              <option value="Monochromatic">{t.monochromatic}</option>
            </select>
          </div>
          <div className="md:col-span-4">
            <button type="submit" disabled={isLoading} className="w-full inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-300">
              {isLoading ? t.illustrating : t.generateIllustration}
            </button>
          </div>
        </form>
      </Card>

      <div className="mt-8">
        {isLoading && <Card><div className="text-center">{t.illustrating}...</div></Card>}
        {error && <Card><div className="text-center text-red-500">{error}</div></Card>}
        {diagram && (
          <Card>
            <div className="flex justify-between items-center mb-4">
                <p className="text-sm text-gray-500">{t.clickToReveal} {isEditingAnnotations ? t.clickToAddNote : ''}</p>
                <button 
                    onClick={() => setIsEditingAnnotations(!isEditingAnnotations)} 
                    className={`px-4 py-2 text-sm font-medium rounded-md ${isEditingAnnotations ? 'bg-red-500 text-white' : 'bg-gray-200 text-gray-800'}`}>
                    {isEditingAnnotations ? t.exitEditMode : t.annotate}
                </button>
            </div>
            <div
              ref={diagramContainerRef}
              onClick={handleContainerClick}
              className="relative w-full border border-gray-200 rounded-lg overflow-hidden"
              style={{ cursor: isEditingAnnotations ? 'crosshair' : 'default' }}
            >
              <div dangerouslySetInnerHTML={{ __html: diagram }} />
              {annotations.map(ann => (
                <div
                  key={ann.id}
                  className="annotation-note absolute"
                  style={{ left: `${ann.x}px`, top: `${ann.y}px`, cursor: isEditingAnnotations ? 'move' : 'default' }}
                  onMouseDown={(e) => handleDragStart(e, ann.id)}
                >
                  <div className="relative p-2 bg-yellow-200 rounded-md shadow-lg">
                    <textarea
                      value={ann.text}
                      onChange={(e) => handleAnnotationTextChange(ann.id, e.target.value)}
                      readOnly={!isEditingAnnotations}
                      className="w-48 h-24 p-1 bg-transparent border-none focus:ring-0 resize-none text-sm text-gray-800"
                      placeholder={t.typeYourNote}
                    />
                    {isEditingAnnotations && (
                       <button onClick={() => handleDeleteAnnotation(ann.id)} className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center text-xs font-bold">
                           &times;
                       </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};

export default InteractiveDiagram;