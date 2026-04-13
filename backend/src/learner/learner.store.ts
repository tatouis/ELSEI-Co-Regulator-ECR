import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

export type LearnerProfile = 'focused' | 'overloaded' | 'distracted' | 'disengaged';

export interface LearnerState {
    cognitiveLoad: 'low' | 'medium' | 'high';
    attention: 'low' | 'medium' | 'high';
    motivation: 'low' | 'medium' | 'high';
    confidence: number;
    timestamp: number;
}

export interface Learner {
    id: string;
    name: string;
    profile: LearnerProfile;
    state: LearnerState;
    features: any;
    currentActivity: string;
    interventionCount: number;
}

@Injectable()
export class LearnerStore implements OnModuleInit {
    private learners: Map<string, Learner> = new Map();

    constructor(private prisma: PrismaService) { }

    async onModuleInit() {
        await this.seed();
    }

    private async seed() {
        // Fallback names in case DB query fails or returns empty
        const FALLBACK_NAMES = [
            'Amina Benali', 'Youssef El Fassi', 'Fatima Zahra Alaoui', 'Omar Tahiri',
            'Nadia Bouzid', 'Rachid Cherkaoui', 'Salma Mourtada', 'Hamza Errachidi'
        ];
        const PROFILES: LearnerProfile[] = ['focused', 'overloaded', 'distracted', 'disengaged'];

        try {
            const students = await this.prisma.user.findMany({
                where: { role: 'STUDENT' },
            });

            if (students.length > 0) {
                students.forEach((student, i) => {
                    const id = student.id;
                    this.learners.set(id, {
                        id,
                        name: student.displayName,
                        profile: PROFILES[i % 4],
                        state: {
                            cognitiveLoad: 'low',
                            attention: 'high',
                            motivation: 'high',
                            confidence: 0.9,
                            timestamp: Date.now(),
                        },
                        features: {},
                        currentActivity: 'General Introduction',
                        interventionCount: 0,
                    });
                });
                return;
            }
        } catch (error) {
            console.error('Failed to load students from DB for LearnerStore, using fallback:', error);
        }

        // Fallback
        FALLBACK_NAMES.forEach((name, i) => {
            const id = String(i + 1);
            this.learners.set(id, {
                id,
                name,
                profile: PROFILES[i % 4],
                state: {
                    cognitiveLoad: 'low',
                    attention: 'high',
                    motivation: 'high',
                    confidence: 0.9,
                    timestamp: Date.now(),
                },
                features: {},
                currentActivity: 'General Introduction',
                interventionCount: 0,
            });
        });
    }

    getAll(): Learner[] {
        return Array.from(this.learners.values());
    }

    getById(id: string): Learner | undefined {
        return this.learners.get(id);
    }

    update(id: string, update: Partial<Learner>) {
        const learner = this.learners.get(id);
        if (learner) {
            this.learners.set(id, { ...learner, ...update });
        }
    }
}
