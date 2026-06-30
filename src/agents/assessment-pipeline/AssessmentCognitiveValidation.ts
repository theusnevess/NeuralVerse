/**
 * NV-2000-D8-OPT-02 — Cognitive Validation Layer
 *
 * Deterministic validation for the Cognitive Kernel.
 * Returns structured errors, never exceptions for expected validation failures.
 *
 * Deterministic. No Math.random. No Date.now. No global mutable state.
 */

import {
  type AssessmentArtifactWithCognitiveProfile,
  type AssessmentArtifactWithCognitiveProfileValidationResult,
  type AssessmentGovernanceLevel,
  type CognitiveAssessmentProfile,
  type CognitiveInput,
  type CognitiveInputValidationResult,
  type CognitiveNodeValidationResult,
  type CognitiveRegistry,
  type CognitiveRegistryValidationResult,
  type CognitiveRelationship,
  type CognitiveTrace,
  type CognitiveTraceValidationResult,
  type CognitiveValidationError,
  CANONICAL_ASSESSMENT_GOVERNANCE,
  CANONICAL_ASSESSMENT_OBJECTIVES,
  CANONICAL_COGNITIVE_LEVELS,
  CANONICAL_COGNITIVE_STATUS,
  CANONICAL_EXPECTED_EVIDENCE_TYPES,
  CANONICAL_QUESTION_TYPES,
  CANONICAL_REASONING_TYPES,
} from './AssessmentAgentContract.ts';

// ============================================================================
// VALIDATION CODES — Stable forever
// ============================================================================

export const COGNITIVE_VALIDATION_CODES = {
  COGNITIVE_DUPLICATE_ID: 'COGNITIVE_DUPLICATE_ID',
  COGNITIVE_DUPLICATE_TITLE: 'COGNITIVE_DUPLICATE_TITLE',
  COGNITIVE_INVALID_LEVEL: 'COGNITIVE_INVALID_LEVEL',
  COGNITIVE_INVALID_QUESTION_TYPE: 'COGNITIVE_INVALID_QUESTION_TYPE',
  COGNITIVE_INVALID_REASONING: 'COGNITIVE_INVALID_REASONING',
  COGNITIVE_INVALID_OBJECTIVE: 'COGNITIVE_INVALID_OBJECTIVE',
  COGNITIVE_INVALID_EXPECTED_EVIDENCE: 'COGNITIVE_INVALID_EXPECTED_EVIDENCE',
  COGNITIVE_INVALID_STATUS: 'COGNITIVE_INVALID_STATUS',
  COGNITIVE_INVALID_GOVERNANCE: 'COGNITIVE_INVALID_GOVERNANCE',
  COGNITIVE_MISSING_PROVENANCE: 'COGNITIVE_MISSING_PROVENANCE',
  COGNITIVE_MISSING_PROVIDER: 'COGNITIVE_MISSING_PROVIDER',
  COGNITIVE_MISSING_RATIONALE: 'COGNITIVE_MISSING_RATIONALE',
  COGNITIVE_MISSING_ASSESSMENT_REFERENCE: 'COGNITIVE_MISSING_ASSESSMENT_REFERENCE',
  COGNITIVE_MISSING_PROFILE_ID: 'COGNITIVE_MISSING_PROFILE_ID',
  COGNITIVE_MISSING_TITLE: 'COGNITIVE_MISSING_TITLE',
  COGNITIVE_SELF_RELATIONSHIP: 'COGNITIVE_SELF_RELATIONSHIP',
  COGNITIVE_EMPTY_REGISTRY: 'COGNITIVE_EMPTY_REGISTRY',
  COGNITIVE_INVALID_TRACE: 'COGNITIVE_INVALID_TRACE',
  COGNITIVE_REGISTRY_INCONSISTENCY: 'COGNITIVE_REGISTRY_INCONSISTENCY',
} as const;

// ============================================================================
// VALIDATION FUNCTIONS — Pure, never throw
// ============================================================================

/**
 * Validate a single CognitiveAssessmentProfile.
 *
 * Returns structured errors. Never throws. Deterministic.
 */
