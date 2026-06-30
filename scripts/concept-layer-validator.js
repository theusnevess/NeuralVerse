#!/usr/bin/env node
/**
 * NV-1100 Concept Layer Validator
 *
 * Validates the Concept Layer registry for:
 * - Unique IDs across all concepts
 * - Unique names across all concepts
 * - Unique aliases across all concepts
 * - Unique keywords within each concept
 * - Valid categories (from index.governance.validCategories or validCategories)
 * - Valid difficulty levels
 * - Valid canonicalStatus ("Draft" or "Reviewed")
 * - Semver format for version
 * - ISO date format for lastReviewed
 * - Non-empty reviewedBy
 * - sourceReferences structure (id, title, type, description)
 * - Related concepts exist in the registry
 * - Prerequisite concepts exist in the registry
 * - No self-dependencies in prerequisites
 * - No cycles in prerequisite graph (topological sort)
 * - No duplicate relations
 * - sharedKnowledgeDomains exist in shared knowledge index
 * - artifactReferences exist in curriculum-index.json (if it exists)
 * - Generates JSON and Markdown reports
 */

const fs = require('fs');
const path = require('path');

const CONCEPTS_BASE = path.join(__dirname, '..', 'website', 'data', 'concepts');
const INDEX_PATH = path.join(CONCEPTS_BASE, 'index.json');
const SHARED_KNOWLEDGE_INDEX = path.join(__dirname, '..', 'website', 'data', 'shared-knowledge', 'index.json');
const CURRICULUM_INDEX = path.join(__dirname, '..', 'website', 'data', 'curriculum-index.json');
const REPORT_DIR = path.join(__dirname, '..', 'docs', 'architecture', 'nv-1100');

const VALID_STATUSES = ['Draft', 'Reviewed'];
const VALID_DIFFICULTY = ['beginner', 'intermediate', 'advanced', 'expert'];
const VALID_SOURCE_TYPES = ['paper', 'book', 'documentation', 'benchmark', 'course', 'article', 'standard', 'internal'];
const VALID_RELATION_TYPES = ['depends_on', 'extends', 'contrasts', 'implements', 'uses', 'supports', 'generalizes', 'specializes', 'related_to'];
const SEMVER_REGEX = /^\d+\.\d+\.\d+$/;
const DATE_ONLY_REGEX = /^\d{4}-\d{2}-\d{2}$/;
const DATETIME_REGEX = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?Z$/;
const PLACEHOLDER_REVIEWED_BY = ['TBD', 'unknown', 'TODO', ''];

let errors = [];
let warnings = [];
let info = [];
let checked = 0;
let passed = 0;

function log(level, message) {
  const prefix = {
    error: '\x1b[31mERROR\x1b[0m',
    warn: '\x1b[33mWARN\x1b[0m',
    ok: '\x1b[32mPASS\x1b[0m',
    info: '\x1b[36mINFO\x1b[0m'
  };
  console.log(`${prefix[level] || level}  ${message}`);
}

function validateObjectArray(value, fieldName, conceptId, requiredKeys = []) {
  if (!Array.isArray(value)) {
    errors.push(`[${conceptId}] "${fieldName}" must be an array, got ${typeof value}`);
    return false;
  }
  for (let i = 0; i < value.length; i++) {
    if (typeof value[i] !== 'object' || value[i] === null) {
      errors.push(`[${conceptId}] "${fieldName}[${i}]" must be an object`);
      return false;
    }
    for (const key of requiredKeys) {
      if (!(key in value[i])) {
        errors.push(`[${conceptId}] "${fieldName}[${i}]" missing required key "${key}"`);
      }
    }
  }
  return true;
}

