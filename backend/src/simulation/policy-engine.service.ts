import { Injectable } from '@nestjs/common';

export type InterventionType =
    | 'pacing_suggestion'
    | 'reflective_prompt'
    | 'task_reframing'
    | 'encouragement'
    | 'help_routing';

@Injectable()
export class PolicyEngineService {
    decide(learner: any): InterventionType | null {
        if (learner.optOut || learner.isInQuiz) return null;

        // Simplified logic for backend demo
        const { state } = learner;

        if (state.cognitiveLoad === 'high' && state.motivation === 'low') {
            return 'help_routing';
        } else if (state.cognitiveLoad === 'high') {
            return 'pacing_suggestion';
        } else if (state.attention === 'low') {
            return 'reflective_prompt';
        } else if (state.motivation === 'low') {
            return 'encouragement';
        }

        return null;
    }
}
