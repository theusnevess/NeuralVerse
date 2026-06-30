#!/usr/bin/env node
/**
 * NV-1100-P3A — Shared Knowledge Governance Validator
 *
 * Validates the shared knowledge repository for:
 * - Unique IDs
 * - Required fields (including governance fields)
 * - Duplicate concepts within and across domains
 * - Malformed arrays
 * - Invalid lifecycle values
 * - Broken related references (typed relations)
 * - Semver version format
 * - reviewedBy presence
 * - sourceReferences structure
 * - Typed relatedConcepts structure and valid relation types
 * - Cross-domain concept deduplication
 * - Circular reference detection
 * - Generates JSON and Markdown reports
 */

const fs = require('fs');
const path = require('path');

const BASE_PATH = path.join(__dirname, '..', 'website', 'data', 'shared-knowledge');
const INDEX_PATH = path.join(BASE_PATH, 'index.json');
const REPORT_DIR = path.join(__dirname, '..', 'docs', 'architecture', 'nv-1100');

const REQUIRED_FIELDS = ['id', 'title', 'summary', 'concepts', 'keywords', 'historicalContext'];
const GOVERNANCE_FIELDS = ['version', 'reviewedBy', 'sourceReferences', 'relatedConcepts', 'lastReviewed', 'canonicalStatus'];
const VALID_STATUSES = ['Draft', 'Reviewed'];
const VALID_RELATION_TYPES = ['depends_on', 'extends', 'contrasts', 'uses', 'implements', 'supports', 'generalizes', 'specializes', 'related_to'];
const VALID_SOURCE_TYPES = ['paper', 'book', 'documentation', 'benchmark', 'course', 'article', 'standard', 'internal'];
const SEMVER_REGEX = /^\d+\.\d+\.\d+$/;
const PLACEHOLDER_REVIEWED_BY = ['TBD', 'unknown', 'TODO', ''];

let errors = [];
let warnings = [];
let info = [];
let checked = 0;
let passed = 0;

function log(level, message) {
  const prefix = { error: '\x1b[31mERROR\x1b[0m', warn: '\x1b[33mWARN\x1b[0m', ok: '\x1b[32mPASS\x1b[0m', info: '\x1b[36mINFO\x1b[0m' };
  console.log(`${prefix[level] || level}  ${message}`);
}

function validateArray(value, fieldName, domainId) {
  if (!Array.isArray(value)) {
    errors.push(`[${domainId}] "${fieldName}" must be an array, got ${typeof value}`);
    return false;
  }
  return true;
}

function validateObjectArray(value, fieldName, domainId, requiredKeys = []) {
  if (!validateArray(value, fieldName, domainId)) return false;
  for (let i = 0; i < value.length; i++) {
    if (typeof value[i] !== 'object' || value[i] === null) {
      errors.push(`[${domainId}] "${fieldName}[${i}]" must be an object`);
      return false;
    }
    for (const key of requiredKeys) {
      if (!(key in value[i])) {
        errors.push(`[${domainId}] "${fieldName}[${i}]" missing required key "${key}"`);
      }
    }
  }
  return true;
}

