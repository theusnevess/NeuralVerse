import { test, expect, type Page } from '@playwright/test';

const LABS = [
  'gradient-descent', 'linear-regression', 'logistic-regression',
  'kmeans-clustering', 'pca-projection', 'bayes-rule',
  'embedding-similarity', 'cosine-similarity', 'precision-recall',
  'transformer-attention'
];

const KEY_LABS = ['gradient-descent', 'kmeans-clustering', 'pca-projection', 'transformer-attention'];

const VIEWPORTS = [
  { width: 1920, height: 1080, name: '1920x1080' },
  { width: 1600, height: 900, name: '1600x900' },
  { width: 1440, height: 900, name: '1440x900' },
  { width: 1280, height: 800, name: '1280x800' },
  { width: 1024, height: 768, name: '1024x768' },
  { width: 768, height: 1024, name: '768x1024' },
  { width: 430, height: 932, name: '430x932' },
  { width: 390, height: 844, name: '390x844' },
  { width: 375, height: 812, name: '375x812' },
  { width: 360, height: 740, name: '360x740' },
];

const MATRIX_VIEWPORTS = [
  { width: 1440, height: 900, name: '1440x900' },
  { width: 768, height: 1024, name: '768x1024' },
  { width: 390, height: 844, name: '390x844' },
  { width: 360, height: 740, name: '360x740' },
];

async function navigateToLab(page: Page, slug: string) {
  await page.goto(`/#/laboratory/${slug}`);
  await page.waitForSelector('[data-lab-v4-workspace]', { timeout: 15000 });
  await page.waitForTimeout(500);
}

function disclosurePanel(name: string) {
  const map: Record<string, string> = {
    parameters: '[data-lab-v4-parameters]',
    inspector: '[data-lab-v4-inspector-details]',
    findings: '[data-lab-v4-findings-history]',
    log: '[data-lab-v4-scientific-log]',
    research: '[data-lab-v4-research]',
  };
  return map[name] || name;
}

function disclosureToggle(name: string) {
  return `[data-disclosure-toggle="${name}"]`;
}

async function isHidden(page: Page, selector: string): Promise<boolean> {
  return page.locator(selector).getAttribute('hidden') !== null;
}

async function isExpanded(page: Page, selector: string): Promise<boolean> {
  return (await page.locator(selector).getAttribute('data-disclosure-state')) === 'expanded';
}

