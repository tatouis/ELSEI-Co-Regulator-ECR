import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Usar credenciales del tutor de prueba como default para que el admin pueda ver datos
    const moodleUrl = process.env.MOODLE_URL || 'https://lms25.e-lsei.com';
    const moodleToken = process.env.MOODLE_TOKEN || '435af4165f459ef07232a8608ddd9647';
    const cleanUrl = moodleUrl.replace(/\/$/, "");

    const fetchMoodle = async (wsfunction: string, extras = '') => {
      const resp = await fetch(`${cleanUrl}/webservice/rest/server.php?wstoken=${moodleToken}&wsfunction=${wsfunction}&moodlewsrestformat=json${extras}`, { signal: AbortSignal.timeout(6000) });
      return resp.json();
    };

    let sampleData: any = { Courses: [], Students: [], Grades: [] };

    try {
      // 1. Conseguir cursos
      const courses = await fetchMoodle('core_course_get_courses');
      // Filtramos el curso ID 1 (habitualmente es el sitio principal) para dejar los cursos reales
      const realCourses = Array.isArray(courses) ? courses.filter((c: any) => c.id !== 1).slice(0, 3) : [];
      sampleData.Courses = realCourses;

      if (realCourses.length > 0) {
        // 2. Conseguir estudiantes del primer curso real
        const courseId = realCourses[0].id;
        const users = await fetchMoodle('core_enrol_get_enrolled_users', `&courseid=${courseId}`);
        const students = Array.isArray(users) ? users.filter((u: any) => u.roles?.some((r: any) => r.shortname === 'student') || u.roles?.length === 0) : [];
        sampleData.Students = students.slice(0, 10);

        // 3. Conseguir el reporte de notas para mostrar de qué constan las actividades
        // core_grades_get_grades o gradereport_user_get_grade_items (requiere userid, si hay estudiante se lo pasamos)
        if (students.length > 0) {
            const userId = students[0].id;
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
