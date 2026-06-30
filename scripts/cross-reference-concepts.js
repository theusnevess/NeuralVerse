const fs = require('fs');
const path = require('path');

const BASE = path.resolve(__dirname, '..');
const CURRICULUM_PATH = path.join(BASE, 'website', 'data', 'curriculum-index.json');
const CONCEPTS_INDEX_PATH = path.join(BASE, 'website', 'data', 'concepts', 'index.json');
const CONCEPTS_DIR = path.join(BASE, 'website', 'data', 'concepts', 'concepts');

const curriculum = JSON.parse(fs.readFileSync(CURRICULUM_PATH, 'utf-8'));
const conceptsIndex = JSON.parse(fs.readFileSync(CONCEPTS_INDEX_PATH, 'utf-8'));

const conceptToArtifacts = {};

for (const artifact of curriculum.artifacts || []) {
  if (!Array.isArray(artifact.concepts)) continue;
  for (const conceptId of artifact.concepts) {
    if (!conceptToArtifacts[conceptId]) {
      conceptToArtifacts[conceptId] = new Set();
    }
    conceptToArtifacts[conceptId].add(artifact.id);
  }
}

let updated = 0;
let skipped = 0;

for (const entry of conceptsIndex.concepts || []) {
  const filePath = path.join(CONCEPTS_DIR, path.basename(entry.file));
  if (!fs.existsSync(filePath)) {
    console.log(`  SKIP (not found): ${entry.file}`);
    skipped++;
    continue;
  }

  const concept = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  const artifactIds = Array.from(conceptToArtifacts[entry.id] || []).sort();

  if (JSON.stringify(concept.artifactReferences) === JSON.stringify(artifactIds)) {
    skipped++;
    continue;
  }

  concept.artifactReferences = artifactIds;
  fs.writeFileSync(filePath, JSON.stringify(concept, null, 2) + '\n', 'utf-8');
  console.log(`  UPDATED: ${entry.id} — ${artifactIds.length} artifact(s)`);
  updated++;
}

console.log(`\nDone. ${updated} concept(s) updated, ${skipped} unchanged/missing.`);
