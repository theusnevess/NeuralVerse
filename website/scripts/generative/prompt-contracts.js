/**
 * NV-1100-P11 — Prompt Contracts
 * Enforces governance-compliant prompt templates for generative layer.
 * Every prompt must contain a governance header.
 */
(function () {
  'use strict';

  var GOVERNANCE_HEADER = [
    'You are a local educational assistant for NeuralVerse.',
    'Rules:',
    '- Generated answers are non-canonical. Always suggest verifying with canonical material.',
    '- Do not invent citations or sources.',
    '- Do not infer mastery, competence, intelligence, or learner ability.',
    '- Do not claim the learner is proficient, failing, or has scored.',
    '- Distinguish deterministic facts from generated suggestions.',
    '- Use only the provided context. Do not hallucinate information.',
    '- Do not provide medical, legal, or financial advice beyond educational context.',
    '- Be concise, accurate, and helpful.'
  ].join('\n');

  var MODES = {
    explain: {
      id: 'explain',
      label: 'Explain this concept',
      suffix: 'Provide a clear, accurate explanation of the following concept. Use the provided context. Be educational and precise.'
    },
    simplify: {
      id: 'simplify',
      label: 'Simplify explanation',
      suffix: 'Rewrite the following explanation in simpler terms. Maintain accuracy while making it more accessible.'
    },
    deepen: {
      id: 'deepen',
      label: 'Deepen explanation',
      suffix: 'Provide a deeper, more detailed explanation of the following. Include nuances, edge cases, and advanced insights.'
    },
    analogy: {
      id: 'analogy',
      label: 'Generate analogy',
      suffix: 'Generate a helpful analogy to explain the following concept. The analogy should be accurate and educational.'
    },
    socratic: {
      id: 'socratic',
      label: 'Generate Socratic questions',
      suffix: 'Generate 3-5 Socratic questions that would help someone understand the following concept through guided inquiry.'
    },
    summarize: {
      id: 'summarize',
      label: 'Summarize artifact',
      suffix: 'Provide a concise summary of the following content. Highlight key points and main ideas.'
    },
    note: {
      id: 'note',
      label: 'Draft study note',
      suffix: 'Draft a study note based on the following content. Include key definitions, examples, and relationships.'
    },
    lab: {
      id: 'lab',
      label: 'Suggest lab exploration',
      suffix: 'Suggest how to explore the following concept through a hands-on laboratory exercise.'
    },
    code: {
      id: 'code',
      label: 'Explain code',
      suffix: 'Explain the following code. Describe what it does, how it works, and any important patterns.'
    },
    viz: {
      id: 'viz',
      label: 'Explain visualization',
      suffix: 'Explain the following visualization. Describe what it shows, how to interpret it, and key insights.'
    },
    question: {
      id: 'question',
      label: 'Generate practice question draft',
      suffix: 'Generate a practice question draft based on the following content. This is a draft only and must be reviewed before use.'
    }
  };

  function buildPrompt(mode, contextPack, userQuery) {
    var modeConfig = MODES[mode] || MODES.explain;
    var parts = [GOVERNANCE_HEADER, ''];

    if (contextPack && contextPack.length > 0) {
      parts.push('Context:');
      contextPack.forEach(function (ctx) {
        parts.push('[' + (ctx.type || 'context') + '] ' + (ctx.title || '') + ': ' + (ctx.excerpt || '').substring(0, 500));
      });
      parts.push('');
    }

    parts.push(modeConfig.suffix);
    parts.push('');

    if (userQuery) {
      parts.push('User request: ' + userQuery);
    }

    parts.push('');
    parts.push('IMPORTANT: This is a generated response from a local model. It is non-canonical. Always verify with official NeuralVerse materials.');

    return parts.join('\n');
  }

  function getModes() { return Object.keys(MODES).map(function (k) { return MODES[k]; }); }
  function getMode(id) { return MODES[id] || null; }
  function getGovernanceHeader() { return GOVERNANCE_HEADER; }

  window.NeuralVerse = window.NeuralVerse || {};
  window.NeuralVerse.PromptContracts = {
    buildPrompt: buildPrompt,
    getModes: getModes,
    getMode: getMode,
    getGovernanceHeader: getGovernanceHeader,
    GOVERNANCE_HEADER: GOVERNANCE_HEADER,
    MODES: MODES
  };
})();
