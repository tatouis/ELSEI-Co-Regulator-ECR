'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Save, RotateCcw, AlertTriangle, CheckCircle2, 
    Terminal, Info, Book, FileCode, MousePointer2,
    HelpCircle, Sparkles, ChevronRight
} from 'lucide-react';
import Navbar from '@/components/Navbar';

interface Variable {
    name: string;
    description: string;
    example: string;
}

const VARIABLES: Variable[] = [
    { name: 'interventionType', description: 'Estrategia seleccionada (ej: reflective_prompt)', example: 'reflective_prompt' },
    { name: 'studentName', description: 'Nombre completo del alumno', example: 'Juan Pérez' },
    { name: 'moduleCode', description: 'Código del módulo actual', example: 'M112' },
    { name: 'moduleTitle', description: 'Título descriptivo del curso', example: 'Soporte Vital Avanzado' },
    { name: 'activityType', description: 'Tipo de recurso (quiz, reading, video)', example: 'quiz' },
    { name: 'CL', description: 'Carga Cognitiva (low, medium, high)', example: 'high' },
    { name: 'ATT', description: 'Nivel de Atención (low, medium, high)', example: 'low' },
    { name: 'MOT', description: 'Nivel de Motivación (low, medium, high)', example: 'medium' },
    { name: 'confidence', description: 'Confianza estimada (0.0 a 1.0)', example: '0.45' },
    { name: 'retries', description: 'Número de reintentos en la actividad', example: '3' },
    { name: 'errorRatePct', description: 'Porcentaje de error detectado', example: '75' },
];

import { useTranslation } from '@/lib/LanguageContext';

