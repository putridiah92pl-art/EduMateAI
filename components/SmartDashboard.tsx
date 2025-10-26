import React, { useState, useRef, useEffect } from 'react';
import { generateDashboardInsights } from '../services/geminiService';
import { DashboardInsights } from '../types';
import Card from './Card';
import { translations, Language } from '../translations';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';


// The data can now have any string keys
type StudentData = Record<string, string | number>;

const initialSampleData: StudentData[] = [
    { name: "Alice Johnson", "Assignment 1 Score": 92, "Participation": "High", "Notes": "Very engaged in discussions." },
    { name: "Bob Williams", "Assignment 1 Score": 78, "Participation": "Medium", "Notes": "Struggled with the homework." },
    { name: "Charlie Brown", "Assignment 1 Score": 61, "Participation": "Low", "Notes": "Often distracted." },
    { name: "Diana Miller", "Assignment 1 Score": 98, "Participation": "High", "Notes": "Helps other students." },
    { name: "Ethan Davis", "Assignment 1 Score": 79, "Participation": "Medium", "Notes": "" },
    { name: "Fiona Garcia", "Assignment 1 Score": 52, "Participation": "Low", "Notes": "Missed the last two classes." },
];
const initialHeaders = ['name', 'Assignment 1 Score', 'Participation', 'Notes'];

const tierStyles: { [key: string]: { bgColor: string; borderColor: string; textColor: string; chartColor: string; accentColor: string; } } = {
    'High': { bgColor: 'bg-mint-green', borderColor: 'border-green-400', textColor: 'text-green-900', chartColor: '#34d399', accentColor: 'bg-green-400' },
    'Medium': { bgColor: 'bg-warm-sand', borderColor: 'border-amber-400', textColor: 'text-amber-900', chartColor: '#fcd34d', accentColor: 'bg-amber-400' },
    'At-Risk': { bgColor: 'bg-red-100', borderColor: 'border-coral-peach', textColor: 'text-red-900', chartColor: '#FF8B6A', accentColor: 'bg-coral-peach' },
};

const getTierStyle = (tier: string) => {
    if (!tier) return tierStyles['Medium'];
    const normalizedTier = tier.toLowerCase().replace(/\s+/g, '');
    if (normalizedTier.includes('high')) return tierStyles['High'];
    if (normalizedTier.includes('at-risk') || normalizedTier.includes('atrisk')) return tierStyles['At-Risk'];
    return tierStyles['Medium'];
};

const SummaryIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-sky-blue" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>;
const TrendsIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-sky-blue" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>;
const ActionsIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-sky-blue" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>;
const TiersIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-sky-blue" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>;
const ChartIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-sky-blue" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>;

const SkeletonLoader = () => (
    <div className="space-y-8 animate-pulse">
        <div className="bg-gray-200 rounded-2xl h-32 w-full"></div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-gray-200 rounded-2xl h-48"></div>
            <div className="bg-gray-200 rounded-2xl h-48"></div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
            <div className="lg:col-span-3 bg-gray-200 rounded-2xl h-80"></div>
            <div className="lg:col-span-2 bg-gray-200 rounded-2xl h-80"></div>
        </div>
    </div>
);


interface SmartDashboardProps {
  language: Language;
}

