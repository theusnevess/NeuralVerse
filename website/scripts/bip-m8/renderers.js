/** Deterministic published-block renderer registry. */

export const RendererFamily = Object.freeze({
  TEXT: 'text', MATH: 'math', IMPLEMENTATION: 'implementation', VISUAL: 'visual',
  LABORATORY: 'laboratory', APPLIED: 'applied', ASSESSMENT: 'assessment',
  RESEARCH: 'research', NARRATIVE: 'narrative', CURIOSITY: 'curiosity', UNSUPPORTED: 'unsupported',
});

const TYPE_FAMILIES = Object.freeze({
  text: RendererFamily.TEXT, overview: RendererFamily.TEXT, explanation: RendererFamily.TEXT, concept: RendererFamily.TEXT,
  definition: RendererFamily.TEXT, summary: RendererFamily.TEXT, prerequisite: RendererFamily.TEXT,
  transition: RendererFamily.TEXT, conclusion: RendererFamily.TEXT, derivation: RendererFamily.TEXT,
  math: RendererFamily.MATH, equation: RendererFamily.MATH, formula: RendererFamily.MATH,
  code: RendererFamily.IMPLEMENTATION, implementation: RendererFamily.IMPLEMENTATION,
  image: RendererFamily.VISUAL, diagram: RendererFamily.VISUAL, chart: RendererFamily.VISUAL,
  video: RendererFamily.VISUAL, audio: RendererFamily.VISUAL,
  laboratory: RendererFamily.LABORATORY, laboratory_specification: RendererFamily.LABORATORY,
  case_study: RendererFamily.APPLIED, worked_application: RendererFamily.APPLIED, application: RendererFamily.APPLIED,
  assessment: RendererFamily.ASSESSMENT, assessment_specification: RendererFamily.ASSESSMENT,
  research: RendererFamily.RESEARCH, evidence: RendererFamily.RESEARCH,
  narrative: RendererFamily.NARRATIVE, story: RendererFamily.NARRATIVE,
  curiosity: RendererFamily.CURIOSITY, question: RendererFamily.CURIOSITY,
});

export function createRendererRegistry({ mappings = TYPE_FAMILIES, supportedVersions = ['1.0.0'] } = {}) {
  const registry = new Map(Object.entries(mappings));
  return Object.freeze({
    families: Object.freeze({ ...RendererFamily }),
    supportedVersions: Object.freeze([...supportedVersions]),
    resolve(block) {
      const family = registry.get(String(block?.block_type || '').toLowerCase()) || RendererFamily.UNSUPPORTED;
      return { family, supported: family !== RendererFamily.UNSUPPORTED && supportedVersions.includes('1.0.0') };
    },
    entries: () => Object.freeze([...registry.entries()]),
  });
}

export function renderBlockElement(block, { registry = createRendererRegistry(), resolveAsset = () => null } = {}) {
  const resolution = registry.resolve(block);
  const article = document.createElement('article');
  article.className = `bip-m8-block bip-m8-block--${resolution.family}`;
  article.dataset.blockId = block.content_block_id;
  article.dataset.blockType = block.block_type;
  article.setAttribute('aria-label', `${block.block_type} block`);
  const heading = document.createElement('h2');
  heading.className = 'bip-m8-block__type';
  heading.textContent = resolution.supported ? block.block_type : `Unsupported block: ${block.block_type}`;
  article.appendChild(heading);
  if (!resolution.supported) {
    const message = document.createElement('p');
    message.textContent = `Block ${block.content_block_id} is preserved in order but is not supported by this reader.`;
    article.appendChild(message);
    return article;
  }
  const payload = block.semantic_payload;
  const body = document.createElement('div');
  body.className = 'bip-m8-block__body';
  if (typeof payload === 'string') body.textContent = payload;
  else if (payload && typeof payload === 'object') {
    const text = payload.text || payload.content || payload.description || JSON.stringify(payload);
    body.textContent = String(text);
  } else body.textContent = '';
  article.appendChild(body);
  for (const assetId of block.asset_version_ids || []) {
    const asset = resolveAsset(assetId);
    if (!asset) continue;
    const image = document.createElement('img');
    image.src = asset.delivery_locator;
    image.alt = asset.alt_text || asset.caption || '';
    image.dataset.assetVersionId = asset.asset_version_id || assetId;
    article.appendChild(image);
  }
  return article;
}
