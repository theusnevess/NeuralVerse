import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  // Intent Classifier
  CANONICAL_INTENTS,
  classifyIntent,
  hasIntent,
  getPrimaryIntent,
  // Agent Selector
  CANONICAL_AGENT_IDS,
  selectAgents,
  getAgentContribution,
  isAgentSelected,
  // Evidence Aggregator
  aggregateEvidence,
  // Confidence
  CANONICAL_CONFIDENCE_LEVELS,
  calculateConfidence,
  shouldAskClarification,
  getConfidenceSummary,
  // Orchestrator
  EducationalOrchestrator,
  getEducationalOrchestrator,
  resetEducationalOrchestrator
} from './index.ts';
import type { IntentClassification } from './IntentClassifier.ts';
import type { AgentSelection } from './AgentSelector.ts';
import type { EvidenceBundle } from './EvidenceAggregator.ts';

// ============================================================================
// INTENT CLASSIFIER TESTS
// ============================================================================

describe('IntentClassifier -- Types', () => {
  it('should have 12 canonical intents', () => {
    assert.equal(CANONICAL_INTENTS.length, 12);
  });
});

describe('IntentClassifier -- Classification', () => {
  it('should classify explain intent', () => {
    const result = classifyIntent('Explain neural networks');
    assert.ok(hasIntent(result, 'explain'));
    assert.equal(result.primaryIntent, 'explain');
  });

  it('should classify compare intent', () => {
    const result = classifyIntent('Compare CNN vs Vision Transformer');
    assert.ok(hasIntent(result, 'compare'));
  });

  it('should classify solve intent', () => {
    const result = classifyIntent('Solve this equation');
    assert.ok(hasIntent(result, 'solve'));
  });

  it('should classify visualize intent', () => {
    const result = classifyIntent('Create a diagram for this concept');
    assert.ok(hasIntent(result, 'visualize'));
  });

  it('should classify practice intent', () => {
    const result = classifyIntent('Give me a practice exercise');
    assert.ok(hasIntent(result, 'practice'));
  });

  it('should classify research intent', () => {
    const result = classifyIntent('What research papers cover this topic?');
    assert.ok(hasIntent(result, 'research'));
  });

  it('should classify apply intent', () => {
    const result = classifyIntent('How is this used in production?');
    assert.ok(hasIntent(result, 'apply'));
  });

  it('should classify review intent', () => {
    const result = classifyIntent('Summarize what I learned');
    assert.ok(hasIntent(result, 'review'));
  });

  it('should classify plan-learning intent', () => {
    const result = classifyIntent('What should I learn next?');
    assert.ok(hasIntent(result, 'plan-learning'));
  });

  it('should classify build-laboratory intent', () => {
    const result = classifyIntent('Create a lab exercise for this');
    assert.ok(hasIntent(result, 'build-laboratory'));
  });

  it('should classify assess-knowledge intent', () => {
    const result = classifyIntent('Generate a quiz for this topic');
    assert.ok(hasIntent(result, 'assess-knowledge'));
  });

  it('should classify correct-misconceptions intent', () => {
    const result = classifyIntent('What are common misconceptions?');
    assert.ok(hasIntent(result, 'correct-misconceptions'));
  });

  it('should handle multiple intents', () => {
    const result = classifyIntent('Compare CNN vs Vision Transformer and explain the differences');
    assert.ok(hasIntent(result, 'compare'));
    assert.ok(hasIntent(result, 'explain'));
  });

  it('should default to explain for unclear queries', () => {
    const result = classifyIntent('hello');
    assert.equal(result.primaryIntent, 'explain');
  });

  it('should generate reasoning', () => {
    const result = classifyIntent('Explain neural networks');
    assert.ok(result.reasoning.length > 0);
  });
});

// ============================================================================
// AGENT SELECTOR TESTS
// ============================================================================

describe('AgentSelector -- Types', () => {
  it('should have 10 canonical agent IDs', () => {
    assert.equal(CANONICAL_AGENT_IDS.length, 10);
  });
});

describe('AgentSelector -- Selection', () => {
  it('should select agents for explain intent', () => {
    const selection = selectAgents(['explain']);
    assert.ok(selection.agents.length > 0);
    assert.ok(isAgentSelected(selection, 'didactic-architecture'));
  });

  it('should select agents for compare intent', () => {
    const selection = selectAgents(['compare']);
    assert.ok(selection.agents.length > 0);
    assert.ok(isAgentSelected(selection, 'obsidian-knowledge-governance'));
  });

  it('should select agents for research intent', () => {
    const selection = selectAgents(['research']);
    assert.ok(selection.agents.length > 0);
    assert.ok(isAgentSelected(selection, 'research-state-of-art'));
  });

  it('should select agents for practice intent', () => {
    const selection = selectAgents(['practice']);
    assert.ok(selection.agents.length > 0);
    assert.ok(isAgentSelected(selection, 'code-simulation-lab'));
  });

  it('should select agents for multiple intents', () => {
    const selection = selectAgents(['explain', 'compare', 'research']);
    assert.ok(selection.agents.length >= 3);
  });

  it('should generate reasoning', () => {
    const selection = selectAgents(['explain']);
    assert.ok(selection.reasoning.length > 0);
  });
});

