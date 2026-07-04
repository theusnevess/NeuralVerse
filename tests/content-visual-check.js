const { chromium } = require('playwright');

const BASE_URL = 'http://localhost:8080/#/content';
const VIEWPORTS = [
  { name: '1440x900', width: 1440, height: 900 },
  { name: '1280x800', width: 1280, height: 800 },
  { name: '768x1024', width: 768, height: 1024 },
  { name: '390x844',  width: 390,  height: 844 },
  { name: '360x740',  width: 360,  height: 740 },
];

(async () => {
  const browser = await chromium.launch({ headless: true });

  for (const vp of VIEWPORTS) {
    const context = await browser.newContext({ viewport: { width: vp.width, height: vp.height } });
    const page = await context.newPage();

    await page.goto(BASE_URL, { waitUntil: 'networkidle' });
    await page.waitForSelector('.nv-editorial-entry', { timeout: 8000 });

    // Screenshot full page
    await page.screenshot({
      path: `/home/matheusneves/Projetos/NeuralVerse/neuralverse/tests/screenshot-${vp.name}.png`,
      fullPage: true
    });

    // Check for visual issues
    const issues = [];

    // Check no text overflow
    const overflow = await page.evaluate(() => {
      const body = document.body;
      return body.scrollWidth > window.innerWidth;
    });
    if (overflow) issues.push('Horizontal overflow detected');

    // Check all entries have proper spacing
    const entryCount = await page.locator('.nv-editorial-entry').count();
    if (entryCount < 3) issues.push(`Only ${entryCount} entries found (expected 3)`);

    // Check heading text
    const headingText = await page.locator('.nv-editorial-library__title').textContent();
    if (headingText.trim() !== 'Technical Reference & Guides') {
      issues.push(`Heading text mismatch: "${headingText.trim()}"`);
    }

    // Check metadata format for each entry
    const metas = page.locator('.nv-editorial-entry__meta');
    for (let i = 0; i < entryCount; i++) {
      const text = (await metas.nth(i).textContent()).trim();
      if (!/Guide\s*·\s*\d+\s*min read/.test(text)) {
        issues.push(`Entry ${i+1} metadata format unexpected: "${text}"`);
      }
    }

    // Check ARIA labels
    const entries = page.locator('.nv-editorial-entry');
    for (let i = 0; i < entryCount; i++) {
      const label = await entries.nth(i).getAttribute('aria-label');
      if (!label || !label.startsWith('Read ')) {
        issues.push(`Entry ${i+1} missing proper aria-label: "${label}"`);
      }
    }

    // Check sequential numbers on desktop
    const isMobile = vp.width <= 768;
    const nums = page.locator('.nv-editorial-entry__num');
    for (let i = 0; i < entryCount; i++) {
      const visible = await nums.nth(i).isVisible();
      const expectedNum = String(i + 1).padStart(2, '0');
      if (!isMobile) {
        if (!visible) issues.push(`Entry ${i+1} number not visible on desktop`);
        const text = (await nums.nth(i).textContent()).trim();
        if (text !== expectedNum) issues.push(`Entry ${i+1} number text: "${text}" (expected "${expectedNum}")`);
      } else {
        if (visible) issues.push(`Entry ${i+1} number visible on mobile (should be hidden)`);
      }
    }

    console.log(`${vp.name}: ${issues.length === 0 ? 'NO ISSUES' : issues.join('; ')}`);
    await context.close();
  }

  await browser.close();
})();
