
'use client';

import React, { useState, useEffect } from 'react';
import { 
    Activity, Shield, Database, Search, 
    ArrowRight, ChevronRight, Globe, Lock,
    CheckCircle, AlertTriangle, Info, Brain
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
            <div className="flex flex-col items-center justify-center h-[60vh] text-slate-400">
                <Activity className="w-12 h-12 animate-pulse mb-4 text-indigo-500" />
                <p className="font-bold uppercase tracking-widest text-xs">{t('common.loading')}</p>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">{t('admin.governance.title')}</h1>
                    <p className="text-slate-500 font-medium mt-1">{t('admin.description')}</p>
                </div>
                
                <div className="flex items-center gap-4">
                    <div className="px-6 py-3 rounded-2xl bg-white border border-slate-100 shadow-sm flex items-center gap-4">
                        <div className="text-right">
                            <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest mb-0.5">{t('admin.governance.moodleExplorer')}</p>
                            <p className="text-xs font-mono text-indigo-600 font-bold truncate">{data?.moodleUrl}</p>
                        </div>
                        {selectedCourseId && (
                            <button 
                                onClick={() => setIsCognitiveLoadModalOpen(true)}
                                className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 text-white text-[10px] font-black uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200"
                            >
                                <Brain className="w-4 h-4" />
                                {t('cognitiveLoad.title')}
                            </button>
                        )}
                    </div>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Course Selection */}
                <aside className="lg:col-span-3 space-y-4">
                    <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 ml-2">{t('common.course')}s</h3>
                    <div className="bg-white rounded-[32px] border border-slate-100 p-2 shadow-sm">
                        {data?.data?.Courses?.map((course: any) => (
                            <button
                                key={course.id}
                                onClick={() => handleCourseChange(course.id.toString())}
                                className={`w-full text-left p-4 rounded-[24px] transition-all flex items-center justify-between group ${
                                    selectedCourseId === course.id.toString() 
                                    ? 'bg-indigo-50 text-indigo-700 shadow-sm border border-indigo-100' 
                                    : 'hover:bg-slate-50 text-slate-600'
                                }`}
                            >
                                <span className="text-sm font-bold truncate pr-4">{course.fullname}</span>
                                <ChevronRight className={`w-4 h-4 shrink-0 transition-transform ${selectedCourseId === course.id.toString() ? 'translate-x-1' : 'opacity-0 group-hover:opacity-100'}`} />
                            </button>
                        ))}
                    </div>
                </aside>

                {/* Main Content */}
                <main className="lg:col-span-9 space-y-8">
                    {/* Tabs */}
                    <div className="flex items-center gap-2 bg-slate-100/50 p-1.5 rounded-2xl w-fit">
                        {(['students', 'metadata', 'audit'] as const).map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                                    activeTab === tab 
                                    ? 'bg-white text-indigo-600 shadow-sm' 
                                    : 'text-slate-400 hover:text-slate-600'
                                }`}
                            >
                                {t(`admin.governance.tabs.${tab}`)}
                            </button>
                        ))}
                    </div>

                    {/* Students Tab */}
                    {activeTab === 'students' && (
                        <div className="bg-white rounded-[40px] border border-slate-100 shadow-sm overflow-hidden">
                            <table className="w-full text-left border-collapse">
                                <thead className="bg-slate-50/50 border-b border-slate-100 text-[10px] uppercase font-black text-slate-400 tracking-widest">
                                    <tr>
                                        <th className="px-8 py-5">{t('admin.governance.studentTable.name')}</th>
                                        <th className="px-8 py-5">{t('admin.governance.studentTable.grades')}</th>
                                        <th className="px-8 py-5">{t('admin.governance.studentTable.time')}</th>
                                        <th className="px-8 py-5 text-right">{t('common.actions')}</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {data?.data?.Students?.map((student: any) => (
                                        <tr key={student.id} className="hover:bg-slate-50/30 transition-colors group">
                                            <td className="px-8 py-5">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-bold">
                                                        {student.fullname?.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-bold text-slate-900">{student.fullname}</p>
                                                        <p className="text-[10px] text-slate-400 font-mono">ID: {student.id}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-8 py-5">
                                                <div className="flex items-center gap-2">
                                                    <div className="h-1.5 w-16 bg-slate-100 rounded-full overflow-hidden">
                                                        <div className="h-full bg-emerald-500" style={{ width: '70%' }} />
                                                    </div>
                                                    <span className="text-xs font-bold text-slate-600">7.5</span>
                                                </div>
                                            </td>
                                            <td className="px-8 py-5">
                                                <span className="text-xs font-bold text-slate-600">120 min</span>
                                            </td>
                                            <td className="px-8 py-5 text-right">
                                                <button 
                                                    onClick={() => {
                                                        setSelectedStudent(student);
                                                        setIsCognitiveLoadModalOpen(true);
                                                    }}
                                                    className="p-2.5 rounded-xl bg-slate-50 hover:bg-indigo-50 text-slate-400 hover:text-indigo-600 transition-all border border-transparent hover:border-indigo-100"
                                                >
                                                    <Brain className="w-4 h-4" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {/* Metadata Tab (Placeholder for now) */}
                    {activeTab === 'metadata' && (
                        <div className="p-12 text-center bg-slate-50 rounded-[40px] border border-dashed border-slate-200">
                            <Database className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                            <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">{t('common.soon')}</p>
                        </div>
                    )}
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
        </div>
    );
}
