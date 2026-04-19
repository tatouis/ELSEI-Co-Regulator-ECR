import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    // 1. Fetch User Stats
    const users = await prisma.user.findMany({
      select: {
        id: true,
        displayName: true,
        username: true,
        role: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' }
    });

    const totalUsers = users.length;

    // 2. API Health Checks (Simplified)
    let moodleStatus = 'offline';
    try {
      const moodleUrl = process.env.MOODLE_URL;
      const moodleToken = process.env.MOODLE_TOKEN;
      if (moodleUrl && moodleToken) {
        const response = await fetch(`${moodleUrl.replace(/\/$/, "")}/webservice/rest/server.php?wstoken=${moodleToken}&wsfunction=core_webservice_get_site_info&moodlewsrestformat=json`, { signal: AbortSignal.timeout(3000) });
        if (response.ok) {
           const data = await response.json();
           if (data.sitename) moodleStatus = 'online';
        }
      }
    } catch (e) {
      moodleStatus = 'error';
    }

    const geminiStatus = process.env.GEMINI_API_KEY ? 'active' : 'missing_key';
    const dbStatus = 'online'; // If we are here, DB is online

    // 3. API Usage Counter (Total successful logs in last 24h)
    const usageCount = await prisma.systemLog.count({
      where: {
        level: 'success',
        timestamp: {
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000)
        }
      }
    });

    return NextResponse.json({
      summary: {
        totalUsers,
        activeApis: (moodleStatus === 'online' ? 1 : 0) + (geminiStatus === 'active' ? 1 : 0) + 1, // +1 for DB
        totalApis: 3,
        usageCount24h: usageCount
      },
      health: {
        moodle: moodleStatus,
        gemini: geminiStatus,
        database: dbStatus
      },
      users: users.map(u => ({
        id: u.id,
        name: u.displayName,
        username: u.username,
        role: u.role
      }))
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
