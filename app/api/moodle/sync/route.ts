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
        const cleanUrl = moodleUrl.replace(/\/$/, ""); // Remove trailing slash if any

        // 1. Try to fetch enrolled users for the given course
        const usersEndpoint = `${cleanUrl}/webservice/rest/server.php?wstoken=${moodleToken}&wsfunction=core_enrol_get_enrolled_users&moodlewsrestformat=json&courseid=${courseId}`;

        const response = await fetch(usersEndpoint);

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        // Handle Moodle errors (Moodle API often returns 200 OK but with an error object)
        if (data && data.exception) {
            return NextResponse.json({ error: data.message, code: data.errorcode }, { status: 500 });
        }

        if (!Array.isArray(data)) {
            return NextResponse.json({ error: 'Unexpected Moodle API response format' }, { status: 500 });
        }

        // 2. Map Moodle users to our SimulatedLearner structure (proxy data for the demo)
        const mappedUsers = data.map((user: any, index: number) => {
            const profiles = ['focused', 'overloaded', 'distracted', 'disengaged'];
            const assignProfile = profiles[index % 4];

            return {
                id: String(user.id),
                name: user.fullname || `${user.firstname} ${user.lastname}`,
                profile: assignProfile,
                avatar: user.firstname ? user.firstname.charAt(0).toUpperCase() : 'M',
                state: { cognitiveLoad: 'low', attention: 'high', motivation: 'high', confidence: 0.8, timestamp: Date.now() },
                features: {
                    timeSinceLastAction: 0,
                    inactivityStreak: 0,
                    navigationSpeed: 0,
                    retryCount: 0,
                    errorRate: 0,
                    sessionDuration: 0,
                },
                currentActivity: 'Moodle Synced Activity',
                isInQuiz: false,
                optOut: false,
                lastIntervention: null,
                interventionCount: 0,
                sessionStart: Date.now(),
            };
        });

        return NextResponse.json({ users: mappedUsers });

    } catch (error: any) {
        console.error("Moodle Sync Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
