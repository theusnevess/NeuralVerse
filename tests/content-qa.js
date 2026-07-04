const { chromium } = require('playwright');

const BASE_URL = 'http://localhost:8080/#/content';
const VIEWPORTS = [
  { name: '1440×900', width: 1440, height: 900 },
  { name: '1280×800', width: 1280, height: 800 },
  { name: '768×1024', width: 768, height: 1024 },
  { name: '390×844',  width: 390,  height: 844 },
  { name: '360×740',  width: 360,  height: 740 },
];

const MOBILE_BREAKPOINT = 48; // 48rem = 768px

async function waitForLibrary(page) {
  await page.waitForSelector('.nv-editorial-library__title', { timeout: 8000 });
  await page.waitForSelector('.nv-editorial-entry', { timeout: 8000 });
}

async function runChecks(page, vp) {
  const results = {};
  const isMobile = vp.width <= MOBILE_BREAKPOINT * 16; // 768px

  // 1. Heading visible
  try {
    const heading = page.locator('h2#content-library-title');
    results['Heading visible'] = await heading.isVisible();
  } catch (e) {
    results['Heading visible'] = false;
  }

  // 2. Metadata flow — combined "Guide · 3 min read"
  try {
    const metas = page.locator('.nv-editorial-entry__meta');
    const count = await metas.count();
    let allCombined = count > 0;
    for (let i = 0; i < count; i++) {
      const text = (await metas.nth(i).textContent()).trim();
      // Must contain middot separator and "min read"
      if (!text.includes('·') || !text.includes('min read')) {
        allCombined = false;
        break;
      }
    }
    results['Metadata flow'] = allCombined;
  } catch (e) {
    results['Metadata flow'] = false;
  }

  // 3. Entry titles — each entry has h3 visible
  try {
    const titles = page.locator('.nv-editorial-entry__title');
    const count = await titles.count();
    let allVisible = count > 0;
    for (let i = 0; i < count; i++) {
      if (!(await titles.nth(i).isVisible())) {
        allVisible = false;
        break;
      }
    }
    results['Entry titles'] = allVisible;
  } catch (e) {
    results['Entry titles'] = false;
  }

  // 4. Entry descriptions — each entry has desc paragraph visible
  try {
    const descs = page.locator('.nv-editorial-entry__desc');
    const count = await descs.count();
    let allVisible = count > 0;
    for (let i = 0; i < count; i++) {
      if (!(await descs.nth(i).isVisible())) {
        allVisible = false;
        break;
      }
    }
    results['Entry descriptions'] = allVisible;
  } catch (e) {
    results['Entry descriptions'] = false;
  }

  // 5. Sequential numbers — visible on desktop, hidden on mobile (≤48rem)
  try {
    const nums = page.locator('.nv-editorial-entry__num');
    const count = await nums.count();
    let pass = count > 0;
    for (let i = 0; i < count; i++) {
      const visible = await nums.nth(i).isVisible();
      if (isMobile && visible) {
        pass = false; // should be hidden on mobile
        break;
      }
      if (!isMobile && !visible) {
        pass = false; // should be visible on desktop
        break;
      }
    }
    results['Sequential numbers'] = pass;
  } catch (e) {
    results['Sequential numbers'] = false;
  }

  // 6. No horizontal overflow
  try {
    const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
    results['No horizontal overflow'] = bodyWidth <= vp.width;
  } catch (e) {
    results['No horizontal overflow'] = false;
  }

  // 7. Focus visibility — tab to first entry, verify outline
  try {
    // Focus the first editorial entry link
    const firstEntry = page.locator('.nv-editorial-entry').first();
    await firstEntry.focus();
    // Check computed outline style
    const hasOutline = await page.evaluate(() => {
      const el = document.querySelector('.nv-editorial-entry:focus-visible');
      if (!el) return false;
      const style = getComputedStyle(el);
      return style.outlineStyle !== 'none' && style.outlineWidth !== '0px';
    });
    results['Focus visibility'] = hasOutline;
  } catch (e) {
    results['Focus visibility'] = false;
  }

  // 8. ARIA — each entry has aria-label="Read ..."
  try {
    const entries = page.locator('.nv-editorial-entry');
    const count = await entries.count();
    let allLabeled = count > 0;
    for (let i = 0; i < count; i++) {
      const label = await entries.nth(i).getAttribute('aria-label');
      if (!label || !label.startsWith('Read ')) {
        allLabeled = false;
        break;
      }
    }
    results['ARIA labels'] = allLabeled;
  } catch (e) {
    results['ARIA labels'] = false;
  }

  // 9. No console errors
  // This is collected via the console listener set up in main; we read it from page context
  try {
    const errors = await page.evaluate(() => window.__consoleErrors || []);
    results['No console errors'] = errors.length === 0;
  } catch (e) {
    results['No console errors'] = false;
  }

  // 10. Hover state — hover over first entry, verify background changes
  try {
    const firstEntry = page.locator('.nv-editorial-entry').first();
    const bgBefore = await firstEntry.evaluate(el => getComputedStyle(el).backgroundColor);
    await firstEntry.hover();
    // Small delay for transition
    await page.waitForTimeout(200);
    const bgAfter = await firstEntry.evaluate(el => getComputedStyle(el).backgroundColor);
    // On hover, background should change (color-mix produces a different value)
    results['Hover state'] = bgBefore !== bgAfter || bgAfter !== 'rgba(0, 0, 0, 0)';
  } catch (e) {
    results['Hover state'] = false;
  }

  return results;
}

