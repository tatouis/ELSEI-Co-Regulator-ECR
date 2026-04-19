'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
    Database, UserCheck, BookOpen, FileCheck, 
    AlertCircle, CheckCircle2, ChevronRight, Activity,
    Clock, MessageSquare, Target, User, Sparkles, Zap
} from 'lucide-react';
import Navbar from '@/components/Navbar';

import { useTranslation } from '@/lib/LanguageContext';

export default function DataGovernance() {
  const { t } = useTranslation();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'students' | 'dictionary' | 'performance'>('students');

  useEffect(() => {
    setLoading(true);
    const url = selectedCourseId ? `/api/admin/governance?courseId=${selectedCourseId}` : '/api/admin/governance';
    fetch(url)
      .then(res => res.json())
      .then(result => {
        setData(result);
        setLoading(false);
      });
  }, [selectedCourseId]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center text-slate-800 font-sans bg-white">
      <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          <div className="animate-pulse text-lg font-black tracking-[0.3em] text-indigo-400 uppercase">{t('common.loading')}</div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen text-slate-900 font-sans selection:bg-indigo-500/10 bg-white">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 pt-24 pb-12">
        <header className="mb-12">
          <Link href="/admin" className="text-indigo-600 hover:text-indigo-700 font-bold mb-6 inline-flex items-center gap-2 text-sm transition-all hover:-translate-x-1">
            <ChevronRight className="w-4 h-4 rotate-180" /> {t('admin.settings.backToConsole')}
          </Link>
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
            <div>
              <h1 className="text-4xl font-black bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-cyan-600 mb-2 flex items-center gap-3">
                <Database className="w-8 h-8 text-indigo-600" />
                {t('admin.governance.title')}
              </h1>
              <p className="text-slate-500 font-medium max-w-2xl">
                {t('admin.governance.moodleExplorer')}
              </p>
            </div>
            <div className="flex flex-col gap-2 min-w-[240px]">
                <div className={`px-4 py-2.5 rounded-2xl border flex items-center justify-between shadow-sm ${data?.moodleStatus === 'connected' ? 'bg-emerald-50 border-emerald-100 text-emerald-700' : 'bg-rose-50 border-rose-100 text-rose-700'}`}>
                    <span className="text-xs font-black uppercase tracking-widest flex items-center gap-2">
                        {data?.moodleStatus === 'connected' ? <CheckCircle2 className="w-4 h-4"/> : <AlertCircle className="w-4 h-4"/>}
                        {t('admin.governance.syncStatus')}
                    </span>
                    <span className="text-sm font-black uppercase">{data?.moodleStatus === 'connected' ? t('admin.governance.connected') : t('common.error')}</span>
                </div>
                <div className="px-4 py-2 bg-white border border-slate-100 rounded-xl shadow-sm">
                    <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest mb-0.5">Endpoint API</p>
                    <p className="text-xs font-mono text-indigo-600 font-bold truncate">{data?.moodleUrl}</p>
                </div>
            </div>
          </div>
        </header>

        {data?.moodleStatus !== 'connected' ? (
             <div className="p-8 rounded-[40px] bg-rose-50 border border-rose-100 text-center">
                 <AlertCircle className="w-12 h-12 text-rose-400 mx-auto mb-4" />
                 <h2 className="text-xl font-black text-rose-900">Moodle Connection Failed</h2>
                 <p className="text-rose-600 mt-2 text-sm max-w-lg mx-auto">Please check your Moodle URL and Web Service token in the settings.</p>
             </div>
        ) : (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Left: Course Selection & Global Nav */}
                <div className="lg:col-span-4 space-y-8">
                    <section>
                        <h2 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 mb-6 flex items-center gap-2">
                            <BookOpen className="w-4 h-4 text-indigo-400" /> SYNCED COURSES
                        </h2>
                        <div className="space-y-3">
                            {data.data.Courses.map((c: any) => (
                                <button 
                                    key={c.id} 
                                    onClick={() => setSelectedCourseId(c.id.toString())}
                                    className={`w-full text-left p-5 rounded-3xl border transition-all relative overflow-hidden group ${
                                        (selectedCourseId === c.id.toString() || (!selectedCourseId && data.data.Courses[0]?.id === c.id))
                                        ? 'bg-indigo-600 border-indigo-600 text-white shadow-2xl shadow-indigo-200 scale-[1.02]' 
                                        : 'bg-white border-slate-100 hover:border-indigo-200 shadow-sm'
                                    }`}>
                                    <h3 className="text-sm font-black mb-1 line-clamp-1">{c.fullname}</h3>
                                    <div className={`flex items-center justify-between text-[10px] font-bold uppercase tracking-widest ${(selectedCourseId === c.id.toString() || (!selectedCourseId && data.data.Courses[0]?.id === c.id)) ? 'text-indigo-200' : 'text-slate-400'}`}>
                                        <span className="font-mono">{c.shortname}</span>
                                        <span>ID {c.id}</span>
                                    </div>
                                    {(selectedCourseId === c.id.toString() || (!selectedCourseId && data.data.Courses[0]?.id === c.id)) && (
                                        <Activity className="absolute bottom-[-10px] right-[-10px] w-24 h-24 opacity-10 pointer-events-none" />
                                    )}
                                </button>
                            ))}
                        </div>
                    </section>

                    {/* Quick Stats / Global Info */}
                    <div className="bg-slate-50 rounded-[40px] p-8 border border-slate-100">
                        <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-6">Course Summary</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-4 bg-white rounded-2xl border border-slate-100">
                                <p className="text-[10px] font-black text-slate-400 mb-1">TOTAL USERS</p>
                                <p className="text-xl font-black text-slate-900">{data.data.Students.length}</p>
                            </div>
                            <div className="p-4 bg-white rounded-2xl border border-slate-100">
                                <p className="text-[10px] font-black text-slate-400 mb-1">GRADES FOUND</p>
                                <p className="text-xl font-black text-indigo-600">{data.data.Grades.length}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right: Detailed View with Tabs */}
                <div className="lg:col-span-8 flex flex-col gap-8">
                    {/* Tabs Navigation */}
                    <div className="flex bg-slate-50 p-1.5 rounded-3xl border border-slate-100 w-fit">
                        {[
                            { id: 'students', label: t('admin.governance.tabs.students'), icon: UserCheck },
                            { id: 'dictionary', label: t('admin.governance.tabs.metadata'), icon: Database },
                        ].map((tab: any) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id as any)}
                                className={`px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 transition-all ${
                                    activeTab === tab.id ? 'bg-white text-indigo-600 shadow-xl shadow-indigo-500/10 border border-slate-100' : 'text-slate-400 hover:text-slate-600'
                                }`}
                            >
                                <tab.icon className="w-3.5 h-3.5" />
                                {tab.label}
                            </button>
                        ))}
                    </div>

                    {/* Dynamic Dictionary Hookup */}
                    {activeTab === 'dictionary' && (
                        <section className="bg-white rounded-[40px] border border-slate-100 p-8 shadow-2xl shadow-indigo-500/5 animate-in fade-in slide-in-from-top-4 duration-500">
                            <div className="mb-8">
                                <h2 className="text-xl font-black text-slate-800 flex items-center gap-3">
                                    <Sparkles className="w-6 h-6 text-indigo-600" />
                                    Live Metadata Discovery
                                </h2>
                                <p className="text-sm text-slate-500 mt-2">Every field found in the current course API response is automatically mapped here for governance transparency.</p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {Object.entries(data.data.Dictionary || {}).map(([key, info]: [any, any]) => (
                                    <div key={key} className="p-5 rounded-3xl border border-slate-50 bg-slate-50/50 hover:bg-white hover:border-indigo-200 hover:shadow-lg transition-all group">
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="font-mono text-sm font-black text-indigo-600 select-all">{key}</span>
                                            <span className="text-[9px] font-black px-2 py-0.5 rounded-lg bg-indigo-50 text-indigo-400 uppercase tracking-widest border border-indigo-100">{info.type}</span>
                                        </div>
                                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">SOURCE: {info.source}</p>
                                        <div className="flex items-center gap-2 mt-3 pt-3 border-t border-slate-100 opacity-60 group-hover:opacity-100 transition-opacity">
                                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                            <span className="text-[9px] text-slate-500 font-black uppercase tracking-widest">In Sync & Transparent</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}

                    {/* Students List View */}
                    {activeTab === 'students' && (
                        <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
                            <section className="bg-white rounded-[40px] border border-slate-100 overflow-hidden shadow-2xl shadow-slate-200/50">
                                <div className="p-8 border-b border-slate-50">
                                    <h2 className="text-lg font-black text-slate-800 flex items-center gap-3">
                                        <UserCheck className="w-6 h-6 text-emerald-500" />
                                        {t('admin.governance.studentTable.name')}s in Course
                                    </h2>
                                </div>
                                
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left">
                                        <thead className="bg-slate-50/50 text-slate-400 text-[10px] uppercase tracking-[0.2em] font-black">
                                            <tr>
                                                <th className="px-8 py-5">Full Profile</th>
                                                <th className="px-8 py-5">Smarter Time</th>
                                                <th className="px-8 py-5">Progress</th>
                                                <th className="px-8 py-5 text-right">Discovery</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-50 text-xs font-bold">
                                            {data.data.Students.map((s: any) => (
                                                <tr key={s.id} 
                                                    onClick={() => setSelectedStudent(s)}
                                                    className={`cursor-pointer transition-all ${selectedStudent?.id === s.id ? 'bg-indigo-50/50' : 'hover:bg-slate-50/30'}`}>
                                                    <td className="px-8 py-6">
                                                        <div className="flex items-center gap-4">
                                                            <div className="w-10 h-10 rounded-2xl bg-white border border-slate-100 flex items-center justify-center text-indigo-600 shadow-sm font-black">
                                                                {s.fullname.charAt(0)}
                                                            </div>
                                                            <div>
                                                                <div className="text-sm font-black text-slate-900">{s.fullname}</div>
                                                                <div className="text-[10px] text-slate-400 font-mono tracking-tighter">UID: {s.id}</div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-8 py-6">
                                                        <div className="flex items-center gap-2 text-indigo-600">
                                                            <Clock className="w-3.5 h-3.5" />
                                                            {s.interactionTimeMinutes} min
                                                        </div>
                                                    </td>
                                                    <td className="px-8 py-6">
                                                        <div className="w-24 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                                            <div 
                                                                className="h-full bg-emerald-500 rounded-full" 
                                                                style={{ width: `${(s.completion?.filter((c: any) => c.state === 1).length / (s.completion?.length || 1)) * 100}%` }}
                                                            />
                                                        </div>
                                                        <p className="text-[9px] text-slate-400 mt-1 font-black uppercase">{s.completion?.filter((c: any) => c.state === 1).length} / {s.completion?.length} DONE</p>
                                                    </td>
                                                    <td className="px-8 py-6 text-right">
                                                        <ChevronRight className={`w-5 h-5 ml-auto transition-transform ${selectedStudent?.id === s.id ? 'rotate-90 text-indigo-600' : 'text-slate-200'}`} />
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </section>

                            {/* Performance Audit (Expanded Student View) */}
                            {selectedStudent && (
                                <section className="bg-white rounded-[40px] border-2 border-indigo-100 p-10 shadow-[0_32px_64px_-16px_rgba(79,70,229,0.1)] animate-in fade-in slide-in-from-bottom-8 duration-500">
                                    <div className="flex justify-between items-start mb-12">
                                        <div className="flex items-center gap-6">
                                            <div className="w-16 h-16 rounded-[24px] bg-indigo-600 flex items-center justify-center text-white shadow-2xl shadow-indigo-500/30">
                                                <User className="w-8 h-8" />
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-3">
                                                    <h3 className="text-3xl font-black text-slate-900">{selectedStudent.fullname}</h3>
                                                    <span className="px-3 py-1 rounded-full bg-indigo-50 text-indigo-600 text-[10px] font-black uppercase tracking-widest border border-indigo-100">Learner Audit</span>
                                                </div>
                                                <p className="text-slate-400 font-medium mt-1">Deep-dive into Moodle API results and ECR behavior signals.</p>
                                            </div>
                                        </div>
                                        <button 
                                            onClick={() => setSelectedStudent(null)}
                                            className="p-3 bg-slate-50 hover:bg-slate-100 rounded-2xl transition-all text-slate-400 group active:scale-95">
                                            <AlertCircle className="w-6 h-6 rotate-45 group-hover:text-rose-500 transition-colors" />
                                        </button>
                                    </div>

                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                                        {/* Performance Metrics: Grades & Progress */}
                                        <div className="space-y-10">
                                            <div>
                                                <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-6 flex items-center gap-2">
                                                    <Target className="w-4 h-4 text-emerald-500" /> API PERFORMANCE AUDIT
                                                </h4>
                                                <div className="space-y-4">
                                                    {selectedStudent.completion?.slice(0, 8).map((item: any, i: number) => (
                                                        <div key={i} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100/50">
                                                            <div className="flex items-center gap-3">
                                                                <div className={`w-2 h-2 rounded-full ${item.state === 1 ? 'bg-emerald-500 shadow-sm shadow-emerald-500' : 'bg-slate-300'}`} />
                                                                <span className="text-xs font-bold text-slate-700">Moodle Module ID {item.cmid}</span>
                                                            </div>
                                                            <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-lg ${item.state === 1 ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-500'}`}>
                                                                {item.state === 1 ? 'Complete' : 'Pending'}
                                                            </span>
                                                        </div>
                                                    ))}
                                                    {(!selectedStudent.completion || selectedStudent.completion.length === 0) && (
                                                        <p className="text-xs italic text-slate-400 p-8 border-2 border-dashed border-slate-100 rounded-3xl text-center">No progress data available for this student.</p>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        {/* AI & Interaction History */}
                                        <div className="space-y-10">
                                            <div>
                                                <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-500 mb-6 flex items-center gap-2">
                                                    <Zap className="w-4 h-4" /> AI INTERVENTION LOG
                                                </h4>
                                                <div className="bg-slate-900 rounded-[32px] p-2 space-y-2 overflow-hidden">
                                                    {selectedStudent.activityLogs?.length > 0 ? (
                                                        selectedStudent.activityLogs.map((log: any, idx: number) => (
                                                            <div key={idx} className="p-5 rounded-[24px] bg-slate-800/50 border border-slate-700/50 flex items-center justify-between group transition-all">
                                                                <div>
                                                                    <p className="text-[11px] font-black text-indigo-300">Prompt: {log.interventionType}</p>
                                                                    <p className="text-[9px] text-slate-500 font-mono mt-1">{new Date(log.timestamp).toLocaleString()}</p>
                                                                </div>
                                                                <span className={`text-[9px] font-black px-2.5 py-1 rounded-lg uppercase tracking-[0.2em] border ${log.reaction === 'ACCEPTED' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-slate-700 border-slate-600 text-slate-400'}`}>
                                                                    {log.reaction || 'SENT'}
                                                                </span>
                                                            </div>
                                                        ))
                                                    ) : (
                                                        <div className="px-8 py-16 text-center text-slate-500 border-2 border-dashed border-slate-800 rounded-[28px] flex flex-col items-center gap-4">
                                                            <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center">
                                                                <MessageSquare className="w-6 h-6 opacity-40" />
                                                            </div>
                                                            <p className="text-[10px] font-black uppercase tracking-widest opacity-60">Clean Baseline - No Prompt Pressure</p>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </section>
                            )}
                        </div>
                    )}
                </div>
            </div>
        )}
      </div>
      <style jsx global>{`
        .glass {
          background: rgba(255, 255, 255, 0.7);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
        }
      `}</style>
    </div>
  );
}
