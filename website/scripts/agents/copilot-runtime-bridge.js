/**
 * Copilot Runtime Bridge — LLM-Driven Cognitive Orchestrator
 *
 * The LLM is the primary decision maker. The deterministic pipeline
 * exists only as emergency fallback when the LLM is unavailable.
 *
 * Architecture:
 *   User → Conversation Context → LLM → Tool Calls → Agent Evidence
 *   → LLM → (optional more tool calls) → LLM Final Response
 *   → Educational Response Pipeline → UI
 *
 * Deterministic code provides: tool execution, evidence collection,
 * conversation state, and emergency fallback. NOT cognitive decisions.
 */

/* =========================================================
   CONFIGURATION
   ========================================================= */

const BRIDGE_CONFIG_KEY = 'neuralverse.ai.provider';
const BRIDGE_CONFIG_DEFAULT = 'local';
const LOCAL_PROVIDER_URL = 'http://localhost:11434';
const LOCAL_PROVIDER_MODEL = 'qwen3:8b';
const LOCAL_TIMEOUT_MS = 30000;
const AGENTIC_FLAG_KEY = 'neuralverse.ai.agentic.enabled';

// Persistence keys
const STORAGE_KEYS = {
  session: 'neuralverse.ai.conversation.session',
  messages: 'neuralverse.ai.conversation.messages',
  preferences: 'neuralverse.ai.conversation.preferences',
  metadata: 'neuralverse.ai.conversation.metadata',
  learnerModel: 'neuralverse.ai.learner.model'
};

/* =========================================================
   QUARANTINED — Emergency Fallback Only (NOT Production)
   =========================================================

   These functions are QUARANTINED from the production path.
   They are NOT used when the agentic runtime is available.
   They exist ONLY for:
     - Automated tests
     - Explicit developer test mode
     - Emergency fallback when agentic runtime is completely unavailable

   Production path: LLM-driven agentic loop → tool calls → evidence → synthesis
   Emergency path:  keyword classification → static agent map → deterministic response
   ========================================================= */

const QUARANTINED_EMERGENCY_INTENT_KEYWORDS = {
  'explain': ['explain', 'what is', 'what are', 'define', 'definition', 'describe', 'tell me about', 'how does', 'how do', 'concept'],
  'compare': ['compare', 'vs', 'versus', 'difference', 'differences', 'contrast', 'similarities', 'better', 'worse'],
  'solve': ['solve', 'calculate', 'compute', 'find', 'determine', 'derive', 'prove', 'equation', 'formula'],
  'visualize': ['visualize', 'diagram', 'chart', 'graph', 'illustration', 'picture', 'draw', 'show', 'flowchart'],
  'practice': ['practice', 'exercise', 'try', 'implement', 'code', 'hands-on', 'lab', 'experiment', 'build'],
  'research': ['research', 'paper', 'study', 'evidence', 'citation', 'reference', 'publication', 'findings'],
  'apply': ['apply', 'application', 'use case', 'real-world', 'production', 'industry', 'practical', 'deploy'],
  'review': ['review', 'summarize', 'recap', 'overview', 'revise', 'refresh', 'remind'],
  'plan-learning': ['plan', 'roadmap', 'learning path', 'curriculum', 'sequence', 'order', 'prerequisites', 'next steps'],
  'build-laboratory': ['laboratory', 'lab', 'experiment', 'simulation', 'sandbox', 'interactive', 'playground'],
  'assess-knowledge': ['quiz', 'test', 'assessment', 'exam', 'question', 'check understanding', 'evaluate', 'flashcard'],
  'correct-misconceptions': ['misconception', 'misunderstanding', 'wrong', 'incorrect', 'actually', 'common error']
};

function classifyIntentEmergencyFallback(query) {
  const lowerQuery = query.toLowerCase();
  const matchedIntents = [];

  for (const [intent, keywords] of Object.entries(QUARANTINED_EMERGENCY_INTENT_KEYWORDS)) {
    let score = 0;
    for (const keyword of keywords) {
      if (lowerQuery.includes(keyword)) {
        score += 1;
        if (lowerQuery.startsWith(keyword)) score += 2;
      }
    }
    if (score > 0) {
      matchedIntents.push({ intent, score });
    }
  }

  matchedIntents.sort((a, b) => b.score - a.score);

  const primaryIntent = matchedIntents.length > 0 ? matchedIntents[0].intent : 'explain';
  const intents = matchedIntents.filter(m => m.score > 0).map(m => m.intent);
  const finalIntents = intents.length > 0 ? intents : ['explain'];

  return {
    intents: finalIntents,
    confidence: Math.min(1, (matchedIntents[0]?.score || 0) / 3),
    primaryIntent,
    reasoning: `Quarantined emergency fallback: ${finalIntents.length} intent(s): ${finalIntents.join(', ')}`
  };
}

const QUARANTINED_EMERGENCY_INTENT_AGENT_MAP = {
  'explain': ['didactic-architecture', 'obsidian-knowledge-governance'],
  'compare': ['obsidian-knowledge-governance', 'research-state-of-art', 'application-professional-transfer'],
  'solve': ['didactic-architecture', 'code-simulation-lab'],
  'visualize': ['visual-interactive-media', 'didactic-architecture'],
  'practice': ['code-simulation-lab', 'assessment-reinforcement', 'application-professional-transfer'],
  'research': ['research-state-of-art', 'obsidian-knowledge-governance', 'application-professional-transfer'],
  'apply': ['application-professional-transfer', 'code-simulation-lab', 'research-state-of-art'],
  'review': ['curriculum-dependency', 'didactic-architecture', 'obsidian-knowledge-governance'],
  'plan-learning': ['curriculum-dependency', 'didactic-architecture', 'obsidian-knowledge-governance'],
  'build-laboratory': ['code-simulation-lab', 'assessment-reinforcement', 'obsidian-knowledge-governance'],
  'assess-knowledge': ['assessment-reinforcement', 'didactic-architecture', 'obsidian-knowledge-governance'],
  'correct-misconceptions': ['didactic-architecture', 'obsidian-knowledge-governance', 'assessment-reinforcement']
};

function selectAgentsEmergencyFallback(intents) {
  const selectedAgents = new Map();

  for (const intent of intents) {
    const agentIds = QUARANTINED_EMERGENCY_INTENT_AGENT_MAP[intent] || [];
    for (const agentId of agentIds) {
      if (!selectedAgents.has(agentId)) {
        selectedAgents.set(agentId, {
          agentId,
          agentName: formatAgentName(agentId),
          priority: agentIds.indexOf(agentId) + 1
        });
      }
    }
  }

  return [...selectedAgents.values()].sort((a, b) => a.priority - b.priority);
}

function formatAgentName(agentId) {
  return agentId.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
}

/* =========================================================
   EVIDENCE QUALITY GUARD
   =========================================================

   Runtime guard rejecting evidence containing generic placeholder
   strings. If an agent returns weak evidence, it is marked as a
   limitation rather than being presented as real evidence.
   ========================================================= */

const EVIDENCE_PLACEHOLDER_PATTERNS = [
  'Evidence from',
  'Key concept:',
  'This is a fundamental topic',
  'template',
  'placeholder',
  'generic placeholder',
  'fake agent success',
  'simulated intelligence',
  'mock evidence'
];

function validateEvidenceQuality(evidence) {
  if (!evidence || typeof evidence !== 'object') {
    return { valid: false, reason: 'Evidence is null or not an object' };
  }

  const content = evidence.content || '';
  const summary = evidence.summary || '';

  for (const pattern of EVIDENCE_PLACEHOLDER_PATTERNS) {
    const contentHas = content.toLowerCase().includes(pattern.toLowerCase());
    const summaryHas = summary.toLowerCase().includes(pattern.toLowerCase());
    if (contentHas || summaryHas) {
      return {
        valid: false,
        reason: `Evidence contains placeholder pattern: "${pattern}"`
      };
    }
  }

  return { valid: true, reason: null };
}

function enforceEvidenceQuality(evidence) {
  const validation = validateEvidenceQuality(evidence);
  if (!validation.valid) {
    return {
      ...evidence,
      evidenceType: 'limitation',
      confidence: 'none',
      limitations: [...(evidence.limitations || []), `Evidence quality guard: ${validation.reason}`],
      metadata: {
        ...evidence.metadata,
        qualityGuard: true,
        qualityGuardReason: validation.reason,
        originalEvidenceType: evidence.evidenceType
      }
    };
  }
  return evidence;
}

/* =========================================================
   EVIDENCE AGGREGATION (Browser-Compatible)
   Delegates to agent-evidence-adapter.js for real agent evidence.
   Falls back to structured limitation if adapter is unavailable.
   ========================================================= */

function getEvidenceAdapter() {
  if (typeof window !== 'undefined' && window.NeuralVerse?.createAgentEvidenceAdapter) {
    try {
      return window.NeuralVerse.createAgentEvidenceAdapter();
    } catch (e) {
      return null;
    }
  }
  return null;
}

async function aggregateEvidence(selectedAgents, query, context, mode, style) {
  const adapter = getEvidenceAdapter();

  if (!adapter) {
    const contributions = [];
    for (const agent of selectedAgents) {
      contributions.push({
        agentId: agent.agentId,
        agentName: agent.agentName,
        evidenceType: 'limitation',
        summary: `Evidence adapter unavailable for ${agent.agentName}`,
        content: `Evidence adapter module not loaded. Agent ${agent.agentName} could not provide evidence.`,
        confidence: 'none',
        category: 'general',
        limitations: ['Evidence adapter not available on window.NeuralVerse'],
        metadata: { source: 'adapter-unavailable' }
      });
    }
    return {
      conceptDefinitions: [],
      dependencies: [],
      applications: [],
      researchEvidence: [],
      misconceptions: [],
      examples: [],
      laboratories: [],
      visualSuggestions: [],
      assessments: [],
      relatedConcepts: [],
      agentContributions: contributions,
      completeness: 0,
      evidenceMetadata: {
        totalAgents: contributions.length,
        realEvidenceCount: 0,
        limitationCount: contributions.length,
        unavailableAgents: selectedAgents.map(a => a.agentId),
        isRealEvidence: false,
        adapterAvailable: false
      }
    };
  }

  return await adapter.collectEvidence({
    query: query,
    selectedAgents: selectedAgents,
    context: context || {},
    mode: mode,
    style: style
  });
}

/* =========================================================
   CONFIDENCE CALCULATION (Browser-Compatible)
   ========================================================= */

function calculateConfidence(evidence, query) {
  const factors = [];

  // Evidence completeness
  const evidenceScore = Math.min(1, evidence.agentContributions.length / 3);
  factors.push({ name: 'evidence-completeness', score: evidenceScore, weight: 0.3 });

  // Clarity
  const words = query.split(/\s+/);
  const clarityScore = words.length >= 3 ? 1 : 0.5;
  factors.push({ name: 'clarity', score: clarityScore, weight: 0.15 });

  // Coverage
  const coverageScore = evidence.completeness / 100;
  factors.push({ name: 'educational-coverage', score: coverageScore, weight: 0.2 });

  const weightedScore = factors.reduce((sum, f) => sum + f.score * f.weight, 0);

  let overall = 'medium';
  if (weightedScore >= 0.75) overall = 'high';
  else if (weightedScore >= 0.5) overall = 'medium';
  else if (weightedScore >= 0.25) overall = 'low';
  else overall = 'insufficient';

  return {
    overall,
    evidenceCompleteness: evidenceScore,
    retrievalCompleteness: 0,
    researchAvailability: false,
    ambiguityLevel: clarityScore,
    educationalCoverage: coverageScore,
    factors,
    shouldClarify: overall === 'insufficient'
  };
}

/* =========================================================
   MOCK PROVIDER — Test/Fallback Only
   =========================================================

   This provider is used ONLY for testing and emergency fallback.
   It does NOT simulate LLM reasoning or tool calling.
   In production, the real LLM (qwen3:8b via Ollama) handles all decisions.
   ========================================================= */

