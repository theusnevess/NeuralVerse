import { test, expect } from '@playwright/test';

test.describe('Panel CSS Rules', () => {
  test('find all matching rules for v4-parameters panel', async ({ page }) => {
    await page.goto('/#/laboratory/gradient-descent');
    await page.waitForSelector('[data-lab-v4-workspace]', { timeout: 15000 });
    await page.waitForTimeout(1000);

    const panelRules = await page.evaluate(() => {
      const panel = document.querySelector('[data-lab-v4-parameters]');
      if (!panel) return { error: 'panel not found' };

      const rules = [];
      for (let i = 0; i < document.styleSheets.length; i++) {
        try {
          const sheet = document.styleSheets[i];
          const sheetName = sheet.href || 'inline';
          for (let j = 0; j < sheet.cssRules.length; j++) {
            const rule = sheet.cssRules[j];
            if (rule.selectorText && panel.matches(rule.selectorText)) {
              rules.push({
                selector: rule.selectorText,
                cssText: rule.cssText.substring(0, 300),
                stylesheet: sheetName.split('/').pop()
              });
            }
          }
        } catch (e) {}
      }
      return rules;
    });

    console.log('Panel matching rules:');
    for (const rule of panelRules) {
      console.log(`  [${rule.stylesheet}] ${rule.selector}`);
      console.log(`    ${rule.cssText}`);
    }

    // Also check the body rules
    const bodyRules = await page.evaluate(() => {
      const body = document.querySelector('#v4-parameters-body');
      if (!body) return { error: 'body not found' };

      const rules = [];
      for (let i = 0; i < document.styleSheets.length; i++) {
        try {
          const sheet = document.styleSheets[i];
          const sheetName = sheet.href || 'inline';
          for (let j = 0; j < sheet.cssRules.length; j++) {
            const rule = sheet.cssRules[j];
            if (rule.selectorText && body.matches(rule.selectorText)) {
              rules.push({
                selector: rule.selectorText,
                cssText: rule.cssText.substring(0, 300),
                stylesheet: sheetName.split('/').pop()
              });
            }
          }
        } catch (e) {}
      }
      return rules;
    });

    console.log('\nBody matching rules:');
    for (const rule of bodyRules) {
      console.log(`  [${rule.stylesheet}] ${rule.selector}`);
      console.log(`    ${rule.cssText}`);
    }

    // Check the workspace root rules
    const workspaceRules = await page.evaluate(() => {
      const ws = document.querySelector('[data-lab-v4-disclosure-workspace]');
      if (!ws) return { error: 'workspace not found' };

      const rules = [];
      for (let i = 0; i < document.styleSheets.length; i++) {
        try {
          const sheet = document.styleSheets[i];
          const sheetName = sheet.href || 'inline';
          for (let j = 0; j < sheet.cssRules.length; j++) {
            const rule = sheet.cssRules[j];
            if (rule.selectorText && ws.matches(rule.selectorText)) {
              rules.push({
                selector: rule.selectorText,
                cssText: rule.cssText.substring(0, 300),
                stylesheet: sheetName.split('/').pop()
              });
            }
          }
        } catch (e) {}
      }
      return rules;
    });

    console.log('\nWorkspace matching rules:');
    for (const rule of workspaceRules) {
      console.log(`  [${rule.stylesheet}] ${rule.selector}`);
      console.log(`    ${rule.cssText}`);
    }
  });
});
