'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Save, RotateCcw, AlertTriangle, CheckCircle2, Terminal, Info } from 'lucide-react';
import Navbar from '@/components/Navbar';

export default function PromptManagement() {
    const [prompts, setPrompts] = useState<Record<string, string>>({
        intervene_system_instruction: '',
        intervene_developer_prompt: ''
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [status, setStatus] = useState<{ type: 'success' | 'error', msg: string } | null>(null);

    useEffect(() => {
        fetch('/api/admin/prompts')
            .then(res => res.json())
            .then(data => {
                setPrompts(data);
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
                setStatus({ type: 'success', msg: `${key.replace('intervene_', '').replace(/_/g, ' ')} guardado correctamente.` });
            } else {
                setStatus({ type: 'error', msg: 'Error al conectar con la API.' });
            }
        } catch (err) {
            setStatus({ type: 'error', msg: 'Error de red al guardar.' });
        } finally {
            setSaving(false);
            setTimeout(() => setStatus(null), 3000);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center">
                <div className="w-8 h-8 border-4 border-violet-600 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#f8fafc]">
            <Navbar />
            
            <div className="max-w-7xl mx-auto px-4 py-8">
                {/* Header */}
                <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-2 text-violet-600 mb-1">
                            <Terminal className="w-5 h-5" />
                            <span className="text-xs font-bold uppercase tracking-widest">IA Engine</span>
                        </div>
                        <h1 className="text-3xl font-bold text-slate-800">Gestión de Prompts</h1>
                        <p className="text-slate-500 mt-1">Ajusta las instrucciones de comportamiento de Gemini para las intervenciones de tutoría.</p>
                    </div>

                    <AnimatePresence>
                        {status && (
                            <motion.div 
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className={`px-4 py-2 rounded-xl flex items-center gap-2 border ${
                                    status.type === 'success' ? 'bg-emerald-50 border-emerald-100 text-emerald-700' : 'bg-rose-50 border-rose-100 text-rose-700'
                                }`}
                            >
                                {status.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
                                <span className="text-sm font-medium">{status.msg}</span>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* System Instruction */}
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="glass rounded-3xl border border-white p-6 shadow-xl shadow-slate-200/50"
                    >
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-lg bg-violet-100 flex items-center justify-center text-violet-600">
                                    <Info className="w-4 h-4" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-slate-800 text-sm">System Instruction</h3>
                                    <p className="text-[10px] text-slate-400">Identidad y reglas básicas del modelo</p>
                                </div>
                            </div>
                            <button 
                                onClick={() => handleSave('intervene_system_instruction')}
                                disabled={saving}
                                className="flex items-center gap-2 px-4 py-2 bg-violet-600 hover:bg-violet-700 disabled:bg-violet-300 text-white rounded-xl text-xs font-bold transition-all shadow-lg shadow-violet-200"
                            >
                                <Save className="w-3.5 h-3.5" />
                                {saving ? 'Guardando...' : 'Guardar'}
                            </button>
                        </div>

                        <div className="relative group">
                            <textarea
                                value={prompts.intervene_system_instruction}
                                onChange={(e) => setPrompts({ ...prompts, intervene_system_instruction: e.target.value })}
                                className="w-full h-[400px] bg-slate-900 text-slate-300 p-4 rounded-2xl font-mono text-xs leading-relaxed focus:ring-2 focus:ring-violet-500 outline-none border-none resize-none shadow-inner"
                                placeholder="Escribe aquí las instrucciones de sistema..."
                            />
                            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <span className="text-[10px] text-slate-500 font-mono">system_instruction</span>
                            </div>
                        </div>
                    </motion.div>

                    {/* Developer Prompt */}
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="glass rounded-3xl border border-white p-6 shadow-xl shadow-slate-200/50"
                    >
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center text-indigo-600">
                                    <Terminal className="w-4 h-4" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-slate-800 text-sm">Developer Prompt</h3>
                                    <p className="text-[10px] text-slate-400">Contexto dinámico y placeholders de datos</p>
                                </div>
                            </div>
                            <button 
                                onClick={() => handleSave('intervene_developer_prompt')}
                                disabled={saving}
                                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 text-white rounded-xl text-xs font-bold transition-all shadow-lg shadow-indigo-200"
                            >
                                <Save className="w-3.5 h-3.5" />
                                {saving ? 'Guardando...' : 'Guardar'}
                            </button>
                        </div>

                        <div className="relative group">
                            <textarea
                                value={prompts.intervene_developer_prompt}
                                onChange={(e) => setPrompts({ ...prompts, intervene_developer_prompt: e.target.value })}
                                className="w-full h-[400px] bg-slate-900 text-indigo-200/80 p-4 rounded-2xl font-mono text-xs leading-relaxed focus:ring-2 focus:ring-indigo-500 outline-none border-none resize-none shadow-inner"
                                placeholder="Escribe aquí el prompt con variables..."
                            />
                            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                                <span className="text-[10px] text-slate-500 font-mono">user_prompt</span>
                            </div>
                        </div>

                        <div className="mt-4 p-3 bg-indigo-50/50 rounded-xl border border-indigo-100">
                            <p className="text-[10px] font-bold text-indigo-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                                <RotateCcw className="w-3 h-3" /> Placeholders Disponibles
                            </p>
                            <div className="flex flex-wrap gap-1.5">
                                {['interventionType', 'quizActive', 'CL', 'ATT', 'MOT', 'moduleCode', 'activityType'].map(p => (
                                    <span key={p} className="text-[9px] font-mono bg-white px-1.5 py-0.5 rounded border border-indigo-200 text-indigo-600">
                                        {'{{' + p + '}}'}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
    );
}
