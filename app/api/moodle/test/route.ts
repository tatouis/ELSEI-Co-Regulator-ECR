import { NextResponse } from 'next/server';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const moodleUrl = searchParams.get('url') || process.env.MOODLE_URL;
    const moodleToken = searchParams.get('token') || process.env.MOODLE_TOKEN;

    if (!moodleUrl || !moodleToken) {
        return NextResponse.json({ success: false, error: 'Missing Moodle URL or Token. Check environment variables or local settings.' }, { status: 400 });
    }

    try {
        const cleanUrl = moodleUrl.replace(/\/$/, ""); 
        
        // Use a safe global endpoint that doesn't require course parameters or heavy permissions
        const endpoint = `${cleanUrl}/webservice/rest/server.php?wstoken=${moodleToken}&wsfunction=core_webservice_get_site_info&moodlewsrestformat=json`;
        
        const response = await fetch(endpoint, {
            method: 'GET',
            headers: {
                'Accept': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        // Check internal Moodle API errors
        if (data.exception || data.errorcode) {
            return NextResponse.json({ 
                success: false, 
                error: data.message || 'Moodle API Error', 
                code: data.errorcode 
            }, { status: 200 }); // Return 200 so the frontend can parse the Moodle rejection nicely
        }

        // Output success if valid info comes back
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
        console.error("Moodle Test Query Error:", error);
        return NextResponse.json({ success: false, error: error.message || "Failed to reach server" });
    }
}