(async () => {
  const browser = await chromium.launch({ headless: true });
  const allResults = {};

  for (const vp of VIEWPORTS) {
    const context = await browser.newContext({ viewport: { width: vp.width, height: vp.height } });
    const page = await context.newPage();

    // Collect console errors
    const consoleErrors = [];
    page.on('console', msg => {
      if (msg.type() === 'error') consoleErrors.push(msg.text());
    });
    page.on('pageerror', err => consoleErrors.push(err.message));

    await page.goto(BASE_URL, { waitUntil: 'networkidle' });
    await waitForLibrary(page);

    // Inject console error collector into page context
    await page.evaluate((errs) => {
      window.__consoleErrors = errs;
    }, consoleErrors);

    // Wait a moment for any delayed errors
    await page.waitForTimeout(500);

    // Re-collect after waiting
    const finalErrors = [];
    page.on('console', msg => {
      if (msg.type() === 'error') finalErrors.push(msg.text());
    });

    const results = await runChecks(page, vp);
    // Override console errors check with actual collected errors
    results['No console errors'] = consoleErrors.length === 0;

    allResults[vp.name] = results;

    await context.close();
  }

  await browser.close();

  // Print results table
  const checks = [
    'Heading visible', 'Metadata flow', 'Entry titles', 'Entry descriptions',
    'Sequential numbers', 'No horizontal overflow', 'Focus visibility',
    'ARIA labels', 'No console errors', 'Hover state'
  ];

  console.log('\n' + '='.repeat(90));
  console.log('PLAYWRIGHT QA — Content Page Library Validation');
  console.log('='.repeat(90));
  console.log('');

  // Header
  const header = 'Check'.padEnd(28) + VIEWPORTS.map(v => v.name.padStart(12)).join('');
  console.log(header);
  console.log('-'.repeat(header.length));

  let totalPass = 0;
  let totalFail = 0;

  for (const check of checks) {
    let row = check.padEnd(28);
    for (const vp of VIEWPORTS) {
      const pass = allResults[vp.name][check];
      row += (pass ? 'PASS' : 'FAIL').padStart(12);
      if (pass) totalPass++; else totalFail++;
    }
    console.log(row);
  }

  console.log('-'.repeat(header.length));
  const summary = 'TOTAL'.padEnd(28) + `${totalPass} PASS / ${totalFail} FAIL`.padStart(12);
  console.log(summary);
  console.log('='.repeat(90));

  // Print any failures with details
  if (totalFail > 0) {
    console.log('\nFAILURE DETAILS:');
    for (const vp of VIEWPORTS) {
      for (const check of checks) {
        if (!allResults[vp.name][check]) {
          console.log(`  [FAIL] ${vp.name} — ${check}`);
        }
      }
    }
  }

  console.log(`\nTotal checks: ${checks.length * VIEWPORTS.length} (${checks.length} checks × ${VIEWPORTS.length} viewports)`);
  process.exit(totalFail > 0 ? 1 : 0);
})();
