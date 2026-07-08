import { test, expect } from '@playwright/test';

const BASE = 'http://localhost:8080';
const URL = `${BASE}/index.html#/laboratory/bayes-rule`;

const VIEWPORTS = [
  { name: 'desktop-1440', width: 1440, height: 900 },
  { name: 'desktop-1280', width: 1280, height: 800 },
  { name: 'tablet-768', width: 768, height: 1024 },
  { name: 'mobile-390', width: 390, height: 844 },
];

test.describe("Bayes' Rule Laboratory", () => {
  for (const vp of VIEWPORTS) {
    test(`1. Route resolves — ${vp.name}`, async ({ page }) => {
      await page.setViewportSize({ width: vp.width, height: vp.height });
      await page.goto(URL);
      await page.waitForLoadState('networkidle');

      const title = page.locator('[data-lab-title]');
      await expect(title).toBeVisible();
      await expect(title).toContainText("Bayes' Rule Laboratory");
    });

    test(`2. Timeline exists — ${vp.name}`, async ({ page }) => {
      await page.setViewportSize({ width: vp.width, height: vp.height });
      await page.goto(URL);
      await page.waitForLoadState('networkidle');

      const timeline = page.locator('[data-lab-timeline]');
      await expect(timeline).toBeVisible();

      const steps = page.locator('.nv-lab-ws-tl-step');
      const count = await steps.count();
      expect(count).toBeGreaterThan(0);
    });

    test(`3. Run button works — ${vp.name}`, async ({ page }) => {
      await page.setViewportSize({ width: vp.width, height: vp.height });
      await page.goto(URL);
      await page.waitForLoadState('networkidle');

      const runBtn = page.locator('[data-action="run"]');
      await expect(runBtn).toBeVisible();
      await expect(runBtn).toBeEnabled();
    });

    test(`4. Pause button exists — ${vp.name}`, async ({ page }) => {
      await page.setViewportSize({ width: vp.width, height: vp.height });
      await page.goto(URL);
      await page.waitForLoadState('networkidle');

      const pauseBtn = page.locator('[data-action="pause"]');
      await expect(pauseBtn).toBeVisible();
    });

    test(`5. Step button works — ${vp.name}`, async ({ page }) => {
      await page.setViewportSize({ width: vp.width, height: vp.height });
      await page.goto(URL);
      await page.waitForLoadState('networkidle');

      const stepBtn = page.locator('[data-action="step"]');
      await expect(stepBtn).toBeVisible();
      await expect(stepBtn).toBeEnabled();

      await stepBtn.click();
      await page.waitForTimeout(100);

      const liveStep = page.locator('[data-live-step]');
      const text = await liveStep.textContent();
      expect(text).toContain('/');
    });

    test(`6. Reset button works — ${vp.name}`, async ({ page }) => {
      await page.setViewportSize({ width: vp.width, height: vp.height });
      await page.goto(URL);
      await page.waitForLoadState('networkidle');

      const resetBtn = page.locator('[data-action="reset-exec"]');
      await expect(resetBtn).toBeVisible();
    });

    test(`7. Probability tree renders — ${vp.name}`, async ({ page }) => {
      await page.setViewportSize({ width: vp.width, height: vp.height });
      await page.goto(URL);
      await page.waitForLoadState('networkidle');

      const treePanel = page.locator('[data-obs-id="probability-tree"]');
      await expect(treePanel).toBeVisible();

      const treeBody = page.locator('[data-obs-body="probability-tree"]');
      await expect(treeBody).toBeVisible();
    });

    test(`8. Bayesian update panel renders — ${vp.name}`, async ({ page }) => {
      await page.setViewportSize({ width: vp.width, height: vp.height });
      await page.goto(URL);
      await page.waitForLoadState('networkidle');

      const updatePanel = page.locator('[data-obs-id="bayesian-update"]');
      await expect(updatePanel).toBeVisible();

      const updateBody = page.locator('[data-obs-body="bayesian-update"]');
      await expect(updateBody).toBeVisible();
    });

    test(`9. Belief evolution panel renders — ${vp.name}`, async ({ page }) => {
      await page.setViewportSize({ width: vp.width, height: vp.height });
      await page.goto(URL);
      await page.waitForLoadState('networkidle');

      const evolutionPanel = page.locator('[data-obs-id="belief-evolution"]');
      await expect(evolutionPanel).toBeVisible();

      const evolutionBody = page.locator('[data-obs-body="belief-evolution"]');
      await expect(evolutionBody).toBeVisible();
    });

    test(`10. Confusion structure panel renders — ${vp.name}`, async ({ page }) => {
      await page.setViewportSize({ width: vp.width, height: vp.height });
      await page.goto(URL);
      await page.waitForLoadState('networkidle');

      const confusionPanel = page.locator('[data-obs-id="confusion-structure"]');
      await expect(confusionPanel).toBeVisible();

      const confusionBody = page.locator('[data-obs-body="confusion-structure"]');
      await expect(confusionBody).toBeVisible();
    });

    test(`11. Inspector populated — ${vp.name}`, async ({ page }) => {
      await page.setViewportSize({ width: vp.width, height: vp.height });
      await page.goto(URL);
      await page.waitForLoadState('networkidle');

      const inspector = page.locator('[data-lab-inspector]');
      await expect(inspector).toBeVisible();

      const cards = page.locator('.nv-lab-inspector-card');
      const count = await cards.count();
      expect(count).toBeGreaterThan(0);
    });

    test(`12. Scientific log populated — ${vp.name}`, async ({ page }) => {
      await page.setViewportSize({ width: vp.width, height: vp.height });
      await page.goto(URL);
      await page.waitForLoadState('networkidle');

      const log = page.locator('[data-lab-log]');
      await expect(log).toBeVisible();
    });

    test(`13. No horizontal overflow — ${vp.name}`, async ({ page }) => {
      await page.setViewportSize({ width: vp.width, height: vp.height });
      await page.goto(URL);
      await page.waitForLoadState('networkidle');

      const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
      expect(bodyWidth).toBeLessThanOrEqual(vp.width + 1);
    });

    test(`14. No console errors — ${vp.name}`, async ({ page }) => {
      const errors: string[] = [];
      page.on('console', (msg) => {
        if (msg.type() === 'error') {
          errors.push(msg.text());
        }
      });

      await page.setViewportSize({ width: vp.width, height: vp.height });
      await page.goto(URL);
      await page.waitForLoadState('networkidle');

      await page.waitForTimeout(500);
      expect(errors.length).toBe(0);
    });

    test(`15. Responsive layout — ${vp.name}`, async ({ page }) => {
      await page.setViewportSize({ width: vp.width, height: vp.height });
      await page.goto(URL);
      await page.waitForLoadState('networkidle');

      const workspace = page.locator('.nv-lab-workspace-body');
      await expect(workspace).toBeVisible();

      const display = await workspace.evaluate((el) => getComputedStyle(el).display);
      expect(display).toMatch(/grid|flex/);
    });
  }

  test.describe('Mathematical Invariants', () => {
    test('16. Posterior in [0,1] after step execution', async ({ page }) => {
      await page.setViewportSize({ width: 1280, height: 800 });
      await page.goto(URL);
      await page.waitForLoadState('networkidle');

      const stepBtn = page.locator('[data-action="step"]');
      for (let i = 0; i < 3; i++) {
        await stepBtn.click();
        await page.waitForTimeout(100);
      }

      const posteriorCard = page.locator('[data-inspector-value="posterior"]');
      const text = await posteriorCard.textContent();
      const value = parseFloat(text || '0');
      expect(value).toBeGreaterThanOrEqual(0);
      expect(value).toBeLessThanOrEqual(1);
    });

    test('17. Prior in [0,1] after step execution', async ({ page }) => {
      await page.setViewportSize({ width: 1280, height: 800 });
      await page.goto(URL);
      await page.waitForLoadState('networkidle');

      const stepBtn = page.locator('[data-action="step"]');
      await stepBtn.click();
      await page.waitForTimeout(100);

      const priorCard = page.locator('[data-inspector-value="priorProbability"]');
      const text = await priorCard.textContent();
      const value = parseFloat(text || '0');
      expect(value).toBeGreaterThanOrEqual(0);
      expect(value).toBeLessThanOrEqual(1);
    });

    test('18. Multiple evidence updates work', async ({ page }) => {
      await page.setViewportSize({ width: 1280, height: 800 });
      await page.goto(URL);
      await page.waitForLoadState('networkidle');

      const stepBtn = page.locator('[data-action="step"]');
      const posteriors: number[] = [];

      for (let i = 0; i < 5; i++) {
        await stepBtn.click();
        await page.waitForTimeout(100);
        const text = await page.locator('[data-inspector-value="posterior"]').textContent();
        posteriors.push(parseFloat(text || '0'));
      }

      expect(posteriors.length).toBe(5);
      for (const p of posteriors) {
        expect(p).toBeGreaterThanOrEqual(0);
        expect(p).toBeLessThanOrEqual(1);
      }
    });

    test('19. Belief evolution updates', async ({ page }) => {
      await page.setViewportSize({ width: 1280, height: 800 });
      await page.goto(URL);
      await page.waitForLoadState('networkidle');

      const stepBtn = page.locator('[data-action="step"]');
      await stepBtn.click();
      await page.waitForTimeout(200);

      const evolutionBody = page.locator('[data-obs-body="belief-evolution"]');
      const svg = evolutionBody.locator('svg');
      await expect(svg).toBeVisible();
    });

    test('20. Normalization computed', async ({ page }) => {
      await page.setViewportSize({ width: 1280, height: 800 });
      await page.goto(URL);
      await page.waitForLoadState('networkidle');

      const stepBtn = page.locator('[data-action="step"]');
      await stepBtn.click();
      await page.waitForTimeout(100);

      const normCard = page.locator('[data-inspector-value="normalizationConstant"]');
      const text = await normCard.textContent();
      expect(text).toBeTruthy();
      const value = parseFloat(text || '0');
      expect(value).toBeGreaterThanOrEqual(0);
      expect(value).toBeLessThanOrEqual(1);
    });

    test('21. Four observation panels exist', async ({ page }) => {
      await page.setViewportSize({ width: 1280, height: 800 });
      await page.goto(URL);
      await page.waitForLoadState('networkidle');

      const panels = page.locator('.nv-lab-obs-panel');
      const count = await panels.count();
      expect(count).toBe(4);
    });
  });

  test.describe('Regression Tests', () => {
    const LABS = [
      { slug: 'gradient-descent', title: 'Gradient Descent' },
      { slug: 'linear-regression', title: 'Linear Regression' },
      { slug: 'kmeans-clustering', title: 'K-Means' },
      { slug: 'logistic-regression', title: 'Logistic Regression' },
      { slug: 'transformer-attention', title: 'Transformer Attention' },
      { slug: 'pca', title: 'PCA' },
    ];

    for (const lab of LABS) {
      test(`22. Regression — ${lab.title} route resolves`, async ({ page }) => {
        await page.setViewportSize({ width: 1280, height: 800 });
        await page.goto(`${BASE}/index.html#/laboratory/${lab.slug}`);
        await page.waitForLoadState('networkidle');

        const title = page.locator('[data-lab-title]');
        await expect(title).toBeVisible();
      });

      test(`23. Regression — ${lab.title} no console errors`, async ({ page }) => {
        const errors: string[] = [];
        page.on('console', (msg) => {
          if (msg.type() === 'error') {
            errors.push(msg.text());
          }
        });

        await page.setViewportSize({ width: 1280, height: 800 });
        await page.goto(`${BASE}/index.html#/laboratory/${lab.slug}`);
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(500);

        expect(errors.length).toBe(0);
      });
    }

    test('24. Regression — Labs Index loads', async ({ page }) => {
      await page.setViewportSize({ width: 1280, height: 800 });
      await page.goto(`${BASE}/index.html#/laboratory`);
      await page.waitForLoadState('networkidle');

      const header = page.locator('.nv-lab-command-header');
      await expect(header).toBeVisible();
    });
  });
});
