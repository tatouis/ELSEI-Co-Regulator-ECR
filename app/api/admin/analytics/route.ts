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

    // 2. Heatmap Data (Cognitive Load / Attention Trends)
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

    // 3. NEW: Student Activity Intelligence (Time of Use & Interactions)
    const activityStats = await prisma.learnerState.groupBy({
      by: ['userId'],
      _count: { _all: true },
    });

    const userDetails = await prisma.user.findMany({
      where: { id: { in: activityStats.map(a => a.userId) } },
      select: { id: true, displayName: true, username: true }
    });

    const leaderboard = activityStats.map(stat => {
      const user = userDetails.find(u => u.id === stat.userId);
      return {
        id: stat.userId,
        name: user?.displayName || user?.username || 'Unknown',
        pulses: stat._count._all,
        timeMinutes: Math.round((stat._count._all * 10) / 60),
        interactions: 0 
      };
    }).sort((a, b) => b.pulses - a.pulses).slice(0, 5);

    // Add intervention counts to leaderboard
    for (const entry of leaderboard) {
      entry.interactions = await prisma.intervention.count({ where: { userId: entry.id } });
    }

    // 4. NEW: Live Audit Trail (Recent high-impact events)
    const recentInterventions = await prisma.intervention.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
      include: { user: { select: { displayName: true } } }
    });

    const liveEvents = recentInterventions.map(i => ({
      id: i.id,
      timestamp: i.createdAt,
      type: 'intervention',
      user: i.user?.displayName || 'Estudiante',
      description: `Gemini intervino: ${i.type}`,
      status: i.reaction || 'SENT'
    }));

    return NextResponse.json({
      successData,
      heatmapData,
      leaderboard,
      liveEvents
    });

  } catch (error: any) {
    console.error('Analytics API error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