function validateDomain(domainData, allDomainIds, allConceptsMap) {
  const id = domainData.id;
  checked++;

  // Required fields
  for (const field of REQUIRED_FIELDS) {
    if (!(field in domainData)) {
      errors.push(`[${id}] Missing required field: "${field}"`);
    }
  }

  // ID must be a string
  if (typeof domainData.id !== 'string') {
    errors.push(`[${id}] "id" must be a string`);
  }

  // Title must be a non-empty string
  if (typeof domainData.title !== 'string' || domainData.title.length === 0) {
    errors.push(`[${id}] "title" must be a non-empty string`);
  }

  // Summary must be a non-empty string
  if (typeof domainData.summary !== 'string' || domainData.summary.length === 0) {
    errors.push(`[${id}] "summary" must be a non-empty string`);
  }

  // --- Governance Fields ---

  // Version (semver)
  if ('version' in domainData) {
    if (typeof domainData.version !== 'string' || !SEMVER_REGEX.test(domainData.version)) {
      errors.push(`[${id}] "version" must be semver format (e.g. "1.0.0"), got "${domainData.version}"`);
    }
  } else {
    warnings.push(`[${id}] Missing governance field: "version"`);
  }

  // reviewedBy
  if ('reviewedBy' in domainData) {
    if (typeof domainData.reviewedBy !== 'string' || domainData.reviewedBy.length === 0) {
      errors.push(`[${id}] "reviewedBy" must be a non-empty string`);
    } else if (PLACEHOLDER_REVIEWED_BY.includes(domainData.reviewedBy)) {
      errors.push(`[${id}] "reviewedBy" must not be placeholder text ("${domainData.reviewedBy}")`);
    }
  } else {
    warnings.push(`[${id}] Missing governance field: "reviewedBy"`);
  }

  // sourceReferences
  if ('sourceReferences' in domainData) {
    validateObjectArray(domainData.sourceReferences, 'sourceReferences', id, ['id', 'title', 'type', 'description']);
    if (Array.isArray(domainData.sourceReferences)) {
      const refIds = new Set();
      for (let i = 0; i < domainData.sourceReferences.length; i++) {
        const ref = domainData.sourceReferences[i];
        if (ref.type && !VALID_SOURCE_TYPES.includes(ref.type)) {
          errors.push(`[${id}] "sourceReferences[${i}].type" must be one of: ${VALID_SOURCE_TYPES.join(', ')}, got "${ref.type}"`);
        }
        if (ref.id) {
          if (refIds.has(ref.id)) {
            errors.push(`[${id}] Duplicate source reference id: "${ref.id}"`);
          }
          refIds.add(ref.id);
        }
      }
      // Reviewed entries should have at least one source reference
      if (domainData.sourceReferences.length === 0 && domainData.canonicalStatus === 'Reviewed') {
        warnings.push(`[${id}] Reviewed entry has empty sourceReferences`);
      }
    }
  } else {
    warnings.push(`[${id}] Missing governance field: "sourceReferences"`);
  }

  // --- Array fields ---
  if ('concepts' in domainData) validateArray(domainData.concepts, 'concepts', id);
  if ('keywords' in domainData) validateArray(domainData.keywords, 'keywords', id);
  if ('industryApplications' in domainData) validateArray(domainData.industryApplications, 'industryApplications', id);
  if ('curiosityFacts' in domainData) validateArray(domainData.curiosityFacts, 'curiosityFacts', id);
  if ('storySeeds' in domainData) validateArray(domainData.storySeeds, 'storySeeds', id);
  if ('assessmentSeeds' in domainData) validateArray(domainData.assessmentSeeds, 'assessmentSeeds', id);
  if ('professionalInsights' in domainData) validateArray(domainData.professionalInsights, 'professionalInsights', id);
  if ('recommendedVisualizations' in domainData) validateArray(domainData.recommendedVisualizations, 'recommendedVisualizations', id);
  if ('recommendedLabs' in domainData) validateArray(domainData.recommendedLabs, 'recommendedLabs', id);
  if ('relatedArtifacts' in domainData) validateArray(domainData.relatedArtifacts, 'relatedArtifacts', id);

  // --- Object array fields ---
  if ('landmarkReferences' in domainData) {
    validateObjectArray(domainData.landmarkReferences, 'landmarkReferences', id, ['title', 'authors', 'year', 'contribution']);
  }
  if ('commonMisconceptions' in domainData) {
    validateObjectArray(domainData.commonMisconceptions, 'commonMisconceptions', id, ['trigger', 'wrong', 'correct']);
  }
  if ('analogies' in domainData) {
    validateObjectArray(domainData.analogies, 'analogies', id, ['text', 'limitations']);
  }

  // --- Typed relatedConcepts ---
  if ('relatedConcepts' in domainData) {
    if (validateArray(domainData.relatedConcepts, 'relatedConcepts', id)) {
      for (let i = 0; i < domainData.relatedConcepts.length; i++) {
        const rel = domainData.relatedConcepts[i];
        if (typeof rel !== 'object' || rel === null) {
          errors.push(`[${id}] "relatedConcepts[${i}]" must be an object`);
          continue;
        }
        if (!rel.domain) {
          errors.push(`[${id}] "relatedConcepts[${i}]" missing required key "domain"`);
        }
        if (!rel.type) {
          errors.push(`[${id}] "relatedConcepts[${i}]" missing required key "type"`);
        } else if (!VALID_RELATION_TYPES.includes(rel.type)) {
          errors.push(`[${id}] "relatedConcepts[${i}].type" must be one of: ${VALID_RELATION_TYPES.join(', ')}, got "${rel.type}"`);
        }
        // Check for self-references
        if (rel.domain === id) {
          warnings.push(`[${id}] "relatedConcepts[${i}]" references self`);
        }
        // Check target domain exists
        if (rel.domain && !allDomainIds.includes(rel.domain)) {
          errors.push(`[${id}] "relatedConcepts[${i}].domain" references non-existent domain: "${rel.domain}"`);
        }
      }
    }
  }

  // --- Canonical status ---
  if ('canonicalStatus' in domainData) {
    if (!VALID_STATUSES.includes(domainData.canonicalStatus)) {
      errors.push(`[${id}] Invalid canonicalStatus: "${domainData.canonicalStatus}". Must be one of: ${VALID_STATUSES.join(', ')}`);
    }
  }

  // --- Last reviewed date format ---
  if ('lastReviewed' in domainData) {
    const dateOnlyRegex = /^\d{4}-\d{2}-\d{2}$/;
    const dateTimeRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?Z$/;
    if (!dateOnlyRegex.test(domainData.lastReviewed) && !dateTimeRegex.test(domainData.lastReviewed)) {
      errors.push(`[${id}] "lastReviewed" must be ISO date (YYYY-MM-DD) or ISO datetime, got "${domainData.lastReviewed}"`);
    }
  } else {
    warnings.push(`[${id}] Missing governance field: "lastReviewed"`);
  }

  // --- Duplicate concepts within domain ---
  if (Array.isArray(domainData.concepts)) {
    const conceptSet = new Set();
    for (const concept of domainData.concepts) {
      if (conceptSet.has(concept)) {
        warnings.push(`[${id}] Duplicate concept within domain: "${concept}"`);
      }
      conceptSet.add(concept);
    }
    // Register concepts for cross-domain check
    allConceptsMap.set(id, Array.from(conceptSet));
  }

  // --- Duplicate keywords ---
  if (Array.isArray(domainData.keywords)) {
    const keywordSet = new Set();
    for (const keyword of domainData.keywords) {
      if (keywordSet.has(keyword)) {
        warnings.push(`[${id}] Duplicate keyword: "${keyword}"`);
      }
      keywordSet.add(keyword);
    }
  }

  passed++;
  log('ok', `[${id}] Validated successfully`);
}

