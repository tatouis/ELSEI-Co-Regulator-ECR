import {
    LearnerState,
    Intervention,
    InterventionType,
    SimulatedLearner,
} from './types';

// ─── Intervention content library ───────────────────────────────────────────
const INTERVENTIONS: Record<InterventionType, { title: string; insight: string; actionGuidance: string[]; buttons: string[] }> = {
    pacing_suggestion: {
        title: 'Cognitive Load Alert',
        insight: 'You’ve been working intensively on this step for a while, which may indicate a high mental workload.',
        actionGuidance: [
            'Break the task into smaller steps',
            'Review the previous concept briefly',
            'Take a short 2-minute pause',
            'Focus on the main objective of this activity'
        ],
        buttons: ['Show next small step', 'Take a short break', 'Continue anyway']
    },
    reflective_prompt: {
        title: 'Focus Support',
        insight: 'Your interaction pattern suggests your attention may be drifting.',
        actionGuidance: [
            'Restate the goal of this activity in one sentence',
            'Remove potential distractions',
            'Try the quick checkpoint below'
        ],
        buttons: ['Refocus now', 'Continue']
    },
    task_reframing: {
        title: 'Try a Different Approach',
        insight: 'Repeated attempts on the same content may signal a need for a different learning strategy.',
        actionGuidance: [
            'If you\'re stuck, try explaining the concept as if teaching a classmate.',
            'Consider approaching this from the examples first, then the theory.',
            'Break the problem into smaller steps. What\'s the very first thing you need to know?'
        ],
        buttons: ['View example', 'Continue']
    },
    encouragement: {
        title: 'Motivation Support',
        insight: 'Your recent activity level has decreased slightly. A small adjustment may help you progress.',
        actionGuidance: [
            'Choose a smaller starting step',
            'Try a quick success activity',
            'Review how this task connects to your learning goals'
        ],
        buttons: ['Start small step', 'View learning goal', 'Continue']
    },
    help_routing: {
        title: 'Get Support',
        insight: 'Difficulty indicators suggest this might go beyond what self-regulation alone can address.',
        actionGuidance: [
            'It looks like you might need some help here. Your instructor\'s office hours are available.',
            'The course forum has active discussions on this topic.',
            'Consider reaching out: sometimes a quick conversation unlocks what feels stuck.'
        ],
        buttons: ['View forum', 'Ask instructor']
    }
};

function pickRandom<T>(arr: T[]): T {
    return arr[Math.floor(Math.random() * arr.length)];
}

function generateId(): string {
    return Math.random().toString(36).substring(2, 10);
}

// ─── Decision engine ─────────────────────────────────────────────────────────
export function decideIntervention(
    learner: SimulatedLearner
): Intervention | null {
    const { state, isInQuiz, optOut, lastIntervention, id } = learner;
    const now = Date.now();

    // Safety rules
    if (optOut) return null;
    if (isInQuiz) return null;
    if (lastIntervention && now - lastIntervention < 5 * 60 * 1000) return null;

    // State mapping → intervention type
    let type: InterventionType | null = null;

    if (state.cognitiveLoad === 'high' && state.motivation === 'low') {
        type = 'help_routing';
    } else if (state.cognitiveLoad === 'high') {
        type = 'pacing_suggestion';
    } else if (state.attention === 'low') {
        type = 'reflective_prompt';
    } else if (state.motivation === 'low') {
        type = 'encouragement';
    } else if (state.cognitiveLoad === 'medium' && state.attention === 'medium') {
        type = 'task_reframing';
    }

    if (!type) return null;

    const template = INTERVENTIONS[type];
    return {
        id: generateId(),
        type,
        title: template.title,
        insight: template.insight,
        actionGuidance: template.actionGuidance,
        buttons: template.buttons,
        timestamp: now,
        dismissed: false,
        learnerId: id,
    };
}

export function interventionTypeLabel(type: InterventionType): string {
    return {
        pacing_suggestion: 'Pacing Suggestion',
        reflective_prompt: 'Reflective Prompt',
        task_reframing: 'Task Reframing',
        encouragement: 'Encouragement',
        help_routing: 'Help Routing',
    }[type];
}
