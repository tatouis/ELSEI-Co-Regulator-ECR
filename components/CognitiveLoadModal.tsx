
'use client';

import React, { useState, useEffect } from 'react';
import { 
    Brain, Info, Table, Activity, Zap, AlertTriangle, 
    CheckCircle, XCircle, Calculator, Sliders, ChevronRight,
    Target, Clock, BookOpen, Database, Sparkles, User
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
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8">
            <div 
                className="absolute inset-0 bg-slate-900/60 backdrop-blur-md transition-opacity animate-in fade-in duration-300"
                onClick={onClose}
            />
            
            <div className="relative w-full max-w-6xl max-h-[90vh] bg-white rounded-[40px] shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 fade-in duration-300 text-slate-800">
                
                {/* Header */}
                <div className="p-8 border-b border-slate-100 flex items-start justify-between bg-slate-50/50">
                    <div className="flex items-center gap-6">
                        <div className="w-16 h-16 rounded-[24px] bg-indigo-600 flex items-center justify-center text-white shadow-2xl shadow-indigo-500/30">
                            <Brain className="w-8 h-8" />
                        </div>
                        <div>
                            <h2 className="text-3xl font-black text-slate-900">{t('cognitiveLoad.title')}</h2>
                            <div className="mt-2 flex items-center gap-4">
                                <span className="text-xs font-black uppercase tracking-widest text-slate-400">{t('cognitiveLoad.selectStudent')}</span>
                                <select 
                                    value={selectedId || ''} 
                                    onChange={(e) => setSelectedId(e.target.value)}
                                    className="bg-white border border-slate-200 rounded-xl px-4 py-2 text-sm font-bold text-slate-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                                >
                                    <option value="">{t('common.search')}...</option>
                                    {students?.map((s) => (
                                        <option key={s.id} value={s.id}>{s.fullname || s.username}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>
                    <button 
                        onClick={onClose}
                        className="p-3 bg-white hover:bg-slate-100 rounded-2xl transition-all text-slate-400 group active:scale-95 shadow-sm border border-slate-100"
                    >
                        <XCircle className="w-6 h-6 group-hover:text-rose-500 transition-colors" />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-8 custom-scrollbar space-y-12">
                    
                    {!selectedId ? (
                        <div className="h-64 flex flex-col items-center justify-center text-slate-400 space-y-4">
                            <User className="w-16 h-16 opacity-20" />
                            <p className="font-bold text-sm uppercase tracking-widest text-center px-8">{t('cognitiveLoad.noStudent')}</p>
                        </div>
                    ) : loading ? (
                        <div className="h-64 flex flex-col items-center justify-center text-indigo-400 space-y-4">
                            <Activity className="w-16 h-16 animate-pulse" />
                            <p className="font-bold text-sm uppercase tracking-widest">{t('cognitiveLoad.loading')}</p>
                        </div>
                    ) : (
                        <>
                    {/* Confidence & Quick Stats */}
                    {data && (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className={`p-6 rounded-3xl border flex items-center justify-between transition-all ${
                                data.confidence === 'Alta' ? 'bg-emerald-50 border-emerald-100 text-emerald-700' :
                                data.confidence === 'Media' ? 'bg-amber-50 border-amber-100 text-amber-700' :
                                'bg-rose-50 border-rose-100 text-rose-700'
                            }`}>
                                <div className="flex items-center gap-4">
                                    <Target className="w-6 h-6 opacity-80" />
                                    <div>
                                        <p className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-0.5">{t('cognitiveLoad.confidence')}</p>
                                        <p className="text-lg font-black">{getConfText(data.confidence)}</p>
                                    </div>
                                </div>
                                {data.confidence === 'Alta' ? <CheckCircle className="w-6 h-6" /> : <AlertTriangle className="w-6 h-6" />}
                            </div>

                            <div className="p-6 rounded-3xl border border-slate-100 bg-slate-50 flex items-center gap-4">
                                <Zap className="w-6 h-6 text-indigo-500" />
                                <div>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">{t('cognitiveLoad.score')}</p>
                                    <p className="text-lg font-black text-slate-900">{(data.score * 100).toFixed(1)}% ({getLevelText(data.level)})</p>
                                </div>
                            </div>

                            <div className="p-6 rounded-3xl border border-slate-100 bg-slate-50 flex items-center gap-4">
                                <Database className="w-6 h-6 text-cyan-500" />
                                <div>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">{t('cognitiveLoad.samples')}</p>
                                    <p className="text-lg font-black text-slate-900">{Object.keys(data.features).filter(k => data.features[k] > 0).length} {t('cognitiveLoad.activeVariables')}</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Formula Section */}
                    <section className="space-y-8">
                        <div className="flex items-center justify-between">
                            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 flex items-center gap-2">
                                <Calculator className="w-4 h-4 text-indigo-400" /> {t('cognitiveLoad.equation')}
                            </h3>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            <div className="bg-indigo-600 rounded-[32px] p-8 text-white shadow-2xl shadow-indigo-200">
                                <p className="text-indigo-200 text-[10px] font-black uppercase tracking-widest mb-6">{t('cognitiveLoad.timeWindow')}</p>
                                <div className="font-mono text-lg lg:text-xl font-black leading-relaxed">
                                    CL = σ(β₀ + β₁·RP + β₂·EP + β₃·TP + β₄·DP + β₅·LP + β₆·GD + ...)
                                </div>
                                <div className="mt-8 pt-8 border-t border-white/10 space-y-4">
                                    <div className="flex items-center justify-between">
                                        <p className="text-[10px] font-bold text-indigo-200 uppercase">{t('cognitiveLoad.sigmoid')}</p>
                                        <p className="font-mono text-sm font-black">σ(x) = 1 / (1 + e⁻ˣ)</p>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <p className="text-[10px] font-bold text-indigo-200 uppercase">{t('cognitiveLoad.range')}</p>
                                        <p className="font-mono text-sm font-black">0 ≤ CL ≤ 1</p>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-slate-900 rounded-[32px] p-8 text-white shadow-2xl">
                                <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-6">{t('cognitiveLoad.variables')}</p>
                                <div className="grid grid-cols-2 gap-x-8 gap-y-4">
                                    <div className="space-y-1">
                                        <p className="text-[10px] font-mono text-indigo-400">β₁ RetryPressure</p>
                                        <p className="text-[9px] text-slate-500 italic">Attempts / (Quizzes + 1)</p>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-[10px] font-mono text-cyan-400">β₂ ErrorPressure</p>
                                        <p className="text-[9px] text-slate-500 italic">1 - (Grade / Max)</p>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-[10px] font-mono text-amber-400">β₄ DeadlinePressure</p>
                                        <p className="text-[9px] text-slate-500 italic">Prox. Deadlines</p>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-[10px] font-mono text-emerald-400">β₅ LowProgress</p>
                                        <p className="text-[9px] text-slate-500 italic">1 - Progress</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Dictionary Table */}
                    <section className="space-y-6">
                        <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 flex items-center gap-2">
                            <Table className="w-4 h-4 text-cyan-400" /> {t('cognitiveLoad.dictionary')}
                        </h3>
                        <div className="bg-white rounded-[32px] border border-slate-100 overflow-hidden shadow-xl shadow-slate-200/50">
                            <table className="w-full text-left border-collapse">
                                <thead className="bg-slate-50 text-[10px] uppercase font-black text-slate-400 tracking-widest">
                                    <tr>
                                        <th className="px-6 py-4">Variable</th>
                                        <th className="px-6 py-4">{t('common.details')}</th>
                                        <th className="px-6 py-4">Moodle API</th>
                                        <th className="px-6 py-4 text-right">Value</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50 text-xs font-bold text-slate-700">
                                    {[
                                        { name: 'RetryPressure', eq: 'Attempts / (Quizzes + 1)', source: 'mod_quiz_get_user_attempts', value: data?.features.retryPressure },
                                        { name: 'ErrorPressure', eq: '1 - (Grade / Max)', source: 'gradereport_user_get_grade_items', value: data?.features.errorPressure },
                                        { name: 'QuizTimePressure', eq: 'Duration / TimeLimit', source: 'mod_quiz_get_user_attempts', value: data?.features.quizTimePressure },
                                        { name: 'DeadlinePressure', eq: '1 - (TimeLeft / Window)', source: 'core_calendar_get_action_events', value: data?.features.deadlinePressure },
                                        { name: 'LowProgress', eq: '1 - (Completed / Total)', source: 'core_completion_get_activities', value: data?.features.lowProgress },
                                        { name: 'GradeDrop', eq: 'PrevAvg - RecentAvg', source: 'gradereport_user_get_grade_items', value: data?.features.gradeDrop },
                                    ].map((v) => (
                                        <tr key={v.name} className="hover:bg-slate-50/50 transition-colors">
                                            <td className="px-6 py-4 font-mono text-indigo-600">{v.name}</td>
                                            <td className="px-6 py-4 text-slate-500 font-medium">{v.eq}</td>
                                            <td className="px-6 py-4 font-mono text-[10px] uppercase text-slate-400">{v.source}</td>
                                            <td className="px-6 py-4 text-right font-mono text-slate-900">
                                                {v.value !== undefined ? v.value.toFixed(2) : '--'}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </section>

                    {/* Simulator */}
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                        <div className="lg:col-span-5 space-y-6">
                            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 flex items-center gap-2">
                                <Sparkles className="w-4 h-4 text-amber-400" /> {t('cognitiveLoad.limitations')}
                            </h3>
                            <div className="bg-slate-900 rounded-[32px] p-8 text-white h-full">
                                <p className="text-slate-400 text-xs leading-relaxed font-medium">
                                    {t('cognitiveLoad.limitationsDesc')}
                                </p>
                            </div>
                        </div>

                        <div className="lg:col-span-7 space-y-6">
                            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 flex items-center gap-2">
                                <Sliders className="w-4 h-4 text-indigo-400" /> {t('cognitiveLoad.simulator')}
                            </h3>
                            <div className="bg-white rounded-[32px] border border-slate-100 p-8 shadow-xl shadow-slate-200/50">
                                <div className="flex items-center justify-between mb-8">
                                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{t('cognitiveLoad.simulatorDesc')}</p>
                                    <div className="text-right">
                                        <p className="text-3xl font-black text-indigo-600">{(simResult.score * 100).toFixed(1)}%</p>
                                        <p className={`text-[10px] font-black uppercase tracking-widest ${
                                            simResult.level === 'Alta' ? 'text-rose-500' : 'text-emerald-500'
                                        }`}>{getLevelText(simResult.level)}</p>
                                    </div>
                                </div>
                                <div className="space-y-6">
                                    {[
                                        { id: 'retryPressure', label: 'RetryPressure' },
                                        { id: 'errorPressure', label: 'ErrorPressure' },
                                        { id: 'quizTimePressure', label: 'QuizTimePressure' },
                                        { id: 'deadlinePressure', label: 'DeadlinePressure' },
                                        { id: 'lowProgress', label: 'LowProgress' },
                                        { id: 'nonCompletionRisk', label: 'NonCompletionRisk' },
                                    ].map((s) => (
                                        <div key={s.id} className="space-y-2">
                                            <div className="flex justify-between text-[9px] font-black uppercase text-slate-400 tracking-widest">
                                                <label>{s.label}</label>
                                                <span>{(simValues as any)[s.id].toFixed(2)}</span>
                                            </div>
                                            <input 
                                                type="range" min="0" max="1" step="0.01"
                                                value={(simValues as any)[s.id]}
                                                onChange={(e) => setSimValues(prev => ({ ...prev, [s.id]: parseFloat(e.target.value) }))}
                                                className="w-full h-1 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-indigo-600"
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
        </div>
    );
}
