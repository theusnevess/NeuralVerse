/**
 * NV-1000-A4 — Code, Simulation & Laboratory Agent
 *
 * Practical engineering intelligence layer for educational code examples,
 * simulations, laboratories, debugging guidance, and experiment design.
 * Outputs are deterministic, local-first, and read-only over NV-800 data.
 */

const CODE_INTENT_PATTERNS = {
  code_example: ['code example', 'show me code', 'toy example', 'implement', 'in code', 'python', 'javascript', 'typescript', 'pseudocode'],
  step_execution: ['step by step', 'execution flow', 'walk through', 'how would this behave', 'intermediate state'],
  algorithm_walkthrough: ['algorithm', 'iterations', 'state changes', 'visualization companion', 'convergence'],
  mini_lab: ['laboratory', 'mini lab', 'lab exercise', 'guided experiment', 'hands-on'],
  simulation_specification: ['simulate', 'simulation', 'controls', 'observable output', 'interactive parameters'],
  debugging: ['debug', 'bug', 'mistake', 'common error', 'why is this failing'],
  complexity_analysis: ['complexity', 'big o', 'time complexity', 'space complexity', 'scalability', 'bottleneck'],
  pipeline_builder: ['pipeline', 'build pipeline', 'stages', 'workflow', 'retrieval flow'],
  parameter_explorer: ['parameter', 'learning rate', 'batch size', 'top-k', 'temperature', 'threshold', 'stride', 'padding'],
  experiment_design: ['experiment', 'hypothesis', 'measure', 'ablation', 'controlled test', 'evaluate']
};

const MODE_LABELS = {
  code_example: 'Code Example',
  step_execution: 'Step Execution',
  algorithm_walkthrough: 'Algorithm Walkthrough',
  mini_lab: 'Mini Lab',
  simulation_specification: 'Simulation Specification',
  debugging: 'Debugging',
  complexity_analysis: 'Complexity Analysis',
  pipeline_builder: 'Pipeline Builder',
  parameter_explorer: 'Parameter Explorer',
  experiment_design: 'Experiment Design'
};

const SUPPORTED_LANGUAGES = ['python', 'javascript', 'typescript', 'java', 'cpp', 'pseudocode'];

