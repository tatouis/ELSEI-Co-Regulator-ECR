import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import * as bcrypt from 'bcrypt';
import { logger } from '@/lib/logger';

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
            await logger.success('auth', `Login exitoso: ${username}`, { userId: user.id, role: user.role }, user.id);
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

        await logger.warn('auth', `Intento de login fallido: ${username}`, { ip: request.headers.get('x-forwarded-for') });
        return NextResponse.json({ success: false, message: 'Invalid credentials' }, { status: 401 });
    } catch (error: any) {
        await logger.error('auth', `Error en servidor durante login`, { error: error.message });
        console.error('Login error:', error);
        return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
    }
}
