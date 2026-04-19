import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50');
    const category = searchParams.get('category');

    const logs = await prisma.systemLog.findMany({
      where: category ? { category } : {},
      orderBy: { timestamp: 'desc' },
      take: limit,
    });

    return NextResponse.json(logs);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { category, level, message, metadata, userId } = body;

    const log = await prisma.systemLog.create({
      data: {
        category,
        level: level || 'info',
        message,
        metadata: metadata ? JSON.stringify(metadata) : null,
        userId,
      },
    });

    return NextResponse.json(log);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
