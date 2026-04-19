'use client';

import { motion } from 'framer-motion';
import { useSim } from '@/lib/simulationStore';
import { Eye, Database, Clock, BarChart3, AlertOctagon } from 'lucide-react';

import { useTranslation } from '@/lib/LanguageContext';

export default function TransparencyPanel() {
    const { t } = useTranslation();
    const { currentLearner } = useSim();
    const { features, state } = currentLearner;

    const signals = [
        {
            icon: Clock,
            label: t('admin.governance.fields.interactionTime').split('(')[0].trim() || 'Interaction Time',
            value: `${Math.round(features.timeSinceLastAction)}s`,
            note: t('admin.governance.fields.interactionDesc'),
        },
        {
            icon: AlertOctagon,
            label: t('student.performance.retries'),
            value: String(features.retryCount),
            note: t('instructor.charts.realTime'),
        },
        {
            icon: BarChart3,
            label: t('instructor.charts.heatmap'),
            value: `${features.navigationSpeed.toFixed(1)} pg/min`,
            note: t('instructor.charts.heatmapDesc'),
        },
        {
            icon: Clock,
            label: t('admin.governance.studentTable.time'),
            value: `${Math.round(features.inactivityStreak)}s`,
            note: t('admin.governance.fields.interactionDesc'),
        },
        {
            icon: Database,
            label: t('admin.governance.governance.moodleExplorer'),
            value: `${Math.round(features.errorRate * 100)}%`,
            note: t('admin.governance.fields.gradeItemsDesc'),
        },
    ];

    return (
        <div className="glass rounded-3xl p-5 space-y-4">
            <div className="flex items-center gap-2">
                <Eye className="w-4 h-4 text-violet-600" />
                <div>
                    <h3 className="font-semibold text-slate-800">{t('student.transparency.title')}</h3>
                    <p className="text-xs text-slate-500">{t('student.transparency.subtitle')}</p>
                </div>
            </div>

            <div className="space-y-2">
                {signals.map(({ icon: Icon, label, value, note }) => (
                    <motion.div
                        key={label}
                        className="flex items-center gap-3 p-3 rounded-2xl bg-white/50 hover:bg-white/80 transition-colors"
                        whileHover={{ x: 2 }}
                    >
                        <div className="w-7 h-7 rounded-xl bg-violet-100 flex items-center justify-center flex-shrink-0">
                            <Icon className="w-3.5 h-3.5 text-violet-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium text-slate-700">{label}</p>
                            <p className="text-[10px] text-slate-400 truncate">{note}</p>
                        </div>
                        <span className="text-xs font-bold text-violet-700 bg-violet-50 px-2 py-0.5 rounded-lg">
                            {value}
                        </span>
                    </motion.div>
                ))}
            </div>

            <div className="pt-2 border-t border-white/40">
                <p className="text-[10px] text-slate-400 leading-relaxed">
                    ⚠️ {t('student.transparency.privacyNotice')}
                </p>
            </div>
        </div>
    );
}
