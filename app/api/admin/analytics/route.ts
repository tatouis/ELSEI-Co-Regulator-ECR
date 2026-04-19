import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    // 1. Intervention Success Rate
    const interventions = await prisma.intervention.groupBy({
      by: ['reaction'],
      _count: { _all: true },
    });

    const successData = [
      { name: 'Accepted', value: interventions.find(i => i.reaction === 'ACCEPTED')?._count._all || 0 },
      { name: 'Dismissed', value: interventions.find(i => i.reaction === 'DISMISSED')?._count._all || 0 },
      { name: 'Pending', value: interventions.find(i => !i.reaction || i.reaction === 'PENDING')?._count._all || 0 },
    ];

    // 2. Activity / Cognitive Load over time (Simple average per hour)
    // For a real heatmap, we'd group by hour. In this simulation, we'll just take the last 24 records.
    const states = await prisma.learnerState.findMany({
      take: 50,
      orderBy: { timestamp: 'desc' },
      select: {
          timestamp: true,
          cognitiveLoad: true,
          attention: true,
          motivation: true,
      }
    });

    const levelToNum = (lvl: string) => lvl === 'high' ? 3 : lvl === 'medium' ? 2 : 1;

    const heatmapData = states.reverse().map(s => ({
      time: new Date(s.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      CL: levelToNum(s.cognitiveLoad),
      ATT: levelToNum(s.attention),
      MOT: levelToNum(s.motivation)
    }));

    return NextResponse.json({
      successData,
      heatmapData
    });

  } catch (error: any) {
    console.error('Analytics API error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