export function validateCognitiveAssessmentProfile(
  profile: CognitiveAssessmentProfile,
): readonly CognitiveValidationError[] {
  const errors: CognitiveValidationError[] = [];

  if (!profile || typeof profile !== 'object') {
    errors.push({
      code: COGNITIVE_VALIDATION_CODES.COGNITIVE_MISSING_PROFILE_ID,
      message: 'Profile is null or not an object.',
    });
    return errors;
  }

  if (
    !profile.id ||
    typeof profile.id !== 'string' ||
    profile.id.trim() === ''
  ) {
    errors.push({
      code: COGNITIVE_VALIDATION_CODES.COGNITIVE_MISSING_PROFILE_ID,
      message: 'Profile is missing a valid id.',
      field: 'id',
      entityId: profile.id ?? 'unknown',
    });
  }

  if (
    !profile.title ||
    typeof profile.title !== 'string' ||
    profile.title.trim() === ''
  ) {
    errors.push({
      code: COGNITIVE_VALIDATION_CODES.COGNITIVE_MISSING_TITLE,
      message: 'Profile is missing a valid title.',
      field: 'title',
      entityId: profile.id,
    });
  }

  if (
    !profile.cognitiveLevel ||
    !CANONICAL_COGNITIVE_LEVELS.includes(profile.cognitiveLevel)
  ) {
    errors.push({
      code: COGNITIVE_VALIDATION_CODES.COGNITIVE_INVALID_LEVEL,
      message: `Invalid cognitive level: ${String(profile.cognitiveLevel)}`,
      field: 'cognitiveLevel',
      entityId: profile.id,
    });
  }

  if (
    !profile.questionType ||
    !CANONICAL_QUESTION_TYPES.includes(profile.questionType)
  ) {
    errors.push({
      code: COGNITIVE_VALIDATION_CODES.COGNITIVE_INVALID_QUESTION_TYPE,
      message: `Invalid question type: ${String(profile.questionType)}`,
      field: 'questionType',
      entityId: profile.id,
    });
  }

  if (
    !profile.reasoningType ||
    !CANONICAL_REASONING_TYPES.includes(profile.reasoningType)
  ) {
    errors.push({
      code: COGNITIVE_VALIDATION_CODES.COGNITIVE_INVALID_REASONING,
      message: `Invalid reasoning type: ${String(profile.reasoningType)}`,
      field: 'reasoningType',
      entityId: profile.id,
    });
  }

  if (
    !profile.assessmentObjective ||
    !CANONICAL_ASSESSMENT_OBJECTIVES.includes(profile.assessmentObjective)
  ) {
    errors.push({
      code: COGNITIVE_VALIDATION_CODES.COGNITIVE_INVALID_OBJECTIVE,
      message: `Invalid assessment objective: ${String(profile.assessmentObjective)}`,
      field: 'assessmentObjective',
      entityId: profile.id,
    });
  }

  if (
    !profile.expectedEvidence ||
    !CANONICAL_EXPECTED_EVIDENCE_TYPES.includes(profile.expectedEvidence)
  ) {
    errors.push({
      code: COGNITIVE_VALIDATION_CODES.COGNITIVE_INVALID_EXPECTED_EVIDENCE,
      message: `Invalid expected evidence: ${String(profile.expectedEvidence)}`,
      field: 'expectedEvidence',
      entityId: profile.id,
    });
  }

  if (
    !profile.status ||
    !CANONICAL_COGNITIVE_STATUS.includes(profile.status)
  ) {
    errors.push({
      code: COGNITIVE_VALIDATION_CODES.COGNITIVE_INVALID_STATUS,
      message: `Invalid status: ${String(profile.status)}`,
      field: 'status',
      entityId: profile.id,
    });
  }

  if (
    !profile.governance ||
    !CANONICAL_ASSESSMENT_GOVERNANCE.includes(profile.governance)
  ) {
    errors.push({
      code: COGNITIVE_VALIDATION_CODES.COGNITIVE_INVALID_GOVERNANCE,
      message: `Invalid governance: ${String(profile.governance)}`,
      field: 'governance',
      entityId: profile.id,
    });
  }

  if (!profile.provenance || typeof profile.provenance !== 'object') {
    errors.push({
      code: COGNITIVE_VALIDATION_CODES.COGNITIVE_MISSING_PROVENANCE,
      message: 'Profile is missing provenance.',
      field: 'provenance',
      entityId: profile.id,
    });
  } else {
    if (
      !profile.provenance.provider ||
      typeof profile.provenance.provider !== 'string' ||
      profile.provenance.provider.trim() === ''
    ) {
      errors.push({
        code: COGNITIVE_VALIDATION_CODES.COGNITIVE_MISSING_PROVIDER,
        message: 'Provenance is missing a valid provider.',
        field: 'provenance.provider',
        entityId: profile.id,
      });
    }
    if (
      !profile.provenance.rationale ||
      typeof profile.provenance.rationale !== 'string' ||
      profile.provenance.rationale.trim() === ''
    ) {
      errors.push({
        code: COGNITIVE_VALIDATION_CODES.COGNITIVE_MISSING_RATIONALE,
        message: 'Provenance is missing a valid rationale.',
        field: 'provenance.rationale',
        entityId: profile.id,
      });
    }
  }

  if (!profile.trace || typeof profile.trace !== 'object') {
    errors.push({
      code: COGNITIVE_VALIDATION_CODES.COGNITIVE_INVALID_TRACE,
      message: 'Profile is missing trace metadata.',
      field: 'trace',
      entityId: profile.id,
    });
  } else {
    if (profile.trace.deterministic !== true) {
      errors.push({
        code: COGNITIVE_VALIDATION_CODES.COGNITIVE_INVALID_TRACE,
        message: 'Trace must declare deterministic: true.',
        field: 'trace.deterministic',
        entityId: profile.id,
      });
    }
    if (profile.trace.randomUsed !== false) {
      errors.push({
        code: COGNITIVE_VALIDATION_CODES.COGNITIVE_INVALID_TRACE,
        message: 'Trace must declare randomUsed: false.',
        field: 'trace.randomUsed',
        entityId: profile.id,
      });
    }
    if (profile.trace.timeDependency !== false) {
      errors.push({
        code: COGNITIVE_VALIDATION_CODES.COGNITIVE_INVALID_TRACE,
        message: 'Trace must declare timeDependency: false.',
        field: 'trace.timeDependency',
        entityId: profile.id,
      });
    }
  }

  return errors;
}

