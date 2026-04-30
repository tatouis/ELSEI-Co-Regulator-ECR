
'use client';

import React, { useState, useEffect } from 'react';
import { 
    Brain, Info, Table, Activity, Zap, AlertTriangle, 
    CheckCircle, XCircle, Calculator, Sliders, ChevronRight,
    Target, Clock, BookOpen, Database, Sparkles
} from 'lucide-react';
import { calculateCognitiveLoad, COGNITIVE_LOAD_DEFAULTS } from '@/lib/cognitiveLoadService';

interface CognitiveLoadModalProps {
    isOpen: boolean;
    onClose: () => void;
    courseId?: string;
    studentId?: string;
}

export default function CognitiveLoadModal({ isOpen, onClose, courseId, studentId }: CognitiveLoadModalProps) {
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState<any>(null);
    const [simValues, setSimValues] = useState({
        retryRate: 0.2,
        errRate: 0.15,
        switchRate: 0.3,
        timePressure: 0.5,
        progressGap: 0.4
    });

    const simResult = calculateCognitiveLoad({
        retryRate: simValues.retryRate,
        errRate: simValues.errRate,
        switchRate: simValues.switchRate,
        timePressure: simValues.timePressure,
        progressGap: simValues.progressGap
    });

    useEffect(() => {
        if (isOpen) {
            fetchData();
        }
    }, [isOpen, courseId, studentId]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const url = `/api/admin/governance/cognitive-load?${courseId ? `courseId=${courseId}` : ''}${studentId ? `&userId=${studentId}` : ''}`;
            const res = await fetch(url);
            const result = await res.json();
            setData(result);
            if (result.success) {
                setSimValues({
                    retryRate: result.features.retryRate,
                    errRate: result.features.errRate,
                    switchRate: result.features.switchRate,
                    timePressure: result.features.timePressure,
                    progressGap: result.features.progressGap
                });
            }
        } catch (error) {
            console.error('Error fetching cognitive load data:', error);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8">
            {/* Backdrop */}
            <div 
                className="absolute inset-0 bg-slate-900/60 backdrop-blur-md transition-opacity animate-in fade-in duration-300"
                onClick={onClose}
            />
            
            {/* Modal Content */}
            <div className="relative w-full max-w-6xl max-h-[90vh] bg-white rounded-[40px] shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 fade-in duration-300">
                
                {/* Header */}
                <div className="p-8 border-b border-slate-100 flex items-start justify-between bg-slate-50/50">
                    <div className="flex items-center gap-6">
                        <div className="w-16 h-16 rounded-[24px] bg-indigo-600 flex items-center justify-center text-white shadow-2xl shadow-indigo-500/30">
                            <Brain className="w-8 h-8" />
                        </div>
                        <div>
                            <h2 className="text-3xl font-black text-slate-900">Cálculo de Carga Cognitiva Estimada</h2>
                            <p className="text-slate-500 font-medium mt-1 max-w-2xl text-sm leading-relaxed">
                                Esta métrica estima la carga cognitiva del estudiante usando señales de interacción, errores, intentos, tiempo y progreso obtenidas desde Moodle. 
                                No debe interpretarse como diagnóstico psicológico, sino como indicador analítico de apoyo.
                            </p>
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
                                        <p className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-0.5">Confianza del Cálculo</p>
                                        <p className="text-lg font-black">{data.confidence === 'Alta' ? 'Alta Confianza' : data.confidence === 'Media' ? 'Media Confianza' : 'Baja Confianza'}</p>
                                    </div>
                                </div>
                                {data.confidence === 'Alta' ? <CheckCircle className="w-6 h-6" /> : <AlertTriangle className="w-6 h-6" />}
                            </div>

                            <div className="p-6 rounded-3xl border border-slate-100 bg-slate-50 flex items-center gap-4">
                                <Zap className="w-6 h-6 text-indigo-500" />
                                <div>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Puntuación Estimada</p>
                                    <p className="text-lg font-black text-slate-900">{(data.score * 100).toFixed(1)}% ({data.level})</p>
                                </div>
                            </div>

                            <div className="p-6 rounded-3xl border border-slate-100 bg-slate-50 flex items-center gap-4">
                                <Database className="w-6 h-6 text-cyan-500" />
                                <div>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Muestras de Datos</p>
                                    <p className="text-lg font-black text-slate-900">{Object.keys(data.features).filter(k => data.features[k] > 0).length} Variables activas</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Formula Section */}
                    <section className="space-y-8">
                        <div className="flex items-center justify-between">
                            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 flex items-center gap-2">
                                <Calculator className="w-4 h-4 text-indigo-400" /> ECUACIÓN PROPUESTA
                            </h3>
                            <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-600 text-[10px] font-black uppercase tracking-widest">
                                <Info className="w-3 h-3" />
                                Estimación por ventana temporal (t)
                            </div>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            <div className="bg-indigo-600 rounded-[32px] p-8 text-white shadow-2xl shadow-indigo-200">
                                <p className="text-indigo-200 text-[10px] font-black uppercase tracking-widest mb-6">Cálculo de Carga Cognitiva (CL)</p>
                                <div className="font-mono text-xl lg:text-2xl font-black leading-relaxed">
                                    CL<sub>u,t</sub> = σ(β₀ + β₁·R + β₂·E + β₃·S + β₄·T - β₅·P)
                                </div>
                                <div className="mt-8 pt-8 border-t border-white/10 space-y-4">
                                    <div className="flex items-center justify-between">
                                        <p className="text-[10px] font-bold text-indigo-200 uppercase">Función Sigmoide</p>
                                        <p className="font-mono text-sm font-black">σ(x) = 1 / (1 + e⁻ˣ)</p>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <p className="text-[10px] font-bold text-indigo-200 uppercase">Rango de Resultado</p>
                                        <p className="font-mono text-sm font-black">0 ≤ CL<sub>u,t</sub> ≤ 1</p>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-slate-900 rounded-[32px] p-8 text-white shadow-2xl">
                                <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-6">Definición de Variables Clave</p>
                                <div className="space-y-6">
                                    <div className="space-y-2">
                                        <div className="flex justify-between text-[11px] font-mono">
                                            <span className="text-indigo-400">RetryRate (R)</span>
                                            <span className="text-slate-500">Attempts / (ActivitiesAttempted + 1)</span>
                                        </div>
                                        <p className="text-[10px] text-slate-400 leading-relaxed italic">
                                            Mide la presión por intentos repetidos en cuestionarios.
                                        </p>
                                    </div>
                                    <div className="space-y-2">
                                        <div className="flex justify-between text-[11px] font-mono">
                                            <span className="text-cyan-400">ErrRate (E)</span>
                                            <span className="text-slate-500">WrongAnswers / TotalAnswers</span>
                                        </div>
                                        <p className="text-[10px] text-slate-400 leading-relaxed italic">
                                            Tasa de error y fallos técnicos o conceptuales.
                                        </p>
                                    </div>
                                    <div className="space-y-2">
                                        <div className="flex justify-between text-[11px] font-mono">
                                            <span className="text-amber-400">SwitchRate (S)</span>
                                            <span className="text-slate-500">Σ I(cᵢ ≠ cᵢ₊₁) / (n - 1)</span>
                                        </div>
                                        <p className="text-[10px] text-slate-400 leading-relaxed italic">
                                            Cambios frecuentes entre páginas o actividades (Logs).
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-slate-50 rounded-[32px] p-8 border border-slate-100 mt-8">
                            <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-6 text-center">Interpretación del Resultado</p>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="flex items-center justify-between p-4 bg-white rounded-2xl border border-emerald-100 shadow-sm">
                                    <span className="text-xs font-bold text-slate-700">0.00 - 0.33</span>
                                    <span className="text-xs font-black uppercase text-emerald-600">Carga Baja</span>
                                </div>
                                <div className="flex items-center justify-between p-4 bg-white rounded-2xl border border-amber-100 shadow-sm">
                                    <span className="text-xs font-bold text-slate-700">0.34 - 0.66</span>
                                    <span className="text-xs font-black uppercase text-amber-600">Carga Moderada</span>
                                </div>
                                <div className="flex items-center justify-between p-4 bg-white rounded-2xl border border-rose-100 shadow-sm">
                                    <span className="text-xs font-bold text-slate-700">0.67 - 1.00</span>
                                    <span className="text-xs font-black uppercase text-rose-600">Carga Alta</span>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Variables Table */}
                    <section className="space-y-6">
                        <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 flex items-center gap-2">
                            <Table className="w-4 h-4 text-cyan-400" /> TABLA DE REFERENCIA (MOODLE TABLES)
                        </h3>
                        <div className="bg-white rounded-[32px] border border-slate-100 overflow-hidden shadow-xl shadow-slate-200/50">
                            <table className="w-full text-left border-collapse">
                                <thead className="bg-slate-50 text-[10px] uppercase font-black text-slate-400 tracking-widest">
                                    <tr>
                                        <th className="px-6 py-4">Variable</th>
                                        <th className="px-6 py-4">Fórmula / Ecuación</th>
                                        <th className="px-6 py-4">Moodle Table</th>
                                        <th className="px-6 py-4">Campos (Fields)</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50 text-xs font-bold text-slate-700">
                                    {[
                                        { name: 'Attempts', eq: 'COUNT(*)', table: 'mdl_quiz_attempts', fields: 'userid, attempt, quiz, timestart, state' },
                                        { name: 'ActivitiesAttempted', eq: 'COUNT(DISTINCT contextinstanceid)', table: 'mdl_logstore_standard_log', fields: 'userid, contextinstanceid, timecreated' },
                                        { name: 'WrongAnswers', eq: 'COUNT(state = "gradedwrong")', table: 'mdl_question_attempt_steps', fields: 'state, userid' },
                                        { name: 'SwitchRate', eq: 'Σ I(cᵢ ≠ cᵢ₊₁) / (n - 1)', table: 'mdl_logstore_standard_log', fields: 'contextinstanceid, timecreated' },
                                        { name: 'CompletedActivities', eq: 'COUNT(completionstate = 1)', table: 'mdl_course_modules_completion', fields: 'completionstate, userid' },
                                    ].map((v) => (
                                        <tr key={v.name} className="hover:bg-slate-50/50 transition-colors">
                                            <td className="px-6 py-4 font-mono text-indigo-600">{v.name}</td>
                                            <td className="px-6 py-4 text-slate-500 font-medium">{v.eq}</td>
                                            <td className="px-6 py-4 font-mono text-[10px] uppercase text-slate-400">{v.table}</td>
                                            <td className="px-6 py-4 font-mono text-[9px] text-slate-400">{v.fields}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </section>

                    {/* Improved Version & Simulator */}
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                        {/* Improved Version */}
                        <div className="lg:col-span-5 space-y-6">
                            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 flex items-center gap-2">
                                <Sparkles className="w-4 h-4 text-amber-400" /> MEJORA RECOMENDADA
                            </h3>
                            <div className="bg-slate-900 rounded-[32px] p-8 text-white h-full">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="w-8 h-8 rounded-xl bg-amber-500/20 flex items-center justify-center text-amber-500">
                                        <Zap className="w-4 h-4" />
                                    </div>
                                    <h4 className="text-sm font-black uppercase tracking-widest">Modelo Extendido</h4>
                                </div>
                                <p className="text-slate-400 text-xs leading-relaxed mb-8">
                                    Para una mayor precisión, se recomienda integrar variables de "ayuda reactiva" y "presión de entrega":
                                </p>
                                <ul className="space-y-4">
                                    {[
                                        { name: 'DeadlinePressure', desc: 'Cercanía a la fecha límite' },
                                        { name: 'HelpSeeking', desc: 'Búsqueda de ayuda tras error' },
                                        { name: 'RevisitRate', desc: 'Retorno a recursos ya vistos' },
                                        { name: 'GradeDrop', desc: 'Caída de rendimiento reciente' }
                                    ].map((item) => (
                                        <li key={item.name} className="flex items-start gap-3">
                                            <ChevronRight className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
                                            <div>
                                                <span className="text-xs font-bold text-white block">{item.name}</span>
                                                <span className="text-[10px] text-slate-500">{item.desc}</span>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>

                        {/* Simulator */}
                        <div className="lg:col-span-7 space-y-6">
                            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 flex items-center gap-2">
                                <Sliders className="w-4 h-4 text-indigo-400" /> SIMULADOR DIDÁCTICO
                            </h3>
                            <div className="bg-white rounded-[32px] border border-slate-100 p-8 shadow-xl shadow-slate-200/50">
                                <div className="flex items-center justify-between mb-8">
                                    <div>
                                        <h4 className="text-sm font-black text-slate-800">Ajustar Variables de Ejemplo</h4>
                                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Solo para fines educativos</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-3xl font-black text-indigo-600">{(simResult.score * 100).toFixed(1)}%</p>
                                        <p className={`text-[10px] font-black uppercase tracking-[0.2em] ${
                                            simResult.level === 'Alta' ? 'text-rose-500' :
                                            simResult.level === 'Moderada' ? 'text-amber-500' :
                                            'text-emerald-500'
                                        }`}>{simResult.level}</p>
                                    </div>
                                </div>
                                <div className="space-y-6">
                                    {[
                                        { id: 'retryRate', label: 'RetryRate', min: 0, max: 1, step: 0.01 },
                                        { id: 'errRate', label: 'ErrRate', min: 0, max: 1, step: 0.01 },
                                        { id: 'switchRate', label: 'SwitchRate', min: 0, max: 1, step: 0.01 },
                                        { id: 'timePressure', label: 'TimePressure (Norm)', min: 0, max: 1, step: 0.01 },
                                        { id: 'progressGap', label: 'ProgressGap', min: 0, max: 1, step: 0.01 },
                                    ].map((s) => (
                                        <div key={s.id} className="space-y-2">
                                            <div className="flex justify-between text-[10px] font-black uppercase text-slate-400 tracking-widest">
                                                <label>{s.label}</label>
                                                <span>{(simValues as any)[s.id].toFixed(2)}</span>
                                            </div>
                                            <input 
                                                type="range"
                                                min={s.min}
                                                max={s.max}
                                                step={s.step}
                                                value={(simValues as any)[s.id]}
                                                onChange={(e) => setSimValues(prev => ({ ...prev, [s.id]: parseFloat(e.target.value) }))}
                                                className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Limitations */}
                    <section className="bg-rose-50/50 rounded-[32px] p-8 border border-rose-100/50">
                        <div className="flex items-center gap-4 mb-4">
                            <AlertTriangle className="w-6 h-6 text-rose-500" />
                            <h4 className="text-sm font-black text-rose-900 uppercase tracking-widest">Limitaciones y Advertencias</h4>
                        </div>
                        <p className="text-xs text-rose-700 leading-relaxed font-medium">
                            La carga cognitiva se estima a partir de trazas de interacción. Algunos comportamientos pueden tener múltiples interpretaciones: 
                            mucho tiempo en una actividad puede indicar dificultad, reflexión profunda o simplemente inactividad. 
                            Por eso el cálculo incluye reglas de limpieza temporal, normalización y un nivel de confianza basado en la disponibilidad de datos.
                        </p>
                    </section>

                </div>
            </div>
        </div>
    );
}
