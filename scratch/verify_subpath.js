import puppeteer from 'puppeteer';

async function verifySubpathDeployment() {
  console.log("Verifying production build under subpath: http://localhost:5173/Class-Attendance-QR-Check-in-System/");
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();

  const consoleErrors = [];
  const failedRequests = [];

  page.on('console', msg => {
    if (msg.type() === 'error') consoleErrors.push(msg.text());
  });

  page.on('requestfailed', req => {
    failedRequests.push(`${req.url()} (${req.failure()?.errorText})`);
  });

  const response = await page.goto('http://localhost:5173/Class-Attendance-QR-Check-in-System/', { waitUntil: 'networkidle0' });
  console.log(`Page HTTP Status: ${response.status()}`);

  const title = await page.title();
  console.log(`Page Title: ${title}`);

  const content = await page.content();
  const hasAppContent = content.includes('QR Attendance Check-in') || content.includes('ยกระดับการเช็คชื่อเข้าเรียน');
  console.log(`React Content Rendered: ${hasAppContent}`);

  // Test navigation to Teacher Portal under subpath
  await page.goto('http://localhost:5173/Class-Attendance-QR-Check-in-System/teacher', { waitUntil: 'networkidle0' });
  const teacherContent = await page.content();
  const hasTeacherDashboard = teacherContent.includes('แผงควบคุม') || teacherContent.includes(' Teacher Portal');
  console.log(`Teacher Portal Rendered under Subpath: ${hasTeacherDashboard}`);

  console.log(`Console Errors: ${consoleErrors.length}`);
  if (consoleErrors.length > 0) {
    console.log("Errors:", consoleErrors);
  }

  console.log(`Failed Asset Requests: ${failedRequests.length}`);
  if (failedRequests.length > 0) {
    console.log("Failed Requests:", failedRequests);
  }

  await browser.close();

  if (response.ok() && hasAppContent && hasTeacherDashboard && consoleErrors.length === 0 && failedRequests.length === 0) {
    console.log("✅ PRODUCTION SUBPATH DEPLOYMENT VERIFICATION PASSED!");
    process.exit(0);
  } else {
    console.error("❌ VERIFICATION FAILED!");
    process.exit(1);
  }
}

verifySubpathDeployment().catch(err => {
  console.error("Verification error:", err);
  process.exit(1);
});
