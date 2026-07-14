import { test, expect } from '@playwright/test';

test.describe('Content Visibility', () => {
  test('check if params content is actually rendered and visible', async ({ page }) => {
    await page.goto('/#/laboratory/gradient-descent');
    await page.waitForSelector('[data-lab-v4-workspace]', { timeout: 15000 });
    await page.waitForTimeout(1000);

    // Check the params container and its children
    const contentInfo = await page.evaluate(() => {
      const params = document.querySelector('[data-lab-parameters]');
      if (!params) return { error: 'params not found' };

      const results = {
        paramsTag: params.tagName,
        paramsClass: params.className,
        paramsId: params.id,
        paramsParentTag: params.parentElement?.tagName,
        paramsParentClass: params.parentElement?.className,
        paramsParentId: params.parentElement?.id,
        paramsChildCount: params.children.length,
        paramsHTML: params.innerHTML.substring(0, 200),
      };

      // Check each child
      const children = [];
      for (let i = 0; i < params.children.length; i++) {
        const child = params.children[i];
        const cs = getComputedStyle(child);
        children.push({
          tag: child.tagName,
          class: child.className,
          display: cs.display,
          visibility: cs.visibility,
          height: cs.height,
          overflow: cs.overflow,
          position: cs.position,
        });
      }
      results.children = children;

      // Check the body-inner
      const inner = document.querySelector('#v4-parameters-body .nv-lab-v4-disclosure-panel__body-inner');
      if (inner) {
        results.innerHTML = inner.innerHTML.substring(0, 200);
        results.innerChildCount = inner.children.length;
        results.innerHeight = getComputedStyle(inner).height;
        results.innerOverflow = getComputedStyle(inner).overflow;
      }

      // Check the body
      const body = document.querySelector('#v4-parameters-body');
      if (body) {
        results.bodyHTML = body.innerHTML.substring(0, 200);
        results.bodyChildCount = body.children.length;
      }

      // Walk up from params to find any hidden ancestor
      let el = params;
      const ancestors = [];
      while (el && el !== document.body) {
        const cs = getComputedStyle(el);
        if (cs.display === 'none' || cs.visibility === 'hidden' || cs.height === '0px') {
          ancestors.push({
            tag: el.tagName,
            class: el.className,
            id: el.id,
            display: cs.display,
            visibility: cs.visibility,
            height: cs.height,
            overflow: cs.overflow,
          });
        }
        el = el.parentElement;
      }
      results.hiddenAncestors = ancestors;

      return results;
    });

    console.log('Content info:', JSON.stringify(contentInfo, null, 2));

    // Check if the params are inside the correct container
    const containerCheck = await page.evaluate(() => {
      const params = document.querySelector('[data-lab-parameters]');
      const body = document.querySelector('#v4-parameters-body');
      return {
        paramsInBody: body?.contains(params),
        bodyParent: body?.parentElement?.className,
        bodyGrandparent: body?.parentElement?.parentElement?.className,
      };
    });
    console.log('Container check:', JSON.stringify(containerCheck));
  });
});
