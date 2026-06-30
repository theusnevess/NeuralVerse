/**
 * NV-2100-D9-OPT-06 — Knowledge Evolution Validation Layer
 *
 * Deterministic validation for knowledge evolution metadata.
 * Returns structured errors, never exceptions for expected validation failures.
 *
 * Deterministic. No Math.random. No Date.now. No global mutable state.
 */

import type {
  KnowledgeEvolutionProfile,
  HistoricalOddity,
  ResearchTrail,
  EvolutionMilestone,
  EvolutionRelationship,
  KnowledgeEvolutionRegistry,
  KnowledgeEvolutionInput,
  KnowledgeEvolutionTrace,
  CuriosityArtifactWithKnowledgeEvolution,
  KnowledgeEvolutionValidationError,
  KnowledgeEvolutionRegistryValidationResult,
  KnowledgeEvolutionInputValidationResult,
  KnowledgeEvolutionTraceValidationResult,
  CuriosityArtifactWithKnowledgeEvolutionValidationResult,
} from './CuriosityAgentContract.ts';

import {
  CANONICAL_DISCOVERY_TYPES,
  CANONICAL_EVOLUTION_STAGES,
  CANONICAL_RESEARCH_TRAIL_TYPES,
  CANONICAL_ODDITY_TYPES,
  CANONICAL_EVOLUTION_PURPOSES,
  CANONICAL_KNOWLEDGE_EVOLUTION_STATUS,
  CANONICAL_CURIOSITY_GOVERNANCE,
} from './CuriosityAgentContract.ts';

// ---------------------------------------------------------------------------
// Validation Error Codes
// ---------------------------------------------------------------------------

export const KNOWLEDGE_EVOLUTION_VALIDATION_CODES = {
  EVOLUTION_DUPLICATE_ID: 'EVOLUTION_DUPLICATE_ID',
  EVOLUTION_DUPLICATE_TITLE: 'EVOLUTION_DUPLICATE_TITLE',
  ODDITY_DUPLICATE_ID: 'ODDITY_DUPLICATE_ID',
  TRAIL_DUPLICATE_ID: 'TRAIL_DUPLICATE_ID',
  EVOLUTION_INVALID_DISCOVERY_TYPE: 'EVOLUTION_INVALID_DISCOVERY_TYPE',
  EVOLUTION_INVALID_STAGE: 'EVOLUTION_INVALID_STAGE',
  EVOLUTION_INVALID_TRAIL: 'EVOLUTION_INVALID_TRAIL',
  EVOLUTION_INVALID_ODDITY: 'EVOLUTION_INVALID_ODDITY',
  EVOLUTION_INVALID_PURPOSE: 'EVOLUTION_INVALID_PURPOSE',
  EVOLUTION_INVALID_STATUS: 'EVOLUTION_INVALID_STATUS',
  EVOLUTION_INVALID_GOVERNANCE: 'EVOLUTION_INVALID_GOVERNANCE',
  EVOLUTION_MISSING_PROVENANCE: 'EVOLUTION_MISSING_PROVENANCE',
  EVOLUTION_MISSING_PROVIDER: 'EVOLUTION_MISSING_PROVIDER',
  EVOLUTION_MISSING_RATIONALE: 'EVOLUTION_MISSING_RATIONALE',
  EVOLUTION_MISSING_CURIOSITY_REFERENCE: 'EVOLUTION_MISSING_CURIOSITY_REFERENCE',
  EVOLUTION_MISSING_PROFILE_ID: 'EVOLUTION_MISSING_PROFILE_ID',
  EVOLUTION_MISSING_TITLE: 'EVOLUTION_MISSING_TITLE',
  EVOLUTION_MISSING_MILESTONE: 'EVOLUTION_MISSING_MILESTONE',
  EVOLUTION_SELF_RELATIONSHIP: 'EVOLUTION_SELF_RELATIONSHIP',
  EVOLUTION_EMPTY_REGISTRY: 'EVOLUTION_EMPTY_REGISTRY',
  EVOLUTION_INVALID_TRACE: 'EVOLUTION_INVALID_TRACE',
  EVOLUTION_REGISTRY_INCONSISTENCY: 'EVOLUTION_REGISTRY_INCONSISTENCY',
  EVOLUTION_INVALID_CONFIGURATION: 'EVOLUTION_INVALID_CONFIGURATION',
  EVOLUTION_INVALID_TIMELINE: 'EVOLUTION_INVALID_TIMELINE',
} as const;