// ============================================================================
// EVIDENCE AGGREGATOR TESTS
// ============================================================================

describe('EvidenceAggregator -- Aggregation', () => {
  it('should aggregate evidence from agents', () => {
    const selection = selectAgents(['explain']);
    const evidence = aggregateEvidence(selection, {
      userQuery: 'Explain neural networks'
    });

    assert.ok(evidence.agentContributions.length > 0);
    assert.ok(evidence.conceptDefinitions.length > 0);
  });

  it('should calculate completeness', () => {
    const selection = selectAgents(['explain', 'compare', 'research']);
    const evidence = aggregateEvidence(selection, {
      userQuery: 'Compare neural networks vs transformers'
    });

    assert.ok(evidence.completeness > 0);
    assert.ok(evidence.completeness <= 100);
  });

  it('should include research evidence for research intent', () => {
    const selection = selectAgents(['research']);
    const evidence = aggregateEvidence(selection, {
      userQuery: 'What research covers this topic?'
    });

    assert.ok(evidence.researchEvidence.length > 0);
  });

  it('should include applications for apply intent', () => {
    const selection = selectAgents(['apply']);
    const evidence = aggregateEvidence(selection, {
      userQuery: 'How is this used in production?'
    });

    assert.ok(evidence.applications.length > 0);
  });
});

// ============================================================================
// CONFIDENCE TESTS
// ============================================================================

describe('Confidence -- Types', () => {
  it('should have 4 canonical confidence levels', () => {
    assert.equal(CANONICAL_CONFIDENCE_LEVELS.length, 4);
  });
});

describe('Confidence -- Calculation', () => {
  it('should calculate confidence from evidence', () => {
    const selection = selectAgents(['explain']);
    const evidence = aggregateEvidence(selection, {
      userQuery: 'Explain neural networks'
    });

    const confidence = calculateConfidence(evidence, 'Explain neural networks');
    assert.ok(confidence.overall);
    assert.ok(confidence.evidenceCompleteness >= 0);
    assert.ok(confidence.evidenceCompleteness <= 1);
    assert.ok(confidence.factors.length > 0);
  });

  it('should determine clarification need', () => {
    const selection = selectAgents(['explain']);
    const evidence = aggregateEvidence(selection, {
      userQuery: 'Explain neural networks'
    });

    const confidence = calculateConfidence(evidence, 'Explain neural networks');
    const shouldClarify = shouldAskClarification(confidence);
    assert.ok(typeof shouldClarify === 'boolean');
  });

  it('should generate summary', () => {
    const selection = selectAgents(['explain']);
    const evidence = aggregateEvidence(selection, {
      userQuery: 'Explain neural networks'
    });

    const confidence = calculateConfidence(evidence, 'Explain neural networks');
    const summary = getConfidenceSummary(confidence);
    assert.ok(summary.includes('Overall:'));
  });
});

// ============================================================================
// ORCHESTRATOR TESTS
// ============================================================================

