import { Injectable, OnModuleInit } from '@nestjs/common';
import { StateDetectionService, LearnerFeatures } from './state-detection.service';
import { LearnerStore } from '../learner/learner.store';
import { EventsGateway } from '../events/events.gateway';

@Injectable()
export class SimulationService implements OnModuleInit {
    private tick = 0;

    constructor(
        private readonly learnerStore: LearnerStore,
        private readonly stateDetection: StateDetectionService,
        private readonly eventsGateway: EventsGateway,
    ) { }

    onModuleInit() {
        this.startSimulation();
    }

    private startSimulation() {
        setInterval(() => {
            this.tick++;
            this.updateLearners();
        }, 5000); // Update every 5 seconds for the backend simulation
    }

    private updateLearners() {
        const learners = this.learnerStore.getAll();
        learners.forEach((learner) => {
            const features = this.generateMockFeatures(learner);
            const state = this.stateDetection.detect(features);

            this.learnerStore.update(learner.id, { state, features });

            this.eventsGateway.broadcast('learnerUpdate', {
                id: learner.id,
                state,
                features,
            });
        });
    }

    private generateMockFeatures(learner: any): LearnerFeatures {
        // Basic oscillation/noise logic
        const wave = Math.sin(this.tick * 0.1);

        // Default base features
        let baseFeatures = {
            timeSinceLastAction: 10 + wave * 5,
            retryCount: 0,
            navigationSpeed: 1.5 + wave * 0.2,
            inactivityStreak: 5,
            sessionDuration: 20,
            errorRate: 0.05,
        };

        // Profile specific behavior
        if (learner.profile === 'overloaded') {
            baseFeatures.retryCount = 4 + (wave > 0 ? 1 : 0);
            baseFeatures.errorRate = 0.5 + wave * 0.1;
        } else if (learner.profile === 'distracted') {
            baseFeatures.inactivityStreak = 60 + wave * 20;
        }

        return baseFeatures;
    }
}