// ---------------------------------------------------------------------------
// Single Profile Validation
// ---------------------------------------------------------------------------

/**
 * Validates a single knowledge evolution profile against canonical invariants.
 * Pure function. No side effects.
 */
export function validateKnowledgeEvolutionProfile(
  profile: KnowledgeEvolutionProfile,
): readonly KnowledgeEvolutionValidationError[] {
  const errors: KnowledgeEvolutionValidationError[] = [];

  if (!profile.id || profile.id.trim() === '') {
    errors.push({
      code: KNOWLEDGE_EVOLUTION_VALIDATION_CODES.EVOLUTION_MISSING_PROFILE_ID,
      message: 'Knowledge evolution profile is missing a profile ID.',
      field: 'id',
      profileId: profile.id,
    });
  }

  if (!profile.title || profile.title.trim() === '') {
    errors.push({
      code: KNOWLEDGE_EVOLUTION_VALIDATION_CODES.EVOLUTION_MISSING_TITLE,
      message: 'Knowledge evolution profile is missing a title.',
      field: 'title',
      profileId: profile.id,
    });
  }

  if (!CANONICAL_DISCOVERY_TYPES.includes(profile.discoveryType)) {
    errors.push({
      code: KNOWLEDGE_EVOLUTION_VALIDATION_CODES.EVOLUTION_INVALID_DISCOVERY_TYPE,
      message: `Knowledge evolution profile has unsupported discovery type: "${profile.discoveryType}".`,
      field: 'discoveryType',
      profileId: profile.id,
    });
  }

  if (!CANONICAL_EVOLUTION_STAGES.includes(profile.evolutionStage)) {
    errors.push({
      code: KNOWLEDGE_EVOLUTION_VALIDATION_CODES.EVOLUTION_INVALID_STAGE,
      message: `Knowledge evolution profile has unsupported evolution stage: "${profile.evolutionStage}".`,
      field: 'evolutionStage',
      profileId: profile.id,
    });
  }

  if (!CANONICAL_RESEARCH_TRAIL_TYPES.includes(profile.researchTrailType)) {
    errors.push({
      code: KNOWLEDGE_EVOLUTION_VALIDATION_CODES.EVOLUTION_INVALID_TRAIL,
      message: `Knowledge evolution profile has unsupported research trail type: "${profile.researchTrailType}".`,
      field: 'researchTrailType',
      profileId: profile.id,
    });
  }

  if (!CANONICAL_EVOLUTION_PURPOSES.includes(profile.evolutionPurpose)) {
    errors.push({
      code: KNOWLEDGE_EVOLUTION_VALIDATION_CODES.EVOLUTION_INVALID_PURPOSE,
      message: `Knowledge evolution profile has unsupported evolution purpose: "${profile.evolutionPurpose}".`,
      field: 'evolutionPurpose',
      profileId: profile.id,
    });
  }

  if (!CANONICAL_KNOWLEDGE_EVOLUTION_STATUS.includes(profile.status)) {
    errors.push({
      code: KNOWLEDGE_EVOLUTION_VALIDATION_CODES.EVOLUTION_INVALID_STATUS,
      message: `Knowledge evolution profile has unsupported status: "${profile.status}".`,
      field: 'status',
      profileId: profile.id,
    });
  }

  if (!CANONICAL_CURIOSITY_GOVERNANCE.includes(profile.governance)) {
    errors.push({
      code: KNOWLEDGE_EVOLUTION_VALIDATION_CODES.EVOLUTION_INVALID_GOVERNANCE,
      message: `Knowledge evolution profile has invalid governance: "${profile.governance}".`,
      field: 'governance',
      profileId: profile.id,
    });
  }

  if (!profile.provenance) {
    errors.push({
      code: KNOWLEDGE_EVOLUTION_VALIDATION_CODES.EVOLUTION_MISSING_PROVENANCE,
      message: 'Knowledge evolution profile is missing provenance.',
      field: 'provenance',
      profileId: profile.id,
    });
  } else {
    if (!profile.provenance.provider || profile.provenance.provider.trim() === '') {
      errors.push({
        code: KNOWLEDGE_EVOLUTION_VALIDATION_CODES.EVOLUTION_MISSING_PROVIDER,
        message: 'Knowledge evolution provenance is missing a provider.',
        field: 'provenance.provider',
        profileId: profile.id,
      });
    }

    if (!profile.provenance.rationale || profile.provenance.rationale.trim() === '') {
      errors.push({
        code: KNOWLEDGE_EVOLUTION_VALIDATION_CODES.EVOLUTION_MISSING_RATIONALE,
        message: 'Knowledge evolution provenance is missing a rationale.',
        field: 'provenance.rationale',
        profileId: profile.id,
      });
    }
  }

  return errors;
}

