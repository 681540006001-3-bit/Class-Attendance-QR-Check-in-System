import puppeteer from 'puppeteer';

const BASE_URL = 'http://localhost:5173';

async function testFill() {
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  await page.goto(`${BASE_URL}/teacher/courses`, { waitUntil: 'networkidle0' });

  // Click Add Course button
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const btn = btns.find(b => b.textContent.includes('เพิ่มรายวิชาใหม่'));
    if (btn) btn.click();
  });
  await page.waitForSelector('#course_code');

  // Type in React inputs
  await page.focus('#course_code');
  await page.type('#course_code', 'E2E-TEST-CODE');

  await page.focus('#course_name');
  await page.type('#course_name', 'E2E Test Course Name');

  const courseCodeVal = await page.$eval('#course_code', el => el.value);
  const courseNameVal = await page.$eval('#course_name', el => el.value);

  console.log("Course Code value:", courseCodeVal);
  console.log("Course Name value:", courseNameVal);

  // Click Submit
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const btn = btns.find(b => b.textContent.includes('เพิ่มรายวิชา') && b.type === 'submit');
    if (btn) btn.click();
  });

  await new Promise(r => setTimeout(r, 500));
  const content = await page.content();
  console.log("Page contains E2E-TEST-CODE:", content.includes('E2E-TEST-CODE'));

  await browser.close();
}

testFill();