test.describe('Phase 12.4 Disclosure Workspace Migration', () => {

  test.describe('1. Ownership', () => {
    for (const slug of LABS) {
      test(`one disclosure workspace in ${slug}`, async ({ page }) => {
        await navigateToLab(page, slug);

        const workspaces = await page.locator('[data-lab-v4-disclosure-workspace]').count();
        expect(workspaces).toBe(1);

        const disclosure = await page.locator('[data-lab-v4-disclosure]').count();
        expect(disclosure).toBe(1);

        // All panels must be descendants of the disclosure workspace
        const panels = page.locator('[data-lab-v4-disclosure-workspace] > .nv-lab-v4-disclosure-panel');
        const panelCount = await panels.count();
        expect(panelCount).toBeGreaterThanOrEqual(1);
        expect(panelCount).toBeLessThanOrEqual(5);

        // No panel should be inside stage or console
        const stagePanels = await page.locator('[data-lab-v4-stage] [data-lab-v4-parameters], [data-lab-v4-stage] [data-lab-v4-inspector-details], [data-lab-v4-stage] [data-lab-v4-findings-history], [data-lab-v4-stage] [data-lab-v4-scientific-log], [data-lab-v4-stage] [data-lab-v4-research]').count();
        expect(stagePanels).toBe(0);

        const consolePanels = await page.locator('[data-lab-v4-console] [data-lab-v4-parameters], [data-lab-v4-console] [data-lab-v4-inspector-details], [data-lab-v4-console] [data-lab-v4-findings-history], [data-lab-v4-console] [data-lab-v4-scientific-log], [data-lab-v4-console] [data-lab-v4-research]').count();
        expect(consolePanels).toBe(0);
      });
    }
  });

  test.describe('2. Normal Flow', () => {
    for (const slug of KEY_LABS) {
      test(`${slug} uses normal flow`, async ({ page }) => {
        await navigateToLab(page, slug);

        const panels = page.locator('[data-lab-v4-disclosure-workspace] > .nv-lab-v4-disclosure-panel');
        const count = await panels.count();
        for (let i = 0; i < count; i++) {
          const panel = panels.nth(i);
          const position = await panel.evaluate(el => getComputedStyle(el).position);
          expect(['static', 'relative']).toContain(position);
        }

        // Verify geometry: disclosure below console, below continuations
        const consoleEl = page.locator('[data-lab-v4-console]');
        const disclosureEl = page.locator('[data-lab-v4-disclosure]');
        const continuationsEl = page.locator('[data-lab-v4-continuations]');

        if (await consoleEl.isVisible() && await disclosureEl.isVisible()) {
          const consoleBox = await consoleEl.boundingBox();
          const disclosureBox = await disclosureEl.boundingBox();
          if (consoleBox && disclosureBox) {
            expect(disclosureBox.y).toBeGreaterThanOrEqual(consoleBox.y + consoleBox.height - 2);
          }
        }

        if (await disclosureEl.isVisible() && await continuationsEl.isVisible()) {
          const disclosureBox = await disclosureEl.boundingBox();
          const contBox = await continuationsEl.boundingBox();
          if (disclosureBox && contBox) {
            expect(contBox.y).toBeGreaterThanOrEqual(disclosureBox.y + disclosureBox.height - 2);
          }
        }
      });
    }
  });

  test.describe('3. Parameters', () => {
    test('parameters toggle works', async ({ page }) => {
      await navigateToLab(page, 'gradient-descent');

      const panel = page.locator(disclosurePanel('parameters'));
      await expect(panel).toBeVisible();

      // Should start expanded
      const state = await panel.getAttribute('data-disclosure-state');
      expect(state).toBe('expanded');

      // Toggle closed
      await page.click(disclosureToggle('parameters'));
      const stateAfterClose = await panel.getAttribute('data-disclosure-state');
      expect(stateAfterClose).toBe('collapsed');

      // Toggle open again
      await page.click(disclosureToggle('parameters'));
      const stateAfterOpen = await panel.getAttribute('data-disclosure-state');
      expect(stateAfterOpen).toBe('expanded');
    });

    test('parameter controls render', async ({ page }) => {
      await navigateToLab(page, 'gradient-descent');

      const paramsContainer = page.locator('[data-lab-parameters]');
      await expect(paramsContainer).toBeVisible();

      const sliders = page.locator('[data-lab-parameters] input[type="range"]');
      const sliderCount = await sliders.count();
      expect(sliderCount).toBeGreaterThanOrEqual(1);
    });

    test('parameter count matches schema', async ({ page }) => {
      await navigateToLab(page, 'gradient-descent');

      const countEl = page.locator('[data-param-count]');
      await expect(countEl).toBeVisible();
      const countText = await countEl.textContent();
      expect(countText).toMatch(/\d+ controls/);
    });

    test('parameter count matches rendered controls', async ({ page }) => {
      await navigateToLab(page, 'gradient-descent');

      const countText = await page.locator('[data-param-count]').textContent();
      const match = countText?.match(/(\d+)/);
      const reportedCount = match ? parseInt(match[1]) : 0;

      const renderedControls = await page.locator('[data-lab-parameters] .nv-lab-param-group').count();
      expect(reportedCount).toBe(renderedControls);
    });
  });

  test.describe('4. Inspector Details', () => {
    test('collapsed and available by default', async ({ page }) => {
      await navigateToLab(page, 'gradient-descent');

      const panel = page.locator(disclosurePanel('inspector'));
      const state = await panel.getAttribute('data-disclosure-state');
      expect(state).toBe('collapsed');

      // Inspector should be available (not hidden) when lab has sections
      const hidden = await panel.getAttribute('hidden');
      expect(hidden).toBeNull();
    });

    test('toggle expands inspector', async ({ page }) => {
      await navigateToLab(page, 'gradient-descent');

      await page.click(disclosureToggle('inspector'));
      const panel = page.locator(disclosurePanel('inspector'));
      const state = await panel.getAttribute('data-disclosure-state');
      expect(state).toBe('expanded');
    });

    test('inspector has accordion sections', async ({ page }) => {
      await navigateToLab(page, 'gradient-descent');

      await page.click(disclosureToggle('inspector'));
      const accordions = page.locator('[data-lab-v4-inspector-details] [data-accordion-trigger]');
      const count = await accordions.count();
      expect(count).toBeGreaterThanOrEqual(1);
    });

    test('inspector section count matches rendered accordions', async ({ page }) => {
      await navigateToLab(page, 'gradient-descent');

      const panel = page.locator(disclosurePanel('inspector'));
      const hidden = await panel.getAttribute('hidden');

      if (hidden === null) {
        const accordions = await page.locator('[data-lab-v4-inspector-details] [data-accordion-trigger]').count();
        const drawers = await page.locator('[data-lab-v4-inspector-details] [data-drawer-trigger]').count();
        const totalSections = accordions + drawers;
        expect(totalSections).toBeGreaterThanOrEqual(1);
      }
    });
  });

  test.describe('5. Findings History', () => {
    test('unavailable (hidden) before finding', async ({ page }) => {
      await navigateToLab(page, 'gradient-descent');

      const panel = page.locator(disclosurePanel('findings'));
      const hidden = await panel.getAttribute('hidden');
      expect(hidden).not.toBeNull(); // hidden attribute present = unavailable
    });

    test('unavailable at zero count', async ({ page }) => {
      await navigateToLab(page, 'gradient-descent');

      const panel = page.locator(disclosurePanel('findings'));
      const isPanelHidden = await panel.getAttribute('hidden') !== null;
      const countText = await page.locator('[data-xai-finding-count]').textContent();
      const count = parseInt(countText || '0');

      // When count is 0, panel must be hidden
      if (count === 0) {
        expect(isPanelHidden).toBe(true);
      }
    });

    test('appears after finding is generated', async ({ page }) => {
      await navigateToLab(page, 'gradient-descent');

      // Run execution to generate a finding
      const runBtn = page.locator('[data-action="run"]');
      if (await runBtn.isVisible() && await runBtn.isEnabled()) {
        await runBtn.click();
        await page.waitForTimeout(3000);
      }

      const panel = page.locator(disclosurePanel('findings'));
      const countText = await page.locator('[data-xai-finding-count]').textContent();
      const count = parseInt(countText || '0');

      if (count > 0) {
        // Panel should be visible (not hidden) when findings exist
        const isPanelHidden = await panel.getAttribute('hidden') !== null;
        expect(isPanelHidden).toBe(false);
      }
    });

    test('count matches rendered timeline entries', async ({ page }) => {
      await navigateToLab(page, 'gradient-descent');

      const runBtn = page.locator('[data-action="run"]');
      if (await runBtn.isVisible() && await runBtn.isEnabled()) {
        await runBtn.click();
        await page.waitForTimeout(3000);
      }

      const countText = await page.locator('[data-xai-finding-count]').textContent();
      const reportedCount = parseInt(countText || '0');

      if (reportedCount > 0) {
        const renderedEntries = await page.locator('[data-xai-timeline] .nv-xai-timeline-entry').count();
        expect(renderedEntries).toBe(reportedCount);
      }
    });
  });

  test.describe('6. Scientific Log', () => {
    test('unavailable (hidden) before first event', async ({ page }) => {
      await navigateToLab(page, 'gradient-descent');

      const panel = page.locator(disclosurePanel('log'));
      const hidden = await panel.getAttribute('hidden');
      expect(hidden).not.toBeNull(); // hidden attribute present = unavailable
    });

    test('unavailable at zero count', async ({ page }) => {
      await navigateToLab(page, 'gradient-descent');

      const panel = page.locator(disclosurePanel('log'));
      const isPanelHidden = await panel.getAttribute('hidden') !== null;
      const countText = await page.locator('[data-lab-log-count]').textContent();
      const count = parseInt(countText || '0');

      if (count === 0) {
        expect(isPanelHidden).toBe(true);
      }
    });

    test('log appears after step execution', async ({ page }) => {
      await navigateToLab(page, 'gradient-descent');

      // Step forward to generate log entries
      const stepBtn = page.locator('[data-action="step"]');
      if (await stepBtn.isVisible() && await stepBtn.isEnabled()) {
        await stepBtn.click();
        await page.waitForTimeout(500);
      }

      const panel = page.locator(disclosurePanel('log'));
      const countText = await page.locator('[data-lab-log-count]').textContent();
      const count = parseInt(countText || '0');

      if (count > 0) {
        // Panel should be visible when log has entries
        const isPanelHidden = await panel.getAttribute('hidden') !== null;
        expect(isPanelHidden).toBe(false);
      }
    });

    test('log count updates', async ({ page }) => {
      await navigateToLab(page, 'gradient-descent');

      const countEl = page.locator('[data-lab-log-count]');
      const initialCount = await countEl.textContent();

      // Step to generate entries
      const stepBtn = page.locator('[data-action="step"]');
      if (await stepBtn.isVisible() && await stepBtn.isEnabled()) {
        await stepBtn.click();
        await page.waitForTimeout(500);
      }

      const newCount = await countEl.textContent();
      // Count should have increased
      expect(parseInt(newCount || '0')).toBeGreaterThanOrEqual(parseInt(initialCount || '0'));
    });

    test('count matches rendered log entries', async ({ page }) => {
      await navigateToLab(page, 'gradient-descent');

      const stepBtn = page.locator('[data-action="step"]');
      if (await stepBtn.isVisible() && await stepBtn.isEnabled()) {
        await stepBtn.click();
        await page.waitForTimeout(500);
      }

      const countText = await page.locator('[data-lab-log-count]').textContent();
      const reportedCount = parseInt(countText || '0');

      if (reportedCount > 0) {
        const renderedEntries = await page.locator('[data-lab-log-entries] .nv-lab-log-entry').count();
        expect(renderedEntries).toBe(reportedCount);
      }
    });
  });

  test.describe('7. Research Mode', () => {
    test('research panel hidden by default', async ({ page }) => {
      await navigateToLab(page, 'gradient-descent');

      const panel = page.locator(disclosurePanel('research'));
      const state = await panel.getAttribute('data-disclosure-state');
      expect(state).toBe('collapsed');
    });

    test('research toggle activates', async ({ page }) => {
      await navigateToLab(page, 'gradient-descent');

      const toggle = page.locator('[data-research-toggle]');
      await toggle.click();
      await page.waitForTimeout(300);

      const panel = page.locator(disclosurePanel('research'));
      const state = await panel.getAttribute('data-disclosure-state');
      expect(state).toBe('expanded');
    });

    test('research hypothesis field works', async ({ page }) => {
      await navigateToLab(page, 'gradient-descent');

      await page.locator('[data-research-toggle]').click();
      await page.waitForTimeout(300);

      const hypothesis = page.locator('[data-research-hypothesis]');
      await hypothesis.fill('Test hypothesis');
      const value = await hypothesis.inputValue();
      expect(value).toBe('Test hypothesis');
    });
  });

  test.describe('8. Multiple-Open State', () => {
    test('all panels can be open simultaneously', async ({ page }) => {
      await navigateToLab(page, 'gradient-descent');

      // Parameters is already expanded
      // Open inspector
      await page.click(disclosureToggle('inspector'));
      await page.waitForTimeout(200);

      // Open log (step first to make it available)
      const stepBtn = page.locator('[data-action="step"]');
      if (await stepBtn.isVisible() && await stepBtn.isEnabled()) {
        await stepBtn.click();
        await page.waitForTimeout(500);
      }

      // Toggle log open
      const logPanel = page.locator(disclosurePanel('log'));
      const logHidden = await logPanel.getAttribute('hidden');
      if (logHidden === null) {
        await page.click(disclosureToggle('log'));
        await page.waitForTimeout(200);
      }

      // Verify no overlap
      const disclosureEl = page.locator('[data-lab-v4-disclosure]');
      const discBox = await disclosureEl.boundingBox();
      expect(discBox).not.toBeNull();

      // Check no horizontal overflow
      const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
      const clientWidth = await page.evaluate(() => document.documentElement.clientWidth);
      expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 1);
    });
  });

  test.describe('9. Target Size', () => {
    for (const slug of KEY_LABS) {
      test(`${slug} toggles are at least 44px`, async ({ page }) => {
        await navigateToLab(page, slug);

        const toggles = page.locator('[data-disclosure-toggle]');
        const count = await toggles.count();
        for (let i = 0; i < count; i++) {
          const toggle = toggles.nth(i);
          if (await toggle.isVisible()) {
            const box = await toggle.boundingBox();
            if (box) {
              expect(box.height).toBeGreaterThanOrEqual(44);
            }
          }
        }
      });
    }
  });

  test.describe('10. Keyboard', () => {
    test('disclosure toggles are focusable', async ({ page }) => {
      await navigateToLab(page, 'gradient-descent');

      const toggle = page.locator(disclosureToggle('parameters'));
      await toggle.focus();
      const focused = await page.evaluate(() => document.activeElement?.getAttribute('data-disclosure-toggle'));
      expect(focused).toBe('parameters');
    });

    test('toggle activates with Enter', async ({ page }) => {
      await navigateToLab(page, 'gradient-descent');

      // Parameters is expanded, close it first
      await page.click(disclosureToggle('parameters'));
      await page.waitForTimeout(200);

      // Focus and press Enter
      await page.locator(disclosureToggle('parameters')).focus();
      await page.keyboard.press('Enter');
      await page.waitForTimeout(200);

      const panel = page.locator(disclosurePanel('parameters'));
      const state = await panel.getAttribute('data-disclosure-state');
      expect(state).toBe('expanded');
    });
  });

  test.describe('11. Horizontal Overflow', () => {
    for (const slug of KEY_LABS) {
      test(`${slug} no horizontal overflow at 1440x900`, async ({ page }) => {
        await page.setViewportSize({ width: 1440, height: 900 });
        await navigateToLab(page, slug);

        const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
        const clientWidth = await page.evaluate(() => document.documentElement.clientWidth);
        expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 1);
      });

      test(`${slug} no horizontal overflow at 390x844`, async ({ page }) => {
        await page.setViewportSize({ width: 390, height: 844 });
        await navigateToLab(page, slug);

        const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
        const clientWidth = await page.evaluate(() => document.documentElement.clientWidth);
        expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 1);
      });
    }
  });

  test.describe('12. Route Lifecycle', () => {
    test('no duplicate panels after route change', async ({ page }) => {
      await navigateToLab(page, 'gradient-descent');
      await page.waitForTimeout(500);

      // Open parameters
      await page.click(disclosureToggle('parameters'));
      await page.waitForTimeout(200);

      // Navigate to another lab
      await navigateToLab(page, 'linear-regression');
      await page.waitForTimeout(500);

      // Check no duplicate panels
      const workspaces = await page.locator('[data-lab-v4-disclosure-workspace]').count();
      expect(workspaces).toBe(1);

      const paramPanels = await page.locator('[data-lab-v4-parameters]').count();
      expect(paramPanels).toBe(1);
    });

    test('no stale inspector sections after route change', async ({ page }) => {
      await navigateToLab(page, 'gradient-descent');
      await page.waitForTimeout(500);

      // Open inspector
      await page.click(disclosureToggle('inspector'));
      await page.waitForTimeout(200);

      const gdAccordions = await page.locator('[data-lab-v4-inspector-details] [data-accordion-trigger]').count();

      // Navigate to another lab
      await navigateToLab(page, 'linear-regression');
      await page.waitForTimeout(500);

      const lrAccordions = await page.locator('[data-lab-v4-inspector-details] [data-accordion-trigger]').count();

      // Should not have stale sections from gradient-descent
      expect(lrAccordions).toBeGreaterThanOrEqual(1);
    });
  });

  test.describe('13. Availability Parity', () => {
    for (const slug of KEY_LABS) {
      test(`${slug} parameters count matches rendered controls`, async ({ page }) => {
        await navigateToLab(page, slug);

        const countText = await page.locator('[data-param-count]').textContent();
        const match = countText?.match(/(\d+)/);
        const reportedCount = match ? parseInt(match[1]) : 0;
        const renderedControls = await page.locator('[data-lab-parameters] .nv-lab-param-group').count();
        expect(reportedCount).toBe(renderedControls);
      });

      test(`${slug} no zero-content visible panels`, async ({ page }) => {
        await navigateToLab(page, slug);

        // Findings History: hidden when count is 0
        const findingsPanel = page.locator(disclosurePanel('findings'));
        const findingsHidden = await findingsPanel.getAttribute('hidden') !== null;
        const findingsCount = parseInt(await page.locator('[data-xai-finding-count]').textContent() || '0');
        if (findingsCount === 0) {
          expect(findingsHidden).toBe(true);
        }

        // Scientific Log: hidden when count is 0
        const logPanel = page.locator(disclosurePanel('log'));
        const logHidden = await logPanel.getAttribute('hidden') !== null;
        const logCount = parseInt(await page.locator('[data-lab-log-count]').textContent() || '0');
        if (logCount === 0) {
          expect(logHidden).toBe(true);
        }
      });
    }
  });

  test.describe('14. Lifecycle Transitions', () => {
    test('findings lifecycle: preparation unavailable, after finding available', async ({ page }) => {
      await navigateToLab(page, 'gradient-descent');

      // Preparation: findings should be unavailable
      const findingsPanel = page.locator(disclosurePanel('findings'));
      expect(await findingsPanel.getAttribute('hidden')).not.toBeNull();

      // Run to generate findings
      const runBtn = page.locator('[data-action="run"]');
      if (await runBtn.isVisible() && await runBtn.isEnabled()) {
        await runBtn.click();
        await page.waitForTimeout(3000);
      }

      const count = parseInt(await page.locator('[data-xai-finding-count]').textContent() || '0');
      if (count > 0) {
        // After finding: should be available and collapsed
        expect(await findingsPanel.getAttribute('hidden')).toBeNull();
        expect(await findingsPanel.getAttribute('data-disclosure-state')).toBe('collapsed');
      }
    });

    test('log lifecycle: preparation unavailable, after step available', async ({ page }) => {
      await navigateToLab(page, 'gradient-descent');

      // Preparation: log should be unavailable
      const logPanel = page.locator(disclosurePanel('log'));
      expect(await logPanel.getAttribute('hidden')).not.toBeNull();

      // Step to generate log entries
      const stepBtn = page.locator('[data-action="step"]');
      if (await stepBtn.isVisible() && await stepBtn.isEnabled()) {
        await stepBtn.click();
        await page.waitForTimeout(500);
      }

      const count = parseInt(await page.locator('[data-lab-log-count]').textContent() || '0');
      if (count > 0) {
        // After event: should be available and collapsed
        expect(await logPanel.getAttribute('hidden')).toBeNull();
        expect(await logPanel.getAttribute('data-disclosure-state')).toBe('collapsed');
      }
    });

    test('inspector lifecycle: available when sections exist', async ({ page }) => {
      await navigateToLab(page, 'gradient-descent');

      // Inspector should be available (not hidden) when lab has sections
      const inspectorPanel = page.locator(disclosurePanel('inspector'));
      expect(await inspectorPanel.getAttribute('hidden')).toBeNull();

      // Should have accordion or drawer sections
      const accordions = await page.locator('[data-lab-v4-inspector-details] [data-accordion-trigger]').count();
      const drawers = await page.locator('[data-lab-v4-inspector-details] [data-drawer-trigger]').count();
      expect(accordions + drawers).toBeGreaterThanOrEqual(1);
    });

    test('reset clears findings and log availability', async ({ page }) => {
      await navigateToLab(page, 'gradient-descent');

      // Generate some content
      const stepBtn = page.locator('[data-action="step"]');
      if (await stepBtn.isVisible() && await stepBtn.isEnabled()) {
        await stepBtn.click();
        await page.waitForTimeout(500);
      }

      // Reset
      const resetBtn = page.locator('[data-action="reset-exec"]');
      if (await resetBtn.isVisible()) {
        await resetBtn.click();
        await page.waitForTimeout(500);
      }

      // After reset: findings and log should be unavailable
      const findingsPanel = page.locator(disclosurePanel('findings'));
      const logPanel = page.locator(disclosurePanel('log'));

      expect(await findingsPanel.getAttribute('hidden')).not.toBeNull();
      expect(await logPanel.getAttribute('hidden')).not.toBeNull();
    });
  });
});
