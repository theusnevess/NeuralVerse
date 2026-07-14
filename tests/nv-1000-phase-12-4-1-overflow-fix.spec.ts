import { test, expect } from '@playwright/test';

test.describe('Overflow Fix Test', () => {
  test('test removing overflow:hidden from body', async ({ page }) => {
    await page.goto('/#/laboratory/gradient-descent');
    await page.waitForSelector('[data-lab-v4-workspace]', { timeout: 15000 });
    await page.waitForTimeout(1000);

    // Before fix
    const before = await page.evaluate(() => {
      const body = document.querySelector('#v4-parameters-body');
      return body ? { height: body.clientHeight, scrollHeight: body.scrollHeight } : null;
    });
    console.log('Before fix:', before);

    // Try removing overflow:hidden from body
    const afterRemoveOverflow = await page.evaluate(() => {
      const body = document.querySelector('#v4-parameters-body');
      if (!body) return null;
      body.style.overflow = 'visible';
      void body.offsetHeight;
      return { height: body.clientHeight, scrollHeight: body.scrollHeight };
    });
    console.log('After removing body overflow:', afterRemoveOverflow);

    // Try also removing overflow:hidden from panel
    const afterRemovePanelOverflow = await page.evaluate(() => {
      const panel = document.querySelector('[data-lab-v4-parameters]');
      const body = document.querySelector('#v4-parameters-body');
      if (panel) panel.style.overflow = 'visible';
      if (body) body.style.overflow = 'visible';
      void body?.offsetHeight;
      return { height: body?.clientHeight, scrollHeight: body?.scrollHeight };
    });
    console.log('After removing panel+body overflow:', afterRemovePanelOverflow);

    // Try setting height:auto on body
    const afterSetHeight = await page.evaluate(() => {
      const body = document.querySelector('#v4-parameters-body');
      if (!body) return null;
      body.style.height = 'auto';
      body.style.overflow = 'visible';
      void body.offsetHeight;
      return { height: body.clientHeight, scrollHeight: body.scrollHeight };
    });
    console.log('After setting height:auto:', afterSetHeight);

    // Check if the body-inner is the constraint
    const innerTest = await page.evaluate(() => {
      const inner = document.querySelector('#v4-parameters-body .nv-lab-v4-disclosure-panel__body-inner');
      if (!inner) return null;
      inner.style.height = 'auto';
      inner.style.minHeight = '0';
      void inner.offsetHeight;
      const body = document.querySelector('#v4-parameters-body');
      return { 
        innerHeight: inner.clientHeight, 
        bodyHeight: body?.clientHeight,
        bodyScrollHeight: body?.scrollHeight
      };
    });
    console.log('After setting inner height:auto:', innerTest);

    // Nuclear option: remove all overflow constraints
    const nuclear = await page.evaluate(() => {
      const panel = document.querySelector('[data-lab-v4-parameters]');
      const body = document.querySelector('#v4-parameters-body');
      const inner = body?.querySelector('.nv-lab-v4-disclosure-panel__body-inner');
      if (panel) {
        panel.style.overflow = 'visible';
        panel.style.height = 'auto';
      }
      if (body) {
        body.style.overflow = 'visible';
        body.style.height = 'auto';
        body.style.maxHeight = 'none';
      }
      if (inner) {
        inner.style.height = 'auto';
      }
      void body?.offsetHeight;
      return {
        panelHeight: panel?.clientHeight,
        bodyHeight: body?.clientHeight,
        bodyScrollHeight: body?.scrollHeight,
        innerHeight: inner?.clientHeight,
      };
    });
    console.log('Nuclear fix:', nuclear);

    // Take screenshot
    await page.screenshot({ path: 'test-results/nv-1000-phase-12-4-1/overflow-fix-test.png', fullPage: true });
  });
});
