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

    const addToDictionary = (source: string, obj: any, category: string, force = false) => {
        if (!obj || typeof obj !== 'object') return;
        if (!sampleData.Dictionary[category]) {
            sampleData.Dictionary[category] = {};
        }
        Object.keys(obj).forEach(key => {
            // We update if force is true, OR if the key doesn't exist, OR if the current example is null and new one isn't
            if (force || !sampleData.Dictionary[category][key] || (sampleData.Dictionary[category][key].example === null && obj[key] !== null)) {
                const val = obj[key];
                let example = val;
                
                // Truncate long strings for the example field
                if (typeof val === 'string' && val.length > 100) {
                    example = val.substring(0, 97) + '...';
                }
                
                sampleData.Dictionary[category][key] = { 
                    source, 
                    type: Array.isArray(val) ? 'array' : (val === null ? 'null' : typeof val),
                    example: example
                };
            }
        });
    };

    try {
      // 1. Platform-level metadata
      const siteInfo = await fetchMoodle('core_webservice_get_site_info');
      addToDictionary('core_webservice_get_site_info', siteInfo, 'Platform Configuration');

      // 2. Course-level metadata
      const courses = await fetchMoodle('core_course_get_courses');
      const realCourses = Array.isArray(courses) ? courses.filter((c: any) => c.id !== 1).slice(0, 10) : [];
      sampleData.Courses = realCourses;

      const courseId = requestedCourseId ? parseInt(requestedCourseId) : (realCourses.length > 0 ? realCourses[0].id : null);
      
      if (courseId) {
          const selectedCourse = realCourses.find((c: any) => c.id === courseId) || realCourses[0];
          if (selectedCourse) {
              // If a course was explicitly requested, we force its data as the example in the dictionary
              addToDictionary('core_course_get_courses', selectedCourse, 'Course Module', !!requestedCourseId);
          }
      }

      // 2.5 Course Categories
      try {
          const categories = await fetchMoodle('core_course_get_categories');
          if (Array.isArray(categories) && categories.length > 0) {
              addToDictionary('core_course_get_categories', categories[0], 'Course Categories');
          }
      } catch (e) {
          console.warn('Could not fetch categories', e);
      }

      if (courseId) {
        // 3. Enrollment & User-level metadata (Fetched early to use as example user)
        const users = await fetchMoodle('core_enrol_get_enrolled_users', `&courseid=${courseId}`);
        const moodleStudents = Array.isArray(users) ? users.filter((u: any) => u.roles?.some((r: any) => r.shortname === 'student') || u.roles?.length === 0) : [];
        if (moodleStudents.length > 0) {
            addToDictionary('core_enrol_get_enrolled_users', moodleStudents[0], 'Student Enrollment', !!requestedCourseId);
            
            // 3.1 Deep User Profile Data
            try {
                const userId = moodleStudents[0].id;
                const userDetails = await fetchMoodle('core_user_get_users_by_field', `&field=id&values[0]=${userId}`);
                if (Array.isArray(userDetails) && userDetails.length > 0) {
                    addToDictionary('core_user_get_users_by_field', userDetails[0], 'Deep User Profile', !!requestedCourseId);
                }
            } catch(e) { console.warn("Could not fetch deep user profile", e); }
        }

        // 4. Activity-level metadata
        const contents = await fetchMoodle('core_course_get_contents', `&courseid=${courseId}`);
        sampleData.Contents = Array.isArray(contents) ? contents : [];
        if (sampleData.Contents.length > 0 && sampleData.Contents[0].modules?.length > 0) {
            addToDictionary('core_course_get_contents', sampleData.Contents[0].modules[0], 'Course Activities', !!requestedCourseId);
            
            // 4.1 Module Detailed Info
            try {
                const moduleId = sampleData.Contents[0].modules[0].id;
                const modInfo = await fetchMoodle('core_course_get_course_module', `&cmid=${moduleId}`);
                if (modInfo && modInfo.cm) {
                    addToDictionary('core_course_get_course_module', modInfo.cm, 'Module Detailed Info', !!requestedCourseId);
                }
            } catch (e) { console.warn('Could not fetch module info', e); }
        }

        // 5. Course Specific Modules (Assignments, Quizzes, Forums)
        try {
            const assigns = await fetchMoodle('mod_assign_get_assignments', `&courseids[0]=${courseId}`);
            if (assigns && assigns.courses && assigns.courses.length > 0 && assigns.courses[0].assignments.length > 0) {
                addToDictionary('mod_assign_get_assignments', assigns.courses[0].assignments[0], 'Assignments', !!requestedCourseId);
            }
        } catch (e) { console.warn('Could not fetch assignments', e); }

        try {
            const quizzes = await fetchMoodle('mod_quiz_get_quizzes_by_courses', `&courseids[0]=${courseId}`);
            if (quizzes && quizzes.quizzes && quizzes.quizzes.length > 0) {
                addToDictionary('mod_quiz_get_quizzes_by_courses', quizzes.quizzes[0], 'Quizzes', !!requestedCourseId);
            }
        } catch (e) { console.warn('Could not fetch quizzes', e); }

        try {
            const forums = await fetchMoodle('mod_forum_get_forums_by_courses', `&courseids[0]=${courseId}`);
            if (Array.isArray(forums) && forums.length > 0) {
                addToDictionary('mod_forum_get_forums_by_courses', forums[0], 'Forums', !!requestedCourseId);
            }
        } catch (e) { console.warn('Could not fetch forums', e); }

        // 6. Enhanced Governance Discovery (New Variables)
        try {
            const completion = await fetchMoodle('core_completion_get_course_completion_status', `&courseid=${courseId}&userid=${moodleStudents[0]?.id || 0}`);
            if (completion && completion.completionstatus) {
                addToDictionary('core_completion_get_course_completion_status', completion.completionstatus, 'Course Completion Status', !!requestedCourseId);
            }
        } catch (e) { console.warn('Could not fetch course completion status', e); }

        try {
            const navOptions = await fetchMoodle('core_course_get_user_navigation_options', `&courseids[0]=${courseId}`);
            if (navOptions && navOptions.courses && navOptions.courses.length > 0) {
                addToDictionary('core_course_get_user_navigation_options', navOptions.courses[0], 'Navigation Options', !!requestedCourseId);
            }
        } catch (e) { console.warn('Could not fetch navigation options', e); }

        try {
            const recent = await fetchMoodle('core_course_get_recent_courses', `&limit=5`);
            if (Array.isArray(recent) && recent.length > 0) {
                addToDictionary('core_course_get_recent_courses', recent[0], 'Recent Courses');
            }
        } catch (e) { console.warn('Could not fetch recent courses', e); }

        try {
            const notifications = await fetchMoodle('core_fetch_notifications', `&useridto=${moodleStudents[0]?.id || 0}`);
            if (notifications && notifications.notifications && notifications.notifications.length > 0) {
                addToDictionary('core_fetch_notifications', notifications.notifications[0], 'Notifications');
            }
        } catch (e) { console.warn('Could not fetch notifications', e); }

        try {
            const messages = await fetchMoodle('core_message_get_messages', `&useridto=${moodleStudents[0]?.id || 0}&read=0`);
            if (messages && messages.messages && messages.messages.length > 0) {
                addToDictionary('core_message_get_messages', messages.messages[0], 'Messages');
            }
        } catch (e) { console.warn('Could not fetch messages', e); }

        try {
            const courseGrades = await fetchMoodle('gradereport_overview_get_course_grades', `&userid=${moodleStudents[0]?.id || 0}`);
            if (courseGrades && courseGrades.grades && courseGrades.grades.length > 0) {
                addToDictionary('gradereport_overview_get_course_grades', courseGrades.grades[0], 'Overview Grades', !!requestedCourseId);
            }
        } catch (e) { console.warn('Could not fetch overview grades', e); }

        // 7. Performance & ECR Intelligence
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

          try {
            const comp = await fetchMoodle('core_completion_get_activities_completion_status', `&courseid=${courseId}&userid=${mStudent.id}`);
            if (comp && comp.statuses) {
                completionStatus = comp.statuses;
                if (comp.statuses.length > 0) {
                    addToDictionary('core_completion_get_activities_completion_status', comp.statuses[0], 'Activity Completion', !!requestedCourseId);
                }
            }
          } catch (e) { console.warn(`Could not fetch completion for user ${mStudent.id}`); }

          students.push({
            ...mStudent,
            interactionTimeMinutes: Math.round((pulseCount * 10) / 60),
            totalInterventions: interventionCount,
            activityLogs: recentLogs,
            completion: completionStatus
          });
        }
        sampleData.Students = students;

        // 8. Grade-level metadata
        if (moodleStudents.length > 0) {
            const userId = moodleStudents[0].id;
            const grades = await fetchMoodle('gradereport_user_get_grade_items', `&courseid=${courseId}&userid=${userId}`);
            if (grades && grades.usergrades && grades.usergrades.length > 0) {
                sampleData.Grades = grades.usergrades[0].gradeitems.filter((item: any) => item.itemtype !== 'course');
                if (sampleData.Grades.length > 0) {
                    addToDictionary('gradereport_user_get_grade_items', sampleData.Grades[0], 'Grades & Assessment', !!requestedCourseId);
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
