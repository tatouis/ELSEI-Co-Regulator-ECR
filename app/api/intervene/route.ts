import { NextResponse } from 'next/server';
import { GoogleGenerativeAI, Schema, SchemaType } from '@google/generative-ai';

const apiKey = process.env.GEMINI_API_KEY;
const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;

// JSON Schema definition for Gemini Structured Outputs
const interventionSchema: Schema = {
    type: SchemaType.OBJECT,
    properties: {
        action: {
            type: SchemaType.STRING,
            format: "enum",
            enum: ["SHOW_INTERVENTION", "NO_OP"],
            description: "Whether to intervene or not."
        },
        interventionType: {
            type: SchemaType.STRING,
            format: "enum",
            enum: ["pacing_suggestion", "reflective_prompt", "task_reframing", "encouragement", "help_routing", "none"],
            description: "The targeted strategy for the current learner state."
        },
        message: { type: SchemaType.STRING, description: "At most 2 short sentences. Supportive and non-judgmental." },
        whyThis: { type: SchemaType.STRING, description: "Short explanation referencing 1-2 behavioral signals." },
        suggestedNextStep: {
            type: SchemaType.STRING,
            format: "enum",
            enum: ["dismiss", "snooze_5m", "open_forum", "contact_teacher", "take_break_2m", "review_goals", "none"]
        }
    },
    required: ["action", "interventionType", "message", "whyThis", "suggestedNextStep"]
};

export async function POST(req: Request) {
    try {
        const customKey = req.headers.get('x-gemini-key');
        const localKey = customKey || apiKey;
        const dynamicGenAI = localKey ? new GoogleGenerativeAI(localKey) : genAI;

        const body = await req.json();
        const { policyDecision, context } = body;

        // Check if the API key is configured. If not, return a fallback default so the app does not break locally without keys.
        if (!dynamicGenAI) {
            console.warn('No GEMINI_API_KEY set. Returning a fallback structured text.');
            if (policyDecision.action === 'NO_OP') {
                return NextResponse.json({ action: 'NO_OP', message: 'No action needed fallback' });
            }
            return NextResponse.json({
                action: 'SHOW_INTERVENTION',
                interventionType: policyDecision.interventionType,
                message: 'This is a local fallback message (no API key configured). You seem to be working hard.',
                whyThis: 'Fallback insight: We noticed some activity changes.',
                suggestedNextStep: 'dismiss',
            });
        }

        const model = dynamicGenAI.getGenerativeModel({
            model: 'gemini-2.0-flash',
            systemInstruction: `You are ECR, an AI pedagogical co-regulator for higher education.
You MUST NOT generate learning content, explanations, or answers to course material.
Your only job is to phrase short, supportive, metacognitive micro-interventions.

Rules:
- You only phrase the message for an intervention type already decided by the policy engine.
- Keep it non-intrusive: max 2 short sentences.
- Always respectful, autonomy-supportive, never judgmental.
- Always include a brief "why" explanation referencing only behavioral signals (not personal traits).
- Never mention sensitive data or speculation.
- If context indicates a quiz is active, respond with a NO_OP payload.`,
            generationConfig: {
                responseMimeType: "application/json",
                responseSchema: interventionSchema,
                temperature: 0.2, // Low temperature for deterministic/safe output
            }
        });

        const developerPrompt = `DEVELOPER PROMPT
Policy decision:
- interventionType: ${policyDecision.interventionType}
- quizActive: ${policyDecision.quizActive}
- studentOptedOut: ${policyDecision.studentOptedOut}
- cooldownRemainingSec: ${policyDecision.cooldownRemainingSec}

Context:
- moduleCode: ${context.moduleCode || 'M112'}
- moduleTitle: ${context.moduleTitle || 'Unknown'}
- activityType: ${context.activityType || 'reading'}
- last60s: timeSinceLastActionSec=${context.last60s.timeSinceLastActionSec}, inactivityStreakSec=${context.last60s.inactivityStreakSec}, navSpeedPgPerMin=${context.last60s.navSpeedPgPerMin}, retries=${context.last60s.retries}, errorRatePct=${context.last60s.errorRatePct}
- currentState: CL=${context.currentState.CL}, ATT=${context.currentState.ATT}, MOT=${context.currentState.MOT}, confidence=${context.currentState.confidence}

Task:
If quizActive OR studentOptedOut OR cooldownRemainingSec>0:
Return action=NO_OP with interventionType=none and empty message, whyThis="".
Else:
Return action=SHOW_INTERVENTION, use the interventionType exactly as provided.
Keep message <= 240 characters.
whyThis must reference 1-2 signals (e.g. inactivity, retries, error rate) in plain language.`;

        const result = await model.generateContent(developerPrompt);
        const text = result.response.text();

        return NextResponse.json(JSON.parse(text));

    } catch (err: any) {
        console.error('Gemini Intervention API error:', err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
