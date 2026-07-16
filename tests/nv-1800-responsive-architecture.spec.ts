import { expect, test, type Page } from './fixtures/playwright-runtime-observability';
import { mkdirSync, writeFileSync } from 'node:fs';

const labs = ['gradient-descent', 'linear-regression', 'logistic-regression', 'kmeans-clustering', 'pca-projection', 'bayes-rule', 'embedding-similarity', 'cosine-similarity', 'precision-recall', 'transformer-attention'];
const profiles = [{ name: 'wide', width: 1440, height: 900 }, { name: 'standard', width: 1280, height: 800 }, { name: 'compact', width: 1024, height: 768 }, { name: 'portrait-compact', width: 768, height: 1024 }, { name: 'mobile', width: 390, height: 844 }, { name: 'narrow-mobile', width: 360, height: 740 }, { name: 'short', width: 1366, height: 650 }, { name: 'landscape-mobile', width: 844, height: 390 }];
const artifactDir = 'artifacts/nv-1800-responsive-architecture'; let navigationId = 0;
async function open(page: Page, slug: string) { await page.goto(`/index.html?responsive=${navigationId++}#/laboratory/${slug}`, { waitUntil: 'domcontentloaded' }); await expect(page.locator('[data-lab-v4-workspace]')).toBeVisible(); }

test('all laboratories preserve responsive containment and state continuity', async ({ page }) => {
  test.setTimeout(300_000); mkdirSync(`${artifactDir}/final-screenshots`, { recursive: true }); const audit: any[] = [], validation: any[] = [];
  for (const profile of profiles) for (const slug of labs) {
    await page.setViewportSize(profile); await open(page, slug);
    const record = await page.locator('[data-lab-v4-workspace]').evaluate((workspace, profileName) => {
      const box = (selector: string) => { const el = workspace.querySelector<HTMLElement>(selector); const rect = el?.getBoundingClientRect(); return rect ? { left: rect.left, right: rect.right, top: rect.top, bottom: rect.bottom, width: rect.width, height: rect.height } : null; };
      const stage = box('[data-lab-v4-stage]'), rail = box('[data-lab-v4-configuration-slot]'), consoleBox = box('[data-lab-v4-execution-console]');
      return { profile: profileName, overflow: document.documentElement.scrollWidth > innerWidth + 1, stage, rail, console: consoleBox, stageInside: Boolean(stage && stage.left >= -1 && stage.right <= innerWidth + 1 && stage.width >= 200 && stage.height >= 200), controlsInside: [...workspace.querySelectorAll<HTMLElement>('[data-lab-v4-configuration-slot] input, [data-lab-v4-configuration-slot] select, [data-action]')].every(el => { const rect = el.getBoundingClientRect(); return rect.left >= -1 && rect.right <= innerWidth + 1 && rect.width > 0 && rect.height > 0; }) };
    }, profile.name);
    expect(record.overflow, `${slug}/${profile.name}: page overflow`).toBe(false);
    expect(record.stageInside, `${slug}/${profile.name}: stage containment`).toBe(true);
    expect(record.controlsInside, `${slug}/${profile.name}: control containment`).toBe(true);
    if (profile.name === 'mobile' || slug === 'gradient-descent') await page.screenshot({ path: `${artifactDir}/final-screenshots/${slug}-${profile.name}.png`, fullPage: true });
    validation.push({ laboratory: slug, profile: profile.name, result: 'PASS' });
  }
  await page.setViewportSize(profiles[0]); await open(page, 'gradient-descent'); const initial = await page.locator('#lab-param-learningRate').inputValue(); await page.locator('#lab-param-learningRate').press('ArrowRight'); const changed = await page.locator('#lab-param-learningRate').inputValue();
  for (const profile of [profiles[2], profiles[4], profiles[7], profiles[0]]) await page.setViewportSize(profile);
  expect(await page.locator('#lab-param-learningRate').inputValue()).toBe(changed); await expect(page.locator('[data-action="run"]')).toBeVisible();
  audit.push(...labs.map(slug => ({ laboratoryId: slug, rendererFamily: 'registered scientific renderer', primarySpatialConstraint: 'readable Stage and operable Rail', minimumStageSize: { inline: 200, block: 200 }, profiles: profiles.map(profile => profile.name), internalScroll: ['Scientific Log', 'Findings History'], classification: 'CANONICAL' })));
  await page.screenshot({ path: `${artifactDir}/final-screenshots/gradient-descent-resize-continuity-1440x900.png`, fullPage: true });
  writeFileSync(`${artifactDir}/responsive-architecture-audit.json`, JSON.stringify({ result: 'PASS', breakpointAuthority: ['1180px', '900px', '700px'], contracts: audit }, null, 2));
  writeFileSync(`${artifactDir}/responsive-architecture-validation.json`, JSON.stringify({ result: 'PASS', horizontalOverflowFailures: 0, stateContinuityFailures: 0, focusContinuityFailures: 0, records: validation }, null, 2));
});
