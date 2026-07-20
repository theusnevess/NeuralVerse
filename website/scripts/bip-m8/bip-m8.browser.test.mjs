import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const RELEASE_ID = '9e3d4c65-9b7c-4f20-8a95-8f6ce2f0d703';

function referenceRelease() {
  return {
    contract_name: 'PublishedLearningPackage',
    contract_version: '1.0.0',
    release_schema_version: '1.0.0',
    release_id: RELEASE_ID,
    publication_release_id: RELEASE_ID,
    content_package_id: '9e3d4c65-9b7c-4f20-8a95-8f6ce2f0d701',
    content_version_id: '9e3d4c65-9b7c-4f20-8a95-8f6ce2f0d702',
    generated_from_manifest_id: 'manifest-reference-svd',
    publication_manifest_id: 'publication-manifest-reference-svd',
    released_at: '2026-07-20T00:00:00Z',
    status: 'released',
    blocks: [
      { content_block_id: 'intro', block_type: 'text', sequence_position: 0, semantic_payload: { text: 'Singular Value Decomposition' } },
      { content_block_id: 'formula', block_type: 'math', sequence_position: 1, semantic_payload: { text: 'A = UΣVᵀ' } },
      { content_block_id: 'summary', block_type: 'text', sequence_position: 2, semantic_payload: { text: 'Low-rank approximation preserves the governed order.' } },
    ],
    relationships: [], sources: [], citations: [], assets: [], laboratories: [], assessments: [],
    provenance: { source: 'canonical-reference-package' },
  };
}

async function openReferenceRelease(page) {
  await page.addInitScript(() => {
    globalThis.NV_BIP_M8_FLAGS = { packageDelivery: true };
    globalThis.NV_BIP_M8_API_BASE_URL = '';
  });
  await page.route('**/api/v1/publication/releases/*', async (route) => {
    await route.fulfill({ status: 200, headers: { 'content-type': 'application/json', etag: '"bip-m8-reference"' }, body: JSON.stringify(referenceRelease()) });
  });
  await page.goto('/index.html#/learning/path/module/module/lesson/svd-image-compression', { waitUntil: 'networkidle' });
  const root = page.locator('[data-curriculum-root]');
  await expect(root.locator('.bip-m8-package__blocks')).toBeVisible();
  return root;
}

test('renders the canonical release in order at every supported viewport', async ({ page }) => {
  const root = await openReferenceRelease(page);
  await expect(root.locator('.bip-m8-block')).toHaveCount(3);
  await expect(root.locator('.bip-m8-block__body')).toHaveText([
    'Singular Value Decomposition',
    'A = UΣVᵀ',
    'Low-rank approximation preserves the governed order.',
  ]);
  await expect(root).toHaveScreenshot('bip-m8-reference-release.png', { animations: 'disabled', caret: 'hide' });
});

test('passes scoped Axe audit and exposes a usable heading structure', async ({ page }) => {
  const root = await openReferenceRelease(page);
  const accessibility = await new AxeBuilder({ page }).include('[data-curriculum-root]').analyze();
  const serious = accessibility.violations.filter((violation) => ['critical', 'serious'].includes(violation.impact));
  expect(serious).toEqual([]);
  await expect(root.getByRole('heading', { name: /Published package/ })).toBeVisible();
  await expect(root.locator('h2')).toHaveCount(3);
});
