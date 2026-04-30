
'use client';

import React, { useState, useEffect } from 'react';
import { 
    Brain, Info, Table, Activity, Zap, AlertTriangle, 
    CheckCircle, XCircle, Calculator, Sliders, ChevronRight,
    Target, Clock, BookOpen, Database, Sparkles, User,
    ArrowRight, Maximize2, Share2, Layers, Users
} from 'lucide-react';
import { calculateCognitiveLoad } from '@/lib/cognitiveLoadService';
import { useTranslation } from '@/lib/LanguageContext';

interface CognitiveLoadModalProps {
    isOpen: boolean;
    onClose: () => void;
    courseId?: string;
    studentId?: string;
    students?: any[];
}

export default function CognitiveLoadModal({ isOpen, onClose, courseId, studentId, students }: CognitiveLoadModalProps) {
    const { t } = useTranslation();
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState<any>(null);
    const [selectedId, setSelectedId] = useState<string | undefined>(studentId);
    const [simValues, setSimValues] = useState({
        retryPressure: 0.2,
        errorPressure: 0.15,
        quizTimePressure: 0.3,
        deadlinePressure: 0.5,
        lowProgress: 0.4,
        nonCompletionRisk: 0.1
    });

    const simResult = calculateCognitiveLoad({
        retryPressure: simValues.retryPressure,
        errorPressure: simValues.errorPressure,
        quizTimePressure: simValues.quizTimePressure,
        deadlinePressure: simValues.deadlinePressure,
        lowProgress: simValues.lowProgress,
        nonCompletionRisk: simValues.nonCompletionRisk
    });

    useEffect(() => {
        setSelectedId(studentId);
    }, [studentId]);

    useEffect(() => {
        if (isOpen && courseId && selectedId) {
            fetchData(selectedId);
        } else if (isOpen && !selectedId) {
            setData(null);
        }
    }, [isOpen, courseId, selectedId]);

    const fetchData = async (sId: string) => {
        setLoading(true);
        try {
            const url = `/api/admin/governance/cognitive-load?courseId=${courseId}&userId=${sId}`;
            const res = await fetch(url);
            const result = await res.json();
            setData(result);
            if (result.success) {
                setSimValues({
                    retryPressure: result.features.retryPressure || 0,
                    errorPressure: result.features.errorPressure || 0,
                    quizTimePressure: result.features.quizTimePressure || 0,
                    deadlinePressure: result.features.deadlinePressure || 0,
                    lowProgress: result.features.lowProgress || 0,
                    nonCompletionRisk: result.features.nonCompletionRisk || 0
                });
            }
        } catch (error) {
            console.error('Error fetching cognitive load data:', error);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    const getLevelText = (level: string) => {
        if (level === 'Alta') return t('cognitiveLoad.levels.high');
        if (level === 'Moderada') return t('cognitiveLoad.levels.moderate');
        return t('cognitiveLoad.levels.low');
    };

    const getConfText = (conf: string) => {
        if (conf === 'Alta') return t('cognitiveLoad.confLevels.high');
        if (conf === 'Media') return t('cognitiveLoad.confLevels.medium');
        return t('cognitiveLoad.confLevels.low');
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-10">
            <div 
                className="absolute inset-0 bg-slate-900/80 backdrop-blur-xl transition-opacity animate-in fade-in duration-500"
                onClick={onClose}
            />
            
            <div className="relative w-full max-w-7xl max-h-[92vh] bg-white rounded-[56px] shadow-[0_32px_120px_rgba(0,0,0,0.4)] overflow-hidden flex flex-col animate-in zoom-in-95 fade-in duration-500 border border-white/20">
                
                {/* Modern Header */}
                <div className="p-10 border-b border-slate-100 flex items-center justify-between bg-slate-50/50 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-500" />
                    
                    <div className="flex items-center gap-8 relative z-10">
                        <div className="w-20 h-20 rounded-[32px] bg-indigo-600 flex items-center justify-center text-white shadow-[0_12px_40px_rgba(79,70,229,0.4)] relative group overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent" />
                            <Brain className="w-10 h-10 relative z-10 group-hover:scale-110 transition-transform" />
                        </div>
                        <div>
                            <h2 className="text-4xl font-black text-slate-900 tracking-tight leading-none">{t('cognitiveLoad.title')}</h2>
                            <div className="mt-4 flex items-center gap-3">
                                <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-white border border-slate-200 shadow-sm">
                                    <User className="w-4 h-4 text-slate-400" />
                                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{t('cognitiveLoad.selectStudent')}</span>
                                    <select 
                                        value={selectedId || ''} 
                                        onChange={(e) => setSelectedId(e.target.value)}
                                        className="bg-transparent border-none text-sm font-black text-indigo-600 focus:ring-0 cursor-pointer pr-8"
                                    >
                                        <option value="">{t('common.search')}...</option>
                                        {students?.map((s) => (
                                            <option key={s.id} value={s.id}>{s.fullname || s.username}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="px-4 py-2 rounded-2xl bg-slate-100 text-[10px] font-black text-slate-400 uppercase tracking-widest border border-slate-200/50">
                                    Mode: API-ONLY v1.0
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-4">
                        <button className="p-4 bg-white hover:bg-slate-50 border border-slate-200 rounded-[24px] text-slate-400 transition-all hover:text-indigo-600 shadow-sm">
                            <Share2 className="w-6 h-6" />
                        </button>
                        <button 
                            onClick={onClose}
                            className="p-4 bg-slate-900 hover:bg-slate-800 rounded-[24px] text-white transition-all shadow-xl active:scale-95 group"
                        >
                            <XCircle className="w-6 h-6 group-hover:rotate-90 transition-transform duration-500" />
                        </button>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-12 custom-scrollbar space-y-16">
                    
                    {!selectedId ? (
                        <div className="h-[400px] flex flex-col items-center justify-center">
                            <div className="relative mb-10">
                                <div className="absolute inset-0 bg-indigo-500/10 blur-3xl rounded-full animate-pulse" />
                                <div className="w-32 h-32 rounded-[48px] bg-slate-50 border border-dashed border-slate-200 flex items-center justify-center text-slate-200 relative z-10">
                                    <Users className="w-16 h-16" />
                                </div>
                            </div>
                            <h3 className="text-2xl font-black text-slate-900 mb-2 uppercase tracking-tight">{t('cognitiveLoad.noStudent')}</h3>
                            <p className="text-slate-400 font-medium max-w-sm text-center leading-relaxed">Selecciona un alumno del menú superior para sincronizar las señales de Moodle.</p>
                        </div>
                    ) : loading ? (
                        <div className="h-[400px] flex flex-col items-center justify-center">
                            <div className="relative">
                                <Activity className="w-24 h-24 text-indigo-600 animate-pulse" />
                                <div className="absolute inset-0 bg-indigo-600/20 blur-2xl animate-ping rounded-full" />
                            </div>
                            <p className="mt-10 font-black text-xs uppercase tracking-[0.4em] text-indigo-600 animate-pulse">{t('cognitiveLoad.loading')}</p>
                        </div>
                    ) : (
                        <>
                    {/* Metrics Dashboard */}
                    {data && (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            <div className={`group p-8 rounded-[40px] border transition-all relative overflow-hidden ${
                                data.confidence === 'Alta' ? 'bg-emerald-50 border-emerald-100 text-emerald-900 shadow-xl shadow-emerald-100/50' :
                                data.confidence === 'Media' ? 'bg-amber-50 border-amber-100 text-amber-900 shadow-xl shadow-amber-100/50' :
                                'bg-rose-50 border-rose-100 text-rose-900 shadow-xl shadow-rose-100/50'
                            }`}>
                                <div className="absolute top-0 right-0 w-32 h-32 bg-white/40 blur-3xl -mr-16 -mt-16 rounded-full" />
                                <div className="relative z-10 flex flex-col h-full justify-between">
                                    <div className="flex items-center justify-between mb-8">
                                        <div className="w-12 h-12 rounded-2xl bg-white/50 backdrop-blur-md flex items-center justify-center shadow-sm">
                                            <Target className="w-6 h-6" />
                                        </div>
                                        <div className="px-3 py-1 rounded-full bg-white/60 text-[9px] font-black uppercase tracking-widest">Confidence Index</div>
                                    </div>
                                    <div>
                                        <p className="text-[11px] font-black uppercase tracking-[0.2em] opacity-40 mb-1">{t('cognitiveLoad.confidence')}</p>
                                        <p className="text-3xl font-black">{getConfText(data.confidence)}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="p-8 rounded-[40px] border border-slate-100 bg-slate-900 text-white shadow-2xl relative overflow-hidden group">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/20 blur-3xl -mr-16 -mt-16 rounded-full group-hover:bg-indigo-500/40 transition-all duration-700" />
                                <div className="relative z-10 flex flex-col h-full justify-between">
                                    <div className="flex items-center justify-between mb-8">
                                        <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/10 shadow-lg">
                                            <Zap className="w-6 h-6 text-indigo-400" />
                                        </div>
                                        <div className="px-3 py-1 rounded-full bg-indigo-500/20 text-[9px] font-black uppercase tracking-widest text-indigo-300">Live Metric</div>
                                    </div>
                                    <div>
                                        <p className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-500 mb-1">{t('cognitiveLoad.score')}</p>
                                        <div className="flex items-baseline gap-3">
                                            <span className="text-5xl font-black tracking-tighter">{(data.score * 100).toFixed(0)}</span>
                                            <span className="text-2xl font-black text-indigo-500">%</span>
                                        </div>
                                        <p className={`text-xs font-black uppercase tracking-widest mt-2 ${
                                            data.level === 'Alta' ? 'text-rose-400' : 'text-emerald-400'
                                        }`}>{getLevelText(data.level)}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="p-8 rounded-[40px] border border-slate-100 bg-white shadow-xl shadow-slate-200/50 flex flex-col h-full justify-between group hover:border-indigo-100 transition-all">
                                <div className="flex items-center justify-between mb-8">
                                    <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                                        <Database className="w-6 h-6" />
                                    </div>
                                    <div className="px-3 py-1 rounded-full bg-slate-50 text-[9px] font-black uppercase tracking-widest text-slate-400">{t('cognitiveLoad.samples')}</div>
                                </div>
                                <div>
                                    <p className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2">{t('cognitiveLoad.activeVariables')}</p>
                                    <div className="flex items-center gap-3">
                                        <span className="text-3xl font-black text-slate-900">{Object.keys(data.features).filter(k => data.features[k] > 0).length}</span>
                                        <div className="flex -space-x-2">
                                            {[1,2,3].map(i => <div key={i} className="w-6 h-6 rounded-full border-2 border-white bg-slate-100" />)}
                                            <div className="w-6 h-6 rounded-full border-2 border-white bg-indigo-50 flex items-center justify-center text-[8px] font-black text-indigo-600">+</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Logic Breakdown */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                        {/* Equation Box */}
                        <section className="space-y-6">
                            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 flex items-center gap-3 px-2">
                                <Layers className="w-4 h-4 text-indigo-500" /> {t('cognitiveLoad.equation')}
                            </h3>
                            <div className="bg-indigo-600 rounded-[48px] p-10 text-white shadow-2xl relative overflow-hidden group">
                                <div className="absolute bottom-0 right-0 w-64 h-64 bg-white/10 blur-[80px] -mr-32 -mb-32 rounded-full group-hover:scale-150 transition-transform duration-1000" />
                                <div className="relative z-10">
                                    <div className="flex items-center justify-between mb-10">
                                        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-200">{t('cognitiveLoad.timeWindow')}</span>
                                        <Calculator className="w-6 h-6 text-indigo-300 opacity-50" />
                                    </div>
                                    <div className="font-mono text-xl lg:text-2xl font-black leading-relaxed tracking-tight bg-white/10 backdrop-blur-md p-6 rounded-3xl border border-white/10 mb-10">
                                        CL = σ(β₀ + β₁·RP + β₂·EP + β₃·TP + β₄·DP + β₅·LP + β₆·GD + ...)
                                    </div>
                                    <div className="grid grid-cols-2 gap-8 pt-8 border-t border-white/10">
                                        <div className="space-y-2">
                                            <p className="text-[10px] font-black text-indigo-200 uppercase tracking-widest">{t('cognitiveLoad.sigmoid')}</p>
                                            <p className="font-mono text-sm font-black text-white">σ(x) = 1 / (1 + e⁻ˣ)</p>
                                        </div>
                                        <div className="space-y-2 text-right">
                                            <p className="text-[10px] font-black text-indigo-200 uppercase tracking-widest">{t('cognitiveLoad.range')}</p>
                                            <p className="font-mono text-sm font-black text-white">0 ≤ CL ≤ 1</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* Dictionary Box */}
                        <section className="space-y-6">
                            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 flex items-center gap-3 px-2">
                                <Table className="w-4 h-4 text-cyan-500" /> {t('cognitiveLoad.dictionary')}
                            </h3>
                            <div className="bg-white rounded-[48px] border border-slate-100 shadow-xl shadow-slate-200/50 overflow-hidden">
                                <div className="p-8 space-y-4">
                                    {[
                                        { id: 'retryPressure', label: 'RetryPressure (β₁)', desc: 'Attempts / (Quizzes + 1)', color: 'text-indigo-600', bg: 'bg-indigo-50' },
                                        { id: 'errorPressure', label: 'ErrorPressure (β₂)', desc: '1 - (Grade / MaxGrade)', color: 'text-emerald-600', bg: 'bg-emerald-50' },
                                        { id: 'deadlinePressure', label: 'DeadlinePressure (β₄)', desc: 'Proximity to Due Dates', color: 'text-amber-600', bg: 'bg-amber-50' },
                                        { id: 'lowProgress', label: 'LowProgress (β₅)', desc: '1 - (Completed / Total)', color: 'text-rose-600', bg: 'bg-rose-50' },
                                    ].map((v) => (
                                        <div key={v.id} className="flex items-center justify-between p-4 rounded-2xl border border-slate-50 hover:border-indigo-100 hover:bg-slate-50/50 transition-all group">
                                            <div className="flex items-center gap-4">
                                                <div className={`w-10 h-10 rounded-xl ${v.bg} ${v.color} flex items-center justify-center text-xs font-black`}>β</div>
                                                <div>
                                                    <p className="text-[11px] font-black text-slate-900 uppercase tracking-tight">{v.label}</p>
                                                    <p className="text-[10px] text-slate-400 font-medium">{v.desc}</p>
                                                </div>
                                            </div>
                                            <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-indigo-500 group-hover:translate-x-1 transition-all" />
                                        </div>
                                    ))}
                                </div>
                                <div className="bg-slate-50 p-6 border-t border-slate-100 flex justify-center">
                                    <button className="text-[10px] font-black text-indigo-600 uppercase tracking-widest hover:underline flex items-center gap-2">
                                        Ver Documentación Técnica Completa <ArrowRight className="w-3 h-3" />
                                    </button>
                                </div>
                            </div>
                        </section>
                    </div>

                    {/* Detailed Data Table */}
                    <section className="space-y-6">
                        <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 flex items-center gap-3 px-2">
                            <Activity className="w-4 h-4 text-indigo-400" /> Sincronización Moodle en Tiempo Real
                        </h3>
                        <div className="bg-white rounded-[48px] border border-slate-100 shadow-2xl shadow-slate-200/50 overflow-hidden">
                            <table className="w-full text-left border-collapse">
                                <thead className="bg-slate-50 border-b border-slate-100 text-[10px] uppercase font-black text-slate-400 tracking-[0.3em]">
                                    <tr>
                                        <th className="px-10 py-6">Métrica Proxy</th>
                                        <th className="px-10 py-6">Ecuación</th>
                                        <th className="px-10 py-6">Fuente REST</th>
                                        <th className="px-10 py-6 text-right">Resultado</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50 text-[11px] font-bold">
                                    {[
                                        { name: 'RetryPressure', eq: 'TotalAttempts / (Units + 1)', source: 'mod_quiz_get_user_attempts', val: data?.features.retryPressure },
                                        { name: 'ErrorPressure', eq: '1 - (RawScore / MaxScore)', source: 'gradereport_user_get_grade_items', val: data?.features.errorPressure },
                                        { name: 'QuizTimePressure', eq: 'Duration / TimeLimit', source: 'mod_quiz_get_user_attempts', val: data?.features.quizTimePressure },
                                        { name: 'DeadlinePressure', eq: '1 - (RemTime / Window)', source: 'core_calendar_get_action_events', val: data?.features.deadlinePressure },
                                        { name: 'LowProgress', eq: '1 - (DoneTasks / TotalTasks)', source: 'core_completion_get_activities', val: data?.features.lowProgress },
                                        { name: 'GradeDrop', eq: 'HistoricAvg - LastScore', source: 'gradereport_user_get_grade_items', val: data?.features.gradeDrop },
                                    ].map((v) => (
                                        <tr key={v.name} className="hover:bg-slate-50/50 transition-colors">
                                            <td className="px-10 py-6 text-indigo-600 font-mono">{v.name}</td>
                                            <td className="px-10 py-6 text-slate-500">{v.eq}</td>
                                            <td className="px-10 py-6 text-slate-400 font-mono text-[9px] uppercase">{v.source}</td>
                                            <td className="px-10 py-6 text-right font-mono text-slate-900">
                                                {v.val !== undefined ? (
                                                    <span className={v.val > 0.6 ? 'text-rose-500' : v.val > 0.3 ? 'text-amber-500' : 'text-emerald-500'}>
                                                        {v.val.toFixed(2)}
                                                    </span>
                                                ) : '--'}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </section>

                    {/* Simulation Tools */}
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                        {/* Simulation Result Visualization */}
                        <div className="lg:col-span-5 space-y-6">
                            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 flex items-center gap-3 px-2">
                                <Sparkles className="w-4 h-4 text-amber-500" /> {t('cognitiveLoad.limitations')}
                            </h3>
                            <div className="bg-slate-900 rounded-[48px] p-10 text-white h-full relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/10 blur-3xl -mr-16 -mt-16 rounded-full" />
                                <div className="relative z-10 space-y-8">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-rose-400 shadow-lg">
                                            <AlertTriangle className="w-6 h-6" />
                                        </div>
                                        <h4 className="text-sm font-black uppercase tracking-widest">{t('cognitiveLoad.limitations')}</h4>
                                    </div>
                                    <p className="text-slate-400 text-xs leading-relaxed font-medium">
                                        {t('cognitiveLoad.limitationsDesc')}
                                    </p>
                                    <div className="space-y-4 pt-8 border-t border-white/5">
                                        {[
                                            { label: 'Data Latency', desc: 'Sincronización API cada 10 seg' },
                                            { label: 'Signal Confidence', desc: 'Muestreo por actividad Moodle' },
                                            { label: 'Privacy Bound', desc: 'No se captura navegación externa' },
                                        ].map(l => (
                                            <div key={l.label} className="flex items-center justify-between">
                                                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{l.label}</span>
                                                <span className="text-[10px] font-bold text-white">{l.desc}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Interactive Simulator Sliders */}
                        <div className="lg:col-span-7 space-y-6">
                            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 flex items-center gap-3 px-2">
                                <Sliders className="w-4 h-4 text-indigo-500" /> {t('cognitiveLoad.simulator')}
                            </h3>
                            <div className="bg-white rounded-[48px] border border-slate-100 p-10 shadow-2xl shadow-slate-200/50">
                                <div className="flex items-center justify-between mb-12">
                                    <div>
                                        <h4 className="text-lg font-black text-slate-900">{t('cognitiveLoad.simulatorDesc')}</h4>
                                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">{t('cognitiveLoad.simulatorSub')}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-4xl font-black text-indigo-600 tracking-tighter">{(simResult.score * 100).toFixed(1)}%</p>
                                        <p className={`text-[10px] font-black uppercase tracking-[0.2em] mt-1 ${
                                            simResult.level === 'Alta' ? 'text-rose-500' : 'text-emerald-500'
                                        }`}>{getLevelText(simResult.level)}</p>
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
                                    {[
                                        { id: 'retryPressure', label: 'RetryPressure', color: 'accent-indigo-600' },
                                        { id: 'errorPressure', label: 'ErrorPressure', color: 'accent-emerald-600' },
                                        { id: 'quizTimePressure', label: 'QuizTimePressure', color: 'accent-cyan-600' },
                                        { id: 'deadlinePressure', label: 'DeadlinePressure', color: 'accent-amber-600' },
                                        { id: 'lowProgress', label: 'LowProgress', color: 'accent-rose-600' },
                                        { id: 'nonCompletionRisk', label: 'NonCompletionRisk', color: 'accent-purple-600' },
                                    ].map((s) => (
                                        <div key={s.id} className="space-y-4">
                                            <div className="flex justify-between text-[10px] font-black uppercase text-slate-400 tracking-widest">
                                                <label>{s.label}</label>
                                                <span className="text-slate-900 font-mono">{(simValues as any)[s.id].toFixed(2)}</span>
                                            </div>
                                            <input 
                                                type="range" min="0" max="1" step="0.01"
                                                value={(simValues as any)[s.id]}
                                                onChange={(e) => setSimValues(prev => ({ ...prev, [s.id]: parseFloat(e.target.value) }))}
                                                className={`w-full h-1.5 bg-slate-100 rounded-full appearance-none cursor-pointer ${s.color} hover:h-2 transition-all`}
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                        </>
                    )}
                </div>
            </div>
            
            <style jsx global>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 6px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: #e2e8f0;
                    border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: #cbd5e1;
                }
            `}</style>
        </div>
    );
}
