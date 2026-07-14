import { test, expect } from '@playwright/test';

test.describe('Timing Diagnostic', () => {
  test('check body height at different time points', async ({ page }) => {
    await page.goto('/#/laboratory/gradient-descent');
    await page.waitForSelector('[data-lab-v4-workspace]', { timeout: 15000 });

    // Check immediately
    const immediate = await page.evaluate(() => {
      const body = document.querySelector('#v4-parameters-body');
      const params = body?.querySelector('[data-lab-parameters]');
      return {
        bodyHeight: body?.clientHeight,
        bodyScrollHeight: body?.scrollHeight,
        paramsHeight: params?.clientHeight,
        paramsScrollHeight: params?.scrollHeight,
        bodyMaxHeight: body ? getComputedStyle(body).maxHeight : 'n/a',
        bodyOverflow: body ? getComputedStyle(body).overflow : 'n/a',
      };
    });
    console.log('Immediate:', JSON.stringify(immediate));

    // Wait 500ms
    await page.waitForTimeout(500);
    const after500 = await page.evaluate(() => {
      const body = document.querySelector('#v4-parameters-body');
      const params = body?.querySelector('[data-lab-parameters]');
      return {
        bodyHeight: body?.clientHeight,
        bodyScrollHeight: body?.scrollHeight,
        paramsHeight: params?.clientHeight,
        paramsScrollHeight: params?.scrollHeight,
      };
    });
    console.log('After 500ms:', JSON.stringify(after500));

    // Wait 1s
    await page.waitForTimeout(500);
    const after1000 = await page.evaluate(() => {
      const body = document.querySelector('#v4-parameters-body');
      const params = body?.querySelector('[data-lab-parameters]');
      return {
        bodyHeight: body?.clientHeight,
        bodyScrollHeight: body?.scrollHeight,
        paramsHeight: params?.clientHeight,
        paramsScrollHeight: params?.scrollHeight,
      };
    });
    console.log('After 1000ms:', JSON.stringify(after1000));

    // Check if the body has any CSS that prevents growth
    const bodyCSSTest = await page.evaluate(() => {
      const body = document.querySelector('#v4-parameters-body');
      if (!body) return 'not found';
      
      // Try setting height explicitly
      body.style.height = 'auto';
      void body.offsetHeight;
      const h1 = body.clientHeight;
      
      // Try min-height
      body.style.height = '';
      body.style.minHeight = '200px';
      void body.offsetHeight;
      const h2 = body.clientHeight;
      
      // Restore
      body.style.minHeight = '';
      
      return { heightAuto: h1, minHeight200: h2 };
    });
    console.log('CSS override test:', JSON.stringify(bodyCSSTest));

    // Check if the body-inner has any constraints
    const innerTest = await page.evaluate(() => {
      const inner = document.querySelector('#v4-parameters-body .nv-lab-v4-disclosure-panel__body-inner');
      if (!inner) return 'not found';
      const cs = getComputedStyle(inner);
      return {
        display: cs.display,
        height: cs.height,
        minHeight: cs.minHeight,
        maxHeight: cs.maxHeight,
        overflow: cs.overflow,
        position: cs.position,
        flex: cs.flex,
      };
    });
    console.log('Inner CSS:', JSON.stringify(innerTest));

    // Check if the workspace has any constraints
    const workspaceTest = await page.evaluate(() => {
      const ws = document.querySelector('[data-lab-v4-disclosure-workspace]');
      if (!ws) return 'not found';
      const cs = getComputedStyle(ws);
      return {
        display: cs.display,
        flexDirection: cs.flexDirection,
        height: cs.height,
        overflow: cs.overflow,
      };
    });
    console.log('Workspace CSS:', JSON.stringify(workspaceTest));

    // Check the parent of the panel
    const parentTest = await page.evaluate(() => {
      const panel = document.querySelector('[data-lab-v4-parameters]');
      if (!panel) return 'not found';
      const parent = panel.parentElement;
      if (!parent) return 'no parent';
      const cs = getComputedStyle(parent);
      return {
        tag: parent.tagName,
        display: cs.display,
        flexDirection: cs.flexDirection,
        height: cs.height,
        overflow: cs.overflow,
      };
    });
    console.log('Panel parent CSS:', JSON.stringify(parentTest));
  });
});