/**
 * Validate a CognitiveRelationship.
 *
 * Returns structured errors. Never throws. Deterministic.
 */
export function validateCognitiveRelationship(
  relationship: CognitiveRelationship,
): readonly CognitiveValidationError[] {
  const errors: CognitiveValidationError[] = [];

  if (!relationship || typeof relationship !== 'object') {
    errors.push({
      code: COGNITIVE_VALIDATION_CODES.COGNITIVE_MISSING_ASSESSMENT_REFERENCE,
      message: 'Relationship is null or not an object.',
    });
    return errors;
  }

  if (
    !relationship.sourceProfileId ||
    typeof relationship.sourceProfileId !== 'string' ||
    relationship.sourceProfileId.trim() === ''
  ) {
    errors.push({
      code: COGNITIVE_VALIDATION_CODES.COGNITIVE_MISSING_ASSESSMENT_REFERENCE,
      message: 'Relationship is missing sourceProfileId.',
      field: 'sourceProfileId',
      entityId: relationship.id,
    });
  }

  if (
    !relationship.targetProfileId ||
    typeof relationship.targetProfileId !== 'string' ||
    relationship.targetProfileId.trim() === ''
  ) {
    errors.push({
      code: COGNITIVE_VALIDATION_CODES.COGNITIVE_MISSING_ASSESSMENT_REFERENCE,
      message: 'Relationship is missing targetProfileId.',
      field: 'targetProfileId',
      entityId: relationship.id,
    });
  }

  if (
    relationship.sourceProfileId &&
    relationship.targetProfileId &&
    relationship.sourceProfileId === relationship.targetProfileId
  ) {
    errors.push({
      code: COGNITIVE_VALIDATION_CODES.COGNITIVE_SELF_RELATIONSHIP,
      message: 'Relationship cannot reference itself (source equals target).',
      field: 'sourceProfileId',
      entityId: relationship.id,
    });
  }

  return errors;
}

/**
 * Validate a CognitiveRegistry.
 *
 * Returns structured errors. Never throws. Deterministic.
 */
