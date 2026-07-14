import { test, expect } from '@playwright/test';

test.describe('CSS Diagnostic', () => {
  test('investigate body height constraint', async ({ page }) => {
    await page.goto('/#/laboratory/gradient-descent');
    await page.waitForSelector('[data-lab-v4-workspace]', { timeout: 15000 });
    await page.waitForTimeout(1000);

    // Get detailed CSS info for the body
    const bodyInfo = await page.evaluate(() => {
      const body = document.querySelector('#v4-parameters-body');
      if (!body) return { error: 'body not found' };
      const cs = getComputedStyle(body);
      
      // Check all box model properties
      const info = {
        display: cs.display,
        position: cs.position,
        width: cs.width,
        height: cs.height,
        minHeight: cs.minHeight,
        maxHeight: cs.maxHeight,
        overflow: cs.overflow,
        overflowX: cs.overflowX,
        overflowY: cs.overflowY,
        padding: cs.padding,
        margin: cs.margin,
        boxSizing: cs.boxSizing,
        visibility: cs.visibility,
        opacity: cs.opacity,
        transition: cs.transition,
      };

      // Check the inner content height
      const inner = body.querySelector('.nv-lab-v4-disclosure-panel__body-inner');
      if (inner) {
        info.innerHeight = inner.scrollHeight;
        info.innerClientHeight = inner.clientHeight;
        info.innerOffsetHeight = inner.offsetHeight;
      }

      // Check the params container
      const params = body.querySelector('[data-lab-parameters]');
      if (params) {
        info.paramsScrollHeight = params.scrollHeight;
        info.paramsClientHeight = params.clientHeight;
        info.paramsOffsetHeight = params.offsetHeight;
        info.paramsChildCount = params.children.length;
      }

      // Check all applied CSS rules
      const rules = [];
      for (let i = 0; i < document.styleSheets.length; i++) {
        try {
          const sheet = document.styleSheets[i];
          for (let j = 0; j < sheet.cssRules.length; j++) {
            const rule = sheet.cssRules[j];
            if (rule.selectorText && body.matches(rule.selectorText)) {
              rules.push({
                selector: rule.selectorText,
                cssText: rule.cssText.substring(0, 200)
              });
            }
          }
        } catch (e) {}
      }
      info.matchingRules = rules;

      return info;
    });

    console.log('Body CSS info:', JSON.stringify(bodyInfo, null, 2));

    // Also check the panel container
    const panelInfo = await page.evaluate(() => {
      const panel = document.querySelector('[data-lab-v4-parameters]');
      if (!panel) return { error: 'panel not found' };
      const cs = getComputedStyle(panel);
      return {
        display: cs.display,
        position: cs.position,
        height: cs.height,
        overflow: cs.overflow,
        maxHeight: cs.maxHeight,
      };
    });
    console.log('Panel CSS info:', JSON.stringify(panelInfo, null, 2));

    // Check if the body-inner has height
    const innerInfo = await page.evaluate(() => {
      const inner = document.querySelector('#v4-parameters-body .nv-lab-v4-disclosure-panel__body-inner');
      if (!inner) return { error: 'inner not found' };
      const cs = getComputedStyle(inner);
      return {
        display: cs.display,
        height: cs.height,
        scrollHeight: inner.scrollHeight,
        clientHeight: inner.clientHeight,
        childCount: inner.children.length,
      };
    });
    console.log('Inner CSS info:', JSON.stringify(innerInfo, null, 2));

    // Check if the body itself has any inline styles
    const inlineStyles = await page.evaluate(() => {
      const body = document.querySelector('#v4-parameters-body');
      return body ? body.style.cssText : 'not found';
    });
    console.log('Body inline styles:', inlineStyles);

    // Take a screenshot
    await page.screenshot({ path: 'test-results/nv-1000-phase-12-4-1/css-diagnostic.png', fullPage: true });
  });
});
