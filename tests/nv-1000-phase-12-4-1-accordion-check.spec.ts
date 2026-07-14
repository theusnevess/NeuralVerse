import { test, expect } from '@playwright/test';

test('find accordion triggers in stage', async ({ page }) => {
  await page.goto('/#/laboratory/gradient-descent');
  await page.waitForSelector('[data-lab-v4-workspace]', { timeout: 15000 });
  await page.waitForTimeout(1000);

  const info = await page.evaluate(() => {
    const stage = document.querySelector('[data-lab-v4-stage]');
    if (!stage) return { error: 'stage not found' };

    const accordions = stage.querySelectorAll('[data-accordion-trigger], [data-drawer-trigger]');
    const results = [];
    accordions.forEach(el => {
      results.push({
        tag: el.tagName,
        class: el.className,
        dataAttr: el.getAttribute('data-accordion-trigger') || el.getAttribute('data-drawer-trigger'),
        parentClass: el.parentElement?.className,
        parentDataAttr: el.parentElement?.getAttribute('data-lab-hud-accordion') || el.parentElement?.getAttribute('data-lab-hud-drawer'),
        stagePath: el.closest('[data-lab-v4-stage]') ? 'in-stage' : 'not-in-stage',
      });
    });

    return { count: results.length, triggers: results };
  });

  console.log('Accordion triggers in stage:', JSON.stringify(info, null, 2));
});