// ---------------------------------------------------------------------------
// Historical Oddity Validation
// ---------------------------------------------------------------------------

/**
 * Validates a historical oddity against canonical invariants.
 * Pure function. No side effects.
 */
export function validateHistoricalOddity(
  oddity: HistoricalOddity,
): readonly KnowledgeEvolutionValidationError[] {
  const errors: KnowledgeEvolutionValidationError[] = [];

  if (!oddity.oddityId || oddity.oddityId.trim() === '') {
    errors.push({
      code: KNOWLEDGE_EVOLUTION_VALIDATION_CODES.ODDITY_DUPLICATE_ID,
      message: 'Historical oddity is missing an oddity ID.',
      field: 'oddityId',
      profileId: oddity.oddityId,
    });
  }

  if (!oddity.title || oddity.title.trim() === '') {
    errors.push({
      code: KNOWLEDGE_EVOLUTION_VALIDATION_CODES.EVOLUTION_MISSING_TITLE,
      message: 'Historical oddity is missing a title.',
      field: 'title',
      profileId: oddity.oddityId,
    });
  }

  if (!CANONICAL_ODDITY_TYPES.includes(oddity.oddityType)) {
    errors.push({
      code: KNOWLEDGE_EVOLUTION_VALIDATION_CODES.EVOLUTION_INVALID_ODDITY,
      message: `Historical oddity has unsupported oddity type: "${oddity.oddityType}".`,
      field: 'oddityType',
      profileId: oddity.oddityId,
    });
  }

  if (!oddity.historicalContext || oddity.historicalContext.trim() === '') {
    errors.push({
      code: KNOWLEDGE_EVOLUTION_VALIDATION_CODES.EVOLUTION_INVALID_CONFIGURATION,
      message: 'Historical oddity is missing historical context.',
      field: 'historicalContext',
      profileId: oddity.oddityId,
    });
  }

  if (!oddity.unexpectedElement || oddity.unexpectedElement.trim() === '') {
    errors.push({
      code: KNOWLEDGE_EVOLUTION_VALIDATION_CODES.EVOLUTION_INVALID_CONFIGURATION,
      message: 'Historical oddity is missing unexpected element.',
      field: 'unexpectedElement',
      profileId: oddity.oddityId,
    });
  }

  if (!oddity.lessonLearned || oddity.lessonLearned.trim() === '') {
    errors.push({
      code: KNOWLEDGE_EVOLUTION_VALIDATION_CODES.EVOLUTION_INVALID_CONFIGURATION,
      message: 'Historical oddity is missing lesson learned.',
      field: 'lessonLearned',
      profileId: oddity.oddityId,
    });
  }

  if (!CANONICAL_KNOWLEDGE_EVOLUTION_STATUS.includes(oddity.status)) {
    errors.push({
      code: KNOWLEDGE_EVOLUTION_VALIDATION_CODES.EVOLUTION_INVALID_STATUS,
      message: `Historical oddity has unsupported status: "${oddity.status}".`,
      field: 'status',
      profileId: oddity.oddityId,
    });
  }

  if (!CANONICAL_CURIOSITY_GOVERNANCE.includes(oddity.governance)) {
    errors.push({
      code: KNOWLEDGE_EVOLUTION_VALIDATION_CODES.EVOLUTION_INVALID_GOVERNANCE,
      message: `Historical oddity has invalid governance: "${oddity.governance}".`,
      field: 'governance',
      profileId: oddity.oddityId,
    });
  }

  if (!oddity.provenance) {
    errors.push({
      code: KNOWLEDGE_EVOLUTION_VALIDATION_CODES.EVOLUTION_MISSING_PROVENANCE,
      message: 'Historical oddity is missing provenance.',
      field: 'provenance',
      profileId: oddity.oddityId,
    });
  } else {
    if (!oddity.provenance.provider || oddity.provenance.provider.trim() === '') {
      errors.push({
        code: KNOWLEDGE_EVOLUTION_VALIDATION_CODES.EVOLUTION_MISSING_PROVIDER,
        message: 'Historical oddity provenance is missing a provider.',
        field: 'provenance.provider',
        profileId: oddity.oddityId,
      });
    }

    if (!oddity.provenance.rationale || oddity.provenance.rationale.trim() === '') {
      errors.push({
        code: KNOWLEDGE_EVOLUTION_VALIDATION_CODES.EVOLUTION_MISSING_RATIONALE,
        message: 'Historical oddity provenance is missing a rationale.',
        field: 'provenance.rationale',
        profileId: oddity.oddityId,
      });
    }
  }

  return errors;
}