describe('EducationalOrchestrator -- Core', () => {
  it('should create orchestrator', () => {
    const orchestrator = new EducationalOrchestrator();
    assert.ok(orchestrator);
  });

  it('should orchestrate a simple request', () => {
    const orchestrator = new EducationalOrchestrator();
    const result = orchestrator.orchestrate({
      query: 'Explain neural networks',
      mode: 'teaching',
      style: 'default',
      currentRoute: '#/learning',
      developerMode: false
    });

    assert.ok(result.requestId);
    assert.ok(result.intent);
    assert.ok(result.agentSelection);
    assert.ok(result.evidence);
    assert.ok(result.confidence);
    assert.ok(result.promptContext);
    assert.ok(result.metadata);
  });

  it('should classify intents correctly', () => {
    const orchestrator = new EducationalOrchestrator();
    const result = orchestrator.orchestrate({
      query: 'Compare CNN vs Vision Transformer',
      mode: 'automatic',
      style: 'default',
      currentRoute: '#/learning',
      developerMode: false
    });

    assert.ok(hasIntent(result.intent, 'compare'));
  });

  it('should select agents automatically', () => {
    const orchestrator = new EducationalOrchestrator();
    const result = orchestrator.orchestrate({
      query: 'Explain neural networks',
      mode: 'teaching',
      style: 'default',
      currentRoute: '#/learning',
      developerMode: false
    });

    assert.ok(result.agentSelection.agents.length > 0);
    assert.ok(isAgentSelected(result.agentSelection, 'didactic-architecture'));
  });

  it('should aggregate evidence', () => {
    const orchestrator = new EducationalOrchestrator();
    const result = orchestrator.orchestrate({
      query: 'Explain neural networks',
      mode: 'teaching',
      style: 'default',
      currentRoute: '#/learning',
      developerMode: false
    });

    assert.ok(result.evidence.agentContributions.length > 0);
    assert.ok(result.evidence.conceptDefinitions.length > 0);
  });

  it('should calculate confidence', () => {
    const orchestrator = new EducationalOrchestrator();
    const result = orchestrator.orchestrate({
      query: 'Explain neural networks',
      mode: 'teaching',
      style: 'default',
      currentRoute: '#/learning',
      developerMode: false
    });

    assert.ok(result.confidence.overall);
    assert.ok(typeof result.shouldClarify === 'boolean');
  });

  it('should build prompt context', () => {
    const orchestrator = new EducationalOrchestrator();
    const result = orchestrator.orchestrate({
      query: 'Explain neural networks',
      mode: 'teaching',
      style: 'default',
      currentRoute: '#/learning',
      currentLesson: 'Neural Networks 101',
      developerMode: false
    });

    assert.ok(result.promptContext.userQuery);
    assert.ok(result.promptContext.intents.length > 0);
    assert.ok(result.promptContext.selectedAgents.length > 0);
    assert.ok(result.promptContext.learningContext.includes('Neural Networks 101'));
  });

  it('should generate metadata', () => {
    const orchestrator = new EducationalOrchestrator();
    const result = orchestrator.orchestrate({
      query: 'Explain neural networks',
      mode: 'teaching',
      style: 'default',
      currentRoute: '#/learning',
      developerMode: false
    });

    assert.ok(result.metadata.orchestrationId);
    assert.ok(result.metadata.timestamp);
    assert.ok(result.metadata.durationMs >= 0);
    assert.ok(result.metadata.intentCount > 0);
    assert.ok(result.metadata.agentCount > 0);
  });

  it('should handle multiple intents', () => {
    const orchestrator = new EducationalOrchestrator();
    const result = orchestrator.orchestrate({
      query: 'Compare CNN vs Vision Transformer and explain the differences',
      mode: 'automatic',
      style: 'default',
      currentRoute: '#/learning',
      developerMode: false
    });

    assert.ok(result.intent.intents.length >= 2);
  });

  it('should leverage conversation context', () => {
    const orchestrator = new EducationalOrchestrator();
    const result = orchestrator.orchestrate({
      query: 'Explain more about that',
      mode: 'teaching',
      style: 'default',
      currentRoute: '#/learning',
      conversationSummary: 'Previously discussed neural networks',
      conversationHistory: ['What is a neural network?', 'A neural network is...'],
      developerMode: false
    });

    assert.ok(result.promptContext.conversationContext.includes('neural networks'));
  });
});

describe('EducationalOrchestrator -- Determinism', () => {
  it('should produce consistent results for same input', () => {
    const orchestrator1 = new EducationalOrchestrator();
    const orchestrator2 = new EducationalOrchestrator();

    const request = {
      query: 'Explain neural networks',
      mode: 'teaching',
      style: 'default',
      currentRoute: '#/learning',
      developerMode: false
    };

    const result1 = orchestrator1.orchestrate(request);
    const result2 = orchestrator2.orchestrate(request);

    assert.equal(result1.intent.primaryIntent, result2.intent.primaryIntent);
    assert.equal(result1.agentSelection.agents.length, result2.agentSelection.agents.length);
    assert.equal(result1.evidence.conceptDefinitions.length, result2.evidence.conceptDefinitions.length);
  });

  it('should not mutate input', () => {
    const orchestrator = new EducationalOrchestrator();
    const request = {
      query: 'Explain neural networks',
      mode: 'teaching',
      style: 'default',
      currentRoute: '#/learning',
      developerMode: false
    };

    orchestrator.orchestrate(request);

    assert.equal(request.query, 'Explain neural networks');
    assert.equal(request.mode, 'teaching');
  });
});

describe('EducationalOrchestrator -- Convenience', () => {
  it('should get default orchestrator', () => {
    resetEducationalOrchestrator();
    const orchestrator = getEducationalOrchestrator();
    assert.ok(orchestrator);
  });

  it('should return same instance', () => {
    resetEducationalOrchestrator();
    const o1 = getEducationalOrchestrator();
    const o2 = getEducationalOrchestrator();
    assert.strictEqual(o1, o2);
  });
});
