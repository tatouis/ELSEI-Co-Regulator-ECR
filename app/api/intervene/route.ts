import { NextResponse } from 'next/server';
import { GoogleGenerativeAI, Schema, SchemaType } from '@google/generative-ai';
import { prisma } from '@/lib/prisma';

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

        // 1. Fetch Prompts from DB (falling back to constants if missing)
        const configs = await prisma.systemConfig.findMany({
            where: { key: { in: ['intervene_system_instruction', 'intervene_developer_prompt'] } }
        });
        
        let systemInstruction = configs.find(c => c.key === 'intervene_system_instruction')?.value || 
            `You are ECR, an AI pedagogical co-regulator for higher education...`; // Original text as fallback

        let rawDevPrompt = configs.find(c => c.key === 'intervene_developer_prompt')?.value || 
            `DEVELOPER PROMPT...`; // Original text as fallback

        // 2. Prepare Context for Prompt
        const p = policyDecision;
        const c = context;
        const l = c.last60s;
        const s = c.currentState;

        // Simple placeholder replacement
        const developerPrompt = rawDevPrompt
            .replace('{{interventionType}}', String(p.interventionType))
            .replace('{{quizActive}}', String(p.quizActive))
            .replace('{{studentOptedOut}}', String(p.studentOptedOut))
            .replace('{{cooldownRemainingSec}}', String(p.cooldownRemainingSec))
            .replace('{{moduleCode}}', String(c.moduleCode || 'M112'))
            .replace('{{moduleTitle}}', String(c.moduleTitle || ''))
            .replace('{{activityType}}', String(c.activityType || 'reading'))
            .replace('{{timeSinceLastActionSec}}', String(l.timeSinceLastActionSec))
            .replace('{{inactivityStreakSec}}', String(l.inactivityStreakSec))
            .replace('{{navSpeedPgPerMin}}', String(l.navSpeedPgPerMin))
            .replace('{{retries}}', String(l.retries))
            .replace('{{errorRatePct}}', String(l.errorRatePct))
            .replace('{{CL}}', String(s.CL))
            .replace('{{ATT}}', String(s.ATT))
            .replace('{{MOT}}', String(s.MOT))
            .replace('{{confidence}}', String(s.confidence));

        const model = dynamicGenAI.getGenerativeModel({
            model: 'gemini-2.0-flash',
            systemInstruction: systemInstruction,
        });

        const result = await model.generateContent({
            contents: [{ role: 'user', parts: [{ text: developerPrompt }] }],
            generationConfig: {
                responseMimeType: "application/json",
                responseSchema: interventionSchema,
                temperature: 0.2,
            }
        });
        const text = result.response.text();
        const aiResponse = JSON.parse(text);

        // 3. Log to DB (only if showing intervention)
        let interventionId = undefined;
        if (aiResponse.action === 'SHOW_INTERVENTION') {
            const saved = await prisma.intervention.create({
                data: {
                    userId: body.userId || null, 
                    action: aiResponse.action,
                    interventionType: aiResponse.interventionType,
                    message: aiResponse.message,
                    whyThis: aiResponse.whyThis,
                    suggestedNextStep: aiResponse.suggestedNextStep || 'none',
                    quizActive: !!p.quizActive,
                    studentOptedOut: !!p.studentOptedOut,
                    cooldownRemaining: p.cooldownRemainingSec || 0,
                }
            });
            interventionId = saved.id;
        }

        return NextResponse.json({ ...aiResponse, id: interventionId });

    } catch (err: any) {
        console.error('Gemini Intervention API error:', err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