// ---------------------------------------------------------------------------
// Research Trail Validation
// ---------------------------------------------------------------------------

/**
 * Validates a research trail against canonical invariants.
 * Pure function. No side effects.
 */
export function validateResearchTrail(
  trail: ResearchTrail,
): readonly KnowledgeEvolutionValidationError[] {
  const errors: KnowledgeEvolutionValidationError[] = [];

  if (!trail.trailId || trail.trailId.trim() === '') {
    errors.push({
      code: KNOWLEDGE_EVOLUTION_VALIDATION_CODES.TRAIL_DUPLICATE_ID,
      message: 'Research trail is missing a trail ID.',
      field: 'trailId',
      profileId: trail.trailId,
    });
  }

  if (!trail.title || trail.title.trim() === '') {
    errors.push({
      code: KNOWLEDGE_EVOLUTION_VALIDATION_CODES.EVOLUTION_MISSING_TITLE,
      message: 'Research trail is missing a title.',
      field: 'title',
      profileId: trail.trailId,
    });
  }

  if (!CANONICAL_RESEARCH_TRAIL_TYPES.includes(trail.trailType)) {
    errors.push({
      code: KNOWLEDGE_EVOLUTION_VALIDATION_CODES.EVOLUTION_INVALID_TRAIL,
      message: `Research trail has unsupported trail type: "${trail.trailType}".`,
      field: 'trailType',
      profileId: trail.trailId,
    });
  }

  if (!trail.trailDescription || trail.trailDescription.trim() === '') {
    errors.push({
      code: KNOWLEDGE_EVOLUTION_VALIDATION_CODES.EVOLUTION_INVALID_CONFIGURATION,
      message: 'Research trail is missing trail description.',
      field: 'trailDescription',
      profileId: trail.trailId,
    });
  }

  if (!trail.breakthroughMoment || trail.breakthroughMoment.trim() === '') {
    errors.push({
      code: KNOWLEDGE_EVOLUTION_VALIDATION_CODES.EVOLUTION_INVALID_CONFIGURATION,
      message: 'Research trail is missing breakthrough moment.',
      field: 'breakthroughMoment',
      profileId: trail.trailId,
    });
  }

  if (!trail.impactAssessment || trail.impactAssessment.trim() === '') {
    errors.push({
      code: KNOWLEDGE_EVOLUTION_VALIDATION_CODES.EVOLUTION_INVALID_CONFIGURATION,
      message: 'Research trail is missing impact assessment.',
      field: 'impactAssessment',
      profileId: trail.trailId,
    });
  }

  if (!CANONICAL_KNOWLEDGE_EVOLUTION_STATUS.includes(trail.status)) {
    errors.push({
      code: KNOWLEDGE_EVOLUTION_VALIDATION_CODES.EVOLUTION_INVALID_STATUS,
      message: `Research trail has unsupported status: "${trail.status}".`,
      field: 'status',
      profileId: trail.trailId,
    });
  }

  if (!CANONICAL_CURIOSITY_GOVERNANCE.includes(trail.governance)) {
    errors.push({
      code: KNOWLEDGE_EVOLUTION_VALIDATION_CODES.EVOLUTION_INVALID_GOVERNANCE,
      message: `Research trail has invalid governance: "${trail.governance}".`,
      field: 'governance',
      profileId: trail.trailId,
    });
  }

  if (!trail.provenance) {
    errors.push({
      code: KNOWLEDGE_EVOLUTION_VALIDATION_CODES.EVOLUTION_MISSING_PROVENANCE,
      message: 'Research trail is missing provenance.',
      field: 'provenance',
      profileId: trail.trailId,
    });
  } else {
    if (!trail.provenance.provider || trail.provenance.provider.trim() === '') {
      errors.push({
        code: KNOWLEDGE_EVOLUTION_VALIDATION_CODES.EVOLUTION_MISSING_PROVIDER,
        message: 'Research trail provenance is missing a provider.',
        field: 'provenance.provider',
        profileId: trail.trailId,
      });
    }

    if (!trail.provenance.rationale || trail.provenance.rationale.trim() === '') {
      errors.push({
        code: KNOWLEDGE_EVOLUTION_VALIDATION_CODES.EVOLUTION_MISSING_RATIONALE,
        message: 'Research trail provenance is missing a rationale.',
        field: 'provenance.rationale',
        profileId: trail.trailId,
      });
    }
  }

  return errors;
}

