'use client';

import { motion } from 'framer-motion';
import { Intervention } from '@/lib/types';
import { X, Check } from 'lucide-react';
import { useState } from 'react';

const TYPE_COLORS: Record<string, string> = {
    pacing_suggestion: 'from-blue-500 to-indigo-600',
    reflective_prompt: 'from-violet-500 to-fuchsia-600',
    task_reframing: 'from-cyan-500 to-teal-600',
    encouragement: 'from-emerald-500 to-teal-600',
    help_routing: 'from-orange-500 to-red-600',
};

const TYPE_EMOJI: Record<string, string> = {
    pacing_suggestion: '🧠',
    reflective_prompt: '👁️',
    task_reframing: '🔄',
    encouragement: '⚡',
    help_routing: '🤝',
};

interface Props {
    intervention: Intervention;
    onDismiss: () => void;
}

export default function InterventionCard({ intervention, onDismiss }: Props) {
    const [toastMessage, setToastMessage] = useState<string | null>(null);
    const gradient = TYPE_COLORS[intervention.type] ?? 'from-violet-500 to-violet-700';
    const emoji = TYPE_EMOJI[intervention.type] ?? '✨';

    const handleAction = async (buttonLabel: string) => {
        const reaction = buttonLabel.toLowerCase().includes('anyway') || buttonLabel.toLowerCase().includes('dismiss') 
            ? 'DISMISSED' 
            : 'ACCEPTED';

        // Notify backend of the student's reaction
        if (intervention.id) {
            try {
                fetch('/api/interventions/feedback', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ id: intervention.id, reaction })
                });
            } catch (err) {
                console.error('Failed to send intervention feedback:', err);
            }
        }

        // Display feedback toast and dismiss
        if (buttonLabel.toLowerCase().includes('continue') && !buttonLabel.toLowerCase().includes('anyway')) {
            const messages = ['Good progress — keep going.', 'Nice focus recovery.', 'You’re back on track.'];
            setToastMessage(messages[Math.floor(Math.random() * messages.length)]);
            setTimeout(() => {
                onDismiss();
            }, 1500);
        } else if (buttonLabel.toLowerCase().includes('anyway') || buttonLabel.toLowerCase().includes('dismiss')) {
            onDismiss();
        } else {
            const messages = ['Action applied.', 'Taking note of your choice.', 'Good decision.'];
            setToastMessage(messages[Math.floor(Math.random() * messages.length)]);
            setTimeout(() => {
                onDismiss();
            }, 1500);
        }
    };

    if (toastMessage) {
        return (
            <motion.div
                className="fixed bottom-6 right-6 z-50 w-80 max-w-[calc(100vw-2rem)]"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 20, opacity: 0 }}
            >
                <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex items-center gap-3 shadow-lg">
                    <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
                        <Check className="w-4 h-4" />
                    </div>
                    <p className="text-sm font-medium text-emerald-800">{toastMessage}</p>
                </div>
            </motion.div>
        );
    }

    return (
        <motion.div
            className="fixed bottom-6 right-6 z-50 w-72 max-w-[calc(100vw-2rem)]"
            initial={{ x: 50, opacity: 0, scale: 0.95 }}
            animate={{ x: 0, opacity: 1, scale: 1 }}
            exit={{ x: 50, opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
        >
            <div className="rounded-2xl overflow-hidden shadow-xl shadow-violet-900/10 bg-white border border-slate-100">
                {/* Header gradient */}
                <div className={`bg-gradient-to-r ${gradient} p-3 flex items-start gap-2.5`}>
                    <span className="text-xl mt-0.5" aria-hidden="true">{emoji}</span>
                    <div className="flex-1 min-w-0">
                        <p className="text-white/80 text-[9px] font-semibold uppercase tracking-wider mb-0.5">
                            Pedagogical Support
                        </p>
                        <h4 className="text-white font-bold text-xs leading-tight line-clamp-1">
                            {intervention.title}
                        </h4>
                    </div>
                    <button
                        onClick={onDismiss}
                        className="w-6 h-6 rounded-full bg-white/10 hover:bg-white/25 flex items-center justify-center transition-colors flex-shrink-0"
                        aria-label="Dismiss"
                    >
                        <X className="w-3 h-3 text-white" />
                    </button>
                </div>

                {/* Body */}
                <div className="p-4 space-y-3">
                    {/* Insight */}
                    <p className="text-xs text-slate-600 leading-snug line-clamp-2">
                        {intervention.insight}
                    </p>

                    {/* Action Guidance */}
                    <div className="bg-slate-50 border border-slate-100/60 rounded-xl p-2.5">
                        <ul className="space-y-1.5 list-none">
                            {intervention.actionGuidance.slice(0, 2).map((guidance, idx) => (
                                <li key={idx} className="flex items-start gap-1.5 text-[11px] text-slate-600">
                                    <span className="text-violet-400 mt-0.5 text-[10px]">&bull;</span>
                                    <span className="leading-snug line-clamp-1">{guidance}</span>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Buttons */}
                    <div className="grid grid-cols-2 gap-2">
                        {intervention.buttons.slice(0, 2).map((btn, idx) => (
                            <button
                                key={idx}
                                onClick={() => handleAction(btn)}
                                className={`w-full py-1.5 px-2 text-[11px] font-semibold rounded-lg transition-colors truncate ${idx === 0 ? 'bg-violet-600 text-white hover:bg-violet-700' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                            >
                                {btn}
                            </button>
                        ))}
                    </div>

                    <p className="text-[9px] text-slate-400 text-center pt-1.5 border-t border-slate-50">
                        Based on activity patterns
                    </p>
                </div>
            </div>
        </motion.div>
    );
}
