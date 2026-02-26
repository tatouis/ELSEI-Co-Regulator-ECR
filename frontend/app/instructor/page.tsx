'use client';

import { useSim } from '@/lib/simulationStore';
import Navbar from '@/components/Navbar';
import { motion } from 'framer-motion';
import {
    AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, ScatterChart, Scatter,
    XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from 'recharts';
import { SimulatedLearner, StateLevel } from '@/lib/types';
import { Users, Brain, Eye, Zap, TrendingUp, AlertTriangle, BookOpen, X } from 'lucide-react';
import { useState } from 'react';

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

const HOTSPOTS = [
    { activity: 'Cognitive Architectures', avgLoad: 0.82, struggle: 68 },
    { activity: 'xAPI Integration', avgLoad: 0.74, struggle: 55 },
    { activity: 'Self-Regulation Lab', avgLoad: 0.61, struggle: 42 },
    { activity: 'Learning Theories Quiz', avgLoad: 0.45, struggle: 28 },
    { activity: 'Forum Discussion', avgLoad: 0.35, struggle: 18 },
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

// ─── Learner drilldown modal ──────────────────────────────────────────────────
function DrilldownModal({ learner, onClose }: { learner: SimulatedLearner; onClose: () => void }) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
            <motion.div
                className="relative w-full max-w-md glass rounded-3xl p-6 space-y-4"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
            >
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 gradient-primary rounded-2xl flex items-center justify-center text-white font-bold">
                            {learner.avatar}
                        </div>
                        <div>
                            <p className="font-bold text-slate-800">{learner.name}</p>
                            <p className="text-xs text-violet-600 capitalize">{learner.profile} profile</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center">
                        <X className="w-4 h-4 text-slate-600" />
                    </button>
                </div>

                <div className="grid grid-cols-3 gap-2 text-center">
                    {(['cognitiveLoad', 'attention', 'motivation'] as const).map((key) => (
                        <div key={key} className="rounded-xl bg-slate-50 p-2">
                            <p className="text-xs text-slate-500 capitalize">{key === 'cognitiveLoad' ? 'Cog. Load' : key}</p>
                            <p className="text-sm font-bold text-slate-800 capitalize">{learner.state[key]}</p>
                        </div>
                    ))}
                </div>

                <div className="rounded-2xl bg-amber-50 border border-amber-100 p-3">
                    <p className="text-xs text-amber-700">
                        <strong>Current:</strong> {learner.currentActivity}
                    </p>
                    <p className="text-xs text-amber-600 mt-1">
                        Retries: {learner.features.retryCount} · Inactivity: {Math.round(learner.features.inactivityStreak)}s
                    </p>
                </div>

                <p className="text-[10px] text-slate-400 text-center">
                    Data is anonymized for display. No identifiable learning content is stored.
                </p>
            </motion.div>
        </div>
    );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function InstructorDashboard() {
    const { learners } = useSim();
    const [selectedLearner, setSelectedLearner] = useState<SimulatedLearner | null>(null);
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
                        <div className="sm:ml-auto text-right">
                            <p className="text-white/50 text-xs">Learners monitored</p>
                            <p className="text-white text-3xl font-bold">{learners.length}</p>
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

                {/* Course Hotspots */}
                <div className="glass rounded-3xl p-5">
                    <div className="flex items-center gap-2 mb-4">
                        <AlertTriangle className="w-4 h-4 text-amber-500" />
                        <h3 className="font-semibold text-slate-800">Course Hotspots</h3>
                        <span className="text-xs text-slate-500">Where students struggle most</span>
                    </div>
                    <div className="space-y-3">
                        {HOTSPOTS.map(({ activity, avgLoad, struggle }) => (
                            <div key={activity} className="flex items-center gap-4">
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between mb-1">
                                        <p className="text-xs font-medium text-slate-700 truncate">{activity}</p>
                                        <span className="text-xs text-slate-500 ml-2 flex-shrink-0">{struggle}% struggling</span>
                                    </div>
                                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                                        <motion.div
                                            className="h-full rounded-full"
                                            style={{ background: `linear-gradient(90deg, #7c3aed, #ef4444)` }}
                                            initial={{ width: 0 }}
                                            animate={{ width: `${avgLoad * 100}%` }}
                                            transition={{ duration: 0.8 }}
                                        />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Class Heatmap */}
                <div className="glass rounded-3xl p-5">
                    <div className="flex items-center gap-2 mb-4">
                        <BookOpen className="w-4 h-4 text-violet-600" />
                        <h3 className="font-semibold text-slate-800">Class State Heatmap</h3>
                        <span className="text-xs text-slate-500 ml-auto">Click a learner to drill down (privacy-aware)</span>
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
                                </tr>
                            </thead>
                            <tbody className="space-y-1">
                                {learners.map((learner) => (
                                    <tr
                                        key={learner.id}
                                        className="hover:bg-violet-50/50 rounded-xl cursor-pointer transition-colors"
                                        onClick={() => setSelectedLearner(learner)}
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
                                            <span className="bg-violet-100 text-violet-700 px-2 py-0.5 rounded-lg">
                                                {learner.interventionCount}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Drilldown modal */}
            {selectedLearner && (
                <DrilldownModal
                    learner={selectedLearner}
                    onClose={() => setSelectedLearner(null)}
                />
            )}
        </div>
    );
}
