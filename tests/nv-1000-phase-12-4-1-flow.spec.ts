import { test, expect } from '@playwright/test';

test.describe('Flow Diagnostic', () => {
  test('check if params is out of flow', async ({ page }) => {
    await page.goto('/#/laboratory/gradient-descent');
    await page.waitForSelector('[data-lab-v4-workspace]', { timeout: 15000 });
    await page.waitForTimeout(1000);

    const flowInfo = await page.evaluate(() => {
      const params = document.querySelector('[data-lab-parameters]');
      const inner = document.querySelector('#v4-parameters-body .nv-lab-v4-disclosure-panel__body-inner');
      const body = document.querySelector('#v4-parameters-body');

      if (!params || !inner || !body) return { error: 'elements not found' };

      const paramsCS = getComputedStyle(params);
      const innerCS = getComputedStyle(inner);
      const bodyCS = getComputedStyle(body);

      return {
        params: {
          display: paramsCS.display,
          position: paramsCS.position,
          float: paramsCS.cssFloat,
          clear: paramsCS.clear,
          width: paramsCS.width,
          height: paramsCS.height,
          maxHeight: paramsCS.maxHeight,
          overflow: paramsCS.overflow,
          margin: paramsCS.margin,
          padding: paramsCS.padding,
        },
        inner: {
          display: innerCS.display,
          position: innerCS.position,
          float: innerCS.cssFloat,
          clear: innerCS.clear,
          width: innerCS.width,
          height: innerCS.height,
          minHeight: innerCS.minHeight,
          overflow: innerCS.overflow,
        },
        body: {
          display: bodyCS.display,
          position: bodyCS.position,
          width: bodyCS.width,
          height: bodyCS.height,
          overflow: bodyCS.overflow,
        },
      };
    });

    console.log('Flow info:', JSON.stringify(flowInfo, null, 2));

    // Try to understand why inner is 28px
    const innerDiagnostics = await page.evaluate(() => {
      const inner = document.querySelector('#v4-parameters-body .nv-lab-v4-disclosure-panel__body-inner');
      if (!inner) return { error: 'inner not found' };

      // Check all CSS rules that match
      const rules = [];
      for (let i = 0; i < document.styleSheets.length; i++) {
        try {
          const sheet = document.styleSheets[i];
          for (let j = 0; j < sheet.cssRules.length; j++) {
            const rule = sheet.cssRules[j];
            if (rule.selectorText && inner.matches(rule.selectorText)) {
              rules.push(rule.cssText.substring(0, 200));
            }
          }
        } catch (e) {}
      }

      // Try setting display: flow-root
      inner.style.display = 'flow-root';
      void inner.offsetHeight;
      const h1 = inner.clientHeight;

      // Try setting display: block with explicit height
      inner.style.display = '';
      inner.style.height = 'auto';
      void inner.offsetHeight;
      const h2 = inner.clientHeight;

      // Try wrapping in a new div
      inner.style.height = '';
      const wrapper = document.createElement('div');
      wrapper.style.display = 'flow-root';
      inner.parentNode.insertBefore(wrapper, inner);
      wrapper.appendChild(inner);
      void wrapper.offsetHeight;
      const h3 = inner.clientHeight;
      const wrapperH = wrapper.clientHeight;

      // Restore
      wrapper.parentNode.insertBefore(inner, wrapper);
      wrapper.remove();
      inner.style.display = '';

      return {
        matchingRules: rules,
        flowRootHeight: h1,
        autoHeight: h2,
        wrappedHeight: h3,
        wrapperHeight: wrapperH,
      };
    });

    console.log('Inner diagnostics:', JSON.stringify(innerDiagnostics, null, 2));
  });
});
