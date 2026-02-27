'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, Monitor, Clock, AlertTriangle } from 'lucide-react';
import { useSim } from '@/lib/simulationStore';
import { useRouter } from 'next/navigation';

interface Props {
    isOpen: boolean;
    onClose: () => void;
}

export default function StudentSelectorModal({ isOpen, onClose }: Props) {
    const { learners, setCurrentLearnerId } = useSim();
    const router = useRouter();
    const [searchQuery, setSearchQuery] = useState('');

    const filteredLearners = learners.filter(l =>
        l.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleSelect = (id: string) => {
        setCurrentLearnerId(id);
        onClose();
        router.push('/student');
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
                />
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 10 }}
                    className="relative w-full max-w-2xl bg-white rounded-3xl shadow-xl overflow-hidden flex flex-col max-h-[85vh] z-10"
                >
                    {/* Header */}
                    <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                        <div>
                            <h2 className="text-xl font-bold text-slate-800">Select Student</h2>
                            <p className="text-sm text-slate-500 mt-0.5">View individual real-time simulation</p>
                        </div>
                        <button
                            onClick={onClose}
                            className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center hover:bg-slate-200 text-slate-500 transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Search */}
                    <div className="p-4 border-b border-slate-100">
                        <div className="relative">
                            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Search by student name..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500 transition-shadow"
                            />
                        </div>
                    </div>

                    {/* List */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-2">
                        {filteredLearners.length === 0 ? (
                            <div className="text-center py-10 text-slate-500 text-sm">
                                No students found matching "{searchQuery}"
                            </div>
                        ) : (
                            filteredLearners.map((learner) => {
                                const isHighRisk = learner.state.cognitiveLoad === 'high' || learner.state.attention === 'low';

                                return (
                                    <button
                                        key={learner.id}
                                        onClick={() => handleSelect(learner.id)}
                                        className="w-full flex items-center gap-4 p-4 rounded-2xl border border-slate-100 hover:border-violet-200 hover:bg-violet-50/50 transition-all text-left group"
                                    >
                                        <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center text-white font-bold text-lg shadow-sm">
                                            {learner.avatar}
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-1">
                                                <h3 className="font-semibold text-slate-800 truncate">{learner.name}</h3>
                                                {isHighRisk && (
                                                    <span className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-rose-100 text-rose-700 text-[10px] font-bold whitespace-nowrap">
                                                        <AlertTriangle className="w-3 h-3" /> Needs Support
                                                    </span>
                                                )}
                                            </div>

                                            <div className="flex items-center gap-4 text-xs text-slate-500">
                                                <span className="flex items-center gap-1.5 truncate max-w-[200px]">
                                                    <Monitor className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                                    <span className="truncate">{learner.currentActivity}</span>
                                                </span>
                                                <span className="flex items-center gap-1.5 shrink-0">
                                                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                                                    {Math.floor(learner.features.timeSinceLastAction)}s ago
                                                </span>
                                            </div>
                                        </div>
                                    </button>
                                );
                            })
                        )}
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
