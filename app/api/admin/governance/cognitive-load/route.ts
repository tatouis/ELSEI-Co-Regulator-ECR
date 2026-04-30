
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { calculateCognitiveLoad } from '@/lib/cognitiveLoadService';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const courseId = searchParams.get('courseId');
    const userId = searchParams.get('userId');

    if (!courseId || !userId) {
        return NextResponse.json({ error: 'Faltan parámetros courseId o userId' }, { status: 400 });
    }

    const targetUserId = parseInt(userId);
    const targetCourseId = parseInt(courseId);

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
      try {
        const resp = await fetch(`${cleanUrl}/webservice/rest/server.php?wstoken=${moodleToken}&wsfunction=${wsfunction}&moodlewsrestformat=json${extras}`, { signal: AbortSignal.timeout(8000) });
        return resp.json();
      } catch (e) {
        console.warn(`Moodle API Error (${wsfunction}):`, e);
        return null;
      }
    };

    // 1. Core Data Fetching
    const [quizzes, comp, calendar, grades, assignments] = await Promise.all([
        fetchMoodle('mod_quiz_get_quizzes_by_courses', `&courseids[0]=${targetCourseId}`),
        fetchMoodle('core_completion_get_activities_completion_status', `&courseid=${targetCourseId}&userid=${targetUserId}`),
        fetchMoodle('core_calendar_get_action_events_by_course', `&courseid=${targetCourseId}`),
        fetchMoodle('gradereport_user_get_grade_items', `&courseid=${targetCourseId}&userid=${targetUserId}`),
        fetchMoodle('mod_assign_get_assignments', `&courseids[0]=${targetCourseId}`)
    ]);

    const features: any = {};

    // 2. RetryPressure, ErrorPressure, QuizTimePressure
    if (quizzes?.quizzes) {
        let totalAttempts = 0;
        let quizzesAttempted = 0;
        let totalErrorSum = 0;
        let totalTimePressureSum = 0;
        let quizzesWithTimeLimit = 0;

        for (const quiz of quizzes.quizzes) {
            const attempts = await fetchMoodle('mod_quiz_get_user_attempts', `&quizid=${quiz.id}&userid=${targetUserId}`);
            if (attempts?.attempts?.length > 0) {
                quizzesAttempted++;
                totalAttempts += attempts.attempts.length;
                
                for (const att of attempts.attempts) {
                    // Error Pressure
                    if (att.state === 'finished' && att.sumgrades !== undefined) {
                        const maxGrade = quiz.grade || 10;
                        totalErrorSum += (1 - (att.sumgrades / maxGrade));
                    }
                    // Quiz Time Pressure
                    if (quiz.timelimit > 0 && att.timefinish > 0) {
                        const duration = att.timefinish - att.timestart;
                        totalTimePressureSum += Math.min(1, duration / quiz.timelimit);
                        quizzesWithTimeLimit++;
                    }
                }
            }
        }
        features.retryPressure = totalAttempts / (quizzesAttempted + 1) / 3; // Normalized by 3
        features.errorPressure = totalAttempts > 0 ? totalErrorSum / totalAttempts : 0;
        features.quizTimePressure = quizzesWithTimeLimit > 0 ? totalTimePressureSum / quizzesWithTimeLimit : 0;
    }

    // 3. LowProgress
    if (comp?.statuses) {
        const completed = comp.statuses.filter((s: any) => s.state === 1).length;
        const total = comp.statuses.length;
        const progressRate = completed / (total || 1);
        features.lowProgress = 1 - progressRate;
    }

    // 4. DeadlinePressure & NonCompletionRisk
    if (calendar?.events) {
        const now = Math.floor(Date.now() / 1000);
        let overdueIncomplete = 0;
        let totalDue = 0;
        let minTimeRemaining = Infinity;

        calendar.events.forEach((ev: any) => {
            if (ev.eventtype === 'due' || ev.eventtype === 'close') {
                totalDue++;
                const timeRemaining = ev.timestart - now;
                if (timeRemaining < 0) {
                    // Check if activity is incomplete
                    const isComplete = comp?.statuses?.find((s: any) => s.cmid === ev.instance)?.state === 1;
                    if (!isComplete) overdueIncomplete++;
                } else {
                    minTimeRemaining = Math.min(minTimeRemaining, timeRemaining);
                }
            }
        });

        features.nonCompletionRisk = totalDue > 0 ? overdueIncomplete / totalDue : 0;
        // Deadline pressure: 1 if something is very close (< 2 days)
        if (minTimeRemaining !== Infinity) {
            const twoDays = 2 * 24 * 60 * 60;
            features.deadlinePressure = Math.max(0, 1 - (minTimeRemaining / twoDays));
        } else if (overdueIncomplete > 0) {
            features.deadlinePressure = 1;
        }
    }

    // 5. GradeDrop
    if (grades?.usergrades?.[0]?.gradeitems) {
        const items = grades.usergrades[0].gradeitems.filter((i: any) => i.graderaw !== null && i.grademax > 0);
        if (items.length >= 2) {
            // Compare last grade with average of previous ones
            const sortedItems = items.sort((a: any, b: any) => (a.iteminstance || 0) - (b.iteminstance || 0));
            const last = sortedItems[sortedItems.length - 1];
            const previous = sortedItems.slice(0, -1);
            const prevAvg = previous.reduce((acc: number, curr: any) => acc + (curr.graderaw / curr.grademax), 0) / previous.length;
            const lastNorm = last.graderaw / last.grademax;
            features.gradeDrop = Math.max(0, prevAvg - lastNorm);
        }
    }

    // 6. AssignmentPressure
    if (assignments?.courses?.[0]?.assignments) {
        // This would require mod_assign_get_submissions for each assignment
        // For now, we'll proxy it from nonCompletionRisk if it involves assignments
    }

    const result = calculateCognitiveLoad(features);

    return NextResponse.json({
        success: true,
        targetUserId,
        targetCourseId,
        ...result,
        rawFeatures: features // For debugging
    });

  } catch (error: any) {
    console.error('Cognitive Load Route Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
