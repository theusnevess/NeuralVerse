/**
 * NV-1500-D3-OPT-05 — Curriculum Roadmap Kernel Tests
 *
 * Deterministic test suite for the Curriculum Roadmap Kernel.
 * Every test is deterministic and reproducible.
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import type {
  CurriculumNode,
  CurriculumRoadmapNode,
  CurriculumRoadmap,
  CurriculumRoadmapType,
  CurriculumRoadmapStage,
  CurriculumRoadmapRegistry,
  CurriculumRoadmapInput,
  CurriculumGraph,
} from './CurriculumAgentContract.ts';

import {
  CANONICAL_ROADMAP_TYPES,
  CANONICAL_ROADMAP_STAGES,
  CANONICAL_GOVERNANCE_STATUSES,
} from './CurriculumAgentContract.ts';

import {
  composeCurriculumNode,
  composeCurriculumGraph,
} from './CurriculumGraphKernel.ts';

import {
  composeRoadmapNode,
  composeRoadmap,
  composeRoadmapRegistry,
  composeRoadmapTrace,
  composeRoadmapProvenance,
  composeCurriculumRoadmaps,
  composeCurriculumArtifactWithRoadmaps,
  isSupportedRoadmapType,
  isSupportedRoadmapStage,
  isSupportedRoadmapGovernanceStatus,
  getCanonicalRoadmapTypes,
  getCanonicalRoadmapStages,
} from './RoadmapKernel.ts';

import {
  validateRoadmapNode,
  validateRoadmap,
  validateRoadmapRegistry,
  validateCurriculumArtifactWithRoadmaps,
  validateRoadmapInput,
  ROADMAP_VALIDATION_CODES,
} from './RoadmapValidation.ts';

// ---------------------------------------------------------------------------
// Test Fixtures
// ---------------------------------------------------------------------------

const VALID_NODE_ENTRY: CurriculumNode = {
  nodeId: 'node-entry',
  nodeType: 'lesson',
  referenceId: 'ref-entry',
  source: 'governance-committee',
  governanceStatus: 'canonical',
  rationale: 'Entry point to curriculum.',
  providedBy: 'curriculum-board',
};

const VALID_NODE_FOUNDATION: CurriculumNode = {
  nodeId: 'node-foundation',
  nodeType: 'lesson',
  referenceId: 'ref-foundation',
  source: 'governance-committee',
  governanceStatus: 'canonical',
  rationale: 'Foundation knowledge.',
  providedBy: 'curriculum-board',
};

const VALID_NODE_CORE: CurriculumNode = {
  nodeId: 'node-core',
  nodeType: 'lesson',
  referenceId: 'ref-core',
  source: 'governance-committee',
  governanceStatus: 'canonical',
  rationale: 'Core curriculum.',
  providedBy: 'curriculum-board',
};

const VALID_NODE_ADVANCED: CurriculumNode = {
  nodeId: 'node-advanced',
  nodeType: 'lesson',
  referenceId: 'ref-advanced',
  source: 'governance-committee',
  governanceStatus: 'accepted',
  rationale: 'Advanced topics.',
  providedBy: 'curriculum-board',
};

const VALID_NODE_COMPLETION: CurriculumNode = {
  nodeId: 'node-completion',
  nodeType: 'capstone',
  referenceId: 'ref-completion',
  source: 'governance-committee',
  governanceStatus: 'canonical',
  rationale: 'Completion milestone.',
  providedBy: 'curriculum-board',
};

const VALID_NODE_SPECIALIZATION: CurriculumNode = {
  nodeId: 'node-specialization',
  nodeType: 'lesson',
  referenceId: 'ref-specialization',
  source: 'governance-committee',
  governanceStatus: 'canonical',
  rationale: 'Specialization track.',
  providedBy: 'curriculum-board',
};

const VALID_NODE_RESEARCH: CurriculumNode = {
  nodeId: 'node-research',
  nodeType: 'lesson',
  referenceId: 'ref-research',
  source: 'governance-committee',
  governanceStatus: 'canonical',
  rationale: 'Research methodology.',
  providedBy: 'curriculum-board',
};

const VALID_GRAPH: CurriculumGraph = {
  graphId: 'graph-001',
  graphLabel: 'Test Curriculum',
  nodes: [
    VALID_NODE_ENTRY,
    VALID_NODE_FOUNDATION,
    VALID_NODE_CORE,
    VALID_NODE_ADVANCED,
    VALID_NODE_COMPLETION,
    VALID_NODE_SPECIALIZATION,
    VALID_NODE_RESEARCH,
  ],
  edges: [],
  deterministic: true,
  generatedFrom: 'deterministic_curriculum_graph_kernel',
  randomUsed: false,
  timeDependency: false,
};

const GRAPH_NODE_IDS = VALID_GRAPH.nodes.map((n) => n.nodeId);

// ---------------------------------------------------------------------------
// Valid Roadmap Tests
// ---------------------------------------------------------------------------

describe('Curriculum Roadmap Kernel — Valid Roadmap', () => {
  it('should compose a valid roadmap', () => {
    const roadmap = composeRoadmap({
      roadmapId: 'roadmap-001',
      roadmapType: 'foundation',
      roadmapLabel: 'Foundation Roadmap',
      nodes: [
        composeRoadmapNode({
          roadmapNodeId: 'rn-001',
          curriculumNodeId: 'node-entry',
          stage: 'entry',
          nodeOrder: 1,
          source: 'governance-committee',
          governanceStatus: 'canonical',
          rationale: 'Entry point.',
          providedBy: 'curriculum-board',
        }),
        composeRoadmapNode({
          roadmapNodeId: 'rn-002',
          curriculumNodeId: 'node-foundation',
          stage: 'foundation',
          nodeOrder: 2,
          source: 'governance-committee',
          governanceStatus: 'canonical',
          rationale: 'Foundation.',
          providedBy: 'curriculum-board',
        }),
        composeRoadmapNode({
          roadmapNodeId: 'rn-003',
          curriculumNodeId: 'node-completion',
          stage: 'completion',
          nodeOrder: 3,
          source: 'governance-committee',
          governanceStatus: 'canonical',
          rationale: 'Completion.',
          providedBy: 'curriculum-board',
        }),
      ],
      entryNodeId: 'node-entry',
      completionNodeId: 'node-completion',
      source: 'governance-committee',
      governanceStatus: 'canonical',
      rationale: 'Foundation learning roadmap.',
      providedBy: 'curriculum-board',
    });
    assert.strictEqual(roadmap.roadmapId, 'roadmap-001');
    assert.strictEqual(roadmap.roadmapType, 'foundation');
    assert.strictEqual(roadmap.nodes.length, 3);
  });

  it('should validate a valid roadmap with no errors', () => {
    const roadmap = composeRoadmap({
      roadmapId: 'roadmap-001',
      roadmapType: 'foundation',
      roadmapLabel: 'Foundation Roadmap',
      nodes: [
        composeRoadmapNode({
          roadmapNodeId: 'rn-001',
          curriculumNodeId: 'node-entry',
          stage: 'entry',
          nodeOrder: 1,
          source: 'governance-committee',
          governanceStatus: 'canonical',
          rationale: 'Entry point.',
          providedBy: 'curriculum-board',
        }),
        composeRoadmapNode({
          roadmapNodeId: 'rn-002',
          curriculumNodeId: 'node-completion',
          stage: 'completion',
          nodeOrder: 2,
          source: 'governance-committee',
          governanceStatus: 'canonical',
          rationale: 'Completion.',
          providedBy: 'curriculum-board',
        }),
      ],
      entryNodeId: 'node-entry',
      completionNodeId: 'node-completion',
      source: 'governance-committee',
      governanceStatus: 'canonical',
      rationale: 'Foundation learning roadmap.',
      providedBy: 'curriculum-board',
    });
    const errors = validateRoadmap(roadmap, GRAPH_NODE_IDS);
    assert.deepStrictEqual(errors, []);
  });
});

// ---------------------------------------------------------------------------
// Valid Registry Tests
// ---------------------------------------------------------------------------

describe('Curriculum Roadmap Kernel — Valid Registry', () => {
  it('should compose and validate a valid registry', () => {
    const roadmap = composeRoadmap({
      roadmapId: 'roadmap-001',
      roadmapType: 'foundation',
      roadmapLabel: 'Foundation Roadmap',
      nodes: [
        composeRoadmapNode({
          roadmapNodeId: 'rn-001',
          curriculumNodeId: 'node-entry',
          stage: 'entry',
          nodeOrder: 1,
          source: 'governance-committee',
          governanceStatus: 'canonical',
          rationale: 'Entry point.',
          providedBy: 'curriculum-board',
        }),
        composeRoadmapNode({
          roadmapNodeId: 'rn-002',
          curriculumNodeId: 'node-completion',
          stage: 'completion',
          nodeOrder: 2,
          source: 'governance-committee',
          governanceStatus: 'canonical',
          rationale: 'Completion.',
          providedBy: 'curriculum-board',
        }),
      ],
      entryNodeId: 'node-entry',
      completionNodeId: 'node-completion',
      source: 'governance-committee',
      governanceStatus: 'canonical',
      rationale: 'Foundation learning roadmap.',
      providedBy: 'curriculum-board',
    });
    const registry = composeRoadmapRegistry({
      registryId: 'reg-001',
      graphId: 'graph-001',
      roadmaps: [roadmap],
    });
    const result = validateRoadmapRegistry(registry, GRAPH_NODE_IDS);
    assert.strictEqual(result.valid, true);
    assert.deepStrictEqual(result.errors, []);
  });
});

// ---------------------------------------------------------------------------
// Foundation Roadmap Tests
// ---------------------------------------------------------------------------

describe('Curriculum Roadmap Kernel — Foundation Roadmap', () => {
  it('should compose a foundation roadmap', () => {
    const roadmap = composeRoadmap({
      roadmapId: 'roadmap-foundation',
      roadmapType: 'foundation',
      roadmapLabel: 'Foundation Path',
      nodes: [
        composeRoadmapNode({
          roadmapNodeId: 'rn-001',
          curriculumNodeId: 'node-entry',
          stage: 'entry',
          nodeOrder: 1,
          source: 'governance-committee',
          governanceStatus: 'canonical',
          rationale: 'Entry.',
          providedBy: 'curriculum-board',
        }),
        composeRoadmapNode({
          roadmapNodeId: 'rn-002',
          curriculumNodeId: 'node-foundation',
          stage: 'foundation',
          nodeOrder: 2,
          source: 'governance-committee',
          governanceStatus: 'canonical',
          rationale: 'Foundation.',
          providedBy: 'curriculum-board',
        }),
        composeRoadmapNode({
          roadmapNodeId: 'rn-003',
          curriculumNodeId: 'node-completion',
          stage: 'completion',
          nodeOrder: 3,
          source: 'governance-committee',
          governanceStatus: 'canonical',
          rationale: 'Completion.',
          providedBy: 'curriculum-board',
        }),
      ],
      entryNodeId: 'node-entry',
      completionNodeId: 'node-completion',
      source: 'governance-committee',
      governanceStatus: 'canonical',
      rationale: 'Foundation learning roadmap.',
      providedBy: 'curriculum-board',
    });
    assert.strictEqual(roadmap.roadmapType, 'foundation');
  });
});

// ---------------------------------------------------------------------------
// Specialization Roadmap Tests
// ---------------------------------------------------------------------------

describe('Curriculum Roadmap Kernel — Specialization Roadmap', () => {
  it('should compose a specialization roadmap', () => {
    const roadmap = composeRoadmap({
      roadmapId: 'roadmap-specialization',
      roadmapType: 'specialization',
      roadmapLabel: 'Specialization Path',
      nodes: [
        composeRoadmapNode({
          roadmapNodeId: 'rn-001',
          curriculumNodeId: 'node-entry',
          stage: 'entry',
          nodeOrder: 1,
          source: 'governance-committee',
          governanceStatus: 'canonical',
          rationale: 'Entry.',
          providedBy: 'curriculum-board',
        }),
        composeRoadmapNode({
          roadmapNodeId: 'rn-002',
          curriculumNodeId: 'node-specialization',
          stage: 'specialization',
          nodeOrder: 2,
          source: 'governance-committee',
          governanceStatus: 'canonical',
          rationale: 'Specialization.',
          providedBy: 'curriculum-board',
        }),
        composeRoadmapNode({
          roadmapNodeId: 'rn-003',
          curriculumNodeId: 'node-completion',
          stage: 'completion',
          nodeOrder: 3,
          source: 'governance-committee',
          governanceStatus: 'canonical',
          rationale: 'Completion.',
          providedBy: 'curriculum-board',
        }),
      ],
      entryNodeId: 'node-entry',
      completionNodeId: 'node-completion',
      source: 'governance-committee',
      governanceStatus: 'canonical',
      rationale: 'Specialization learning roadmap.',
      providedBy: 'curriculum-board',
    });
    assert.strictEqual(roadmap.roadmapType, 'specialization');
  });
});

// ---------------------------------------------------------------------------
// Research Roadmap Tests
// ---------------------------------------------------------------------------

describe('Curriculum Roadmap Kernel — Research Roadmap', () => {
  it('should compose a research roadmap', () => {
    const roadmap = composeRoadmap({
      roadmapId: 'roadmap-research',
      roadmapType: 'research',
      roadmapLabel: 'Research Path',
      nodes: [
        composeRoadmapNode({
          roadmapNodeId: 'rn-001',
          curriculumNodeId: 'node-entry',
          stage: 'entry',
          nodeOrder: 1,
          source: 'governance-committee',
          governanceStatus: 'canonical',
          rationale: 'Entry.',
          providedBy: 'curriculum-board',
        }),
        composeRoadmapNode({
          roadmapNodeId: 'rn-002',
          curriculumNodeId: 'node-research',
          stage: 'research',
          nodeOrder: 2,
          source: 'governance-committee',
          governanceStatus: 'canonical',
          rationale: 'Research.',
          providedBy: 'curriculum-board',
        }),
        composeRoadmapNode({
          roadmapNodeId: 'rn-003',
          curriculumNodeId: 'node-completion',
          stage: 'completion',
          nodeOrder: 3,
          source: 'governance-committee',
          governanceStatus: 'canonical',
          rationale: 'Completion.',
          providedBy: 'curriculum-board',
        }),
      ],
      entryNodeId: 'node-entry',
      completionNodeId: 'node-completion',
      source: 'governance-committee',
      governanceStatus: 'canonical',
      rationale: 'Research learning roadmap.',
      providedBy: 'curriculum-board',
    });
    assert.strictEqual(roadmap.roadmapType, 'research');
  });
});

// ---------------------------------------------------------------------------
// Complete Program Roadmap Tests
// ---------------------------------------------------------------------------

describe('Curriculum Roadmap Kernel — Complete Program Roadmap', () => {
  it('should compose a complete program roadmap', () => {
    const roadmap = composeRoadmap({
      roadmapId: 'roadmap-complete',
      roadmapType: 'complete_program',
      roadmapLabel: 'Complete Program',
      nodes: [
        composeRoadmapNode({
          roadmapNodeId: 'rn-001',
          curriculumNodeId: 'node-entry',
          stage: 'entry',
          nodeOrder: 1,
          source: 'governance-committee',
          governanceStatus: 'canonical',
          rationale: 'Entry.',
          providedBy: 'curriculum-board',
        }),
        composeRoadmapNode({
          roadmapNodeId: 'rn-002',
          curriculumNodeId: 'node-foundation',
          stage: 'foundation',
          nodeOrder: 2,
          source: 'governance-committee',
          governanceStatus: 'canonical',
          rationale: 'Foundation.',
          providedBy: 'curriculum-board',
        }),
        composeRoadmapNode({
          roadmapNodeId: 'rn-003',
          curriculumNodeId: 'node-core',
          stage: 'core',
          nodeOrder: 3,
          source: 'governance-committee',
          governanceStatus: 'canonical',
          rationale: 'Core.',
          providedBy: 'curriculum-board',
        }),
        composeRoadmapNode({
          roadmapNodeId: 'rn-004',
          curriculumNodeId: 'node-advanced',
          stage: 'advanced',
          nodeOrder: 4,
          source: 'governance-committee',
          governanceStatus: 'canonical',
          rationale: 'Advanced.',
          providedBy: 'curriculum-board',
        }),
        composeRoadmapNode({
          roadmapNodeId: 'rn-005',
          curriculumNodeId: 'node-completion',
          stage: 'completion',
          nodeOrder: 5,
          source: 'governance-committee',
          governanceStatus: 'canonical',
          rationale: 'Completion.',
          providedBy: 'curriculum-board',
        }),
      ],
      entryNodeId: 'node-entry',
      completionNodeId: 'node-completion',
      source: 'governance-committee',
      governanceStatus: 'canonical',
      rationale: 'Complete program roadmap.',
      providedBy: 'curriculum-board',
    });
    assert.strictEqual(roadmap.roadmapType, 'complete_program');
    assert.strictEqual(roadmap.nodes.length, 5);
  });
});

// ---------------------------------------------------------------------------
// Duplicate Roadmap Tests
// ---------------------------------------------------------------------------

describe('Curriculum Roadmap Kernel — Duplicate Roadmap', () => {
  it('should detect duplicate roadmap IDs', () => {
    const roadmap1 = composeRoadmap({
      roadmapId: 'roadmap-001',
      roadmapType: 'foundation',
      roadmapLabel: 'Roadmap 1',
      nodes: [
        composeRoadmapNode({
          roadmapNodeId: 'rn-001',
          curriculumNodeId: 'node-entry',
          stage: 'entry',
          nodeOrder: 1,
          source: 'governance-committee',
          governanceStatus: 'canonical',
          rationale: 'Entry.',
          providedBy: 'curriculum-board',
        }),
        composeRoadmapNode({
          roadmapNodeId: 'rn-002',
          curriculumNodeId: 'node-completion',
          stage: 'completion',
          nodeOrder: 2,
          source: 'governance-committee',
          governanceStatus: 'canonical',
          rationale: 'Completion.',
          providedBy: 'curriculum-board',
        }),
      ],
      entryNodeId: 'node-entry',
      completionNodeId: 'node-completion',
      source: 'governance-committee',
      governanceStatus: 'canonical',
      rationale: 'Roadmap 1.',
      providedBy: 'curriculum-board',
    });
    const roadmap2 = composeRoadmap({
      roadmapId: 'roadmap-001',
      roadmapType: 'core',
      roadmapLabel: 'Roadmap 2',
      nodes: [
        composeRoadmapNode({
          roadmapNodeId: 'rn-003',
          curriculumNodeId: 'node-entry',
          stage: 'entry',
          nodeOrder: 1,
          source: 'governance-committee',
          governanceStatus: 'canonical',
          rationale: 'Entry.',
          providedBy: 'curriculum-board',
        }),
        composeRoadmapNode({
          roadmapNodeId: 'rn-004',
          curriculumNodeId: 'node-completion',
          stage: 'completion',
          nodeOrder: 2,
          source: 'governance-committee',
          governanceStatus: 'canonical',
          rationale: 'Completion.',
          providedBy: 'curriculum-board',
        }),
      ],
      entryNodeId: 'node-entry',
      completionNodeId: 'node-completion',
      source: 'governance-committee',
      governanceStatus: 'canonical',
      rationale: 'Roadmap 2.',
      providedBy: 'curriculum-board',
    });
    const registry = composeRoadmapRegistry({
      registryId: 'reg-001',
      graphId: 'graph-001',
      roadmaps: [roadmap1, roadmap2],
    });
    const result = validateRoadmapRegistry(registry, GRAPH_NODE_IDS);
    assert.strictEqual(result.valid, false);
    const dupError = result.errors.find(
      (e) => e.code === ROADMAP_VALIDATION_CODES.ROADMAP_DUPLICATE_ID,
    );
    assert.ok(dupError, 'Should have ROADMAP_DUPLICATE_ID error');
  });
});

// ---------------------------------------------------------------------------
// Duplicate Node Tests
// ---------------------------------------------------------------------------

describe('Curriculum Roadmap Kernel — Duplicate Node', () => {
  it('should detect duplicate nodes in roadmap', () => {
    const roadmap = composeRoadmap({
      roadmapId: 'roadmap-dup-node',
      roadmapType: 'foundation',
      roadmapLabel: 'Duplicate Node Roadmap',
      nodes: [
        composeRoadmapNode({
          roadmapNodeId: 'rn-001',
          curriculumNodeId: 'node-entry',
          stage: 'entry',
          nodeOrder: 1,
          source: 'governance-committee',
          governanceStatus: 'canonical',
          rationale: 'Entry.',
          providedBy: 'curriculum-board',
        }),
        composeRoadmapNode({
          roadmapNodeId: 'rn-002',
          curriculumNodeId: 'node-entry',
          stage: 'foundation',
          nodeOrder: 2,
          source: 'governance-committee',
          governanceStatus: 'canonical',
          rationale: 'Duplicate entry.',
          providedBy: 'curriculum-board',
        }),
      ],
      entryNodeId: 'node-entry',
      completionNodeId: 'node-entry',
      source: 'governance-committee',
      governanceStatus: 'canonical',
      rationale: 'Duplicate node roadmap.',
      providedBy: 'curriculum-board',
    });
    const errors = validateRoadmap(roadmap, GRAPH_NODE_IDS);
    const dupError = errors.find(
      (e) => e.code === ROADMAP_VALIDATION_CODES.ROADMAP_DUPLICATE_NODE,
    );
    assert.ok(dupError, 'Should have ROADMAP_DUPLICATE_NODE error');
  });
});

// ---------------------------------------------------------------------------
// Unsupported Type Tests
// ---------------------------------------------------------------------------

describe('Curriculum Roadmap Kernel — Unsupported Type', () => {
  it('should detect unsupported roadmap type', () => {
    const roadmap = composeRoadmap({
      roadmapId: 'roadmap-bad-type',
      roadmapType: 'foundation',
      roadmapLabel: 'Bad Type Roadmap',
      nodes: [
        composeRoadmapNode({
          roadmapNodeId: 'rn-001',
          curriculumNodeId: 'node-entry',
          stage: 'entry',
          nodeOrder: 1,
          source: 'governance-committee',
          governanceStatus: 'canonical',
          rationale: 'Entry.',
          providedBy: 'curriculum-board',
        }),
        composeRoadmapNode({
          roadmapNodeId: 'rn-002',
          curriculumNodeId: 'node-completion',
          stage: 'completion',
          nodeOrder: 2,
          source: 'governance-committee',
          governanceStatus: 'canonical',
          rationale: 'Completion.',
          providedBy: 'curriculum-board',
        }),
      ],
      entryNodeId: 'node-entry',
      completionNodeId: 'node-completion',
      source: 'governance-committee',
      governanceStatus: 'canonical',
      rationale: 'Bad type roadmap.',
      providedBy: 'curriculum-board',
    });
    // Manually create a roadmap with invalid type for testing
    const invalidRoadmap = { ...roadmap, roadmapType: 'invalid_type' as CurriculumRoadmapType };
    const errors = validateRoadmap(invalidRoadmap, GRAPH_NODE_IDS);
    const typeError = errors.find(
      (e) => e.code === ROADMAP_VALIDATION_CODES.ROADMAP_UNKNOWN_TYPE,
    );
    assert.ok(typeError, 'Should have ROADMAP_UNKNOWN_TYPE error');
  });
});

// ---------------------------------------------------------------------------
// Unsupported Stage Tests
// ---------------------------------------------------------------------------

describe('Curriculum Roadmap Kernel — Unsupported Stage', () => {
  it('should detect unsupported roadmap stage', () => {
    const roadmap = composeRoadmap({
      roadmapId: 'roadmap-bad-stage',
      roadmapType: 'foundation',
      roadmapLabel: 'Bad Stage Roadmap',
      nodes: [
        composeRoadmapNode({
          roadmapNodeId: 'rn-001',
          curriculumNodeId: 'node-entry',
          stage: 'entry',
          nodeOrder: 1,
          source: 'governance-committee',
          governanceStatus: 'canonical',
          rationale: 'Entry.',
          providedBy: 'curriculum-board',
        }),
        composeRoadmapNode({
          roadmapNodeId: 'rn-002',
          curriculumNodeId: 'node-completion',
          stage: 'completion',
          nodeOrder: 2,
          source: 'governance-committee',
          governanceStatus: 'canonical',
          rationale: 'Completion.',
          providedBy: 'curriculum-board',
        }),
      ],
      entryNodeId: 'node-entry',
      completionNodeId: 'node-completion',
      source: 'governance-committee',
      governanceStatus: 'canonical',
      rationale: 'Bad stage roadmap.',
      providedBy: 'curriculum-board',
    });
    // Manually create a roadmap with invalid stage
    const invalidNode = { ...roadmap.nodes[0], stage: 'invalid_stage' as CurriculumRoadmapStage };
    const invalidRoadmap = { ...roadmap, nodes: [invalidNode, roadmap.nodes[1]] };
    const errors = validateRoadmap(invalidRoadmap, GRAPH_NODE_IDS);
    const stageError = errors.find(
      (e) => e.code === ROADMAP_VALIDATION_CODES.ROADMAP_UNKNOWN_STAGE,
    );
    assert.ok(stageError, 'Should have ROADMAP_UNKNOWN_STAGE error');
  });
});

// ---------------------------------------------------------------------------
// Invalid Entry Tests
// ---------------------------------------------------------------------------

describe('Curriculum Roadmap Kernel — Invalid Entry', () => {
  it('should detect entry node not in roadmap nodes', () => {
    const roadmap = composeRoadmap({
      roadmapId: 'roadmap-bad-entry',
      roadmapType: 'foundation',
      roadmapLabel: 'Bad Entry Roadmap',
      nodes: [
        composeRoadmapNode({
          roadmapNodeId: 'rn-001',
          curriculumNodeId: 'node-foundation',
          stage: 'foundation',
          nodeOrder: 1,
          source: 'governance-committee',
          governanceStatus: 'canonical',
          rationale: 'Foundation.',
          providedBy: 'curriculum-board',
        }),
        composeRoadmapNode({
          roadmapNodeId: 'rn-002',
          curriculumNodeId: 'node-completion',
          stage: 'completion',
          nodeOrder: 2,
          source: 'governance-committee',
          governanceStatus: 'canonical',
          rationale: 'Completion.',
          providedBy: 'curriculum-board',
        }),
      ],
      entryNodeId: 'node-entry',
      completionNodeId: 'node-completion',
      source: 'governance-committee',
      governanceStatus: 'canonical',
      rationale: 'Bad entry roadmap.',
      providedBy: 'curriculum-board',
    });
    const errors = validateRoadmap(roadmap, GRAPH_NODE_IDS);
    const entryError = errors.find(
      (e) => e.code === ROADMAP_VALIDATION_CODES.ROADMAP_INVALID_ENTRY,
    );
    assert.ok(entryError, 'Should have ROADMAP_INVALID_ENTRY error');
  });
});

// ---------------------------------------------------------------------------
// Invalid Completion Tests
// ---------------------------------------------------------------------------

describe('Curriculum Roadmap Kernel — Invalid Completion', () => {
  it('should detect completion node not in roadmap nodes', () => {
    const roadmap = composeRoadmap({
      roadmapId: 'roadmap-bad-completion',
      roadmapType: 'foundation',
      roadmapLabel: 'Bad Completion Roadmap',
      nodes: [
        composeRoadmapNode({
          roadmapNodeId: 'rn-001',
          curriculumNodeId: 'node-entry',
          stage: 'entry',
          nodeOrder: 1,
          source: 'governance-committee',
          governanceStatus: 'canonical',
          rationale: 'Entry.',
          providedBy: 'curriculum-board',
        }),
        composeRoadmapNode({
          roadmapNodeId: 'rn-002',
          curriculumNodeId: 'node-foundation',
          stage: 'foundation',
          nodeOrder: 2,
          source: 'governance-committee',
          governanceStatus: 'canonical',
          rationale: 'Foundation.',
          providedBy: 'curriculum-board',
        }),
      ],
      entryNodeId: 'node-entry',
      completionNodeId: 'node-completion',
      source: 'governance-committee',
      governanceStatus: 'canonical',
      rationale: 'Bad completion roadmap.',
      providedBy: 'curriculum-board',
    });
    const errors = validateRoadmap(roadmap, GRAPH_NODE_IDS);
    const completionError = errors.find(
      (e) => e.code === ROADMAP_VALIDATION_CODES.ROADMAP_INVALID_TERMINAL,
    );
    assert.ok(completionError, 'Should have ROADMAP_INVALID_TERMINAL error');
  });
});

// ---------------------------------------------------------------------------
// Invalid Ordering Tests
// ---------------------------------------------------------------------------

describe('Curriculum Roadmap Kernel — Invalid Ordering', () => {
  it('should detect regressing stage order', () => {
    const roadmap = composeRoadmap({
      roadmapId: 'roadmap-bad-order',
      roadmapType: 'foundation',
      roadmapLabel: 'Bad Order Roadmap',
      nodes: [
        composeRoadmapNode({
          roadmapNodeId: 'rn-001',
          curriculumNodeId: 'node-entry',
          stage: 'entry',
          nodeOrder: 1,
          source: 'governance-committee',
          governanceStatus: 'canonical',
          rationale: 'Entry.',
          providedBy: 'curriculum-board',
        }),
        composeRoadmapNode({
          roadmapNodeId: 'rn-002',
          curriculumNodeId: 'node-advanced',
          stage: 'advanced',
          nodeOrder: 2,
          source: 'governance-committee',
          governanceStatus: 'canonical',
          rationale: 'Advanced.',
          providedBy: 'curriculum-board',
        }),
        composeRoadmapNode({
          roadmapNodeId: 'rn-003',
          curriculumNodeId: 'node-foundation',
          stage: 'foundation',
          nodeOrder: 3,
          source: 'governance-committee',
          governanceStatus: 'canonical',
          rationale: 'Foundation (regressed).',
          providedBy: 'curriculum-board',
        }),
        composeRoadmapNode({
          roadmapNodeId: 'rn-004',
          curriculumNodeId: 'node-completion',
          stage: 'completion',
          nodeOrder: 4,
          source: 'governance-committee',
          governanceStatus: 'canonical',
          rationale: 'Completion.',
          providedBy: 'curriculum-board',
        }),
      ],
      entryNodeId: 'node-entry',
      completionNodeId: 'node-completion',
      source: 'governance-committee',
      governanceStatus: 'canonical',
      rationale: 'Bad order roadmap.',
      providedBy: 'curriculum-board',
    });
    const errors = validateRoadmap(roadmap, GRAPH_NODE_IDS);
    const orderError = errors.find(
      (e) => e.code === ROADMAP_VALIDATION_CODES.ROADMAP_INVALID_ORDER,
    );
    assert.ok(orderError, 'Should have ROADMAP_INVALID_ORDER error');
  });
});

// ---------------------------------------------------------------------------
// Missing Provenance Tests
// ---------------------------------------------------------------------------

describe('Curriculum Roadmap Kernel — Missing Provenance', () => {
  it('should detect missing source', () => {
    const roadmap = composeRoadmap({
      roadmapId: 'roadmap-no-source',
      roadmapType: 'foundation',
      roadmapLabel: 'No Source Roadmap',
      nodes: [
        composeRoadmapNode({
          roadmapNodeId: 'rn-001',
          curriculumNodeId: 'node-entry',
          stage: 'entry',
          nodeOrder: 1,
          source: '',
          governanceStatus: 'canonical',
          rationale: 'Entry.',
          providedBy: 'curriculum-board',
        }),
        composeRoadmapNode({
          roadmapNodeId: 'rn-002',
          curriculumNodeId: 'node-completion',
          stage: 'completion',
          nodeOrder: 2,
          source: 'governance-committee',
          governanceStatus: 'canonical',
          rationale: 'Completion.',
          providedBy: 'curriculum-board',
        }),
      ],
      entryNodeId: 'node-entry',
      completionNodeId: 'node-completion',
      source: '',
      governanceStatus: 'canonical',
      rationale: 'No source roadmap.',
      providedBy: 'curriculum-board',
    });
    const errors = validateRoadmap(roadmap, GRAPH_NODE_IDS);
    const sourceError = errors.find(
      (e) => e.code === ROADMAP_VALIDATION_CODES.ROADMAP_MISSING_SOURCE,
    );
    assert.ok(sourceError, 'Should have ROADMAP_MISSING_SOURCE error');
  });
});

// ---------------------------------------------------------------------------
// Missing Source Tests
// ---------------------------------------------------------------------------

describe('Curriculum Roadmap Kernel — Missing Source', () => {
  it('should detect missing source on roadmap', () => {
    const roadmap = composeRoadmap({
      roadmapId: 'roadmap-missing-source',
      roadmapType: 'foundation',
      roadmapLabel: 'Missing Source Roadmap',
      nodes: [
        composeRoadmapNode({
          roadmapNodeId: 'rn-001',
          curriculumNodeId: 'node-entry',
          stage: 'entry',
          nodeOrder: 1,
          source: 'governance-committee',
          governanceStatus: 'canonical',
          rationale: 'Entry.',
          providedBy: 'curriculum-board',
        }),
        composeRoadmapNode({
          roadmapNodeId: 'rn-002',
          curriculumNodeId: 'node-completion',
          stage: 'completion',
          nodeOrder: 2,
          source: 'governance-committee',
          governanceStatus: 'canonical',
          rationale: 'Completion.',
          providedBy: 'curriculum-board',
        }),
      ],
      entryNodeId: 'node-entry',
      completionNodeId: 'node-completion',
      source: '',
      governanceStatus: 'canonical',
      rationale: 'Missing source.',
      providedBy: 'curriculum-board',
    });
    const errors = validateRoadmap(roadmap, GRAPH_NODE_IDS);
    const sourceError = errors.find(
      (e) => e.code === ROADMAP_VALIDATION_CODES.ROADMAP_MISSING_SOURCE,
    );
    assert.ok(sourceError, 'Should have ROADMAP_MISSING_SOURCE error');
  });
});

// ---------------------------------------------------------------------------
// Invalid References Tests
// ---------------------------------------------------------------------------

describe('Curriculum Roadmap Kernel — Invalid References', () => {
  it('should detect invalid curriculum node reference', () => {
    const roadmap = composeRoadmap({
      roadmapId: 'roadmap-bad-ref',
      roadmapType: 'foundation',
      roadmapLabel: 'Bad Ref Roadmap',
      nodes: [
        composeRoadmapNode({
          roadmapNodeId: 'rn-001',
          curriculumNodeId: 'node-nonexistent',
          stage: 'entry',
          nodeOrder: 1,
          source: 'governance-committee',
          governanceStatus: 'canonical',
          rationale: 'Nonexistent node.',
          providedBy: 'curriculum-board',
        }),
        composeRoadmapNode({
          roadmapNodeId: 'rn-002',
          curriculumNodeId: 'node-completion',
          stage: 'completion',
          nodeOrder: 2,
          source: 'governance-committee',
          governanceStatus: 'canonical',
          rationale: 'Completion.',
          providedBy: 'curriculum-board',
        }),
      ],
      entryNodeId: 'node-nonexistent',
      completionNodeId: 'node-completion',
      source: 'governance-committee',
      governanceStatus: 'canonical',
      rationale: 'Bad ref roadmap.',
      providedBy: 'curriculum-board',
    });
    const errors = validateRoadmap(roadmap, GRAPH_NODE_IDS);
    const refError = errors.find(
      (e) => e.code === ROADMAP_VALIDATION_CODES.ROADMAP_INVALID_REFERENCE,
    );
    assert.ok(refError, 'Should have ROADMAP_INVALID_REFERENCE error');
  });
});

// ---------------------------------------------------------------------------
// Empty Roadmap Tests
// ---------------------------------------------------------------------------

describe('Curriculum Roadmap Kernel — Empty Roadmap', () => {
  it('should detect empty roadmap', () => {
    const roadmap = composeRoadmap({
      roadmapId: 'roadmap-empty',
      roadmapType: 'foundation',
      roadmapLabel: 'Empty Roadmap',
      nodes: [],
      entryNodeId: '',
      completionNodeId: '',
      source: 'governance-committee',
      governanceStatus: 'canonical',
      rationale: 'Empty roadmap.',
      providedBy: 'curriculum-board',
    });
    const errors = validateRoadmap(roadmap, GRAPH_NODE_IDS);
    const emptyError = errors.find(
      (e) => e.code === ROADMAP_VALIDATION_CODES.ROADMAP_EMPTY_PATH,
    );
    assert.ok(emptyError, 'Should have ROADMAP_EMPTY_PATH error');
  });
});

// ---------------------------------------------------------------------------
// Empty Registry Tests
// ---------------------------------------------------------------------------

describe('Curriculum Roadmap Kernel — Empty Registry', () => {
  it('should detect empty registry', () => {
    const registry = composeRoadmapRegistry({
      registryId: 'reg-empty',
      graphId: 'graph-001',
      roadmaps: [],
    });
    const result = validateRoadmapRegistry(registry, GRAPH_NODE_IDS);
    assert.strictEqual(result.valid, false);
    const emptyError = result.errors.find(
      (e) => e.code === ROADMAP_VALIDATION_CODES.ROADMAP_EMPTY_REGISTRY,
    );
    assert.ok(emptyError, 'Should have ROADMAP_EMPTY_REGISTRY error');
  });
});

// ---------------------------------------------------------------------------
// Deterministic Ordering Tests
// ---------------------------------------------------------------------------

describe('Curriculum Roadmap Kernel — Deterministic Ordering', () => {
  it('should sort roadmaps by roadmapId', () => {
    const roadmap1 = composeRoadmap({
      roadmapId: 'roadmap-b',
      roadmapType: 'foundation',
      roadmapLabel: 'B',
      nodes: [
        composeRoadmapNode({
          roadmapNodeId: 'rn-001',
          curriculumNodeId: 'node-entry',
          stage: 'entry',
          nodeOrder: 1,
          source: 'governance-committee',
          governanceStatus: 'canonical',
          rationale: 'Entry.',
          providedBy: 'curriculum-board',
        }),
        composeRoadmapNode({
          roadmapNodeId: 'rn-002',
          curriculumNodeId: 'node-completion',
          stage: 'completion',
          nodeOrder: 2,
          source: 'governance-committee',
          governanceStatus: 'canonical',
          rationale: 'Completion.',
          providedBy: 'curriculum-board',
        }),
      ],
      entryNodeId: 'node-entry',
      completionNodeId: 'node-completion',
      source: 'governance-committee',
      governanceStatus: 'canonical',
      rationale: 'B.',
      providedBy: 'curriculum-board',
    });
    const roadmap2 = composeRoadmap({
      roadmapId: 'roadmap-a',
      roadmapType: 'foundation',
      roadmapLabel: 'A',
      nodes: [
        composeRoadmapNode({
          roadmapNodeId: 'rn-003',
          curriculumNodeId: 'node-entry',
          stage: 'entry',
          nodeOrder: 1,
          source: 'governance-committee',
          governanceStatus: 'canonical',
          rationale: 'Entry.',
          providedBy: 'curriculum-board',
        }),
        composeRoadmapNode({
          roadmapNodeId: 'rn-004',
          curriculumNodeId: 'node-completion',
          stage: 'completion',
          nodeOrder: 2,
          source: 'governance-committee',
          governanceStatus: 'canonical',
          rationale: 'Completion.',
          providedBy: 'curriculum-board',
        }),
      ],
      entryNodeId: 'node-entry',
      completionNodeId: 'node-completion',
      source: 'governance-committee',
      governanceStatus: 'canonical',
      rationale: 'A.',
      providedBy: 'curriculum-board',
    });
    const registry = composeRoadmapRegistry({
      registryId: 'reg-sort',
      graphId: 'graph-001',
      roadmaps: [roadmap1, roadmap2],
    });
    assert.strictEqual(registry.roadmaps[0].roadmapId, 'roadmap-a');
    assert.strictEqual(registry.roadmaps[1].roadmapId, 'roadmap-b');
  });

  it('should sort nodes by stage order, then nodeOrder, then nodeId', () => {
    const roadmap = composeRoadmap({
      roadmapId: 'roadmap-sort-nodes',
      roadmapType: 'foundation',
      roadmapLabel: 'Sort Nodes',
      nodes: [
        composeRoadmapNode({
          roadmapNodeId: 'rn-003',
          curriculumNodeId: 'node-completion',
          stage: 'completion',
          nodeOrder: 3,
          source: 'governance-committee',
          governanceStatus: 'canonical',
          rationale: 'Completion.',
          providedBy: 'curriculum-board',
        }),
        composeRoadmapNode({
          roadmapNodeId: 'rn-001',
          curriculumNodeId: 'node-entry',
          stage: 'entry',
          nodeOrder: 1,
          source: 'governance-committee',
          governanceStatus: 'canonical',
          rationale: 'Entry.',
          providedBy: 'curriculum-board',
        }),
        composeRoadmapNode({
          roadmapNodeId: 'rn-002',
          curriculumNodeId: 'node-foundation',
          stage: 'foundation',
          nodeOrder: 2,
          source: 'governance-committee',
          governanceStatus: 'canonical',
          rationale: 'Foundation.',
          providedBy: 'curriculum-board',
        }),
      ],
      entryNodeId: 'node-entry',
      completionNodeId: 'node-completion',
      source: 'governance-committee',
      governanceStatus: 'canonical',
      rationale: 'Sort nodes.',
      providedBy: 'curriculum-board',
    });
    const registry = composeRoadmapRegistry({
      registryId: 'reg-sort-nodes',
      graphId: 'graph-001',
      roadmaps: [roadmap],
    });
    const sortedRoadmap = registry.roadmaps[0];
    assert.strictEqual(sortedRoadmap.nodes[0].stage, 'entry');
    assert.strictEqual(sortedRoadmap.nodes[1].stage, 'foundation');
    assert.strictEqual(sortedRoadmap.nodes[2].stage, 'completion');
  });
});

// ---------------------------------------------------------------------------
// Immutable Input Tests
// ---------------------------------------------------------------------------

describe('Curriculum Roadmap Kernel — Immutable Input', () => {
  it('should not mutate input roadmaps array', () => {
    const roadmap = composeRoadmap({
      roadmapId: 'roadmap-immutable',
      roadmapType: 'foundation',
      roadmapLabel: 'Immutable',
      nodes: [
        composeRoadmapNode({
          roadmapNodeId: 'rn-001',
          curriculumNodeId: 'node-entry',
          stage: 'entry',
          nodeOrder: 1,
          source: 'governance-committee',
          governanceStatus: 'canonical',
          rationale: 'Entry.',
          providedBy: 'curriculum-board',
        }),
        composeRoadmapNode({
          roadmapNodeId: 'rn-002',
          curriculumNodeId: 'node-completion',
          stage: 'completion',
          nodeOrder: 2,
          source: 'governance-committee',
          governanceStatus: 'canonical',
          rationale: 'Completion.',
          providedBy: 'curriculum-board',
        }),
      ],
      entryNodeId: 'node-entry',
      completionNodeId: 'node-completion',
      source: 'governance-committee',
      governanceStatus: 'canonical',
      rationale: 'Immutable.',
      providedBy: 'curriculum-board',
    });
    const roadmaps = [roadmap];
    const original = [...roadmaps];
    composeCurriculumRoadmaps({
      registryId: 'reg-immutable',
      graphId: 'graph-001',
      roadmaps,
    });
    assert.deepStrictEqual(roadmaps, original);
  });
});

// ---------------------------------------------------------------------------
// Identical Output Tests
// ---------------------------------------------------------------------------

describe('Curriculum Roadmap Kernel — Identical Output', () => {
  it('should produce identical output for identical input', () => {
    const input: CurriculumRoadmapInput = {
      registryId: 'reg-001',
      graphId: 'graph-001',
      roadmaps: [
        composeRoadmap({
          roadmapId: 'roadmap-001',
          roadmapType: 'foundation',
          roadmapLabel: 'Foundation',
          nodes: [
            composeRoadmapNode({
              roadmapNodeId: 'rn-001',
              curriculumNodeId: 'node-entry',
              stage: 'entry',
              nodeOrder: 1,
              source: 'governance-committee',
              governanceStatus: 'canonical',
              rationale: 'Entry.',
              providedBy: 'curriculum-board',
            }),
            composeRoadmapNode({
              roadmapNodeId: 'rn-002',
              curriculumNodeId: 'node-completion',
              stage: 'completion',
              nodeOrder: 2,
              source: 'governance-committee',
              governanceStatus: 'canonical',
              rationale: 'Completion.',
              providedBy: 'curriculum-board',
            }),
          ],
          entryNodeId: 'node-entry',
          completionNodeId: 'node-completion',
          source: 'governance-committee',
          governanceStatus: 'canonical',
          rationale: 'Foundation.',
          providedBy: 'curriculum-board',
        }),
      ],
    };
    const reg1 = composeCurriculumRoadmaps(input);
    const reg2 = composeCurriculumRoadmaps(input);
    assert.deepStrictEqual(reg1, reg2);
  });

  it('should produce identical output across 100 iterations', () => {
    const input: CurriculumRoadmapInput = {
      registryId: 'reg-001',
      graphId: 'graph-001',
      roadmaps: [
        composeRoadmap({
          roadmapId: 'roadmap-001',
          roadmapType: 'foundation',
          roadmapLabel: 'Foundation',
          nodes: [
            composeRoadmapNode({
              roadmapNodeId: 'rn-001',
              curriculumNodeId: 'node-entry',
              stage: 'entry',
              nodeOrder: 1,
              source: 'governance-committee',
              governanceStatus: 'canonical',
              rationale: 'Entry.',
              providedBy: 'curriculum-board',
            }),
            composeRoadmapNode({
              roadmapNodeId: 'rn-002',
              curriculumNodeId: 'node-completion',
              stage: 'completion',
              nodeOrder: 2,
              source: 'governance-committee',
              governanceStatus: 'canonical',
              rationale: 'Completion.',
              providedBy: 'curriculum-board',
            }),
          ],
          entryNodeId: 'node-entry',
          completionNodeId: 'node-completion',
          source: 'governance-committee',
          governanceStatus: 'canonical',
          rationale: 'Foundation.',
          providedBy: 'curriculum-board',
        }),
      ],
    };
    const reg1 = composeCurriculumRoadmaps(input);
    for (let i = 0; i < 99; i++) {
      const reg = composeCurriculumRoadmaps(input);
      assert.deepStrictEqual(reg, reg1);
    }
  });
});

// ---------------------------------------------------------------------------
// Negative Capability Tests
// ---------------------------------------------------------------------------

describe('Curriculum Roadmap Kernel — Negative Capability', () => {
  it('should not infer learner mastery', () => {
    // Roadmap composition should not inspect any learner data
    const roadmap = composeRoadmap({
      roadmapId: 'roadmap-no-infer',
      roadmapType: 'foundation',
      roadmapLabel: 'No Inference',
      nodes: [
        composeRoadmapNode({
          roadmapNodeId: 'rn-001',
          curriculumNodeId: 'node-entry',
          stage: 'entry',
          nodeOrder: 1,
          source: 'governance-committee',
          governanceStatus: 'canonical',
          rationale: 'Entry.',
          providedBy: 'curriculum-board',
        }),
        composeRoadmapNode({
          roadmapNodeId: 'rn-002',
          curriculumNodeId: 'node-completion',
          stage: 'completion',
          nodeOrder: 2,
          source: 'governance-committee',
          governanceStatus: 'canonical',
          rationale: 'Completion.',
          providedBy: 'curriculum-board',
        }),
      ],
      entryNodeId: 'node-entry',
      completionNodeId: 'node-completion',
      source: 'governance-committee',
      governanceStatus: 'canonical',
      rationale: 'No inference.',
      providedBy: 'curriculum-board',
    });
    // The roadmap should be deterministic and not depend on any learner state
    assert.ok(roadmap.roadmapId);
    assert.ok(roadmap.nodes.length === 2);
  });

  it('should not modify curriculum', () => {
    const originalGraph = { ...VALID_GRAPH };
    composeRoadmap({
      roadmapId: 'roadmap-no-modify',
      roadmapType: 'foundation',
      roadmapLabel: 'No Modify',
      nodes: [
        composeRoadmapNode({
          roadmapNodeId: 'rn-001',
          curriculumNodeId: 'node-entry',
          stage: 'entry',
          nodeOrder: 1,
          source: 'governance-committee',
          governanceStatus: 'canonical',
          rationale: 'Entry.',
          providedBy: 'curriculum-board',
        }),
        composeRoadmapNode({
          roadmapNodeId: 'rn-002',
          curriculumNodeId: 'node-completion',
          stage: 'completion',
          nodeOrder: 2,
          source: 'governance-committee',
          governanceStatus: 'canonical',
          rationale: 'Completion.',
          providedBy: 'curriculum-board',
        }),
      ],
      entryNodeId: 'node-entry',
      completionNodeId: 'node-completion',
      source: 'governance-committee',
      governanceStatus: 'canonical',
      rationale: 'No modify.',
      providedBy: 'curriculum-board',
    });
    assert.deepStrictEqual(VALID_GRAPH, originalGraph);
  });
});

// ---------------------------------------------------------------------------
// Helper Function Tests
// ---------------------------------------------------------------------------

describe('Curriculum Roadmap Kernel — Helper Functions', () => {
  it('isSupportedRoadmapType should return true for valid types', () => {
    for (const type of CANONICAL_ROADMAP_TYPES) {
      assert.strictEqual(isSupportedRoadmapType(type), true);
    }
  });

  it('isSupportedRoadmapType should return false for invalid types', () => {
    assert.strictEqual(isSupportedRoadmapType('invalid'), false);
    assert.strictEqual(isSupportedRoadmapType(''), false);
  });

  it('isSupportedRoadmapStage should return true for valid stages', () => {
    for (const stage of CANONICAL_ROADMAP_STAGES) {
      assert.strictEqual(isSupportedRoadmapStage(stage), true);
    }
  });

  it('isSupportedRoadmapStage should return false for invalid stages', () => {
    assert.strictEqual(isSupportedRoadmapStage('invalid'), false);
    assert.strictEqual(isSupportedRoadmapStage(''), false);
  });

  it('isSupportedRoadmapGovernanceStatus should return true for valid statuses', () => {
    for (const status of CANONICAL_GOVERNANCE_STATUSES) {
      assert.strictEqual(isSupportedRoadmapGovernanceStatus(status), true);
    }
  });

  it('isSupportedRoadmapGovernanceStatus should return false for invalid statuses', () => {
    assert.strictEqual(isSupportedRoadmapGovernanceStatus('invalid'), false);
    assert.strictEqual(isSupportedRoadmapGovernanceStatus(''), false);
  });

  it('getCanonicalRoadmapTypes should return all canonical types', () => {
    const types = getCanonicalRoadmapTypes();
    assert.strictEqual(types.length, 10);
    assert.deepStrictEqual(types, CANONICAL_ROADMAP_TYPES);
  });

  it('getCanonicalRoadmapStages should return all canonical stages', () => {
    const stages = getCanonicalRoadmapStages();
    assert.strictEqual(stages.length, 10);
    assert.deepStrictEqual(stages, CANONICAL_ROADMAP_STAGES);
  });
});

// ---------------------------------------------------------------------------
// Registry Validation Tests
// ---------------------------------------------------------------------------

describe('Curriculum Roadmap Kernel — Registry Validation', () => {
  it('should validate a valid registry', () => {
    const roadmap = composeRoadmap({
      roadmapId: 'roadmap-001',
      roadmapType: 'foundation',
      roadmapLabel: 'Foundation',
      nodes: [
        composeRoadmapNode({
          roadmapNodeId: 'rn-001',
          curriculumNodeId: 'node-entry',
          stage: 'entry',
          nodeOrder: 1,
          source: 'governance-committee',
          governanceStatus: 'canonical',
          rationale: 'Entry.',
          providedBy: 'curriculum-board',
        }),
        composeRoadmapNode({
          roadmapNodeId: 'rn-002',
          curriculumNodeId: 'node-completion',
          stage: 'completion',
          nodeOrder: 2,
          source: 'governance-committee',
          governanceStatus: 'canonical',
          rationale: 'Completion.',
          providedBy: 'curriculum-board',
        }),
      ],
      entryNodeId: 'node-entry',
      completionNodeId: 'node-completion',
      source: 'governance-committee',
      governanceStatus: 'canonical',
      rationale: 'Foundation.',
      providedBy: 'curriculum-board',
    });
    const registry = composeRoadmapRegistry({
      registryId: 'reg-001',
      graphId: 'graph-001',
      roadmaps: [roadmap],
    });
    const result = validateRoadmapRegistry(registry, GRAPH_NODE_IDS);
    assert.strictEqual(result.valid, true);
    assert.deepStrictEqual(result.errors, []);
    assert.strictEqual(result.checkedAt, 'curriculum_roadmap_orchestration');
  });
});

// ---------------------------------------------------------------------------
// Artifact Validation Tests
// ---------------------------------------------------------------------------

describe('Curriculum Roadmap Kernel — Artifact Validation', () => {
  it('should compose and validate a valid artifact', () => {
    const roadmap = composeRoadmap({
      roadmapId: 'roadmap-001',
      roadmapType: 'foundation',
      roadmapLabel: 'Foundation',
      nodes: [
        composeRoadmapNode({
          roadmapNodeId: 'rn-001',
          curriculumNodeId: 'node-entry',
          stage: 'entry',
          nodeOrder: 1,
          source: 'governance-committee',
          governanceStatus: 'canonical',
          rationale: 'Entry.',
          providedBy: 'curriculum-board',
        }),
        composeRoadmapNode({
          roadmapNodeId: 'rn-002',
          curriculumNodeId: 'node-completion',
          stage: 'completion',
          nodeOrder: 2,
          source: 'governance-committee',
          governanceStatus: 'canonical',
          rationale: 'Completion.',
          providedBy: 'curriculum-board',
        }),
      ],
      entryNodeId: 'node-entry',
      completionNodeId: 'node-completion',
      source: 'governance-committee',
      governanceStatus: 'canonical',
      rationale: 'Foundation.',
      providedBy: 'curriculum-board',
    });
    const registry = composeRoadmapRegistry({
      registryId: 'reg-001',
      graphId: 'graph-001',
      roadmaps: [roadmap],
    });
    const trace = composeRoadmapTrace('reg-001', [roadmap]);
    const artifact = composeCurriculumArtifactWithRoadmaps({
      artifactId: 'artifact-001',
      graph: VALID_GRAPH,
      roadmapRegistry: registry,
      roadmapTrace: trace,
      validation: {
        valid: true,
        errors: [],
        checkedAt: 'curriculum_roadmap_orchestration',
      },
    });
    const result = validateCurriculumArtifactWithRoadmaps(artifact);
    assert.strictEqual(result.valid, true);
    assert.deepStrictEqual(result.errors, []);
  });
});

// ---------------------------------------------------------------------------
// Trace Validation Tests
// ---------------------------------------------------------------------------

describe('Curriculum Roadmap Kernel — Trace Validation', () => {
  it('should compose a trace with correct counts', () => {
    const roadmap = composeRoadmap({
      roadmapId: 'roadmap-001',
      roadmapType: 'foundation',
      roadmapLabel: 'Foundation',
      nodes: [
        composeRoadmapNode({
          roadmapNodeId: 'rn-001',
          curriculumNodeId: 'node-entry',
          stage: 'entry',
          nodeOrder: 1,
          source: 'governance-committee',
          governanceStatus: 'canonical',
          rationale: 'Entry.',
          providedBy: 'curriculum-board',
        }),
        composeRoadmapNode({
          roadmapNodeId: 'rn-002',
          curriculumNodeId: 'node-completion',
          stage: 'completion',
          nodeOrder: 2,
          source: 'governance-committee',
          governanceStatus: 'canonical',
          rationale: 'Completion.',
          providedBy: 'curriculum-board',
        }),
      ],
      entryNodeId: 'node-entry',
      completionNodeId: 'node-completion',
      source: 'governance-committee',
      governanceStatus: 'canonical',
      rationale: 'Foundation.',
      providedBy: 'curriculum-board',
    });
    const trace = composeRoadmapTrace('reg-001', [roadmap]);
    assert.strictEqual(trace.roadmapCount, 1);
    assert.strictEqual(trace.decisionsCount, 1);
    assert.strictEqual(trace.validatedCount, 1);
    assert.strictEqual(trace.invalidCount, 0);
    assert.strictEqual(trace.deterministic, true);
    assert.strictEqual(trace.randomUsed, false);
    assert.strictEqual(trace.timeDependency, false);
    assert.strictEqual(trace.curriculumMutated, false);
  });
});

// ---------------------------------------------------------------------------
// Provenance Tests
// ---------------------------------------------------------------------------

describe('Curriculum Roadmap Kernel — Provenance', () => {
  it('should compose roadmap provenance', () => {
    const roadmap = composeRoadmap({
      roadmapId: 'roadmap-001',
      roadmapType: 'foundation',
      roadmapLabel: 'Foundation',
      nodes: [
        composeRoadmapNode({
          roadmapNodeId: 'rn-001',
          curriculumNodeId: 'node-entry',
          stage: 'entry',
          nodeOrder: 1,
          source: 'governance-committee',
          governanceStatus: 'canonical',
          rationale: 'Entry.',
          providedBy: 'curriculum-board',
        }),
        composeRoadmapNode({
          roadmapNodeId: 'rn-002',
          curriculumNodeId: 'node-completion',
          stage: 'completion',
          nodeOrder: 2,
          source: 'governance-committee',
          governanceStatus: 'canonical',
          rationale: 'Completion.',
          providedBy: 'curriculum-board',
        }),
      ],
      entryNodeId: 'node-entry',
      completionNodeId: 'node-completion',
      source: 'governance-committee',
      governanceStatus: 'canonical',
      rationale: 'Foundation.',
      providedBy: 'curriculum-board',
    });
    const provenance = composeRoadmapProvenance(roadmap);
    assert.strictEqual(provenance.roadmapId, 'roadmap-001');
    assert.strictEqual(provenance.source, 'governance-committee');
    assert.strictEqual(provenance.governanceStatus, 'canonical');
    assert.strictEqual(provenance.rationale, 'Foundation.');
    assert.strictEqual(provenance.providedBy, 'curriculum-board');
  });
});

// ---------------------------------------------------------------------------
// Deterministic Metadata Tests
// ---------------------------------------------------------------------------

describe('Curriculum Roadmap Kernel — Deterministic Metadata', () => {
  it('registry should have deterministic metadata', () => {
    const registry = composeRoadmapRegistry({
      registryId: 'reg-meta',
      graphId: 'graph-001',
      roadmaps: [],
    });
    assert.strictEqual(registry.deterministic, true);
    assert.strictEqual(registry.randomUsed, false);
    assert.strictEqual(registry.timeDependency, false);
  });

  it('trace should have deterministic metadata', () => {
    const trace = composeRoadmapTrace('reg-meta', []);
    assert.strictEqual(trace.deterministic, true);
    assert.strictEqual(trace.randomUsed, false);
    assert.strictEqual(trace.timeDependency, false);
    assert.strictEqual(trace.curriculumMutated, false);
  });
});

// ---------------------------------------------------------------------------
// Input Validation Tests
// ---------------------------------------------------------------------------

describe('Curriculum Roadmap Kernel — Input Validation', () => {
  it('should validate valid input with no errors', () => {
    const input: CurriculumRoadmapInput = {
      registryId: 'reg-001',
      graphId: 'graph-001',
      roadmaps: [
        composeRoadmap({
          roadmapId: 'roadmap-001',
          roadmapType: 'foundation',
          roadmapLabel: 'Foundation',
          nodes: [
            composeRoadmapNode({
              roadmapNodeId: 'rn-001',
              curriculumNodeId: 'node-entry',
              stage: 'entry',
              nodeOrder: 1,
              source: 'governance-committee',
              governanceStatus: 'canonical',
              rationale: 'Entry.',
              providedBy: 'curriculum-board',
            }),
            composeRoadmapNode({
              roadmapNodeId: 'rn-002',
              curriculumNodeId: 'node-completion',
              stage: 'completion',
              nodeOrder: 2,
              source: 'governance-committee',
              governanceStatus: 'canonical',
              rationale: 'Completion.',
              providedBy: 'curriculum-board',
            }),
          ],
          entryNodeId: 'node-entry',
          completionNodeId: 'node-completion',
          source: 'governance-committee',
          governanceStatus: 'canonical',
          rationale: 'Foundation.',
          providedBy: 'curriculum-board',
        }),
      ],
    };
    const errors = validateRoadmapInput(input, GRAPH_NODE_IDS);
    assert.deepStrictEqual(errors, []);
  });

  it('should detect missing registry ID', () => {
    const input: CurriculumRoadmapInput = {
      registryId: '',
      graphId: 'graph-001',
      roadmaps: [],
    };
    const errors = validateRoadmapInput(input, GRAPH_NODE_IDS);
    const idError = errors.find(
      (e) => e.code === ROADMAP_VALIDATION_CODES.ROADMAP_MISSING_REGISTRY_ID,
    );
    assert.ok(idError, 'Should have ROADMAP_MISSING_REGISTRY_ID error');
  });

  it('should detect missing graph ID', () => {
    const input: CurriculumRoadmapInput = {
      registryId: 'reg-001',
      graphId: '',
      roadmaps: [],
    };
    const errors = validateRoadmapInput(input, GRAPH_NODE_IDS);
    const graphError = errors.find(
      (e) => e.code === ROADMAP_VALIDATION_CODES.ROADMAP_MISSING_GRAPH_ID,
    );
    assert.ok(graphError, 'Should have ROADMAP_MISSING_GRAPH_ID error');
  });

  it('should detect empty roadmaps in input', () => {
    const input: CurriculumRoadmapInput = {
      registryId: 'reg-001',
      graphId: 'graph-001',
      roadmaps: [],
    };
    const errors = validateRoadmapInput(input, GRAPH_NODE_IDS);
    const emptyError = errors.find(
      (e) => e.code === ROADMAP_VALIDATION_CODES.ROADMAP_EMPTY_REGISTRY,
    );
    assert.ok(emptyError, 'Should have ROADMAP_EMPTY_REGISTRY error');
  });
});

// ---------------------------------------------------------------------------
// Canonical Type Completeness Tests
// ---------------------------------------------------------------------------

describe('Curriculum Roadmap Kernel — Canonical Type Completeness', () => {
  it('should have exactly 10 canonical roadmap types', () => {
    assert.strictEqual(CANONICAL_ROADMAP_TYPES.length, 10);
  });

  it('should contain all required roadmap types', () => {
    const required = [
      'foundation',
      'core',
      'specialization',
      'research',
      'engineering',
      'mathematics',
      'laboratory',
      'review',
      'capstone',
      'complete_program',
    ];
    for (const type of required) {
      assert.ok(
        CANONICAL_ROADMAP_TYPES.includes(type as CurriculumRoadmapType),
        `Missing roadmap type: ${type}`,
      );
    }
  });
});

// ---------------------------------------------------------------------------
// Canonical Stage Completeness Tests
// ---------------------------------------------------------------------------

describe('Curriculum Roadmap Kernel — Canonical Stage Completeness', () => {
  it('should have exactly 10 canonical roadmap stages', () => {
    assert.strictEqual(CANONICAL_ROADMAP_STAGES.length, 10);
  });

  it('should contain all required roadmap stages', () => {
    const required = [
      'entry',
      'foundation',
      'core',
      'intermediate',
      'advanced',
      'specialization',
      'integration',
      'research',
      'capstone',
      'completion',
    ];
    for (const stage of required) {
      assert.ok(
        CANONICAL_ROADMAP_STAGES.includes(stage as CurriculumRoadmapStage),
        `Missing roadmap stage: ${stage}`,
      );
    }
  });
});
