import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { userId, state, features } = body;

    if (!userId || !state) {
      return NextResponse.json({ error: 'Missing userId or state' }, { status: 400 });
    }

    const saved = await prisma.learnerState.create({
      data: {
        userId,
        cognitiveLoad: state.cognitiveLoad,
        attention: state.attention,
        motivation: state.motivation,
        confidence: state.confidence,
        timeSinceLastSec: features?.timeSinceLastAction || 0,
        inactivityStreak: features?.inactivityStreak || 0,
        navSpeedPgMin: features?.navigationSpeed || 0,
        retries: features?.retryCount || 0,
        errorRatePct: (features?.errorRate || 0) * 100,
      }
    });

    return NextResponse.json({ success: true, id: saved.id });
  } catch (error: any) {
    console.error('Learner State Sync API error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
