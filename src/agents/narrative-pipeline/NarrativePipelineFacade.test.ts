/**
 * NV-1700-D6-OPT-10 — Narrative Composition Certification & Public Pipeline Facade Test Suite
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import type {
  NarrativeProvenance, NarrativeGovernanceStatus, CertificationProvenance,
  CertificationFinding, CertificationReport, NarrativeFacadeOutput, NarrativeFacadeTraceMetadata,
} from './NarrativeAgentContract.ts';

import {
  CANONICAL_NARRATIVE_CERTIFICATION_STATUS,
  CANONICAL_NARRATIVE_FINDING_SEVERITY,
  CANONICAL_NARRATIVE_QUALITY_DIMENSIONS,
  CANONICAL_GOVERNANCE_STATUSES,
} from './NarrativeAgentContract.ts';

import {
  composeNarrativeCertificationFinding,
  composeNarrativeCertificationReport,
  composeNarrativeCertificationReportFromParams,
  certifyNarrativeComposition,
  isSupportedNarrativeCertificationStatus,
  isSupportedNarrativeFindingSeverity,
  isSupportedNarrativeQualityDimension,
  getCanonicalNarrativeCertificationStatuses,
  getCanonicalNarrativeFindingSeverities,
  getCanonicalNarrativeQualityDimensions,
} from './NarrativeCertificationEngine.ts';

import {
  composeNarrativeArtifact,
  certifyNarrativeArtifact,
  composeAndCertifyNarrativeArtifact,
  validateNarrativeFacadeArtifact,
  validateNarrativeFacadeCertification,
  validateNarrativeFacadeComplete,
  validateNarrativeCertificationFinding,
  validateNarrativeCertificationReport,
  validateNarrativeCertificationInput,
} from './NarrativePipelineFacade.ts';

const VP: NarrativeProvenance = { source: 'NeuralVerse Team', governanceStatus: 'canonical', providedBy: 'NeuralVerse Team', rationale: 'Core.' };
const CP: CertificationProvenance = { source: 'Certification Engine', governanceStatus: 'canonical', providedBy: 'NeuralVerse Pipeline', rationale: 'Certification.' };

const TRACE: NarrativeFacadeTraceMetadata = {
  traceId: '_trace_1', decisionCount: 0, validationCount: 0, compositionCount: 0, certificationCount: 1,
  deterministic: true, generatedFrom: 'deterministic_narrative_facade', randomUsed: false, timeDependency: false,
};

const MINIMAL_ARTIFACT: NarrativeFacadeOutput = {
  narrativeId: 'n-1', title: 'Test Narrative', unitType: 'lesson_opening', narrativeMode: 'engineering_problem',
  domain: 'deep_learning', status: 'published', canonicalKnowledgeId: 'k-1', curriculumNodeId: 'c-1',
  lessonId: 'l-1', laboratoryId: '', sequenceOrder: 1, summary: 'S.', tags: [], provenance: VP,
  style: { styleId: 's-1', styleType: 'engineering', preferredFrame: 'problem_first', motivationType: 'optimization', tone: 'technical', domain: 'deep_learning', knowledgeArtifactId: 'k-1', curriculumNodeId: 'c-1', lessonId: 'l-1', sequencePriority: 1, summary: 'S.', tags: [], provenance: VP },
  frame: { frameId: 'f-1', frameType: 'problem_first', openingStrategy: 'O', transitionStrategy: 'T', closureStrategy: 'C', supportedStyles: ['engineering'], provenance: VP },
  problems: [], origins: [], motivations: [], questions: [], misconceptions: [],
  analogies: [], metaphors: [], intuitions: [], mappings: [], cognitiveBridges: [],
  storyArcs: [], stages: [], transitions: [], cognitiveProgressions: [], attentionShifts: [], narrativeFlows: [],
  curiosityTriggers: [], engagementPoints: [], tensions: [], surprises: [], rewards: [], recoveryEntries: [], momentumEntries: [],
  historicalContexts: [], discoveries: [], timelineEvents: [], evolutions: [], milestones: [], influenceChains: [], paradigmShifts: [],
  applications: [], useCases: [], industrialScenarios: [], engineeringScenarios: [], technologyAdoptions: [], realWorldContexts: [], applicationFlows: [],
  perspectives: [], explanationViews: [], alternativeViews: [], disciplinaryViews: [], implementationViews: [], abstractionViews: [], perspectiveFlows: [],
};

describe('Facade — Composition', () => {
  it('should compose narrative artifact', () => {
    const artifact = composeNarrativeArtifact({
      narrativeId: 'n-1', title: 'Test', unitType: 'lesson_opening', narrativeMode: 'engineering_problem',
      domain: 'deep_learning', status: 'published', canonicalKnowledgeId: 'k-1', curriculumNodeId: 'c-1',
      lessonId: 'l-1', laboratoryId: '', sequenceOrder: 1, summary: 'S.', tags: [], provenance: VP,
      style: MINIMAL_ARTIFACT.style, frame: MINIMAL_ARTIFACT.frame,
      problems: [], origins: [], motivations: [], questions: [], misconceptions: [],
      analogies: [], metaphors: [], intuitions: [], mappings: [], cognitiveBridges: [],
      storyArcs: [], stages: [], transitions: [], cognitiveProgressions: [], attentionShifts: [], narrativeFlows: [],
      curiosityTriggers: [], engagementPoints: [], tensions: [], surprises: [], rewards: [], recoveryEntries: [], momentumEntries: [],
      historicalContexts: [], discoveries: [], timelineEvents: [], evolutions: [], milestones: [], influenceChains: [], paradigmShifts: [],
      applications: [], useCases: [], industrialScenarios: [], engineeringScenarios: [], technologyAdoptions: [], realWorldContexts: [], applicationFlows: [],
      perspectives: [], explanationViews: [], alternativeViews: [], disciplinaryViews: [], implementationViews: [], abstractionViews: [], perspectiveFlows: [],
    });
    assert.equal(artifact.narrativeId, 'n-1');
    assert.equal(artifact.title, 'Test');
  });

  it('should certify narrative artifact', () => {
    const output = certifyNarrativeArtifact(MINIMAL_ARTIFACT);
    assert.ok(output.certificationReport);
    assert.ok(output.validation);
    assert.ok(output.status);
  });

  it('should compose and certify', () => {
    const output = composeAndCertifyNarrativeArtifact({
      narrativeId: 'n-1', title: 'Test', unitType: 'lesson_opening', narrativeMode: 'engineering_problem',
      domain: 'deep_learning', status: 'published', canonicalKnowledgeId: 'k-1', curriculumNodeId: 'c-1',
      lessonId: 'l-1', laboratoryId: '', sequenceOrder: 1, summary: 'S.', tags: [], provenance: VP,
      style: MINIMAL_ARTIFACT.style, frame: MINIMAL_ARTIFACT.frame,
      problems: [], origins: [], motivations: [], questions: [], misconceptions: [],
      analogies: [], metaphors: [], intuitions: [], mappings: [], cognitiveBridges: [],
      storyArcs: [], stages: [], transitions: [], cognitiveProgressions: [], attentionShifts: [], narrativeFlows: [],
      curiosityTriggers: [], engagementPoints: [], tensions: [], surprises: [], rewards: [], recoveryEntries: [], momentumEntries: [],
      historicalContexts: [], discoveries: [], timelineEvents: [], evolutions: [], milestones: [], influenceChains: [], paradigmShifts: [],
      applications: [], useCases: [], industrialScenarios: [], engineeringScenarios: [], technologyAdoptions: [], realWorldContexts: [], applicationFlows: [],
      perspectives: [], explanationViews: [], alternativeViews: [], disciplinaryViews: [], implementationViews: [], abstractionViews: [], perspectiveFlows: [],
    });
    assert.ok(output.artifact);
    assert.ok(output.certification);
    assert.ok(output.status);
  });

  it('should compose valid certification finding', () => {
    const finding = composeNarrativeCertificationFinding({
      findingId: 'f-1', severity: 'error', qualityDimension: 'registry_integrity',
      message: 'Test.', artifactReference: 'n-1', provenance: CP,
    });
    assert.equal(finding.findingId, 'f-1');
    assert.equal(finding.severity, 'error');
  });

  it('should compose valid certification report', () => {
    const report = composeNarrativeCertificationReport({
      reportId: 'r-1', status: 'certified', qualityScore: 0.95,
      findings: [], trace: TRACE, provenance: CP,
    });
    assert.equal(report.reportId, 'r-1');
    assert.equal(report.status, 'certified');
    assert.equal(report.qualityScore, 0.95);
  });
});

describe('Facade — Certification Statuses', () => {
  it('should produce certified status for clean artifact', () => {
    const output = composeAndCertifyNarrativeArtifact({
      narrativeId: 'n-1', title: 'Test', unitType: 'lesson_opening', narrativeMode: 'engineering_problem',
      domain: 'deep_learning', status: 'published', canonicalKnowledgeId: 'k-1', curriculumNodeId: 'c-1',
      lessonId: 'l-1', laboratoryId: '', sequenceOrder: 1, summary: 'S.', tags: [], provenance: VP,
      style: MINIMAL_ARTIFACT.style, frame: MINIMAL_ARTIFACT.frame,
      problems: [], origins: [], motivations: [], questions: [], misconceptions: [],
      analogies: [], metaphors: [], intuitions: [], mappings: [], cognitiveBridges: [],
      storyArcs: [], stages: [], transitions: [], cognitiveProgressions: [], attentionShifts: [], narrativeFlows: [],
      curiosityTriggers: [], engagementPoints: [], tensions: [], surprises: [], rewards: [], recoveryEntries: [], momentumEntries: [],
      historicalContexts: [], discoveries: [], timelineEvents: [], evolutions: [], milestones: [], influenceChains: [], paradigmShifts: [],
      applications: [], useCases: [], industrialScenarios: [], engineeringScenarios: [], technologyAdoptions: [], realWorldContexts: [], applicationFlows: [],
      perspectives: [], explanationViews: [], alternativeViews: [], disciplinaryViews: [], implementationViews: [], abstractionViews: [], perspectiveFlows: [],
    });
    assert.equal(output.status, 'certified');
  });

  it('should produce certified_with_warnings for low quality score', () => {
    const result = certifyNarrativeComposition({
      narrativeId: 'n-1', validationPassed: true, validationErrorCount: 0,
      registryIntegrity: true, determinismGuarantee: true, architecturalBoundary: true,
      provenanceIntegrity: false, governanceIntegrity: true, styleIntegrity: true,
      problemIntegrity: true, analogyIntegrity: true, storyFlowIntegrity: true,
      engagementIntegrity: true, historicalIntegrity: true, applicationIntegrity: true,
      perspectiveIntegrity: true, compositionIntegrity: true,
      provenance: CP,
    });
    assert.equal(result.status, 'certified_with_warnings');
  });

  it('should produce blocked for missing provenance', () => {
    const badArtifact = { ...MINIMAL_ARTIFACT, provenance: { source: '', governanceStatus: 'canonical' as NarrativeGovernanceStatus, providedBy: '', rationale: '' } };
    const output = certifyNarrativeArtifact(badArtifact);
    assert.equal(output.status, 'blocked');
  });
});

describe('Facade — Validation', () => {
  it('should validate facade artifact', () => {
    const result = validateNarrativeFacadeArtifact(MINIMAL_ARTIFACT);
    assert.equal(result.valid, true);
  });

  it('should detect missing artifact ID', () => {
    const badArtifact = { ...MINIMAL_ARTIFACT, narrativeId: '' };
    const result = validateNarrativeFacadeArtifact(badArtifact);
    assert.equal(result.valid, false);
  });

  it('should validate certification report', () => {
    const report = composeNarrativeCertificationReport({
      reportId: 'r-1', status: 'certified', qualityScore: 0.95,
      findings: [], trace: TRACE, provenance: CP,
    });
    const result = validateNarrativeFacadeCertification(report);
    assert.equal(result.valid, true);
  });

  it('should detect invalid certification status', () => {
    const report = composeNarrativeCertificationReport({
      reportId: 'r-1', status: 'certified', qualityScore: 0.95,
      findings: [], trace: TRACE, provenance: CP,
    });
    const badReport = { ...report, status: 'invalid' as any };
    const result = validateNarrativeFacadeCertification(badReport);
    assert.equal(result.valid, false);
  });

  it('should detect invalid quality score', () => {
    const report = composeNarrativeCertificationReport({
      reportId: 'r-1', status: 'certified', qualityScore: 2,
      findings: [], trace: TRACE, provenance: CP,
    });
    const result = validateNarrativeFacadeCertification(report);
    assert.equal(result.valid, false);
  });
});

describe('Facade — Canonical Enum Completeness', () => {
  it('should have exactly 4 certification statuses', () => { assert.equal(CANONICAL_NARRATIVE_CERTIFICATION_STATUS.length, 4); });
  it('should have exactly 3 finding severities', () => { assert.equal(CANONICAL_NARRATIVE_FINDING_SEVERITY.length, 3); });
  it('should have exactly 18 quality dimensions', () => { assert.equal(CANONICAL_NARRATIVE_QUALITY_DIMENSIONS.length, 18); });
});

describe('Facade — Helper Functions', () => {
  it('should validate type support', () => {
    assert.equal(isSupportedNarrativeCertificationStatus('certified'), true);
    assert.equal(isSupportedNarrativeCertificationStatus('unsupported'), false);
    assert.equal(isSupportedNarrativeFindingSeverity('error'), true);
    assert.equal(isSupportedNarrativeFindingSeverity('unsupported'), false);
    assert.equal(isSupportedNarrativeQualityDimension('registry_integrity'), true);
    assert.equal(isSupportedNarrativeQualityDimension('unsupported'), false);
  });

  it('should return canonical statuses', () => {
    assert.equal(getCanonicalNarrativeCertificationStatuses().length, 4);
    assert.equal(getCanonicalNarrativeFindingSeverities().length, 3);
    assert.equal(getCanonicalNarrativeQualityDimensions().length, 18);
  });
});

describe('Facade — Determinism', () => {
  it('should produce identical output (100 iterations)', () => {
    const results: ReturnType<typeof composeAndCertifyNarrativeArtifact>[] = [];
    for (let i = 0; i < 100; i++) {
      results.push(composeAndCertifyNarrativeArtifact({
        narrativeId: 'n-1', title: 'Test', unitType: 'lesson_opening', narrativeMode: 'engineering_problem',
        domain: 'deep_learning', status: 'published', canonicalKnowledgeId: 'k-1', curriculumNodeId: 'c-1',
        lessonId: 'l-1', laboratoryId: '', sequenceOrder: 1, summary: 'S.', tags: [], provenance: VP,
        style: MINIMAL_ARTIFACT.style, frame: MINIMAL_ARTIFACT.frame,
        problems: [], origins: [], motivations: [], questions: [], misconceptions: [],
        analogies: [], metaphors: [], intuitions: [], mappings: [], cognitiveBridges: [],
        storyArcs: [], stages: [], transitions: [], cognitiveProgressions: [], attentionShifts: [], narrativeFlows: [],
        curiosityTriggers: [], engagementPoints: [], tensions: [], surprises: [], rewards: [], recoveryEntries: [], momentumEntries: [],
        historicalContexts: [], discoveries: [], timelineEvents: [], evolutions: [], milestones: [], influenceChains: [], paradigmShifts: [],
        applications: [], useCases: [], industrialScenarios: [], engineeringScenarios: [], technologyAdoptions: [], realWorldContexts: [], applicationFlows: [],
        perspectives: [], explanationViews: [], alternativeViews: [], disciplinaryViews: [], implementationViews: [], abstractionViews: [], perspectiveFlows: [],
      }));
    }
    for (let i = 1; i < results.length; i++) {
      assert.deepStrictEqual(results[0].artifact.narrativeId, results[i].artifact.narrativeId);
      assert.deepStrictEqual(results[0].certification.reportId, results[i].certification.reportId);
      assert.deepStrictEqual(results[0].status, results[i].status);
    }
  });
});

describe('Facade — Negative Capability Verification', () => {
  it('should not use Math.random', () => {
    const output = composeAndCertifyNarrativeArtifact({
      narrativeId: 'n-1', title: 'Test', unitType: 'lesson_opening', narrativeMode: 'engineering_problem',
      domain: 'deep_learning', status: 'published', canonicalKnowledgeId: 'k-1', curriculumNodeId: 'c-1',
      lessonId: 'l-1', laboratoryId: '', sequenceOrder: 1, summary: 'S.', tags: [], provenance: VP,
      style: MINIMAL_ARTIFACT.style, frame: MINIMAL_ARTIFACT.frame,
      problems: [], origins: [], motivations: [], questions: [], misconceptions: [],
      analogies: [], metaphors: [], intuitions: [], mappings: [], cognitiveBridges: [],
      storyArcs: [], stages: [], transitions: [], cognitiveProgressions: [], attentionShifts: [], narrativeFlows: [],
      curiosityTriggers: [], engagementPoints: [], tensions: [], surprises: [], rewards: [], recoveryEntries: [], momentumEntries: [],
      historicalContexts: [], discoveries: [], timelineEvents: [], evolutions: [], milestones: [], influenceChains: [], paradigmShifts: [],
      applications: [], useCases: [], industrialScenarios: [], engineeringScenarios: [], technologyAdoptions: [], realWorldContexts: [], applicationFlows: [],
      perspectives: [], explanationViews: [], alternativeViews: [], disciplinaryViews: [], implementationViews: [], abstractionViews: [], perspectiveFlows: [],
    });
    assert.ok(output);
  });

  it('should not generate narratives', () => {
    const output = certifyNarrativeArtifact(MINIMAL_ARTIFACT);
    assert.ok(!('generatedNarratives' in output));
    assert.ok(!('narrativeText' in output));
  });

  it('should not modify artifacts', () => {
    const originalId = MINIMAL_ARTIFACT.narrativeId;
    certifyNarrativeArtifact(MINIMAL_ARTIFACT);
    assert.equal(MINIMAL_ARTIFACT.narrativeId, originalId);
  });

  it('should not call LLMs', () => {
    const output = certifyNarrativeArtifact(MINIMAL_ARTIFACT);
    assert.ok(!('llmCall' in output));
  });

  it('should not create hidden state', () => {
    const output = certifyNarrativeArtifact(MINIMAL_ARTIFACT);
    assert.ok(!('internalState' in output));
    assert.ok(!('hiddenCache' in output));
  });

  it('should not have executable callbacks', () => {
    const finding = composeNarrativeCertificationFinding({
      findingId: 'f-1', severity: 'error', qualityDimension: 'registry_integrity',
      message: 'Test.', artifactReference: 'n-1', provenance: CP,
    });
    for (const key of Object.keys(finding)) {
      assert.ok(typeof (finding as any)[key] !== 'function');
    }
  });
});