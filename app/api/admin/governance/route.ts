import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
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

    let sampleData: any = { Courses: [], Students: [], Grades: [] };

    try {
      const courses = await fetchMoodle('core_course_get_courses');
      const realCourses = Array.isArray(courses) ? courses.filter((c: any) => c.id !== 1).slice(0, 3) : [];
      sampleData.Courses = realCourses;

      if (realCourses.length > 0) {
        const courseId = realCourses[0].id;
        const users = await fetchMoodle('core_enrol_get_enrolled_users', `&courseid=${courseId}`);
        const moodleStudents = Array.isArray(users) ? users.filter((u: any) => u.roles?.some((r: any) => r.shortname === 'student') || u.roles?.length === 0) : [];
        
        // Enhance Moodle data with ECR intelligence from our database
        const students = [];
        for (const mStudent of moodleStudents.slice(0, 10)) {
          // Look up user in our DB by name or username match if possible, 
          // but for demo we'll aggregate pulses for the currently logged in student 
          // or just provide real counts if they exist.
          const ecrUser = await prisma.user.findFirst({
            where: { OR: [{ username: mStudent.username }, { displayName: mStudent.fullname }] },
            select: { id: true }
          });

          let pulseCount = 0;
          let interventionCount = 0;
          let recentLogs = [];

          if (ecrUser) {
            pulseCount = await prisma.learnerState.count({ where: { userId: ecrUser.id } });
            interventionCount = await prisma.intervention.count({ where: { userId: ecrUser.id } });
            recentLogs = await prisma.intervention.findMany({
                where: { userId: ecrUser.id },
                take: 5,
                orderBy: { createdAt: 'desc' },
                select: { createdAt: true, type: true, reaction: true }
            });
          }

          students.push({
            ...mStudent,
            interactionTimeMinutes: Math.round((pulseCount * 10) / 60),
            totalInterventions: interventionCount,
            activityLogs: recentLogs
          });
        }
        sampleData.Students = students;

        if (moodleStudents.length > 0) {
            const userId = moodleStudents[0].id;
            const grades = await fetchMoodle('gradereport_user_get_grade_items', `&courseid=${courseId}&userid=${userId}`);
            if (grades && grades.usergrades && grades.usergrades.length > 0) {
                sampleData.Grades = grades.usergrades[0].gradeitems.filter((item: any) => item.itemtype !== 'course');
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
