/** BIP-M8 frontend-safe delivery contract boundary. */

export const PACKAGE_SCHEMA = '1.0.0';
export const LEARNER_STATE_SCHEMA = 'learner-state:1.0.0';
export const SUPPORTED_BLOCK_SCHEMA = '1.0.0';

export const IntegrationState = Object.freeze({
  LOADING: 'loading',
  PARTIAL_LOADING: 'partial_loading',
  EMPTY: 'empty',
  READY: 'ready',
  TRANSPORT_ERROR: 'transport_error',
  SCHEMA_ERROR: 'schema_error',
  MISSING_ASSET: 'missing_asset',
  UNSUPPORTED_VERSION: 'unsupported_version',
  BLOCKED_PUBLICATION: 'blocked_publication',
  LABORATORY_FAILURE: 'laboratory_failure',
  ASSESSMENT_FAILURE: 'assessment_failure',
  OFFLINE: 'offline',
});

export class ContractError extends Error {
  constructor(code, message, details = {}) {
    super(message);
    this.name = 'ContractError';
    this.code = code;
    this.details = details;
  }
}

function required(value, name) {
  if (value === undefined || value === null || value === '') {
    throw new ContractError('SCHEMA_INVALID', `Missing required field: ${name}`);
  }
  return value;
}

function stringField(value, name) {
  return String(required(value, name));
}

function arrayField(value, name) {
  if (!Array.isArray(value)) {
    throw new ContractError('SCHEMA_INVALID', `${name} must be an array`);
  }
  return value;
}

function assertSupportedVersion(version, name) {
  if (String(version) !== PACKAGE_SCHEMA && String(version) !== SUPPORTED_BLOCK_SCHEMA) {
    throw new ContractError('UNSUPPORTED_VERSION', `${name} is not supported`, { version });
  }
}

function validateBlocks(rawBlocks) {
  const blocks = arrayField(rawBlocks, 'blocks').map((raw, index) => {
    const block = { ...required(raw, `blocks[${index}]`) };
    block.content_block_id = stringField(block.content_block_id, `blocks[${index}].content_block_id`);
    block.block_type = stringField(block.block_type, `blocks[${index}].block_type`);
    block.sequence_position = Number(required(block.sequence_position, `blocks[${index}].sequence_position`));
    if (!Number.isInteger(block.sequence_position) || block.sequence_position < 0) {
      throw new ContractError('SCHEMA_INVALID', `Invalid block sequence at ${index}`);
    }
    block.extensions = block.extensions && typeof block.extensions === 'object' ? { ...block.extensions } : {};
    return block;
  });
  const ids = new Set();
  for (const block of blocks) {
    if (ids.has(block.content_block_id)) {
      throw new ContractError('SCHEMA_INVALID', `Duplicate block identity: ${block.content_block_id}`);
    }
    ids.add(block.content_block_id);
  }
  const ordered = [...blocks].sort((left, right) => left.sequence_position - right.sequence_position);
  if (ordered.some((block, index) => block !== blocks[index])) {
    throw new ContractError('SCHEMA_INVALID', 'Canonical block order was changed by transport');
  }
  return Object.freeze(blocks);
}

/** Decode a Backend PublishedLearningPackage without interpreting agent output. */
export function decodePublishedLearningPackage(raw) {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
    throw new ContractError('SCHEMA_INVALID', 'Published package must be an object');
  }
  assertSupportedVersion(raw.contract_version, 'package contract_version');
  assertSupportedVersion(raw.release_schema_version, 'release_schema_version');
  const blocks = validateBlocks(raw.blocks);
  const packageId = stringField(raw.content_package_id, 'content_package_id');
  const versionId = stringField(raw.content_version_id, 'content_version_id');
  const releaseId = stringField(raw.publication_release_id, 'publication_release_id');
  if (raw.release_id !== releaseId) {
    throw new ContractError('SCHEMA_INVALID', 'release_id and publication_release_id differ');
  }
  if (raw.status && raw.status !== 'released') {
    throw new ContractError('BLOCKED_PUBLICATION', 'Publication release is not released', { status: raw.status });
  }
  return Object.freeze({
    contractName: raw.contract_name,
    contractVersion: String(raw.contract_version),
    packageId,
    contentVersionId: versionId,
    publicationReleaseId: releaseId,
    releaseSchemaVersion: String(raw.release_schema_version),
    generatedFromManifestId: stringField(raw.generated_from_manifest_id, 'generated_from_manifest_id'),
    publicationManifestId: stringField(raw.publication_manifest_id, 'publication_manifest_id'),
    curriculumNodeIds: Object.freeze([...(raw.curriculum_node_ids || [])].map(String)),
    revision: Number(raw.revision || 0),
    releasedAt: stringField(raw.released_at, 'released_at'),
    blocks,
    relationships: Object.freeze([...(raw.relationships || [])]),
    sources: Object.freeze([...(raw.sources || [])]),
    citations: Object.freeze([...(raw.citations || [])]),
    assets: Object.freeze([...(raw.assets || [])]),
    laboratories: Object.freeze([...(raw.laboratories || [])]),
    assessments: Object.freeze([...(raw.assessments || [])]),
    provenance: Object.freeze({ ...(raw.provenance || {}) }),
    validationSummary: raw.validation_summary ? Object.freeze({ ...raw.validation_summary }) : null,
    // Compatible extensions are retained, never interpreted as canonical semantics.
    extensions: Object.freeze({ ...(raw.extensions || {}) }),
  });
}

export function classifyDeliveryError(status, payload = {}) {
  const code = payload.code || payload.error_code;
  if (status === 404 || status === 410) return { state: IntegrationState.BLOCKED_PUBLICATION, code: code || 'RELEASE_UNAVAILABLE' };
  if (status === 406) return { state: IntegrationState.UNSUPPORTED_VERSION, code: code || 'SCHEMA_VERSION_UNSUPPORTED' };
  if (status === 409 || status === 424) return { state: IntegrationState.BLOCKED_PUBLICATION, code: code || 'DELIVERY_BLOCKED' };
  if (status >= 500 || status === 0) return { state: IntegrationState.TRANSPORT_ERROR, code: code || 'TRANSPORT_FAILURE' };
  return { state: IntegrationState.TRANSPORT_ERROR, code: code || 'DELIVERY_FAILURE' };
}
