const https = require('https');

const MOODLE_URL = 'https://lms25.e-lsei.com';
const MOODLE_TOKEN = '435af4165f459ef07232a8608ddd9647';

async function fetchMoodle(wsfunction, extraParams = '') {
    const cleanUrl = MOODLE_URL.replace(/\/$/, "");
    const endpoint = `${cleanUrl}/webservice/rest/server.php?wstoken=${MOODLE_TOKEN}&wsfunction=${wsfunction}&moodlewsrestformat=json${extraParams}`;
    
    return new Promise((resolve, reject) => {
        https.get(endpoint, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try {
                    const json = JSON.parse(data);
                    if (json.exception) reject(new Error(json.message));
                    else resolve(json);
                } catch (e) {
                    reject(new Error('Failed to parse response'));
                }
            });
        }).on('error', reject);
    });
}

async function testExtraction() {
    console.log('--- Moodle Data Extraction Test ---');
    try {
        // 1. Get Site Info
        const siteInfo = await fetchMoodle('core_webservice_get_site_info');
        console.log(`✅ Connected as: ${siteInfo.fullname} (${siteInfo.username})`);
        
        // 2. Get Courses
        console.log('\nFetching Courses...');
        const courses = await fetchMoodle('core_course_get_courses');
        console.log(`✅ Found ${courses.length} courses:`);
        courses.slice(0, 5).forEach(c => {
            console.log(` - [${c.id}] ${c.fullname} (${c.shortname})`);
        });

        if (courses.length > 0) {
            const firstRealCourse = courses.find(c => c.id !== 1) || courses[0];
            console.log(`\nFetching Enrolled Users for course [${firstRealCourse.id}] ${firstRealCourse.shortname}...`);
            const users = await fetchMoodle('core_enrol_get_enrolled_users', `&courseid=${firstRealCourse.id}`);
            console.log(`✅ Found ${users.length} enrolled users.`);
            users.slice(0, 3).forEach(u => {
                console.log(` - ${u.fullname} (${u.username})`);
            });
        }

        console.log('\n--- Test Completed Successfully ---');
    } catch (error) {
        console.error(`❌ Extraction Failed:`, error.message);
    }
}

testExtraction();