const SmartDashboard: React.FC<SmartDashboardProps> = ({ language }) => {
  const t = translations[language];
  const [headers, setHeaders] = useState<string[]>(initialHeaders);
  const [manualData, setManualData] = useState<StudentData[]>(initialSampleData);
  const [insights, setInsights] = useState<DashboardInsights | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [editingHeader, setEditingHeader] = useState<string | null>(null);
  const insightsRef = useRef<HTMLDivElement>(null);
  const [isAddingColumn, setIsAddingColumn] = useState(false);
  const [newColumnName, setNewColumnName] = useState("");
  const [isInsightsVisible, setIsInsightsVisible] = useState(false);

  // Interaction States
  const [hoveredStudent, setHoveredStudent] = useState<string | null>(null);
  const [expandedStudent, setExpandedStudent] = useState<string | null>(null);

  const handleDataChange = (index: number, header: string, value: string) => {
    setManualData(prevData => 
        prevData.map((row, i) => 
            i === index ? { ...row, [header]: value } : row
        )
    );
  };

  const handleAddStudent = () => {
    setManualData(prevData => {
        const newStudent: StudentData = {};
        headers.forEach(header => {
            newStudent[header] = header.toLowerCase() === 'name' ? `New Student ${prevData.length + 1}` : '';
        });
        return [...prevData, newStudent];
    });
  };

  const handleDeleteStudent = (indexToDelete: number) => {
    const studentName = manualData[indexToDelete]?.name || 'this student';
    if (window.confirm(`${t.deleteStudentConfirm} ${studentName}?`)) {
      setManualData(prevData => prevData.filter((_, index) => index !== indexToDelete));
    }
  };

  const handleCommitNewColumn = () => {
    if (!newColumnName || newColumnName.trim() === '') {
        setIsAddingColumn(false);
        setNewColumnName("");
        return;
    }
    const trimmedHeader = newColumnName.trim();

    if (headers.some(h => h.toLowerCase() === trimmedHeader.toLowerCase())) {
        alert('A column with this name already exists.');
        return;
    }

    setHeaders(currentHeaders => [...currentHeaders, trimmedHeader]);
    setManualData(currentData =>
        currentData.map(student => ({
            ...student,
            [trimmedHeader]: '',
        }))
    );
    setIsAddingColumn(false);
    setNewColumnName("");
  };
  
  const handleNewColumnKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
        e.preventDefault();
        handleCommitNewColumn();
    }
    if (e.key === 'Escape') {
        setIsAddingColumn(false);
        setNewColumnName("");
    }
  };

  const handleDeleteColumn = (headerToDelete: string) => {
    if (window.confirm(t.deleteColumnConfirm.replace('{columnName}', headerToDelete))) {
        setHeaders(prevHeaders => prevHeaders.filter(h => h !== headerToDelete));
        setManualData(prevData =>
            prevData.map(student => {
                const { [headerToDelete]: _, ...rest } = student;
                return rest;
            })
        );
    }
  };
  
  const handleHeaderEdit = (oldHeader: string, newHeader: string) => {
    const trimmedNewHeader = newHeader.trim();

    if (trimmedNewHeader === oldHeader) {
        setEditingHeader(null);
        return;
    }
    if (trimmedNewHeader === '') {
        alert('Header name cannot be empty.');
        return;
    }
    if (headers.some(h => h.toLowerCase() === trimmedNewHeader.toLowerCase() && h !== oldHeader)) {
        alert('Header name already exists.');
        return;
    }
    
    setHeaders(prevHeaders => {
        const newHeaders = [...prevHeaders];
        const headerIndex = newHeaders.indexOf(oldHeader);
        if (headerIndex > -1) {
            newHeaders[headerIndex] = trimmedNewHeader;
        }
        return newHeaders;
    });

    setManualData(prevData =>
        prevData.map(student => {
            const { [oldHeader]: value, ...rest } = student;
            return { ...rest, [trimmedNewHeader]: value };
        })
    );
    
    setEditingHeader(null);
  };

  const handleFileUploadClick = () => {
      fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setError(null);
    const reader = new FileReader();

    reader.onload = (e) => {
        try {
            const content = e.target?.result;
            if (file.name.endsWith('.csv')) {
                Papa.parse(content as string, {
                    header: true,
                    skipEmptyLines: true,
                    dynamicTyping: true,
                    complete: (result) => {
                        if (result.errors.length > 0) {
                            setError("Error parsing CSV file.");
                            console.error(result.errors);
                            return;
                        }
                        setHeaders(result.meta.fields || []);
                        setManualData(result.data as StudentData[]);
                        setInsights(null);
                    },
                });
            } else if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
                const workbook = XLSX.read(content, { type: 'binary' });
                const sheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[sheetName];
                const jsonData = XLSX.utils.sheet_to_json(worksheet) as StudentData[];
                if (jsonData.length > 0) {
                    setHeaders(Object.keys(jsonData[0]));
                    setManualData(jsonData);
                    setInsights(null);
                }
            } else {
                setError("Unsupported file type. Please upload a CSV or Excel file.");
            }
        } catch (err) {
            setError("Error parsing file. Please check the file format.");
            console.error(err);
        }
    };

    reader.onerror = () => {
        setError("Error reading file.");
    };

    if (file.name.endsWith('.csv')) {
        reader.readAsText(file);
    } else {
        reader.readAsBinaryString(file);
    }
    event.target.value = '';
  };

  const handleGenerateInsights = async () => {
    if (manualData.length === 0) return;
    
    setIsLoading(true);
    setError(null);
    setInsights(null);
    setIsInsightsVisible(false);
    try {
      const result = await generateDashboardInsights(manualData, language);
      setInsights(result);
    } catch (err) {
      setError(t.errorGenerateInsights);
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
      if (insights) {
          setTimeout(() => setIsInsightsVisible(true), 100);
      }
  }, [insights]);

  const handleDownloadReport = () => {
    if (!insightsRef.current) return;
    const input = insightsRef.current;
    
    const buttons = input.querySelector('.action-buttons') as HTMLElement;
    if (buttons) buttons.style.visibility = 'hidden';

    html2canvas(input, { scale: 2, backgroundColor: '#FAFAFA' }).then(canvas => {
      if (buttons) buttons.style.visibility = 'visible';
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const canvasWidth = canvas.width;
      const canvasHeight = canvas.height;
      const ratio = canvasWidth / canvasHeight;
      const width = pdfWidth - 20; // with margin
      let height = width / ratio;
      
      const pageHeight = pdf.internal.pageSize.getHeight() - 20;
      let heightLeft = height;
      let position = 10;
      
      pdf.addImage(imgData, 'PNG', 10, position, width, height);
      heightLeft -= pageHeight;
      
      while (heightLeft > 0) {
        position = -heightLeft + 10;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 10, position, width, height);
        heightLeft -= pageHeight;
      }

      pdf.save(`class-insights-report.pdf`);
    });
  };

  const getScoreData = () => {
    const scoreHeaders = headers.filter(h => 
        (h.toLowerCase().includes('score') || h.toLowerCase().includes('nilai')) && 
        manualData.every(row => !isNaN(Number(row[h])) || row[h] === '' || row[h] === null)
    );
    
    if(scoreHeaders.length === 0) return { scoreHeaders: [], chartData: [] };

    const chartData = manualData.map(student => {
        const studentScores: { name: string | number } & Record<string, number> = { name: student.name };
        scoreHeaders.forEach(header => {
            studentScores[header] = Number(student[header]) || 0;
        });
        return studentScores;
    });

    return { scoreHeaders, chartData };
  };

  const { scoreHeaders, chartData } = getScoreData();
  const chartColors = ['#8884d8', '#82ca9d', '#ffc658', '#FF8B6A', '#0088FE', '#00C49F'];

  const TierBadge = ({ tier }: { tier: string }) => {
    const style = getTierStyle(tier);
    return (
        <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${style.bgColor} ${style.textColor}`}>
            {tier}
        </span>
    );
  };

  return (
    <div className="space-y-8">
        <Card>
            <h3 className="font-display text-2xl font-semibold text-brand-dark">{t.dashboardTitle}</h3>
            <p className="text-gray-600 mt-2">{t.dashboardDescriptionFull}</p>
        </Card>

        <Card title={t.manualInput}>
             <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                           {headers.map(header => (
                                <th key={header} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider group">
                                    {editingHeader === header ? (
                                        <input
                                            type="text"
                                            defaultValue={header}
                                            onBlur={(e) => handleHeaderEdit(header, e.target.value)}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter') handleHeaderEdit(header, (e.target as HTMLInputElement).value);
                                                else if (e.key === 'Escape') setEditingHeader(null);
                                            }}
                                            autoFocus
                                            className="w-full px-2 py-1 border border-sky-blue rounded-md shadow-sm focus:outline-none focus:ring-sky-blue"
                                        />
                                    ) : (
                                        <div className="flex items-center gap-2">
                                            <span className="font-semibold">{header}</span>
                                            {header.toLowerCase() !== 'name' && (
                                                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button onClick={() => setEditingHeader(header)} className="text-gray-400 hover:text-sky-blue" aria-label={`Edit column ${header}`}><svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.5L14.732 3.732z" /></svg></button>
                                                    <button onClick={() => handleDeleteColumn(header)} className="text-gray-400 hover:text-coral-peach" aria-label={`${t.deleteColumn} ${header}`}><svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg></button>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </th>
                            ))}
                            <th className="px-6 py-3 text-left">
                                {isAddingColumn ? (
                                    <input type="text" placeholder={t.newColumnPlaceholder} value={newColumnName} onChange={(e) => setNewColumnName(e.target.value)} onBlur={handleCommitNewColumn} onKeyDown={handleNewColumnKeyDown} autoFocus className="w-full px-2 py-1 border border-sky-blue rounded-md shadow-sm" />
                                ) : (
                                    <button onClick={() => setIsAddingColumn(true)} className="text-sky-blue hover:text-blue-600 transition-colors" aria-label={t.addColumn}><svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" /></svg></button>
                                )}
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {manualData.map((row, rowIndex) => (
                            <tr key={rowIndex} className="hover:bg-gray-50/50">
                                {headers.map(header => (
                                    <td key={`${rowIndex}-${header}`} className="px-6 py-4 whitespace-nowrap"><input type="text" value={row[header] ?? ''} onChange={(e) => handleDataChange(rowIndex, header, e.target.value)} className="w-full min-w-[100px] px-2 py-1 border border-gray-300 rounded-md focus:ring-sky-blue focus:border-sky-blue transition" /></td>
                                ))}
                                <td className="px-6 py-4 whitespace-nowrap text-center"><button onClick={() => handleDeleteStudent(rowIndex)} className="text-gray-400 hover:text-coral-peach" aria-label={`Delete student ${row.name}`}><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg></button></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
             </div>
             <div className="flex flex-wrap items-center justify-between gap-4 mt-6 border-t border-gray-200 pt-6">
                <div className="flex flex-wrap items-center gap-3">
                    <button onClick={handleFileUploadClick} className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-blue transition-colors" aria-label={t.uploadFile}><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>{t.uploadFile}</button>
                    <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel" />
                    <button onClick={handleAddStudent} className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-blue transition-colors" aria-label={t.addStudent}><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" /></svg>{t.addStudent}</button>
                </div>
                <button onClick={handleGenerateInsights} disabled={isLoading} className="inline-flex items-center justify-center py-3 px-6 border border-transparent shadow-lg text-base font-medium rounded-lg text-white bg-coral-peach hover:bg-red-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-coral-peach disabled:bg-red-300 disabled:cursor-not-allowed transition-transform hover:scale-105">
                    {isLoading ? <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg> : <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" /></svg>}
                    {isLoading ? t.analyzingData : t.generateInsights}
                </button>
             </div>
        </Card>
        
        {isLoading && <SkeletonLoader />}
        {error && <Card><div className="text-center text-coral-peach">{error}</div></Card>}

        {insights && (
             <div ref={insightsRef} className={`transition-opacity duration-700 ${isInsightsVisible ? 'opacity-100' : 'opacity-0'}`}>
                <div className="action-buttons flex justify-end mb-4">
                    <button onClick={handleDownloadReport} className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50"><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>{t.downloadReport}</button>
                </div>
                <div className="space-y-8">
                    <Card title={<div className="flex items-center gap-3"><SummaryIcon /> {t.overallPerformance}</div>} className="animate-fade-in-up" style={{ animationDelay: '0ms' }}>
                        <p className="text-gray-600 text-lg">{insights.summary}</p>
                    </Card>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <Card title={<div className="flex items-center gap-3"><TrendsIcon /> {t.keyTrends}</div>} className="animate-fade-in-up" style={{ animationDelay: '150ms' }}>
                            <ul className="list-none space-y-4">
                            {insights.trends.map((trend, i) => (
                                <li key={i} className="text-gray-700 flex items-start gap-3">
                                    <div className="flex-shrink-0 w-2 h-2 rounded-full bg-sky-blue mt-2"></div>
                                    <div><span className="font-semibold text-brand-dark">{trend.observation}:</span> {trend.implication}</div>
                                </li>
                            ))}
                            </ul>
                        </Card>
                        <Card title={<div className="flex items-center gap-3"><ActionsIcon /> {t.suggestedActions}</div>} className="animate-fade-in-up" style={{ animationDelay: '300ms' }}>
                             <div className="space-y-4">
                                {insights.suggestedActions.map((action, i) => (
                                <div key={i} className="bg-sky-blue/20 p-4 rounded-lg border border-sky-blue/30">
                                    <h5 className="font-semibold font-display text-blue-800">{action.title}</h5>
                                    <p className="mt-1 text-sm text-blue-900/80">{action.description}</p>
                                </div>
                                ))}
                            </div>
                        </Card>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                        <div className="lg:col-span-3">
                            {scoreHeaders.length > 0 && (
                              <Card title={<div className="flex items-center gap-3"><ChartIcon /> {t.studentPerformanceComparison}</div>} className="animate-fade-in-up" style={{ animationDelay: '450ms' }}>
                                  <ResponsiveContainer width="100%" height={400}>
                                      <BarChart data={chartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }} onMouseLeave={() => setHoveredStudent(null)}>
                                          <CartesianGrid strokeDasharray="3 3" />
                                          <XAxis dataKey="name" />
                                          <YAxis />
                                          <Tooltip />
                                          <Legend />
                                          {scoreHeaders.map((header, index) => (
                                              <Bar key={header} dataKey={header} fill={chartColors[index % chartColors.length]} onMouseEnter={(data) => setHoveredStudent(data.name)} />
                                          ))}
                                      </BarChart>
                                  </ResponsiveContainer>
                              </Card>
                            )}
                        </div>
                        <div className="lg:col-span-2">
                             <Card title={<div className="flex items-center gap-3"><TiersIcon /> {t.studentTiers}</div>} className="animate-fade-in-up" style={{ animationDelay: '600ms' }}>
                                <div className="space-y-3 max-h-[368px] overflow-y-auto pr-2">
                                    {insights.studentTiers.map(student => {
                                        const style = getTierStyle(student.tier);
                                        const isHovered = hoveredStudent === student.studentName;
                                        const isExpanded = expandedStudent === student.studentName;
                                        const handleToggleExpand = () => setExpandedStudent(prev => prev === student.studentName ? null : student.studentName);
                                        return (
                                            <div key={student.studentName} className={`p-3 rounded-lg border-l-4 cursor-pointer transition-all duration-300 ${style.borderColor} ${isHovered ? 'shadow-md scale-105' : 'shadow-sm'} ${isExpanded ? style.bgColor : 'bg-white hover:bg-gray-50'}`} onClick={handleToggleExpand}>
                                                <div className="flex justify-between items-center">
                                                    <p className="font-bold text-sm text-brand-dark">{student.studentName}</p>
                                                    <TierBadge tier={student.tier} />
                                                </div>
                                                <div className={`transition-all duration-300 ease-in-out overflow-hidden ${isExpanded ? 'max-h-40 mt-1' : 'max-h-0'}`}>
                                                    <p className="text-xs text-gray-600 pt-1">{student.reason}</p>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </Card>
                        </div>
                    </div>

                </div>
             </div>
        )}
    </div>
  );
};

export default SmartDashboard;