async function mockProviderComplete(query) {
  await new Promise(resolve => setTimeout(resolve, 50 + Math.random() * 100));

  return {
    content: `I understand your question about "${query}". To provide a thorough educational response, I would need to consult my knowledge agents. However, the local LLM is currently unavailable. Please ensure Ollama is running with the qwen3:8b model loaded.`,
    model: 'mock-model',
    provider: 'mock',
    usage: { promptTokens: 150, completionTokens: 200, totalTokens: 350 },
    metadata: {
      requestId: `mock-${Date.now()}`,
      timestamp: new Date().toISOString(),
      latencyMs: 150
    },
    finishReason: 'stop'
  };
}

/* =========================================================
   FEATURE FLAG — Agentic mode defaults to ON
   ========================================================= */

function isAgenticEnabled() {
  try {
    const stored = localStorage.getItem(AGENTIC_FLAG_KEY);
    if (stored === 'false') return false;
    if (stored === 'true') return true;
  } catch {}
  if (typeof window !== 'undefined' && window.NeuralVerse?.aiConfig?.agenticEnabled === false) {
    return false;
  }
  return true;
}

function setAgenticEnabled(enabled) {
  try {
    localStorage.setItem(AGENTIC_FLAG_KEY, enabled ? 'true' : 'false');
  } catch {}
}

/* =========================================================
   MOCK AGENTIC PROVIDER — Emergency Fallback Only
   =========================================================

   This mock does NOT simulate LLM reasoning. It returns a simple
   response indicating the LLM is unavailable. Tool calling and
   agentic behavior are handled exclusively by the real LLM.
   ========================================================= */

async function mockAgenticProvider(messages, options) {
  await new Promise(resolve => setTimeout(resolve, 50 + Math.random() * 100));

  const lastMsg = messages[messages.length - 1];

  // If the last message is a tool result, synthesize from evidence
  if (lastMsg?.role === 'tool') {
    const toolResults = messages.filter(m => m.role === 'tool');
    const summaries = toolResults.map(m => {
      try { return JSON.parse(m.content)?.summary || ''; } catch { return ''; }
    }).filter(Boolean);

    return {
      content: `Based on the evidence collected from ${toolResults.length} agent(s): ${summaries.join('; ')}. Here is my comprehensive answer about the topic.`,
      tool_calls: []
    };
  }

  // No tool calling from mock — return direct response
  // The real LLM would decide whether to call tools
  return {
    content: 'The local LLM is currently unavailable. Please ensure Ollama is running with the qwen3:8b model loaded for full agentic capabilities.',
    tool_calls: []
  };
}

async function localProviderWithTools(messages, options) {
  const url = LOCAL_PROVIDER_URL;
  const model = LOCAL_PROVIDER_MODEL;
  const timeout = LOCAL_TIMEOUT_MS;

  // Detect if this is a follow-up call (has tool results)
  const hasToolResults = messages.some(m => m.role === 'tool');

  // Strip tool_calls from assistant messages (Ollama v0.31.1 doesn't accept them)
  const cleanedMessages = messages.map(m => {
    if (m.role === 'assistant' && m.tool_calls) {
      return { role: 'assistant', content: m.content || '' };
    }
    return { role: m.role, content: m.content || '', ...(m.tool_call_id ? { tool_call_id: m.tool_call_id } : {}) };
  });

  const body = {
    model,
    messages: cleanedMessages,
    stream: false,
    options: { temperature: 0.3, top_p: 0.9, num_ctx: 4096 }
  };

  // Only pass tools on first call (not follow-ups with tool results)
  if (options?.tools && !hasToolResults) {
    body.tools = options.tools;
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(`${url}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) throw new Error(`Ollama returned ${response.status}`);

    const data = await response.json();

    // Normalize Ollama response to standard format
    return {
      content: data.message?.content || '',
      tool_calls: data.message?.tool_calls || [],
      model: data.model || model,
      provider: 'local'
    };
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
}

/* =========================================================
   LOCAL PROVIDER STREAMING (Ollama NDJSON)
   ========================================================= */

async function localProviderStreaming(messages, options, onChunk) {
  const url = LOCAL_PROVIDER_URL;
  const model = LOCAL_PROVIDER_MODEL;
  const timeout = LOCAL_TIMEOUT_MS;

  const hasToolResults = messages.some(m => m.role === 'tool');

  const cleanedMessages = messages.map(m => {
    if (m.role === 'assistant' && m.tool_calls) {
      return { role: 'assistant', content: m.content || '' };
    }
    return { role: m.role, content: m.content || '', ...(m.tool_call_id ? { tool_call_id: m.tool_call_id } : {}) };
  });

  const body = {
    model,
    messages: cleanedMessages,
    stream: true,
    options: { temperature: 0.3, top_p: 0.9, num_ctx: 4096 }
  };

  if (options?.tools && !hasToolResults) {
    body.tools = options.tools;
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(`${url}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) throw new Error(`Ollama returned ${response.status}`);

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';
    let fullContent = '';
    let toolCalls = [];

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (!line.trim()) continue;
        try {
          const chunk = JSON.parse(line);
          if (chunk.message?.content) {
            fullContent += chunk.message.content;
            if (onChunk) onChunk({ type: 'text', content: fullContent, delta: chunk.message.content });
          }
          if (chunk.message?.tool_calls) {
            toolCalls = chunk.message.tool_calls;
          }
          if (chunk.done) {
            // Final chunk
          }
        } catch {}
      }
    }

    return {
      content: fullContent,
      tool_calls: toolCalls,
      model,
      provider: 'local',
      streamed: true
    };
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
}

/* =========================================================
   LOCAL PROVIDER (Browser-Compatible)
   ========================================================= */

/* =========================================================
   EDUCATIONAL BENCHMARK FRAMEWORK
   =========================================================

   Independent evaluation system that measures educational quality.
   Does not modify M1-M10 systems. Only evaluates them.
   ========================================================= */

function createEducationalBenchmark() {
  const metrics = {
    technicalAccuracy: { score: 0, samples: 0, history: [] },
    pedagogicalQuality: { score: 0, samples: 0, history: [] },
    depth: { score: 0, samples: 0, history: [] },
    clarity: { score: 0, samples: 0, history: [] },
    adaptation: { score: 0, samples: 0, history: [] },
    misconceptionHandling: { score: 0, samples: 0, history: [] },
    toolSelection: { score: 0, samples: 0, history: [] },
    researchQuality: { score: 0, samples: 0, history: [] },
    learningContinuity: { score: 0, samples: 0, history: [] },
    responseStructure: { score: 0, samples: 0, history: [] }
  };

  const agentMetrics = {};
  const hallucinationLog = [];
  const benchmarkHistory = [];

  // Evaluate a response against educational criteria
  function evaluateResponse(response, context) {
    const result = {
      timestamp: new Date().toISOString(),
      query: context.query || '',
      scores: {},
      overall: 0,
      hallucinations: [],
      agentUsage: [],
      recommendations: []
    };

    // Technical accuracy
    const technicalScore = evaluateTechnicalAccuracy(response);
    updateMetric('technicalAccuracy', technicalScore);
    result.scores.technicalAccuracy = technicalScore;

    // Pedagogical quality
    const pedagogicalScore = evaluatePedagogicalQuality(response, context);
    updateMetric('pedagogicalQuality', pedagogicalScore);
    result.scores.pedagogicalQuality = pedagogicalScore;

    // Depth
    const depthScore = evaluateDepth(response, context);
    updateMetric('depth', depthScore);
    result.scores.depth = depthScore;

    // Clarity
    const clarityScore = evaluateClarity(response);
    updateMetric('clarity', clarityScore);
    result.scores.clarity = clarityScore;

    // Adaptation
    const adaptationScore = evaluateAdaptation(response, context);
    updateMetric('adaptation', adaptationScore);
    result.scores.adaptation = adaptationScore;

    // Misconception handling
    const misconceptionScore = evaluateMisconceptionHandling(response, context);
    updateMetric('misconceptionHandling', misconceptionScore);
    result.scores.misconceptionHandling = misconceptionScore;

    // Tool selection
    const toolScore = evaluateToolSelection(response, context);
    updateMetric('toolSelection', toolScore);
    result.scores.toolSelection = toolScore;

    // Research quality
    const researchScore = evaluateResearchQuality(response, context);
    updateMetric('researchQuality', researchScore);
    result.scores.researchQuality = researchScore;

    // Learning continuity
    const continuityScore = evaluateLearningContinuity(response, context);
    updateMetric('learningContinuity', continuityScore);
    result.scores.learningContinuity = continuityScore;

    // Response structure
    const structureScore = evaluateResponseStructure(response);
    updateMetric('responseStructure', structureScore);
    result.scores.responseStructure = structureScore;

    // Overall score
    const scores = Object.values(result.scores);
    result.overall = scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;

    // Hallucination detection
    result.hallucinations = detectHallucinations(response, context);

    // Agent usage tracking
    result.agentUsage = context.toolsUsed || [];

    // Store in history
    benchmarkHistory.push(result);
    if (benchmarkHistory.length > 100) benchmarkHistory.shift();

    return result;
  }

  function evaluateTechnicalAccuracy(response, context) {
    const content = (response.content || '').toLowerCase();
    let score = 0.5;
    if (content.includes('correct') || content.includes('accurate')) score += 0.1;
    if (content.includes('approximately') || content.includes('roughly')) score += 0.05;
    if (content.includes('always') || content.includes('never')) score -= 0.1;
    if (response.hallucinations && response.hallucinations.length > 0) score -= 0.2;
    return Math.max(0, Math.min(1, score));
  }

  function evaluatePedagogicalQuality(response, context) {
    const content = (response.content || '').toLowerCase();
    let score = 0.5;
    if (content.includes('for example') || content.includes('such as')) score += 0.1;
    if (content.includes('step by step') || content.includes('first')) score += 0.1;
    if (content.includes('analogy') || content.includes('imagine')) score += 0.1;
    if (content.includes('understand') || content.includes('concept')) score += 0.05;
    if (content.includes('practice') || content.includes('exercise')) score += 0.05;
    return Math.max(0, Math.min(1, score));
  }

  function evaluateDepth(response, context) {
    const content = (response.content || '');
    const wordCount = content.split(/\s+/).length;
    let score = 0.3;
    if (wordCount > 100) score += 0.2;
    if (wordCount > 300) score += 0.2;
    if (wordCount > 500) score += 0.1;
    if (content.includes('mathematic') || content.includes('equation')) score += 0.1;
    if (content.includes('research') || content.includes('study')) score += 0.1;
    return Math.max(0, Math.min(1, score));
  }

  function evaluateClarity(response) {
    const content = (response.content || '');
    let score = 0.5;
    const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const avgLength = sentences.length > 0 ? content.length / sentences.length : 0;
    if (avgLength < 100) score += 0.2;
    if (avgLength > 200) score -= 0.1;
    if (content.includes('**')) score += 0.1;
    if (content.includes('- ') || content.includes('* ')) score += 0.1;
    return Math.max(0, Math.min(1, score));
  }

  function evaluateAdaptation(response, context) {
    let score = 0.5;
    if (context.learnerLevel === 'beginner' && (response.content || '').includes('simple')) score += 0.2;
    if (context.learnerLevel === 'advanced' && (response.content || '').includes('mathematic')) score += 0.2;
    if (context.strategy) score += 0.1;
    return Math.max(0, Math.min(1, score));
  }

  function evaluateMisconceptionHandling(response, context) {
    let score = 0.5;
    if (context.hasMisconception && (response.content || '').includes('misunderstand')) score += 0.2;
    if (context.hasMisconception && (response.content || '').includes('actually')) score += 0.1;
    if ((response.content || '').includes('common mistake')) score += 0.1;
    return Math.max(0, Math.min(1, score));
  }

  function evaluateToolSelection(response, context) {
    let score = 0.5;
    const toolsUsed = context.toolsUsed || [];
    if (toolsUsed.length > 0 && toolsUsed.length <= 3) score += 0.2;
    if (toolsUsed.length > 5) score -= 0.1;
    if (toolsUsed.length === 0 && context.needsTools) score -= 0.2;
    return Math.max(0, Math.min(1, score));
  }

  function evaluateResearchQuality(response, context) {
    let score = 0.5;
    if ((response.content || '').includes('research') || (response.content || '').includes('study')) score += 0.1;
    if ((response.content || '').includes('evidence') || (response.content || '').includes('finding')) score += 0.1;
    if (context.isResearchQuery && (response.content || '').includes('paper')) score += 0.2;
    return Math.max(0, Math.min(1, score));
  }

  function evaluateLearningContinuity(response, context) {
    let score = 0.5;
    if (context.hasPreviousContext) score += 0.2;
    if ((response.content || '').includes('previously') || (response.content || '').includes('earlier')) score += 0.1;
    if ((response.content || '').includes('next step') || (response.content || '').includes('continue')) score += 0.1;
    return Math.max(0, Math.min(1, score));
  }

  function evaluateResponseStructure(response) {
    let score = 0.5;
    const content = (response.content || '');
    if (content.includes('##') || content.includes('**')) score += 0.15;
    if (content.includes('- ') || content.includes('* ')) score += 0.1;
    if (content.includes('```')) score += 0.1;
    if (content.length > 100) score += 0.1;
    if (content.length > 500) score += 0.1;
    return Math.max(0, Math.min(1, score));
  }

  function detectHallucinations(response, context) {
    const hallucinations = [];
    const content = (response.content || '').toLowerCase();
    if (content.includes('according to') && !content.includes('study')) {
      hallucinations.push({ type: 'unsupported_claim', detail: 'Claims attribution without citation' });
    }
    return hallucinations;
  }

  function updateMetric(name, score) {
    const m = metrics[name];
    if (!m) return;
    m.samples += 1;
    m.score = m.score + (score - m.score) / m.samples;
    m.history.push({ score, timestamp: Date.now() });
    if (m.history.length > 50) m.history.shift();
  }

  function getMetrics() {
    const result = {};
    for (const [name, m] of Object.entries(metrics)) {
      result[name] = { score: Math.round(m.score * 100) / 100, samples: m.samples };
    }
    return result;
  }

  function getOverallScore() {
    const scores = Object.values(metrics).map(m => m.score);
    return scores.length > 0 ? Math.round((scores.reduce((a, b) => a + b, 0) / scores.length) * 100) / 100 : 0;
  }

  function getBenchmarkSummary() {
    return {
      overallScore: getOverallScore(),
      totalSamples: Object.values(metrics).reduce((a, m) => a + m.samples, 0),
      metrics: getMetrics(),
      recentEvaluations: benchmarkHistory.slice(-5).map(b => ({
        query: b.query.substring(0, 50),
        overall: Math.round(b.overall * 100),
        hallucinations: b.hallucinations.length
      })),
      hallucinationCount: hallucinationLog.length
    };
  }

  function reset() {
    for (const m of Object.values(metrics)) {
      m.score = 0;
      m.samples = 0;
      m.history = [];
    }
    benchmarkHistory.length = 0;
    hallucinationLog.length = 0;
  }

  return {
    evaluateResponse,
    getMetrics,
    getOverallScore,
    getBenchmarkSummary,
    reset,
    metrics,
    benchmarkHistory
  };
}

