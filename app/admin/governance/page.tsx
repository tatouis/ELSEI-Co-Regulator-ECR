
'use client';

import React, { useState, useEffect } from 'react';
import { 
    Activity, Shield, Database, Search, 
    ArrowRight, ChevronRight, Globe, Lock,
    CheckCircle, AlertTriangle, Info, Brain,
    Users, Layout, Filter, RefreshCcw, Clock
} from 'lucide-react';
import { useTranslation } from '@/lib/LanguageContext';
import CognitiveLoadModal from '@/components/CognitiveLoadModal';

export default function GovernancePage() {
    const { t } = useTranslation();
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState<any>(null);
    const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);
    const [selectedStudent, setSelectedStudent] = useState<any>(null);
    const [activeTab, setActiveTab] = useState<'students' | 'metadata' | 'audit'>('students');
    const [isCognitiveLoadModalOpen, setIsCognitiveLoadModalOpen] = useState(false);

    useEffect(() => {
        fetchGovernanceData();
    }, []);

    const fetchGovernanceData = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/admin/governance');
            const result = await res.json();
            setData(result);
            if (result.data?.Courses?.length > 0) {
                setSelectedCourseId(result.data.Courses[0].id.toString());
            }
        } catch (error) {
            console.error('Error fetching governance data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCourseChange = (id: string) => {
        setSelectedCourseId(id);
        setSelectedStudent(null);
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center h-[70vh]">
                <div className="relative">
                    <div className="w-20 h-20 rounded-full border-4 border-indigo-100 border-t-indigo-600 animate-spin" />
                    <Brain className="w-8 h-8 text-indigo-600 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
                </div>
                <p className="mt-6 font-black uppercase tracking-[0.3em] text-[10px] text-slate-400 animate-pulse">{t('common.loading')}</p>
            </div>
        );
    }

    const currentCourse = data?.data?.Courses?.find((c: any) => c.id.toString() === selectedCourseId);

    return (
        <div className="min-h-screen pb-20 animate-in fade-in duration-700">
            {/* Premium Header */}
            <header className="mb-12">
                <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
                    <div className="space-y-2">
                        <div className="flex items-center gap-3">
                            <div className="px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-[10px] font-black text-indigo-600 uppercase tracking-widest">
                                Admin Portal
                            </div>
                            <div className="w-1.5 h-1.5 rounded-full bg-slate-200" />
                            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
                                <Database className="w-3 h-3" /> Moodle REST API
                            </div>
                        </div>
                        <h1 className="text-5xl font-black text-slate-900 tracking-tight leading-none">
                            {t('admin.governance.title')}
                        </h1>
                        <p className="text-slate-500 font-medium text-lg max-w-2xl">
                            {t('admin.description')}
                        </p>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="hidden xl:flex flex-col items-end mr-4">
                            <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">{t('admin.governance.moodleExplorer')}</p>
                            <p className="text-xs font-mono text-slate-400 truncate max-w-[200px]">{data?.moodleUrl}</p>
                        </div>
                        {selectedCourseId && (
                            <button 
                                onClick={() => setIsCognitiveLoadModalOpen(true)}
                                className="group relative flex items-center gap-3 px-8 py-4 rounded-[24px] bg-indigo-600 text-white shadow-2xl shadow-indigo-200 hover:bg-indigo-700 transition-all active:scale-95 overflow-hidden"
                            >
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]" />
                                <Brain className="w-5 h-5" />
                                <span className="text-xs font-black uppercase tracking-widest">{t('cognitiveLoad.title')}</span>
                                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                            </button>
                        )}
                    </div>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
                
                {/* Course Sidebar - Glassmorphism style */}
                <aside className="lg:col-span-3 space-y-6 lg:sticky lg:top-8">
                    <div className="flex items-center justify-between px-2">
                        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">{t('common.course')}s</h3>
                        <Filter className="w-4 h-4 text-slate-300" />
                    </div>
                    
                    <div className="space-y-3">
                        {data?.data?.Courses?.map((course: any) => (
                            <button
                                key={course.id}
                                onClick={() => handleCourseChange(course.id.toString())}
                                className={`w-full text-left p-5 rounded-[28px] transition-all group relative overflow-hidden ${
                                    selectedCourseId === course.id.toString() 
                                    ? 'bg-white text-indigo-600 shadow-xl shadow-indigo-100 ring-1 ring-indigo-50' 
                                    : 'hover:bg-white/50 text-slate-500 hover:text-slate-900'
                                }`}
                            >
                                {selectedCourseId === course.id.toString() && (
                                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-8 bg-indigo-600 rounded-r-full" />
                                )}
                                <div className="flex items-center justify-between gap-3">
                                    <span className="text-sm font-black leading-snug line-clamp-2">{course.fullname}</span>
                                    <ChevronRight className={`w-4 h-4 shrink-0 transition-all ${
                                        selectedCourseId === course.id.toString() ? 'translate-x-0 opacity-100' : '-translate-x-2 opacity-0 group-hover:opacity-100 group-hover:translate-x-0'
                                    }`} />
                                </div>
                            </button>
                        ))}
                    </div>
                </aside>

                {/* Main Dashboard Area */}
                <main className="lg:col-span-9 space-y-10">
                    
                    {/* Course Banner */}
                    {currentCourse && (
                        <div className="relative rounded-[40px] bg-slate-900 p-10 text-white overflow-hidden shadow-2xl">
                            <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/20 blur-[120px] -mr-48 -mt-48" />
                            <div className="relative z-10">
                                <div className="flex items-center gap-3 mb-4">
                                    <Layout className="w-5 h-5 text-indigo-400" />
                                    <span className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-400">{t('common.course')} Seleccionado</span>
                                </div>
                                <h2 className="text-4xl font-black mb-6 max-w-3xl leading-tight">{currentCourse.fullname}</h2>
                                <div className="flex flex-wrap gap-4">
                                    <div className="px-6 py-3 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl flex items-center gap-3">
                                        <Users className="w-4 h-4 text-slate-400" />
                                        <span className="text-xs font-bold">{data?.data?.Students?.length || 0} {t('admin.governance.tabs.students')}</span>
                                    </div>
                                    <div className="px-6 py-3 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl flex items-center gap-3">
                                        <Shield className="w-4 h-4 text-slate-400" />
                                        <span className="text-xs font-bold">{t('admin.governance.connected')}</span>
                                    </div>
                                    <button 
                                        onClick={fetchGovernanceData}
                                        className="px-6 py-3 rounded-2xl bg-indigo-500 hover:bg-indigo-400 transition-all flex items-center gap-3 text-xs font-black uppercase tracking-widest"
                                    >
                                        <RefreshCcw className="w-4 h-4" />
                                        Sincronizar
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Navigation Tabs */}
                    <div className="flex items-center gap-1 bg-slate-100 p-1.5 rounded-[24px] w-fit">
                        {(['students', 'metadata', 'audit'] as const).map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`px-8 py-3.5 rounded-[20px] text-[10px] font-black uppercase tracking-[0.2em] transition-all ${
                                    activeTab === tab 
                                    ? 'bg-white text-indigo-600 shadow-lg shadow-indigo-100/50' 
                                    : 'text-slate-400 hover:text-slate-600'
                                }`}
                            >
                                {t(`admin.governance.tabs.${tab}`)}
                            </button>
                        ))}
                    </div>

                    {/* Content Section */}
                    <div className="bg-white rounded-[48px] border border-slate-100 shadow-2xl shadow-slate-200/50 overflow-hidden">
                        
                        {activeTab === 'students' && (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead className="bg-slate-50 border-b border-slate-100 text-[10px] uppercase font-black text-slate-400 tracking-[0.2em]">
                                        <tr>
                                            <th className="px-10 py-6 font-black">{t('admin.governance.studentTable.name')}</th>
                                            <th className="px-10 py-6 font-black">{t('admin.governance.studentTable.grades')}</th>
                                            <th className="px-10 py-6 font-black">{t('admin.governance.studentTable.time')}</th>
                                            <th className="px-10 py-6 font-black text-right">{t('common.actions')}</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-50">
                                        {data?.data?.Students?.length > 0 ? (
                                            data.data.Students.map((student: any) => (
                                                <tr key={student.id} className="group hover:bg-indigo-50/20 transition-all">
                                                    <td className="px-10 py-7">
                                                        <div className="flex items-center gap-5">
                                                            <div className="w-12 h-12 rounded-[20px] bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-black text-lg shadow-lg shadow-indigo-100">
                                                                {student.fullname?.charAt(0)}
                                                            </div>
                                                            <div>
                                                                <p className="text-sm font-black text-slate-900 group-hover:text-indigo-600 transition-colors">{student.fullname}</p>
                                                                <p className="text-[10px] text-slate-400 font-mono mt-0.5">UID: {student.id}</p>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-10 py-7">
                                                        <div className="flex items-center gap-3">
                                                            <div className="h-2 w-24 bg-slate-100 rounded-full overflow-hidden shadow-inner">
                                                                <div className="h-full bg-emerald-500 rounded-full" style={{ width: '75%' }} />
                                                            </div>
                                                            <span className="text-xs font-black text-emerald-600">8.2</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-10 py-7">
                                                        <div className="flex items-center gap-2 text-slate-500 font-bold text-xs">
                                                            <Clock className="w-3.5 h-3.5" />
                                                            <span>145 min</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-10 py-7 text-right">
                                                        <button 
                                                            onClick={() => {
                                                                setSelectedStudent(student);
                                                                setIsCognitiveLoadModalOpen(true);
                                                            }}
                                                            className="inline-flex items-center justify-center p-3.5 rounded-2xl bg-slate-50 text-slate-400 hover:bg-indigo-600 hover:text-white hover:shadow-xl hover:shadow-indigo-200 transition-all active:scale-90 border border-slate-100"
                                                        >
                                                            <Brain className="w-5 h-5" />
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan={4} className="px-10 py-32 text-center">
                                                    <div className="max-w-xs mx-auto space-y-4">
                                                        <div className="w-20 h-20 rounded-[32px] bg-slate-50 flex items-center justify-center mx-auto text-slate-300">
                                                            <Users className="w-10 h-10" />
                                                        </div>
                                                        <h4 className="text-sm font-black text-slate-900 uppercase tracking-widest">No se encontraron estudiantes</h4>
                                                        <p className="text-xs text-slate-400 font-medium">No hay registros de matriculación activos en este curso de Moodle.</p>
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        )}

                        {activeTab === 'metadata' && (
                            <div className="p-20 text-center space-y-6">
                                <div className="w-24 h-24 rounded-[40px] bg-slate-50 flex items-center justify-center mx-auto text-slate-300">
                                    <Database className="w-10 h-10" />
                                </div>
                                <div className="space-y-2">
                                    <h4 className="text-lg font-black text-slate-900 uppercase tracking-widest">{t('common.soon')}</h4>
                                    <p className="text-sm text-slate-400 max-w-md mx-auto">La exploración avanzada de metadatos profundos está en fase de desarrollo.</p>
                                </div>
                            </div>
                        )}
                    </div>
                </main>
            </div>

            {/* Cognitive Load Modal */}
            <CognitiveLoadModal 
                isOpen={isCognitiveLoadModalOpen} 
                onClose={() => setIsCognitiveLoadModalOpen(false)} 
                courseId={selectedCourseId || undefined}
                studentId={selectedStudent?.id?.toString()}
                students={data?.data?.Students}
            />

            <style jsx global>{`
                @keyframes shimmer {
                    100% { transform: translateX(100%); }
                }
            `}</style>
        </div>
    );
}
