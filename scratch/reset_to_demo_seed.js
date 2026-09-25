import puppeteer from 'puppeteer';
import { initialCourses, initialStudents, initialSessions, initialRecords } from '../src/data/initialSeedData.js';

async function resetBrowserStorage() {
  console.log("Resetting browser LocalStorage to initial clean demo seed dataset...");
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  await page.goto('http://localhost:5173', { waitUntil: 'domcontentloaded', timeout: 15000 });

  await page.evaluate((courses, students, sessions, records) => {
    localStorage.clear();
    localStorage.setItem('qr_attendance_courses', JSON.stringify(courses));
    localStorage.setItem('qr_attendance_students', JSON.stringify(students));
    localStorage.setItem('qr_attendance_sessions', JSON.stringify(sessions));
    localStorage.setItem('qr_attendance_records', JSON.stringify(records));
  }, initialCourses, initialStudents, initialSessions, initialRecords);

  console.log("Successfully cleared test data and initialized clean Demo Dataset!");
  await browser.close();
}

resetBrowserStorage().catch(err => {
  console.error("Error resetting browser storage:", err);
  process.exit(1);
});
