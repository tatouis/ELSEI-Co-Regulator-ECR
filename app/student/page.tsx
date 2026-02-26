'use client';

import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useSim } from '@/lib/simulationStore';
import Navbar from '@/components/Navbar';
import ConsentBanner from '@/components/ConsentBanner';
import { LearnerStateWidget } from '@/components/LearnerStateWidget';
import InterventionCard from '@/components/InterventionCard';
import SimulationControls from '@/components/SimulationControls';
import TransparencyPanel from '@/components/TransparencyPanel';
import PrivacyControls from '@/components/PrivacyControls';
import WeeklySummary from '@/components/WeeklySummary';
import CurrentActivityPanel from '@/components/CurrentActivityPanel';
import { GraduationCap, Sparkles } from 'lucide-react';

export default function StudentDashboard() {
    const [consentDone, setConsentDone] = useState(false);
    const { currentLearner, activeIntervention, dismissIntervention } = useSim();

    return (
        <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #eef2ff 0%, #f5f0ff 50%, #ecfeff 100%)' }}>
            {/* Consent Banner */}
            {!consentDone && <ConsentBanner onAccept={() => setConsentDone(true)} />}

            <Navbar />

            {/* Hero header */}
            <div className="relative overflow-hidden">
                <div className="absolute inset-0 gradient-primary opacity-95" />
                {/* Decorative blobs */}
                <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full bg-violet-400/20 blur-3xl" />
                <div className="absolute -bottom-10 -left-10 w-48 h-48 rounded-full bg-cyan-400/20 blur-3xl" />

                <div className="relative max-w-7xl mx-auto px-4 py-8">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center shadow-lg">
                            <GraduationCap className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h1 className="text-2xl font-bold text-white">
                                    Welcome back, {currentLearner.name.split(' ')[0]}
                                </h1>
                                <Sparkles className="w-5 h-5 text-cyan-300" />
                            </div>
                            <p className="text-white/70 text-sm">
                                {currentLearner.currentActivity} · Master ELSEI
                            </p>
                        </div>
                        <div className="sm:ml-auto flex items-center gap-2 bg-white/15 rounded-2xl px-4 py-2">
                            <span className="w-2 h-2 rounded-full bg-cyan-300 animate-pulse" />
                            <span className="text-white/90 text-sm font-medium">ECR Active</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main grid */}
            <div className="max-w-7xl mx-auto px-4 py-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

                    {/* LEFT COLUMN */}
                    <div className="lg:col-span-2 space-y-5">
                        {/* State widget — full width on left col */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5 }}
                        >
                            <LearnerStateWidget
                                cognitiveLoad={currentLearner.state.cognitiveLoad}
                                attention={currentLearner.state.attention}
                                motivation={currentLearner.state.motivation}
                                confidence={currentLearner.state.confidence}
                            />
                        </motion.div>

                        {/* Activity + Weekly row */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: 0.1 }}
                            >
                                <CurrentActivityPanel />
                            </motion.div>
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: 0.15 }}
                            >
                                <WeeklySummary />
                            </motion.div>
                        </div>

                        {/* Transparency */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.2 }}
                        >
                            <TransparencyPanel />
                        </motion.div>
                    </div>

                    {/* RIGHT COLUMN */}
                    <div className="space-y-5">
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.5, delay: 0.1 }}
                        >
                            <SimulationControls />
                        </motion.div>
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.5, delay: 0.2 }}
                        >
                            <PrivacyControls />
                        </motion.div>

                        {/* Learner profile card */}
                        <motion.div
                            className="glass rounded-3xl p-5"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.5, delay: 0.3 }}
                        >
                            <div className="flex items-center gap-3 mb-3">
                                <div className="w-10 h-10 rounded-2xl gradient-primary flex items-center justify-center text-white font-bold shadow-md">
                                    {currentLearner.avatar}
                                </div>
                                <div>
                                    <p className="font-semibold text-slate-800 text-sm">{currentLearner.name}</p>
                                    <p className="text-xs text-violet-600 capitalize">{currentLearner.profile} learner</p>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-2 text-center">
                                <div className="rounded-xl bg-violet-50 p-2">
                                    <p className="text-sm font-bold text-violet-700">{currentLearner.interventionCount}</p>
                                    <p className="text-[10px] text-violet-500">This session</p>
                                </div>
                                <div className="rounded-xl bg-slate-50 p-2">
                                    <p className="text-sm font-bold text-slate-700 capitalize">
                                        {currentLearner.state.cognitiveLoad} CL
                                    </p>
                                    <p className="text-[10px] text-slate-500">Cognitive load</p>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </div>

            {/* Floating intervention card */}
            <AnimatePresence>
                {activeIntervention && !currentLearner.optOut && (
                    <InterventionCard
                        intervention={activeIntervention}
                        onDismiss={dismissIntervention}
                    />
                )}
            </AnimatePresence>
        </div>
    );
}
