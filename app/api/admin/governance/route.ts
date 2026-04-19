import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const requestedCourseId = searchParams.get('courseId');

    // Priority: DB Config -> ENV -> Hardcoded Fallback
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

    let sampleData: any = { Courses: [], Students: [], Grades: [], Contents: [], Dictionary: {} };

    try {
      const courses = await fetchMoodle('core_course_get_courses');
      const realCourses = Array.isArray(courses) ? courses.filter((c: any) => c.id !== 1).slice(0, 10) : [];
      sampleData.Courses = realCourses;

      // Extract metadata keys from courses
      if (realCourses.length > 0) {
        Object.keys(realCourses[0]).forEach(key => {
            sampleData.Dictionary[key] = { source: 'core_course_get_courses', type: typeof realCourses[0][key] };
        });
      }

      if (realCourses.length > 0) {
        const courseId = requestedCourseId ? parseInt(requestedCourseId) : realCourses[0].id;
        
        // Fetch course contents (activities)
        const contents = await fetchMoodle('core_course_get_contents', `&courseid=${courseId}`);
        sampleData.Contents = Array.isArray(contents) ? contents : [];
        if (sampleData.Contents.length > 0 && sampleData.Contents[0].modules?.length > 0) {
            Object.keys(sampleData.Contents[0].modules[0]).forEach(key => {
                sampleData.Dictionary[key] = { source: 'core_course_get_contents', type: typeof sampleData.Contents[0].modules[0][key] };
            });
        }

        const users = await fetchMoodle('core_enrol_get_enrolled_users', `&courseid=${courseId}`);
        const moodleStudents = Array.isArray(users) ? users.filter((u: any) => u.roles?.some((r: any) => r.shortname === 'student') || u.roles?.length === 0) : [];
        
        // Extract metadata keys from users
        if (moodleStudents.length > 0) {
            Object.keys(moodleStudents[0]).forEach(key => {
                sampleData.Dictionary[key] = { source: 'core_enrol_get_enrolled_users', type: typeof moodleStudents[0][key] };
            });
        }

        // Enhance Moodle data with ECR intelligence
        const students = [];
        for (const mStudent of moodleStudents.slice(0, 15)) {
          const ecrUser = await prisma.user.findFirst({
            where: { OR: [{ username: mStudent.username }, { displayName: mStudent.fullname }] },
            select: { id: true }
          });

          let pulseCount = 0;
          let interventionCount = 0;
          let recentLogs: any[] = [];
          let completionStatus: any[] = [];

          if (ecrUser) {
            pulseCount = await prisma.learnerState.count({ where: { userId: ecrUser.id } });
            interventionCount = await prisma.intervention.count({ where: { userId: ecrUser.id } });
            recentLogs = await prisma.intervention.findMany({
                where: { userId: ecrUser.id },
                take: 10,
                orderBy: { timestamp: 'desc' },
                select: { timestamp: true, interventionType: true, reaction: true }
            });
          }

          // Fetch real progress from Moodle
          try {
            const comp = await fetchMoodle('core_completion_get_activities_completion_status', `&courseid=${courseId}&userid=${mStudent.id}`);
            if (comp && comp.statuses) {
                completionStatus = comp.statuses;
                // Add keys to dictionary if not present
                if (comp.statuses.length > 0) {
                    Object.keys(comp.statuses[0]).forEach(key => {
                        sampleData.Dictionary[key] = { source: 'core_completion_get_activities_completion_status', type: typeof comp.statuses[0][key] };
                    });
                }
            }
          } catch (e) {
            console.warn(`Could not fetch completion for user ${mStudent.id}`);
          }

          students.push({
            ...mStudent,
            interactionTimeMinutes: Math.round((pulseCount * 10) / 60),
            totalInterventions: interventionCount,
            activityLogs: recentLogs,
            completion: completionStatus
          });
        }
        sampleData.Students = students;

        // Fetch grades for the first student to get schema
        if (moodleStudents.length > 0) {
            const userId = moodleStudents[0].id;
            const grades = await fetchMoodle('gradereport_user_get_grade_items', `&courseid=${courseId}&userid=${userId}`);
            if (grades && grades.usergrades && grades.usergrades.length > 0) {
                sampleData.Grades = grades.usergrades[0].gradeitems.filter((item: any) => item.itemtype !== 'course');
                if (sampleData.Grades.length > 0) {
                    Object.keys(sampleData.Grades[0]).forEach(key => {
                        sampleData.Dictionary[key] = { source: 'gradereport_user_get_grade_items', type: typeof sampleData.Grades[0][key] };
                    });
                }
            }
        }
      }
    } catch (e) {
      console.error('Moodle API fetch error:', e);
    }

    return NextResponse.json({
      moodleStatus: sampleData.Courses.length > 0 ? 'connected' : 'error',
      moodleUrl: cleanUrl,
      data: sampleData
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