function validateConcept(conceptData, allConceptIds, allConceptNames, allAliases, validCategories, validDifficulty, sharedKnowledgeDomainIds, artifactIds, seenIds) {
  const id = conceptData.id;
  checked++;

  // --- Required fields ---
  if (typeof id !== 'string' || id.length === 0) {
    errors.push(`[${id || 'UNKNOWN'}] "id" must be a non-empty string`);
  }
  if (typeof conceptData.name !== 'string' || conceptData.name.length === 0) {
    errors.push(`[${id}] "name" must be a non-empty string`);
  }
  if (typeof conceptData.summary !== 'string' || conceptData.summary.length === 0) {
    errors.push(`[${id}] "summary" must be a non-empty string`);
  }

  // --- Unique ID (check within concept files, not against index) ---
  if (seenIds.has(id)) {
    errors.push(`[${id}] Duplicate concept ID: "${id}"`);
  }
  seenIds.add(id);

  // --- Verify ID matches an index entry ---
  if (!allConceptIds.has(id)) {
    errors.push(`[${id}] Concept ID "${id}" not found in index`);
  }

  // --- Unique name ---
  const nameKey = (conceptData.name || '').toLowerCase().trim();
  if (allConceptNames.has(nameKey)) {
    errors.push(`[${id}] Duplicate concept name: "${conceptData.name}"`);
  }
  allConceptNames.add(nameKey);

  // --- Unique aliases across all concepts ---
  if (Array.isArray(conceptData.aliases)) {
    for (const alias of conceptData.aliases) {
      const aliasKey = alias.toLowerCase().trim();
      if (allAliases.has(aliasKey)) {
        const existing = allAliases.get(aliasKey);
        errors.push(`[${id}] Alias "${alias}" already used by concept "${existing}"`);
      }
      allAliases.set(aliasKey, id);
    }
  }

  // --- Unique keywords within concept ---
  if (Array.isArray(conceptData.keywords)) {
    const kwSet = new Set();
    for (const kw of conceptData.keywords) {
      const kwLower = kw.toLowerCase().trim();
      if (kwSet.has(kwLower)) {
        warnings.push(`[${id}] Duplicate keyword within concept: "${kw}"`);
      }
      kwSet.add(kwLower);
    }
  }

  // --- Valid category ---
  if (conceptData.category && validCategories.length > 0) {
    if (!validCategories.includes(conceptData.category)) {
      errors.push(`[${id}] Invalid category: "${conceptData.category}". Must be one of: ${validCategories.join(', ')}`);
    }
  }

  // --- Valid difficulty ---
  if (conceptData.difficulty && validDifficulty.length > 0) {
    if (!validDifficulty.includes(conceptData.difficulty)) {
      errors.push(`[${id}] Invalid difficulty: "${conceptData.difficulty}". Must be one of: ${validDifficulty.join(', ')}`);
    }
  }

  // --- Canonical status ---
  if (conceptData.canonicalStatus !== undefined) {
    if (!VALID_STATUSES.includes(conceptData.canonicalStatus)) {
      errors.push(`[${id}] Invalid canonicalStatus: "${conceptData.canonicalStatus}". Must be one of: ${VALID_STATUSES.join(', ')}`);
    }
  }

  // --- Semver version ---
  if (conceptData.version !== undefined) {
    if (typeof conceptData.version !== 'string' || !SEMVER_REGEX.test(conceptData.version)) {
      errors.push(`[${id}] "version" must be semver format (e.g. "1.0.0"), got "${conceptData.version}"`);
    }
  }

  // --- ISO date lastReviewed ---
  if (conceptData.lastReviewed !== undefined) {
    if (typeof conceptData.lastReviewed !== 'string') {
      errors.push(`[${id}] "lastReviewed" must be a string, got ${typeof conceptData.lastReviewed}`);
    } else if (!DATE_ONLY_REGEX.test(conceptData.lastReviewed) && !DATETIME_REGEX.test(conceptData.lastReviewed)) {
      errors.push(`[${id}] "lastReviewed" must be ISO date (YYYY-MM-DD) or ISO datetime, got "${conceptData.lastReviewed}"`);
    }
  }

  // --- reviewedBy ---
  if (conceptData.reviewedBy !== undefined) {
    if (typeof conceptData.reviewedBy !== 'string' || conceptData.reviewedBy.length === 0) {
      errors.push(`[${id}] "reviewedBy" must be a non-empty string`);
    } else if (PLACEHOLDER_REVIEWED_BY.includes(conceptData.reviewedBy)) {
      errors.push(`[${id}] "reviewedBy" must not be placeholder text ("${conceptData.reviewedBy}")`);
    }
  }

  // --- sourceReferences structure ---
  if (conceptData.sourceReferences !== undefined) {
    if (validateObjectArray(conceptData.sourceReferences, 'sourceReferences', id, ['id', 'title', 'type', 'description'])) {
      for (let i = 0; i < conceptData.sourceReferences.length; i++) {
        const ref = conceptData.sourceReferences[i];
        if (ref.type && !VALID_SOURCE_TYPES.includes(ref.type)) {
          errors.push(`[${id}] "sourceReferences[${i}].type" must be one of: ${VALID_SOURCE_TYPES.join(', ')}, got "${ref.type}"`);
        }
      }
    }
  }

  // --- relatedConcepts: must exist in registry ---
  if (Array.isArray(conceptData.relatedConcepts)) {
    const seenRels = new Set();
    for (let i = 0; i < conceptData.relatedConcepts.length; i++) {
      const rel = conceptData.relatedConcepts[i];
      if (typeof rel !== 'object' || rel === null) {
        errors.push(`[${id}] "relatedConcepts[${i}]" must be an object`);
        continue;
      }
      if (!rel.concept) {
        errors.push(`[${id}] "relatedConcepts[${i}]" missing required key "concept"`);
      }
      if (!rel.type) {
        errors.push(`[${id}] "relatedConcepts[${i}]" missing required key "type"`);
      } else if (!VALID_RELATION_TYPES.includes(rel.type)) {
        errors.push(`[${id}] "relatedConcepts[${i}].type" must be one of: ${VALID_RELATION_TYPES.join(', ')}, got "${rel.type}"`);
      }
      // Target concept must exist
      if (rel.concept && rel.concept !== id && !allConceptIds.has(rel.concept)) {
        errors.push(`[${id}] "relatedConcepts[${i}].concept" references non-existent concept: "${rel.concept}"`);
      }
      // Self-reference warning
      if (rel.concept === id) {
        warnings.push(`[${id}] "relatedConcepts[${i}]" references self`);
      }
      // Duplicate relation detection
      const relKey = `${rel.concept || ''}::${rel.type || ''}`;
      if (seenRels.has(relKey)) {
        warnings.push(`[${id}] Duplicate relation: concept="${rel.concept}", type="${rel.type}"`);
      }
      seenRels.add(relKey);
    }
  }

  // --- prerequisiteConcepts: must exist, no self-dependencies ---
  if (Array.isArray(conceptData.prerequisiteConcepts)) {
    for (let i = 0; i < conceptData.prerequisiteConcepts.length; i++) {
      const prereq = conceptData.prerequisiteConcepts[i];
      if (prereq === id) {
        errors.push(`[${id}] Self-dependency in prerequisites: "${prereq}"`);
      }
      if (prereq !== id && !allConceptIds.has(prereq)) {
        errors.push(`[${id}] "prerequisiteConcepts[${i}]" references non-existent concept: "${prereq}"`);
      }
    }
  }

  // --- sharedKnowledgeDomains: must exist in shared knowledge index ---
  if (Array.isArray(conceptData.sharedKnowledgeDomains)) {
    for (let i = 0; i < conceptData.sharedKnowledgeDomains.length; i++) {
      const domain = conceptData.sharedKnowledgeDomains[i];
      if (!sharedKnowledgeDomainIds.has(domain)) {
        errors.push(`[${id}] "sharedKnowledgeDomains[${i}]" references non-existent shared knowledge domain: "${domain}"`);
      }
    }
  }

  // --- artifactReferences: must exist in curriculum-index.json ---
  if (artifactIds !== null && Array.isArray(conceptData.artifactReferences)) {
    for (let i = 0; i < conceptData.artifactReferences.length; i++) {
      const artRef = conceptData.artifactReferences[i];
      if (typeof artRef === 'string') {
        if (!artifactIds.has(artRef)) {
          errors.push(`[${id}] "artifactReferences[${i}]" references non-existent artifact: "${artRef}"`);
        }
      } else if (typeof artRef === 'object' && artRef !== null) {
        const artId = artRef.id || artRef.artifactId;
        if (artId && !artifactIds.has(artId)) {
          errors.push(`[${id}] "artifactReferences[${i}].id" references non-existent artifact: "${artId}"`);
        }
      }
    }
  }

  passed++;
  log('ok', `[${id}] Validated successfully`);
}