// ---------------------------------------------------------------------------
// Evolution Milestone Validation
// ---------------------------------------------------------------------------

/**
 * Validates an evolution milestone against canonical invariants.
 * Pure function. No side effects.
 */
export function validateEvolutionMilestone(
  milestone: EvolutionMilestone,
): readonly KnowledgeEvolutionValidationError[] {
  const errors: KnowledgeEvolutionValidationError[] = [];

  if (!milestone.milestoneId || milestone.milestoneId.trim() === '') {
    errors.push({
      code: KNOWLEDGE_EVOLUTION_VALIDATION_CODES.EVOLUTION_MISSING_MILESTONE,
      message: 'Evolution milestone is missing a milestone ID.',
      field: 'milestoneId',
    });
  }

  if (!milestone.profileId || milestone.profileId.trim() === '') {
    errors.push({
      code: KNOWLEDGE_EVOLUTION_VALIDATION_CODES.EVOLUTION_MISSING_CURIOSITY_REFERENCE,
      message: 'Evolution milestone is missing a profile ID.',
      field: 'profileId',
    });
  }

  if (!milestone.title || milestone.title.trim() === '') {
    errors.push({
      code: KNOWLEDGE_EVOLUTION_VALIDATION_CODES.EVOLUTION_MISSING_TITLE,
      message: 'Evolution milestone is missing a title.',
      field: 'title',
    });
  }

  if (!CANONICAL_EVOLUTION_STAGES.includes(milestone.stage)) {
    errors.push({
      code: KNOWLEDGE_EVOLUTION_VALIDATION_CODES.EVOLUTION_INVALID_STAGE,
      message: `Evolution milestone has unsupported stage: "${milestone.stage}".`,
      field: 'stage',
    });
  }

  if (!milestone.year || milestone.year.trim() === '') {
    errors.push({
      code: KNOWLEDGE_EVOLUTION_VALIDATION_CODES.EVOLUTION_INVALID_TIMELINE,
      message: 'Evolution milestone is missing year.',
      field: 'year',
    });
  }

  if (!milestone.description || milestone.description.trim() === '') {
    errors.push({
      code: KNOWLEDGE_EVOLUTION_VALIDATION_CODES.EVOLUTION_INVALID_CONFIGURATION,
      message: 'Evolution milestone is missing description.',
      field: 'description',
    });
  }

  if (!milestone.significance || milestone.significance.trim() === '') {
    errors.push({
      code: KNOWLEDGE_EVOLUTION_VALIDATION_CODES.EVOLUTION_INVALID_CONFIGURATION,
      message: 'Evolution milestone is missing significance.',
      field: 'significance',
    });
  }

  return errors;
}

// ---------------------------------------------------------------------------
// Evolution Relationship Validation
// ---------------------------------------------------------------------------

/**
 * Validates an evolution relationship against canonical invariants.
 * Pure function. No side effects.
 */
