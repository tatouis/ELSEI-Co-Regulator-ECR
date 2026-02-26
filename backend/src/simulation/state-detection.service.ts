import { Injectable, OnModuleInit } from '@nestjs/common';
import { LearnerStore } from '../learner/learner.store';

export type StateLevel = 'low' | 'medium' | 'high';

export interface LearnerState {
    cognitiveLoad: StateLevel;
    attention: StateLevel;
    motivation: StateLevel;
    confidence: number;
    timestamp: number;
}

export interface LearnerFeatures {
    timeSinceLastAction: number;
    retryCount: number;
    navigationSpeed: number;
    inactivityStreak: number;
    sessionDuration: number;
    errorRate: number;
}

@Injectable()
export class StateDetectionService {
    /** Rule-based learner state inference */
    detect(features: LearnerFeatures): LearnerState {
        const { timeSinceLastAction, retryCount, navigationSpeed, inactivityStreak, errorRate } = features;

        let clScore = 0;
        if (retryCount > 3) clScore += 2;
        else if (retryCount > 1) clScore += 1;
        if (errorRate > 0.5) clScore += 2;
        else if (errorRate > 0.25) clScore += 1;
        if (timeSinceLastAction > 120) clScore += 1;
        const cognitiveLoad: StateLevel = clScore >= 4 ? 'high' : clScore >= 2 ? 'medium' : 'low';

        let attScore = 0;
        if (inactivityStreak > 90) attScore += 3;
        else if (inactivityStreak > 45) attScore += 1;
        if (navigationSpeed > 6) attScore += 2;
        else if (navigationSpeed > 3) attScore += 1;
        const attention: StateLevel = attScore >= 3 ? 'low' : attScore >= 1 ? 'medium' : 'high';

        let motScore = 0;
        if (retryCount > 5 && timeSinceLastAction > 120) motScore += 3;
        else if (retryCount > 2 && inactivityStreak > 60) motScore += 2;
        else if (retryCount > 1) motScore += 1;
        const motivation: StateLevel = motScore >= 3 ? 'low' : motScore >= 1 ? 'medium' : 'high';

        const confidence = Math.min(0.95, Math.max(0.45, 0.5 + (retryCount > 0 ? 0.2 : 0) + (errorRate > 0 ? 0.2 : 0)));

        return { cognitiveLoad, attention, motivation, confidence, timestamp: Date.now() };
    }
}
