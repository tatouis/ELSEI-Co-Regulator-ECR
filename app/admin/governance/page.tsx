
'use client';

import React, { useState, useEffect } from 'react';
import { 
    Activity, Shield, Database, Search, 
    ArrowRight, ChevronRight, Globe, Lock,
    CheckCircle, AlertTriangle, Info, Brain,
    Users, Layout, Filter, RefreshCcw, Clock,
    BookOpen, GraduationCap, Zap, Server
} from 'lucide-react';
import { useTranslation } from '@/lib/LanguageContext';
import CognitiveLoadModal from '@/components/CognitiveLoadModal';
import Navbar from '@/components/Navbar';

export default function GovernancePage() {
    const { t } = useTranslation();
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState<any>(null);
    const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);
    const [selectedStudent, setSelectedStudent] = useState<any>(null);
    const [activeTab, setActiveTab] = useState<'students' | 'metadata' | 'audit'>('students');
    const [isCognitiveLoadModalOpen, setIsCognitiveLoadModalOpen] = useState(false);

    const [isRefetching, setIsRefetching] = useState(false);

    useEffect(() => {
        fetchGovernanceData();
    }, []);

    const fetchGovernanceData = async (courseId?: string) => {
        if (!data) setLoading(true);
        else setIsRefetching(true);
        
        try {
            const url = courseId ? `/api/admin/governance?courseId=${courseId}` : '/api/admin/governance';
            const res = await fetch(url);
            const result = await res.json();
            setData(result);
            if (!courseId && result.data?.Courses?.length > 0) {
                setSelectedCourseId(result.data.Courses[0].id.toString());
            }
        } catch (error) {
            console.error('Error fetching governance data:', error);
        } finally {
            setLoading(false);
            setIsRefetching(false);
        }
    };

    const handleCourseChange = (id: string) => {
        setSelectedCourseId(id);
        setSelectedStudent(null);
        fetchGovernanceData(id);
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-white">
                <div className="flex flex-col items-center gap-6">
                    <div className="w-14 h-14 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                    <div className="animate-pulse text-xl font-black tracking-[0.3em] text-indigo-600 uppercase">ECR GOVERNANCE</div>
                </div>
            </div>
        );
    }

    const currentCourse = data?.data?.Courses?.find((c: any) => c.id.toString() === selectedCourseId);

    return (
        <div className="min-h-screen bg-white text-slate-900 font-sans selection:bg-indigo-500/10">
            <Navbar />
            
            <div className="max-w-7xl mx-auto px-4 pt-24 pb-12">
                {/* Header Section - Matches Admin Design */}
                <header className="mb-12 flex flex-col lg:flex-row lg:items-end justify-between gap-10">
                    <div className="space-y-2">
                        <div className="flex items-center gap-3 text-indigo-600 mb-2">
                            <Shield className="w-5 h-5" />
                            <span className="text-[10px] font-black uppercase tracking-[0.2em]">Data Governance & Transparency</span>
                        </div>
                        <h1 className="text-5xl font-black bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-indigo-600 tracking-tight">
                            {t('admin.governance.title')}
                        </h1>
                        <p className="text-slate-500 font-medium text-sm max-w-xl">
                            {t('admin.description')}
                        </p>
                    </div>
                    
                    <div className="flex flex-col sm:flex-row gap-6 items-center">
                        <div className="flex flex-col items-end">
                            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border ${data?.moodleStatus === 'connected' ? 'bg-emerald-50 border-emerald-100' : 'bg-red-50 border-red-100'}`}>
                                <div className={`w-2 h-2 rounded-full shadow-[0_0_8px_rgba(16,185,129,0.8)] animate-pulse ${data?.moodleStatus === 'connected' ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]' : 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.8)]'}`} />
                                <span className={`text-[9px] font-black uppercase tracking-widest ${data?.moodleStatus === 'connected' ? 'text-emerald-600' : 'text-red-600'}`}>
                                    {data?.moodleStatus === 'connected' ? 'API Connected' : 'API Error'}
                                </span>
                            </div>
                            <p className="text-[10px] font-mono text-slate-400 mt-2">{data?.moodleUrl || 'Timeout / Unavailable'}</p>
                        </div>
                        <button 
                            onClick={() => setIsCognitiveLoadModalOpen(true)}
                            className="group relative flex items-center gap-3 px-8 py-4 rounded-[2rem] bg-slate-900 text-white shadow-2xl hover:bg-slate-800 transition-all active:scale-95 overflow-hidden"
                        >
                            <Brain className="w-5 h-5 text-indigo-400" />
                            <span className="text-xs font-black uppercase tracking-widest">{t('cognitiveLoad.title')}</span>
                            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </button>
                    </div>
                </header>

                {/* Quick Info Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                    <StatCard 
                        title="Enrolled Students" 
                        value={data?.data?.Students?.length || 0} 
                        icon={<Users className="w-5 h-5 text-indigo-600" />} 
                    />
                    <StatCard 
                        title="Available Courses" 
                        value={data?.data?.Courses?.length || 0} 
                        icon={<BookOpen className="w-5 h-5 text-indigo-600" />} 
                    />
                    <StatCard 
                        title="Moodle API" 
                        value={data?.moodleStatus === 'connected' ? "Connected" : "Timeout"} 
                        icon={data?.moodleStatus === 'connected' ? <Zap className="w-5 h-5 text-emerald-600" /> : <AlertTriangle className="w-5 h-5 text-red-600" />} 
                        isSuccess={data?.moodleStatus === 'connected'}
                        isError={data?.moodleStatus !== 'connected'}
                    />
                    <StatCard 
                        title="Security Layer" 
                        value="Active" 
                        icon={<Server className="w-5 h-5 text-indigo-600" />} 
                    />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                    {/* Course Selection Card */}
                    <div className="lg:col-span-4 bg-white border border-slate-100 rounded-[2.5rem] p-8 shadow-2xl shadow-indigo-500/5 transition-all">
                        <div className="flex items-center justify-between mb-8">
                            <h3 className="text-xl font-black text-slate-800 flex items-center gap-3">
                                <GraduationCap className="w-6 h-6 text-indigo-600" /> {t('common.course')}s
                            </h3>
                            <div className="w-10 h-10 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400">
                                <Filter className="w-4 h-4" />
                            </div>
                        </div>
                        
                        <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                            {data?.data?.Courses?.map((course: any) => (
                                <button
                                    key={course.id}
                                    onClick={() => handleCourseChange(course.id.toString())}
                                    className={`w-full text-left p-6 rounded-[2rem] transition-all group relative overflow-hidden ${
                                        selectedCourseId === course.id.toString() 
                                        ? 'bg-slate-900 text-white shadow-xl shadow-slate-200' 
                                        : 'hover:bg-slate-50 text-slate-500 hover:text-slate-900 border border-transparent'
                                    }`}
                                >
                                    <div className="flex items-center justify-between gap-4">
                                        <span className="text-sm font-black leading-snug line-clamp-2">{course.fullname}</span>
                                        <ChevronRight className={`w-4 h-4 shrink-0 transition-all ${
                                            selectedCourseId === course.id.toString() ? 'translate-x-0 opacity-100' : 'opacity-0 group-hover:opacity-100'
                                        }`} />
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Main Content Area */}
                    <div className="lg:col-span-8 space-y-8">
                        {/* Course Overview Card */}
                        {currentCourse && (
                            <div className="bg-indigo-600 rounded-[2.5rem] p-10 text-white shadow-2xl shadow-indigo-500/20 relative overflow-hidden group">
                                <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 blur-[100px] -mr-48 -mt-48 rounded-full" />
                                <div className="relative z-10">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center text-white backdrop-blur-md">
                                            <Activity className="w-4 h-4" />
                                        </div>
                                        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-100">Live Course Context</span>
                                    </div>
                                    <h2 className="text-3xl font-black mb-8 max-w-2xl leading-tight">{currentCourse.fullname}</h2>
                                    <div className="flex items-center gap-4">
                                        <div className="px-4 py-2 rounded-xl bg-white/10 border border-white/20 text-[10px] font-black uppercase tracking-widest">
                                            Auto-sync Active
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Data Card */}
                        <div className={`bg-white border border-slate-100 rounded-[2.5rem] overflow-hidden shadow-2xl shadow-indigo-500/5 transition-opacity duration-300 ${isRefetching ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead className="bg-slate-50 text-slate-400 text-[10px] uppercase tracking-[0.2em] font-black">
                                        <tr>
                                            <th className="px-10 py-6">{t('admin.governance.studentTable.name')}</th>
                                            <th className="px-10 py-6 text-center">{t('admin.governance.studentTable.grades')}</th>
                                            <th className="px-10 py-6 text-center">{t('admin.governance.studentTable.time')}</th>
                                            <th className="px-10 py-6 text-right">{t('common.actions')}</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-50">
                                        {data?.data?.Students?.length > 0 ? (
                                            data.data.Students.map((student: any) => (
                                                <tr key={student.id} className="group hover:bg-indigo-50/30 transition-all">
                                                    <td className="px-10 py-7">
                                                        <div className="flex items-center gap-5">
                                                            <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 font-black border border-indigo-100 group-hover:bg-white transition-all">
                                                                {student.fullname?.charAt(0)}
                                                            </div>
                                                            <div>
                                                                <p className="text-sm font-black text-slate-800">{student.fullname}</p>
                                                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">UID: {student.id}</p>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-10 py-7 text-center">
                                                        <div className="flex items-center justify-center gap-3">
                                                            <div className="h-2 w-16 bg-slate-100 rounded-full overflow-hidden">
                                                                <div className="h-full bg-emerald-500" style={{ width: '70%' }} />
                                                            </div>
                                                            <span className="text-xs font-black text-slate-600">7.5</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-10 py-7 text-center">
                                                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-xl bg-slate-50 text-slate-500 text-[10px] font-black uppercase tracking-tight">
                                                            <Clock className="w-3 h-3" /> 120m
                                                        </div>
                                                    </td>
                                                    <td className="px-10 py-7 text-right">
                                                        <button 
                                                            onClick={() => {
                                                                setSelectedStudent(student);
                                                                setIsCognitiveLoadModalOpen(true);
                                                            }}
                                                            className="inline-flex items-center justify-center p-3.5 rounded-2xl bg-slate-50 text-slate-400 hover:bg-indigo-600 hover:text-white transition-all shadow-sm hover:shadow-lg active:scale-90"
                                                        >
                                                            <Brain className="w-5 h-5" />
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan={4} className="px-10 py-40 text-center">
                                                    <div className="max-w-xs mx-auto space-y-4">
                                                        <div className={`w-20 h-20 rounded-[2rem] flex items-center justify-center mx-auto ${data?.moodleStatus === 'connected' ? 'bg-emerald-50 text-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.2)]' : 'bg-red-50 text-red-500 shadow-[0_0_15px_rgba(239,68,68,0.2)]'}`}>
                                                            {data?.moodleStatus === 'connected' ? <Zap className="w-8 h-8" /> : <AlertTriangle className="w-8 h-8" />}
                                                        </div>
                                                        <h4 className="text-sm font-black text-slate-800 uppercase tracking-widest">
                                                            {data?.moodleStatus === 'connected' ? 'API is Connected' : 'API Connection Failed'}
                                                        </h4>
                                                        <p className="text-xs text-slate-400 font-medium leading-relaxed">
                                                            {data?.moodleStatus === 'connected' 
                                                                ? 'The connection to Moodle is active, but there are no enrolled students to analyze in this course.'
                                                                : 'The Moodle instance took too long to respond or returned an error. This usually happens with large instances on Vercel deployments.'}
                                                        </p>
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
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
                .custom-scrollbar::-webkit-scrollbar {
                    width: 5px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: #e2e8f0;
                    border-radius: 10px;
                }
            `}</style>
        </div>
    );
}

function StatCard({ title, value, icon, isSuccess }: any) {
    return (
        <div className="bg-white border border-slate-100 p-8 rounded-[2.5rem] transition-all hover:bg-white shadow-2xl shadow-indigo-500/5 group relative overflow-hidden">
            <div className={`absolute top-0 right-0 w-32 h-32 blur-[60px] opacity-10 transition-opacity group-hover:opacity-20 ${isSuccess ? 'bg-emerald-500' : 'bg-indigo-500'}`} />
            <div className="flex justify-between items-start mb-6 relative z-10">
                <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center border border-slate-100 group-hover:scale-110 transition-transform group-hover:bg-white shadow-sm">
                    {icon}
                </div>
            </div>
            <h3 className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] mb-2 relative z-10">{title}</h3>
            <div className={`text-3xl font-black relative z-10 tracking-tight ${isSuccess ? 'text-emerald-600' : 'text-slate-900'}`}>
                {value}
            </div>
        </div>
    );
}
