'use client';

import { useSim } from '@/lib/simulationStore';

import Navbar from '@/components/Navbar';
import { motion } from 'framer-motion';
import {
    AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, ScatterChart, Scatter,
    XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from 'recharts';
import { SimulatedLearner, StateLevel } from '@/lib/types';
import { Users, Brain, Eye, Zap, TrendingUp, AlertTriangle, BookOpen, X, Download, FileText, FileSpreadsheet, Settings } from 'lucide-react';
import { useState, useEffect } from 'react';
import { downloadCSV, downloadClassPDF, downloadStudentPDF } from '@/lib/exportHelpers';

// ─── Helpers ─────────────────────────────────────────────────────────────────
const LEVEL_NUM: Record<StateLevel, number> = { low: 0.2, medium: 0.55, high: 0.9 };
const LEVEL_COLOR_CL: Record<StateLevel, string> = { low: '#10b981', medium: '#f59e0b', high: '#ef4444' };
const LEVEL_COLOR_ATT: Record<StateLevel, string> = { low: '#ef4444', medium: '#f59e0b', high: '#10b981' };
const LEVEL_COLOR_MOT: Record<StateLevel, string> = { low: '#ef4444', medium: '#f59e0b', high: '#10b981' };

function statLabel(level: StateLevel) {
    return level.charAt(0).toUpperCase() + level.slice(1);
}

function generateTimeline() {
    const labels = ['09:00', '09:15', '09:30', '09:45', '10:00', '10:15', '10:30'];
    return labels.map((time, i) => ({
        time,
        attention: Math.round(75 - i * 4 + Math.sin(i) * 8),
        motivation: Math.round(80 - i * 2 + Math.cos(i * 1.5) * 6),
        cognitiveLoad: Math.round(40 + i * 5 + Math.sin(i * 2) * 10),
    }));
}

const MOODLE_INSIGHTS = [
    { title: 'Avg. Navigation Speed', value: '4.2 pages/min', trend: '+12%', status: 'high' },
    { title: 'Quiz Retry Rate', value: '2.8 attempts', trend: '-5%', status: 'medium' },
    { title: 'Active Forum Threads', value: '14 topics', trend: '+2', status: 'optimal' },
    { title: 'Avg. Course Dwell Time', value: '42m 15s', trend: '+18%', status: 'optimal' },
];

const HOTSPOTS = [
    { activity: 'M112: PROGRAMMATION EN PYTHON : FONDAMENTAUX', dropoff: 34, struggle: 74 },
    { activity: 'M125: Fondements d\'apprentissage automatique', dropoff: 21, struggle: 62 },
    { activity: 'M121: Ingénierie pédagogique d’elearning', dropoff: 12, struggle: 45 },
];

// ─── Heatmap Cell ────────────────────────────────────────────────────────────
function HeatCell({ level, name }: { level: StateLevel; name: string }) {
    const colors = {
        low: 'bg-emerald-100 text-emerald-700',
        medium: 'bg-amber-100 text-amber-700',
        high: 'bg-red-100 text-red-700',
    };
    return (
        <div className={`flex items-center justify-center rounded-lg h-8 text-xs font-semibold ${colors[level]}`}>
            {statLabel(level)}
        </div>
    );
}

// ─── No internal modals needed as we use dedicated pages ────────────────────

import { useRouter } from 'next/navigation';

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function InstructorDashboard() {
    const { learners } = useSim();
    const router = useRouter();
    const timeline = generateTimeline();

    const highCL = learners.filter((l) => l.state.cognitiveLoad === 'high').length;
    const lowAtt = learners.filter((l) => l.state.attention === 'low').length;
    const lowMot = learners.filter((l) => l.state.motivation === 'low').length;
    const totalInterventions = learners.reduce((s, l) => s + l.interventionCount, 0);

    const motivationDist = [
        { name: 'High', value: learners.filter((l) => l.state.motivation === 'high').length, color: '#10b981' },
        { name: 'Medium', value: learners.filter((l) => l.state.motivation === 'medium').length, color: '#f59e0b' },
        { name: 'Low Risk', value: learners.filter((l) => l.state.motivation === 'low').length, color: '#ef4444' },
    ];

    return (
        <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #eef2ff 0%, #f5f0ff 50%, #ecfeff 100%)' }}>
            <Navbar />

            {/* Header */}
            <div className="relative overflow-hidden">
                <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, #1a237e 0%, #3949ab 60%, #4527a0 100%)' }} />
                <div className="absolute -top-10 right-0 w-64 h-64 rounded-full bg-cyan-400/15 blur-3xl" />
                <div className="relative max-w-7xl mx-auto px-4 py-8">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center">
                            <Users className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-white">Instructor Analytics</h1>
                            <p className="text-white/70 text-sm">Master ELSEI — Class Cognitive Regulation Overview</p>
                        </div>
                        <div className="sm:ml-auto flex items-center gap-4">
                            <div className="flex gap-2">
                                <button onClick={() => router.push('/instructor/settings')} className="flex items-center justify-center w-8 h-8 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-colors border border-white/20 backdrop-blur-sm" title="API Configuration">
                                    <Settings className="w-4 h-4" />
                                </button>
                                <button onClick={() => downloadCSV(learners)} className="flex items-center gap-1.5 px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-medium transition-colors border border-white/20 backdrop-blur-sm">
                                    <FileSpreadsheet className="w-3.5 h-3.5" /> CSV
                                </button>
                                <button onClick={() => downloadClassPDF(learners)} className="flex items-center gap-1.5 px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-medium transition-colors border border-white/20 backdrop-blur-sm">
                                    <FileText className="w-3.5 h-3.5" /> PDF
                                </button>
                            </div>
                            <div className="text-right border-l border-white/20 pl-4 hidden sm:block">
                                <p className="text-white/50 text-[10px] uppercase tracking-wider font-bold">Learners</p>
                                <p className="text-white text-3xl font-bold leading-none mt-1">{learners.length}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 py-6 space-y-5">

                {/* KPI Row */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {[
                        { icon: Brain, label: 'High Cognitive Load', value: highCL, total: learners.length, color: 'text-red-600', bg: 'bg-red-50' },
                        { icon: Eye, label: 'Low Attention', value: lowAtt, total: learners.length, color: 'text-amber-600', bg: 'bg-amber-50' },
                        { icon: Zap, label: 'Low Motivation', value: lowMot, total: learners.length, color: 'text-orange-600', bg: 'bg-orange-50' },
                        { icon: TrendingUp, label: 'Interventions Today', value: totalInterventions, total: null, color: 'text-violet-600', bg: 'bg-violet-50' },
                    ].map(({ icon: Icon, label, value, total, color, bg }) => (
                        <motion.div
                            key={label}
                            className={`glass rounded-3xl p-4 flex items-center gap-3`}
                            initial={{ opacity: 0, y: 16 }}
                            animate={{ opacity: 1, y: 0 }}
                        >
                            <div className={`w-10 h-10 rounded-2xl ${bg} flex items-center justify-center flex-shrink-0`}>
                                <Icon className={`w-5 h-5 ${color}`} />
                            </div>
                            <div>
                                <p className={`text-2xl font-bold ${color}`}>
                                    {value}{total ? `/${total}` : ''}
                                </p>
                                <p className="text-xs text-slate-500">{label}</p>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Charts Row 1 */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                    {/* Attention Timeline */}
                    <div className="lg:col-span-2 glass rounded-3xl p-5">
                        <h3 className="font-semibold text-slate-800 mb-1">Attention & Motivation Timeline</h3>
                        <p className="text-xs text-slate-500 mb-4">Class-average over current session</p>
                        <ResponsiveContainer width="100%" height={180}>
                            <AreaChart data={timeline} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="attGrad" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#7c3aed" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#7c3aed" stopOpacity={0} />
                                    </linearGradient>
                                    <linearGradient id="motGrad" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" />
                                <XAxis dataKey="time" tick={{ fontSize: 10, fill: '#94a3b8' }} />
                                <YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: '#94a3b8' }} />
                                <Tooltip
                                    contentStyle={{ borderRadius: 12, border: 'none', background: 'rgba(255,255,255,0.95)', boxShadow: '0 4px 24px rgba(0,0,0,0.1)', fontSize: 12 }}
                                />
                                <Area type="monotone" dataKey="attention" stroke="#7c3aed" fill="url(#attGrad)" strokeWidth={2} name="Attention %" />
                                <Area type="monotone" dataKey="motivation" stroke="#06b6d4" fill="url(#motGrad)" strokeWidth={2} name="Motivation %" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Motivation Distribution */}
                    <div className="glass rounded-3xl p-5">
                        <h3 className="font-semibold text-slate-800 mb-1">Motivation Risk</h3>
                        <p className="text-xs text-slate-500 mb-4">Current class distribution</p>
                        <div className="flex items-center justify-center">
                            <PieChart width={160} height={160}>
                                <Pie data={motivationDist} cx={75} cy={75} innerRadius={45} outerRadius={70} paddingAngle={3} dataKey="value">
                                    {motivationDist.map((entry, index) => (
                                        <Cell key={index} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip contentStyle={{ borderRadius: 12, fontSize: 12 }} />
                            </PieChart>
                        </div>
                        <div className="space-y-1.5">
                            {motivationDist.map(({ name, value, color }) => (
                                <div key={name} className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <div className="w-2.5 h-2.5 rounded-full" style={{ background: color }} />
                                        <span className="text-xs text-slate-600">{name}</span>
                                    </div>
                                    <span className="text-xs font-bold text-slate-700">{value} learners</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Lower Charts Row */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

                    {/* Course Hotspots */}
                    <div className="glass rounded-3xl p-5">
                        <div className="flex items-center gap-2 mb-4">
                            <AlertTriangle className="w-4 h-4 text-amber-500" />
                            <h3 className="font-semibold text-slate-800">Moodle Module Bottlenecks</h3>
                        </div>
                        <div className="space-y-4">
                            {HOTSPOTS.map(({ activity, dropoff, struggle }) => (
                                <div key={activity} className="relative pt-1">
                                    <div className="flex items-center justify-between mb-1">
                                        <p className="text-xs font-semibold text-slate-700 truncate pr-4">{activity}</p>
                                        <div className="text-right">
                                            <span className="text-[10px] text-red-600 font-bold bg-red-50 px-2 py-0.5 rounded-md">{struggle}% High Load</span>
                                        </div>
                                    </div>
                                    <div className="flex bg-slate-100 h-2 rounded-full overflow-hidden">
                                        <motion.div className="bg-gradient-to-r from-amber-400 to-red-500" initial={{ width: 0 }} animate={{ width: `${struggle}%` }} transition={{ duration: 1 }} />
                                    </div>
                                    <p className="text-[10px] text-slate-500 mt-1">Est. Drop-off Risk: {dropoff}%</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Moodle Telemetry */}
                    <div className="glass rounded-3xl p-5">
                        <div className="flex items-center gap-2 mb-4">
                            <Zap className="w-4 h-4 text-amber-500" />
                            <h3 className="font-semibold text-slate-800">Live Moodle Telemetry</h3>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            {MOODLE_INSIGHTS.map((insight) => (
                                <div key={insight.title} className="bg-white/50 border border-slate-100 rounded-2xl p-4">
                                    <p className="text-[10px] uppercase font-bold text-slate-500 mb-1">{insight.title}</p>
                                    <div className="flex items-end justify-between">
                                        <span className="text-lg font-bold text-slate-800">{insight.value}</span>
                                        <span className={`text-[10px] font-bold ${insight.trend.startsWith('+') ? 'text-emerald-600' : 'text-red-600'
                                            }`}>{insight.trend}</span>
                                    </div>
                                    <p className="text-[10px] italic text-slate-400 mt-2">v.s last week baseline</p>
                                </div>
                            ))}
                        </div>
                    </div>

                </div>

                {/* Class Heatmap */}
                <div className="glass rounded-3xl p-5">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                        <div className="flex items-center gap-2">
                            <BookOpen className="w-4 h-4 text-violet-600" />
                            <h3 className="font-semibold text-slate-800">Class State Heatmap</h3>
                            <span className="text-xs text-slate-500 hidden sm:inline-block">— Click a learner to drill down (privacy-aware)</span>
                        </div>
                    </div>

                    <div className="mb-4 bg-violet-50/80 border border-violet-100 rounded-2xl p-3 flex gap-3 text-xs text-slate-600 leading-relaxed shadow-sm">
                        <div className="mt-0.5 text-violet-600">
                            <Brain className="w-4 h-4" />
                        </div>
                        <p>
                            <span className="font-bold text-violet-800">AI Inference Engine:</span> The system detects <em>Cognitive Load</em>, <em>Attention</em>, and <em>Motivation</em> by tracking raw Moodle telemetry in real-time. This includes: <strong>Time since last action</strong>, <strong>Inactivity streaks</strong>, <strong>Navigation speed (pages/min)</strong>, <strong>Retry counts</strong>, and <strong>Error rates</strong> against normative baseline thresholds.
                        </p>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-xs">
                            <thead>
                                <tr>
                                    <th className="text-left text-slate-500 font-medium pb-2 pr-4">Learner</th>
                                    <th className="text-center text-slate-500 font-medium pb-2 px-2">Cog. Load</th>
                                    <th className="text-center text-slate-500 font-medium pb-2 px-2">Attention</th>
                                    <th className="text-center text-slate-500 font-medium pb-2 px-2">Motivation</th>
                                    <th className="text-center text-slate-500 font-medium pb-2 px-2">Interventions</th>
                                    <th className="text-right text-slate-500 font-medium pb-2 pl-2">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="space-y-1">
                                {learners.map((learner) => (
                                    <tr
                                        key={learner.id}
                                        className="hover:bg-violet-50/50 rounded-xl cursor-pointer transition-colors"
                                        onClick={() => router.push(`/instructor/students/${learner.id}`)}
                                    >
                                        <td className="pr-4 py-1.5">
                                            <div className="flex items-center gap-2">
                                                <div className="w-6 h-6 rounded-lg gradient-primary flex items-center justify-center text-white text-[10px] font-bold">
                                                    {learner.avatar}
                                                </div>
                                                <span className="font-medium text-slate-700">{learner.name}</span>
                                            </div>
                                        </td>
                                        <td className="px-2 py-1.5">
                                            <HeatCell level={learner.state.cognitiveLoad} name="cognitiveLoad" />
                                        </td>
                                        <td className="px-2 py-1.5">
                                            <HeatCell level={learner.state.attention} name="attention" />
                                        </td>
                                        <td className="px-2 py-1.5">
                                            <HeatCell level={learner.state.motivation} name="motivation" />
                                        </td>
                                        <td className="px-2 py-1.5 text-center">
                                            <span className="bg-violet-100 text-violet-700 px-2 py-0.5 rounded-lg font-bold">
                                                {learner.interventionCount}
                                            </span>
                                        </td>
                                        <td className="pl-2 py-1.5 text-right w-24">
                                            <button
                                                onClick={(e) => { e.stopPropagation(); router.push(`/instructor/students/${learner.id}`); }}
                                                className="text-[10px] uppercase tracking-wide font-bold text-violet-600 bg-white border border-violet-200 hover:bg-violet-50 px-3 py-1.5 rounded-lg transition-colors shadow-sm"
                                            >
                                                Analyze
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}
