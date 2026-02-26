'use client';

import { useSim } from '@/lib/simulationStore';
import { motion } from 'framer-motion';
import { TrendingUp, Clock, Target, Brain } from 'lucide-react';

// Generate fake weekly data based on current learner profile
function generateWeeklySummary(profile: string) {
    const base = {
        focused: { avgAttention: 82, avgLoadManagement: 78, completionRate: 91, interventionsReceived: 2 },
        overloaded: { avgAttention: 54, avgLoadManagement: 42, completionRate: 63, interventionsReceived: 11 },
        distracted: { avgAttention: 41, avgLoadManagement: 65, completionRate: 72, interventionsReceived: 8 },
        disengaged: { avgAttention: 38, avgLoadManagement: 35, completionRate: 48, interventionsReceived: 14 },
    }[profile] ?? { avgAttention: 70, avgLoadManagement: 65, completionRate: 80, interventionsReceived: 4 };
    return base;
}

export default function WeeklySummary() {
    const { currentLearner, interventionHistory } = useSim();
    const data = generateWeeklySummary(currentLearner.profile);

    const stats = [
        {
            icon: Brain,
            label: 'Load Management',
            value: `${data.avgLoadManagement}%`,
            desc: 'Avg cognitive load regulation',
            color: 'text-violet-600',
            bg: 'bg-violet-50',
        },
        {
            icon: Clock,
            label: 'Attention Quality',
            value: `${data.avgAttention}%`,
            desc: 'Sustained focus this week',
            color: 'text-blue-600',
            bg: 'bg-blue-50',
        },
        {
            icon: Target,
            label: 'Completion Rate',
            value: `${data.completionRate}%`,
            desc: 'Activities completed',
            color: 'text-emerald-600',
            bg: 'bg-emerald-50',
        },
        {
            icon: TrendingUp,
            label: 'Support Received',
            value: String(interventionHistory.length + data.interventionsReceived),
            desc: 'Metacognitive suggestions',
            color: 'text-cyan-600',
            bg: 'bg-cyan-50',
        },
    ];

    return (
        <div className="glass rounded-3xl p-5 space-y-4">
            <div>
                <h3 className="font-semibold text-slate-800">Weekly Self-Regulation</h3>
                <p className="text-xs text-slate-500">Summary of your learning patterns this week</p>
            </div>

            <div className="grid grid-cols-2 gap-3">
                {stats.map(({ icon: Icon, label, value, desc, color, bg }, i) => (
                    <motion.div
                        key={label}
                        className={`${bg} rounded-2xl p-3`}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.08 }}
                    >
                        <Icon className={`w-4 h-4 ${color} mb-1`} />
                        <p className={`text-xl font-bold ${color}`}>{value}</p>
                        <p className="text-xs font-medium text-slate-700">{label}</p>
                        <p className="text-[10px] text-slate-500">{desc}</p>
                    </motion.div>
                ))}
            </div>

            {/* Weekly trend bar */}
            <div>
                <p className="text-xs text-slate-500 mb-2">Attention trend (Mon – today)</p>
                <div className="flex items-end gap-1 h-10">
                    {[65, 58, 72, 61, 74, 69, data.avgAttention].map((v, i) => (
                        <motion.div
                            key={i}
                            className="flex-1 rounded-t-lg bg-gradient-to-t from-violet-500 to-cyan-400 opacity-80"
                            initial={{ height: 0 }}
                            animate={{ height: `${(v / 100) * 100}%` }}
                            transition={{ delay: i * 0.05, duration: 0.5 }}
                        />
                    ))}
                </div>
                <div className="flex justify-between text-[9px] text-slate-400 mt-1">
                    {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Today'].map((d) => (
                        <span key={d}>{d}</span>
                    ))}
                </div>
            </div>
        </div>
    );
}