function detectCycles(prerequisiteMap) {
  const visited = new Set();
  const recStack = new Set();
  const cycles = [];

  function dfs(node, path) {
    visited.add(node);
    recStack.add(node);
    path.push(node);

    const prereqs = prerequisiteMap.get(node) || [];
    for (const prereq of prereqs) {
      if (!visited.has(prereq)) {
        const result = dfs(prereq, [...path]);
        if (result) return result;
      } else if (recStack.has(prereq)) {
        const cycleStart = path.indexOf(prereq);
        const cycle = path.slice(cycleStart).concat(prereq);
        return cycle;
      }
    }

    recStack.delete(node);
    return null;
  }

  for (const [node] of prerequisiteMap) {
    if (!visited.has(node)) {
      const cycle = dfs(node, []);
      if (cycle) {
        cycles.push(cycle);
      }
    }
  }

  return cycles;
}

function validateIndex(index) {
  log('info', 'Validating index.json...');

  if (!index.version) {
    errors.push('Index missing "version" field');
  }
  if (!index.schemaVersion) {
    errors.push('Index missing "schemaVersion" field');
  }
  if (!index.governance) {
    errors.push('Index missing "governance" block');
  } else {
    const requiredGovernanceKeys = ['status', 'owner', 'lastReviewed', 'reviewPolicy'];
    for (const key of requiredGovernanceKeys) {
      if (!index.governance[key]) {
        errors.push(`Index governance missing required field: "${key}"`);
      }
    }
  }
  if (!index.concepts || !Array.isArray(index.concepts)) {
    errors.push('Index missing "concepts" array');
    return null;
  }

  const conceptIds = new Set();
  for (const entry of index.concepts) {
    if (!entry.id) {
      errors.push('Index concept entry missing "id"');
      continue;
    }
    if (conceptIds.has(entry.id)) {
      errors.push(`Duplicate concept ID in index: "${entry.id}"`);
    }
    conceptIds.add(entry.id);
    if (!entry.file) {
      errors.push(`[${entry.id}] Index entry missing "file" path`);
    }
  }

  return conceptIds;
}

