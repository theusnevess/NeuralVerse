/**
 * EducationalPlan — Dynamic planning object
 *
 * Tracks the LLM's educational plan as it evolves through iterations.
 * Updated after each agent tool call.
 */

export interface EducationalPlan {
  learningGoal: string;
  subGoals: SubGoal[];
  requiredEvidence: EvidenceRequirement[];
  completedEvidence: CompletedEvidence[];
  remainingEvidence: string[];
  recommendedNextQuestion: string[];
  recommendedArtifacts: string[];
  estimatedComplexity: 'beginner' | 'intermediate' | 'advanced' | 'research';
  estimatedReadingTime: number;
  confidence: number;
  iteration: number;
  maxIterations: number;
  timeline: TimelineEntry[];
  createdAt: number;
  updatedAt: number;
}

export interface SubGoal {
  id: string;
  description: string;
  status: 'pending' | 'in_progress' | 'completed' | 'skipped';
  requiredTools: string[];
  completedTools: string[];
}

export interface EvidenceRequirement {
  toolName: string;
  agentId: string;
  reason: string;
  status: 'pending' | 'collected' | 'skipped';
  evidenceId?: string;
}

export interface CompletedEvidence {
  toolName: string;
  agentId: string;
  summary: string;
  confidence: string;
  collectedAt: number;
}

export interface TimelineEntry {
  id: string;
  type: 'tool_call' | 'tool_result' | 'planning' | 'synthesizing' | 'complete';
  agentId?: string;
  toolName?: string;
  label: string;
  durationMs?: number;
  status: 'running' | 'completed' | 'error';
  timestamp: number;
}

export function createEducationalPlan(learningGoal: string, maxIterations: number = 5): EducationalPlan {
  return {
    learningGoal,
    subGoals: [],
    requiredEvidence: [],
    completedEvidence: [],
    remainingEvidence: [],
    recommendedNextQuestion: [],
    recommendedArtifacts: [],
    estimatedComplexity: 'intermediate',
    estimatedReadingTime: 0,
    confidence: 0,
    iteration: 0,
    maxIterations,
    timeline: [],
    createdAt: Date.now(),
    updatedAt: Date.now()
  };
}

export function updatePlanAfterToolCall(
  plan: EducationalPlan,
  toolName: string,
  agentId: string,
  evidenceSummary: string,
  confidence: string
): EducationalPlan {
  const updated = { ...plan };
  updated.iteration += 1;
  updated.updatedAt = Date.now();

  // Mark evidence as collected
  const reqIndex = updated.requiredEvidence.findIndex(
    r => r.toolName === toolName && r.status === 'pending'
  );
  if (reqIndex >= 0) {
    updated.requiredEvidence[reqIndex] = {
      ...updated.requiredEvidence[reqIndex],
      status: 'collected'
    };
  }

  // Add to completed evidence
  updated.completedEvidence = [
    ...updated.completedEvidence,
    { toolName, agentId, summary: evidenceSummary, confidence, collectedAt: Date.now() }
  ];

  // Update remaining evidence
  updated.remainingEvidence = updated.requiredEvidence
    .filter(r => r.status === 'pending')
    .map(r => r.toolName);

  // Update confidence based on collected evidence
  const highConf = updated.completedEvidence.filter(e => e.confidence === 'high').length;
  const total = updated.completedEvidence.length;
  updated.confidence = total > 0 ? Math.min(1, (highConf * 0.3 + total * 0.1)) : 0;

  // Add timeline entry
  updated.timeline = [
    ...updated.timeline,
    {
      id: `tl_${Date.now()}`,
      type: 'tool_result',
      agentId,
      toolName,
      label: `${agentId} evidence collected`,
      status: 'completed',
      timestamp: Date.now()
    }
  ];

  return updated;
}

export function addTimelineEntry(
  plan: EducationalPlan,
  entry: Omit<TimelineEntry, 'id' | 'timestamp'>
): EducationalPlan {
  return {
    ...plan,
    updatedAt: Date.now(),
    timeline: [
      ...plan.timeline,
      { ...entry, id: `tl_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`, timestamp: Date.now() }
    ]
  };
}
