/**
 * Educational Confidence — Confidence Calculation
 *
 * Calculates confidence based on evidence completeness and quality.
 * Confidence is deterministic — computed from evidence, not generated.
 */

import type { EvidenceBundle } from './EvidenceAggregator.ts';

// ============================================================================
// CONFIDENCE TYPES
// ============================================================================

export interface ConfidenceResult {
  readonly overall: ConfidenceLevel;
  readonly evidenceCompleteness: number;
  readonly retrievalCompleteness: number;
  readonly researchAvailability: boolean;
  readonly ambiguityLevel: number;
  readonly educationalCoverage: number;
  readonly factors: readonly ConfidenceFactor[];
}

export const CANONICAL_CONFIDENCE_LEVELS = [
  'high',
  'medium',
  'low',
  'insufficient'
] as const;

export type ConfidenceLevel = (typeof CANONICAL_CONFIDENCE_LEVELS)[number];

export interface ConfidenceFactor {
  readonly name: string;
  readonly score: number;
  readonly weight: number;
  readonly description: string;
}

// ============================================================================
// CONFIDENCE CALCULATOR
// ============================================================================

export function calculateConfidence(
  evidence: EvidenceBundle,
  query: string
): ConfidenceResult {
  const factors: ConfidenceFactor[] = [];

  // 1. Evidence completeness
  const evidenceScore = calculateEvidenceCompleteness(evidence);
  factors.push({
    name: 'evidence-completeness',
    score: evidenceScore,
    weight: 0.3,
    description: `${evidence.agentContributions.length} agent contributions`
  });

  // 2. Retrieval completeness
  const retrievalScore = calculateRetrievalCompleteness(evidence);
  factors.push({
    name: 'retrieval-completeness',
    score: retrievalScore,
    weight: 0.2,
    description: `${evidence.relatedConcepts.length} related concepts`
  });

  // 3. Research availability
  const researchScore = evidence.researchEvidence.length > 0 ? 1 : 0;
  factors.push({
    name: 'research-availability',
    score: researchScore,
    weight: 0.15,
    description: researchScore > 0 ? 'Research evidence available' : 'No research evidence'
  });

  // 4. Ambiguity level (inverted to represent clarity)
  const ambiguityScore = calculateAmbiguity(query);
  const clarityScore = 1 - ambiguityScore;
  factors.push({
    name: 'clarity',
    score: clarityScore,
    weight: 0.15,
    description: clarityScore > 0.5 ? 'Query is clear' : 'Query is ambiguous'
  });

  // 5. Educational coverage
  const coverageScore = calculateEducationalCoverage(evidence);
  factors.push({
    name: 'educational-coverage',
    score: coverageScore,
    weight: 0.2,
    description: `${coverageScore * 100}% educational coverage`
  });

  // Calculate weighted score
  const weightedScore = factors.reduce((sum, f) => sum + f.score * f.weight, 0);

  // Determine confidence level
  const overall = determineConfidenceLevel(weightedScore);

  return {
    overall,
    evidenceCompleteness: evidenceScore,
    retrievalCompleteness: retrievalScore,
    researchAvailability: researchScore > 0,
    ambiguityLevel: 1 - ambiguityScore,
    educationalCoverage: coverageScore,
    factors
  };
}

// ============================================================================
// CALCULATION FUNCTIONS
// ============================================================================

function calculateEvidenceCompleteness(evidence: EvidenceBundle): number {
  let score = 0;
  if (evidence.conceptDefinitions.length > 0) score += 0.35;
  if (evidence.dependencies.length > 0) score += 0.15;
  if (evidence.applications.length > 0) score += 0.15;
  if (evidence.examples.length > 0) score += 0.15;
  if (evidence.relatedConcepts.length > 0) score += 0.1;
  if (evidence.assessments.length > 0) score += 0.1;
  return Math.min(1, score);
}

function calculateRetrievalCompleteness(evidence: EvidenceBundle): number {
  const totalConcepts = evidence.relatedConcepts.length;
  if (totalConcepts === 0) return 0;
  if (totalConcepts >= 5) return 1;
  return totalConcepts / 5;
}

function calculateAmbiguity(query: string): number {
  const words = query.split(/\s+/);
  const ambiguousPatterns = [
    /\b(thing|stuff|something|it|this|that)\b/i,
    /\?{2,}/
  ];

  let ambiguityScore = 0;

  // Very short queries are more ambiguous (less than 3 words)
  if (words.length < 3) ambiguityScore += 0.3;

  // Check for ambiguous patterns
  for (const pattern of ambiguousPatterns) {
    if (pattern.test(query)) {
      ambiguityScore += 0.2;
    }
  }

  // Educational queries are generally clear
  const educationalPatterns = [
    /^(explain|describe|define|compare|show|give|tell|how|what|why)/i
  ];
  for (const pattern of educationalPatterns) {
    if (pattern.test(query)) {
      ambiguityScore = Math.max(0, ambiguityScore - 0.2);
    }
  }

  return Math.min(1, ambiguityScore);
}

function calculateEducationalCoverage(evidence: EvidenceBundle): number {
  let coverage = 0;
  const total = 7; // Number of coverage dimensions

  if (evidence.conceptDefinitions.length > 0) coverage++;
  if (evidence.examples.length > 0) coverage++;
  if (evidence.visualSuggestions.length > 0) coverage++;
  if (evidence.laboratories.length > 0) coverage++;
  if (evidence.assessments.length > 0) coverage++;
  if (evidence.researchEvidence.length > 0) coverage++;
  if (evidence.applications.length > 0) coverage++;

  return coverage / total;
}

function determineConfidenceLevel(score: number): ConfidenceLevel {
  if (score >= 0.75) return 'high';
  if (score >= 0.5) return 'medium';
  if (score >= 0.25) return 'low';
  return 'insufficient';
}

// ============================================================================
// UTILITIES
// ============================================================================

export function shouldAskClarification(confidence: ConfidenceResult): boolean {
  // Only ask for clarification when confidence is truly insufficient
  // Low confidence is acceptable for proceeding with generation
  return confidence.overall === 'insufficient';
}

export function getConfidenceSummary(confidence: ConfidenceResult): string {
  return [
    `Overall: ${confidence.overall}`,
    `Evidence: ${Math.round(confidence.evidenceCompleteness * 100)}%`,
    `Retrieval: ${Math.round(confidence.retrievalCompleteness * 100)}%`,
    `Research: ${confidence.researchAvailability ? 'Available' : 'None'}`,
    `Coverage: ${Math.round(confidence.educationalCoverage * 100)}%`
  ].join(' | ');
}