export function validateEvolutionRelationship(
  relationship: EvolutionRelationship,
): readonly KnowledgeEvolutionValidationError[] {
  const errors: KnowledgeEvolutionValidationError[] = [];

  if (!relationship.relationshipId || relationship.relationshipId.trim() === '') {
    errors.push({
      code: KNOWLEDGE_EVOLUTION_VALIDATION_CODES.EVOLUTION_MISSING_CURIOSITY_REFERENCE,
      message: 'Evolution relationship is missing a relationship ID.',
      field: 'relationshipId',
    });
  }

  if (!relationship.sourceProfileId || relationship.sourceProfileId.trim() === '') {
    errors.push({
      code: KNOWLEDGE_EVOLUTION_VALIDATION_CODES.EVOLUTION_MISSING_CURIOSITY_REFERENCE,
      message: 'Evolution relationship is missing a source profile ID.',
      field: 'sourceProfileId',
    });
  }

  if (!relationship.targetProfileId || relationship.targetProfileId.trim() === '') {
    errors.push({
      code: KNOWLEDGE_EVOLUTION_VALIDATION_CODES.EVOLUTION_MISSING_CURIOSITY_REFERENCE,
      message: 'Evolution relationship is missing a target profile ID.',
      field: 'targetProfileId',
    });
  }

  if (relationship.sourceProfileId === relationship.targetProfileId) {
    errors.push({
      code: KNOWLEDGE_EVOLUTION_VALIDATION_CODES.EVOLUTION_SELF_RELATIONSHIP,
      message: 'Evolution relationship cannot be a self-relationship.',
      field: 'targetProfileId',
    });
  }

  if (!relationship.provenance) {
    errors.push({
      code: KNOWLEDGE_EVOLUTION_VALIDATION_CODES.EVOLUTION_MISSING_PROVENANCE,
      message: 'Evolution relationship is missing provenance.',
      field: 'provenance',
    });
  } else {
    if (!relationship.provenance.provider || relationship.provenance.provider.trim() === '') {
      errors.push({
        code: KNOWLEDGE_EVOLUTION_VALIDATION_CODES.EVOLUTION_MISSING_PROVIDER,
        message: 'Evolution relationship provenance is missing a provider.',
        field: 'provenance.provider',
      });
    }

    if (!relationship.provenance.rationale || relationship.provenance.rationale.trim() === '') {
      errors.push({
        code: KNOWLEDGE_EVOLUTION_VALIDATION_CODES.EVOLUTION_MISSING_RATIONALE,
        message: 'Evolution relationship provenance is missing a rationale.',
        field: 'provenance.rationale',
      });
    }
  }

  return errors;
}

// ---------------------------------------------------------------------------
// Knowledge Evolution Registry Validation
// ---------------------------------------------------------------------------

/**
 * Validates a knowledge evolution registry against canonical invariants.
 * Pure function. No side effects.
 */
