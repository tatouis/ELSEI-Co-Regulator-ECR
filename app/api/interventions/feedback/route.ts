import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { id, reaction } = body;

    if (!id || !reaction) {
      return NextResponse.json({ error: 'Missing intervention ID or reaction' }, { status: 400 });
    }

    const intervention = await prisma.intervention.update({
      where: { id },
      data: { reaction },
    });

    return NextResponse.json({ success: true, intervention });
  } catch (error: any) {
    console.error('Feedback API error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
