'use client';

import { motion } from 'framer-motion';
import { StateLevel } from '@/lib/types';

interface GaugeProps {
    label: string;
    level: StateLevel;
    confidence: number;
    color: string;
    icon: string;
}

const LEVEL_CONFIG = {
    low: { value: 0.2, label: 'Low', textColor: 'text-emerald-600', bgColor: 'bg-emerald-500' },
    medium: { value: 0.55, label: 'Medium', textColor: 'text-amber-600', bgColor: 'bg-amber-500' },
    high: { value: 0.9, label: 'High', textColor: 'text-red-600', bgColor: 'bg-red-500' },
};

function CircularGauge({ value, color, size = 80 }: { value: number; color: string; size?: number }) {
    const radius = size / 2 - 8;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - value * circumference * 0.75;
    const startAngle = 135;

    return (
        <svg width={size} height={size} className="rotate-0">
            {/* Background track */}
            <circle
                cx={size / 2}
                cy={size / 2}
                r={radius}
                fill="none"
                stroke="rgba(255,255,255,0.15)"
                strokeWidth="6"
                strokeDasharray={`${circumference * 0.75} ${circumference * 0.25}`}
                strokeDashoffset={0}
                strokeLinecap="round"
                style={{ transform: `rotate(${startAngle}deg)`, transformOrigin: 'center' }}
            />
            {/* Filled arc */}
            <motion.circle
                cx={size / 2}
                cy={size / 2}
                r={radius}
                fill="none"
                stroke={color}
                strokeWidth="6"
                strokeDasharray={`${circumference * 0.75} ${circumference * 0.25}`}
                strokeLinecap="round"
                style={{ transform: `rotate(${startAngle}deg)`, transformOrigin: 'center' }}
                initial={{ strokeDashoffset: circumference * 0.75 }}
                animate={{ strokeDashoffset }}
                transition={{ duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
            />
        </svg>
    );
}

const GAUGE_COLORS: Record<StateLevel, string> = {
    low: '#10b981',
    medium: '#f59e0b',
    high: '#ef4444',
};

// CL gauge - inverted (high CL is bad)
const CL_COLORS: Record<StateLevel, string> = {
    low: '#10b981',
    medium: '#f59e0b',
    high: '#ef4444',
};

export function LearnerStateWidget({
    cognitiveLoad,
    attention,
    motivation,
    confidence,
}: {
    cognitiveLoad: StateLevel;
    attention: StateLevel;
    motivation: StateLevel;
    confidence: number;
}) {
    const gauges: GaugeProps[] = [
        {
            label: 'Cognitive Load',
            level: cognitiveLoad,
            confidence,
            color: CL_COLORS[cognitiveLoad],
            icon: '🧠',
        },
        {
            label: 'Attention',
            level: attention,
            confidence,
            color: GAUGE_COLORS[attention === 'high' ? 'low' : attention === 'low' ? 'high' : 'medium'],
            icon: '👁️',
        },
        {
            label: 'Motivation',
            level: motivation,
            confidence,
            color: GAUGE_COLORS[motivation === 'high' ? 'low' : motivation === 'low' ? 'high' : 'medium'],
            icon: '⚡',
        },
    ];

    return (
        <div className="glass rounded-3xl p-5">
            <div className="flex items-center justify-between mb-4">
                <div>
                    <h3 className="font-semibold text-slate-800">Learning State</h3>
                    <p className="text-xs text-slate-500">Real-time estimation</p>
                </div>
                <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 blink"></span>
                    <span className="text-xs text-slate-500">Live</span>
                </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
                {gauges.map(({ label, level, color, icon }) => {
                    const config = LEVEL_CONFIG[level];
                    return (
                        <motion.div
                            key={label}
                            className="flex flex-col items-center gap-1"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.4 }}
                        >
                            <div className="relative">
                                <CircularGauge value={config.value} color={color} size={80} />
                                <div className="absolute inset-0 flex flex-col items-center justify-center">
                                    <span className="text-lg leading-none">{icon}</span>
                                </div>
                            </div>
                            <p className="text-xs font-medium text-slate-700 text-center leading-tight">{label}</p>
                            <span className={`text-xs font-bold ${config.textColor}`}>{config.label}</span>
                        </motion.div>
                    );
                })}
            </div>

            <div className="mt-4 pt-3 border-t border-white/40 flex items-center justify-between">
                <span className="text-xs text-slate-500">Confidence</span>
                <div className="flex items-center gap-2">
                    <div className="w-24 h-1.5 bg-white/30 rounded-full overflow-hidden">
                        <motion.div
                            className="h-full rounded-full bg-violet-500"
                            animate={{ width: `${confidence * 100}%` }}
                            transition={{ duration: 0.8 }}
                        />
                    </div>
                    <span className="text-xs font-semibold text-violet-700">
                        {Math.round(confidence * 100)}%
                    </span>
                </div>
            </div>
        </div>
    );
}
