'use client';

import { useParams, useRouter } from 'next/navigation';
import { useSim } from '@/lib/simulationStore';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from '@/components/Navbar';
import { LearnerStateWidget } from '@/components/LearnerStateWidget';
import TransparencyPanel from '@/components/TransparencyPanel';
import CurrentActivityPanel from '@/components/CurrentActivityPanel';
import WeeklySummary from '@/components/WeeklySummary';
import { GraduationCap, ArrowLeft, Download, MessageSquare, History, Activity, ShieldCheck } from 'lucide-react';
import { useState } from 'react';
import { downloadStudentPDF } from '@/lib/exportHelpers';

import { useTranslation } from '@/lib/LanguageContext';

export default function StudentDetailAnalysis() {
    const { t } = useTranslation();
    const { id } = useParams();
    const router = useRouter();
    const { learners } = useSim();
    const learner = learners.find(l => l.id === id);
    const [notes, setNotes] = useState('');

    if (!learner) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <p className="text-slate-500">Learner not found.</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #eef2ff 0%, #f5f0ff 50%, #ecfeff 100%)' }}>
            <Navbar />

            {/* Sub-header */}
            <div className="bg-white/40 border-b border-white/20 backdrop-blur-md">
                <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
                    <button
                        onClick={() => router.push('/instructor')}
                        className="flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-violet-600 transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        {t('admin.settings.backToConsole')}
                    </button>
                    <div className="flex items-center gap-3">
                        <span className="flex items-center gap-1.5 px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-[10px] font-bold uppercase tracking-wider">
                            <ShieldCheck className="w-3 h-3" /> {t('admin.prompts.active')} - Privacy
                        </span>
                        <button
                            onClick={() => downloadStudentPDF(learner, notes)}
                            className="flex items-center gap-2 px-4 py-2 bg-violet-600 text-white rounded-xl text-xs font-bold shadow-lg shadow-violet-200 hover:bg-violet-700 transition-all active:scale-95"
                        >
                            <Download className="w-4 h-4" /> Export Diagnostic PDF
                        </button>
                    </div>
                </div>
            </div>

            {/* Hero Section */}
            <div className="relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-violet-600/90 to-indigo-600/90" />
                <div className="relative max-w-7xl mx-auto px-4 py-8">
                    <div className="flex flex-col sm:flex-row items-center gap-6">
                        <motion.div
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="w-20 h-20 rounded-3xl bg-white/20 backdrop-blur-xl flex items-center justify-center text-white text-3xl font-bold shadow-2xl border border-white/30"
                        >
                            {learner.avatar}
                        </motion.div>
                        <div className="text-center sm:text-left">
                            <motion.div
                                initial={{ y: 20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                className="flex items-center justify-center sm:justify-start gap-3"
                            >
                                <h1 className="text-3xl font-bold text-white">{learner.name}</h1>
                                <span className="px-2.5 py-1 bg-white/20 rounded-lg text-[10px] font-bold text-white/90 uppercase">ID: {learner.id}</span>
                            </motion.div>
                            <p className="text-violet-100 mt-1 font-medium flex items-center justify-center sm:justify-start gap-2">
                                <Activity className="w-4 h-4" /> {learner.profile.charAt(0).toUpperCase() + learner.profile.slice(1)} Learner Profile
                            </p>
                        </div>
                        <div className="sm:ml-auto grid grid-cols-2 gap-4">
                            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10 text-center min-w-[120px]">
                                <p className="text-[10px] text-white/60 font-bold uppercase">{t('instructor.kpis.interventions')}</p>
                                <p className="text-2xl font-bold text-white">{learner.interventionCount}</p>
                            </div>
                            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10 text-center min-w-[120px]">
                                <p className="text-[10px] text-white/60 font-bold uppercase">Confidence</p>
                                <p className="text-2xl font-bold text-white">{Math.round(learner.state.confidence * 100)}%</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* Left & Center Columns: Reusing Student Widgets for a "Live View" */}
                    <div className="lg:col-span-2 space-y-8">
                        <div>
                            <div className="flex items-center gap-2 mb-4">
                                <Activity className="w-5 h-5 text-violet-600" />
                                <h2 className="text-lg font-bold text-slate-800">{t('instructor.charts.heatmap')}</h2>
                            </div>
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                            >
                                <LearnerStateWidget
                                    cognitiveLoad={learner.state.cognitiveLoad}
                                    attention={learner.state.attention}
                                    motivation={learner.state.motivation}
                                    confidence={learner.state.confidence}
                                />
                            </motion.div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <CurrentActivityPanel />
                            <WeeklySummary />
                        </div>

                        <div>
                            <div className="flex items-center gap-2 mb-4">
                                <History className="w-5 h-5 text-violet-600" />
                                <h2 className="text-lg font-bold text-slate-800">{t('instructor.charts.telemetry')}</h2>
                            </div>
                            <TransparencyPanel />
                        </div>
                    </div>

                    {/* Right Column: Instructor Workspace */}
                    <div className="space-y-8">
                        <section className="glass rounded-[32px] p-6 border border-white shadow-xl shadow-slate-200/50">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-10 h-10 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                                    <MessageSquare className="w-5 h-5" />
                                </div>
                                <h3 className="font-bold text-slate-800">Pedagogical Notes</h3>
                            </div>
                            <p className="text-xs text-slate-500 mb-4 leading-relaxed">
                                Record qualitative observations for this student's learning journey. These notes will be included in the diagnostic export.
                            </p>
                            <textarea
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                className="w-full bg-white/50 border border-slate-200 rounded-2xl p-4 text-sm focus:ring-2 focus:ring-violet-400 focus:border-transparent outline-none transition-all h-64 resize-none placeholder:text-slate-300"
                                placeholder="..."
                            />
                        </section>

                        <section className="glass rounded-[32px] p-6 border border-white shadow-xl shadow-slate-200/50 bg-gradient-to-br from-white/80 to-indigo-50/30">
                            <h3 className="font-bold text-slate-800 mb-4">{t('common.actions')}</h3>
                            <div className="space-y-3">
                                {[
                                    { label: 'Review Retries History', icon: History, color: 'text-blue-600', bg: 'bg-blue-50' },
                                    { label: 'Evaluate Quiz Readiness', icon: GraduationCap, color: 'text-violet-600', bg: 'bg-violet-50' },
                                    { label: 'Check Forum Participation', icon: MessageSquare, color: 'text-amber-600', bg: 'bg-amber-50' },
                                ].map((item, i) => (
                                    <button
                                        key={i}
                                        className="w-full flex items-center gap-3 p-3 rounded-2xl hover:bg-white transition-colors text-left border border-transparent hover:border-slate-100 shadow-sm hover:shadow-md group"
                                    >
                                        <div className={`w-10 h-10 rounded-xl ${item.bg} flex items-center justify-center ${item.color} group-hover:scale-110 transition-transform`}>
                                            <item.icon className="w-5 h-5" />
                                        </div>
                                        <span className="text-xs font-bold text-slate-700">{item.label}</span>
                                    </button>
                                ))}
                            </div>
                        </section>
                    </div>
                </div>
            </div>
        </div>
    );
}
