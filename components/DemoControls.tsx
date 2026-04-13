'use client';

import { useSim } from '@/lib/simulationStore';
import { Zap, Play, Pause, User, AlertTriangle, Coffee, TrendingDown, Clock } from 'lucide-react';

export default function DemoControls() {
    const { control, setControl, tick } = useSim();

    return (
        <div className="glass rounded-3xl p-5 space-y-5">
            <div className="flex items-start justify-between">
                <div>
                    <h3 className="font-semibold text-slate-800 flex items-center gap-2">
                        <Zap className="w-4 h-4 text-violet-600" />
                        Demo Controls
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">Simulation mode for demonstrations</p>
                </div>
                <div className="text-xs font-mono text-slate-400">t={tick}</div>
            </div>

            <button
                onClick={() => setControl({ playing: !control.playing })}
                className="w-full flex items-center justify-center gap-2 bg-violet-600 hover:bg-violet-700 text-white rounded-xl py-2.5 font-medium transition-colors"
            >
                {control.playing ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                {control.playing ? 'Pause Simulation' : 'Start Simulation'}
            </button>

            <div>
                <p className="text-xs font-medium text-slate-600 mb-2">Speed</p>
                <div className="grid grid-cols-3 gap-2">
                    {[1, 2, 5].map((s) => (
                        <button
                            key={s}
                            onClick={() => setControl({ speed: s })}
                            className={`py-1.5 rounded-xl text-sm font-semibold transition-all ${control.speed === s
                                    ? 'bg-violet-600 text-white shadow-md'
                                    : 'bg-white text-slate-600 border border-slate-200 hover:border-violet-300'
                                }`}
                        >
                            {s}×
                        </button>
                    ))}
                </div>
            </div>

            <div>
                <p className="text-xs font-medium text-slate-600 mb-2">Learner Profile</p>
                <div className="grid grid-cols-2 gap-2">
                    {[
                        { id: 'focused', label: 'Focused', icon: User, color: 'text-slate-600', active: 'bg-violet-50 text-violet-700 border-violet-200' },
                        { id: 'overloaded', label: 'Overloaded', icon: AlertTriangle, color: 'text-red-600', active: 'bg-red-50 text-red-700 border-red-200' },
                        { id: 'distracted', label: 'Distracted', icon: Coffee, color: 'text-amber-600', active: 'bg-amber-50 text-amber-700 border-amber-200' },
                        { id: 'disengaged', label: 'Disengaged', icon: TrendingDown, color: 'text-slate-500', active: 'bg-slate-100 text-slate-700 border-slate-300' },
                    ].map(({ id, label, icon: Icon, color, active }) => {
                        const isActive = control.profile === id;
                        return (
                            <button
                                key={id}
                                onClick={() => setControl({ profile: id as any })}
                                className={`flex items-center gap-2 py-2 px-3 rounded-xl border transition-all text-xs font-medium ${isActive ? active : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                                    }`}
                            >
                                <Icon className={`w-3.5 h-3.5 ${isActive ? '' : color}`} />
                                {label}
                            </button>
                        );
                    })}
                </div>
            </div>

            <div>
                <p className="text-xs font-medium text-slate-600 mb-2">Trigger Scenario</p>
                <div className="grid grid-cols-2 gap-2">
                    {[
                        { id: 'normal', label: 'Normal', icon: null, color: '', active: 'bg-violet-600 text-white border-violet-600' },
                        { id: 'overload', label: 'Overload', icon: AlertTriangle, color: 'text-amber-500', active: 'bg-amber-50 text-amber-700 border-amber-200' },
                        { id: 'distraction', label: 'Distraction', icon: Clock, color: 'text-orange-500', active: 'bg-orange-50 text-orange-700 border-orange-200' },
                        { id: 'disengage', label: 'Disengage', icon: TrendingDown, color: 'text-rose-400', active: 'bg-rose-50 text-rose-700 border-rose-200' },
                    ].map(({ id, label, icon: Icon, color, active }) => {
                        const isActive = control.scenario === id;
                        return (
                            <button
                                key={id}
                                onClick={() => setControl({ scenario: id as any })}
                                className={`flex items-center justify-center gap-2 py-2 px-3 rounded-xl border transition-all text-xs font-medium ${isActive ? active : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                                    }`}
                            >
                                {Icon && <Icon className={`w-3.5 h-3.5 ${isActive ? '' : color}`} />}
                                {label}
                            </button>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