function collectArtifactIds(curriculumIndex) {
  const ids = new Set();
  if (!curriculumIndex) return ids;

  // Collect from all artifact scopes
  if (Array.isArray(curriculumIndex.learningPaths)) {
    for (const lp of curriculumIndex.learningPaths) {
      if (Array.isArray(lp.artifactScope)) {
        for (const artId of lp.artifactScope) {
          ids.add(artId);
        }
      }
    }
  }
  return ids;
}

function generateJsonReport(index, conceptResults, cycles, sharedKnowledgeDomainIds, artifactIds) {
  return {
    validator: 'NV-1100 Concept Layer Validator',
    generatedAt: new Date().toISOString(),
    timestamp: new Date().toISOString(),
    schemaVersion: index.schemaVersion || '1.0',
    summary: {
      conceptsChecked: checked,
      conceptsPassed: passed,
      errors: errors.length,
      warnings: warnings.length,
      info: info.length
    },
    concepts: conceptResults,
    prerequisiteCycles: cycles,
    sharedKnowledgeDomainCount: sharedKnowledgeDomainIds.size,
    artifactCount: artifactIds ? artifactIds.size : 0,
    errors,
    warnings,
    info,
    decision: errors.length === 0 ? 'READY' : 'NOT READY'
  };
}

function generateMarkdownReport(report) {
  let md = '# NV-1100 Concept Layer Report\n\n';
  md += `**Generated**: ${report.timestamp}\n`;
  md += `**Schema Version**: ${report.schemaVersion}\n`;
  md += `**Decision**: ${report.decision === 'READY' ? '✅ READY' : '❌ NOT READY'}\n\n`;

  md += '## Summary\n\n';
  md += `| Metric | Value |\n|--------|-------|\n`;
  md += `| Concepts checked | ${report.summary.conceptsChecked} |\n`;
  md += `| Concepts passed | ${report.summary.conceptsPassed} |\n`;
  md += `| Errors | ${report.summary.errors} |\n`;
  md += `| Warnings | ${report.summary.warnings} |\n`;
  md += `| Info | ${report.summary.info} |\n`;
  md += `| Shared knowledge domains | ${report.sharedKnowledgeDomainCount} |\n`;
  md += `| Curriculum artifacts | ${report.artifactCount} |\n\n`;

  if (report.errors.length > 0) {
    md += '## Errors\n\n';
    report.errors.forEach((e) => { md += `- ${e}\n`; });
    md += '\n';
  }

  if (report.warnings.length > 0) {
    md += '## Warnings\n\n';
    report.warnings.forEach((w) => { md += `- ${w}\n`; });
    md += '\n';
  }

  if (report.info.length > 0) {
    md += '## Information\n\n';
    report.info.forEach((i) => { md += `- ${i}\n`; });
    md += '\n';
  }

  if (report.prerequisiteCycles.length > 0) {
    md += '## Prerequisite Cycles\n\n';
    report.prerequisiteCycles.forEach((cycle) => {
      md += `- ${cycle.join(' → ')}\n`;
    });
    md += '\n';
  }

  md += '## Concept Details\n\n';
  for (const concept of report.concepts) {
    md += `### ${concept.id}\n`;
    md += `- **Name**: ${concept.name || 'N/A'}\n`;
    md += `- **Category**: ${concept.category || 'N/A'}\n`;
    md += `- **Difficulty**: ${concept.difficulty || 'N/A'}\n`;
    md += `- **Version**: ${concept.version || 'N/A'}\n`;
    md += `- **Reviewed By**: ${concept.reviewedBy || 'N/A'}\n`;
    md += `- **Status**: ${concept.canonicalStatus || 'N/A'}\n`;
    md += `- **Source References**: ${concept.sourceReferences || 0}\n`;
    md += `- **Related Concepts**: ${concept.relatedConcepts || 0}\n`;
    md += `- **Prerequisites**: ${concept.prerequisites || 0}\n`;
    md += `- **Keywords**: ${concept.keywords || 0}\n`;
    md += `- **Aliases**: ${concept.aliases || 0}\n\n`;
  }

  return md;
}

