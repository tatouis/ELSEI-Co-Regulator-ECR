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

import { useTranslation } from '@/lib/LanguageContext';

export default function WeeklySummary() {
    const { t } = useTranslation();
    const { currentLearner, interventionHistory } = useSim();
    const data = generateWeeklySummary(currentLearner.profile);

    const stats = [
        {
            icon: Brain,
            label: t('instructor.kpis.highLoad').replace(t('common.high'), '').trim(),
            value: `${data.avgLoadManagement}%`,
            desc: t('admin.governance.fields.interactionDesc').split('.')[0],
            color: 'text-violet-600',
            bg: 'bg-violet-50',
        },
        {
            icon: Clock,
            label: t('instructor.kpis.lowAtt').replace(t('common.low'), '').trim(),
            value: `${data.avgAttention}%`,
            desc: t('instructor.charts.realTime'),
            color: 'text-blue-600',
            bg: 'bg-blue-50',
        },
        {
            icon: Target,
            label: t('admin.governance.studentTable.progress'),
            value: `${data.completionRate}%`,
            desc: t('admin.governance.studentTable.progress'),
            color: 'text-emerald-600',
            bg: 'bg-emerald-50',
        },
        {
            icon: TrendingUp,
            label: t('instructor.kpis.interventions').split(' ')[0],
            value: String(interventionHistory.length + data.interventionsReceived),
            desc: t('instructor.interventions.support'),
            color: 'text-cyan-600',
            bg: 'bg-cyan-50',
        },
    ];

    const dayKeys = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Today'];
    const localizedDays = dayKeys.map(k => {
        if (k === 'Today') return t('common.date').includes('Date') ? 'Today' : 'Aujourd\'hui';
        return k; // Mock days for now, could be improved with a proper i18n day helper
    });

    return (
        <div className="glass rounded-3xl p-5 space-y-4">
            <div>
                <h3 className="font-semibold text-slate-800">{t('student.performance.summary')}</h3>
                <p className="text-xs text-slate-500">{t('student.performance.weeklyAvg')}</p>
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
                <p className="text-xs text-slate-500 mb-2">{t('instructor.charts.timeline')}</p>
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
                    {localizedDays.map((d) => (
                        <span key={d}>{d}</span>
                    ))}
                </div>
            </div>
        </div>
    );
}
