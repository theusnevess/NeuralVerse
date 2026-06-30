#!/usr/bin/env node
/**
 * NV-1100-P10 — Scalability & Performance Infrastructure Validator
 * Validates:
 * - Cache governance (LRU bounded, read-only, deterministic)
 * - Indexed lookups (concept, lab, visualization, memory)
 * - Lazy loading and caching behavior
 * - Search segmentation
 * - Semantic traversal caching
 * - Deferred initialization
 * - Performance instrumentation
 * - Storage adapter abstraction
 * - No backend dependencies, no telemetry, no LLM calls
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const WEBSITE = path.join(ROOT, 'website');
const SCRIPTS = path.join(WEBSITE, 'scripts');

let errors = [];
let warnings = [];
let passed = 0;

function check(condition, msg) {
  if (condition) {
    passed++;
  } else {
    errors.push(msg);
  }
}

function warn(condition, msg) {
  if (!condition) {
    warnings.push(msg);
  }
}

function fileExists(relativePath) {
  return fs.existsSync(path.join(SCRIPTS, relativePath));
}

function readFile(relativePath) {
  try {
    return fs.readFileSync(path.join(SCRIPTS, relativePath), 'utf8');
  } catch (e) {
    return '';
  }
}

// 1. P10 Infrastructure Files Exist
console.log('\n=== P10 Infrastructure Files ===');
check(fileExists('scalability/bounded-lru-cache.js'), 'Missing bounded-lru-cache.js');
check(fileExists('scalability/performance-instrumentation.js'), 'Missing performance-instrumentation.js');
check(fileExists('scalability/indexeddb-adapter.js'), 'Missing indexeddb-adapter.js');
check(fileExists('scalability/deferred-init-manager.js'), 'Missing deferred-init-manager.js');

// 2. LRU Cache Governance
console.log('\n=== Cache Governance ===');
const lruCode = readFile('scalability/bounded-lru-cache.js');
check(lruCode.includes('createBoundedLRUCache'), 'LRU cache factory function exists');
check(lruCode.includes('maxSize') || lruCode.includes('_maxSize'), 'LRU cache has bounded size');
check(lruCode.includes('invalidate'), 'LRU cache has explicit invalidation');
check(lruCode.includes('invalidateAll'), 'LRU cache has invalidateAll');
check(lruCode.includes('evict'), 'LRU cache has deterministic eviction');
check(!lruCode.includes('Math.random'), 'LRU cache does not use randomness');
check(!lruCode.includes('Date.now'), 'LRU cache does not use non-deterministic time');

// 3. Performance Instrumentation
console.log('\n=== Performance Instrumentation ===');
const perfCode = readFile('scalability/performance-instrumentation.js');
check(perfCode.includes('recordCacheHit'), 'Instrumentation records cache hits');
check(perfCode.includes('recordCacheMiss'), 'Instrumentation records cache misses');
check(perfCode.includes('recordRegistryLookup'), 'Instrumentation records registry lookups');
check(perfCode.includes('recordSearchQuery'), 'Instrumentation records search queries');
check(perfCode.includes('recordLazyLoad'), 'Instrumentation records lazy loads');
check(perfCode.includes('_enabled = false'), 'Instrumentation disabled by default');
check(!perfCode.includes('fetch('), 'Instrumentation has no external requests');
check(!perfCode.includes('navigator.sendBeacon'), 'Instrumentation has no telemetry');

// 4. IndexedDB Preparation
console.log('\n=== IndexedDB Preparation ===');
const idbCode = readFile('scalability/indexeddb-adapter.js');
check(idbCode.includes('createIndexedDBAdapter'), 'IndexedDB adapter factory exists');
check(idbCode.includes('createUnifiedStorageAdapter'), 'Unified storage adapter exists');
check(idbCode.includes('migrateTo'), 'Migration method exists');
check(idbCode.includes('localStorage'), 'localStorage adapter preserved');

// 5. Deferred Initialization
console.log('\n=== Deferred Initialization ===');
const dimCode = readFile('scalability/deferred-init-manager.js');
check(dimCode.includes('register'), 'Deferred init has register method');
check(dimCode.includes('initialize'), 'Deferred init has initialize method');
check(dimCode.includes('isInitialized'), 'Deferred init has isInitialized method');
check(dimCode.includes('getAllStatus'), 'Deferred init has status reporting');
check(!dimCode.includes('setInterval'), 'Deferred init does not use polling');
check(!dimCode.includes('setTimeout'), 'Deferred init does not use setTimeout for init');

// 6. Curriculum Service Indexing
console.log('\n=== Curriculum Service Indexing ===');
const currService = readFile('curriculum/curriculum-service.js');
check(currService.includes('buildIdIndex'), 'Curriculum service builds ID indexes');
check(currService.includes('_pathIndex'), 'Curriculum service has path index');
check(currService.includes('_moduleIndex'), 'Curriculum service has module index');
check(currService.includes('_lessonIndex'), 'Curriculum service has lesson index');
check(currService.includes('_artifactIndex'), 'Curriculum service has artifact index');

// 7. Shared Knowledge Lazy Loading + Cache
console.log('\n=== Shared Knowledge Lazy Loading ===');
const skService = readFile('shared-knowledge/shared-knowledge-service.js');
check(skService.includes('BoundedLRUCache') || skService.includes('_getLRU'), 'Shared knowledge uses LRU cache');
check(skService.includes('PerfInstrumentation'), 'Shared knowledge uses performance instrumentation');
check(skService.includes('Object.freeze'), 'Shared knowledge freezes loaded data');

// 8. Concept Layer Indexing
console.log('\n=== Concept Layer Indexing ===');
const conceptService = readFile('concepts/concept-layer-service.js');
check(conceptService.includes('_aliasIndex'), 'Concept service has alias index');
check(conceptService.includes('_categoryIndex'), 'Concept service has category index');
check(conceptService.includes('_sharedDomainIndex'), 'Concept service has shared domain index');
check(conceptService.includes('getByAlias'), 'Concept service has getByAlias method');
check(conceptService.includes('getByCategory'), 'Concept service has getByCategory method');
check(conceptService.includes('getBySharedKnowledgeDomain'), 'Concept service has getBySharedKnowledgeDomain method');
check(conceptService.includes('_buildSecondaryIndexes'), 'Concept service builds secondary indexes');

// 9. Memory Registry Multi-Index
console.log('\n=== Memory Registry Multi-Index ===');
const memRegistry = readFile('memory/memory-registry.js');
check(memRegistry.includes('_typeIndex'), 'Memory registry has type index');
check(memRegistry.includes('_tagIndex'), 'Memory registry has tag index');
check(memRegistry.includes('_conceptIndex'), 'Memory registry has concept index');
check(memRegistry.includes('_artifactIndex'), 'Memory registry has artifact index');
check(memRegistry.includes('_pinnedSet'), 'Memory registry has pinned set');
check(memRegistry.includes('_addToIndexes'), 'Memory registry maintains indexes on add');
check(memRegistry.includes('_removeFromIndexes'), 'Memory registry maintains indexes on remove');
check(memRegistry.includes('_rebuildIndexes'), 'Memory registry can rebuild indexes');

// 10. Lab Registry Indexing
console.log('\n=== Lab Registry Indexing ===');
const labReg = readFile('laboratory/lab-registry.js');
check(labReg.includes('_slugIndex'), 'Lab registry has slug index');
check(labReg.includes('_categoryIndex'), 'Lab registry has category index');
check(labReg.includes('_conceptIndex'), 'Lab registry has concept index');
check(labReg.includes('_artifactIndex'), 'Lab registry has artifact index');
check(labReg.includes('_addToIndexes'), 'Lab registry maintains indexes on add');
check(labReg.includes('_removeFromIndexes'), 'Lab registry maintains indexes on remove');

// 11. Parametric Registry Indexing
console.log('\n=== Parametric Registry Indexing ===');
const vizReg = readFile('visualizations/parametric-registry.js');
check(vizReg.includes('_slugIndex'), 'Parametric registry has slug index');
check(vizReg.includes('_categoryIndex'), 'Parametric registry has category index');
check(vizReg.includes('_conceptIndex'), 'Parametric registry has concept index');
check(vizReg.includes('getByConcept'), 'Parametric registry has getByConcept method');

// 12. Semantic Traversal Caching
console.log('\n=== Semantic Traversal Caching ===');
const semTraversal = readFile('semantic-learning/semantic-traversal.js');
check(semTraversal.includes('_traversalCache'), 'Semantic traversal has cache');
check(semTraversal.includes('BoundedLRUCache'), 'Semantic traversal uses LRU cache');
check(semTraversal.includes('PerfInstrumentation'), 'Semantic traversal uses performance instrumentation');
const semNeighborhood = readFile('semantic-learning/semantic-neighborhood.js');
check(semNeighborhood.includes('_neighborhoodCache'), 'Semantic neighborhood has cache');
check(semNeighborhood.includes('BoundedLRUCache'), 'Semantic neighborhood uses LRU cache');

// 13. Workspace Incremental Rendering
console.log('\n=== Workspace Incremental Rendering ===');
const wsController = readFile('workspace/workspace-controller.js');
check(wsController.includes('_dirtySections'), 'Workspace has dirty section tracking');
check(wsController.includes('markDirty'), 'Workspace has markDirty method');
check(wsController.includes('renderDirty'), 'Workspace has renderDirty method');
check(wsController.includes('requestIdleCallback'), 'Workspace uses idle callback for deferred rendering');

// 14. Search Segmentation
console.log('\n=== Search Segmentation ===');
const searchCode = readFile('curriculum/curriculum-search.js');
check(searchCode.includes('_partitions'), 'Search has partition system');
check(searchCode.includes('getPartitions'), 'Search exposes getPartitions method');
check(searchCode.includes('_partitions.curriculum'), 'Search partitions curriculum');
check(searchCode.includes('_partitions.concepts'), 'Search partitions concepts');
check(searchCode.includes('_partitions.knowledge'), 'Search partitions knowledge');
check(searchCode.includes('_partitions.memory'), 'Search partitions memory');
check(searchCode.includes('_partitions.laboratories'), 'Search partitions laboratories');
check(searchCode.includes('_partitions.visualizations'), 'Search partitions visualizations');

// 15. Forbidden Patterns
console.log('\n=== Forbidden Patterns ===');
const allFiles = [
  'scalability/bounded-lru-cache.js',
  'scalability/performance-instrumentation.js',
  'scalability/indexeddb-adapter.js',
  'scalability/deferred-init-manager.js'
];

for (const file of allFiles) {
  const code = readFile(file);
  check(!code.includes('XMLHttpRequest'), `${file}: No XMLHttpRequest`);
  check(!code.includes('navigator.sendBeacon'), `${file}: No sendBeacon`);
  check(!code.includes('fetch(') || file.includes('indexeddb'), `${file}: No external fetch (except IDDB)`);
}

// 16. HTML Script Loading
console.log('\n=== HTML Script Loading ===');
const indexHtml = fs.readFileSync(path.join(WEBSITE, 'index.html'), 'utf8');
check(indexHtml.includes('scripts/scalability/bounded-lru-cache.js'), 'bounded-lru-cache.js loaded in HTML');
check(indexHtml.includes('scripts/scalability/performance-instrumentation.js'), 'performance-instrumentation.js loaded in HTML');
check(indexHtml.includes('scripts/scalability/indexeddb-adapter.js'), 'indexeddb-adapter.js loaded in HTML');
check(indexHtml.includes('scripts/scalability/deferred-init-manager.js'), 'deferred-init-manager.js loaded in HTML');

// Results
console.log('\n=== P10 Validation Results ===');
console.log(`Passed: ${passed}`);
console.log(`Errors: ${errors.length}`);
console.log(`Warnings: ${warnings.length}`);

if (errors.length > 0) {
  console.log('\nErrors:');
  errors.forEach((e, i) => console.log(`  ${i + 1}. ${e}`));
}

if (warnings.length > 0) {
  console.log('\nWarnings:');
  warnings.forEach((w, i) => console.log(`  ${i + 1}. ${w}`));
}

process.exit(errors.length > 0 ? 1 : 0);
