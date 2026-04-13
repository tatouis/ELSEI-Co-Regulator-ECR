import { NextResponse } from 'next/server';

export async function GET() {
    // Only return if it's set in env, otherwise return empty
    // We mask the key for security, only showing enough for the user to verify it's the right one
    const key = process.env.GEMINI_API_KEY || '';
    const maskedKey = key ? `${key.substring(0, 8)}...${key.substring(key.length - 4)}` : '';

    const moodleToken = process.env.MOODLE_TOKEN || '';
    const maskedMoodleToken = moodleToken ? `${moodleToken.substring(0, 8)}...${moodleToken.substring(moodleToken.length - 4)}` : '';

    return NextResponse.json({
        geminiConfigured: !!key,
        geminiKeyMasked: maskedKey,
        moodleConfigured: !!process.env.MOODLE_URL,
        moodleUrl: process.env.MOODLE_URL || '',
        moodleTokenMasked: maskedMoodleToken,
    });
}
