'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Intervention } from '@/lib/types';
import { X, HelpCircle, ChevronDown } from 'lucide-react';
import { useState } from 'react';
import { interventionTypeLabel } from '@/lib/policyEngine';

const TYPE_COLORS: Record<string, string> = {
    pacing_suggestion: 'from-blue-500 to-blue-700',
    reflective_prompt: 'from-violet-500 to-violet-700',
    task_reframing: 'from-cyan-500 to-cyan-700',
    encouragement: 'from-emerald-500 to-emerald-700',
    help_routing: 'from-orange-500 to-orange-700',
};

const TYPE_EMOJI: Record<string, string> = {
    pacing_suggestion: '⏸️',
    reflective_prompt: '💭',
    task_reframing: '🔄',
    encouragement: '🌟',
    help_routing: '🤝',
};

interface Props {
    intervention: Intervention;
    onDismiss: () => void;
}

export default function InterventionCard({ intervention, onDismiss }: Props) {
    const [showReason, setShowReason] = useState(false);
    const gradient = TYPE_COLORS[intervention.type] ?? 'from-violet-500 to-violet-700';
    const emoji = TYPE_EMOJI[intervention.type] ?? '✨';

    return (
        <motion.div
            className="fixed bottom-6 right-6 z-50 w-80 max-w-[calc(100vw-2rem)]"
            initial={{ y: 100, opacity: 0, scale: 0.9 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 100, opacity: 0, scale: 0.9 }}
            transition={{ type: 'spring', stiffness: 300, damping: 28 }}
        >
            <div className="rounded-3xl overflow-hidden shadow-2xl shadow-violet-500/20">
                {/* Header gradient */}
                <div className={`bg-gradient-to-r ${gradient} p-4 flex items-start gap-3`}>
                    <span className="text-2xl mt-0.5">{emoji}</span>
                    <div className="flex-1 min-w-0">
                        <p className="text-white/70 text-xs font-medium uppercase tracking-wider">
                            {interventionTypeLabel(intervention.type)}
                        </p>
                        <h4 className="text-white font-bold text-sm leading-tight">
                            {intervention.title}
                        </h4>
                    </div>
                    <button
                        onClick={onDismiss}
                        className="w-7 h-7 rounded-full bg-white/15 hover:bg-white/25 flex items-center justify-center transition-colors flex-shrink-0"
                        aria-label="Dismiss"
                    >
                        <X className="w-3.5 h-3.5 text-white" />
                    </button>
                </div>

                {/* Body */}
                <div className="glass p-4 space-y-3">
                    <p className="text-sm text-slate-700 leading-relaxed">
                        {intervention.message}
                    </p>

                    {/* Why am I seeing this? */}
                    <div>
                        <button
                            onClick={() => setShowReason((v) => !v)}
                            className="flex items-center gap-1.5 text-xs text-violet-600 hover:text-violet-800 transition-colors"
                        >
                            <HelpCircle className="w-3.5 h-3.5" />
                            <span>Why am I seeing this?</span>
                            <ChevronDown
                                className={`w-3 h-3 transition-transform ${showReason ? 'rotate-180' : ''}`}
                            />
                        </button>

                        <AnimatePresence>
                            {showReason && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    className="overflow-hidden"
                                >
                                    <div className="mt-2 p-3 rounded-2xl bg-violet-50 border border-violet-100">
                                        <p className="text-xs text-violet-700 leading-relaxed">
                                            {intervention.reason}
                                        </p>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    <button
                        onClick={onDismiss}
                        className="w-full py-2 text-xs font-medium text-slate-500 hover:text-slate-700 transition-colors"
                    >
                        Dismiss
                    </button>
                </div>
            </div>
        </motion.div>
    );
}
