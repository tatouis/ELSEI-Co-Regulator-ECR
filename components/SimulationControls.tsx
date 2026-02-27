'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSim } from '@/lib/simulationStore';
import { Play, Pause, Activity, RefreshCw, Filter, FileText, CheckCircle, MessageSquare, Download } from 'lucide-react';

const MOODLE_EVENTS = [
    { type: 'view', text: 'Viewed course page', icon: Activity, critical: false },
    { type: 'activity', text: 'Opened activity M125', icon: FileText, critical: true },
    { type: 'quiz', text: 'Attempted Quiz: Learning Theories', icon: CheckCircle, critical: true },
    { type: 'submit', text: 'Submitted assignment draft', icon: CheckCircle, critical: true },
    { type: 'forum', text: 'Posted in general forum', icon: MessageSquare, critical: false },
    { type: 'download', text: 'Downloaded PDF: Course Syllabus', icon: Download, critical: false },
    { type: 'view', text: 'Viewed activity M121', icon: FileText, critical: false },
    { type: 'quiz', text: 'Completed Quiz: Cognitive Architectures', icon: CheckCircle, critical: true },
];

export default function SimulationControls() {
    const { control, setControl, tick, currentLearner } = useSim();
    const [events, setEvents] = useState<{ id: number; data: typeof MOODLE_EVENTS[0]; time: string }[]>([]);
    const [filterCritical, setFilterCritical] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    // Auto generate events when playing
    useEffect(() => {
        if (!control.playing) return;
        const newEvent = MOODLE_EVENTS[Math.floor(Math.random() * MOODLE_EVENTS.length)];
        const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

        setEvents(prev => {
            const updated = [...prev, { id: tick, data: newEvent, time: timeStr }];
            if (updated.length > 20) return updated.slice(updated.length - 20);
            return updated;
        });
    }, [tick, control.playing]);

    // Auto scroll
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [events]);

    const displayEvents = filterCritical ? events.filter(e => e.data.critical) : events;

    return (
        <div className="glass rounded-3xl p-5 space-y-4 flex flex-col h-[400px]">
            <div className="flex items-start justify-between">
                <div>
                    <h3 className="font-semibold text-slate-800 flex items-center gap-2">
                        <Activity className="w-4 h-4 text-emerald-600" />
                        Moodle Activity Stream (Simulated)
                    </h3>
                    <p className="text-[10px] text-slate-500 max-w-[200px] leading-tight mt-1">
                        This is a simulated feed for demonstration (not real Moodle data).
                    </p>
                </div>
                <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-medium bg-slate-50 px-2 py-1 rounded-lg border border-slate-100">
                    <RefreshCw className={`w-3 h-3 ${control.playing ? 'animate-spin text-emerald-500' : ''}`} />
                    Last sync: {control.playing ? 'just now' : '1m ago'}
                </div>
            </div>

            {/* Play/Pause Button */}
            <button
                onClick={() => setControl({ playing: !control.playing })}
                className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-2xl font-semibold text-sm transition-all ${control.playing
                    ? 'bg-red-100 text-red-700 border border-red-200 hover:bg-red-200'
                    : 'gradient-primary text-white shadow-md hover:opacity-90'
                    }`}
            >
                {control.playing ? (
                    <><Pause className="w-4 h-4" /> Pause simulated session</>
                ) : (
                    <><Play className="w-4 h-4" /> Start simulated session</>
                )}
            </button>

            {/* Filter */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                <span className="text-xs font-medium text-slate-600 flex items-center gap-1.5">
                    <Filter className="w-3 h-3" /> Filter stream
                </span>
                <label className="flex items-center gap-2 cursor-pointer">
                    <div className="relative">
                        <input type="checkbox" className="sr-only" checked={filterCritical} onChange={() => setFilterCritical(!filterCritical)} />
                        <div className={`block w-8 h-5 rounded-full transition-colors ${filterCritical ? 'bg-violet-500' : 'bg-slate-200'}`}></div>
                        <div className={`absolute left-1 top-1 bg-white w-3 h-3 rounded-full transition-transform ${filterCritical ? 'transform translate-x-3' : ''}`}></div>
                    </div>
                    <span className="text-xs text-slate-500">Learning-critical</span>
                </label>
            </div>

            {/* Stream List */}
            <div
                ref={scrollRef}
                className="flex-1 overflow-y-auto pr-2 space-y-2 relative"
                style={{ scrollBehavior: 'smooth' }}
            >
                {events.length === 0 && (
                    <div className="absolute inset-0 flex items-center justify-center text-xs text-slate-400 italic">
                        No activity yet. Click start to simulate.
                    </div>
                )}
                <AnimatePresence initial={false}>
                    {displayEvents.map((ev) => {
                        const Icon = ev.data.icon;
                        return (
                            <motion.div
                                key={ev.id}
                                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                className="flex items-start gap-3 p-2.5 rounded-xl bg-white border border-slate-100 shadow-sm"
                            >
                                <div className={`mt-0.5 w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0 ${ev.data.critical ? 'bg-violet-100 text-violet-600' : 'bg-slate-100 text-slate-500'}`}>
                                    <Icon className="w-3.5 h-3.5" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-xs font-medium text-slate-700 leading-tight">
                                        {ev.data.text}
                                    </p>
                                    <p className="text-[10px] text-slate-400 mt-0.5">
                                        {ev.time} · {currentLearner.name}
                                    </p>
                                </div>
                            </motion.div>
                        );
                    })}
                </AnimatePresence>
            </div>
        </div>
    );
}

