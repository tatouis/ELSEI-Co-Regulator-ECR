'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSim } from '@/lib/simulationStore';
import { Activity, RefreshCw, Filter, FileText, CheckCircle, MessageSquare, Download } from 'lucide-react';

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

    // Auto generate events when playing with realistic delays
    useEffect(() => {
        if (!control.playing) return;

        // Randomize the chance of an event happening this tick to create realistic gaps
        const shouldFireEvent = Math.random() > 0.4; // 60% chance per tick length
        if (!shouldFireEvent) return;

        const newEvent = MOODLE_EVENTS[Math.floor(Math.random() * MOODLE_EVENTS.length)];
        const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

        // Add a slight random delay (0-1500ms) before the event actually appears
        const delay = Math.random() * 1500;

        const timeout = setTimeout(() => {
            setEvents(prev => {
                const updated = [...prev, { id: Date.now(), data: newEvent, time: timeStr }];
                if (updated.length > 20) return updated.slice(updated.length - 20);
                return updated;
            });
        }, delay);

        return () => clearTimeout(timeout);
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
                        Moodle Activity Stream
                    </h3>
                    <div className="flex items-center gap-2 mt-1">
                        <span className="flex h-2 w-2 relative">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                        </span>
                        <p className="text-[10px] text-emerald-600 font-medium">Live session</p>
                    </div>
                </div>
                <div className="flex flex-col items-end gap-1">
                    <div className="flex bg-slate-100 p-0.5 rounded-lg border border-slate-200 shadow-sm">
                        {[0.5, 1, 2, 5].map((s) => (
                            <button
                                key={s}
                                onClick={() => setControl({ speed: s })}
                                className={`px-2 py-0.5 rounded-md text-[10px] font-bold transition-all ${control.speed === s
                                    ? 'bg-white text-emerald-600 shadow-sm border border-slate-200'
                                    : 'text-slate-400 hover:text-slate-600'
                                    }`}
                            >
                                {s}×
                            </button>
                        ))}
                    </div>
                    <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-medium bg-slate-50 px-2 py-1 rounded-lg border border-slate-100">
                        <RefreshCw className={`w-3 h-3 ${control.playing ? 'animate-spin text-emerald-500' : ''}`} />
                        Last sync: {control.playing ? 'just now' : '1m ago'}
                    </div>
                </div>
            </div>

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
                        Connecting to activity stream...
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