function main() {
  console.log('\x1b[1m=== NV-1100 Concept Layer Validator ===\x1b[0m\n');

  // Load index
  if (!fs.existsSync(INDEX_PATH)) {
    log('error', `Index file not found: ${INDEX_PATH}`);
    process.exit(1);
  }

  const index = JSON.parse(fs.readFileSync(INDEX_PATH, 'utf-8'));
  const indexConceptIds = validateIndex(index);

  if (!indexConceptIds) {
    log('error', 'Failed to validate index');
    process.exit(1);
  }

  // Valid categories from index
  const validCategories = index.validCategories || (index.governance && index.governance.validCategories) || [];
  const validDifficulty = index.validDifficulty || ['beginner', 'intermediate', 'advanced', 'expert'];

  // Load shared knowledge index for domain validation
  let sharedKnowledgeDomainIds = new Set();
  if (fs.existsSync(SHARED_KNOWLEDGE_INDEX)) {
    try {
      const skIndex = JSON.parse(fs.readFileSync(SHARED_KNOWLEDGE_INDEX, 'utf-8'));
      if (Array.isArray(skIndex.domains)) {
        for (const domain of skIndex.domains) {
          if (domain.id) sharedKnowledgeDomainIds.add(domain.id);
        }
      }
      log('info', `Loaded ${sharedKnowledgeDomainIds.size} shared knowledge domains`);
    } catch (err) {
      log('warn', `Failed to parse shared-knowledge/index.json: ${err.message}`);
    }
  } else {
    log('info', 'shared-knowledge/index.json not found, skipping domain validation');
  }

  // Load curriculum index for artifact validation
  let artifactIds = null;
  if (fs.existsSync(CURRICULUM_INDEX)) {
    try {
      const ci = JSON.parse(fs.readFileSync(CURRICULUM_INDEX, 'utf-8'));
      artifactIds = collectArtifactIds(ci);
      log('info', `Loaded ${artifactIds.size} curriculum artifacts`);
    } catch (err) {
      log('warn', `Failed to parse curriculum-index.json: ${err.message}`);
    }
  } else {
    log('info', 'curriculum-index.json not found, skipping artifact validation');
  }

  // Collect all concept IDs from index
  const allConceptIds = new Set(Array.from(indexConceptIds));
  const allConceptNames = new Set();
  const allAliases = new Map();
  const prerequisiteMap = new Map();
  const seenIds = new Set();

  // First pass: load all concept data and check unique IDs, names, aliases
  const conceptFiles = new Map();
  for (const entry of index.concepts) {
    const filePath = path.join(CONCEPTS_BASE, entry.file);
    if (!fs.existsSync(filePath)) {
      errors.push(`[${entry.id}] Concept file not found: ${entry.file}`);
      continue;
    }
    try {
      const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
      conceptFiles.set(entry.id, data);
    } catch (err) {
      errors.push(`[${entry.id}] Failed to parse JSON: ${err.message}`);
    }
  }

  // Second pass: validate each concept
  const conceptResults = [];
  for (const entry of index.concepts) {
    const data = conceptFiles.get(entry.id);
    if (!data) continue;

    validateConcept(data, allConceptIds, allConceptNames, allAliases, validCategories, validDifficulty, sharedKnowledgeDomainIds, artifactIds, seenIds);

    // Collect prerequisites for cycle detection
    if (Array.isArray(data.prerequisiteConcepts)) {
      prerequisiteMap.set(entry.id, data.prerequisiteConcepts);
    }

    conceptResults.push({
      id: data.id,
      name: data.name,
      category: data.category || null,
      difficulty: data.difficulty || null,
      version: data.version || null,
      reviewedBy: data.reviewedBy || null,
      canonicalStatus: data.canonicalStatus || null,
      sourceReferences: Array.isArray(data.sourceReferences) ? data.sourceReferences.length : 0,
      relatedConcepts: Array.isArray(data.relatedConcepts) ? data.relatedConcepts.length : 0,
      prerequisites: Array.isArray(data.prerequisiteConcepts) ? data.prerequisiteConcepts.length : 0,
      keywords: Array.isArray(data.keywords) ? data.keywords.length : 0,
      aliases: Array.isArray(data.aliases) ? data.aliases.length : 0
    });
  }

  // --- Cycle detection ---
  log('info', '\nChecking prerequisite graph for cycles...');
  const cycles = detectCycles(prerequisiteMap);
  if (cycles.length > 0) {
    for (const cycle of cycles) {
      errors.push(`Cycle detected in prerequisite graph: ${cycle.join(' → ')}`);
    }
    log('error', `Found ${cycles.length} prerequisite cycle(s)`);
  } else {
    log('ok', 'No prerequisite cycles detected');
  }

  // --- Summary ---
  console.log('\n\x1b[1m--- Summary ---\x1b[0m');
  console.log(`Concepts checked: ${checked}`);
  console.log(`Concepts passed:  ${passed}`);
  console.log(`Errors:           ${errors.length}`);
  console.log(`Warnings:         ${warnings.length}`);
  console.log(`Info:             ${info.length}`);

  if (errors.length > 0) {
    console.log('\n\x1b[31mErrors:\x1b[0m');
    errors.forEach((e) => console.log(`  - ${e}`));
  }

  if (warnings.length > 0) {
    console.log('\n\x1b[33mWarnings:\x1b[0m');
    warnings.forEach((w) => console.log(`  - ${w}`));
  }

  if (info.length > 0) {
    console.log('\n\x1b[36mInfo:\x1b[0m');
    info.forEach((i) => console.log(`  - ${i}`));
  }

  // Generate reports
  const report = generateJsonReport(index, conceptResults, cycles, sharedKnowledgeDomainIds, artifactIds);
  const mdReport = generateMarkdownReport(report);

  // Ensure report directory exists
  if (!fs.existsSync(REPORT_DIR)) {
    fs.mkdirSync(REPORT_DIR, { recursive: true });
  }

  const jsonReportPath = path.join(REPORT_DIR, 'concept-layer-report.json');
  const mdReportPath = path.join(REPORT_DIR, 'concept-layer-report.md');

  fs.writeFileSync(jsonReportPath, JSON.stringify(report, null, 2));
  fs.writeFileSync(mdReportPath, mdReport);

  console.log(`\n\x1b[36mINFO\x1b[0m  JSON report: ${jsonReportPath}`);
  console.log(`\x1b[36mINFO\x1b[0m  Markdown report: ${mdReportPath}`);

  if (errors.length === 0) {
    console.log('\n\x1b[32m✓ Concept layer validation passed.\x1b[0m');
    process.exit(0);
  } else {
    console.log('\n\x1b[31m✗ Concept layer validation failed.\x1b[0m');
    process.exit(1);
  }
}

main();