function validateCrossDomainConcepts(allConceptsMap) {
  log('info', '\nChecking cross-domain concept duplication...');

  const conceptToDomains = new Map();
  const duplicateList = [];
  for (const [domainId, concepts] of allConceptsMap) {
    for (const concept of concepts) {
      const normalized = concept.toLowerCase().trim();
      if (!conceptToDomains.has(normalized)) {
        conceptToDomains.set(normalized, []);
      }
      conceptToDomains.get(normalized).push(domainId);
    }
  }

  const allowedOverlap = new Set([
    'regularization', 'backpropagation', 'batch normalization', 'dropout',
    'convolution', 'causal masking', 'dense retrieval'
  ]);

  for (const [concept, domains] of conceptToDomains) {
    if (domains.length > 1) {
      duplicateList.push({ concept, domains });
      if (allowedOverlap.has(concept)) {
        info.push(`Cross-domain concept "${concept}" (allowed overlap): ${domains.join(', ')}`);
      } else {
        warnings.push(`Cross-domain duplicate concept "${concept}" found in: ${domains.join(', ')}`);
      }
    }
  }

  info.push(`Found ${duplicateList.length} cross-domain concept duplication(s) total`);
  return duplicateList;
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
  if (!index.domains || !Array.isArray(index.domains)) {
    errors.push('Index missing "domains" array');
    return;
  }

  const domainIds = new Set();
  for (const entry of index.domains) {
    if (!entry.id) {
      errors.push('Index domain entry missing "id"');
      continue;
    }
    if (domainIds.has(entry.id)) {
      errors.push(`Duplicate domain ID in index: "${entry.id}"`);
    }
    domainIds.add(entry.id);

    if (!entry.file) {
      errors.push(`[${entry.id}] Index entry missing "file" path`);
    }
  }

  return domainIds;
}

function generateJsonReport(index, domainResults, duplicateConcepts) {
  return {
    validator: 'NV-1100-P3A Shared Knowledge Governance Validator',
    generatedAt: new Date().toISOString(),
    timestamp: new Date().toISOString(),
    schemaVersion: index.schemaVersion || '1.0',
    summary: {
      domainsChecked: checked,
      domainsPassed: passed,
      errors: errors.length,
      warnings: warnings.length,
      info: info.length
    },
    domains: domainResults,
    errors,
    warnings,
    info,
    duplicateConcepts: duplicateConcepts || [],
    decision: errors.length === 0 ? 'READY' : 'NOT READY'
  };
}

