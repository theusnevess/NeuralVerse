/**
 * NV-1000-A1 — Socratic Engine
 *
 * Generates guiding questions to facilitate reasoning.
 * Questions should promote thinking, not quiz grading.
 * Enhanced with layered question categories:
 * observation, interpretation, prediction, abstraction, transfer, synthesis.
 */

const SOCRATIC_LAYERS = {
  observation: [
    'What do you notice about this concept?',
    'What are the key components or elements?',
    'What patterns do you see?',
    'What evidence supports this idea?',
    'What are the observable properties?'
  ],
  interpretation: [
    'What do you think this means?',
    'Why do you think this is important?',
    'How would you explain this to someone else?',
    'What assumptions underlie this concept?',
    'What is the deeper meaning here?'
  ],
  prediction: [
    'What would happen if we changed this variable?',
    'What do you expect to see in this scenario?',
    'How would this behave under different conditions?',
    'What would be the consequence of removing this component?',
    'What might break if this assumption is wrong?'
  ],
  abstraction: [
    'What general principle does this illustrate?',
    'How does this connect to broader concepts?',
    'What is the essential idea here?',
    'What would a formal definition look like?',
    'How does this relate to first principles?'
  ],
  transfer: [
    'Where else have you seen this pattern?',
    'How would this apply in a different domain?',
    'What real-world systems use this principle?',
    'How would you adapt this for a new problem?',
    'What analogous situations can you think of?'
  ],
  synthesis: [
    'How does this connect to what you learned before?',
    'Can you combine this with another concept?',
    'What new understanding emerges from combining these ideas?',
    'How would you design a system using this principle?',
    'What questions does this raise for further exploration?'
  ]
};

const SOCRATIC_PATTERNS = {
  conceptual: [
    'What do you think this concept is fundamentally about?',
    'If you had to explain this to someone who knows nothing about the field, what would you say first?',
    'What is the core problem this concept solves?',
    'Can you think of a situation where this concept would NOT apply?',
    'What assumptions does this concept make?'
  ],
  relational: [
    'How does this connect to what you learned before?',
    'What would happen if we removed this concept from the system?',
    'Can you identify where this concept appears in other areas you have studied?',
    'What dependencies does this concept have?',
    'If this concept changed, what else would need to change?'
  ],
  critical: [
    'What are the limitations of this approach?',
    'Can you think of a case where this would fail?',
    'What trade-offs are being made here?',
    'Is there an alternative way to achieve the same goal?',
    'What evidence would convince you this is wrong?'
  ],
  application: [
    'How would you apply this in a real system?',
    'What would you need to change to make this work at scale?',
    'How would you test whether this is working correctly?',
    'What metrics would you use to evaluate this?',
    'What are the practical constraints?'
  ],
  mathematical: [
    'What does this formula represent geometrically?',
    'What happens to the output when this variable increases?',
    'Under what conditions would this term become zero?',
    'What is the relationship between these two variables?',
    'Can you derive this from first principles?'
  ],
  observation: SOCRATIC_LAYERS.observation,
  interpretation: SOCRATIC_LAYERS.interpretation,
  prediction: SOCRATIC_LAYERS.prediction,
  abstraction: SOCRATIC_LAYERS.abstraction,
  transfer: SOCRATIC_LAYERS.transfer,
  synthesis: SOCRATIC_LAYERS.synthesis
};

