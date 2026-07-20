/** Canonical, versioned release configuration for the BIP-M8 delivery path. */

import { ContractError } from './contract.js';

export const RELEASE_REGISTRY_SCHEMA = 'frontend-release-map:1.0.0';

// This is deliberately a checked-in, immutable map.  It is not a harness
// injection point and it never represents a mutable "latest" release.
export const CANONICAL_RELEASE_REGISTRY = Object.freeze({
  schema_name: 'FrontendReleaseRegistry',
  schema_version: RELEASE_REGISTRY_SCHEMA,
  entries: Object.freeze([
    Object.freeze({
      route_key: 'svd-image-compression',
      content_package_id: '9e3d4c65-9b7c-4f20-8a95-8f6ce2f0d701',
      content_version_id: '9e3d4c65-9b7c-4f20-8a95-8f6ce2f0d702',
      publication_release_id: '9e3d4c65-9b7c-4f20-8a95-8f6ce2f0d703',
      environment: 'non-production',
      enabled: true,
    }),
  ]),
});

function nonEmpty(value, field) {
  if (typeof value !== 'string' || value.trim() === '') {
    throw new ContractError('RELEASE_REGISTRY_INVALID', `${field} must be a non-empty string`);
  }
  return value;
}

function validateEntry(raw, index) {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
    throw new ContractError('RELEASE_REGISTRY_INVALID', `entry ${index} must be an object`);
  }
  return Object.freeze({
    routeKey: nonEmpty(raw.route_key, `entries[${index}].route_key`),
    packageId: nonEmpty(raw.content_package_id, `entries[${index}].content_package_id`),
    contentVersionId: nonEmpty(raw.content_version_id, `entries[${index}].content_version_id`),
    publicationReleaseId: nonEmpty(raw.publication_release_id, `entries[${index}].publication_release_id`),
    environment: nonEmpty(raw.environment, `entries[${index}].environment`),
    enabled: raw.enabled === true,
  });
}

export function createReleaseRegistry(raw = CANONICAL_RELEASE_REGISTRY) {
  if (!raw || raw.schema_name !== 'FrontendReleaseRegistry' || raw.schema_version !== RELEASE_REGISTRY_SCHEMA) {
    throw new ContractError('RELEASE_REGISTRY_INVALID', 'unsupported release registry schema');
  }
  if (!Array.isArray(raw.entries)) {
    throw new ContractError('RELEASE_REGISTRY_INVALID', 'release registry entries must be an array');
  }
  const entries = raw.entries.map(validateEntry);
  const routes = new Set();
  const releases = new Set();
  for (const entry of entries) {
    if (routes.has(entry.routeKey) || releases.has(entry.publicationReleaseId)) {
      throw new ContractError('RELEASE_REGISTRY_INVALID', 'duplicate route or release identity');
    }
    routes.add(entry.routeKey);
    releases.add(entry.publicationReleaseId);
  }
  const byRoute = new Map(entries.map((entry) => [entry.routeKey, entry]));
  return Object.freeze({
    schemaName: raw.schema_name,
    schemaVersion: raw.schema_version,
    entries: Object.freeze(entries),
    resolve(routeKey) {
      const entry = byRoute.get(String(routeKey));
      if (!entry || !entry.enabled) return null;
      return entry;
    },
  });
}

export const canonicalReleaseRegistry = createReleaseRegistry();
