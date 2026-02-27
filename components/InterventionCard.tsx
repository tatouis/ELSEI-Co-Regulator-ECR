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

    const handleAction = (buttonLabel: string) => {
        // Discard or continue without toast if appropriate, but prompt wants a toast for positive feedback
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
            className="fixed bottom-6 right-6 z-50 w-80 max-w-[calc(100vw-2rem)]"
            initial={{ y: 100, opacity: 0, scale: 0.9 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 100, opacity: 0, scale: 0.9 }}
            transition={{ type: 'spring', stiffness: 300, damping: 28 }}
        >
            <div className="rounded-3xl overflow-hidden shadow-2xl shadow-violet-500/20 bg-white">
                {/* Header gradient */}
                <div className={`bg-gradient-to-r ${gradient} p-4 flex items-start gap-3`}>
                    <span className="text-2xl mt-0.5">{emoji}</span>
                    <div className="flex-1 min-w-0">
                        <p className="text-white/70 text-[10px] font-medium uppercase tracking-wider mb-0.5">
                            Pedagogical Support
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
                <div className="p-5 space-y-4">
                    {/* Insight */}
                    <p className="text-sm text-slate-700 leading-relaxed font-medium">
                        {intervention.insight}
                    </p>

                    {/* Action Guidance */}
                    <div className="bg-slate-50 border border-slate-100 rounded-2xl p-3">
                        <ul className="space-y-2">
                            {intervention.actionGuidance.map((guidance, idx) => (
                                <li key={idx} className="flex items-start gap-2 text-xs text-slate-600">
                                    <span className="text-violet-500 mt-0.5">&bull;</span>
                                    <span className="leading-snug">{guidance}</span>
                                </li>
                            ))}
                        </ul>

                        {intervention.type === 'reflective_prompt' && (
                            <div className="mt-3 pt-3 border-t border-slate-200">
                                <p className="text-xs font-medium text-violet-700 mb-2">👉 In one sentence, what is the goal of what you are doing now?</p>
                                <input type="text" placeholder="Type your reflection here..." className="w-full text-xs p-2 border border-slate-200 rounded-lg outline-none focus:border-violet-400 bg-white" />
                            </div>
                        )}
                    </div>

                    {/* Buttons */}
                    <div className="grid grid-cols-1 gap-2">
                        {intervention.buttons.map((btn, idx) => (
                            <button
                                key={idx}
                                onClick={() => handleAction(btn)}
                                className={`w-full py-2 text-xs font-semibold rounded-xl transition-colors ${idx === 0 ? 'bg-violet-600 text-white hover:bg-violet-700' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}
                            >
                                {btn}
                            </button>
                        ))}
                    </div>

                    <p className="text-[10px] text-slate-400 text-center pt-2 border-t border-slate-100">
                        This support is based on your learning activity patterns (simulated in this demo).
                    </p>
                </div>
            </div>
        </motion.div>
    );
}
