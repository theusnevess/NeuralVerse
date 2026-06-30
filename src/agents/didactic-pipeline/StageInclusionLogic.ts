/**
 * NV-1300-D1-OPT-01 — Stage Inclusion Logic
 *
 * Pure deterministic functions that decide whether each canonical
 * pipeline stage should be included, omitted, blocked, or marked invalid.
 *
 * Rules:
 * - Include a stage when matching governed resources exist.
 * - Mark a stage as omitted when no valid resource exists.
 * - Never fabricate missing resources.
 * - Never fill missing sections with placeholder educational claims.
 * - Every omission includes an explicit deterministic reason.
 *
 * Deterministic. No Math.random. No Date.now. No global mutable state.
 */

import type {
  DidacticLessonInput,
  DidacticPipelineStageName,
  DidacticStageStatus,
  DidacticStageOmissionReason,
  DidacticResourceRef,
} from './DidacticAgentContract.ts';

// ---------------------------------------------------------------------------
// Stage Definitions — resource requirements for each canonical stage
// ---------------------------------------------------------------------------

interface StageResourceRule {
  readonly stageId: DidacticPipelineStageName;
  readonly label: string;
  readonly description: string;
  readonly requiredResourceType: DidacticResourceRef['resourceType'] | null;
  readonly fallbackCondition?: (input: DidacticLessonInput) => boolean;
  readonly fallbackOmissionReason?: string;
}

const STAGE_RESOURCE_RULES: readonly StageResourceRule[] = [
  {
    stageId: 'motivation',
    label: 'Motivation',
    description: 'Explain why this concept matters and what problem it solves.',
    requiredResourceType: null,
    fallbackCondition: () => false,
    fallbackOmissionReason: undefined,
  },
  {
    stageId: 'context',
    label: 'Context',
    description: 'Position the concept within the curriculum and broader field.',
    requiredResourceType: null,
  },
  {
    stageId: 'intuition',
    label: 'Intuition',
    description: 'Build a mental model before formal definitions.',
    requiredResourceType: null,
  },
  {
    stageId: 'concept_introduction',
    label: 'Concept Introduction',
    description: 'Introduce the core concept with governed definitions.',
    requiredResourceType: 'concept',
    fallbackOmissionReason: 'No concept resource available for concept_introduction.',
  },
  {
    stageId: 'guided_explanation',
    label: 'Guided Explanation',
    description: 'Deliver a structured explanation of the concept.',
    requiredResourceType: null,
  },
  {
    stageId: 'visual_demonstration',
    label: 'Visual Demonstration',
    description: 'Provide spatial or parametric visual understanding.',
    requiredResourceType: 'visualization',
    fallbackOmissionReason: 'No visualization resource available for visual_demonstration.',
  },
  {
    stageId: 'mathematical_foundation',
    label: 'Mathematical Foundation',
    description: 'Present formal definitions, formulas, and derivations.',
    requiredResourceType: null,
    fallbackCondition: (input) => input.difficulty === 'essentials',
    fallbackOmissionReason: 'Mathematical foundation omitted for essentials difficulty.',
  },
  {
    stageId: 'practical_example',
    label: 'Practical Example',
    description: 'Demonstrate practical application with concrete examples.',
    requiredResourceType: null,
  },
  {
    stageId: 'interactive_laboratory',
    label: 'Interactive Laboratory',
    description: 'Provide interactive or guided experimentation.',
    requiredResourceType: 'laboratory',
    fallbackOmissionReason: 'No laboratory resource available for interactive_laboratory.',
  },
  {
    stageId: 'common_misconceptions',
    label: 'Common Misconceptions',
    description: 'Proactively address known misunderstandings.',
    requiredResourceType: null,
  },
  {
    stageId: 'assessment',
    label: 'Assessment',
    description: 'Provide comprehension verification opportunities.',
    requiredResourceType: null,
  },
  {
    stageId: 'summary',
    label: 'Summary',
    description: 'Synthesize key takeaways and reinforce core ideas.',
    requiredResourceType: null,
  },
  {
    stageId: 'forward_connections',
    label: 'Forward Connections',
    description: 'Link to downstream concepts and next learning steps.',
    requiredResourceType: null,
  },
] as const;

// ---------------------------------------------------------------------------
// Pure deterministic inclusion logic
// ---------------------------------------------------------------------------

function _hasResource(
  resources: DidacticLessonInput['availableResources'],
  type: DidacticResourceRef['resourceType'],
): boolean {
  switch (type) {
    case 'concept':
      return resources.concepts.length > 0;
    case 'visualization':
      return resources.visualizations.length > 0;
    case 'laboratory':
      return resources.laboratories.length > 0;
    case 'artifact':
      return resources.artifacts.length > 0;
    case 'shared_knowledge':
      return resources.sharedKnowledge.length > 0;
    default:
      return false;
  }
}

function _findFirstResource(
  resources: DidacticLessonInput['availableResources'],
  type: DidacticResourceRef['resourceType'],
): DidacticResourceRef | null {
  const list = type === 'concept' ? resources.concepts
    : type === 'visualization' ? resources.visualizations
    : type === 'laboratory' ? resources.laboratories
    : type === 'artifact' ? resources.artifacts
    : resources.sharedKnowledge;

  return list.length > 0 ? list[0] : null;
}

export function determineStageStatus(
  stageId: DidacticPipelineStageName,
  input: DidacticLessonInput,
): {
  status: DidacticStageStatus;
  omissionReason: DidacticStageOmissionReason | null;
  resourceRef: DidacticResourceRef | null;
} {
  const rule = STAGE_RESOURCE_RULES.find((r) => r.stageId === stageId);
  if (!rule) {
    return {
      status: 'invalid',
      omissionReason: {
        stageId,
        reason: `Non-canonical stage: ${stageId}`,
        severity: 'error',
      },
      resourceRef: null,
    };
  }

  // Check fallback condition first (e.g., difficulty-based omission)
  if (rule.fallbackCondition && rule.fallbackCondition(input)) {
    return {
      status: 'omitted',
      omissionReason: {
        stageId,
        reason: rule.fallbackOmissionReason || `Omitted by deterministic rule for ${stageId}.`,
        severity: 'info',
      },
      resourceRef: null,
    };
  }

  // If no required resource type, always include
  if (rule.requiredResourceType === null) {
    return {
      status: 'included',
      omissionReason: null,
      resourceRef: null,
    };
  }

  // Check if the required resource type is available
  if (_hasResource(input.availableResources, rule.requiredResourceType)) {
    return {
      status: 'included',
      omissionReason: null,
      resourceRef: _findFirstResource(input.availableResources, rule.requiredResourceType),
    };
  }

  // Required resource missing — omit with explicit reason
  return {
    status: 'omitted',
    omissionReason: {
      stageId,
      reason: rule.fallbackOmissionReason || `No ${rule.requiredResourceType} resource available for ${stageId}.`,
      severity: 'info',
    },
    resourceRef: null,
  };
}

export function buildAllStageStatuses(
  input: DidacticLessonInput,
): Array<{
  stageId: DidacticPipelineStageName;
  status: DidacticStageStatus;
  omissionReason: DidacticStageOmissionReason | null;
  resourceRef: DidacticResourceRef | null;
}> {
  return STAGE_RESOURCE_RULES.map((rule) => {
    const result = determineStageStatus(rule.stageId, input);
    return {
      stageId: rule.stageId,
      status: result.status,
      omissionReason: result.omissionReason,
      resourceRef: result.resourceRef,
    };
  });
}

export { STAGE_RESOURCE_RULES };