/* =========================================================
   STRUCTURED LOGGING
   ========================================================= */

const LOG_LEVELS = { debug: 0, info: 1, warn: 2, error: 3 };
let currentLogLevel = LOG_LEVELS.info;

function log(level, category, message, data) {
  if (LOG_LEVELS[level] < currentLogLevel) return;
  const entry = {
    timestamp: new Date().toISOString(),
    level,
    category,
    message,
    data: data || undefined
  };
  if (level === 'error') {
    console.error(`[NeuralVerse:${category}]`, message, data || '');
  } else if (level === 'warn') {
    console.warn(`[NeuralVerse:${category}]`, message, data || '');
  } else {
    console.log(`[NeuralVerse:${category}]`, message, data || '');
  }
  return entry;
}

/* =========================================================
   PERFORMANCE TRACKER
   ========================================================= */

const perfMarks = new Map();

function perfStart(label) {
  perfMarks.set(label, performance.now());
}

function perfEnd(label) {
  const start = perfMarks.get(label);
  if (start === undefined) return 0;
  const duration = performance.now() - start;
  perfMarks.delete(label);
  return Math.round(duration);
}

function getPerformanceSummary() {
  return {
    marks: perfMarks.size,
    memory: typeof performance !== 'undefined' && performance.memory
      ? { used: Math.round(performance.memory.usedJSHeapSize / 1024 / 1024) + 'MB' }
      : 'unavailable'
  };
}

/* =========================================================
   HEALTH MONITORING
   ========================================================= */

const healthState = {
  provider: { status: 'unknown', lastCheck: null, consecutiveFailures: 0 },
  retrieval: { status: 'unknown', lastDuration: 0, cacheHits: 0, cacheMisses: 0 },
  memory: { status: 'healthy', sessions: 0, messages: 0 },
  streaming: { status: 'idle', activeStreams: 0 },
  errors: { count: 0, lastError: null }
};

function recordHealthEvent(category, event) {
  if (healthState[category]) {
    Object.assign(healthState[category], event);
  }
}

function getHealthDashboard() {
  return {
    provider: { ...healthState.provider },
    retrieval: { ...healthState.retrieval },
    memory: { ...healthState.memory },
    streaming: { ...healthState.streaming },
    errors: { ...healthState.errors },
    performance: getPerformanceSummary(),
    uptime: Math.round((Date.now() - (healthState._startTime || Date.now())) / 1000)
  };
}

/* =========================================================
   RETRY WITH EXPONENTIAL BACKOFF
   ========================================================= */

async function withRetry(fn, options = {}) {
  const { maxRetries = 2, baseDelay = 1000, maxDelay = 8000, retryOn = () => true } = options;
  let lastError;
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      if (attempt < maxRetries && retryOn(error)) {
        const delay = Math.min(maxDelay, baseDelay * Math.pow(2, attempt));
        await new Promise(r => setTimeout(r, delay));
      }
    }
  }
  throw lastError;
}

/* =========================================================
   LOCAL PROVIDER WITH RETRY
   ========================================================= */

