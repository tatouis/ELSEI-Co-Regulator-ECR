'use client';

import { useSim } from '@/lib/simulationStore';
import { motion } from 'framer-motion';
import { BookOpen, Clock, RefreshCw, Shield } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function CurrentActivityPanel() {
    const { currentLearner } = useSim();
    const [sessionMins, setSessionMins] = useState(0);

    useEffect(() => {
        const update = () => {
            const mins = Math.round((Date.now() - currentLearner.sessionStart) / 60000);
            setSessionMins(mins);
        };
        update();
        const interval = setInterval(update, 30000);
        return () => clearInterval(interval);
    }, [currentLearner.sessionStart]);

    return (
        <div className="glass rounded-3xl p-5 space-y-4">
            <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-violet-600" />
                <h3 className="font-semibold text-slate-800">Current Activity</h3>
                {currentLearner.isInQuiz && (
                    <span className="ml-auto flex items-center gap-1 bg-amber-100 border border-amber-200 text-amber-700 text-xs font-medium px-2 py-0.5 rounded-lg">
                        <Shield className="w-3 h-3" /> Quiz — No interruptions
                    </span>
                )}
            </div>

            <div className="p-4 rounded-2xl gradient-subtle border border-violet-100">
                <p className="text-sm font-semibold text-violet-800 leading-snug">
                    {currentLearner.currentActivity}
                </p>
                <p className="text-xs text-violet-600 mt-1">Master ELSEI — ENS Tétouan</p>
            </div>

            <div className="grid grid-cols-3 gap-3">
                <div className="text-center">
                    <div className="flex items-center justify-center gap-1 mb-1">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                    </div>
                    <p className="text-lg font-bold text-slate-800">{sessionMins}m</p>
                    <p className="text-xs text-slate-500">Session</p>
                </div>
                <div className="text-center">
                    <div className="flex items-center justify-center gap-1 mb-1">
                        <RefreshCw className="w-3.5 h-3.5 text-slate-400" />
                    </div>
                    <p className="text-lg font-bold text-slate-800">{currentLearner.features.retryCount}</p>
                    <p className="text-xs text-slate-500">Retries</p>
                </div>
                <div className="text-center">
                    <div className="flex items-center justify-center gap-1 mb-1">
                        <BookOpen className="w-3.5 h-3.5 text-slate-400" />
                    </div>
                    <p className="text-lg font-bold text-slate-800">{currentLearner.interventionCount}</p>
                    <p className="text-xs text-slate-500">Suggestions</p>
                </div>
            </div>
        </div>
    );
}
