import { test, expect, type Page } from '@playwright/test';

const BASE = 'http://localhost:8080';
const ATLAS_ROUTE = `${BASE}/#/knowledge-graph`;
const DIR = 'test-results/atlas-audit';

// Deep DOM inspection for atlas elements
test('DOM deep inspection', async ({ page }) => {
  await page.goto(ATLAS_ROUTE, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(4000); // Wait for atlas to fully initialize

  const dom = await page.evaluate(() => {
    const body = document.body;
    
    // Find all atlas-specific elements
    const allElements = Array.from(document.querySelectorAll('*'));
    const atlasElements = allElements.filter(el => {
      const classes = el.className?.toString() || '';
      const attrs = Array.from(el.attributes).map(a => a.name + '=' + a.value).join(' ');
      return classes.includes('nv-atlas') || attrs.includes('atlas') || 
             classes.includes('nv-kg') || attrs.includes('knowledge-graph');
    }).map(el => ({
      tag: el.tagName,
      id: el.id || null,
      classes: el.className?.toString()?.substring(0, 100) || null,
      role: el.getAttribute('role') || null,
      ariaLabel: el.getAttribute('aria-label') || null,
      ariaLabelledBy: el.getAttribute('aria-labelledby') || null,
      ariaDescribedBy: el.getAttribute('aria-describedby') || null,
      tabindex: el.getAttribute('tabindex') || null,
      visible: el.getBoundingClientRect().height > 0 && el.getBoundingClientRect().width > 0,
      rect: {
        x: Math.round(el.getBoundingClientRect().x),
        y: Math.round(el.getBoundingClientRect().y),
        w: Math.round(el.getBoundingClientRect().width),
        h: Math.round(el.getBoundingClientRect().height),
      },
    }));

    // Canvas info
    const canvases = Array.from(document.querySelectorAll('canvas')).map(c => ({
      width: c.width,
      height: c.height,
      role: c.getAttribute('role'),
      ariaLabel: c.getAttribute('aria-label'),
      ariaDescribedBy: c.getAttribute('aria-describedby'),
      tabindex: c.getAttribute('tabindex'),
      style: c.style.cssText?.substring(0, 100),
      rect: {
        x: Math.round(c.getBoundingClientRect().x),
        y: Math.round(c.getBoundingClientRect().y),
        w: Math.round(c.getBoundingClientRect().width),
        h: Math.round(c.getBoundingClientRect().height),
      },
    }));

    // H1s
    const h1s = Array.from(document.querySelectorAll('h1')).map(h => h.textContent?.trim());

    // Skip links
    const skipLinks = Array.from(document.querySelectorAll('a[href^="#"]')).map(a => ({
      href: a.getAttribute('href'),
      text: a.textContent?.trim()?.substring(0, 50),
      visible: a.getBoundingClientRect().height > 0,
    }));

    // ARIA live regions
    const liveRegions = Array.from(document.querySelectorAll('[aria-live]')).map(el => ({
      tag: el.tagName,
      live: el.getAttribute('aria-live'),
      text: el.textContent?.trim()?.substring(0, 100),
    }));

    // Buttons
    const buttons = Array.from(document.querySelectorAll('button, [role="button"]')).map(b => ({
      text: b.textContent?.trim()?.substring(0, 50),
      ariaLabel: b.getAttribute('aria-label'),
      disabled: b.hasAttribute('disabled'),
      visible: b.getBoundingClientRect().height > 0,
    }));

    // Orientation strip
    const orientation = document.querySelector('[data-atlas-orientation]');
    const orientationInfo = orientation ? {
      text: orientation.textContent?.trim()?.substring(0, 200),
      visible: orientation.getBoundingClientRect().height > 0,
      childCount: orientation.children.length,
    } : null;

    // Legend
    const legend = document.querySelector('[data-atlas-legend]');
    const legendInfo = legend ? {
      text: legend.textContent?.trim()?.substring(0, 200),
      visible: legend.getBoundingClientRect().height > 0,
      childCount: legend.children.length,
    } : null;

    // Context panel
    const context = document.querySelector('[data-atlas-context]');
    const contextInfo = context ? {
      text: context.textContent?.trim()?.substring(0, 300),
      visible: context.getBoundingClientRect().height > 0,
      childCount: context.children.length,
    } : null;

    // Selection readout
    const selection = document.querySelector('[data-atlas-selection]');
    const selectionInfo = selection ? {
      text: selection.textContent?.trim()?.substring(0, 200),
      visible: selection.getBoundingClientRect().height > 0,
    } : null;

    // Tooltip
    const tooltip = document.querySelector('[data-atlas-tooltip]');
    const tooltipInfo = tooltip ? {
      text: tooltip.textContent?.trim()?.substring(0, 200),
      visible: tooltip.getBoundingClientRect().width > 0,
      display: window.getComputedStyle(tooltip).display,
    } : null;

    // Journey panel
    const journey = document.querySelector('[data-atlas-journey]');
    const journeyInfo = journey ? {
      text: journey.textContent?.trim()?.substring(0, 300),
      visible: journey.getBoundingClientRect().height > 0,
    } : null;

    // Header
    const header = document.querySelector('[data-atlas-header]');
    const headerInfo = header ? {
      text: header.textContent?.trim()?.substring(0, 200),
      visible: header.getBoundingClientRect().height > 0,
    } : null;

    // Reset button
    const reset = document.querySelector('[data-atlas-reset]');
    const resetInfo = reset ? {
      text: reset.textContent?.trim()?.substring(0, 50),
      visible: reset.getBoundingClientRect().height > 0,
      tag: reset.tagName,
    } : null;

    // Canvas frame
    const frame = document.querySelector('[data-atlas-canvas-frame]');
    const frameInfo = frame ? {
      visible: frame.getBoundingClientRect().height > 0,
      rect: {
        x: Math.round(frame.getBoundingClientRect().x),
        y: Math.round(frame.getBoundingClientRect().y),
        w: Math.round(frame.getBoundingClientRect().width),
        h: Math.round(frame.getBoundingClientRect().height),
      },
    } : null;

    // Body styles
    const bodyStyles = window.getComputedStyle(body);

    // Check for horizontal overflow
    const overflow = document.documentElement.scrollWidth > document.documentElement.clientWidth;

    return {
      atlasElements,
      canvases,
      h1s,
      skipLinks,
      liveRegions,
      buttons,
      orientationInfo,
      legendInfo,
      contextInfo,
      selectionInfo,
      tooltipInfo,
      journeyInfo,
      headerInfo,
      resetInfo,
      frameInfo,
      bodyBg: bodyStyles.backgroundColor,
      overflow,
      totalElements: allElements.length,
      viewportW: window.innerWidth,
      viewportH: window.innerHeight,
    };
  });

  console.log('\n═══════════════════════════════════════════════════════════════');
  console.log('ATLAS DOM DEEP INSPECTION');
  console.log('═══════════════════════════════════════════════════════════════');
  console.log(`Viewport: ${dom.viewportW}x${dom.viewportH}`);
  console.log(`Total elements: ${dom.totalElements}`);
  console.log(`Body BG: ${dom.bodyBg}`);
  console.log(`Horizontal overflow: ${dom.overflow}`);
  console.log(`\nCanvases: ${dom.canvases.length}`);
  dom.canvases.forEach((c, i) => {
    console.log(`  [${i}] ${c.width}x${c.height} role=${c.role} aria-label="${c.ariaLabel}" tabindex=${c.tabindex}`);
    console.log(`      describedby=${c.ariaDescribedBy}`);
    console.log(`      rect: x=${c.rect.x} y=${c.rect.y} w=${c.rect.w} h=${c.rect.h}`);
  });
  console.log(`\nH1s: ${JSON.stringify(dom.h1s)}`);
  console.log(`\nSkip links: ${dom.skipLinks.length}`);
  dom.skipLinks.forEach(s => console.log(`  href=${s.href} text="${s.text}" visible=${s.visible}`));
  console.log(`\nLive regions: ${dom.liveRegions.length}`);
  dom.liveRegions.forEach(l => console.log(`  <${l.tag}> aria-live=${l.live} text="${l.text}"`));
  console.log(`\nButtons: ${dom.buttons.length}`);
  dom.buttons.forEach(b => console.log(`  "${b.text}" aria-label="${b.ariaLabel}" disabled=${b.disabled} visible=${b.visible}`));
  console.log(`\nOrientation strip: ${dom.orientationInfo ? 'YES' : 'NO'}`);
  if (dom.orientationInfo) console.log(`  text="${dom.orientationInfo.text}" visible=${dom.orientationInfo.visible}`);
  console.log(`Legend: ${dom.legendInfo ? 'YES' : 'NO'}`);
  if (dom.legendInfo) console.log(`  text="${dom.legendInfo.text}" visible=${dom.legendInfo.visible}`);
  console.log(`Context panel: ${dom.contextInfo ? 'YES' : 'NO'}`);
  if (dom.contextInfo) console.log(`  text="${dom.contextInfo.text}" visible=${dom.contextInfo.visible}`);
  console.log(`Selection readout: ${dom.selectionInfo ? 'YES' : 'NO'}`);
  if (dom.selectionInfo) console.log(`  text="${dom.selectionInfo.text}" visible=${dom.selectionInfo.visible}`);
  console.log(`Tooltip: ${dom.tooltipInfo ? 'YES' : 'NO'}`);
  if (dom.tooltipInfo) console.log(`  display=${dom.tooltipInfo.display} visible=${dom.tooltipInfo.visible}`);
  console.log(`Journey panel: ${dom.journeyInfo ? 'YES' : 'NO'}`);
  if (dom.journeyInfo) console.log(`  text="${dom.journeyInfo.text}" visible=${dom.journeyInfo.visible}`);
  console.log(`Header: ${dom.headerInfo ? 'YES' : 'NO'}`);
  if (dom.headerInfo) console.log(`  text="${dom.headerInfo.text}" visible=${dom.headerInfo.visible}`);
  console.log(`Reset button: ${dom.resetInfo ? 'YES' : 'NO'}`);
  if (dom.resetInfo) console.log(`  <${dom.resetInfo.tag}> text="${dom.resetInfo.text}" visible=${dom.resetInfo.visible}`);
  console.log(`Canvas frame: ${dom.frameInfo ? 'YES' : 'NO'}`);
  if (dom.frameInfo) console.log(`  rect: w=${dom.frameInfo.rect.w} h=${dom.frameInfo.rect.h}`);
  console.log(`\nAtlas-specific elements found: ${dom.atlasElements.length}`);
  dom.atlasElements.forEach(e => {
    console.log(`  <${e.tag}> id=${e.id} class="${e.classes}" role=${e.role} visible=${e.visible} w=${e.rect.w} h=${e.rect.h}`);
  });
  console.log('═══════════════════════════════════════════════════════════════\n');
});

// Interaction deep inspection
test('Interaction deep inspection', async ({ page }) => {
  await page.goto(ATLAS_ROUTE, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(4000);

  const canvas = await page.$('canvas');
  const box = await canvas!.boundingBox();
  
  // Get initial state
  const state1 = await page.evaluate(() => {
    const sel = document.querySelector('[data-atlas-selection]');
    return { selectionText: sel?.textContent?.trim() || 'NONE' };
  });

  // Click on canvas
  await page.mouse.click(box!.x + box!.width / 2, box!.y + box!.height / 2);
  await page.waitForTimeout(1000);

  const state2 = await page.evaluate(() => {
    const sel = document.querySelector('[data-atlas-selection]');
    const ctx = document.querySelector('[data-atlas-context]');
    return {
      selectionText: sel?.textContent?.trim() || 'NONE',
      contextText: ctx?.textContent?.trim()?.substring(0, 300) || 'NONE',
      contextVisible: ctx ? ctx.getBoundingClientRect().height > 0 : false,
    };
  });

  console.log('\n═══════════════════════════════════════════════════════════════');
  console.log('INTERACTION DEEP INSPECTION');
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('Before click:');
  console.log(`  Selection: "${state1.selectionText}"`);
  console.log('After click:');
  console.log(`  Selection: "${state2.selectionText}"`);
  console.log(`  Context: "${state2.contextText}"`);
  console.log(`  Context visible: ${state2.contextVisible}`);
  console.log('═══════════════════════════════════════════════════════════════\n');
});

// Responsive behavior inspection
test('Responsive behavior inspection', async ({ page }) => {
  const viewports = [
    { name: 'desktop-1440', w: 1440, h: 900 },
    { name: 'desktop-1280', w: 1280, h: 800 },
    { name: 'tablet-1024', w: 1024, h: 768 },
    { name: 'tablet-portrait-768', w: 768, h: 1024 },
    { name: 'mobile-430', w: 430, h: 932 },
    { name: 'mobile-390', w: 390, h: 844 },
    { name: 'mobile-360', w: 360, h: 740 },
  ];

  console.log('\n═══════════════════════════════════════════════════════════════');
  console.log('RESPONSIVE BEHAVIOR INSPECTION');
  console.log('═══════════════════════════════════════════════════════════════');

  for (const vp of viewports) {
    await page.setViewportSize({ width: vp.w, height: vp.h });
    await page.goto(ATLAS_ROUTE, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(3000);

    const info = await page.evaluate(() => {
      const canvas = document.querySelector('canvas');
      const frame = document.querySelector('[data-atlas-canvas-frame]');
      const context = document.querySelector('[data-atlas-context]');
      const orientation = document.querySelector('[data-atlas-orientation]');
      const legend = document.querySelector('[data-atlas-legend]');
      const header = document.querySelector('[data-atlas-header]');
      
      return {
        canvas: canvas ? {
          w: Math.round(canvas.getBoundingClientRect().width),
          h: Math.round(canvas.getBoundingClientRect().height),
          visible: canvas.getBoundingClientRect().height > 0,
        } : null,
        frame: frame ? {
          w: Math.round(frame.getBoundingClientRect().width),
          h: Math.round(frame.getBoundingClientRect().height),
        } : null,
        context: context ? {
          visible: context.getBoundingClientRect().height > 0,
          w: Math.round(context.getBoundingClientRect().width),
          h: Math.round(context.getBoundingClientRect().height),
        } : null,
        orientation: orientation ? {
          visible: orientation.getBoundingClientRect().height > 0,
          w: Math.round(orientation.getBoundingClientRect().width),
        } : null,
        legend: legend ? {
          visible: legend.getBoundingClientRect().height > 0,
          w: Math.round(legend.getBoundingClientRect().width),
        } : null,
        header: header ? {
          visible: header.getBoundingClientRect().height > 0,
          h: Math.round(header.getBoundingClientRect().height),
        } : null,
        overflow: document.documentElement.scrollWidth > document.documentElement.clientWidth,
      };
    });

    await page.screenshot({ path: `${DIR}/responsive-${vp.name}.png`, fullPage: true });

    console.log(`\n[${vp.name}] ${vp.w}x${vp.h}`);
    console.log(`  Canvas: ${info.canvas ? `${info.canvas.w}x${info.canvas.h} visible=${info.canvas.visible}` : 'MISSING'}`);
    console.log(`  Frame: ${info.frame ? `${info.frame.w}x${info.frame.h}` : 'MISSING'}`);
    console.log(`  Context: ${info.context ? `visible=${info.context.visible} ${info.context.w}x${info.context.h}` : 'MISSING'}`);
    console.log(`  Orientation: ${info.orientation ? `visible=${info.orientation.visible} w=${info.orientation.w}` : 'MISSING'}`);
    console.log(`  Legend: ${info.legend ? `visible=${info.legend.visible} w=${info.legend.w}` : 'MISSING'}`);
    console.log(`  Header: ${info.header ? `visible=${info.header.visible} h=${info.header.h}` : 'MISSING'}`);
    console.log(`  Overflow: ${info.overflow}`);
  }
  console.log('═══════════════════════════════════════════════════════════════\n');
});

// Canvas pixel inspection
test('Canvas visual content inspection', async ({ page }) => {
  await page.goto(ATLAS_ROUTE, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(4000);

  const canvasInfo = await page.evaluate(() => {
    const canvas = document.querySelector('canvas') as HTMLCanvasElement;
    if (!canvas) return null;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    const w = canvas.width;
    const h = canvas.height;
    
    // Sample pixels across the canvas
    const samples: Array<{x: number; y: number; r: number; g: number; b: number; a: number}> = [];
    const step = 50;
    for (let x = 0; x < w; x += step) {
      for (let y = 0; y < h; y += step) {
        const data = ctx.getImageData(x, y, 1, 1).data;
        if (data[3] > 0) {
          samples.push({ x, y, r: data[0], g: data[1], b: data[2], a: data[3] });
        }
      }
    }

    // Count unique colors (simplified)
    const colorMap = new Map<string, number>();
    for (const s of samples) {
      const key = `${Math.round(s.r/16)*16},${Math.round(s.g/16)*16},${Math.round(s.b/16)*16}`;
      colorMap.set(key, (colorMap.get(key) || 0) + 1);
    }
    const topColors = Array.from(colorMap.entries()).sort((a, b) => b[1] - a[1]).slice(0, 10);

    return {
      canvasSize: `${w}x${h}`,
      totalSamples: samples.length,
      nonBlankPixels: samples.filter(s => s.a > 0).length,
      topColors: topColors.map(([c, n]) => ({ color: c, count: n })),
    };
  });

  console.log('\n═══════════════════════════════════════════════════════════════');
  console.log('CANVAS VISUAL CONTENT INSPECTION');
  console.log('═══════════════════════════════════════════════════════════════');
  if (canvasInfo) {
    console.log(`Canvas size: ${canvasInfo.canvasSize}`);
    console.log(`Total samples: ${canvasInfo.totalSamples}`);
    console.log(`Non-blank pixels: ${canvasInfo.nonBlankPixels}`);
    console.log(`Top colors:`);
    canvasInfo.topColors.forEach(c => console.log(`  rgb(${c.color}) × ${c.count}`));
  } else {
    console.log('Canvas not found or not renderable');
  }
  console.log('═══════════════════════════════════════════════════════════════\n');
});

// Accessibility deep inspection
test('Accessibility deep inspection', async ({ page }) => {
  await page.goto(ATLAS_ROUTE, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(4000);

  const a11y = await page.evaluate(() => {
    // All interactive elements
    const interactives = Array.from(document.querySelectorAll(
      'button, a[href], input, select, textarea, [tabindex], [role="button"], [role="link"]'
    )).map(el => ({
      tag: el.tagName,
      text: el.textContent?.trim()?.substring(0, 50),
      role: el.getAttribute('role'),
      ariaLabel: el.getAttribute('aria-label'),
      tabindex: el.getAttribute('tabindex'),
      visible: el.getBoundingClientRect().height > 0,
    }));

    // All aria attributes
    const ariaElements = Array.from(document.querySelectorAll('[aria-label], [aria-labelledby], [aria-describedby], [aria-live], [aria-hidden], [role]')).map(el => ({
      tag: el.tagName,
      role: el.getAttribute('role'),
      ariaLabel: el.getAttribute('aria-label'),
      ariaLabelledBy: el.getAttribute('aria-labelledby'),
      ariaDescribedBy: el.getAttribute('aria-describedby'),
      ariaLive: el.getAttribute('aria-live'),
      ariaHidden: el.getAttribute('aria-hidden'),
    }));

    // Heading hierarchy
    const headings = Array.from(document.querySelectorAll('h1, h2, h3, h4, h5, h6')).map(h => ({
      level: h.tagName,
      text: h.textContent?.trim()?.substring(0, 50),
    }));

    // Check for reduced motion media query
    const hasReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Check for high contrast
    const hasHighContrast = window.matchMedia('(prefers-contrast: high)').matches;

    return {
      interactives,
      ariaElements,
      headings,
      hasReducedMotion,
      hasHighContrast,
    };
  });

  console.log('\n═══════════════════════════════════════════════════════════════');
  console.log('ACCESSIBILITY DEEP INSPECTION');
  console.log('═══════════════════════════════════════════════════════════════');
  console.log(`\nInteractive elements (${a11y.interactives.length}):`);
  a11y.interactives.forEach(el => {
    console.log(`  <${el.tag}> "${el.text}" role=${el.role} aria-label="${el.ariaLabel}" tabindex=${el.tabindex} visible=${el.visible}`);
  });
  console.log(`\nARIA elements (${a11y.ariaElements.length}):`);
  a11y.ariaElements.forEach(el => {
    console.log(`  <${el.tag}> role=${el.role} label="${el.ariaLabel}" describedby="${el.ariaDescribedBy}" live="${el.ariaLive}"`);
  });
  console.log(`\nHeading hierarchy:`);
  a11y.headings.forEach(h => console.log(`  ${h.level}: "${h.text}"`));
  console.log(`\nReduced motion: ${a11y.hasReducedMotion}`);
  console.log(`High contrast: ${a11y.hasHighContrast}`);
  console.log('═══════════════════════════════════════════════════════════════\n');
});

// Console and performance inspection
test('Console and performance inspection', async ({ page }) => {
  const consoleLogs: Array<{type: string; text: string}> = [];
  const pageErrors: string[] = [];
  const networkErrors: string[] = [];

  page.on('console', msg => {
    consoleLogs.push({ type: msg.type(), text: msg.text() });
  });
  page.on('pageerror', err => pageErrors.push(err.message));
  page.on('requestfailed', req => networkErrors.push(`${req.url()} - ${req.failure()?.errorText}`));

  await page.goto(ATLAS_ROUTE, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(5000);

  // Interact
  const canvas = await page.$('canvas');
  if (canvas) {
    const box = await canvas.boundingBox();
    if (box) {
      await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2);
      await page.waitForTimeout(500);
      await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
      await page.mouse.wheel(0, -200);
      await page.waitForTimeout(500);
    }
  }

  await page.waitForTimeout(2000);

  const errors = consoleLogs.filter(l => l.type === 'error');
  const warnings = consoleLogs.filter(l => l.type === 'warning');

  console.log('\n═══════════════════════════════════════════════════════════════');
  console.log('CONSOLE & PERFORMANCE INSPECTION');
  console.log('═══════════════════════════════════════════════════════════════');
  console.log(`\nConsole errors (${errors.length}):`);
  errors.forEach(e => console.log(`  ${e.text.substring(0, 200)}`));
  console.log(`\nConsole warnings (${warnings.length}):`);
  warnings.forEach(w => console.log(`  ${w.text.substring(0, 200)}`));
  console.log(`\nPage errors (${pageErrors.length}):`);
  pageErrors.forEach(e => console.log(`  ${e.substring(0, 200)}`));
  console.log(`\nNetwork errors (${networkErrors.length}):`);
  networkErrors.forEach(e => console.log(`  ${e}`));
  console.log('═══════════════════════════════════════════════════════════════\n');
});