const SOCRATIC_TOPICS = {
  'neural network': {
    opening: 'Let\'s explore neural networks together. Instead of giving you the definition, I\'ll ask some questions to help you build the intuition yourself.',
    main: [
      'What do you think happens to information as it passes through multiple layers?',
      'If each layer transforms the data, what kind of transformation would be most useful early on vs. later?',
      'Why do you think we need multiple layers instead of just one?',
      'What would happen if all the weights were the same across all neurons?',
      'How does the network "know" which weights to use?'
    ],
    reflection: 'Take a moment to consider: if you were designing a system to recognize objects in images, what operations would you want it to perform at each stage? How does that compare to what neural networks actually do?'
  },
  'gradient descent': {
    opening: 'Gradient descent is one of the most important algorithms in machine learning. Let\'s think through how it works by considering a simple scenario.',
    main: [
      'Imagine you\'re standing on a mountain in fog. You can\'t see the bottom, but you can feel the slope. What would you do?',
      'What information do you need to decide which direction to move?',
      'What could go wrong if your steps are too large? Too small?',
      'The slope tells you the direction of steepest descent. Is steepest descent always the fastest route to the bottom?',
      'How does the "shape" of the mountain affect how easy it is to find the bottom?'
    ],
    reflection: 'Consider: in a real neural network, the "mountain" has millions of dimensions. How might that change the challenges compared to our simple 2D analogy?'
  },
  'overfitting': {
    opening: 'Overfitting is a fundamental challenge in machine learning. Rather than defining it, let\'s explore why it happens.',
    main: [
      'If a model gets 100% accuracy on training data but 60% on test data, what went wrong?',
      'What\'s the difference between "learning the pattern" and "memorizing the data"?',
      'If you had infinite training data, could overfitting still occur? Why or why not?',
      'What strategies might prevent a model from fitting noise instead of signal?',
      'How would you detect overfitting without looking at test performance?'
    ],
    reflection: 'Think about the bias-variance tradeoff: a model that is too simple underfits, and a model that is too complex overfits. How do you find the right balance in practice?'
  },
  'attention': {
    opening: 'The attention mechanism is at the heart of modern AI. Let\'s reason through why it was invented and what it does.',
    main: [
      'Before attention, how did sequence-to-sequence models pass information from input to output?',
      'What information might be lost in that approach?',
      'If you wanted the output to "look back" at specific parts of the input, how would you implement that?',
      'What makes "self-attention" different from regular attention?',
      'Why do you think attention has become so dominant across different domains (NLP, vision, audio)?'
    ],
    reflection: 'Consider: attention computes a weighted sum of values, where the weights are determined by the similarity between queries and keys. What does this remind you of in traditional information retrieval?'
  },
  'embedding': {
    opening: 'Embeddings are a powerful way to represent data. Let\'s think about why they work and what they capture.',
    main: [
      'If you had to represent the meaning of a word as a list of numbers, what would you include?',
      'What makes a "good" embedding? How would you know if two embeddings are capturing similar meanings?',
      'Why can\'t we just use one-hot vectors for representing words?',
      'What\'s the relationship between embedding space geometry and semantic similarity?',
      'If an embedding captures analogies (king - man + woman \u2248 queen), what does that tell us about the space?'
    ],
    reflection: 'Think about this: embeddings are learned from data, not hand-crafted. What biases might exist in the training data that would appear in the embeddings?'
  },
  'transformer': {
    opening: 'Transformers revolutionized deep learning. Let\'s think through the key insight that makes them work.',
    main: [
      'Before transformers, how did RNNs process sequences? What was the bottleneck?',
      'If you could process all positions simultaneously, what advantages would that give?',
      'How does "self-attention" differ from "cross-attention"?',
      'Why do transformers need positional encodings?',
      'What makes multi-head attention more powerful than single-head attention?'
    ],
    reflection: 'Consider: transformers compute O(n\u00b2) attention pairs. How does this scale, and what are the implications for very long sequences?'
  },
  'convolution': {
    opening: 'Convolutions are the backbone of computer vision. Let\'s think about why they work so well for images.',
    main: [
      'Why don\'t we just use fully connected layers for image processing?',
      'What property of images makes local processing effective?',
      'How does weight sharing in convolutions reduce the number of parameters?',
      'What is the relationship between kernel size and receptive field?',
      'How do pooling operations change the spatial representation?'
    ],
    reflection: 'Consider: a single convolution kernel detects one type of feature. How do multiple kernels work together to build complex representations?'
  },
  'recurrent neural network': {
    opening: 'RNNs were designed to handle sequential data. Let\'s think about how they process information over time.',
    main: [
      'How does an RNN maintain "memory" of previous inputs?',
      'What happens to the gradient as it flows through many timesteps?',
      'Why do LSTMs use gates? What problem do they solve?',
      'How does bidirectional processing differ from unidirectional?',
      'What makes sequence-to-sequence architectures different from simple RNNs?'
    ],
    reflection: 'Consider: RNNs process one timestep at a time. How does this limit parallelization compared to transformers?'
  },
  'loss function': {
    opening: 'The loss function is the compass that guides model training. Let\'s think about what makes a good one.',
    main: [
      'What properties should a good loss function have?',
      'Why do we need the loss to be differentiable?',
      'How does the choice of loss function affect what the model learns?',
      'What\'s the difference between a loss function and a metric?',
      'When would you choose cross-entropy over mean squared error?'
    ],
    reflection: 'Consider: the loss function defines what "good" means for the model. How might a poorly chosen loss lead to unintended behavior?'
  },
  'regularization': {
    opening: 'Regularization prevents models from memorizing training data. Let\'s think about why this is necessary.',
    main: [
      'Why doesn\'t a model with zero training error always perform well on new data?',
      'What\'s the difference between L1 and L2 regularization?',
      'How does dropout prevent overfitting?',
      'Why is early stopping considered a form of regularization?',
      'What role does data augmentation play in regularization?'
    ],
    reflection: 'Consider: regularization adds constraints to the model. How do you know when you\'re constraining too much (underfitting) vs. too little (overfitting)?'
  }
};

