'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { useSim } from '@/lib/simulationStore';
import { ShieldCheck, X, Eye, Lock, Zap } from 'lucide-react';

export default function ConsentBanner({ onAccept }: { onAccept: () => void }) {
    const { setConsentGiven } = useSim();
    const [showDetails, setShowDetails] = useState(false);

    function accept() {
        setConsentGiven(true);
        onAccept();
    }

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[200] flex items-end justify-center p-4 sm:items-center">
                {/* Backdrop */}
                <motion.div
                    className="absolute inset-0 bg-[#0d1117]/70 backdrop-blur-sm"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                />

                <motion.div
                    className="relative w-full max-w-2xl rounded-3xl overflow-hidden"
                    initial={{ y: 80, opacity: 0, scale: 0.96 }}
                    animate={{ y: 0, opacity: 1, scale: 1 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                >
                    {/* Gradient header */}
                    <div className="gradient-primary p-6 text-white">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center">
                                <ShieldCheck className="w-5 h-5" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold">Your Data, Your Control</h2>
                                <p className="text-white/70 text-sm">ELSEI Co-Regulator — Transparent AI</p>
                            </div>
                        </div>
                    </div>

                    {/* Body */}
                    <div className="glass p-6 space-y-4">
                        <p className="text-slate-700 text-sm leading-relaxed">
                            The <strong>ELSEI Co-Regulator (ECR)</strong> observes your learning behavior
                            (navigation patterns, time on task, retry frequency) to provide lightweight
                            metacognitive support. <strong>No personal biometric data is collected.</strong>
                        </p>

                        <div className="grid grid-cols-3 gap-3">
                            {[
                                { icon: Eye, label: 'Transparent', desc: 'Every suggestion explained' },
                                { icon: Lock, label: 'Minimal Data', desc: 'Behavioral signals only' },
                                { icon: Zap, label: 'Always Optional', desc: 'Opt-out anytime' },
                            ].map(({ icon: Icon, label, desc }) => (
                                <div key={label} className="rounded-2xl bg-violet-50 border border-violet-100 p-3 text-center">
                                    <Icon className="w-4 h-4 text-violet-600 mx-auto mb-1" />
                                    <p className="text-xs font-semibold text-violet-800">{label}</p>
                                    <p className="text-xs text-violet-600">{desc}</p>
                                </div>
                            ))}
                        </div>

                        <AnimatePresence>
                            {showDetails && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    className="overflow-hidden"
                                >
                                    <div className="rounded-2xl bg-slate-50 border border-slate-200 p-4 text-xs text-slate-600 space-y-1">
                                        <p>✅ Data collected: navigation speed, time on task, retry count, inactivity duration</p>
                                        <p>❌ Data NOT collected: keystrokes, webcam, microphone, personal files</p>
                                        <p>🕐 Interventions: max 1 per 5 minutes — always dismissible</p>
                                        <p>🔒 Data is not shared with third parties. Used only for in-session support.</p>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <button
                            onClick={() => setShowDetails((v) => !v)}
                            className="text-xs text-violet-600 underline hover:text-violet-800 transition-colors"
                        >
                            {showDetails ? 'Hide details' : 'Learn exactly what data is collected →'}
                        </button>

                        <div className="flex gap-3 pt-2">
                            <button
                                onClick={accept}
                                className="flex-1 gradient-primary text-white font-semibold py-3 px-6 rounded-2xl hover:opacity-90 transition-opacity"
                            >
                                Accept & Continue Learning
                            </button>
                            <button
                                onClick={() => {
                                    setConsentGiven(false);
                                    onAccept(); // still allow access but opt-out by default
                                }}
                                className="px-5 py-3 rounded-2xl border border-slate-200 text-slate-600 text-sm hover:bg-slate-50 transition-colors"
                            >
                                Decline
                            </button>
                        </div>

                        <p className="text-center text-xs text-slate-400">
                            Master ELSEI — École Normale Supérieure, Abdelmalek Essaâdi University
                        </p>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
