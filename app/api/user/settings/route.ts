import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PATCH(request: Request) {
    try {
        const { userId, moodleUrl, moodleToken, geminiKey } = await request.json();

        if (!userId) {
            return NextResponse.json({ success: false, message: 'Missing userId' }, { status: 400 });
        }

        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: {
                moodleUrl,
                moodleToken,
                geminiKey
            }
        });

        return NextResponse.json({
            success: true,
            user: {
                id: updatedUser.id,
                username: updatedUser.username,
                displayName: updatedUser.displayName,
                role: updatedUser.role.toLowerCase(),
                moodleToken: updatedUser.moodleToken,
                moodleUrl: updatedUser.moodleUrl,
                geminiKey: updatedUser.geminiKey
            }
        });
    } catch (error: any) {
        console.error('Error updating profile:', error);
        return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
    }
}
