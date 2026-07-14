import { test, expect } from '@playwright/test';

test.describe('Height Chain Diagnostic', () => {
  test('trace height through DOM hierarchy', async ({ page }) => {
    await page.goto('/#/laboratory/gradient-descent');
    await page.waitForSelector('[data-lab-v4-workspace]', { timeout: 15000 });
    await page.waitForTimeout(1000);

    const chain = await page.evaluate(() => {
      const results = [];
      
      // Panel
      const panel = document.querySelector('[data-lab-v4-parameters]');
      if (panel) {
        const cs = getComputedStyle(panel);
        results.push({
          element: 'panel',
          tag: panel.tagName,
          classes: panel.className,
          height: cs.height,
          maxHeight: cs.maxHeight,
          overflow: cs.overflow,
          scrollHeight: panel.scrollHeight,
          clientHeight: panel.clientHeight,
          offsetHeight: panel.offsetHeight,
        });
      }

      // Header
      const header = panel?.querySelector('.nv-lab-v4-disclosure-panel__header');
      if (header) {
        const cs = getComputedStyle(header);
        results.push({
          element: 'header',
          height: cs.height,
          scrollHeight: header.scrollHeight,
          clientHeight: header.clientHeight,
        });
      }

      // Body
      const body = document.querySelector('#v4-parameters-body');
      if (body) {
        const cs = getComputedStyle(body);
        results.push({
          element: 'body',
          height: cs.height,
          maxHeight: cs.maxHeight,
          overflow: cs.overflow,
          scrollHeight: body.scrollHeight,
          clientHeight: body.clientHeight,
          offsetHeight: body.offsetHeight,
        });
      }

      // Body inner
      const inner = body?.querySelector('.nv-lab-v4-disclosure-panel__body-inner');
      if (inner) {
        const cs = getComputedStyle(inner);
        results.push({
          element: 'body-inner',
          height: cs.height,
          scrollHeight: inner.scrollHeight,
          clientHeight: inner.clientHeight,
          offsetHeight: inner.offsetHeight,
        });
      }

      // Params container
      const params = body?.querySelector('[data-lab-parameters]');
      if (params) {
        const cs = getComputedStyle(params);
        results.push({
          element: 'params-container',
          height: cs.height,
          scrollHeight: params.scrollHeight,
          clientHeight: params.clientHeight,
          offsetHeight: params.offsetHeight,
          childCount: params.children.length,
        });
      }

      // First param group
      const firstGroup = params?.querySelector('.nv-lab-param-group');
      if (firstGroup) {
        const cs = getComputedStyle(firstGroup);
        results.push({
          element: 'first-param-group',
          height: cs.height,
          scrollHeight: firstGroup.scrollHeight,
        });
      }

      return results;
    });

    console.log('Height chain:');
    for (const item of chain) {
      console.log(`  ${item.element}: height=${item.height} scrollHeight=${item.scrollHeight} clientHeight=${item.clientHeight}`);
    }

    // Check if overflow:hidden on panel is the issue
    const panelOverflow = await page.evaluate(() => {
      const panel = document.querySelector('[data-lab-v4-parameters]');
      return panel ? getComputedStyle(panel).overflow : 'not found';
    });
    console.log('\nPanel overflow:', panelOverflow);

    // Check if removing overflow:hidden would fix it
    const testResult = await page.evaluate(() => {
      const panel = document.querySelector('[data-lab-v4-parameters]');
      if (!panel) return 'panel not found';
      
      // Temporarily remove overflow:hidden
      const originalOverflow = panel.style.overflow;
      panel.style.overflow = 'visible';
      
      // Wait for reflow
      void panel.offsetHeight;
      
      const body = document.querySelector('#v4-parameters-body');
      const bodyHeight = body ? body.clientHeight : 0;
      
      // Restore
      panel.style.overflow = originalOverflow;
      
      return { bodyHeightAfterFix: bodyHeight };
    });
    console.log('After removing panel overflow:', testResult);
  });
});
