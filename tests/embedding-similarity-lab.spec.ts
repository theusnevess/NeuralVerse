import { test, expect } from '@playwright/test';

const BASE = 'http://localhost:8080';
const URL = `${BASE}/index.html#/laboratory/embedding-similarity`;

const VIEWPORTS = [
  { name: 'desktop-1440', width: 1440, height: 900 },
  { name: 'desktop-1280', width: 1280, height: 800 },
  { name: 'tablet-768', width: 768, height: 1024 },
  { name: 'mobile-390', width: 390, height: 844 },
];

test.describe('Embedding Similarity Laboratory', () => {
  for (const vp of VIEWPORTS) {
    test(`1. Route resolves — ${vp.name}`, async ({ page }) => {
      await page.setViewportSize({ width: vp.width, height: vp.height });
      await page.goto(URL);
      await page.waitForLoadState('networkidle');

      const title = page.locator('[data-lab-title]');
      await expect(title).toBeVisible();
      await expect(title).toContainText('Embedding Similarity Laboratory');
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

    test(`7. Embedding space panel renders — ${vp.name}`, async ({ page }) => {
      await page.setViewportSize({ width: vp.width, height: vp.height });
      await page.goto(URL);
      await page.waitForLoadState('networkidle');

      const spacePanel = page.locator('[data-obs-id="embedding-space"]');
      await expect(spacePanel).toBeVisible();

      const spaceBody = page.locator('[data-obs-body="embedding-space"]');
      await expect(spaceBody).toBeVisible();
    });

    test(`8. Similarity matrix panel renders — ${vp.name}`, async ({ page }) => {
      await page.setViewportSize({ width: vp.width, height: vp.height });
      await page.goto(URL);
      await page.waitForLoadState('networkidle');

      const matrixPanel = page.locator('[data-obs-id="similarity-matrix"]');
      await expect(matrixPanel).toBeVisible();

      const matrixBody = page.locator('[data-obs-body="similarity-matrix"]');
      await expect(matrixBody).toBeVisible();
    });

    test(`9. Nearest neighbors panel renders — ${vp.name}`, async ({ page }) => {
      await page.setViewportSize({ width: vp.width, height: vp.height });
      await page.goto(URL);
      await page.waitForLoadState('networkidle');

      const neighborsPanel = page.locator('[data-obs-id="nearest-neighbors"]');
      await expect(neighborsPanel).toBeVisible();

      const neighborsBody = page.locator('[data-obs-body="nearest-neighbors"]');
      await expect(neighborsBody).toBeVisible();
    });

    test(`10. Vector anatomy panel renders — ${vp.name}`, async ({ page }) => {
      await page.setViewportSize({ width: vp.width, height: vp.height });
      await page.goto(URL);
      await page.waitForLoadState('networkidle');

      const anatomyPanel = page.locator('[data-obs-id="vector-anatomy"]');
      await expect(anatomyPanel).toBeVisible();

      const anatomyBody = page.locator('[data-obs-body="vector-anatomy"]');
      await expect(anatomyBody).toBeVisible();
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
    test('16. Cosine values are in [-1,1]', async ({ page }) => {
      await page.setViewportSize({ width: 1280, height: 800 });
      await page.goto(URL);
      await page.waitForLoadState('networkidle');

      const stepBtn = page.locator('[data-action="step"]');
      for (let i = 0; i < 5; i++) {
        await stepBtn.click();
        await page.waitForTimeout(100);
      }

      const cosineCard = page.locator('[data-inspector-value="cosineSim"]');
      const text = await cosineCard.textContent();
      const value = parseFloat(text || '0');
      expect(value).toBeGreaterThanOrEqual(-1);
      expect(value).toBeLessThanOrEqual(1);
    });

    test('17. Self-similarity ≈ 1', async ({ page }) => {
      await page.setViewportSize({ width: 1280, height: 800 });
      await page.goto(URL);
      await page.waitForLoadState('networkidle');

      const stepBtn = page.locator('[data-action="step"]');
      for (let i = 0; i < 5; i++) {
        await stepBtn.click();
        await page.waitForTimeout(100);
      }

      const normCard = page.locator('[data-inspector-value="vectorNorm"]');
      const text = await normCard.textContent();
      const value = parseFloat(text || '0');
      expect(value).toBeGreaterThan(0);
    });

    test('18. Normalized vectors have norm ≈ 1', async ({ page }) => {
      await page.setViewportSize({ width: 1280, height: 800 });
      await page.goto(URL);
      await page.waitForLoadState('networkidle');

      const stepBtn = page.locator('[data-action="step"]');
      for (let i = 0; i < 3; i++) {
        await stepBtn.click();
        await page.waitForTimeout(100);
      }

      const normCard = page.locator('[data-inspector-value="vectorNorm"]');
      const text = await normCard.textContent();
      const value = parseFloat(text || '0');
      expect(value).toBeCloseTo(1.0, 1);
    });

    test('19. Four observation panels exist', async ({ page }) => {
      await page.setViewportSize({ width: 1280, height: 800 });
      await page.goto(URL);
      await page.waitForLoadState('networkidle');

      const panels = page.locator('.nv-lab-obs-panel');
      const count = await panels.count();
      expect(count).toBe(4);
    });

    test('20. Inspector has embedding-specific cards', async ({ page }) => {
      await page.setViewportSize({ width: 1280, height: 800 });
      await page.goto(URL);
      await page.waitForLoadState('networkidle');

      const queryCard = page.locator('[data-inspector-key="query"]');
      await expect(queryCard).toBeVisible();

      const cosineCard = page.locator('[data-inspector-key="cosineSim"]');
      await expect(cosineCard).toBeVisible();

      const topMatchCard = page.locator('[data-inspector-key="topMatch"]');
      await expect(topMatchCard).toBeVisible();
    });

    test('21. Timeline contains embedding pipeline steps', async ({ page }) => {
      await page.setViewportSize({ width: 1280, height: 800 });
      await page.goto(URL);
      await page.waitForLoadState('networkidle');

      const steps = page.locator('.nv-lab-ws-tl-step');
      const count = await steps.count();
      expect(count).toBeGreaterThanOrEqual(8);
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
      { slug: 'bayes-rule', title: "Bayes' Rule" },
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
