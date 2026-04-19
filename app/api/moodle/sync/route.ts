import { NextResponse } from 'next/server';
import { logger } from '@/lib/logger';

// Helper for making REST calls to Moodle
async function fetchMoodle(cleanUrl: string, token: string, wsfunction: string, extraParams: string = '') {
    const endpoint = `${cleanUrl}/webservice/rest/server.php?wstoken=${token}&wsfunction=${wsfunction}&moodlewsrestformat=json${extraParams}`;
    const response = await fetch(endpoint);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    const data = await response.json();
    if (data && data.exception) {
        throw new Error(data.message);
    }
    return data;
}

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const moodleUrl = searchParams.get('url') || process.env.MOODLE_URL;
    const moodleToken = searchParams.get('token') || process.env.MOODLE_TOKEN;

    if (!moodleUrl || !moodleToken) {
        return NextResponse.json({ fallback: true, error: 'Missing credentials. Check environment variables or local settings.' }, { status: 200 });
    }

    try {
        const cleanUrl = moodleUrl.replace(/\/$/, "");
        await logger.info('moodle', 'Iniciando sincronización con Moodle', { url: cleanUrl });

        // 1. Fetch courses
        const coursesData = await fetchMoodle(cleanUrl, moodleToken, 'core_course_get_courses');
        
        let targetCourses = Array.isArray(coursesData) ? coursesData : [];
        if (targetCourses.length === 0) {
            return NextResponse.json({ fallback: true, error: 'No active courses found' }, { status: 200 });
        }

        // Filter out site home (id 1) to avoid clutter, though keep it if it's the only one
        const activeCourses = targetCourses.filter(c => c.id !== 1);
        const coursesToSync = activeCourses.length > 0 ? activeCourses : targetCourses;

        const allMappedUsers = [];
        const encounteredUserIds = new Set();

        // 2. Iterate courses to pull enrolled users and grades
        // In a production app, we'd paginate or batch async calls. We'll do it sequentially for safety here.
        for (const course of coursesToSync) {
            try {
                const enrolledUsers = await fetchMoodle(cleanUrl, moodleToken, 'core_enrol_get_enrolled_users', `&courseid=${course.id}`);
                
                if (!Array.isArray(enrolledUsers)) continue;

                for (const user of enrolledUsers) {
                    if (user.deleted || user.username === 'guest') continue;

                    // Compute basic simulated traits as a baseline
                    const profiles = ['focused', 'overloaded', 'distracted', 'disengaged'];
                    const assignProfile = profiles[user.id % 4];

                    let errorRate = 0;
                    let confidence = 0.8;
                    
                    // Attempt to fetch grades context if possible (Optional, fail-safe)
                    try {
                        const grades = await fetchMoodle(cleanUrl, moodleToken, 'gradereport_user_get_grade_items', `&courseid=${course.id}&userid=${user.id}`);
                        if (grades && grades.usergrades && grades.usergrades[0]) {
                            const gradeItems = grades.usergrades[0].gradeitems || [];
                            // Quick calculation to infer confidence/errorRate from grades
                            const validGrades = gradeItems.filter((g:any) => g.graderaw !== null && g.graderaw !== undefined && g.grademax > 0);
                            if (validGrades.length > 0) {
                                let totalPerc = 0;
                                validGrades.forEach((g:any) => {
                                    totalPerc += (g.graderaw / g.grademax);
                                });
                                const avgGrade = totalPerc / validGrades.length;
                                confidence = Math.max(0.2, avgGrade);
                                errorRate = Math.max(0, 1 - avgGrade);
                            }
                        }
                    } catch (gErr) {
                        // Grade parsing fails safely, we just use defaults
                    }

                    allMappedUsers.push({
                        id: `${user.id}-${course.id}`, // Compose unique ID per enrollment if we want them separately, or just global
                        realUserId: String(user.id),
                        name: user.fullname || `${user.firstname || ''} ${user.lastname || ''}`.trim() || user.username,
                        profile: assignProfile,
                        avatar: user.firstname ? user.firstname.charAt(0).toUpperCase() : (user.username?.charAt(0).toUpperCase() || 'M'),
                        state: { 
                            cognitiveLoad: errorRate > 0.6 ? 'high' : 'low', 
                            attention: 'high', 
                            motivation: confidence > 0.6 ? 'high' : 'medium', 
                            confidence: confidence, 
                            timestamp: Date.now() 
                        },
                        features: {
                            timeSinceLastAction: 0,
                            inactivityStreak: 0,
                            navigationSpeed: 0,
                            retryCount: Math.floor(errorRate * 5),
                            errorRate: errorRate,
                            sessionDuration: 0,
                        },
                        currentActivity: `Active in: ${course.shortname}`,
                        isInQuiz: false,
                        optOut: false,
                        lastIntervention: null,
                        interventionCount: 0,
                        sessionStart: Date.now(),
                        courseId: String(course.id),
                        courseName: course.fullname || course.shortname
                    });
                     
                }

            } catch (err) {
                // If enrolled users fails for a course, gracefully continue to the next
                console.warn(`Could not sync course ${course.id}`, err);
            }
        }

        if (allMappedUsers.length === 0) {
            return NextResponse.json({ fallback: true, error: 'No enrolled students found in active courses.' }, { status: 200 });
        }

        await logger.success('moodle', `Sincronización completada: ${allMappedUsers.length} estudiantes procesados`, { courses: coursesToSync.length });
        return NextResponse.json({ success: true, users: allMappedUsers });

    } catch (error: any) {
        await logger.error('moodle', 'Fallo en la sincronización con Moodle', { error: error.message });
        console.error("Moodle Sync Error:", error);
        return NextResponse.json({ fallback: true, error: error.message }, { status: 200 });
    }
}
