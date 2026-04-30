
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { calculateCognitiveLoad } from '@/lib/cognitiveLoadService';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const courseId = searchParams.get('courseId');
    const userId = searchParams.get('userId');

    // Fetch Moodle Config
    const configs = await prisma.systemConfig.findMany({
      where: { key: { in: ['moodle_url', 'moodle_token'] } }
    });

    const dbUrl = configs.find(c => c.key === 'moodle_url')?.value;
    const dbToken = configs.find(c => c.key === 'moodle_token')?.value;

    const moodleUrl = dbUrl || process.env.MOODLE_URL || 'https://lms25.e-lsei.com';
    const moodleToken = dbToken || process.env.MOODLE_TOKEN || '435af4165f459ef07232a8608ddd9647';
    const cleanUrl = moodleUrl.replace(/\/$/, "");

    const fetchMoodle = async (wsfunction: string, extras = '') => {
      const resp = await fetch(`${cleanUrl}/webservice/rest/server.php?wstoken=${moodleToken}&wsfunction=${wsfunction}&moodlewsrestformat=json${extras}`, { signal: AbortSignal.timeout(6000) });
      return resp.json();
    };

    let targetUserId = userId ? parseInt(userId) : null;
    let targetCourseId = courseId ? parseInt(courseId) : null;

    // If no courseId, get the first one
    if (!targetCourseId) {
        const courses = await fetchMoodle('core_course_get_courses');
        const realCourses = Array.isArray(courses) ? courses.filter((c: any) => c.id !== 1) : [];
        if (realCourses.length > 0) targetCourseId = realCourses[0].id;
    }

    // If no userId, get the first student from the course
    if (targetCourseId && !targetUserId) {
        const users = await fetchMoodle('core_enrol_get_enrolled_users', `&courseid=${targetCourseId}`);
        const students = Array.isArray(users) ? users.filter((u: any) => u.roles?.some((r: any) => r.shortname === 'student') || u.roles?.length === 0) : [];
        if (students.length > 0) targetUserId = students[0].id;
    }

    // Features to gather
    const features: any = {};

    if (targetCourseId && targetUserId) {
        // 1. Attempts & Wrong Answers
        try {
            const quizzes = await fetchMoodle('mod_quiz_get_quizzes_by_courses', `&courseids[0]=${targetCourseId}`);
            if (quizzes && quizzes.quizzes && quizzes.quizzes.length > 0) {
                const quizId = quizzes.quizzes[0].id;
                const attempts = await fetchMoodle('mod_quiz_get_user_attempts', `&quizid=${quizId}&userid=${targetUserId}`);
                if (attempts && attempts.attempts) {
                    features.attempts = attempts.attempts.length;
                    // For wrong answers, we'd normally need mod_quiz_get_attempt_review for each attempt
                    // but that's too many calls. We'll mark as pending or try to estimate from grades.
                }
            }
        } catch (e) { console.warn('Cognitive Load API: Quiz fetch failed', e); }

        // 2. Completion & Progress
        try {
            const comp = await fetchMoodle('core_completion_get_activities_completion_status', `&courseid=${targetCourseId}&userid=${targetUserId}`);
            if (comp && comp.statuses) {
                features.completedActivities = comp.statuses.filter((s: any) => s.state === 1).length;
                features.totalActivities = comp.statuses.length;
                features.progressRate = features.completedActivities / (features.totalActivities || 1);
            }
        } catch (e) { console.warn('Cognitive Load API: Completion fetch failed', e); }

        // 3. Time Spent (from ECR local pulse data as proxy if Moodle logs unavailable)
        const ecrUser = await prisma.user.findFirst({
            where: { OR: [{ username: `learner${targetUserId}` }, { id: targetUserId.toString() }] }, // Heuristic
            select: { id: true }
        });
        if (ecrUser) {
            const pulseCount = await prisma.learnerState.count({ where: { userId: ecrUser.id } });
            features.timeSpentActive = Math.round((pulseCount * 10) / 60); // minutes
        }
    }

    const result = calculateCognitiveLoad(features);

    return NextResponse.json({
        success: true,
        targetUserId,
        targetCourseId,
        ...result
    });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
