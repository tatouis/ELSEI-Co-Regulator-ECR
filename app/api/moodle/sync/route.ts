import { NextResponse } from 'next/server';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const moodleUrl = searchParams.get('url');
    const moodleToken = searchParams.get('token');

    // We default to course ID 1 (often the site home or a default course id) for demo.
    // In a real multi-course setting you would fetch core_course_get_courses first.
    const courseId = searchParams.get('courseid') || '1';

    if (!moodleUrl || !moodleToken) {
        return NextResponse.json({ error: 'Missing Moodle URL or Token' }, { status: 400 });
    }

    try {
        const cleanUrl = moodleUrl.replace(/\/$/, "");

        // 1. Fetch site users safely. We use email=% as a wildcard trick to get all users.
        const usersEndpoint = `${cleanUrl}/webservice/rest/server.php?wstoken=${moodleToken}&wsfunction=core_user_get_users&moodlewsrestformat=json&criteria[0][key]=email&criteria[0][value]=%25`;

        const response = await fetch(usersEndpoint);

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        let data = await response.json();

        if (data && data.exception) {
            return NextResponse.json({ fallback: true, error: data.message, code: data.errorcode }, { status: 200 });
        }

        // core_user_get_users returns { users: [ ... ] } usually, or an array depending on the Moodle version.
        let usersArray = [];
        if (Array.isArray(data)) {
            usersArray = data;
        } else if (data.users && Array.isArray(data.users)) {
            usersArray = data.users;
        } else {
            return NextResponse.json({ fallback: true, error: 'Unexpected Moodle API response format' }, { status: 200 });
        }

        // Filter out guest account or admin if desired, but we can just use them all
        const validUsers = usersArray.filter((u: any) => !u.deleted && u.username !== 'guest');

        if (validUsers.length === 0) {
             return NextResponse.json({ fallback: true, error: 'No active students found in Moodle.' }, { status: 200 });
        }

        // 2. Map Moodle users to our SimulatedLearner structure (proxy data for the demo)
        const mappedUsers = validUsers.map((user: any, index: number) => {
            const profiles = ['focused', 'overloaded', 'distracted', 'disengaged'];
            const assignProfile = profiles[index % 4];

            return {
                id: String(user.id),
                name: user.fullname || `${user.firstname || ''} ${user.lastname || ''}`.trim() || user.username,
                profile: assignProfile,
                avatar: user.firstname ? user.firstname.charAt(0).toUpperCase() : (user.username?.charAt(0).toUpperCase() || 'M'),
                state: { cognitiveLoad: 'low', attention: 'high', motivation: 'high', confidence: 0.8, timestamp: Date.now() },
                features: {
                    timeSinceLastAction: 0,
                    inactivityStreak: 0,
                    navigationSpeed: 0,
                    retryCount: 0,
                    errorRate: 0,
                    sessionDuration: 0,
                },
                currentActivity: 'Moodle Active Course',
                isInQuiz: false,
                optOut: false,
                lastIntervention: null,
                interventionCount: 0,
                sessionStart: Date.now(),
            };
        });

        return NextResponse.json({ success: true, users: mappedUsers });

    } catch (error: any) {
        console.error("Moodle Sync Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