export function validateCognitiveRegistry(
  registry: CognitiveRegistry,
): CognitiveRegistryValidationResult {
  const errors: CognitiveValidationError[] = [];

  if (!registry || typeof registry !== 'object') {
    errors.push({
      code: COGNITIVE_VALIDATION_CODES.COGNITIVE_EMPTY_REGISTRY,
      message: 'Registry is null or not an object.',
    });
    return {
      valid: false,
      errors,
      nodeResults: [],
      checkedAt: 'cognitive_registry_validation',
    };
  }

  if (!registry.nodes || !Array.isArray(registry.nodes)) {
    errors.push({
      code: COGNITIVE_VALIDATION_CODES.COGNITIVE_EMPTY_REGISTRY,
      message: 'Registry is missing nodes array.',
      field: 'nodes',
    });
    return {
      valid: false,
      errors,
      nodeResults: [],
      checkedAt: 'cognitive_registry_validation',
    };
  }

  if (registry.nodes.length === 0) {
    errors.push({
      code: COGNITIVE_VALIDATION_CODES.COGNITIVE_EMPTY_REGISTRY,
      message: 'Registry has no nodes.',
      field: 'nodes',
    });
    return {
      valid: false,
      errors,
      nodeResults: [],
      checkedAt: 'cognitive_registry_validation',
    };
  }

  const nodeResults = registry.nodes.map((node) => {
    const nodeErrors = validateCognitiveAssessmentProfile(node);
    return {
      valid: nodeErrors.length === 0,
      errors: nodeErrors,
      profileId: node.id,
      checkedAt: 'cognitive_node_validation' as const,
    };
  });

  for (const result of nodeResults) {
    errors.push(...result.errors);
  }

  const idSet = new Set<string>();
  const titleSet = new Set<string>();
  for (const node of registry.nodes) {
    if (idSet.has(node.id)) {
      errors.push({
        code: COGNITIVE_VALIDATION_CODES.COGNITIVE_DUPLICATE_ID,
        message: `Duplicate profile id: ${node.id}`,
        field: 'id',
        entityId: node.id,
      });
    }
    idSet.add(node.id);

    if (titleSet.has(node.title)) {
      errors.push({
        code: COGNITIVE_VALIDATION_CODES.COGNITIVE_DUPLICATE_TITLE,
        message: `Duplicate profile title: ${node.title}`,
        field: 'title',
        entityId: node.id,
      });
    }
    titleSet.add(node.title);
  }

  if (!registry.metadata || typeof registry.metadata !== 'object') {
    errors.push({
      code: COGNITIVE_VALIDATION_CODES.COGNITIVE_REGISTRY_INCONSISTENCY,
      message: 'Registry is missing metadata.',
      field: 'metadata',
    });
  } else {
    if (registry.metadata.nodeCount !== registry.nodes.length) {
      errors.push({
        code: COGNITIVE_VALIDATION_CODES.COGNITIVE_REGISTRY_INCONSISTENCY,
        message: `Metadata nodeCount (${registry.metadata.nodeCount}) does not match actual node count (${registry.nodes.length}).`,
        field: 'metadata.nodeCount',
      });
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    nodeResults,
    checkedAt: 'cognitive_registry_validation',
  };
}

/**
 * Validate a CognitiveInput.
 *
 * Returns structured errors. Never throws. Deterministic.
 */
export function validateCognitiveInput(
  input: CognitiveInput,
): CognitiveInputValidationResult {
  const errors: CognitiveValidationError[] = [];

  if (!input || typeof input !== 'object') {
    errors.push({
      code: COGNITIVE_VALIDATION_CODES.COGNITIVE_EMPTY_REGISTRY,
      message: 'Input is null or not an object.',
    });
    return {
      valid: false,
      errors,
      checkedAt: 'cognitive_input_validation',
    };
  }

  if (!input.nodes || !Array.isArray(input.nodes)) {
    errors.push({
      code: COGNITIVE_VALIDATION_CODES.COGNITIVE_EMPTY_REGISTRY,
      message: 'Input is missing nodes array.',
      field: 'nodes',
    });
    return {
      valid: false,
      errors,
      checkedAt: 'cognitive_input_validation',
    };
  }

  if (input.nodes.length === 0) {
    errors.push({
      code: COGNITIVE_VALIDATION_CODES.COGNITIVE_EMPTY_REGISTRY,
      message: 'Input has no nodes.',
      field: 'nodes',
    });
    return {
      valid: false,
      errors,
      checkedAt: 'cognitive_input_validation',
    };
  }

  for (const node of input.nodes) {
    const nodeErrors = validateCognitiveAssessmentProfile(node);
    errors.push(...nodeErrors);
  }

  return {
    valid: errors.length === 0,
    errors,
    checkedAt: 'cognitive_input_validation',
  };
}

/**
 * Validate a CognitiveTrace.
 *
 * Returns structured errors. Never throws. Deterministic.
 */
export function validateCognitiveTrace(
  trace: CognitiveTrace,
): CognitiveTraceValidationResult {
  const errors: CognitiveValidationError[] = [];

  if (!trace || typeof trace !== 'object') {
    errors.push({
      code: COGNITIVE_VALIDATION_CODES.COGNITIVE_INVALID_TRACE,
      message: 'Trace is null or not an object.',
    });
    return {
      valid: false,
      errors,
      checkedAt: 'cognitive_trace_validation',
    };
  }

  if (
    !trace.traceId ||
    typeof trace.traceId !== 'string' ||
    trace.traceId.trim() === ''
  ) {
    errors.push({
      code: COGNITIVE_VALIDATION_CODES.COGNITIVE_INVALID_TRACE,
      message: 'Trace is missing a valid traceId.',
      field: 'traceId',
    });
  }

  if (trace.deterministic !== true) {
    errors.push({
      code: COGNITIVE_VALIDATION_CODES.COGNITIVE_INVALID_TRACE,
      message: 'Trace must declare deterministic: true.',
      field: 'deterministic',
    });
  }

  if (trace.randomUsed !== false) {
    errors.push({
      code: COGNITIVE_VALIDATION_CODES.COGNITIVE_INVALID_TRACE,
      message: 'Trace must declare randomUsed: false.',
      field: 'randomUsed',
    });
  }

  if (trace.timeDependency !== false) {
    errors.push({
      code: COGNITIVE_VALIDATION_CODES.COGNITIVE_INVALID_TRACE,
      message: 'Trace must declare timeDependency: false.',
      field: 'timeDependency',
    });
  }

  return {
    valid: errors.length === 0,
    errors,
    checkedAt: 'cognitive_trace_validation',
  };
}

/**
 * Validate an AssessmentArtifactWithCognitiveProfile.
 *
 * Returns structured errors. Never throws. Deterministic.
 */
export function validateAssessmentArtifactWithCognitiveProfile(
  artifact: AssessmentArtifactWithCognitiveProfile,
): AssessmentArtifactWithCognitiveProfileValidationResult {
  const errors: CognitiveValidationError[] = [];

  if (!artifact || typeof artifact !== 'object') {
    errors.push({
      code: COGNITIVE_VALIDATION_CODES.COGNITIVE_MISSING_ASSESSMENT_REFERENCE,
      message: 'Artifact is null or not an object.',
    });
    return {
      valid: false,
      errors,
      checkedAt: 'artifact_cognitive_profile_validation',
    };
  }

  if (
    !artifact.artifactId ||
    typeof artifact.artifactId !== 'string' ||
    artifact.artifactId.trim() === ''
  ) {
    errors.push({
      code: COGNITIVE_VALIDATION_CODES.COGNITIVE_MISSING_ASSESSMENT_REFERENCE,
      message: 'Artifact is missing a valid artifactId.',
      field: 'artifactId',
    });
  }

  if (
    !artifact.artifactTitle ||
    typeof artifact.artifactTitle !== 'string' ||
    artifact.artifactTitle.trim() === ''
  ) {
    errors.push({
      code: COGNITIVE_VALIDATION_CODES.COGNITIVE_MISSING_TITLE,
      message: 'Artifact is missing a valid artifactTitle.',
      field: 'artifactTitle',
    });
  }

  if (!artifact.cognitiveProfile || typeof artifact.cognitiveProfile !== 'object') {
    errors.push({
      code: COGNITIVE_VALIDATION_CODES.COGNITIVE_MISSING_PROVENANCE,
      message: 'Artifact is missing cognitiveProfile.',
      field: 'cognitiveProfile',
    });
  } else {
    const profileErrors = validateCognitiveAssessmentProfile(
      artifact.cognitiveProfile,
    );
    errors.push(...profileErrors);
  }

  return {
    valid: errors.length === 0,
    errors,
    checkedAt: 'artifact_cognitive_profile_validation',
  };
}
