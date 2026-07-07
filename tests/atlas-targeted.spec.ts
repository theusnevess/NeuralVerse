import { test, type Page } from '@playwright/test';

const BASE = 'http://localhost:8080';
const ATLAS_ROUTE = `${BASE}/#/knowledge-graph`;
const DIR = 'test-results/atlas-audit';

// Fix: check actual DOM selectors that Atlas uses
test('Correct DOM selector inspection', async ({ page }) => {
  await page.goto(ATLAS_ROUTE, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(4000);

  const info = await page.evaluate(() => {
    // Check actual Atlas selectors
    const checks = {
      // Page-level
      atlasPage: !!document.querySelector('.nv-atlas-page'),
      atlasRoute: !!document.querySelector('.nv-atlas-route'),
      atlasBrowserHost: !!document.querySelector('.nv-atlas-browser-host'),
      
      // Header
      header: !!document.querySelector('.nv-atlas-header'),
      headerVisible: document.querySelector('.nv-atlas-header')?.getBoundingClientRect().height! > 0,
      title: document.querySelector('.nv-atlas-title')?.textContent?.trim() || null,
      eyebrow: document.querySelector('.nv-atlas-eyebrow')?.textContent?.trim() || null,
      copy: document.querySelector('.nv-atlas-copy')?.textContent?.trim() || null,
      actions: !!document.querySelector('.nv-atlas-actions'),
      
      // Canvas
      canvasFrame: !!document.querySelector('.nv-atlas-canvas-frame'),
      canvasFrameVisible: document.querySelector('.nv-atlas-canvas-frame')?.getBoundingClientRect().height! > 0,
      canvasCount: document.querySelectorAll('canvas').length,
      
      // Orientation
      orientation: !!document.querySelector('.nv-atlas-orientation'),
      orientationVisible: document.querySelector('.nv-atlas-orientation')?.getBoundingClientRect().height! > 0,
      orientationEyebrow: document.querySelector('.nv-atlas-orientation-eyebrow')?.textContent?.trim() || null,
      orientationValue: document.querySelector('.nv-atlas-orientation-value')?.textContent?.trim() || null,
      orientationHint: document.querySelector('.nv-atlas-orientation-hint')?.textContent?.trim() || null,
      
      // Legend
      legend: !!document.querySelector('.nv-atlas-legend'),
      legendVisible: document.querySelector('.nv-atlas-legend')?.getBoundingClientRect().height! > 0,
      
      // Selection readout
      selectionReadout: !!document.querySelector('.nv-atlas-selection-readout'),
      selectionText: document.querySelector('.nv-atlas-selection-readout')?.textContent?.trim() || null,
      
      // Context panel
      contextPanel: !!document.querySelector('.nv-context-panel, #atlas-context-panel'),
      contextPanelVisible: document.querySelector('.nv-context-panel, #atlas-context-panel')?.getBoundingClientRect().height! > 0,
      contextPanelWidth: document.querySelector('.nv-context-panel, #atlas-context-panel')?.getBoundingClientRect().width || 0,
      
      // Onboarding
      onboardingIntro: document.querySelector('.nv-atlas-onboarding-intro')?.textContent?.trim()?.substring(0, 100) || null,
      onboardingHint: document.querySelector('.nv-atlas-onboarding-hint')?.textContent?.trim() || null,
      journeyList: Array.from(document.querySelectorAll('.nv-atlas-onboarding-journey-list li')).map(li => li.textContent?.trim()?.substring(0, 40) || ''),
      
      // Skip links
      atlasSkipLink: document.querySelector('.nv-atlas-skip-link')?.getAttribute('href') || null,
      
      // Reset button
      resetButton: !!document.querySelector('.nv-atlas-reset'),
      resetButtonText: document.querySelector('.nv-atlas-reset')?.textContent?.trim() || null,
      
      // Focus/Zen buttons
      focusButton: !!document.querySelector('button'),
      zenButton: Array.from(document.querySelectorAll('button')).find(b => b.textContent?.includes('Zen'))?.textContent?.trim() || null,
      
      // Copilot
      copilot: !!document.querySelector('.nv-copilot, [class*="copilot"]'),
      
      // Developer mode
      devMode: !!document.querySelector('[class*="developer"]'),
      
      // Context readout
      contextReadout: !!document.querySelector('.nv-atlas-context-readout'),
      contextReadoutRole: document.querySelector('.nv-atlas-context-readout')?.getAttribute('role') || null,
      contextReadoutLabel: document.querySelector('.nv-atlas-context-readout')?.getAttribute('aria-label') || null,
      contextReadoutVisible: document.querySelector('.nv-atlas-context-readout')?.getBoundingClientRect().height! > 0,
      
      // Canvas accessible attributes
      canvasRole: document.querySelectorAll('canvas')[1]?.getAttribute('role') || null,
      canvasLabel: document.querySelectorAll('canvas')[1]?.getAttribute('aria-label') || null,
      canvasTabindex: document.querySelectorAll('canvas')[1]?.getAttribute('tabindex') || null,
      canvasDescribedby: document.querySelectorAll('canvas')[1]?.getAttribute('aria-describedby') || null,
    };
    return checks;
  });

  console.log('\n═══════════════════════════════════════════════════════════════');
  console.log('CORRECT DOM SELECTOR INSPECTION');
  console.log('═══════════════════════════════════════════════════════════════');
  for (const [k, v] of Object.entries(info)) {
    const val = Array.isArray(v) ? (v.length > 0 ? v.join(', ') : '[]') : String(v);
    console.log(`  ${k.padEnd(30)} = ${val}`);
  }
  console.log('═══════════════════════════════════════════════════════════════\n');
});

// Test node selection with different click positions
test('Node selection with varied click positions', async ({ page }) => {
  await page.goto(ATLAS_ROUTE, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(4000);

  const canvas = await page.$('canvas');
  const box = await canvas!.boundingBox();
  
  // Try clicking at multiple positions across the canvas
  const positions = [
    { name: 'center', x: 0.5, y: 0.5 },
    { name: 'top-left-quarter', x: 0.25, y: 0.25 },
    { name: 'top-right-quarter', x: 0.75, y: 0.25 },
    { name: 'bottom-left-quarter', x: 0.25, y: 0.75 },
    { name: 'bottom-right-quarter', x: 0.75, y: 0.75 },
    { name: 'left-edge', x: 0.1, y: 0.5 },
    { name: 'right-edge', x: 0.9, y: 0.5 },
    { name: 'top-center', x: 0.5, y: 0.15 },
    { name: 'bottom-center', x: 0.5, y: 0.85 },
  ];

  let selectionFound = false;
  
  for (const pos of positions) {
    const clickX = box!.x + box!.width * pos.x;
    const clickY = box!.y + box!.height * pos.y;
    
    await page.mouse.click(clickX, clickY);
    await page.waitForTimeout(600);
    
    const state = await page.evaluate(() => {
      const sel = document.querySelector('.nv-atlas-selection-readout');
      const ctx = document.querySelector('.nv-context-panel, #atlas-context-panel');
      return {
        selectionText: sel?.textContent?.trim() || 'NONE',
        contextVisible: ctx ? ctx.getBoundingClientRect().height > 0 : false,
        contextText: ctx?.textContent?.trim()?.substring(0, 150) || 'NONE',
      };
    });
    
    if (state.selectionText !== 'NONE' && state.selectionText !== '') {
      selectionFound = true;
      console.log(`Node found at ${pos.name}: "${state.selectionText}"`);
      await page.screenshot({ path: `${DIR}/node-select-${pos.name}.png` });
      
      if (state.contextVisible) {
        console.log(`  Context panel: "${state.contextText}"`);
      }
      break;
    }
  }
  
  if (!selectionFound) {
    console.log('No node selection triggered at any tested position');
    // Try hovering to trigger tooltip
    for (const pos of positions) {
      const hoverX = box!.x + box!.width * pos.x;
      const hoverY = box!.y + box!.height * pos.y;
      await page.mouse.move(hoverX, hoverY);
      await page.waitForTimeout(400);
    }
  }
});

// Test hover tooltip
test('Hover tooltip detection', async ({ page }) => {
  await page.goto(ATLAS_ROUTE, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(4000);

  const canvas = await page.$('canvas');
  const box = await canvas!.boundingBox();
  
  // Scan for nodes by hovering across the canvas
  const step = 30;
  let tooltipFound = false;
  
  for (let x = box!.x + 20; x < box!.x + box!.width - 20; x += step) {
    for (let y = box!.y + 20; y < box!.y + box!.height - 20; y += step) {
      await page.mouse.move(x, y);
      await page.waitForTimeout(50);
      
      const tooltip = await page.evaluate(() => {
        const tt = document.querySelector('.nv-atlas-hover-tooltip, [class*="tooltip"]');
        if (!tt) return null;
        const rect = tt.getBoundingClientRect();
        return {
          visible: rect.width > 0 && rect.height > 0,
          text: tt.textContent?.trim()?.substring(0, 100) || '',
          display: window.getComputedStyle(tt).display,
        };
      });
      
      if (tooltip && tooltip.visible && tooltip.text) {
        tooltipFound = true;
        console.log(`Tooltip found at (${x}, ${y}): "${tooltip.text}"`);
        await page.screenshot({ path: `${DIR}/tooltip-found.png` });
        break;
      }
    }
    if (tooltipFound) break;
  }
  
  if (!tooltipFound) {
    console.log('No tooltip detected during hover scan');
  }
});

// Test zoom reveals information
test('Zoom information progression', async ({ page }) => {
  await page.goto(ATLAS_ROUTE, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(4000);

  const canvas = await page.$('canvas');
  const box = await canvas!.boundingBox();
  const centerX = box!.x + box!.width / 2;
  const centerY = box!.y + box!.height / 2;

  // Start at default zoom
  await page.screenshot({ path: `${DIR}/zoom-default.png` });

  // Zoom in progressively
  await page.mouse.move(centerX, centerY);
  for (let i = 0; i < 5; i++) {
    await page.mouse.wheel(0, -300);
    await page.waitForTimeout(500);
  }
  await page.screenshot({ path: `${DIR}/zoom-max-in.png` });

  // Zoom out progressively
  for (let i = 0; i < 10; i++) {
    await page.mouse.wheel(0, 300);
    await page.waitForTimeout(500);
  }
  await page.screenshot({ path: `${DIR}/zoom-max-out.png` });
});

// Test reset view
test('Reset view functionality', async ({ page }) => {
  await page.goto(ATLAS_ROUTE, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(4000);

  // Pan and zoom away
  const canvas = await page.$('canvas');
  const box = await canvas!.boundingBox();
  
  await page.mouse.move(box!.x + box!.width / 2, box!.y + box!.height / 2);
  await page.mouse.wheel(0, -500);
  await page.waitForTimeout(500);
  
  // Find and click reset button
  const resetBtn = await page.$('.nv-atlas-reset');
  if (resetBtn) {
    await resetBtn.click();
    await page.waitForTimeout(1000);
    await page.screenshot({ path: `${DIR}/after-reset.png` });
    console.log('Reset button clicked successfully');
  } else {
    console.log('Reset button not found');
  }
});

// Test context panel onboarding state
test('Context panel onboarding', async ({ page }) => {
  await page.goto(ATLAS_ROUTE, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(4000);

  const onboarding = await page.evaluate(() => {
    const intro = document.querySelector('.nv-atlas-onboarding-intro');
    const hint = document.querySelector('.nv-atlas-onboarding-hint');
    const journeys = Array.from(document.querySelectorAll('.nv-atlas-onboarding-journey-list li button'));
    
    return {
      introText: intro?.textContent?.trim() || null,
      hint: hint?.textContent?.trim() || null,
      journeyCount: journeys.length,
      journeyNames: journeys.map(b => b.textContent?.trim()?.split('\n')[0]?.trim() || '').filter(Boolean),
    };
  });

  console.log('\n═══════════════════════════════════════════════════════════════');
  console.log('CONTEXT PANEL ONBOARDING');
  console.log('═══════════════════════════════════════════════════════════════');
  console.log(`Intro: "${onboarding.introText}"`);
  console.log(`Hint: "${onboarding.hint}"`);
  console.log(`Journeys (${onboarding.journeyCount}):`);
  onboarding.journeyNames.forEach(n => console.log(`  - ${n}`));
  console.log('═══════════════════════════════════════════════════════════════\n');
  
  await page.screenshot({ path: `${DIR}/context-onboarding.png` });
});

// Test keyboard interaction with canvas focused
test('Keyboard with canvas focused', async ({ page }) => {
  await page.goto(ATLAS_ROUTE, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(4000);

  // Focus the canvas via tabindex
  await page.evaluate(() => {
    const canvas = document.querySelectorAll('canvas')[1];
    if (canvas) (canvas as HTMLElement).focus();
  });
  await page.waitForTimeout(300);

  // Test keyboard shortcuts
  const keys = ['Escape', 'ArrowRight', 'ArrowDown', 'ArrowLeft', 'ArrowUp', 
                'Tab', 'Enter', ' ', 'r', 'R', 'f', 'F', 'z', 'Z'];

  for (const key of keys) {
    await page.keyboard.press(key);
    await page.waitForTimeout(200);
  }
  
  await page.screenshot({ path: `${DIR}/keyboard-canvas.png` });
  console.log('Keyboard test completed with canvas focused');
});
