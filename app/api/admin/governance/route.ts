import { NextResponse } from 'next/server';

const MOODLE_METADATA = [
  {
    table: 'Users',
    description: 'Detailed information about Moodle site users.',
    wsFunction: 'core_user_get_users',
    fields: [
      { name: 'id', type: 'int', description: 'Internal Moodle ID' },
      { name: 'username', type: 'string', description: 'Unique login identifier' },
      { name: 'firstname', type: 'string', description: 'Given name' },
      { name: 'lastname', type: 'string', description: 'Family name' },
      { name: 'email', type: 'string', description: 'Contact email address' },
      { name: 'lastaccess', type: 'timestamp', description: 'Last time the user accessed the site' }
    ]
  },
  {
    table: 'Courses',
    description: 'Academic modules and their configurations.',
    wsFunction: 'core_course_get_courses',
    fields: [
      { name: 'id', type: 'int', description: 'Internal Course ID' },
      { name: 'fullname', type: 'string', description: 'Full title of the course' },
      { name: 'shortname', type: 'string', description: 'Short mnemonic identifier' },
      { name: 'categoryid', type: 'int', description: 'ID of the course category' },
      { name: 'summary', type: 'html', description: 'Course description or syllabus' }
    ]
  },
  {
    table: 'Grades',
    description: 'Student performance records for specific activities.',
    wsFunction: 'gradereport_user_get_grade_items',
    fields: [
      { name: 'id', type: 'int', description: 'Grade item ID' },
      { name: 'itemname', type: 'string', description: 'Name of the activity (Quiz, Assignment, etc)' },
      { name: 'gradeformatted', type: 'string', description: 'The grade as shown to the user' },
      { name: 'percentageformatted', type: 'string', description: 'Success percentage' }
    ]
  },
  {
    table: 'Enrolments',
    description: 'Relationship between users and courses.',
    wsFunction: 'core_enrol_get_enrolled_users',
    fields: [
      { name: 'id', type: 'int', description: 'User ID' },
      { name: 'fullname', type: 'string', description: 'User name' },
      { name: 'roles', type: 'array', description: 'Roles assigned in this course' }
    ]
  }
];

export async function GET() {
  try {
    const moodleUrl = process.env.MOODLE_URL;
    const moodleToken = process.env.MOODLE_TOKEN;

    let sampleData: any = {};

    if (moodleUrl && moodleToken) {
      // Fetch a real sample record for Courses (id 1 or first available)
      try {
        const cleanUrl = moodleUrl.replace(/\/$/, "");
        const response = await fetch(`${cleanUrl}/webservice/rest/server.php?wstoken=${moodleToken}&wsfunction=core_course_get_courses&moodlewsrestformat=json`, { signal: AbortSignal.timeout(5000) });
        if (response.ok) {
           const courses = await response.json();
           if (Array.isArray(courses) && courses.length > 0) {
             sampleData['Courses'] = courses[0];
           }
        }
      } catch (e) {
        console.error('Failed to fetch sample course', e);
      }
    }

    return NextResponse.json({
      metadata: MOODLE_METADATA,
      samples: sampleData
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
