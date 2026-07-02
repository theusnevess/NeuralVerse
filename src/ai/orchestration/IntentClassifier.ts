/**
 * Intent Classifier — Educational Intent Detection
 *
 * Determines which educational capabilities are needed from the user's request.
 * Classification is deterministic — based on keyword patterns, not LLM.
 */

// ============================================================================
// INTENT TYPES
// ============================================================================

export const CANONICAL_INTENTS = [
  'explain',
  'compare',
  'solve',
  'visualize',
  'practice',
  'research',
  'apply',
  'review',
  'plan-learning',
  'build-laboratory',
  'assess-knowledge',
  'correct-misconceptions'
] as const;

export type EducationalIntent = (typeof CANONICAL_INTENTS)[number];

export interface IntentClassification {
  readonly intents: readonly EducationalIntent[];
  readonly confidence: number;
  readonly primaryIntent: EducationalIntent;
  readonly reasoning: string;
}

// ============================================================================
// INTENT KEYWORDS
// ============================================================================

const INTENT_KEYWORDS: Record<EducationalIntent, readonly string[]> = {
  'explain': [
    'explain', 'what is', 'what are', 'define', 'definition', 'describe',
    'tell me about', 'how does', 'how do', 'how is', 'how are',
    'meaning', 'concept', 'idea', 'understand'
  ],
  'compare': [
    'compare', 'vs', 'versus', 'difference', 'differences', 'contrast',
    'similarities', 'alike', 'different', 'better', 'worse',
    'advantages', 'disadvantages', 'pros', 'cons'
  ],
  'solve': [
    'solve', 'calculate', 'compute', 'find', 'determine',
    'derive', 'prove', 'proof', 'equation', 'formula',
    'math', 'mathematical', 'algorithm'
  ],
  'visualize': [
    'visualize', 'diagram', 'chart', 'graph', 'illustration',
    'picture', 'image', 'draw', 'show', 'depict', 'represent',
    'flowchart', 'mind map', 'visualization'
  ],
  'practice': [
    'practice', 'exercise', 'try', 'implement', 'code',
    'hands-on', 'lab', 'experiment', 'simulate', 'build',
    'create', 'make', 'write'
  ],
  'research': [
    'research', 'paper', 'study', 'evidence', 'citation',
    'reference', 'publication', 'journal', 'findings', 'discoveries',
    'state of the art', 'recent', 'latest', 'breakthrough'
  ],
  'apply': [
    'apply', 'application', 'use case', 'real-world', 'production',
    'industry', 'practical', 'implement', 'deploy', 'integrate',
    'how is this used', 'where is this used'
  ],
  'review': [
    'review', 'summarize', 'recap', 'overview', 'revise',
    'refresh', 'remind', 'recall', '复习', 'go over'
  ],
  'plan-learning': [
    'plan', 'roadmap', 'learning path', 'curriculum', 'sequence',
    'order', 'prerequisites', 'next steps', 'what should i learn',
    'study plan', 'learning plan'
  ],
  'build-laboratory': [
    'laboratory', 'lab', 'experiment', 'simulation', 'sandbox',
    'interactive', 'playground', 'demo', 'prototype'
  ],
  'assess-knowledge': [
    'quiz', 'test', 'assessment', 'exam', 'question',
    'check understanding', 'evaluate', 'measure', 'verify',
    'flashcard', 'practice test'
  ],
  'correct-misconceptions': [
    'misconception', 'misunderstanding', 'wrong', 'incorrect',
    'actually', 'in fact', 'common error', 'confused with',
    'not the same', 'different from'
  ]
};

// ============================================================================
// CLASSIFIER
// ============================================================================

export function classifyIntent(query: string): IntentClassification {
  const lowerQuery = query.toLowerCase();
  const matchedIntents: { intent: EducationalIntent; score: number }[] = [];

  for (const [intent, keywords] of Object.entries(INTENT_KEYWORDS)) {
    let score = 0;
    for (const keyword of keywords) {
      if (lowerQuery.includes(keyword)) {
        score += 1;
        // Boost score for exact matches at start of query
        if (lowerQuery.startsWith(keyword)) {
          score += 2;
        }
      }
    }
    if (score > 0) {
      matchedIntents.push({ intent: intent as EducationalIntent, score });
    }
  }

  // Sort by score descending
  matchedIntents.sort((a, b) => b.score - a.score);

  // Determine primary intent
  const primaryIntent = matchedIntents.length > 0
    ? matchedIntents[0].intent
    : 'explain';

  // Get all intents with score > 0
  const intents = matchedIntents
    .filter(m => m.score > 0)
    .map(m => m.intent) as EducationalIntent[];

  // If no intents matched, default to explain
  const finalIntents: EducationalIntent[] = intents.length > 0 ? intents : ['explain'];

  // Calculate confidence
  const maxScore = matchedIntents.length > 0 ? matchedIntents[0].score : 0;
  const confidence = Math.min(1, maxScore / 3);

  // Generate reasoning
  const reasoning = generateReasoning(finalIntents, lowerQuery);

  return {
    intents: finalIntents,
    confidence,
    primaryIntent,
    reasoning
  };
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function generateReasoning(intents: readonly EducationalIntent[], query: string): string {
  if (intents.length === 1) {
    return `Query matches ${intents[0]} intent based on keyword patterns.`;
  }
  return `Query matches ${intents.length} intents: ${intents.join(', ')}.`;
}

export function hasIntent(classification: IntentClassification, intent: EducationalIntent): boolean {
  return classification.intents.includes(intent);
}

export function getPrimaryIntent(classification: IntentClassification): EducationalIntent {
  return classification.primaryIntent;
}