async function localProviderComplete(query, mode, config) {
  return withRetry(async () => {
    const url = config?.url || LOCAL_PROVIDER_URL;
    const model = config?.model || LOCAL_PROVIDER_MODEL;
    const timeout = config?.timeout || LOCAL_TIMEOUT_MS;

    const messages = [
      { role: 'system', content: `You are NeuralVerse AI, an expert educational assistant. Mode: ${mode || 'default'}` },
      { role: 'user', content: query }
    ];

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetch(`${url}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model,
          messages,
          stream: false,
          options: { temperature: 0.3, top_p: 0.9, num_ctx: 4096 }
        }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`Ollama returned ${response.status}`);
      }

      const data = await response.json();

      if (!data.message?.content) {
        throw new Error('Empty response from Ollama');
      }

      return {
        content: data.message.content,
        model: data.model || model,
        provider: 'local',
        usage: {
          promptTokens: data.prompt_eval_count || 0,
          completionTokens: data.eval_count || 0,
          totalTokens: (data.prompt_eval_count || 0) + (data.eval_count || 0)
        },
        metadata: {
          requestId: `local-${Date.now()}`,
          timestamp: new Date().toISOString(),
          latencyMs: data.total_duration ? Math.round(data.total_duration / 1000000) : 0
        },
        finishReason: data.done ? 'stop' : 'length'
      };
    } catch (error) {
      clearTimeout(timeoutId);
      throw error;
    }
  }, { maxRetries: 2, baseDelay: 1000 });
}

/* =========================================================
   RESPONSE VALIDATION (Browser-Compatible)
   ========================================================= */

function validateResponse(response) {
  if (!response || !response.content) {
    return { valid: false, code: 'response_empty', message: 'Response is empty' };
  }

  if (response.content.length < 10) {
    return { valid: false, code: 'response_too_short', message: 'Response too short' };
  }

  return { valid: true, code: 'response_valid', message: 'Response is valid' };
}

/* =========================================================
   EDUCATIONAL RESPONSE PIPELINE (Browser-Compatible)
   ========================================================= */

function processEducationalResponse(content, context) {
  const responseType = classifyResponseType(content, context);
  const sections = generateSections(content, responseType, context);
  const cards = generateCards(content, sections, context);
  const actions = generateActions(content, responseType, context);

  return {
    id: `edu-${Date.now()}`,
    type: responseType,
    content,
    sections,
    cards,
    actions,
    metadata: {
      responseType,
      estimatedReadingTime: Math.ceil(content.split(/\s+/).length / 200),
      difficulty: context.currentLesson?.difficulty || 'intermediate',
      mode: context.mode,
      style: context.style,
      route: context.currentRoute,
      createdAt: new Date().toISOString(),
      pipelineVersion: '1.0.0',
      sectionCount: sections.length,
      cardCount: cards.length,
      actionCount: actions.length,
      contentLength: content.length,
      hasMath: /\b(equation|formula|theorem)\b/i.test(content),
      hasCode: /```[\s\S]*?```/g.test(content),
      hasResearch: /\b(study|research|paper)\b/i.test(content),
      hasVisual: /\b(diagram|chart|graph)\b/i.test(content)
    },
    summary: content.split(/[.!?]+/).slice(0, 2).join('. ') + '.',
    nextSteps: ['Explore related concepts', 'Practice with examples'],
    confidence: 'medium'
  };
}

function classifyResponseType(content, context) {
  const lower = content.toLowerCase();
  if (lower.includes('definition') || lower.includes(' is a ')) return 'definition';
  if (lower.includes(' vs ') || lower.includes(' compared to ')) return 'comparison';
  if (lower.includes('used in') || lower.includes('applied')) return 'application';
  if (lower.includes('study') || lower.includes('research')) return 'research';
  if (context.mode === 'research') return 'research';
  if (context.mode === 'practice') return 'practice';
  if (content.length > 500) return 'comprehensive';
  return 'explanation';
}

function generateSections(content, type, context) {
  const sections = [];
  sections.push({ id: `s-${Date.now()}-1`, type: 'explanation', title: 'Explanation', content, priority: 1, expandable: true, defaultExpanded: true });

  const concepts = content.match(/\*\*(.*?)\*\*/g);
  if (concepts && concepts.length > 0) {
    sections.push({ id: `s-${Date.now()}-2`, type: 'key-concepts', title: 'Key Concepts', content: concepts.map(c => c.replace(/\*\*/g, '')).join(', '), priority: 2, expandable: true, defaultExpanded: false });
  }

  if (context.hasMathContent) {
    sections.push({ id: `s-${Date.now()}-3`, type: 'mathematical-insight', title: 'Mathematical Insight', content: 'Mathematical formulations are available for this topic.', priority: 3, expandable: true, defaultExpanded: false });
  }

  sections.push({ id: `s-${Date.now()}-4`, type: 'summary', title: 'Summary', content: content.split(/[.!?]+/).slice(0, 2).join('. ') + '.', priority: 4, expandable: true, defaultExpanded: true });

  return sections;
}

function generateCards(content, sections, context) {
  const cards = [];

  if (content.includes('```')) {
    const codeMatch = content.match(/```[\s\S]*?```/);
    if (codeMatch) {
      cards.push({ id: `c-${Date.now()}-1`, type: 'code', title: 'Code Example', content: codeMatch[0].replace(/```\w*\n?/g, '').trim(), metadata: { priority: 1, category: 'implementation', tags: ['code'], relatedConcepts: [] }, expandable: false });
    }
  }

  return cards;
}

function generateActions(content, type, context) {
  const actions = [];
  actions.push({ id: `a-${Date.now()}-1`, type: 'explain-more', label: 'Explain More', description: 'Get a more detailed explanation', icon: '\u{1F50D}', priority: 1, enabled: true });
  actions.push({ id: `a-${Date.now()}-2`, type: 'simplify', label: 'Simplify', description: 'Get a simpler explanation', icon: '\u{1F4DD}', priority: 2, enabled: true });
  return actions;
}

/* =========================================================
   CONVERSATION MANAGEMENT (Browser-Compatible)
   ========================================================= */

function createConversationManager() {
  let currentSession = null;
  let messages = [];
  let summary = '';
  let memory = { artifacts: [], importantQuestions: [] };

  /* =========================================================
     LEARNER MODEL — Persistent Educational Profile
     =========================================================

     The LearnerModel is a continuously evolving educational profile.
     It is inferred from conversations, not manually configured.
     It persists across sessions via localStorage.
     It is compact and compressed.
     ========================================================= */

  let learnerModel = createEmptyLearnerModel();

  function createEmptyLearnerModel() {
    return {
      version: 1,
      lastUpdated: new Date().toISOString(),
      // Expertise estimates (0-100 scale with confidence)
      estimatedExpertise: { level: 50, confidence: 0.1, evidence: [] },
      mathematicalMaturity: { level: 50, confidence: 0.1, evidence: [] },
      programmingProficiency: { level: 50, confidence: 0.1, evidence: [] },
      // Preferred styles (inferred from interactions)
      preferredExplanationStyle: { value: 'adaptive', confidence: 0.1 },
      preferredAnalogyStyle: { value: 'general', confidence: 0.1 },
      preferredTeachingStrategy: { value: 'adaptive', confidence: 0.1 },
      // Orientation scores (0-100)
      curiosityLevel: { score: 50, confidence: 0.1 },
      abstractionTolerance: { score: 50, confidence: 0.1 },
      engineeringOrientation: { score: 50, confidence: 0.1 },
      researchOrientation: { score: 50, confidence: 0.1 },
      practicalOrientation: { score: 50, confidence: 0.1 },
      // Knowledge tracking
      masteredConcepts: [], // { concept, confidence, lastSeen }
      strugglingConcepts: [], // { concept, confidence, lastSeen }
      recentlyStudiedTopics: [], // { topic, timestamp, depth }
      // Misconception memory
      misconceptionHistory: [], // { misconception, correction, timestamp, resolved }
      // Activity tracking
      completedLaboratories: [], // { lab, timestamp }
      completedQuizzes: [], // { quiz, score, timestamp }
      // Learning goals
      activeLearningGoals: [], // { goal, priority, startedAt }
      // Confidence trends
      confidenceTrends: [], // { timestamp, overallConfidence, evidenceConfidence }
      // Compression
      compressedSummary: '' // Semantic summary of learner state
    };
  }

  function persistLearnerModel() {
    try {
      localStorage.setItem(STORAGE_KEYS.learnerModel, JSON.stringify(learnerModel));
    } catch {}
  }

  function loadLearnerModel() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.learnerModel);
      if (data) {
        const parsed = JSON.parse(data);
        // Merge with defaults to handle schema evolution
        learnerModel = { ...createEmptyLearnerModel(), ...parsed };
      }
    } catch {}
    return learnerModel;
  }

  function getLearnerModel() {
    return { ...learnerModel };
  }

  function updateLearnerModel(updates) {
    // Deep merge updates into learner model
    for (const [key, value] of Object.entries(updates)) {
      if (key === 'version' || key === 'lastUpdated') continue;
      if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
        learnerModel[key] = { ...(learnerModel[key] || {}), ...value };
      } else if (Array.isArray(value)) {
        // For arrays, append unique items
        const existing = learnerModel[key] || [];
        const newItems = value.filter(v => {
          if (typeof v === 'object' && v.concept) {
            return !existing.some(e => e.concept === v.concept);
          }
          if (typeof v === 'object' && v.topic) {
            return !existing.some(e => e.topic === v.topic);
          }
          if (typeof v === 'object' && v.misconception) {
            return !existing.some(e => e.misconception === v.misconception);
          }
          return !existing.includes(v);
        });
        learnerModel[key] = [...existing, ...newItems].slice(-50); // Keep last 50 items
      } else {
        learnerModel[key] = value;
      }
    }
    learnerModel.lastUpdated = new Date().toISOString();
    learnerModel.version = (learnerModel.version || 0) + 1;
    compressLearnerModel();
    persistLearnerModel();
  }

  function compressLearnerModel() {
    // Create a compact semantic summary of the learner
    const parts = [];
    const exp = learnerModel.estimatedExpertise;
    if (exp.confidence > 0.3) {
      parts.push(`Expertise: ${exp.level > 70 ? 'advanced' : exp.level > 40 ? 'intermediate' : 'beginner'} (${Math.round(exp.confidence * 100)}% conf)`);
    }
    if (learnerModel.masteredConcepts.length > 0) {
      parts.push(`Mastered: ${learnerModel.masteredConcepts.slice(-5).map(c => c.concept).join(', ')}`);
    }
    if (learnerModel.strugglingConcepts.length > 0) {
      parts.push(`Struggling: ${learnerModel.strugglingConcepts.slice(-3).map(c => c.concept).join(', ')}`);
    }
    if (learnerModel.activeLearningGoals.length > 0) {
      parts.push(`Goals: ${learnerModel.activeLearningGoals.map(g => g.goal).join(', ')}`);
    }
    if (learnerModel.misconceptionHistory.length > 0) {
      const unresolved = learnerModel.misconceptionHistory.filter(m => !m.resolved);
      if (unresolved.length > 0) {
        parts.push(`Active misconceptions: ${unresolved.slice(-3).map(m => m.misconception).join(', ')}`);
      }
    }
    learnerModel.compressedSummary = parts.join(' | ') || 'New learner, building profile.';
  }

  function getLearnerModelSummary() {
    return learnerModel.compressedSummary || 'No learner data yet.';
  }

  function getLearnerModelForPrompt() {
    // Return a compact version for prompt injection
    const parts = [];
    const exp = learnerModel.estimatedExpertise;
    if (exp.confidence > 0.2) {
      parts.push(`Learner expertise: ${exp.level > 70 ? 'advanced' : exp.level > 40 ? 'intermediate' : 'beginner'}`);
    }
    const math = learnerModel.mathematicalMaturity;
    if (math.confidence > 0.2) {
      parts.push(`Math maturity: ${math.level > 70 ? 'strong' : math.level > 40 ? 'moderate' : 'developing'}`);
    }
    const prog = learnerModel.programmingProficiency;
    if (prog.confidence > 0.2) {
      parts.push(`Programming: ${prog.level > 70 ? 'proficient' : prog.level > 40 ? 'comfortable' : 'learning'}`);
    }
    if (learnerModel.masteredConcepts.length > 0) {
      parts.push(`Known concepts: ${learnerModel.masteredConcepts.slice(-8).map(c => c.concept).join(', ')}`);
    }
    if (learnerModel.strugglingConcepts.length > 0) {
      parts.push(`Needs help with: ${learnerModel.strugglingConcepts.slice(-3).map(c => c.concept).join(', ')}`);
    }
    if (learnerModel.activeLearningGoals.length > 0) {
      parts.push(`Learning goals: ${learnerModel.activeLearningGoals.map(g => g.goal).join(', ')}`);
    }
    const unresolvedMisconceptions = learnerModel.misconceptionHistory.filter(m => !m.resolved);
    if (unresolvedMisconceptions.length > 0) {
      parts.push(`Watch for: ${unresolvedMisconceptions.slice(-3).map(m => m.misconception).join(', ')}`);
    }
    const pref = learnerModel.preferredExplanationStyle;
    if (pref.confidence > 0.3) {
      parts.push(`Preferred style: ${pref.value}`);
    }
    return parts.length > 0 ? parts.join('\n') : null;
  }

  // Educational Reasoning Engine
  const educationalReasoning = createEducationalReasoningEngine();

  // Educational Benchmark
  const benchmark = createEducationalBenchmark();

  function getEducationalReasoning() {
    return educationalReasoning.getState();
  }

  function getEducationalReasoningForPrompt() {
    return educationalReasoning.getStateForPrompt();
  }

  function getEducationalReasoningMetadata() {
    return educationalReasoning.getDeveloperMetadata();
  }

  function getBenchmarkSummary() {
    return benchmark.getBenchmarkSummary();
  }

  function evaluateResponse(response, context) {
    return benchmark.evaluateResponse(response, context);
  }

  // Persistence helpers
  function persistSession() {
    try {
      if (currentSession) {
        localStorage.setItem(STORAGE_KEYS.session, JSON.stringify(currentSession));
      }
    } catch {}
  }

  function persistMessages() {
    try {
      // Only persist message metadata, not full content for privacy
      const safeMessages = messages.map(m => ({
        id: m.id,
        type: m.type,
        timestamp: m.timestamp,
        contentPreview: m.content?.substring(0, 200) || '',
        hasContent: !!m.content
      }));
      localStorage.setItem(STORAGE_KEYS.messages, JSON.stringify(safeMessages));
    } catch {}
  }

  function persistPreferences() {
    try {
      const prefs = {
        mode: currentSession?.mode || 'automatic',
        style: currentSession?.style || 'default',
        developerMode: false
      };
      localStorage.setItem(STORAGE_KEYS.preferences, JSON.stringify(prefs));
    } catch {}
  }

  function persistMetadata() {
    try {
      const meta = {
        sessionId: currentSession?.id || null,
        messageCount: messages.length,
        summary: summary.substring(0, 500),
        lastSaved: new Date().toISOString(),
        memoryArtifacts: memory.artifacts.length,
        memoryQuestions: memory.importantQuestions.length
      };
      localStorage.setItem(STORAGE_KEYS.metadata, JSON.stringify(meta));
    } catch {}
  }

  function persistAll() {
    persistSession();
    persistMessages();
    persistPreferences();
    persistMetadata();
    persistLearnerModel();
  }

  function loadPersistedData() {
    try {
      const sessionData = localStorage.getItem(STORAGE_KEYS.session);
      const messagesData = localStorage.getItem(STORAGE_KEYS.messages);
      const prefsData = localStorage.getItem(STORAGE_KEYS.preferences);
      const metadataData = localStorage.getItem(STORAGE_KEYS.metadata);

      if (sessionData) {
        currentSession = JSON.parse(sessionData);
      }
      if (messagesData) {
        messages = JSON.parse(messagesData);
      }
      if (prefsData) {
        const prefs = JSON.parse(prefsData);
        if (currentSession) {
          currentSession.mode = prefs.mode || currentSession.mode;
          currentSession.style = prefs.style || currentSession.style;
        }
      }
      if (metadataData) {
        const meta = JSON.parse(metadataData);
        summary = meta.summary || '';
      }

      // Load learner model (persists across sessions)
      loadLearnerModel();

      return { session: currentSession, messages, summary };
    } catch {
      return null;
    }
  }

  function clearAll() {
    try {
      localStorage.removeItem(STORAGE_KEYS.session);
      localStorage.removeItem(STORAGE_KEYS.messages);
      localStorage.removeItem(STORAGE_KEYS.preferences);
      localStorage.removeItem(STORAGE_KEYS.metadata);
      localStorage.removeItem(STORAGE_KEYS.learnerModel);
    } catch {}
  }

  return {
    startSession(mode, style) {
      currentSession = {
        id: `session-${Date.now()}`,
        mode: mode || 'automatic',
        style: style || 'default',
        createdAt: new Date().toISOString()
      };
      messages = [];
      summary = '';
      memory = { artifacts: [], importantQuestions: [] };
      // Load existing learner model (persists across sessions)
      loadLearnerModel();
      persistAll();
      return currentSession;
    },

    appendUserMessage(content) {
      const msg = { id: `msg-${Date.now()}-u`, type: 'user', content, timestamp: new Date().toISOString() };
      messages.push(msg);
      persistMessages();
      persistMetadata();
      return msg;
    },

    appendAssistantMessage(content, metadata) {
      const msg = { id: `msg-${Date.now()}-a`, type: 'assistant', content, metadata, timestamp: new Date().toISOString() };
      messages.push(msg);
      persistMessages();
      persistMetadata();
      return msg;
    },

    getMessages() { return [...messages]; },
    getSummary() { return summary; },
    updateSummary(newSummary) {
      summary = newSummary;
      persistMetadata();
    },
    getMemory() { return { ...memory }; },
    addMemoryArtifact(artifact) {
      memory.artifacts.push(artifact);
      persistMetadata();
    },
    addImportantQuestion(question) {
      if (!memory.importantQuestions.includes(question)) {
        memory.importantQuestions.push(question);
        persistMetadata();
      }
    },
    // Learner Model methods
    getLearnerModel,
    updateLearnerModel,
    getLearnerModelSummary,
    getLearnerModelForPrompt,
    // Educational Reasoning Engine methods
    getEducationalReasoning,
    getEducationalReasoningForPrompt,
    getEducationalReasoningMetadata,
    // Benchmark methods
    getBenchmarkSummary,
    evaluateResponse,
    clear() {
      messages = [];
      summary = '';
      memory = { artifacts: [], importantQuestions: [] };
      currentSession = null;
      clearAll();
    },
    getSession() { return currentSession; },
    restore() { return loadPersistedData(); },
    persist() { persistAll(); },
    getStorageSize() {
      let total = 0;
      try {
        for (const key of Object.values(STORAGE_KEYS)) {
          const data = localStorage.getItem(key);
          if (data) total += data.length * 2; // UTF-16
        }
      } catch {}
      return total;
    }
  };
}

/* =========================================================
   BRIDGE ERROR CLASSIFICATION
   ========================================================= */

const ERROR_CODES = {
  runtime_unavailable: 'NeuralVerse AI is running in safe local mode.',
  provider_unavailable: 'The local model is not available right now.',
  validation_failed: 'The response could not be validated.',
  clarification_required: 'I need more context to answer this well.',
  unknown: 'An unexpected error occurred.'
};

function classifyError(error) {
  if (!error) return { code: 'unknown', message: ERROR_CODES.unknown };

  const message = error.message || String(error);

  if (message.includes('ECONNREFUSED') || message.includes('fetch')) {
    return { code: 'provider_unavailable', message: ERROR_CODES.provider_unavailable };
  }

  if (message.includes('timeout') || message.includes('AbortError')) {
    return { code: 'provider_unavailable', message: ERROR_CODES.provider_unavailable };
  }

  if (message.includes('validation')) {
    return { code: 'validation_failed', message: ERROR_CODES.validation_failed };
  }

  return { code: 'unknown', message: ERROR_CODES.unknown };
}

/* =========================================================
   EDUCATIONAL REASONING ENGINE
   =========================================================

   Continuously evaluates whether learning is actually occurring.
   Tracks learning state, cognitive load, misconception risk,
   and educational progress for every concept discussed.
   ========================================================= */

function createEducationalReasoningEngine() {
  let state = createEmptyState();

  function createEmptyState() {
    return {
      version: 1,
      lastUpdated: new Date().toISOString(),
      conceptStates: [], // { concept, state, confidence, lastSeen, attempts }
      cognitiveLoad: { level: 30, signals: [], lastUpdated: null },
      activeMisconceptions: [], // { misconception, correctionCount, lastSeen, strategy }
      teachingDecisions: [], // { decision, reasoning, outcome, timestamp }
      progress: { conceptsIntroduced: 0, conceptsMastered: 0, misconceptionsCorrected: 0, totalInteractions: 0 },
      reflections: [], // { reflection, strategy, outcome, timestamp }
      currentPlan: null,
      compressedSummary: ''
    };
  }

  const LEARNING_STATES = ['not-introduced', 'introduced', 'partially-understood', 'practiced', 'applied', 'mastered'];

  function getLearningState(concept) {
    const existing = state.conceptStates.find(c => c.concept === concept);
    return existing || { concept, state: 'not-introduced', confidence: 0, lastSeen: null, attempts: 0 };
  }

  function updateLearningState(concept, newState, confidence) {
    const existing = state.conceptStates.findIndex(c => c.concept === concept);
    const entry = {
      concept,
      state: newState,
      confidence: confidence || 0.5,
      lastSeen: new Date().toISOString(),
      attempts: (state.conceptStates[existing]?.attempts || 0) + 1
    };
    if (existing >= 0) {
      state.conceptStates[existing] = entry;
    } else {
      state.conceptStates.push(entry);
    }
    state.progress.conceptsIntroduced = state.conceptStates.filter(c => c.state !== 'not-introduced').length;
    state.progress.conceptsMastered = state.conceptStates.filter(c => c.state === 'mastered').length;
    state.lastUpdated = new Date().toISOString();
  }

  function estimateCognitiveLoad(signals) {
    let load = 30;
    const reasons = [];
    if (signals.followUpCount > 3) { load += 20; reasons.push('many follow-ups'); }
    if (signals.simplificationRequests > 1) { load += 25; reasons.push('simplification requested'); }
    if (signals.topicSwitches > 2) { load += 15; reasons.push('topic switching'); }
    if (signals.confusionIndicators > 1) { load += 20; reasons.push('confusion detected'); }
    if (signals.longResponseIgnored) { load += 10; reasons.push('long response ignored'); }
    load = Math.min(100, Math.max(0, load));
    state.cognitiveLoad = { level: load, signals: reasons, lastUpdated: new Date().toISOString() };
    return state.cognitiveLoad;
  }

  function monitorMisconception(concept, correctionNeeded) {
    const existing = state.activeMisconceptions.find(m => m.concept === concept);
    if (existing) {
      existing.correctionCount += 1;
      existing.lastSeen = new Date().toISOString();
      if (existing.correctionCount >= 3) existing.strategy = 'alternative-approach';
    } else {
      state.activeMisconceptions.push({ concept, correctionCount: 1, lastSeen: new Date().toISOString(), strategy: 'standard' });
    }
  }

  function recordTeachingDecision(decision, reasoning, outcome) {
    state.teachingDecisions.push({ decision, reasoning, outcome, timestamp: new Date().toISOString() });
    if (state.teachingDecisions.length > 20) state.teachingDecisions = state.teachingDecisions.slice(-20);
  }

  function recordReflection(reflection, strategy, outcome) {
    state.reflections.push({ reflection, strategy, outcome, timestamp: new Date().toISOString() });
    if (state.reflections.length > 15) state.reflections = state.reflections.slice(-15);
    state.progress.totalInteractions += 1;
  }

  function updatePlan(plan) { state.currentPlan = plan; }
  function getState() { return { ...state }; }

  function compressState() {
    const parts = [];
    const mastered = state.conceptStates.filter(c => c.state === 'mastered');
    const struggling = state.conceptStates.filter(c => c.state === 'partially-understood' || c.state === 'introduced');
    if (mastered.length > 0) parts.push(`Mastered: ${mastered.slice(-5).map(c => c.concept).join(', ')}`);
    if (struggling.length > 0) parts.push(`In progress: ${struggling.slice(-3).map(c => c.concept).join(', ')}`);
    if (state.cognitiveLoad.level > 60) parts.push(`Cognitive load: HIGH (${state.cognitiveLoad.level}%)`);
    if (state.activeMisconceptions.length > 0) parts.push(`Active misconceptions: ${state.activeMisconceptions.length}`);
    if (state.currentPlan) parts.push(`Current plan: ${state.currentPlan.goal || 'active'}`);
    state.compressedSummary = parts.join(' | ') || 'No educational state yet.';
  }

  function getStateForPrompt() { compressState(); return state.compressedSummary; }

  function getDeveloperMetadata() {
    return {
      learningStates: state.conceptStates.slice(-10).map(c => `${c.concept}: ${c.state} (${Math.round(c.confidence * 100)}%)`),
      cognitiveLoad: state.cognitiveLoad,
      activeMisconceptions: state.activeMisconceptions.length,
      recentDecisions: state.teachingDecisions.slice(-3).map(d => d.decision),
      recentReflections: state.reflections.slice(-3).map(r => r.reflection),
      progress: state.progress,
      planGoal: state.currentPlan?.goal || null,
      version: state.version
    };
  }

  return {
    getLearningState, updateLearningState, estimateCognitiveLoad, monitorMisconception,
    recordTeachingDecision, recordReflection, updatePlan, getState, getStateForPrompt,
    getDeveloperMetadata, LEARNING_STATES
  };
}

/* =========================================================
   KNOWLEDGE RETRIEVAL LAYER
   =========================================================

   Transforms evidence collection into retrieval-driven reasoning.
   The LLM receives only the most educationally relevant knowledge,
   tailored to the learner and the current teaching objective.
   ========================================================= */

function createKnowledgeRetrievalLayer() {
  const retrievalCache = new Map();
  const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

  // Retrieval budget defaults
  const BUDGET = {
    maxSources: 6,
    maxConcepts: 8,
    maxExamples: 4,
    maxReferences: 3,
    maxMisconceptions: 3,
    maxLabs: 2,
    maxVisuals: 2,
    maxTotalTokens: 2000 // Approximate token budget for retrieved evidence
  };

  // Evidence source categories with educational priority
  const SOURCE_PRIORITIES = {
    'pedagogy': 10,        // Highest priority - direct teaching value
    'knowledge-structure': 9,
    'dependency': 8,       // Prerequisites are critical
    'practice': 7,         // Hands-on learning
    'assessment': 6,       // Understanding verification
    'application': 5,      // Real-world relevance
    'research': 4,         // Evidence-based
    'visualization': 3,    // Visual learning
    'narrative': 2,        // Engagement
    'engagement': 1        // Curiosity hooks
  };

  function createCacheKey(query, learnerLevel, context) {
    return `${query.substring(0, 50)}:${learnerLevel}:${context?.currentRoute || ''}`;
  }

  function getCachedResult(key) {
    const cached = retrievalCache.get(key);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
      return cached.result;
    }
    retrievalCache.delete(key);
    return null;
  }

  function setCachedResult(key, result) {
    retrievalCache.set(key, { result, timestamp: Date.now() });
    // Evict old entries
    if (retrievalCache.size > 50) {
      const oldest = [...retrievalCache.entries()]
        .sort((a, b) => a[1].timestamp - b[1].timestamp)[0];
      if (oldest) retrievalCache.delete(oldest[0]);
    }
  }

  // Plan what knowledge to retrieve based on query and learner
  function planRetrieval(query, learnerModel, context) {
    const plan = {
      sources: [],
      priorities: {},
      budget: { ...BUDGET },
      reasoning: ''
    };

    const lowerQuery = query.toLowerCase();
    const learnerLevel = learnerModel?.estimatedExpertise?.level || 50;

    // Determine which sources to retrieve based on query intent
    if (lowerQuery.includes('explain') || lowerQuery.includes('what is') || lowerQuery.includes('concept')) {
      plan.sources.push('pedagogy', 'knowledge-structure');
      plan.budget.maxConcepts = 10;
    }
    if (lowerQuery.includes('prerequisite') || lowerQuery.includes('first') || lowerQuery.includes('before')) {
      plan.sources.push('dependency');
      plan.budget.maxConcepts = 6;
    }
    if (lowerQuery.includes('code') || lowerQuery.includes('implement') || lowerQuery.includes('example')) {
      plan.sources.push('practice');
      plan.budget.maxExamples = 6;
    }
    if (lowerQuery.includes('research') || lowerQuery.includes('paper') || lowerQuery.includes('study')) {
      plan.sources.push('research');
      plan.budget.maxReferences = 5;
    }
    if (lowerQuery.includes('apply') || lowerQuery.includes('use case') || lowerQuery.includes('industry')) {
      plan.sources.push('application');
    }
    if (lowerQuery.includes('visual') || lowerQuery.includes('diagram') || lowerQuery.includes('chart')) {
      plan.sources.push('visualization');
      plan.budget.maxVisuals = 4;
    }
    if (lowerQuery.includes('lab') || lowerQuery.includes('exercise') || lowerQuery.includes('practice')) {
      plan.sources.push('practice', 'assessment');
      plan.budget.maxLabs = 4;
    }
    if (lowerQuery.includes('misconception') || lowerQuery.includes('wrong') || lowerQuery.includes('confused')) {
      plan.sources.push('pedagogy');
      plan.budget.maxMisconceptions = 5;
    }

    // Default: retrieve core pedagogical sources
    if (plan.sources.length === 0) {
      plan.sources = ['pedagogy', 'knowledge-structure', 'practice'];
    }

    // Learner-aware budget adjustment
    if (learnerLevel < 40) {
      // Beginner: more examples, fewer references
      plan.budget.maxExamples = Math.min(6, plan.budget.maxExamples + 2);
      plan.budget.maxReferences = Math.max(1, plan.budget.maxReferences - 1);
      plan.budget.maxConcepts = Math.min(10, plan.budget.maxConcepts + 2);
    } else if (learnerLevel > 70) {
      // Advanced: more research, fewer basic examples
      plan.budget.maxReferences = Math.min(5, plan.budget.maxReferences + 2);
      plan.budget.maxExamples = Math.max(1, plan.budget.maxExamples - 1);
    }

    // Build priority map
    for (const source of plan.sources) {
      plan.priorities[source] = SOURCE_PRIORITIES[source] || 5;
    }

    plan.reasoning = `Retrieving ${plan.sources.length} source types for query about "${query.substring(0, 30)}..."`;
    return plan;
  }

  // Rank evidence by educational relevance
  function rankEvidence(evidenceItems, learnerModel, plan) {
    return evidenceItems
      .map(item => {
        let score = SOURCE_PRIORITIES[item.category] || 5;

        // Boost score for learner-relevant content
        if (learnerModel) {
          const mastered = learnerModel.masteredConcepts || [];
          const struggling = learnerModel.strugglingConcepts || [];

          // Boost evidence that addresses struggling concepts
          if (struggling.some(s => item.content?.toLowerCase().includes(s.concept?.toLowerCase()))) {
            score += 3;
          }

          // Slightly boost evidence that builds on mastered concepts
          if (mastered.some(m => item.content?.toLowerCase().includes(m.concept?.toLowerCase()))) {
            score += 1;
          }
        }

        // Boost high-confidence evidence
        if (item.confidence === 'high') score += 2;
        else if (item.confidence === 'medium') score += 1;

        // Boost evidence with more sections (more comprehensive)
        const sectionCount = item.metadata?.sectionCount || 0;
        if (sectionCount > 3) score += 1;

        return { ...item, score };
      })
      .sort((a, b) => b.score - a.score);
  }

  // Ensure diversity in retrieved sources
  function ensureDiversity(rankedItems, plan) {
    const diverse = [];
    const categoryCounts = {};
    const maxPerCategory = 2;

    for (const item of rankedItems) {
      const cat = item.category || 'general';
      if ((categoryCounts[cat] || 0) < maxPerCategory) {
        diverse.push(item);
        categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
      }
    }

    return diverse;
  }

  // Apply retrieval budget
  function applyBudget(diverseItems, plan) {
    const budgeted = {
      concepts: [],
      examples: [],
      references: [],
      misconceptions: [],
      labs: [],
      visuals: [],
      other: []
    };

    for (const item of diverseItems) {
      const cat = item.category || 'general';
      if (cat === 'pedagogy' || cat === 'knowledge-structure') {
        if (budgeted.concepts.length < plan.budget.maxConcepts) budgeted.concepts.push(item);
      } else if (cat === 'practice') {
        if (budgeted.examples.length < plan.budget.maxExamples) budgeted.examples.push(item);
      } else if (cat === 'research') {
        if (budgeted.references.length < plan.budget.maxReferences) budgeted.references.push(item);
      } else if (cat === 'assessment') {
        if (budgeted.labs.length < plan.budget.maxLabs) budgeted.labs.push(item);
      } else if (cat === 'visualization') {
        if (budgeted.visuals.length < plan.budget.maxVisuals) budgeted.visuals.push(item);
      } else {
        if (budgeted.other.length < 3) budgeted.other.push(item);
      }
    }

    return [
      ...budgeted.concepts,
      ...budgeted.examples,
      ...budgeted.references,
      ...budgeted.misconceptions,
      ...budgeted.labs,
      ...budgeted.visuals,
      ...budgeted.other
    ].slice(0, plan.budget.maxSources);
  }

  // Compress evidence for prompt injection
  function compressEvidence(retrievedItems) {
    const compressed = [];
    let totalLength = 0;
    const maxTotalLength = 3000; // Approximate character limit

    for (const item of retrievedItems) {
      const content = item.content || item.summary || '';
      const truncated = content.substring(0, 400);
      if (totalLength + truncated.length > maxTotalLength) break;

      compressed.push({
        agent: item.agentName || item.agentId,
        category: item.category,
        summary: truncated.substring(0, 200),
        confidence: item.confidence,
        score: item.score
      });
      totalLength += truncated.length;
    }

    return compressed;
  }

  // Build retrieval context for prompt injection
  function buildRetrievalContext(compressedEvidence, plan) {
    if (compressedEvidence.length === 0) return null;

    const parts = [];
    parts.push('## Retrieved Knowledge');
    parts.push(`Sources consulted: ${compressedEvidence.length} | Budget: ${plan.budget.maxSources} max`);

    const byCategory = {};
    for (const item of compressedEvidence) {
      const cat = item.category || 'general';
      if (!byCategory[cat]) byCategory[cat] = [];
      byCategory[cat].push(item);
    }

    for (const [category, items] of Object.entries(byCategory)) {
      parts.push(`\n### ${category.charAt(0).toUpperCase() + category.slice(1)}`);
      for (const item of items) {
        parts.push(`- **${item.agent}** (${item.confidence}): ${item.summary}`);
      }
    }

    return parts.join('\n');
  }

  // Main retrieval function
  async function retrieve(query, learnerModel, context, agentAdapter) {
    const startTime = Date.now();

    // Check cache
    const learnerLevel = learnerModel?.estimatedExpertise?.level || 50;
    const cacheKey = createCacheKey(query, learnerLevel, context);
    const cached = getCachedResult(cacheKey);
    if (cached) {
      return { ...cached, fromCache: true };
    }

    // Plan retrieval
    const plan = planRetrieval(query, learnerModel, context);

    // Collect evidence from adapter
    const rawEvidence = await agentAdapter.collectEvidence({
      query,
      selectedAgents: plan.sources.map(s => ({ agentId: getAgentIdForCategory(s) })),
      context,
      mode: context?.mode,
      style: context?.style
    });

    // Flatten evidence items
    const allItems = rawEvidence.agentContributions || [];

    // Rank by educational relevance
    const ranked = rankEvidence(allItems, learnerModel, plan);

    // Ensure diversity
    const diverse = ensureDiversity(ranked, plan);

    // Apply budget
    const budgeted = applyBudget(diverse, plan);

    // Compress for prompt
    const compressed = compressEvidence(budgeted);

    // Build retrieval context
    const retrievalContext = buildRetrievalContext(compressed, plan);

    const durationMs = Date.now() - startTime;

    const result = {
      retrievalContext,
      plan,
      retrievedCount: budgeted.length,
      totalCount: allItems.length,
      compressionRatio: allItems.length > 0 ? budgeted.length / allItems.length : 0,
      durationMs,
      categories: [...new Set(budgeted.map(i => i.category))],
      fromCache: false,
      evidence: rawEvidence
    };

    // Cache result
    setCachedResult(cacheKey, result);

    return result;
  }

  function getAgentIdForCategory(category) {
    const map = {
      'pedagogy': 'didactic-architecture',
      'knowledge-structure': 'obsidian-knowledge-governance',
      'dependency': 'curriculum-dependency',
      'practice': 'code-simulation-lab',
      'assessment': 'assessment-reinforcement',
      'application': 'application-professional-transfer',
      'research': 'research-state-of-art',
      'visualization': 'visual-interactive-media',
      'narrative': 'storytelling-learning-journey',
      'engagement': 'curiosity-engagement'
    };
    return map[category] || 'didactic-architecture';
  }

  function clearCache() {
    retrievalCache.clear();
  }

  function getCacheStats() {
    return {
      size: retrievalCache.size,
      ttlMs: CACHE_TTL_MS
    };
  }

  return {
    retrieve,
    planRetrieval,
    rankEvidence,
    ensureDiversity,
    applyBudget,
    compressEvidence,
    buildRetrievalContext,
    clearCache,
    getCacheStats,
    BUDGET
  };
}

/* =========================================================
   EVIDENCE PROMPT CONTEXT BUILDER
   ========================================================= */

function buildEvidencePromptContext(evidence) {
  if (!evidence || !evidence.agentContributions) return '';
  if (!evidence.evidenceMetadata?.isRealEvidence) return '';

  const parts = [];
  parts.push('## Agent Evidence Context');
  parts.push('The following evidence was collected from deterministic educational agents. Use it to ground your response in real curriculum analysis.');

  const categories = {};
  for (const item of evidence.agentContributions) {
    if (item.evidenceType !== 'agent-output') continue;
    const cat = item.category || 'general';
    if (!categories[cat]) categories[cat] = [];
    categories[cat].push(item);
  }

  for (const [category, items] of Object.entries(categories)) {
    parts.push(`\n### ${category.charAt(0).toUpperCase() + category.slice(1)} Evidence`);
    for (const item of items.slice(0, 3)) {
      const summary = item.summary || '';
      const content = (item.content || '').substring(0, 500);
      parts.push(`- **${item.agentName}** (${item.confidence} confidence): ${summary}`);
      if (content) {
        parts.push(`  ${content.substring(0, 300)}`);
      }
    }
  }

  if (evidence.evidenceMetadata?.limitationCount > 0) {
    parts.push(`\n*Note: ${evidence.evidenceMetadata.limitationCount} agent(s) could not provide evidence for this query.*`);
  }

  return parts.join('\n');
}

/* =========================================================
   PROVIDER AVAILABILITY TRACKING
   ========================================================= */

const PROVIDER_STATUS = {
  LOCAL_ONLINE: 'local_online',
  LOCAL_MODEL_MISSING: 'local_model_missing',
  LOCAL_OFFLINE: 'local_offline',
  MOCK_FALLBACK: 'mock_fallback',
  UNKNOWN: 'unknown'
};

/* =========================================================
   COPILLOT RUNTIME BRIDGE (Main Entry Point)
   ========================================================= */

function createCopilotRuntimeBridge(config = {}) {
  const conversation = createConversationManager();
  let providerType = config.provider || getStoredProvider();
  let providerConfig = config.providerConfig || {};
  let providerStatus = PROVIDER_STATUS.UNKNOWN;
  let localProviderAvailable = false;
  let lastLearnerModelUpdateSource = null;
  let lastLearnerModelUpdateTime = null;

  function getStoredProvider() {
    try {
      const stored = localStorage.getItem(BRIDGE_CONFIG_KEY);
      if (stored && (stored === 'mock' || stored === 'local')) {
        return stored;
      }
    } catch {}
    return BRIDGE_CONFIG_DEFAULT;
  }

  function getProvider() {
    return providerType;
  }

  function setProvider(type) {
    if (type === 'mock' || type === 'local') {
      providerType = type;
      try { localStorage.setItem(BRIDGE_CONFIG_KEY, type); } catch {}
    }
  }

  /* =========================================================
     LOCAL PROVIDER HEALTH CHECK
     ========================================================= */

  let lastCheckedAt = null;
  let lastCheckResult = null;

  async function isLocalProviderReady() {
    if (providerType === 'mock') return false;
    const result = await checkLocalProvider();
    return result.available && result.modelInstalled;
  }

  async function checkLocalProvider() {
    const endpoint = LOCAL_PROVIDER_URL;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    try {
      const response = await fetch(`${endpoint}/api/tags`, {
        method: 'GET',
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        lastCheckResult = {
          available: false,
          status: 'offline',
          modelInstalled: false,
          error: `HTTP ${response.status}`
        };
        lastCheckedAt = new Date().toISOString();
        return lastCheckResult;
      }

      const data = await response.json();
      const models = data.models || [];
      const modelInstalled = models.some(m => m.name === LOCAL_PROVIDER_MODEL || m.name?.startsWith(LOCAL_PROVIDER_MODEL));

      lastCheckResult = {
        available: true,
        status: modelInstalled ? 'online' : 'model_missing',
        modelInstalled,
        models: models.map(m => m.name),
        error: null
      };
      lastCheckedAt = new Date().toISOString();
      return lastCheckResult;

    } catch (error) {
      clearTimeout(timeoutId);
      lastCheckResult = {
        available: false,
        status: 'offline',
        modelInstalled: false,
        error: error.name === 'AbortError' ? 'timeout' : 'connection_refused'
      };
      lastCheckedAt = new Date().toISOString();
      return lastCheckResult;
    }
  }

  function getProviderStatus() {
    const isMockUsed = providerType !== 'local' || !lastCheckResult?.available || lastCheckResult?.status !== 'online';
    const isRealLLM = providerType === 'local' && lastCheckResult?.available && lastCheckResult?.modelInstalled;
    return {
      provider: providerType,
      providerStatus,
      localAvailable: lastCheckResult?.available || false,
      localModelInstalled: lastCheckResult?.modelInstalled || false,
      endpoint: LOCAL_PROVIDER_URL,
      model: LOCAL_PROVIDER_MODEL,
      fallback: 'MockProvider',
      lastCheckedAt,
      status: lastCheckResult?.status || 'unknown',
      models: lastCheckResult?.models || [],
      isAgentic: isAgenticEnabled(),
      isRealLLM,
      mockUsed: isMockUsed,
      mockTestMode: false,
      agenticLoopLoaded: typeof window !== 'undefined' && !!window.NeuralVerse?.agenticLoop,
      health: getHealthDashboard()
    };
  }

  async function resolveAgenticProviderFn() {
    if (providerType === 'local') {
      const health = await checkLocalProvider();
      localProviderAvailable = health.available && health.modelInstalled;
      providerStatus = localProviderAvailable
        ? PROVIDER_STATUS.LOCAL_ONLINE
        : health.available
          ? PROVIDER_STATUS.LOCAL_MODEL_MISSING
          : PROVIDER_STATUS.LOCAL_OFFLINE;

      if (localProviderAvailable) {
        return async (messages, options) => {
          try {
            return await localProviderWithTools(messages, options);
          } catch {
            localProviderAvailable = false;
            providerStatus = PROVIDER_STATUS.MOCK_FALLBACK;
            return await mockAgenticProvider(messages, options);
          }
        };
      }
    }

    providerStatus = PROVIDER_STATUS.MOCK_FALLBACK;
    return mockAgenticProvider;
  }

  async function sendMessage(request) {
    const startTime = Date.now();
    const requestId = `bridge-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

    try {
      // 1. Start conversation if needed
      if (!conversation.getSession()) {
        conversation.startSession(request.mode, request.style);
      }

      // 2. Append user message
      conversation.appendUserMessage(request.message);

      // 3. PRIMARY PATH: Always use agentic runtime
      //    The LLM decides tool calling, evidence gathering, and synthesis.
      //    The quarantined deterministic pipeline is emergency fallback only.
      const agenticLoop = typeof window !== 'undefined' && window.NeuralVerse?.agenticLoop;
      if (agenticLoop?.createAgenticLoop || agenticLoop?.createStreamingAgenticLoop) {
        providerStatus = PROVIDER_STATUS.LOCAL_ONLINE;
        return await sendAgenticMessage(request, requestId, startTime);
      }

      // 4. AGENTIC MODULE NOT LOADED — Block real response
      //    Do NOT silently fall back to fake deterministic intelligence.
      //    Show a clear recoverable error.
      providerStatus = PROVIDER_STATUS.MOCK_FALLBACK;
      return {
        type: 'error',
        content: 'The AI reasoning engine is not loaded. Please refresh the page or check your connection.',
        errorCode: 'agentic_module_unavailable',
        developerMetadata: {
          requestId,
          pipeline: 'blocked',
          agenticEnabled: isAgenticEnabled(),
          agenticLoopLoaded: false,
          error: 'Agentic loop module not available on window.NeuralVerse.agenticLoop',
          fallbackUsed: false,
          fallbackReason: null,
          mockUsed: false,
          timestamp: new Date().toISOString(),
          durationMs: Date.now() - startTime
        }
      };

    } catch (error) {
      const classified = classifyError(error);
      return {
        type: 'error',
        content: classified.message,
        errorCode: classified.code,
        developerMetadata: {
          requestId,
          pipeline: 'error',
          agenticEnabled: isAgenticEnabled(),
          agenticLoopLoaded: typeof window !== 'undefined' && !!window.NeuralVerse?.agenticLoop,
          error: error.message,
          timestamp: new Date().toISOString(),
          durationMs: Date.now() - startTime
        }
      };
    }
  }

  /* =========================================================
     AGENTIC MESSAGE HANDLER
     ========================================================= */

  async function sendAgenticMessage(request, requestId, startTime) {
    const agenticLoop = typeof window !== 'undefined' && window.NeuralVerse?.agenticLoop;
    if (!agenticLoop?.createAgenticLoop && !agenticLoop?.createStreamingAgenticLoop) {
      // Agentic module not loaded — block, do not silently fake intelligence
      return {
        type: 'error',
        content: 'The AI reasoning engine is not loaded. Please refresh the page.',
        errorCode: 'agentic_module_unavailable',
        developerMetadata: {
          requestId,
          pipeline: 'blocked',
          agenticEnabled: false,
          agenticLoopLoaded: false,
          fallbackUsed: false,
          mockUsed: false,
          fallbackReason: null,
          error: 'Agentic loop module not loaded',
          timestamp: new Date().toISOString(),
          durationMs: Date.now() - startTime
        }
      };
    }

    const providerFn = await resolveAgenticProviderFn();

    const context = {
      selectedArtifact: request.selectedArtifact || null,
      selectedLesson: request.selectedLesson || null,
      selectedModule: request.selectedModule || null,
      selectedPath: request.selectedPath || null,
      currentRoute: request.route || null,
      learnerContext: conversation.getLearnerModelForPrompt() || undefined,
      onLearnerModelUpdate: (updates, source) => {
        try {
          conversation.updateLearnerModel(updates);
          lastLearnerModelUpdateSource = source || 'interaction_analysis';
          lastLearnerModelUpdateTime = Date.now();
        } catch (e) {
          log('warn', 'learner-model', 'Failed to apply LLM learner model update', { error: e.message });
        }
      }
    };

    // Use Knowledge Retrieval Layer for evidence-driven reasoning
    let retrievalResult = null;
    try {
      const knowledgeRetrieval = createKnowledgeRetrievalLayer();
      const learnerModel = conversation.getLearnerModel();
      const adapter = getEvidenceAdapter();
      if (adapter) {
        retrievalResult = await knowledgeRetrieval.retrieve(
          request.message,
          learnerModel,
          context,
          adapter
        );
        recordHealthEvent('retrieval', { lastDuration: retrievalResult?.durationMs || 0, status: 'ok' });
      }
    } catch (retrievalError) {
      // Retrieval failure is non-fatal — continue without retrieved knowledge
      log('warn', 'retrieval', 'Knowledge retrieval failed, continuing without', { error: retrievalError.message });
      recordHealthEvent('retrieval', { status: 'degraded' });
    }

    // Inject retrieved knowledge into context
    if (retrievalResult?.retrievalContext) {
      context.retrievedKnowledge = retrievalResult.retrievalContext;
    }

    try {
      // Prefer streaming loop if available, fall back to basic loop
      let agenticResult;
      if (agenticLoop.createStreamingAgenticLoop) {
        const loop = agenticLoop.createStreamingAgenticLoop({ providerFn, context, maxIterations: 5 });
        agenticResult = await loop.runStreamingLoop({ message: request.message });
      } else {
        const loop = agenticLoop.createAgenticLoop({ providerFn, context });
        agenticResult = await loop.runAgenticLoop({ message: request.message });
      }

      // Normalize agentic result into bridge response shape
      return normalizeAgenticResult(agenticResult, requestId, startTime, retrievalResult, request);
    } catch (error) {
      // Fallback to rule-based pipeline on agentic failure
      return runRuleBasedPipeline(request, requestId, startTime, {
        pipeline: 'rule-based',
        agenticEnabled: true,
        fallbackUsed: true,
        fallbackReason: `Agentic loop error: ${error.message}`
      });
    }
  }

  function normalizeAgenticResult(agenticResult, requestId, startTime, retrievalResult, request) {
    const content = agenticResult.content || '';
    const hasContent = content.length > 10;

    // Determine response type
    let responseType = 'success';
    if (!hasContent && agenticResult.stoppedBy === 'provider_error') {
      responseType = 'error';
    } else if (!hasContent) {
      responseType = 'error';
    }

    // Process through educational response pipeline
    const educationalResponse = processEducationalResponse(content, {
      mode: 'automatic',
      style: 'default',
      currentRoute: null,
      currentLesson: null,
      hasMathContent: false,
      hasCodeContent: false,
      hasResearchContent: false
    });

    // Append to conversation
    conversation.appendAssistantMessage(content, {
      provider: providerType === 'local' ? 'local' : 'mock',
      model: providerType === 'local' ? LOCAL_PROVIDER_MODEL : 'mock-model'
    });

    // Build developer metadata for agentic path
    const agenticMeta = agenticResult.developerMetadata || {};
    const plan = agenticResult.plan || {};
    const evidenceCount = agenticMeta.evidenceCount || agenticResult.evidenceUsed?.length || 0;
    const toolsUsed = agenticMeta.toolsUsed || [...new Set((agenticResult.toolCalls || []).map(tc => tc.name))];
    const isRealEvidence = evidenceCount > 0 && providerType === 'local' && localProviderAvailable;

    // Determine mock/test mode status
    const isMockUsed = providerType !== 'local' || !localProviderAvailable || (lastCheckResult?.status !== 'online');
    const isTestMode = request?.developerMode === true && isMockUsed;

    const devMetadata = {
      requestId,
      pipeline: 'agentic',
      agenticEnabled: true,
      agenticLoopLoaded: true,
      iterations: agenticMeta.iterations || agenticResult.iterations || 0,
      stoppedBy: agenticMeta.stoppedBy || agenticResult.stoppedBy || 'unknown',
      toolCalls: (agenticResult.toolCalls || []).map(tc => ({
        name: tc.name,
        arguments: tc.arguments
      })),
      toolsUsed,
      evidenceCount,
      isRealEvidence,
      confidence: agenticMeta.confidence || plan.confidence || 0,
      timeline: agenticMeta.timeline || plan.timeline || [],
      fallbackUsed: providerType !== 'local' || !localProviderAvailable,
      fallbackReason: providerType !== 'local' ? 'Mock provider selected' : (!localProviderAvailable ? 'Local LLM unavailable' : null),
      mockUsed: isMockUsed,
      mockTestMode: isTestMode,
      provider: providerType,
      providerStatus,
      model: providerType === 'local' ? LOCAL_PROVIDER_MODEL : 'mock-model',
      isRealLLM: providerType === 'local' && localProviderAvailable && (lastCheckResult?.modelInstalled || false),
      learnerModel: conversation.getLearnerModel(),
      learnerModelUpdateSource: lastLearnerModelUpdateSource,
      evidenceQualityStatus: evidenceCount > 0 ? 'collected' : 'empty',
      retrieval: retrievalResult ? {
        sources: retrievalResult.plan?.sources || [],
        retrievedCount: retrievalResult.retrievedCount || 0,
        totalCount: retrievalResult.totalCount || 0,
        compressionRatio: retrievalResult.compressionRatio || 0,
        durationMs: retrievalResult.durationMs || 0,
        categories: retrievalResult.categories || [],
        fromCache: retrievalResult.fromCache || false
      } : null,
      educationalReasoning: conversation.getEducationalReasoningMetadata(),
      benchmark: conversation.getBenchmarkSummary(),
      durationMs: Date.now() - startTime,
      timestamp: new Date().toISOString()
    };

    return {
      type: responseType,
      content,
      educationalResponse,
      suggestedActions: educationalResponse.actions,
      developerMetadata: devMetadata,
      provider: providerType === 'local' ? 'local' : 'mock',
      model: providerType === 'local' ? LOCAL_PROVIDER_MODEL : 'mock-model',
      validation: { valid: hasContent, code: hasContent ? 'response_valid' : 'response_empty', message: hasContent ? 'Response is valid' : 'Response is empty' }
    };
  }

  function runRuleBasedPipeline(request, requestId, startTime, overrideMetadata) {
    // DEPRECATED: Use sendEmergencyFallback instead
    return sendEmergencyFallback(request, requestId, startTime, overrideMetadata);
  }

  /* =========================================================
     EMERGENCY FALLBACK — Quarantined Deterministic Pipeline
     =========================================================

     This function is ONLY used when:
       - The agentic runtime is completely unavailable
       - Explicitly in test/developer mode

     It is NOT the primary intelligence path.
     Keyword-based routing and static agent maps are quarantined here.
     ========================================================= */

  async function sendEmergencyFallback(request, requestId, startTime, overrideMetadata) {
    try {
      const intent = classifyIntentEmergencyFallback(request.message);
      const selectedAgents = selectAgentsEmergencyFallback(intent.intents);
      const evidenceContext = {
        selectedArtifact: request.selectedArtifact || null,
        selectedLesson: request.selectedLesson || null,
        selectedModule: request.selectedModule || null,
        selectedPath: request.selectedPath || null,
        currentRoute: request.route || null
      };
      const evidence = await aggregateEvidence(selectedAgents, request.message, evidenceContext, request.mode, request.style);
      const confidence = calculateConfidence(evidence, request.message);

      if (confidence.shouldClarify) {
        return {
          type: 'clarification',
          clarification: `I want to make sure I understand correctly. Could you tell me more about what specific aspect of "${request.message}" you'd like me to focus on?`,
          missingEvidence: evidence.conceptDefinitions.length === 0 ? ['concept-definitions'] : [],
          suggestedNextPrompts: ['Explain this concept in simple terms', 'Give me a detailed explanation', 'Show me examples'],
          developerMetadata: buildEmergencyMetadata(intent, selectedAgents, confidence, evidence, requestId, startTime, overrideMetadata)
        };
      }

      const evidencePrompt = buildEvidencePromptContext(evidence);
      let providerResult;
      try {
        if (providerType === 'local') {
          providerResult = await localProviderComplete(evidencePrompt ? `${evidencePrompt}\n\nUser Question: ${request.message}` : request.message, request.mode, providerConfig);
        } else {
          providerResult = await mockProviderComplete(evidencePrompt ? `${evidencePrompt}\n\nUser Question: ${request.message}` : request.message, request.mode);
        }
      } catch (providerError) {
        if (providerType === 'local') {
          providerResult = await mockProviderComplete(evidencePrompt ? `${evidencePrompt}\n\nUser Question: ${request.message}` : request.message, request.mode);
        } else {
          throw providerError;
        }
      }

      const validation = validateResponse(providerResult);
      if (!validation.valid) {
        return { type: 'error', content: ERROR_CODES.validation_failed, developerMetadata: buildEmergencyMetadata(intent, selectedAgents, confidence, evidence, requestId, startTime, overrideMetadata) };
      }

      const educationalResponse = processEducationalResponse(providerResult.content, { mode: request.mode, style: request.style, currentRoute: request.route, currentLesson: request.currentLesson, hasMathContent: false, hasCodeContent: false, hasResearchContent: false });
      conversation.appendAssistantMessage(providerResult.content, { provider: providerResult.provider, model: providerResult.model });

      return {
        type: 'success',
        content: providerResult.content,
        educationalResponse,
        suggestedActions: educationalResponse.actions,
        developerMetadata: buildEmergencyMetadata(intent, selectedAgents, confidence, evidence, requestId, startTime, overrideMetadata),
        provider: providerResult.provider,
        model: providerResult.model,
        validation
      };
    } catch (error) {
      const classified = classifyError(error);
      return { type: 'error', content: classified.message, errorCode: classified.code, developerMetadata: { requestId, pipeline: 'emergency-fallback', error: error.message, timestamp: new Date().toISOString(), durationMs: Date.now() - startTime } };
    }
  }

  function buildEmergencyMetadata(intent, selectedAgents, confidence, evidence, requestId, startTime, overrideMetadata) {
    const evidenceMeta = evidence?.evidenceMetadata || {};
    const isMockUsed = providerType !== 'local' || !localProviderAvailable;
    const base = {
      requestId,
      pipeline: 'emergency-fallback',
      agenticEnabled: false,
      agenticLoopLoaded: typeof window !== 'undefined' && !!window.NeuralVerse?.agenticLoop,
      intents: intent.intents,
      selectedAgents: selectedAgents.map(a => a.agentId),
      evidence: {
        totalAgents: evidenceMeta.totalAgents || 0,
        realEvidenceCount: evidenceMeta.realEvidenceCount || 0,
        limitationCount: evidenceMeta.limitationCount || 0,
        unavailableAgents: evidenceMeta.unavailableAgents || [],
        isRealEvidence: evidenceMeta.isRealEvidence || false,
        adapterAvailable: evidenceMeta.adapterAvailable !== false,
        agentStatus: evidenceMeta.agentStatus || {}
      },
      confidenceLevel: confidence.overall,
      confidenceScore: confidence.evidenceCompleteness,
      evidenceCompleteness: evidence.completeness || 0,
      provider: providerType,
      model: providerType === 'local' ? LOCAL_PROVIDER_MODEL : 'mock-model',
      fallbackUsed: true,
      fallbackReason: 'Agentic runtime unavailable — using quarantined emergency deterministic fallback',
      mockUsed: isMockUsed,
      mockTestMode: false,
      isRealLLM: false,
      learnerModelUpdateSource: null,
      evidenceQualityStatus: evidenceMeta.realEvidenceCount > 0 ? 'collected' : 'limitation',
      durationMs: Date.now() - startTime,
      timestamp: new Date().toISOString()
    };
    if (overrideMetadata) {
      Object.assign(base, overrideMetadata);
    }
    return base;
  }

  function buildDeveloperMetadata(intent, selectedAgents, confidence, evidence, requestId, startTime) {
    // DEPRECATED: Use buildEmergencyMetadata for emergency fallback
    return buildEmergencyMetadata(intent, selectedAgents, confidence, evidence, requestId, startTime);
  }

  function restoreSession() {
    // Try to restore from persistence if no active session
    if (!conversation.getSession()) {
      const restored = conversation.restore();
      if (restored && restored.session) {
        return {
          session: restored.session,
          messages: restored.messages || [],
          summary: restored.summary || '',
          restored: true
        };
      }
    }

    const session = conversation.getSession();
    if (session) {
      return {
        session,
        messages: conversation.getMessages(),
        summary: conversation.getSummary(),
        restored: false
      };
    }
    return null;
  }

  function clearSession() {
    conversation.clear();
  }

  function getProviderInfo() {
    return {
      provider: providerType,
      model: providerType === 'local' ? LOCAL_PROVIDER_MODEL : 'mock-model',
      endpoint: providerType === 'local' ? LOCAL_PROVIDER_URL : 'internal',
      available: true
    };
  }

  function getDeveloperMetadata() {
    const isMockUsed = providerType !== 'local' || !localProviderAvailable;
    return {
      bridgeStatus: 'active',
      runtimeStatus: providerType === 'local' ? (localProviderAvailable ? 'local' : 'local-offline') : 'mock',
      provider: providerType,
      providerStatus,
      model: providerType === 'local' ? LOCAL_PROVIDER_MODEL : 'mock-model',
      localProviderEnabled: providerType === 'local',
      localProviderAvailable,
      localModelInstalled: lastCheckResult?.modelInstalled || false,
      isAgentic: isAgenticEnabled(),
      agenticLoopLoaded: typeof window !== 'undefined' && !!window.NeuralVerse?.agenticLoop,
      isRealLLM: providerType === 'local' && localProviderAvailable && (lastCheckResult?.modelInstalled || false),
      mockUsed: isMockUsed,
      mockTestMode: false,
      conversationActive: conversation.getSession() !== null,
      messageCount: conversation.getMessages().length,
      sessionId: conversation.getSession()?.id || null,
      lastSaved: new Date().toISOString(),
      storageSize: conversation.getStorageSize(),
      persistenceBackend: 'localStorage'
    };
  }

  function getStorageInfo() {
    return {
      backend: 'localStorage',
      sessionId: conversation.getSession()?.id || null,
      messageCount: conversation.getMessages().length,
      lastSaved: new Date().toISOString(),
      storageSize: conversation.getStorageSize(),
      restoreStatus: conversation.getSession() ? 'active' : 'empty'
    };
  }

  /* =========================================================
     STREAMING MESSAGE API
     ========================================================= */

  let activeStreamAbort = null;

  async function sendMessageStream(request, callbacks) {
    const startTime = Date.now();
    const requestId = 'stream-' + Date.now() + '-' + Math.random().toString(36).substring(2, 9);
    const { onStatus, onText, onToolStart, onToolEnd, onPlanUpdate, onTimelineUpdate, onComplete, onError, onAbort } = callbacks || {};

    // Start conversation if needed
    if (!conversation.getSession()) {
      conversation.startSession(request.mode, request.style);
    }
    conversation.appendUserMessage(request.message);

    // Check if agentic mode is enabled
    if (!isAgenticEnabled()) {
      // Non-streaming fallback
      const result = await sendMessage(request);
      if (onComplete) onComplete(result);
      return result;
    }

    const agenticLoop = typeof window !== 'undefined' && window.NeuralVerse?.agenticLoop;
    if (!agenticLoop?.createStreamingAgenticLoop) {
      const result = await sendMessage(request);
      if (onComplete) onComplete(result);
      return result;
    }

    const providerFn = await resolveAgenticProviderFn();

    const context = {
      selectedArtifact: request.selectedArtifact || null,
      selectedLesson: request.selectedLesson || null,
      selectedModule: request.selectedModule || null,
      selectedPath: request.selectedPath || null,
      currentRoute: request.route || null,
      onLearnerModelUpdate: (updates, source) => {
        try {
          conversation.updateLearnerModel(updates);
          lastLearnerModelUpdateSource = source || 'interaction_analysis';
          lastLearnerModelUpdateTime = Date.now();
        } catch (e) {
          log('warn', 'learner-model', 'Failed to apply LLM learner model update', { error: e.message });
        }
      }
    };

    activeStreamAbort = new AbortController();

    if (onStatus) onStatus('thinking');

    const loop = agenticLoop.createStreamingAgenticLoop({
      providerFn,
      context,
      maxIterations: 5,
      onChunk: (chunk) => {
        if (chunk.type === 'text' && chunk.delta && onText) {
          onText(chunk.delta, chunk.content);
        }
        if (chunk.type === 'control') {
          if (chunk.content === 'planning' && onStatus) onStatus('planning');
          if (chunk.content === 'synthesizing' && onStatus) onStatus('synthesizing');
          if (chunk.content === 'complete' && onStatus) onStatus('complete');
        }
        if (chunk.type === 'tool_call' && onToolStart) {
          onToolStart(chunk.toolCall?.name || 'unknown');
        }
        if (chunk.type === 'tool_result' && onToolEnd) {
          onToolEnd(chunk.toolCall?.name || 'unknown', chunk.content);
        }
      },
      onToolStart: (name) => {
        if (onStatus) onStatus('consulting', name);
        if (onToolStart) onToolStart(name);
      },
      onToolEnd: (name, duration) => {
        if (onToolEnd) onToolEnd(name, duration);
      },
      onPlanUpdate: (plan) => {
        if (onPlanUpdate) onPlanUpdate(plan);
      },
      onTimelineUpdate: (timeline) => {
        if (onTimelineUpdate) onTimelineUpdate(timeline);
      },
      onError: (error) => {
        if (onError) onError(error);
      }
    });

    try {
      const agenticResult = await loop.runStreamingLoop({ message: request.message });
      const result = normalizeAgenticResult(agenticResult, requestId, startTime, null, request);

      if (onComplete) onComplete(result);
      activeStreamAbort = null;
      return result;
    } catch (error) {
      activeStreamAbort = null;
      if (onError) onError(error);
      return { type: 'error', content: error.message, developerMetadata: { requestId, error: error.message } };
    }
  }

  function abortStream() {
    if (activeStreamAbort) {
      activeStreamAbort.abort();
      activeStreamAbort = null;
    }
  }

  function isStreaming() {
    return activeStreamAbort !== null;
  }

  return {
    sendMessage,
    sendMessageStream,
    abortStream,
    isStreaming,
    restoreSession,
    clearSession,
    getProviderInfo,
    getDeveloperMetadata,
    getStorageInfo,
    checkLocalProvider,
    getProviderStatus,
    setProvider,
    getProvider,
    isLocalProviderReady
  };
}

/* =========================================================
   EXPORTS
   ========================================================= */

if (typeof window !== 'undefined') {
  window.NeuralVerse = window.NeuralVerse || {};
  window.NeuralVerse.CopilotRuntimeBridge = {
    createCopilotRuntimeBridge,
    ERROR_CODES,
    buildEvidencePromptContext,
    isAgenticEnabled,
    setAgenticEnabled,
    mockAgenticProvider,
    localProviderStreaming,
    PROVIDER_STATUS,
    validateEvidenceQuality,
    enforceEvidenceQuality,
    EVIDENCE_PLACEHOLDER_PATTERNS,
    classifyIntentEmergencyFallback,
    selectAgentsEmergencyFallback
  };
}

export { createCopilotRuntimeBridge, ERROR_CODES, buildEvidencePromptContext, isAgenticEnabled, setAgenticEnabled, mockAgenticProvider, localProviderStreaming, PROVIDER_STATUS, validateEvidenceQuality, enforceEvidenceQuality, EVIDENCE_PLACEHOLDER_PATTERNS, classifyIntentEmergencyFallback, selectAgentsEmergencyFallback };
