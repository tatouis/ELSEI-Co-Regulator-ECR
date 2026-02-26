'use client';

import { useSim } from '@/lib/simulationStore';
import { motion } from 'framer-motion';
import { Shield, BellOff, Info } from 'lucide-react';

export default function PrivacyControls() {
    const { currentLearner, toggleOptOut, consentGiven } = useSim();

    return (
        <div className="glass rounded-3xl p-5 space-y-4">
            <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-violet-600" />
                <div>
                    <h3 className="font-semibold text-slate-800">Privacy Controls</h3>
                    <p className="text-xs text-slate-500">Your data, your choice</p>
                </div>
            </div>

            {/* Opt-out toggle */}
            <div className="flex items-center justify-between p-3 rounded-2xl bg-white/60">
                <div className="flex items-center gap-2">
                    <BellOff className="w-4 h-4 text-slate-500" />
                    <div>
                        <p className="text-sm font-medium text-slate-700">AI Interventions</p>
                        <p className="text-xs text-slate-400">
                            {currentLearner.optOut ? 'Paused — you won\'t receive suggestions' : 'Active — suggestions enabled'}
                        </p>
                    </div>
                </div>
                <button
                    onClick={toggleOptOut}
                    className={`relative w-11 h-6 rounded-full transition-colors ${!currentLearner.optOut ? 'bg-violet-600' : 'bg-slate-300'
                        }`}
                >
                    <motion.div
                        className="absolute top-1 w-4 h-4 rounded-full bg-white shadow-sm"
                        animate={{ left: !currentLearner.optOut ? '1.375rem' : '0.25rem' }}
                        transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                    />
                </button>
            </div>

            <div className="flex items-center justify-between p-3 rounded-2xl bg-white/60">
                <div className="flex items-center gap-2">
                    <Info className="w-4 h-4 text-slate-500" />
                    <div>
                        <p className="text-sm font-medium text-slate-700">Data Collection</p>
                        <p className="text-xs text-slate-400">
                            {consentGiven ? 'Consented — behavioral signals only' : 'Not consented'}
                        </p>
                    </div>
                </div>
                <span className={`text-xs font-medium px-2 py-0.5 rounded-lg ${consentGiven ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
                    }`}>
                    {consentGiven ? 'Active' : 'Off'}
                </span>
            </div>

            <div className="flex items-start gap-2 p-3 rounded-2xl bg-blue-50 border border-blue-100">
                <Info className="w-3.5 h-3.5 text-blue-500 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-blue-700 leading-relaxed">
                    Interventions are limited to 1 per 5 minutes and are always dismissible.
                    Quizzes are never interrupted.
                </p>
            </div>
        </div>
    );
}