export function validateKnowledgeEvolutionRegistry(
  registry: KnowledgeEvolutionRegistry,
): KnowledgeEvolutionRegistryValidationResult {
  const errors: KnowledgeEvolutionValidationError[] = [];

  if (!registry.registryId || registry.registryId.trim() === '') {
    errors.push({
      code: KNOWLEDGE_EVOLUTION_VALIDATION_CODES.EVOLUTION_EMPTY_REGISTRY,
      message: 'Registry is missing a registry ID.',
      field: 'registryId',
    });
  }

  if (!registry.profiles || registry.profiles.length === 0) {
    errors.push({
      code: KNOWLEDGE_EVOLUTION_VALIDATION_CODES.EVOLUTION_EMPTY_REGISTRY,
      message: 'Registry has no profiles.',
      field: 'profiles',
    });
  }

  if (registry.deterministic !== true) {
    errors.push({
      code: KNOWLEDGE_EVOLUTION_VALIDATION_CODES.EVOLUTION_INVALID_TRACE,
      message: 'Registry must declare deterministic: true.',
      field: 'deterministic',
    });
  }

  if (registry.randomUsed !== false) {
    errors.push({
      code: KNOWLEDGE_EVOLUTION_VALIDATION_CODES.EVOLUTION_INVALID_TRACE,
      message: 'Registry must declare randomUsed: false.',
      field: 'randomUsed',
    });
  }

  if (registry.timeDependency !== false) {
    errors.push({
      code: KNOWLEDGE_EVOLUTION_VALIDATION_CODES.EVOLUTION_INVALID_TRACE,
      message: 'Registry must declare timeDependency: false.',
      field: 'timeDependency',
    });
  }

  // Check for duplicate profile IDs
  const seenIds = new Set<string>();
  for (const profile of registry.profiles) {
    if (seenIds.has(profile.id)) {
      errors.push({
        code: KNOWLEDGE_EVOLUTION_VALIDATION_CODES.EVOLUTION_DUPLICATE_ID,
        message: `Duplicate profile ID: "${profile.id}".`,
        profileId: profile.id,
      });
    }
    seenIds.add(profile.id);
  }

  // Check for duplicate titles
  const seenTitles = new Set<string>();
  for (const profile of registry.profiles) {
    if (seenTitles.has(profile.title)) {
      errors.push({
        code: KNOWLEDGE_EVOLUTION_VALIDATION_CODES.EVOLUTION_DUPLICATE_TITLE,
        message: `Duplicate profile title: "${profile.title}".`,
        field: 'title',
        profileId: profile.id,
      });
    }
    seenTitles.add(profile.title);
  }

  // Check for duplicate oddity IDs
  const seenOddityIds = new Set<string>();
  for (const oddity of registry.oddities) {
    if (seenOddityIds.has(oddity.oddityId)) {
      errors.push({
        code: KNOWLEDGE_EVOLUTION_VALIDATION_CODES.ODDITY_DUPLICATE_ID,
        message: `Duplicate oddity ID: "${oddity.oddityId}".`,
        field: 'oddityId',
      });
    }
    seenOddityIds.add(oddity.oddityId);
  }

  // Check for duplicate trail IDs
  const seenTrailIds = new Set<string>();
  for (const trail of registry.trails) {
    if (seenTrailIds.has(trail.trailId)) {
      errors.push({
        code: KNOWLEDGE_EVOLUTION_VALIDATION_CODES.TRAIL_DUPLICATE_ID,
        message: `Duplicate trail ID: "${trail.trailId}".`,
        field: 'trailId',
      });
    }
    seenTrailIds.add(trail.trailId);
  }

  // Validate each profile
  for (const profile of registry.profiles) {
    errors.push(...validateKnowledgeEvolutionProfile(profile));
  }

  // Validate each oddity
  for (const oddity of registry.oddities) {
    errors.push(...validateHistoricalOddity(oddity));
  }

  // Validate each trail
  for (const trail of registry.trails) {
    errors.push(...validateResearchTrail(trail));
  }

  // Validate each milestone
  for (const milestone of registry.milestones) {
    errors.push(...validateEvolutionMilestone(milestone));
  }

  // Validate each relationship
  for (const relationship of registry.relationships) {
    errors.push(...validateEvolutionRelationship(relationship));
  }

  return {
    valid: errors.length === 0,
    errors,
    checkedAt: 'knowledge_evolution_registry_composition',
  };
}

// ---------------------------------------------------------------------------
// Knowledge Evolution Input Validation
// ---------------------------------------------------------------------------

/**
 * Validates knowledge evolution input against canonical invariants.
 * Pure function. No side effects.
 */
export function validateKnowledgeEvolutionInput(
  input: KnowledgeEvolutionInput,
): KnowledgeEvolutionInputValidationResult {
  const errors: KnowledgeEvolutionValidationError[] = [];

  if (!input.profiles || input.profiles.length === 0) {
    errors.push({
      code: KNOWLEDGE_EVOLUTION_VALIDATION_CODES.EVOLUTION_EMPTY_REGISTRY,
      message: 'Input has no profiles.',
      field: 'profiles',
    });
  } else {
    for (const profile of input.profiles) {
      errors.push(...validateKnowledgeEvolutionProfile(profile));
    }
  }

  for (const oddity of input.oddities) {
    errors.push(...validateHistoricalOddity(oddity));
  }

  for (const trail of input.trails) {
    errors.push(...validateResearchTrail(trail));
  }

  for (const milestone of input.milestones) {
    errors.push(...validateEvolutionMilestone(milestone));
  }

  for (const relationship of input.relationships) {
    errors.push(...validateEvolutionRelationship(relationship));
  }

  return {
    valid: errors.length === 0,
    errors,
    checkedAt: 'knowledge_evolution_input_composition',
  };
}

// ---------------------------------------------------------------------------
// Knowledge Evolution Trace Validation
// ---------------------------------------------------------------------------

/**
 * Validates a knowledge evolution trace against canonical invariants.
 * Pure function. No side effects.
 */