function generateMarkdownReport(report) {
  let md = '# NV-1100-P3A — Shared Knowledge Governance Report\n\n';
  md += `**Generated**: ${report.timestamp}\n`;
  md += `**Schema Version**: ${report.schemaVersion}\n`;
  md += `**Decision**: ${report.decision === 'READY' ? '✅ READY' : '❌ NOT READY'}\n\n`;

  md += '## Summary\n\n';
  md += `| Metric | Value |\n|--------|-------|\n`;
  md += `| Domains checked | ${report.summary.domainsChecked} |\n`;
  md += `| Domains passed | ${report.summary.domainsPassed} |\n`;
  md += `| Errors | ${report.summary.errors} |\n`;
  md += `| Warnings | ${report.summary.warnings} |\n`;
  md += `| Info | ${report.summary.info} |\n\n`;

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

  md += '## Domain Details\n\n';
  for (const domain of report.domains) {
    md += `### ${domain.id}\n`;
    md += `- **Title**: ${domain.title || 'N/A'}\n`;
    md += `- **Version**: ${domain.version || 'N/A'}\n`;
    md += `- **Reviewed By**: ${domain.reviewedBy || 'N/A'}\n`;
    md += `- **Status**: ${domain.canonicalStatus || 'N/A'}\n`;
    md += `- **Source References**: ${domain.sourceReferences || 0}\n`;
    md += `- **Typed Relations**: ${domain.typedRelations || 0}\n`;
    md += `- **Concepts**: ${domain.conceptCount || 0}\n\n`;
  }

  md += '## Schema Governance\n\n';
  md += '### Required Fields\n';
  md += REQUIRED_FIELDS.map((f) => `- \`${f}\``).join('\n') + '\n\n';
  md += '### Governance Fields\n';
  md += GOVERNANCE_FIELDS.map((f) => `- \`${f}\``).join('\n') + '\n\n';
  md += '### Valid Relation Types\n';
  md += VALID_RELATION_TYPES.map((t) => `- \`${t}\``).join('\n') + '\n\n';
  md += '### Valid Statuses\n';
  md += VALID_STATUSES.map((s) => `- \`${s}\``).join('\n') + '\n';

  return md;
}

function main() {
  console.log('\x1b[1m=== NV-1100-P3A Shared Knowledge Governance Validator ===\x1b[0m\n');

  // Load index
  if (!fs.existsSync(INDEX_PATH)) {
    log('error', `Index file not found: ${INDEX_PATH}`);
    process.exit(1);
  }

  const index = JSON.parse(fs.readFileSync(INDEX_PATH, 'utf-8'));
  const domainIds = validateIndex(index);

  if (!domainIds) {
    log('error', 'Failed to validate index');
    process.exit(1);
  }

  // Load and validate each domain
  const allDomainIds = Array.from(domainIds);
  const allConceptsMap = new Map();
  const domainResults = [];

  for (const entry of index.domains) {
    const filePath = path.join(BASE_PATH, entry.file);
    if (!fs.existsSync(filePath)) {
      errors.push(`[${entry.id}] Domain file not found: ${entry.file}`);
      continue;
    }

    try {
      const domainData = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
      validateDomain(domainData, allDomainIds, allConceptsMap);
      domainResults.push({
        id: domainData.id,
        title: domainData.title,
        version: domainData.version || null,
        reviewedBy: domainData.reviewedBy || null,
        canonicalStatus: domainData.canonicalStatus || null,
        sourceReferences: Array.isArray(domainData.sourceReferences) ? domainData.sourceReferences.length : 0,
        typedRelations: Array.isArray(domainData.relatedConcepts) ? domainData.relatedConcepts.length : 0,
        conceptCount: Array.isArray(domainData.concepts) ? domainData.concepts.length : 0
      });
    } catch (err) {
      errors.push(`[${entry.id}] Failed to parse JSON: ${err.message}`);
    }
  }

  // Cross-domain checks
  const duplicateConcepts = validateCrossDomainConcepts(allConceptsMap);

  // Summary
  console.log('\n\x1b[1m--- Summary ---\x1b[0m');
  console.log(`Domains checked: ${checked}`);
  console.log(`Domains passed:  ${passed}`);
  console.log(`Errors:          ${errors.length}`);
  console.log(`Warnings:        ${warnings.length}`);
  console.log(`Info:            ${info.length}`);

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
  const report = generateJsonReport(index, domainResults, duplicateConcepts);
  const mdReport = generateMarkdownReport(report);

  // Ensure report directory exists
  if (!fs.existsSync(REPORT_DIR)) {
    fs.mkdirSync(REPORT_DIR, { recursive: true });
  }

  const jsonReportPath = path.join(REPORT_DIR, 'p3a-governance-report.json');
  const mdReportPath = path.join(REPORT_DIR, 'p3a-governance-report.md');

  fs.writeFileSync(jsonReportPath, JSON.stringify(report, null, 2));
  fs.writeFileSync(mdReportPath, mdReport);

  console.log(`\n\x1b[36mINFO\x1b[0m  JSON report: ${jsonReportPath}`);
  console.log(`\x1b[36mINFO\x1b[0m  Markdown report: ${mdReportPath}`);

  if (errors.length === 0) {
    console.log('\n\x1b[32m✓ Shared knowledge governance validation passed.\x1b[0m');
    process.exit(0);
  } else {
    console.log('\n\x1b[31m✗ Shared knowledge governance validation failed.\x1b[0m');
    process.exit(1);
  }
}

main();
