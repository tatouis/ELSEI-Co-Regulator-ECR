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

const INITIAL_LEARNERS: SimulatedLearner[] = LEARNER_NAMES.map((name, i) => ({
    id: String(i + 1),
    name,
    profile: PROFILES[i % 4],
    avatar: name.charAt(0).toUpperCase(),
    state: { cognitiveLoad: 'low', attention: 'high', motivation: 'high', confidence: 0.8, timestamp: Date.now() },
    features: {
        timeSinceLastAction: 0,
        inactivityStreak: 0,
        navigationSpeed: 0,
        retryCount: 0,
        errorRate: 0,
        sessionDuration: 0,
    },
    currentActivity: ACTIVITIES[0],
    isInQuiz: false,
    optOut: false,
    lastIntervention: null,
    interventionCount: 0,
    sessionStart: 1740687000000,
}));

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
    user: any | null;
    login: (u: string, p: string) => Promise<boolean>;
    logout: () => void;
    isGeminiConfigured: boolean;
    refreshMoodleData: () => Promise<void>;
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
        playing: true,
        profile: 'overloaded',
        scenario: 'normal',
        speed: 1,
    });
    const [user, setUser] = useState<any | null>(null);
    const [isGeminiConfigured, setIsGeminiConfigured] = useState(false);

    const refreshMoodleData = async () => {
        const storedUser = localStorage.getItem('ecr_user');
        const parsedUser = storedUser ? JSON.parse(storedUser) : null;
        const prefix = parsedUser?.username ? `_${parsedUser.username}` : '';
        
        const url = localStorage.getItem(`moodle_url${prefix}`) || localStorage.getItem('moodle_url');
        const token = localStorage.getItem(`moodle_token${prefix}`) || localStorage.getItem('moodle_token');
        if (url && token) {
            try {
                const res = await fetch(`/api/moodle/sync?url=${encodeURIComponent(url)}&token=${token}`);
                const data = await res.json();
                if (data.users && Array.isArray(data.users)) {
                    // Inject real Moodle names directly into the simulation while adapting them
                    let syncedLearners = data.users.map((u: any, i: number) => ({
                        ...INITIAL_LEARNERS[i % INITIAL_LEARNERS.length],
                        id: String(u.id),
                        name: u.name,
                        avatar: u.avatar || u.name.charAt(0).toUpperCase()
                    }));
                    setLearners(syncedLearners);
                    setCurrentLearnerId(syncedLearners[0].id);
                } else {
                    console.error("Moodle sync format unexpected:", data);
                }
            } catch (error) {
                console.error("Failed to fetch Moodle users:", error);
            }
        } else {
            setLearners(INITIAL_LEARNERS);
            setCurrentLearnerId(INITIAL_LEARNERS[0].id);
        }
    };

    useEffect(() => {
        const storedUser = localStorage.getItem('ecr_user');
        if (storedUser) setUser(JSON.parse(storedUser));

        const parsedUser = storedUser ? JSON.parse(storedUser) : null;
        const prefix = parsedUser?.username ? `_${parsedUser.username}` : '';

        // Check if Gemini is configured (locally or via env)
        const localKey = localStorage.getItem(`gemini_api_key${prefix}`) || localStorage.getItem('gemini_api_key');
        setIsGeminiConfigured(!!localKey);

        // Initial Moodle Sync
        refreshMoodleData();
    }, []);

    const login = async (u: string, p: string) => {
        try {
            const res = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username: u, password: p })
            });

            if (res.ok) {
                const data = await res.json();
                if (data.success && data.user) {
                    setUser(data.user);
                    localStorage.setItem('ecr_user', JSON.stringify(data.user));
                    return true;
                }
            }
            return false;
        } catch (error) {
            console.error('Login connection error:', error);
            // Fallback for simulation mode if backend is not running
            if (p === '3@6A9#ExMvsO4G' || p === 'Sz2&S4NSoQd$jN' || p === 'password') {
                const userData = { username: u, role: u.includes('instructor') ? 'instructor' : 'student' };
                setUser(userData);
                localStorage.setItem('ecr_user', JSON.stringify(userData));
                return true;
            }
            return false;
        }
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('ecr_user');
    };

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
            // Lock out further triggers for this learner immediately
            setLearners((prev) =>
                prev.map((l) =>
                    l.id === currentLearnerId
                        ? { ...l, lastIntervention: Date.now() }
                        : l
                )
            );

            
            const storedUser = localStorage.getItem('ecr_user');
            const parsedUser = storedUser ? JSON.parse(storedUser) : null;
            const prefix = parsedUser?.username ? `_${parsedUser.username}` : '';
            const customGeminiKey = localStorage.getItem(`gemini_api_key${prefix}`) || localStorage.getItem('gemini_api_key') || '';
            const headers: Record<string, string> = { 'Content-Type': 'application/json' };
            if (customGeminiKey) headers['X-Gemini-Key'] = customGeminiKey;

            fetch('/api/intervene', {
                method: 'POST',
                headers,
                body: JSON.stringify({
                    policyDecision: {
                        interventionType: intervention.type,
                        quizActive: currentLearner.isInQuiz,
                        studentOptedOut: currentLearner.optOut,
                        cooldownRemainingSec: 0,
                    },
                    context: {
                        moduleCode: currentLearner.currentActivity,
                        last60s: {
                            timeSinceLastActionSec: currentLearner.features.timeSinceLastAction,
                            inactivityStreakSec: currentLearner.features.inactivityStreak,
                            navSpeedPgPerMin: currentLearner.features.navigationSpeed,
                            retries: currentLearner.features.retryCount,
                            errorRatePct: currentLearner.features.errorRate,
                        },
                        currentState: {
                            CL: currentLearner.state.cognitiveLoad,
                            ATT: currentLearner.state.attention,
                            MOT: currentLearner.state.motivation,
                            confidence: currentLearner.state.confidence,
                        }
                    }
                })
            })
                .then(res => res.json())
                .then(data => {
                    if (data.action === 'SHOW_INTERVENTION' || data.action === 'NO_OP') {
                        // Update our intervention text with AI generated one if available
                        const finalIntervention = {
                            ...intervention,
                            insight: data.message ? `${data.message} ${data.whyThis ? `(${data.whyThis})` : ''}` : intervention.insight
                        };
                        setActiveIntervention(finalIntervention);
                        setLearners((prev) =>
                            prev.map((l) =>
                                l.id === currentLearnerId
                                    ? { ...l, interventionCount: l.interventionCount + 1 }
                                    : l
                            )
                        );
                    }
                })
                .catch(err => {
                    console.error("Gemini API error, falling back to static", err);
                    setActiveIntervention(intervention);
                    setLearners((prev) =>
                        prev.map((l) =>
                            l.id === currentLearnerId
                                ? { ...l, interventionCount: l.interventionCount + 1 }
                                : l
                        )
                    );
                });
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
                user,
                login,
                logout,
                isGeminiConfigured,
                refreshMoodleData
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