export function validateKnowledgeEvolutionTrace(
  trace: KnowledgeEvolutionTrace,
): KnowledgeEvolutionTraceValidationResult {
  const errors: KnowledgeEvolutionValidationError[] = [];

  if (!trace.traceId || trace.traceId.trim() === '') {
    errors.push({
      code: KNOWLEDGE_EVOLUTION_VALIDATION_CODES.EVOLUTION_INVALID_TRACE,
      message: 'Knowledge evolution trace is missing a trace ID.',
      field: 'traceId',
    });
  }

  if (trace.deterministic !== true) {
    errors.push({
      code: KNOWLEDGE_EVOLUTION_VALIDATION_CODES.EVOLUTION_INVALID_TRACE,
      message: 'Knowledge evolution trace must declare deterministic: true.',
      field: 'deterministic',
    });
  }

  if (trace.randomUsed !== false) {
    errors.push({
      code: KNOWLEDGE_EVOLUTION_VALIDATION_CODES.EVOLUTION_INVALID_TRACE,
      message: 'Knowledge evolution trace must declare randomUsed: false.',
      field: 'randomUsed',
    });
  }

  if (trace.timeDependency !== false) {
    errors.push({
      code: KNOWLEDGE_EVOLUTION_VALIDATION_CODES.EVOLUTION_INVALID_TRACE,
      message: 'Knowledge evolution trace must declare timeDependency: false.',
      field: 'timeDependency',
    });
  }

  return {
    valid: errors.length === 0,
    errors,
    checkedAt: 'knowledge_evolution_trace_composition',
  };
}

// ---------------------------------------------------------------------------
// Curiosity Artifact With Knowledge Evolution Validation
// ---------------------------------------------------------------------------

/**
 * Validates a curiosity artifact with knowledge evolution against canonical invariants.
 * Pure function. No side effects.
 */
export function validateCuriosityArtifactWithKnowledgeEvolution(
  artifact: CuriosityArtifactWithKnowledgeEvolution,
): CuriosityArtifactWithKnowledgeEvolutionValidationResult {
  const errors: KnowledgeEvolutionValidationError[] = [];

  if (!artifact.curiosityId || artifact.curiosityId.trim() === '') {
    errors.push({
      code: KNOWLEDGE_EVOLUTION_VALIDATION_CODES.EVOLUTION_MISSING_CURIOSITY_REFERENCE,
      message: 'Curiosity artifact is missing a curiosity ID.',
      field: 'curiosityId',
    });
  }

  if (!artifact.title || artifact.title.trim() === '') {
    errors.push({
      code: KNOWLEDGE_EVOLUTION_VALIDATION_CODES.EVOLUTION_MISSING_TITLE,
      message: 'Curiosity artifact is missing a title.',
      field: 'title',
    });
  }

  if (!artifact.profiles || artifact.profiles.length === 0) {
    errors.push({
      code: KNOWLEDGE_EVOLUTION_VALIDATION_CODES.EVOLUTION_EMPTY_REGISTRY,
      message: 'Curiosity artifact has no profiles.',
      field: 'profiles',
    });
  } else {
    for (const profile of artifact.profiles) {
      errors.push(...validateKnowledgeEvolutionProfile(profile));
    }
  }

  if (!artifact.provenance) {
    errors.push({
      code: KNOWLEDGE_EVOLUTION_VALIDATION_CODES.EVOLUTION_MISSING_PROVENANCE,
      message: 'Curiosity artifact is missing provenance.',
      field: 'provenance',
    });
  } else {
    if (!artifact.provenance.provider || artifact.provenance.provider.trim() === '') {
      errors.push({
        code: KNOWLEDGE_EVOLUTION_VALIDATION_CODES.EVOLUTION_MISSING_PROVIDER,
        message: 'Curiosity artifact provenance is missing a provider.',
        field: 'provenance.provider',
      });
    }

    if (!artifact.provenance.rationale || artifact.provenance.rationale.trim() === '') {
      errors.push({
        code: KNOWLEDGE_EVOLUTION_VALIDATION_CODES.EVOLUTION_MISSING_RATIONALE,
        message: 'Curiosity artifact provenance is missing a rationale.',
        field: 'provenance.rationale',
      });
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    checkedAt: 'curiosity_artifact_with_knowledge_evolution_composition',
  };
}
