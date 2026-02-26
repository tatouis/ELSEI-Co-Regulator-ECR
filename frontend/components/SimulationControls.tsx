'use client';

import { motion } from 'framer-motion';
import { useSim } from '@/lib/simulationStore';
import { Play, Pause, Zap, User, AlertTriangle, Coffee, TrendingDown } from 'lucide-react';
import { LearnerProfile } from '@/lib/types';

const PROFILES: { id: LearnerProfile; label: string; icon: typeof User; color: string }[] = [
    { id: 'focused', label: 'Focused', icon: User, color: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
    { id: 'overloaded', label: 'Overloaded', icon: AlertTriangle, color: 'bg-red-100 text-red-700 border-red-200' },
    { id: 'distracted', label: 'Distracted', icon: Coffee, color: 'bg-amber-100 text-amber-700 border-amber-200' },
    { id: 'disengaged', label: 'Disengaged', icon: TrendingDown, color: 'bg-slate-100 text-slate-600 border-slate-200' },
];

const SCENARIOS = [
    { id: 'normal', label: 'Normal' },
    { id: 'overload', label: '⚠️ Overload' },
    { id: 'distraction', label: '😴 Distraction' },
    { id: 'disengagement', label: '📉 Disengage' },
] as const;

export default function SimulationControls() {
    const { control, setControl, tick } = useSim();

    return (
        <div className="glass rounded-3xl p-5 space-y-4">
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="font-semibold text-slate-800 flex items-center gap-2">
                        <Zap className="w-4 h-4 text-violet-600" />
                        Demo Controls
                    </h3>
                    <p className="text-xs text-slate-500">Simulation mode for demonstrations</p>
                </div>
                <div className="text-xs text-slate-400 font-mono">
                    t={tick}
                </div>
            </div>

            {/* Play/Pause */}
            <button
                onClick={() => setControl({ playing: !control.playing })}
                className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-2xl font-semibold text-sm transition-all ${control.playing
                        ? 'bg-red-100 text-red-700 border border-red-200 hover:bg-red-200'
                        : 'gradient-primary text-white shadow-md hover:opacity-90'
                    }`}
            >
                {control.playing ? (
                    <><Pause className="w-4 h-4" /> Pause Simulation</>
                ) : (
                    <><Play className="w-4 h-4" /> Start Simulation</>
                )}
            </button>

            {/* Speed control */}
            <div>
                <p className="text-xs font-medium text-slate-600 mb-2">Speed</p>
                <div className="flex gap-2">
                    {[1, 2, 5].map((s) => (
                        <button
                            key={s}
                            onClick={() => setControl({ speed: s })}
                            className={`flex-1 py-1.5 rounded-xl text-xs font-semibold border transition-all ${control.speed === s
                                    ? 'gradient-primary text-white border-transparent'
                                    : 'bg-white text-slate-600 border-slate-200 hover:border-violet-300'
                                }`}
                        >
                            {s}×
                        </button>
                    ))}
                </div>
            </div>

            {/* Learner Profiles */}
            <div>
                <p className="text-xs font-medium text-slate-600 mb-2">Learner Profile</p>
                <div className="grid grid-cols-2 gap-2">
                    {PROFILES.map(({ id, label, icon: Icon, color }) => (
                        <button
                            key={id}
                            onClick={() => setControl({ profile: id })}
                            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border text-xs font-medium transition-all ${control.profile === id
                                    ? 'ring-2 ring-violet-400 ring-offset-1 ' + color
                                    : 'bg-white border-slate-200 text-slate-600 hover:border-violet-200'
                                }`}
                        >
                            <Icon className="w-3 h-3" />
                            {label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Scenario Triggers */}
            <div>
                <p className="text-xs font-medium text-slate-600 mb-2">Trigger Scenario</p>
                <div className="grid grid-cols-2 gap-2">
                    {SCENARIOS.map(({ id, label }) => (
                        <button
                            key={id}
                            onClick={() => setControl({ scenario: id })}
                            className={`px-3 py-1.5 rounded-xl border text-xs font-medium transition-all ${control.scenario === id
                                    ? 'gradient-primary text-white border-transparent'
                                    : 'bg-white border-slate-200 text-slate-600 hover:border-violet-200'
                                }`}
                        >
                            {label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Live indicator */}
            {control.playing && (
                <motion.div
                    className="flex items-center justify-center gap-2 py-2 rounded-2xl bg-emerald-50 border border-emerald-200"
                    animate={{ opacity: [0.7, 1, 0.7] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                >
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-xs text-emerald-700 font-medium">Simulation running</span>
                </motion.div>
            )}
        </div>
    );
}