function createCodeSimulationLaboratoryAgent() {
  const responseCache = new Map();

  function initialize() {
    return Promise.resolve({ status: 'ready', modes: Object.keys(MODE_LABELS).length });
  }

  function canHandle(context) {
    return Boolean(context?.userQuery || context?.selectedArtifact || context?.selectedLesson);
  }

  async function run(context = {}, options = {}) {
    await initialize();

    const query = context.userQuery || '';
    const mode = options.mode || detectIntent(query);
    const topic = resolveTopic(context, query);
    const language = normalizeLanguage(options.language || detectLanguage(query));
    const cacheKey = JSON.stringify({ mode, topic, language, query: normalizeQuery(query), artifactType: context.artifactType || null });

    if (responseCache.has(cacheKey)) {
      return cloneWithTimestamp(responseCache.get(cacheKey));
    }

    const result = buildResponse(mode, topic, language, context, query);
    responseCache.set(cacheKey, result);
    return cloneWithTimestamp(result);
  }

  function detectIntent(query) {
    const lower = ` ${(query || '').toLowerCase()} `;
    for (const [intent, patterns] of Object.entries(CODE_INTENT_PATTERNS)) {
      if (patterns.some((pattern) => lower.includes(pattern))) return intent;
    }
    return 'code_example';
  }

  function buildResponse(mode, topic, language, context, query) {
    const strategy = getReasoningStrategy(mode, topic);
    const sections = buildSectionsForMode(mode, topic, language, context, query);

    return {
      agentId: 'code-simulation-lab',
      agentName: 'Code, Simulation & Laboratory Agent',
      mode,
      modeLabel: MODE_LABELS[mode] || 'Code Laboratory',
      topic,
      language,
      reasoningStrategy: strategy,
      sections,
      timestamp: new Date().toISOString(),
      status: 'operational',
      disclaimer: 'Educational output only. No code is executed, no benchmarks are fabricated, and NV-800 curriculum content remains read-only.'
    };
  }

  function buildSectionsForMode(mode, topic, language, context, query) {
    const builders = {
      code_example: () => buildCodeExample(topic, language),
      step_execution: () => buildStepExecution(topic),
      algorithm_walkthrough: () => buildAlgorithmWalkthrough(topic),
      mini_lab: () => buildMiniLab(topic),
      simulation_specification: () => buildSimulationSpecification(topic),
      debugging: () => buildDebuggingGuide(topic),
      complexity_analysis: () => buildComplexityAnalysis(topic, query),
      pipeline_builder: () => buildPipeline(topic, query),
      parameter_explorer: () => buildParameterExplorer(topic, query),
      experiment_design: () => buildExperimentDesign(topic)
    };
    return addRequiredExplainability((builders[mode] || builders.code_example)(), mode, topic, context);
  }

  function buildCodeExample(topic, language) {
    return [
      educationalGoalSection(`Show a minimal, readable ${language} implementation that connects ${topic} to execution.`),
      {
        title: 'Didactic Code Example',
        type: 'code-block',
        language,
        content: createCodeSnippet(topic, language)
      }
    ];
  }

  function buildStepExecution(topic) {
    return [
      educationalGoalSection(`Make the execution flow of ${topic} explicit before discussing optimization.`),
      {
        title: 'Execution Walkthrough',
        type: 'execution-flow',
        content: `Input\n↓\nNormalize the representation for **${topic}**\n↓\nApply the core transformation\n↓\nInspect the intermediate state\n↓\nProduce the output and explain what changed`
      },
      {
        title: 'State Tracking',
        type: 'text',
        content: '- Track one input example end-to-end\n- Name each intermediate variable\n- Compare the state before and after each transformation\n- Keep numerical examples small enough to inspect manually'
      }
    ];
  }

  function buildAlgorithmWalkthrough(topic) {
    return [
      educationalGoalSection(`Synchronize ${topic} with visible algorithm state changes.`),
      {
        title: 'Algorithm Companion',
        type: 'lab-card',
        content: `Describe **${topic}** as repeated state updates: initialize state, apply one iteration, observe variable evolution, check stopping behavior, then summarize convergence or termination.`
      },
      {
        title: 'Iteration Log Template',
        type: 'comparison-table',
        content: '| Step | State Before | Operation | State After | Conceptual Meaning |\n|---|---|---|---|---|\n| 0 | Initial variables | Setup | Ready state | Establish baseline |\n| 1 | Current state | One update | New state | Observe cause and effect |\n| n | Stable or stopped | Termination check | Output | Explain why the algorithm stops |'
      }
    ];
  }

  function buildMiniLab(topic) {
    return [
      educationalGoalSection(`Create a self-contained lab where learners experiment with ${topic}.`),
      {
        title: 'Mini Laboratory',
        type: 'lab-card',
        content: `Objective: Understand **${topic}** by changing one variable at a time.\n\nPrerequisites: basic notation, one small example input, and ability to inspect intermediate values.\n\nSetup: use a local notebook or plain script with a tiny dataset.\n\nInstructions: run the baseline, change one parameter, record observations, reset, then compare.`
      },
      {
        title: 'Expected Observations',
        type: 'text',
        content: '- Small controlled changes should produce explainable differences\n- Extreme parameter values should expose failure modes\n- Learners should distinguish implementation behavior from conceptual goal\n- No hidden grading or mastery claim is introduced'
      },
      {
        title: 'Optional Extensions',
        type: 'text',
        content: '- Add a second toy input\n- Plot or tabulate intermediate values\n- Compare with a naive baseline\n- Write one reflection note about trade-offs'
      }
    ];
  }

  function buildSimulationSpecification(topic) {
    return [
      educationalGoalSection(`Define a local-first conceptual simulation for ${topic} without backend execution.`),
      {
        title: 'Simulation Specification',
        type: 'lab-card',
        content: `Parameters: input size, update step, noise level, and stopping condition.\n\nControls: reset, step forward, run slowly, pause, and compare baseline.\n\nLearner Interactions: adjust one parameter, observe output, then inspect intermediate state.\n\nObservable Outputs: numeric table, highlighted state changes, and short interpretation.`
      },
      {
        title: 'Simulation Boundary',
        type: 'text',
        content: 'This is a specification, not a generated executable widget. It should run locally if implemented later and must not require backend execution or external APIs.'
      }
    ];
  }

  function buildDebuggingGuide(topic) {
    return [
      educationalGoalSection(`Explain common implementation failures for ${topic} without fabricating runtime logs.`),
      {
        title: 'Common Debugging Patterns',
        type: 'comparison-table',
        content: '| Symptom | Probable Cause | Conceptual Explanation | Suggested Fix | Prevention |\n|---|---|---|---|---|\n| Output shape is unexpected | Dimension mismatch | Transformations changed axes or batch dimensions | Print shapes at each stage | Name dimensions in comments |\n| Results are unstable | Parameter too aggressive | Updates overshoot or amplify noise | Reduce step size or normalize inputs | Start with conservative defaults |\n| Retrieval feels irrelevant | Ranking signal mismatch | Similarity does not reflect task intent | Inspect top-k examples manually | Add evaluation examples before scaling |'
      },
      {
        title: 'Grounding Rule',
        type: 'text',
        content: 'Use observed symptoms from the learner when available. Do not invent stack traces, timings, benchmark values, or empirical outcomes.'
      }
    ];
  }

  function buildComplexityAnalysis(topic, query) {
    const profile = chooseComplexityProfile(topic, query);
    return [
      educationalGoalSection(`Estimate scalability for ${topic} using clear asymptotic reasoning.`),
      {
        title: 'Complexity Summary',
        type: 'comparison-table',
        content: `| Aspect | Estimate | Explanation |\n|---|---|---|\n| Time | ${profile.time} | ${profile.timeReason} |\n| Space | ${profile.space} | ${profile.spaceReason} |\n| Bottleneck | ${profile.bottleneck} | Focus optimization only after correctness is clear |`
      },
      {
        title: 'Scalability Guidance',
        type: 'text',
        content: '- Measure input size explicitly\n- Separate preprocessing from query-time work\n- Prefer simple baselines before optimization\n- Document assumptions behind Big-O notation'
      }
    ];
  }

  function buildPipeline(topic, query) {
    const stages = choosePipelineStages(topic, query);
    return [
      educationalGoalSection(`Turn ${topic} into an inspectable engineering pipeline.`),
      {
        title: 'Pipeline Flow',
        type: 'execution-flow',
        content: stages.join('\n↓\n')
      },
      {
        title: 'Stage Explanations',
        type: 'text',
        content: stages.map((stage) => `- **${stage}**: inspect inputs, outputs, and failure modes before moving on.`).join('\n')
      }
    ];
  }

  function buildParameterExplorer(topic, query) {
    const parameters = chooseParameters(topic, query);
    return [
      educationalGoalSection(`Explain how parameters control ${topic} behavior.`),
      {
        title: 'Parameter Exploration',
        type: 'comparison-table',
        content: `| Parameter | Role | Increasing Effect | Decreasing Effect | Trade-off |\n|---|---|---|---|---|\n${parameters.map((p) => `| ${p.name} | ${p.role} | ${p.up} | ${p.down} | ${p.tradeoff} |`).join('\n')}`
      },
      {
        title: 'Exploration Protocol',
        type: 'text',
        content: 'Change one parameter at a time, record the visible effect, reset to baseline, then compare with a second controlled setting.'
      }
    ];
  }

  function buildExperimentDesign(topic) {
    return [
      educationalGoalSection(`Design a reproducible experiment for ${topic} without inventing results.`),
      {
        title: 'Experiment Plan',
        type: 'lab-card',
        content: `Hypothesis: changing one controlled variable will produce a predictable change in **${topic}** behavior.\n\nIndependent Variable: one parameter or implementation choice.\n\nDependent Variable: observable output quality, runtime trend, or error pattern.\n\nControls: same toy data, same seed if applicable, same measurement procedure.`
      },
      {
        title: 'Measurements & Limitations',
        type: 'text',
        content: '- Record qualitative observations and simple counts\n- Avoid claiming benchmark performance\n- State limitations of toy data\n- Use expected trends, not fabricated empirical results'
      }
    ];
  }

  function addRequiredExplainability(sections, mode, topic, context) {
    return [
      ...sections,
      {
        title: 'Reasoning Strategy',
        type: 'text',
        content: getReasoningStrategy(mode, topic)
      },
      {
        title: 'Assumptions',
        type: 'text',
        content: `- Topic is treated as **${topic}**\n- Current route: ${context.currentRoute || 'unknown'}\n- Examples are educational and minimal\n- No learner code is executed`
      },
      {
        title: 'Limitations',
        type: 'text',
        content: '- Does not validate against runtime logs unless provided by the learner\n- Does not produce production-ready systems\n- Does not generate empirical benchmark claims\n- Does not mutate curriculum artifacts'
      },
      {
        title: 'Suggested Next Exploration',
        type: 'text',
        content: 'Run the smallest possible local example, inspect intermediate states, then change one parameter and explain the observed difference.'
      }
    ];
  }

  function educationalGoalSection(goal) {
    return { title: 'Educational Goal', type: 'lab-card', content: goal };
  }

  function createCodeSnippet(topic, language) {
    const safeTopic = topic.replace(/`/g, '');
    if (language === 'javascript' || language === 'typescript') {
      return `// Toy example for ${safeTopic}\n// Goal: show the data transformation clearly, not optimize it.\nconst inputs = [0.2, 0.5, 0.3];\n\nfunction normalize(values) {\n  const total = values.reduce((sum, value) => sum + value, 0);\n  return values.map((value) => value / total);\n}\n\nconst normalized = normalize(inputs);\nconsole.log(normalized);`;
    }
    if (language === 'java') {
      return `// Toy example for ${safeTopic}\n// Goal: expose each transformation step.\ndouble[] inputs = {0.2, 0.5, 0.3};\ndouble total = 0.0;\nfor (double value : inputs) total += value;\nfor (double value : inputs) {\n    double normalized = value / total;\n    System.out.println(normalized);\n}`;
    }
    if (language === 'cpp') {
      return `// Toy example for ${safeTopic}\n// Goal: keep the computation inspectable.\nstd::vector<double> inputs = {0.2, 0.5, 0.3};\ndouble total = std::accumulate(inputs.begin(), inputs.end(), 0.0);\nfor (double value : inputs) {\n    std::cout << value / total << std::endl;\n}`;
    }
    if (language === 'pseudocode') {
      return `# Toy example for ${safeTopic}\n# Keep each transformation visible.\ninputs <- [0.2, 0.5, 0.3]\ntotal <- sum(inputs)\nfor each value in inputs:\n    normalized <- value / total\n    print(normalized)`;
    }
    return `# Toy example for ${safeTopic}\n# Goal: show the transformation clearly, not optimize it.\ninputs = [0.2, 0.5, 0.3]\n\ndef normalize(values):\n    total = sum(values)\n    # Divide each value by the total so the outputs sum to 1.\n    return [value / total for value in values]\n\nnormalized = normalize(inputs)\nprint(normalized)`;
  }

  function getReasoningStrategy(mode, topic) {
    const labels = {
      code_example: `Use the smallest readable implementation that exposes the core transformation in ${topic}.`,
      step_execution: `Decompose ${topic} into inspectable input, transformation, intermediate state, and output stages.`,
      algorithm_walkthrough: `Track state changes and iterations before discussing optimization.`,
      mini_lab: `Convert ${topic} into a controlled experiment with clear observations.`,
      simulation_specification: `Specify local interactions and observable cause-and-effect without executing code.`,
      debugging: `Map symptoms to conceptual causes and fixes without fabricating logs.`,
      complexity_analysis: `Separate time, space, bottlenecks, and assumptions using simple asymptotic reasoning.`,
      pipeline_builder: `Represent ${topic} as ordered engineering stages with inspectable boundaries.`,
      parameter_explorer: `Change one parameter at a time and explain directional effects.`,
      experiment_design: `Define hypothesis, variables, controls, measurements, and limitations without inventing results.`
    };
    return labels[mode] || labels.code_example;
  }

  function chooseComplexityProfile(topic, query) {
    const lower = `${topic} ${query}`.toLowerCase();
    if (lower.includes('attention')) {
      return { time: 'O(n^2)', space: 'O(n^2)', timeReason: 'Pairwise token interactions dominate.', spaceReason: 'Attention weights scale with sequence pairs.', bottleneck: 'Sequence length' };
    }
    if (lower.includes('retrieval') || lower.includes('rag')) {
      return { time: 'O(k log n) query-side after indexing', space: 'O(n * d)', timeReason: 'Search depends on index structure and top-k retrieval.', spaceReason: 'Embeddings store n vectors of dimension d.', bottleneck: 'Index size and reranking cost' };
    }
    if (lower.includes('convolution')) {
      return { time: 'O(h * w * k^2 * c)', space: 'O(h * w)', timeReason: 'Each output location applies a local kernel.', spaceReason: 'Feature maps dominate intermediate memory.', bottleneck: 'Feature map resolution' };
    }
    return { time: 'O(n)', space: 'O(n)', timeReason: 'One pass over a small educational input.', spaceReason: 'Stores input and intermediate state.', bottleneck: 'Input size and representation choice' };
  }

  function choosePipelineStages(topic, query) {
    const lower = `${topic} ${query}`.toLowerCase();
    if (lower.includes('rag') || lower.includes('retrieval')) {
      return ['Input Query', 'Preprocessing', 'Embedding', 'Index Search', 'Retrieval', 'Reranking', 'Grounded Generation'];
    }
    if (lower.includes('training')) {
      return ['Data', 'Batching', 'Forward Pass', 'Loss Computation', 'Backward Pass', 'Parameter Update', 'Validation'];
    }
    return ['Input', 'Preprocessing', 'Core Transformation', 'Intermediate State', 'Validation Check', 'Output'];
  }

  function chooseParameters(topic, query) {
    const lower = `${topic} ${query}`.toLowerCase();
    if (lower.includes('retrieval') || lower.includes('rag')) {
      return [
        { name: 'top-k', role: 'Number of retrieved candidates', up: 'More recall', down: 'Less noise', tradeoff: 'Recall vs precision' },
        { name: 'chunk size', role: 'Context granularity', up: 'More context per item', down: 'More focused chunks', tradeoff: 'Coverage vs specificity' },
        { name: 'rerank depth', role: 'Candidates reranked', up: 'Better final ordering', down: 'Lower latency', tradeoff: 'Quality vs cost' }
      ];
    }
    if (lower.includes('optimization') || lower.includes('gradient')) {
      return [
        { name: 'learning rate', role: 'Update step size', up: 'Faster but less stable', down: 'Slower but safer', tradeoff: 'Speed vs stability' },
        { name: 'batch size', role: 'Examples per update', up: 'Smoother estimates', down: 'Noisier updates', tradeoff: 'Memory vs gradient noise' },
        { name: 'epochs', role: 'Training passes', up: 'More fitting opportunity', down: 'Less training time', tradeoff: 'Fit vs overfit risk' }
      ];
    }
    return [
      { name: 'input size', role: 'Amount of data processed', up: 'More coverage', down: 'Easier inspection', tradeoff: 'Realism vs clarity' },
      { name: 'threshold', role: 'Decision boundary', up: 'Stricter acceptance', down: 'More permissive behavior', tradeoff: 'Precision vs recall' },
      { name: 'iteration count', role: 'Number of update steps', up: 'More refinement', down: 'Faster completion', tradeoff: 'Quality vs runtime' }
    ];
  }

  function detectLanguage(query) {
    const lower = (query || '').toLowerCase();
    if (lower.includes('typescript')) return 'typescript';
    if (lower.includes('javascript')) return 'javascript';
    if (lower.includes('java')) return 'java';
    if (lower.includes('c++') || lower.includes('cpp')) return 'cpp';
    if (lower.includes('pseudocode')) return 'pseudocode';
    return 'python';
  }

  function normalizeLanguage(language) {
    const normalized = String(language || 'python').toLowerCase();
    return SUPPORTED_LANGUAGES.includes(normalized) ? normalized : 'python';
  }

  function resolveTopic(context, query) {
    return context.selectedArtifact?.title
      || context.selectedLesson?.title
      || context.selectedModule?.title
      || context.selectedPath?.title
      || extractTopicFromQuery(query)
      || 'current concept';
  }

  function extractTopicFromQuery(query) {
    const cleaned = (query || '')
      .replace(/show me|give me|can we|can you|simulate|algorithm|code example|laboratory|lab exercise|walk through|implementation|experiment|debug|complexity|pipeline/ig, '')
      .replace(/[?!.]/g, '')
      .trim();
    return cleaned ? titleCase(cleaned) : null;
  }

  function normalizeQuery(query) {
    return (query || '').toLowerCase().replace(/\s+/g, ' ').trim();
  }

  function titleCase(value) {
    return value.replace(/\w\S*/g, (word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase());
  }

  function cloneWithTimestamp(result) {
    return { ...JSON.parse(JSON.stringify(result)), timestamp: new Date().toISOString() };
  }

  function getAvailableModes() {
    return Object.keys(MODE_LABELS);
  }

  function getSupportedLanguages() {
    return [...SUPPORTED_LANGUAGES];
  }

  function getCacheStats() {
    return { entries: responseCache.size };
  }

  return {
    initialize,
    canHandle,
    run,
    detectIntent,
    getAvailableModes,
    getSupportedLanguages,
    getCacheStats
  };
}

if (typeof window !== 'undefined') {
  window.NeuralVerse = window.NeuralVerse || {};
  window.NeuralVerse.codeSimulationLaboratoryAgent = createCodeSimulationLaboratoryAgent();
}

export { createCodeSimulationLaboratoryAgent };
