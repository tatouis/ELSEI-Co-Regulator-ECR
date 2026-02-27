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

// Score from 0 to 10
function calculateInterventionPriority(learner: SimulatedLearner): number {
    let score = 0;

    // Risk factors
    if (learner.state.cognitiveLoad === 'high') score += 4;
    else if (learner.state.cognitiveLoad === 'medium') score += 1;

    if (learner.state.attention === 'low') score += 4;
    else if (learner.state.attention === 'medium') score += 1;

    if (learner.state.motivation === 'low') score += 3;

    // Time since last intervention modifier (urgency increases over time if state is bad)
    if (learner.lastIntervention) {
        const minsSince = (Date.now() - learner.lastIntervention) / 60000;
        if (minsSince > 15) score += 2;
        else if (minsSince < 5) score -= 5; // Suppress if very recent
    }

    return score;
}

export function decideIntervention(
    learner: SimulatedLearner
): Intervention | null {
    const { state, isInQuiz, optOut, lastIntervention, id, features } = learner;
    const now = Date.now();

    // Workflow protection & Safety rules
    if (optOut) return null;
    if (isInQuiz) return null;

    // Prevent interrupting rapid interaction bursts (high navigation speed)
    if (features.navigationSpeed > 10) return null;

    // Rate limiting (max 1 per 5 mins)
    if (lastIntervention && now - lastIntervention < 5 * 60 * 1000) return null;

    // Check Priority
    const priority = calculateInterventionPriority(learner);
    if (priority < 5) return null; // Threshold

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