export default function PromptManagement() {
    const { t } = useTranslation();
    const VARIABLES: Variable[] = [
        { name: 'interventionType', description: 'Selected strategy (e.g., reflective_prompt)', example: 'reflective_prompt' },
        { name: 'studentName', description: 'Full name of the learner', example: 'John Doe' },
        { name: 'moduleCode', description: 'Current module code', example: 'M112' },
        { name: 'moduleTitle', description: 'Descriptive title of the course', example: 'Advanced Life Support' },
        { name: 'activityType', description: 'Resource type (quiz, reading, video)', example: 'quiz' },
        { name: 'CL', description: 'Cognitive Load (low, medium, high)', example: 'high' },
        { name: 'ATT', description: 'Attention Level (low, medium, high)', example: 'low' },
        { name: 'MOT', description: 'Motivation Level (low, medium, high)', example: 'medium' },
        { name: 'confidence', description: 'Estimated confidence (0.0 to 1.0)', example: '0.45' },
        { name: 'retries', description: 'Number of retries in the activity', example: '3' },
        { name: 'errorRatePct', description: 'Detected error percentage', example: '75' },
    ];

    const [prompts, setPrompts] = useState<Record<string, string>>({
        intervene_system_instruction: '',
        intervene_developer_prompt: ''
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [status, setStatus] = useState<{ type: 'success' | 'error', msg: string } | null>(null);
    const [activeField, setActiveField] = useState<'system' | 'developer' | null>(null);
    
    const systemRef = useRef<HTMLTextAreaElement>(null);
    const developerRef = useRef<HTMLTextAreaElement>(null);

    useEffect(() => {
        fetch('/api/admin/prompts')
            .then(res => res.json())
            .then(data => {
                setPrompts({
                    intervene_system_instruction: data.intervene_system_instruction || '',
                    intervene_developer_prompt: data.intervene_developer_prompt || ''
                });
                setLoading(false);
            })
            .catch(err => {
                console.error('Failed to load prompts:', err);
                setLoading(false);
            });
    }, []);

    const handleSave = async (key: string) => {
        setSaving(true);
        setStatus(null);
        try {
            const res = await fetch('/api/admin/prompts', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ key, value: prompts[key] })
            });
            if (res.ok) {
                setStatus({ type: 'success', msg: `${key.replace('intervene_', '').replace(/_/g, ' ')} saved.` });
            } else {
                setStatus({ type: 'error', msg: 'API Error.' });
            }
        } catch (err) {
            setStatus({ type: 'error', msg: 'Network Error.' });
        } finally {
            setSaving(false);
            setTimeout(() => setStatus(null), 3000);
        }
    };

    const insertVariable = (varName: string) => {
        const field = activeField === 'system' ? 'intervene_system_instruction' : 'intervene_developer_prompt';
        const ref = activeField === 'system' ? systemRef : developerRef;
        
        if (!ref.current) return;

        const start = ref.current.selectionStart;
        const end = ref.current.selectionEnd;
        const text = prompts[field];
        const placeholder = `{{${varName}}}`;
        
        const newText = text.substring(0, start) + placeholder + text.substring(end);
        
        setPrompts({ ...prompts, [field]: newText });
        
        setTimeout(() => {
            if (ref.current) {
                ref.current.focus();
                ref.current.setSelectionRange(start + placeholder.length, start + placeholder.length);
            }
        }, 10);
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center text-indigo-600 bg-white">
                <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen text-slate-900 selection:bg-indigo-500/10 font-sans">
            <Navbar />
            
            <div className="max-w-[1600px] mx-auto px-6 pt-24 pb-12">
                {/* Header */}
                <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div>
                        <div className="flex items-center gap-2 text-indigo-600 mb-2">
                            <Sparkles className="w-5 h-5 animate-pulse" />
                            <span className="text-[10px] font-black uppercase tracking-[0.2em]">IA Engine Orchestrator</span>
                        </div>
                        <h1 className="text-4xl font-black bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-indigo-600">
                            {t('admin.prompts.title')}
                        </h1>
                        <p className="text-slate-500 mt-2 font-light max-w-2xl">
                            {t('admin.prompts.description')}
                        </p>
                    </div>

                    <AnimatePresence>
                        {status && (
                            <motion.div 
                                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }}
                                className={`px-6 py-3 rounded-2xl flex items-center gap-3 border shadow-2xl backdrop-blur-xl ${
                                    status.type === 'success' ? 'bg-emerald-50 border-emerald-100 text-emerald-700' : 'bg-rose-50 border-rose-100 text-rose-700'
                                }`}
                            >
                                {status.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
                                <span className="text-sm font-black uppercase tracking-wider">{status.msg}</span>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    
                    {/* LEFT: Prompt Editors */}
                    <div className="lg:col-span-8 space-y-8">
                        {/* System Instruction */}
                        <div className="bg-white rounded-[2.5rem] border border-slate-100 p-8 shadow-2xl shadow-indigo-500/5 relative group transition-all hover:shadow-indigo-500/10">
                            <div className="flex items-center justify-between mb-8">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 border border-indigo-100">
                                        <Shield className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h3 className="font-black text-slate-800 text-lg">System Instruction</h3>
                                        <p className="text-[10px] text-indigo-500 uppercase tracking-[0.2em] font-black">Global Agent Identity</p>
                                    </div>
                                </div>
                                <button 
                                    onClick={() => handleSave('intervene_system_instruction')}
                                    disabled={saving}
                                    className="px-8 py-4 bg-slate-900 text-white hover:bg-indigo-600 disabled:bg-slate-200 disabled:text-slate-400 rounded-2xl text-xs font-black transition-all flex items-center gap-2 shadow-xl shadow-slate-200"
                                >
                                    <Save className="w-4 h-4" />
                                    {saving ? 'SAVING...' : 'SAVE CHANGES'}
                                </button>
                            </div>

                            <textarea
                                ref={systemRef}
                                value={prompts.intervene_system_instruction}
                                onFocus={() => setActiveField('system')}
                                onChange={(e) => setPrompts({ ...prompts, intervene_system_instruction: e.target.value })}
                                className="w-full h-[350px] bg-slate-50 text-indigo-900 p-8 rounded-3xl font-mono text-sm leading-relaxed focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500/30 focus:bg-white outline-none border border-slate-100 resize-none transition-all shadow-inner placeholder:text-slate-300"
                                placeholder="Define AI role..."
                            />
                            
                            <div className="mt-4 flex items-center gap-2 text-slate-500 text-[10px]">
                                <Info className="w-3 h-3" />
                                <span>Define **who** the agent is here. Do not use dynamic variables in this field.</span>
                            </div>
                        </div>

                        {/* Developer Prompt */}
                        <div className="bg-white rounded-[2.5rem] border border-slate-100 p-8 shadow-2xl shadow-violet-500/5 relative group transition-all hover:shadow-violet-500/10">
                            <div className="flex items-center justify-between mb-8">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-2xl bg-violet-50 flex items-center justify-center text-violet-600 border border-violet-100">
                                        <Terminal className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h3 className="font-black text-slate-800 text-lg">Developer / User Prompt</h3>
                                        <p className="text-[10px] text-violet-500 uppercase tracking-[0.2em] font-black">Dynamic Context & Data Injection</p>
                                    </div>
                                </div>
                                <button 
                                    onClick={() => handleSave('intervene_developer_prompt')}
                                    disabled={saving}
                                    className="px-8 py-4 bg-slate-900 text-white hover:bg-violet-600 disabled:bg-slate-200 disabled:text-slate-400 rounded-2xl text-xs font-black transition-all flex items-center gap-2 shadow-xl shadow-slate-200"
                                >
                                    <Save className="w-4 h-4" />
                                    {saving ? 'SAVING...' : 'SAVE CHANGES'}
                                </button>
                            </div>

                            <textarea
                                ref={developerRef}
                                value={prompts.intervene_developer_prompt}
                                onFocus={() => setActiveField('developer')}
                                onChange={(e) => setPrompts({ ...prompts, intervene_developer_prompt: e.target.value })}
                                className="w-full h-[450px] bg-slate-50 text-violet-900 p-8 rounded-3xl font-mono text-sm leading-relaxed focus:ring-4 focus:ring-violet-500/10 focus:border-violet-500/30 focus:bg-white outline-none border border-slate-100 resize-none transition-all shadow-inner placeholder:text-slate-300"
                                placeholder="Define how AI uses data..."
                            />

                            <div className="mt-4 flex items-center gap-2 text-slate-500 text-[10px]">
                                <FileCode className="w-3 h-3 text-violet-400" />
                                <span>Use variables from the right with double braces: `{"{{variable}}"}`.</span>
                            </div>
                        </div>
                    </div>

                    {/* RIGHT: Variables & Help */}
                    <div className="lg:col-span-4 space-y-8">
                        {/* Variable Toolbox */}
                        <section className="bg-white rounded-[2.5rem] border border-slate-100 p-8 shadow-2xl shadow-indigo-500/5 sticky top-24 transition-all hover:shadow-indigo-500/10">
                            <div className="flex items-center gap-4 mb-8">
                                <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 border border-indigo-100">
                                    <Book className="w-6 h-6" />
                                </div>
                                <h2 className="text-xl font-black italic tracking-tight text-slate-800">Variables Toolbox</h2>
                            </div>

                            <p className="text-xs text-slate-500 mb-8 font-medium leading-relaxed">
                                Click on a variable to insert it at the current cursor position in the active editor.
                            </p>

                            <div className="space-y-4">
                                {VARIABLES.map((v) => (
                                    <div 
                                        key={v.name}
                                        onClick={() => insertVariable(v.name)}
                                        className="group p-5 rounded-2xl bg-slate-50 border border-slate-100 hover:bg-white hover:border-indigo-400 hover:shadow-lg hover:shadow-indigo-500/5 transition-all cursor-pointer flex flex-col gap-1.5"
                                    >
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm font-black text-indigo-600">{"{{" + v.name + "}}"}</span>
                                            <MousePointer2 className="w-4 h-4 text-indigo-400 opacity-0 group-hover:opacity-100 transition-all translate-x-2 group-hover:translate-x-0" />
                                        </div>
                                        <p className="text-[10px] text-slate-500 font-medium">{v.description}</p>
                                        <div className="mt-2 text-[9px] font-mono text-slate-400 truncate italic">
                                            Example: {v.example}
                                        </div>
                                    </div>
                                ))}
                            </div>

                             {/* Help Section */}
                             <div className="mt-8 pt-8 border-t border-slate-100">
                                 <h3 className="text-xs font-black uppercase tracking-[0.2em] text-indigo-600 mb-6 flex items-center gap-2">
                                     <HelpCircle className="w-4 h-4" /> Structure Guide
                                 </h3>
                                 <div className="space-y-5">
                                     <div className="flex gap-4">
                                         <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-indigo-500 shrink-0" />
                                         <p className="text-[10px] text-slate-500 leading-relaxed font-medium">
                                             <strong className="text-slate-700">System:</strong> Defines personality. E.g., "You are a Socratic mentor who never gives direct answers".
                                         </p>
                                     </div>
                                     <div className="flex gap-4">
                                         <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-violet-500 shrink-0" />
                                         <p className="text-[10px] text-slate-500 leading-relaxed font-medium">
                                             <strong className="text-slate-700">Developer:</strong> Defines data usage. E.g., "The student has load `{"{{CL}}"}`. Generate advice".
                                         </p>
                                     </div>
                                 </div>
                             </div>
                         </section>
                    </div>
                </div>
            </div>

            <style jsx global>{`
                .glass {
                    background: rgba(255, 255, 255, 0.7);
                    backdrop-filter: blur(40px);
                    -webkit-backdrop-filter: blur(40px);
                }
                textarea::-webkit-scrollbar {
                    width: 6px;
                }
                textarea::-webkit-scrollbar-thumb {
                    background: rgba(0, 0, 0, 0.05);
                    border-radius: 10px;
                }
            `}</style>
        </div>
    );
}

function Shield(props: any) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/></svg>
  )
}
