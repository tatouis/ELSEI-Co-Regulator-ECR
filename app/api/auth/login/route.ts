import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import * as bcrypt from 'bcrypt';

export async function POST(request: Request) {
    try {
        const { username, password } = await request.json();

        if (!username || !password) {
            return NextResponse.json({ success: false, message: 'Missing credentials' }, { status: 400 });
        }

        const user = await prisma.user.findUnique({
            where: { username }
        });

        if (user && await bcrypt.compare(password, user.passwordHash)) {
            return NextResponse.json({
                success: true,
                user: {
                    id: user.id,
                    username: user.username,
                    displayName: user.displayName,
                    role: user.role.toLowerCase(),
                    moodleToken: user.moodleToken,
                    moodleUrl: user.moodleUrl,
                    geminiKey: user.geminiKey
                }
            });
        }

        return NextResponse.json({ success: false, message: 'Invalid credentials' }, { status: 401 });
    } catch (error) {
        console.error('Login error:', error);
        return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
    }
}
