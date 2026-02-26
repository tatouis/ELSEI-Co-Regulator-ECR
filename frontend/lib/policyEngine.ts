import {
    LearnerState,
    Intervention,
    InterventionType,
    SimulatedLearner,
} from './types';

// ─── Intervention content library ───────────────────────────────────────────
const INTERVENTIONS: Record<InterventionType, { title: string; messages: string[]; reason: string }> = {
    pacing_suggestion: {
        title: '⏸️ Take a Moment',
        messages: [
            "You've been working intensely. A 3-minute break could help consolidate what you've learned.",
            'Consider reviewing your notes before moving to the next section.',
            'You seem to be tackling a complex part. Try slowing down and focusing on one concept at a time.',
        ],
        reason:
            'The system detected signs of cognitive overload (multiple retries, slow progress). A pacing pause may help.',
    },
    reflective_prompt: {
        title: '💭 Reflect',
        messages: [
            "Before continuing, can you summarize in one sentence what you've just learned?",
            "What's one thing from this section that you're still unsure about?",
            "How does this material connect to what you already know?",
        ],
        reason:
            'Your engagement with the material appeared to drift. A reflective pause supports deeper processing.',
    },
    task_reframing: {
        title: '🔄 Try a Different Approach',
        messages: [
            "If you're stuck, try explaining the concept as if teaching a classmate.",
            'Consider approaching this from the examples first, then the theory.',
            "Break the problem into smaller steps. What's the very first thing you need to know?",
        ],
        reason:
            'Repeated attempts on the same content may signal a need for a different learning strategy.',
    },
    encouragement: {
        title: "🌟 You're Doing Great",
        messages: [
            "Learning is challenging, and you're still here — that takes real dedication.",
            "Progress isn't always linear.Every attempt builds understanding, even when it's hard.",
            "You've already come this far. Keep going — you have what it takes.",
        ],
        reason:
            'Motivation indicators suggested you might benefit from a positive signal to keep going.',
    },
    help_routing: {
        title: '🤝 Get Support',
        messages: [
            "It looks like you might need some help here. Your instructor's office hours are available.",
            "The course forum has active discussions on this topic — a peer question might speed things up.",
            "Consider reaching out: sometimes a quick conversation unlocks what feels stuck.",
        ],
        reason:
            'Difficulty indicators suggest this might go beyond what self-regulation alone can address. External support may help.',
    },
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
        message: pickRandom(template.messages),
        reason: template.reason,
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
