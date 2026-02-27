'use client';

import { createContext, useContext, useEffect, useRef, useState, ReactNode } from 'react';
import {
    SimulatedLearner,
    Intervention,
    SimulationControl,
    LearnerProfile,
    LearnerState,
} from '@/lib/types';
import { detectState, simulateFeatures } from '@/lib/stateDetection';
import { decideIntervention } from '@/lib/policyEngine';

// ─── Sample learner profiles ─────────────────────────────────────────────────
const ACTIVITIES = [
    'M121: E-learning Educational Engineering',
    'M122: Educational Approaches',
    'M123: Educational Scripting of an Online Course',
    'M124: Research Methodology and Statistics',
    'M125: Fundamentals of Machine Learning',
    'M126: Study of Learning Management Systems',
];

const LEARNER_NAMES = [
    'Mohamed AJAHA',
    'Nada MAZAR',
    'Assaouir MOUSSI',
    'Zainab BOUZIDI',
    'Hanaa FARIS',
    'Samia EZOUILI',
];

function createLearner(id: string, name: string, profile: LearnerProfile): SimulatedLearner {
    const features = simulateFeatures(profile, 'normal', 0);
    const state = detectState(features);
    return {
        id,
        name,
        profile,
        avatar: name.charAt(0).toUpperCase(),
        state,
        features,
        currentActivity: ACTIVITIES[Math.floor(Math.random() * ACTIVITIES.length)],
        isInQuiz: false,
        optOut: false,
        lastIntervention: null,
        interventionCount: 0,
        sessionStart: Date.now() - Math.random() * 3600000,
    };
}

const PROFILES: LearnerProfile[] = ['focused', 'overloaded', 'distracted', 'disengaged'];

const INITIAL_LEARNERS: SimulatedLearner[] = LEARNER_NAMES.map((name, i) =>
    createLearner(String(i + 1), name, PROFILES[i % 4])
);

// ─── Context ─────────────────────────────────────────────────────────────────
interface SimStore {
    learners: SimulatedLearner[];
    currentLearner: SimulatedLearner;
    activeIntervention: Intervention | null;
    interventionHistory: Intervention[];
    control: SimulationControl;
    tick: number;
    consentGiven: boolean;
    setConsentGiven: (v: boolean) => void;
    setControl: (c: Partial<SimulationControl>) => void;
    dismissIntervention: () => void;
    setCurrentLearnerId: (id: string) => void;
    toggleOptOut: () => void;
}

const SimContext = createContext<SimStore | null>(null);

export function SimulationProvider({ children }: { children: ReactNode }) {
    const [learners, setLearners] = useState<SimulatedLearner[]>(INITIAL_LEARNERS);
    const [currentLearnerId, setCurrentLearnerId] = useState('1');
    const [activeIntervention, setActiveIntervention] = useState<Intervention | null>(null);
    const [interventionHistory, setInterventionHistory] = useState<Intervention[]>([]);
    const [consentGiven, setConsentGiven] = useState(false);
    const [tick, setTick] = useState(0);
    const [control, setControlState] = useState<SimulationControl>({
        playing: false,
        profile: 'overloaded',
        scenario: 'normal',
        speed: 1,
    });

    const tickRef = useRef(0);
    const intervalRef = useRef<NodeJS.Timeout | null>(null);

    function setControl(partial: Partial<SimulationControl>) {
        setControlState((prev) => ({ ...prev, ...partial }));
    }

    function dismissIntervention() {
        if (activeIntervention) {
            setInterventionHistory((h) => [
                ...h,
                { ...activeIntervention, dismissed: true },
            ]);
        }
        setActiveIntervention(null);
    }

    function toggleOptOut() {
        setLearners((prev) =>
            prev.map((l) =>
                l.id === currentLearnerId ? { ...l, optOut: !l.optOut } : l
            )
        );
    }

    useEffect(() => {
        if (intervalRef.current) clearInterval(intervalRef.current);
        if (!control.playing) return;

        const BASE_MS = 3000 / control.speed;
        intervalRef.current = setInterval(() => {
            tickRef.current += 1;
            const t = tickRef.current;
            setTick(t);

            setLearners((prev) =>
                prev.map((learner) => {
                    const features = simulateFeatures(learner.profile, control.scenario, t);
                    const state = detectState(features);
                    // Randomly change activity
                    const activity =
                        t % 20 === 0
                            ? ACTIVITIES[Math.floor(Math.random() * ACTIVITIES.length)]
                            : learner.currentActivity;
                    const isInQuiz = activity.toLowerCase().includes('quiz');
                    return { ...learner, features, state, currentActivity: activity, isInQuiz };
                })
            );
        }, BASE_MS);

        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
        };
    }, [control.playing, control.speed, control.scenario]);

    // Check for intervention for the current learner
    useEffect(() => {
        if (!control.playing || activeIntervention) return;
        const currentLearner = learners.find((l) => l.id === currentLearnerId);
        if (!currentLearner) return;

        const intervention = decideIntervention(currentLearner);
        if (intervention) {
            setActiveIntervention(intervention);
            setLearners((prev) =>
                prev.map((l) =>
                    l.id === currentLearnerId
                        ? {
                            ...l,
                            lastIntervention: Date.now(),
                            interventionCount: l.interventionCount + 1,
                        }
                        : l
                )
            );
        }
    }, [tick, currentLearnerId, control.playing]);

    const currentLearner =
        learners.find((l) => l.id === currentLearnerId) ?? learners[0];

    return (
        <SimContext.Provider
            value={{
                learners,
                currentLearner,
                activeIntervention,
                interventionHistory,
                control,
                tick,
                consentGiven,
                setConsentGiven,
                setControl,
                dismissIntervention,
                setCurrentLearnerId,
                toggleOptOut,
            }}
        >
            {children}
        </SimContext.Provider>
    );
}

export function useSim(): SimStore {
    const ctx = useContext(SimContext);
    if (!ctx) throw new Error('useSim must be inside SimulationProvider');
    return ctx;
}
