import { expect, test, type Page } from './fixtures/playwright-runtime-observability';
import { mkdirSync, writeFileSync } from 'node:fs';

const labs = ['gradient-descent', 'linear-regression', 'logistic-regression', 'kmeans-clustering', 'pca-projection', 'bayes-rule', 'embedding-similarity', 'cosine-similarity', 'precision-recall', 'transformer-attention'];
const artifactDir = 'artifacts/nv-1200-scientific-stage';
let navigationId = 0;

async function open(page: Page, slug: string) {
  await page.goto(`/index.html?scientific-stage=${navigationId++}#/laboratory/${slug}`, { waitUntil: 'domcontentloaded' });
  await expect(page.locator('[data-lab-v4-workspace]')).toBeVisible();
}

test('every laboratory exposes coherent scientific Stage evidence', async ({ page }) => {
  test.setTimeout(300_000);
  mkdirSync(`${artifactDir}/final-screenshots`, { recursive: true });
  const records: any[] = [];
  await page.emulateMedia({ reducedMotion: 'reduce' });

  for (const slug of labs) {
    await page.setViewportSize({ width: 390, height: 844 });
    await open(page, slug);
    const preparation = await inspect(page);
    expect(preparation.question, `${slug}: scientific question`).not.toBe('');
    expect(preparation.summary, `${slug}: semantic summary`).not.toBe('');
    expect(preparation.hasScientificMark, `${slug}: primary scientific mark`).toBe(true);
    expect(preparation.invalidText, `${slug}: invalid rendered value`).toBe(false);
    expect(preparation.overflow, `${slug}: horizontal overflow`).toBe(false);
    expect(preparation.primaryInsideStage, `${slug}: primary mark escapes stage`).toBe(true);
    await page.locator('[data-lab-v4-stage]').screenshot({ path: `${artifactDir}/final-screenshots/${slug}__preparation__390x844.png` });

    await page.locator('[data-action="step"]').click();
    const running = await inspect(page);
    expect(running.stageState).not.toBe('preparation');
    expect(running.summary).not.toBe('');
    expect(running.primaryInsideStage, `${slug}: active primary mark escapes stage`).toBe(true);
    await page.locator('[data-lab-v4-stage]').screenshot({ path: `${artifactDir}/final-screenshots/${slug}__running__390x844.png` });

    const step = page.locator('[data-action="step"]');
    for (let index = 0; index < 110 && await step.isEnabled(); index++) await step.click();
    await expect(page.locator('[data-lab-v4-completion-deck]')).toHaveCount(1);
    const completed = await inspect(page);
    expect(completed.stageState).toBe('completed');
    expect(completed.summary).not.toBe('');
    expect(completed.invalidText).toBe(false);
    expect(completed.primaryInsideStage, `${slug}: completed primary mark escapes stage`).toBe(true);
    await page.locator('[data-lab-v4-stage]').screenshot({ path: `${artifactDir}/final-screenshots/${slug}__completed__390x844.png` });
    records.push({ laboratory: slug, preparation, running, completed, result: 'PASS' });
  }

  writeFileSync(`${artifactDir}/scientific-stage-validation.json`, JSON.stringify({ result: 'PASS', reducedMotion: 'PASS', records }, null, 2));
});

async function inspect(page: Page) {
  return page.locator('[data-lab-v4-stage]').evaluate(stage => {
    const box = stage.getBoundingClientRect();
    const primary = stage.querySelector<HTMLElement>('[data-obs-index="0"], [data-obs-id="primary"]');
    const mark = primary?.querySelector<SVGElement>('svg, canvas, [role="img"], [role="tree"]');
    const markBox = mark?.getBoundingClientRect();
    return {
      question: stage.querySelector('[data-scientific-stage-question]')?.textContent?.trim() || '',
      summary: stage.querySelector('[data-scientific-stage-summary]')?.textContent?.trim() || '',
      stageState: stage.getAttribute('data-scientific-stage-state'),
      hasScientificMark: Boolean(mark),
      primaryInsideStage: Boolean(markBox && markBox.left >= box.left - 1 && markBox.right <= box.right + 1 && markBox.top >= box.top - 1 && markBox.bottom <= box.bottom + 1),
      overflow: document.documentElement.scrollWidth > innerWidth + 1,
      invalidText: /\b(?:NaN|Infinity|undefined)\b/.test(stage.textContent || '')
    };
  });
}
