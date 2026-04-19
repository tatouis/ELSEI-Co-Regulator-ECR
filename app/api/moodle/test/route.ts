import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const moodleUrl = searchParams.get('url') || process.env.MOODLE_URL;
    const moodleToken = searchParams.get('token') || process.env.MOODLE_TOKEN;

    return runMoodleTest(moodleUrl, moodleToken);
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        let { url, token } = body;

        // If token is missing (masked in UI), try to find it in DB
        if (!token || token === '********') {
            const config = await prisma.systemConfig.findUnique({ where: { key: 'moodle_token' } });
            if (config) token = config.value;
        }

        // If url is missing, try to find it in DB
        if (!url) {
            const config = await prisma.systemConfig.findUnique({ where: { key: 'moodle_url' } });
            if (config) url = config.value;
        }

        return runMoodleTest(url || process.env.MOODLE_URL, token || process.env.MOODLE_TOKEN);
    } catch (e) {
        return NextResponse.json({ success: false, error: 'Invalid request body' }, { status: 400 });
    }
}

async function runMoodleTest(moodleUrl: string | undefined, moodleToken: string | undefined) {
    if (!moodleUrl || !moodleToken) {
        return NextResponse.json({ success: false, error: 'Missing Moodle URL or Token.' }, { status: 400 });
    }

    try {
        const cleanUrl = moodleUrl.replace(/\/$/, ""); 
        const endpoint = `${cleanUrl}/webservice/rest/server.php?wstoken=${moodleToken}&wsfunction=core_webservice_get_site_info&moodlewsrestformat=json`;
        
        const response = await fetch(endpoint, {
            method: 'GET',
            headers: { 'Accept': 'application/json' },
            signal: AbortSignal.timeout(5000)
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        if (data.exception || data.errorcode) {
            return NextResponse.json({ 
                success: false, 
                error: data.message || 'Moodle API Error', 
                code: data.errorcode 
            });
        }

        if (data.sitename) {
            return NextResponse.json({ 
                success: true, 
                siteInfo: {
                    sitename: data.sitename,
                    username: data.username,
                    moodleRelease: data.release
                } 
            });
        }

        return NextResponse.json({ success: false, error: 'Unexpected response format' });

    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message || "Failed to reach server" });
    }
}
