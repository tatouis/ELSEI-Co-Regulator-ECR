import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const configs = await prisma.systemConfig.findMany({
      where: {
        key: {
          in: ['moodle_url', 'moodle_token', 'gemini_api_key']
        }
      }
    });

    const result: Record<string, string> = {
      moodle_url: process.env.MOODLE_URL || '',
      moodle_token: '', 
      gemini_api_key: ''
    };

    configs.forEach(c => {
      result[c.key] = c.value;
    });

    // Mask tokens for security in GET
    if (result.moodle_token) result.moodle_token = '********';
    if (result.gemini_api_key) result.gemini_api_key = '********';

    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { moodle_url, moodle_token, gemini_api_key } = body;

    const updates = [];

    if (moodle_url !== undefined) {
      updates.push(prisma.systemConfig.upsert({
        where: { key: 'moodle_url' },
        update: { value: moodle_url },
        create: { key: 'moodle_url', value: moodle_url },
      }));
    }

    if (moodle_token !== undefined && moodle_token !== '********') {
      updates.push(prisma.systemConfig.upsert({
        where: { key: 'moodle_token' },
        update: { value: moodle_token },
        create: { key: 'moodle_token', value: moodle_token },
      }));
    }

    if (gemini_api_key !== undefined && gemini_api_key !== '********') {
      updates.push(prisma.systemConfig.upsert({
        where: { key: 'gemini_api_key' },
        update: { value: gemini_api_key },
        create: { key: 'gemini_api_key', value: gemini_api_key },
      }));
    }

    await Promise.all(updates);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