function createSocraticEngine() {
  function generate(topic, context, options = {}) {
    const lowerTopic = (topic || '').toLowerCase();
    const lowerQuery = (context?.userQuery || '').toLowerCase();
    const layers = options.layers || null;

    let topicKey = null;
    for (const key of Object.keys(SOCRATIC_TOPICS)) {
      if (lowerTopic.includes(key) || key.includes(lowerTopic) || lowerQuery.includes(key)) {
        topicKey = key;
        break;
      }
    }

    if (topicKey) {
      const result = { ...SOCRATIC_TOPICS[topicKey] };
      if (layers) {
        result.layers = generateLayeredQuestions(topic, layers);
      }
      return result;
    }

    return generateGeneric(topic, context, options);
  }

  function generateLayeredQuestions(topic, requestedLayers) {
    const result = {};
    const layerList = Array.isArray(requestedLayers) ? requestedLayers : [requestedLayers];

    for (const layer of layerList) {
      if (SOCRATIC_LAYERS[layer]) {
        result[layer] = pickRandom(SOCRATIC_LAYERS[layer], 3);
      }
    }

    return result;
  }

  function generateByLayer(topic, layer) {
    const questions = SOCRATIC_LAYERS[layer];
    if (!questions) return null;

    return {
      topic,
      layer,
      questions: pickRandom(questions, 4)
    };
  }

  function generateFullSpectrum(topic) {
    return {
      topic,
      layers: {
        observation: pickRandom(SOCRATIC_LAYERS.observation, 2),
        interpretation: pickRandom(SOCRATIC_LAYERS.interpretation, 2),
        prediction: pickRandom(SOCRATIC_LAYERS.prediction, 2),
        abstraction: pickRandom(SOCRATIC_LAYERS.abstraction, 2),
        transfer: pickRandom(SOCRATIC_LAYERS.transfer, 2),
        synthesis: pickRandom(SOCRATIC_LAYERS.synthesis, 2)
      }
    };
  }

  function generateGeneric(topic, context, options = {}) {
    const category = categorizeQuery(context?.userQuery || '');

    return {
      opening: `Let's think through **${topic}** together. I'll ask some questions to help you develop your own understanding.`,
      main: getRandomQuestions(category, 4),
      reflection: `Now that you've considered these questions, try to summarize in your own words what **${topic}** is about and why it matters. What surprised you?`
    };
  }

  function categorizeQuery(query) {
    const lower = query.toLowerCase();

    if (lower.includes('formula') || lower.includes('equation') || lower.includes('math') || lower.includes('derive')) {
      return 'mathematical';
    }
    if (lower.includes('apply') || lower.includes('use') || lower.includes('implement') || lower.includes('build')) {
      return 'application';
    }
    if (lower.includes('why') || lower.includes('limit') || lower.includes('trade') || lower.includes('fail')) {
      return 'critical';
    }
    if (lower.includes('connect') || lower.includes('relate') || lower.includes('depend') || lower.includes('prerequisite')) {
      return 'relational';
    }

    return 'conceptual';
  }

  function pickRandom(arr, count) {
    const shuffled = [...arr].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, count);
  }

  function getRandomQuestions(category, count) {
    const patterns = SOCRATIC_PATTERNS[category] || SOCRATIC_PATTERNS.conceptual;
    return pickRandom(patterns, count);
  }

  function getSocraticPrompt(topic) {
    const lower = (topic || '').toLowerCase();
    for (const [key, data] of Object.entries(SOCRATIC_TOPICS)) {
      if (lower.includes(key) || key.includes(lower)) {
        return data.opening;
      }
    }
    return `Let's explore **${topic}** through guided questioning.`;
  }

  function getAvailableTopics() {
    return Object.keys(SOCRATIC_TOPICS);
  }

  function getAvailableLayers() {
    return Object.keys(SOCRATIC_LAYERS);
  }

  function getQuestionsForLayer(layer) {
    return SOCRATIC_LAYERS[layer] || [];
  }

  return {
    generate,
    generateByLayer,
    generateFullSpectrum,
    generateLayeredQuestions,
    getSocraticPrompt,
    getAvailableTopics,
    getAvailableLayers,
    getQuestionsForLayer,
    SOCRATIC_PATTERNS,
    SOCRATIC_TOPICS,
    SOCRATIC_LAYERS
  };
}

if (typeof window !== 'undefined') {
  window.NeuralVerse = window.NeuralVerse || {};
  window.NeuralVerse.socraticEngine = createSocraticEngine();
}

export { createSocraticEngine, SOCRATIC_PATTERNS, SOCRATIC_TOPICS, SOCRATIC_LAYERS };
