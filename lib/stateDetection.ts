import {
    LearnerFeatures,
    LearnerState,
    StateLevel,
    LearnerProfile,
    SimulatedLearner,
} from './types';

// ─── Feature extraction ──────────────────────────────────────────────────────
function levelFrom(value: number, thresholds: [number, number]): StateLevel {
    if (value <= thresholds[0]) return 'low';
    if (value <= thresholds[1]) return 'medium';
    return 'high';
}

/** Rule-based inference: features → learner state */
export function detectState(features: LearnerFeatures): LearnerState {
    const { timeSinceLastAction, retryCount, navigationSpeed, inactivityStreak, errorRate } = features;

    // Cognitive Load: driven by retries, errors, slow pace
    let clScore = 0;
    if (retryCount > 3) clScore += 2;
    else if (retryCount > 1) clScore += 1;
    if (errorRate > 0.5) clScore += 2;
    else if (errorRate > 0.25) clScore += 1;
    if (timeSinceLastAction > 120) clScore += 1;
    const cognitiveLoad = clScore >= 4 ? 'high' : clScore >= 2 ? 'medium' : 'low';

    // Attention: driven by inactivity, very fast navigation (skipping)
    let attScore = 0;
    if (inactivityStreak > 90) attScore += 3;
    else if (inactivityStreak > 45) attScore += 1;
    if (navigationSpeed > 6) attScore += 2; // skipping too fast
    else if (navigationSpeed > 3) attScore += 1;
    const attention =
        attScore >= 3 ? 'low' : attScore >= 1 ? 'medium' : 'high';

    // Motivation: driven by retries + inactivity combo + session time
    let motScore = 0;
    if (retryCount > 5 && timeSinceLastAction > 120) motScore += 3;
    else if (retryCount > 2 && inactivityStreak > 60) motScore += 2;
    else if (retryCount > 1) motScore += 1;
    const motivation =
        motScore >= 3 ? 'low' : motScore >= 1 ? 'medium' : 'high';

    // Confidence: certainty of signal
    const certaintyFactors = [
        retryCount > 0 ? 0.2 : 0,
        inactivityStreak > 0 ? 0.15 : 0,
        errorRate > 0 ? 0.2 : 0,
    ].reduce((a, b) => a + b, 0.5);
    const confidence = Math.min(0.95, Math.max(0.45, certaintyFactors));

    return { cognitiveLoad, attention, motivation, confidence, timestamp: Date.now() };
}

// ─── Profile-based feature simulation ───────────────────────────────────────
const BASE_FEATURES: Record<LearnerProfile, LearnerFeatures> = {
    focused: {
        timeSinceLastAction: 10,
        retryCount: 0,
        navigationSpeed: 1.5,
        inactivityStreak: 5,
        sessionDuration: 20,
        errorRate: 0.05,
    },
    overloaded: {
        timeSinceLastAction: 130,
        retryCount: 5,
        navigationSpeed: 0.5,
        inactivityStreak: 20,
        sessionDuration: 45,
        errorRate: 0.6,
    },
    distracted: {
        timeSinceLastAction: 5,
        retryCount: 1,
        navigationSpeed: 7,
        inactivityStreak: 100,
        sessionDuration: 30,
        errorRate: 0.2,
    },
    disengaged: {
        timeSinceLastAction: 200,
        retryCount: 6,
        navigationSpeed: 1,
        inactivityStreak: 80,
        sessionDuration: 60,
        errorRate: 0.4,
    },
};

/** Add realistic noise to simulate natural variation */
function jitter(val: number, range: number): number {
    return Math.max(0, val + (Math.random() - 0.5) * range * 2);
}

export function simulateFeatures(
    profile: LearnerProfile,
    scenario: string,
    tick: number
): LearnerFeatures {
    const base = { ...BASE_FEATURES[profile] };

    // Scenario overrides
    if (scenario === 'overload') {
        base.retryCount += 4;
        base.errorRate = Math.min(1, base.errorRate + 0.3);
        base.timeSinceLastAction += 60;
    } else if (scenario === 'distraction') {
        base.inactivityStreak += 60;
        base.navigationSpeed += 4;
    } else if (scenario === 'disengagement') {
        base.retryCount += 3;
        base.inactivityStreak += 40;
        base.timeSinceLastAction += 80;
    }

    // Add sin-wave oscillation to make gauges feel alive
    const wave = Math.sin(tick * 0.1) * 0.3;

    return {
        timeSinceLastAction: jitter(base.timeSinceLastAction + wave * 20, 15),
        retryCount: Math.round(jitter(base.retryCount, 1)),
        navigationSpeed: jitter(base.navigationSpeed + wave * 0.5, 0.5),
        inactivityStreak: jitter(base.inactivityStreak + wave * 10, 10),
        sessionDuration: base.sessionDuration + tick * 0.5,
        errorRate: Math.min(1, Math.max(0, jitter(base.errorRate + wave * 0.05, 0.05))),
    };
}

export function stateLevelToNumber(level: StateLevel): number {
    return level === 'low' ? 0.2 : level === 'medium' ? 0.55 : 0.9;
}
