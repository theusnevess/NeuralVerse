/**
 * NV-1000-A1 — Comparison Engine
 *
 * Generates structured comparisons between two concepts.
 * Only compares concepts present in the curriculum or explicitly requested.
 * Enhanced with similarities, assumptions, trade-offs, and limitations.
 */

const COMPARISON_ASPECTS = [
  'Purpose',
  'Core Mechanism',
  'Inputs',
  'Outputs',
  'Training Approach',
  'Inference Cost',
  'Typical Use Cases',
  'Key Limitations',
  'When to Choose'
];

const KNOWN_COMPARISONS = {
  'supervised vs unsupervised': {
    aspects: {
      'Purpose': { A: 'Learn from labeled input-output pairs', B: 'Discover hidden structure in unlabeled data' },
      'Core Mechanism': { A: 'Minimize prediction error against ground truth', B: 'Minimize reconstruction loss or maximize data likelihood' },
      'Inputs': { A: 'Labeled datasets (input, target) pairs', B: 'Unlabeled datasets (input only)' },
      'Outputs': { A: 'Predictions that map inputs to known targets', B: 'Clusters, latent representations, or generated samples' },
      'Training Approach': { A: 'Backpropagation with labeled loss', B: 'Clustering objectives, autoencoders, GANs, or contrastive learning' },
      'Inference Cost': { A: 'Typically low (single forward pass)', B: 'Varies widely by method' },
      'Typical Use Cases': { A: 'Classification, regression, structured prediction', B: 'Anomaly detection, data exploration, pretraining' },
      'Key Limitations': { A: 'Requires expensive labeled data', B: 'Less direct control over output semantics' },
      'When to Choose': { A: 'When labels are available and task is well-defined', B: 'When labels are scarce or exploring data structure' }
    },
    similarities: 'Both learn patterns from data. Both can be evaluated on held-out test sets. Both have bias-variance tradeoffs.',
    assumptions: 'Supervised assumes labels are accurate and representative. Unsupervised assumes structure exists in the data.',
    tradeoffs: 'Supervised gives direct task performance but needs labels. Unsupervised discovers structure but requires downstream validation.'
  },
  'rnn vs transformer': {
    aspects: {
      'Purpose': { A: 'Process sequential data one step at a time', B: 'Process all positions simultaneously with attention' },
      'Core Mechanism': { A: 'Recurrent hidden state passed forward in time', B: 'Self-attention computes pairwise position relationships' },
      'Inputs': { A: 'Sequential tokens, processed left-to-right', B: 'All tokens at once, with positional encodings' },
      'Outputs': { A: 'Hidden states at each timestep', B: 'Contextualized representations for all positions' },
      'Training Approach': { A: 'BPTT (Backpropagation Through Time), prone to vanishing gradients', B: 'Parallel backpropagation, more stable gradients' },
      'Inference Cost': { A: 'O(n) sequential steps, memory efficient', B: 'O(n\u00b2) attention compute, O(n) with optimizations' },
      'Typical Use Cases': { A: 'Real-time streaming, low-resource deployment', B: 'Large-scale NLP, vision, multimodal tasks' },
      'Key Limitations': { A: 'Slow training, difficulty with long-range dependencies', B: 'Quadratic memory in sequence length' },
      'When to Choose': { A: 'When latency or memory is constrained', B: 'When parallel training and long-range context are needed' }
    },
    similarities: 'Both process sequential data. Both use learnable parameters. Both can generate sequences. Both use backpropagation for training.',
    assumptions: 'RNN assumes sequential order matters. Transformer assumes all positions can attend to each other.',
    tradeoffs: 'RNN is memory-efficient but slow to train. Transformer trains fast but requires more memory.'
  },
  'cnn vs transformer': {
    aspects: {
      'Purpose': { A: 'Extract spatial hierarchies through local receptive fields', B: 'Model global relationships through attention' },
      'Core Mechanism': { A: 'Convolution kernels slide across spatial dimensions', B: 'Query-key-value attention across all positions' },
      'Inputs': { A: 'Gridded data (images, spectrograms)', B: 'Sequences or flattened patches with positional info' },
      'Outputs': { A: 'Feature maps with spatial structure preserved', B: 'Contextualized embeddings for each position' },
      'Training Approach': { A: 'Efficient local parameter sharing', B: 'Global parameter sharing via attention heads' },
      'Inference Cost': { A: 'O(k\u00b2n) for kernel size k, highly optimized', B: 'O(n\u00b2) attention, improving with sparse methods' },
      'Typical Use Cases': { A: 'Image classification, detection, segmentation', B: 'NLP, multimodal, increasingly vision (ViT)' },
      'Key Limitations': { A: 'Limited global receptive field without stacking', B: 'Data hungry, expensive at scale' },
      'When to Choose': { A: 'When local patterns dominate and data is limited', B: 'When global context and scale are paramount' }
    },
    similarities: 'Both learn hierarchical features. Both use backpropagation. Both can process spatial data. Both have local computation patterns.',
    assumptions: 'CNN assumes local patterns are most important. Transformer assumes global context matters.',
    tradeoffs: 'CNN is parameter-efficient but limited receptive field. Transformer has global reach but quadratic cost.'
  },
  'precision vs recall': {
    aspects: {
      'Purpose': { A: 'Measure how many selected items are relevant', B: 'Measure how many relevant items are selected' },
      'Core Mechanism': { A: 'TP / (TP + FP) \u2014 penalizes false positives', B: 'TP / (TP + FN) \u2014 penalizes false negatives' },
      'Inputs': { A: 'Predicted positives and actual positives', B: 'Predicted positives and actual positives' },
      'Outputs': { A: 'A ratio between 0 and 1', B: 'A ratio between 0 and 1' },
      'Training Approach': { A: 'Optimized via threshold tuning or loss weighting', B: 'Optimized via threshold tuning or loss weighting' },
      'Inference Cost': { A: 'Zero additional cost', B: 'Zero additional cost' },
      'Typical Use Cases': { A: 'Spam filtering (minimize false positives)', B: 'Medical diagnosis (minimize false negatives)' },
      'Key Limitations': { A: 'Ignores missed detections', B: 'Ignores false alarms' },
      'When to Choose': { A: 'When false positives are costly', B: 'When false negatives are costly' }
    },
    similarities: 'Both are binary classification metrics. Both range from 0 to 1. Both are computed from the confusion matrix. Both are affected by the decision threshold.',
    assumptions: 'Precision assumes false positives are the primary concern. Recall assumes false negatives are the primary concern.',
    tradeoffs: 'Increasing precision typically decreases recall and vice versa. The F1 score balances both.'
  },
  'gan vs autoencoder': {
    aspects: {
      'Purpose': { A: 'Generate realistic synthetic data through adversarial training', B: 'Learn compressed representations through reconstruction' },
      'Core Mechanism': { A: 'Generator vs Discriminator adversarial game', B: 'Encoder-decoder with reconstruction loss' },
      'Inputs': { A: 'Random noise vector (latent code)', B: 'Input data to be reconstructed' },
      'Outputs': { A: 'Synthetic samples resembling training data', B: 'Reconstructed input and latent representation' },
      'Training Approach': { A: 'Minimax game: generator fools discriminator', B: 'Minimize reconstruction error (MSE, cross-entropy)' },
      'Inference Cost': { A: 'Single generator forward pass', B: 'Single encoder-decoder forward pass' },
      'Typical Use Cases': { A: 'Image generation, style transfer, data augmentation', B: 'Dimensionality reduction, denoising, anomaly detection' },
      'Key Limitations': { A: 'Training instability, mode collapse', B: 'Blurry outputs, limited generation quality' },
      'When to Choose': { A: 'When generation quality matters most', B: 'When representation learning or reconstruction matters' }
    },
    similarities: 'Both learn latent representations. Both can generate new samples. Both use neural networks. Both can be used for data augmentation.',
    assumptions: 'GAN assumes adversarial training converges. Autoencoder assumes reconstruction reflects important features.',
    tradeoffs: 'GAN produces sharper outputs but is harder to train. Autoencoder is stable but produces blurrier outputs.'
  },
  'sgd vs adam': {
    aspects: {
      'Purpose': { A: 'Update model parameters using stochastic gradient estimates', B: 'Adaptive learning rate optimization with momentum' },
      'Core Mechanism': { A: 'w = w - lr * gradient', B: 'Adaptive lr per parameter using first and second moment estimates' },
      'Inputs': { A: 'Gradient and learning rate', B: 'Gradient, learning rate, and momentum parameters' },
      'Outputs': { A: 'Updated parameters', B: 'Updated parameters with adaptive scaling' },
      'Training Approach': { A: 'Simple, predictable convergence', B: 'Faster convergence, less hyperparameter tuning' },
      'Inference Cost': { A: 'Minimal overhead', B: 'Moderate overhead (maintains moment estimates)' },
      'Typical Use Cases': { A: 'Large-scale training, simple baselines', B: 'Most deep learning tasks, fine-tuning' },
      'Key Limitations': { A: 'Requires careful lr tuning, sensitive to initialization', B: 'Can generalize worse than SGD, memory overhead' },
      'When to Choose': { A: 'When you want predictable behavior and generalization', B: 'When you want fast convergence and less tuning' }
    },
    similarities: 'Both are first-order optimization methods. Both use gradient information. Both require a learning rate. Both can escape shallow local minima.',
    assumptions: 'SGD assumes uniform learning rate is sufficient. Adam assumes per-parameter adaptation helps.',
    tradeoffs: 'SGD often generalizes better but converges slower. Adam converges faster but may generalize worse.'
  },
  'bert vs gpt': {
    aspects: {
      'Purpose': { A: 'Bidirectional language understanding', B: 'Unidirectional language generation' },
      'Core Mechanism': { A: 'Masked language modeling (MLM)', B: 'Causal language modeling (next token prediction)' },
      'Inputs': { A: 'Full sequence with [MASK] tokens', B: 'Prefix sequence (left-to-right only)' },
      'Outputs': { A: 'Contextualized embeddings for all positions', B: 'Next token probability distribution' },
      'Training Approach': { A: 'Predict masked tokens from bidirectional context', B: 'Predict next token from left context only' },
      'Inference Cost': { A: 'Full forward pass through all layers', B: 'Autoregressive generation, one token at a time' },
      'Typical Use Cases': { A: 'Classification, NER, question answering', B: 'Text generation, completion,对话' },
      'Key Limitations': { A: 'Not designed for generation, fixed input length', B: 'Cannot use bidirectional context, hallucination risk' },
      'When to Choose': { A: 'When understanding context matters most', B: 'When generating coherent text matters most' }
    },
    similarities: 'Both are transformer-based. Both use self-attention. Both are pre-trained on large corpora. Both can be fine-tuned for downstream tasks.',
    assumptions: 'BERT assumes bidirectional context is always beneficial. GPT assumes left-to-right generation is sufficient.',
    tradeoffs: 'BERT excels at understanding but cannot generate. GPT excels at generation but lacks bidirectional context.'
  },
  'batch vs mini-batch vs stochastic': {
    aspects: {
      'Purpose': { A: 'Use entire dataset per update', B: 'Use subset of data per update' },
      'Core Mechanism': { A: 'Average gradient over all samples', B: 'Average gradient over batch size k samples' },
      'Inputs': { A: 'Full training dataset', B: 'Random subset of training data' },
      'Outputs': { A: 'Single parameter update per epoch', B: 'Multiple parameter updates per epoch' },
      'Training Approach': { A: 'Deterministic gradients, stable but slow', B: 'Noisy gradients, faster but less stable' },
      'Inference Cost': { A: 'Requires full dataset in memory', B: 'Requires only batch-sized chunks' },
      'Typical Use Cases': { A: 'Small datasets, convex optimization', B: 'Large datasets, deep learning' },
      'Key Limitations': { A: 'Memory intensive, slow for large datasets', B: 'Noisy updates may cause oscillation' },
      'When to Choose': { A: 'When dataset fits in memory and stability matters', B: 'When dataset is large and speed matters' }
    },
    similarities: 'All use gradient information. All update model parameters. All converge to similar solutions given enough time. All require a learning rate.',
    assumptions: 'Batch assumes full gradient is necessary. Mini-batch assumes noisy gradient is acceptable. SGD assumes single-sample gradient is sufficient.',
    tradeoffs: 'Batch is stable but slow. Mini-batch balances speed and stability. SGD is fastest but noisiest.'
  },
  'relu vs sigmoid vs tanh': {
    aspects: {
      'Purpose': { A: 'Introduce non-linearity with simple thresholding', B: 'Squash values to (0,1) or (-1,1)' },
      'Core Mechanism': { A: 'max(0, x)', B: '1/(1+e^-x) or (e^x-e^-x)/(e^x+e^-x)' },
      'Inputs': { A: 'Any real number', B: 'Any real number' },
      'Outputs': { A: '[0, +inf)', B: '(0,1) or (-1,1)' },
      'Training Approach': { A: 'Simple gradient, no saturation', B: 'Gradient vanishes for extreme values' },
      'Inference Cost': { A: 'Very cheap (comparison)', B: 'More expensive (exponential)' },
      'Typical Use Cases': { A: 'Hidden layers in deep networks', B: 'Output layers, gates in RNNs' },
      'Key Limitations': { A: 'Dead neurons for negative inputs', B: 'Vanishing gradient problem' },
      'When to Choose': { A: 'Default choice for hidden layers', B: 'When bounded output is needed' }
    },
    similarities: 'All introduce non-linearity. All are differentiable (except ReLU at 0). All can be used in neural networks. All have learnable parameters.',
    assumptions: 'ReLU assumes sparsity is beneficial. Sigmoid assumes bounded output is important. Tanh assumes zero-centered output helps.',
    tradeoffs: 'ReLU is fast but can cause dead neurons. Sigmoid is smooth but suffers vanishing gradients. Tanh is zero-centered but still saturates.'
  }
};

function createComparisonEngine() {
  function parseComparisonQuery(query) {
    const lower = (query || '').toLowerCase();
    let conceptA = '';
    let conceptB = '';

    const separators = [' vs ', ' versus ', ' compared to ', ' and ', ' or '];
    for (const sep of separators) {
      if (lower.includes(sep)) {
        const parts = lower.split(sep);
        conceptA = parts[0].replace(/^(compare|what|how|the|difference between)\s*/i, '').trim();
        conceptB = parts[1].replace(/^(and|with|to)\s*/i, '').trim();
        break;
      }
    }

    if (!conceptA || !conceptB) {
      const words = query.split(/\s+/);
      conceptA = words.slice(0, Math.ceil(words.length / 2)).join(' ');
      conceptB = words.slice(Math.ceil(words.length / 2)).join(' ');
    }

    return { conceptA, conceptB };
  }

  function compare(conceptA, conceptB, context) {
    const key = findKnownComparison(conceptA, conceptB);

    if (key && KNOWN_COMPARISONS[key]) {
      return buildFromKnown(KNOWN_COMPARISONS[key], conceptA, conceptB);
    }

    return buildGenericComparison(conceptA, conceptB, context);
  }

  function findKnownComparison(a, b) {
    const combined = `${a} vs ${b}`;
    const reversed = `${b} vs ${a}`;

    for (const key of Object.keys(KNOWN_COMPARISONS)) {
      const normalized = key.replace(/\s+/g, ' ').toLowerCase();
      if (normalized === combined || normalized === reversed) {
        return key;
      }
    }

    for (const key of Object.keys(KNOWN_COMPARISONS)) {
      const parts = key.split(' vs ');
      if (parts.length === 2) {
        const aMatch = parts[0].trim().includes(a) || a.includes(parts[0].trim());
        const bMatch = parts[1].trim().includes(b) || b.includes(parts[1].trim());
        if (aMatch && bMatch) return key;

        const aMatchR = parts[0].trim().includes(b) || b.includes(parts[0].trim());
        const bMatchR = parts[1].trim().includes(a) || a.includes(parts[1].trim());
        if (aMatchR && bMatchR) return key;
      }
    }

    return null;
  }

  function buildFromKnown(comparison, conceptA, conceptB) {
    let table = '| Aspect | ' + conceptA + ' | ' + conceptB + ' |\n';
    table += '| --- | --- | --- |\n';

    for (const aspect of COMPARISON_ASPECTS) {
      if (comparison.aspects[aspect]) {
        const a = comparison.aspects[aspect].A;
        const b = comparison.aspects[aspect].B;
        table += `| ${aspect} | ${a} | ${b} |\n`;
      }
    }

    const differences = generateDifferences(comparison.aspects);
    const guidance = generateGuidance(conceptA, conceptB, comparison.aspects);
    const similarities = comparison.similarities || generateSimilarities(conceptA, conceptB);
    const assumptions = comparison.assumptions || '';
    const tradeoffs = comparison.tradeoffs || '';

    return { table, differences, guidance, similarities, assumptions, tradeoffs };
  }

  function buildGenericComparison(conceptA, conceptB, context) {
    let table = '| Aspect | ' + conceptA + ' | ' + conceptB + ' |\n';
    table += '| --- | --- | --- |\n';
    table += '| Purpose | Related to ' + conceptA + ' | Related to ' + conceptB + ' |\n';
    table += '| Context | Present in current curriculum | Present in current curriculum |\n';

    const differences = `Both **${conceptA}** and **${conceptB}** are concepts within the current curriculum. ` +
      `A detailed comparison requires deeper analysis of their specific implementations and use cases within the NeuralVerse learning paths.`;

    const guidance = `To determine which is more relevant to your current study, consider your position in the curriculum ` +
      `and which concept appears more frequently in the prerequisite chain.`;

    const similarities = `Both concepts are part of the AI/ML curriculum and share common theoretical foundations.`;

    return { table, differences, guidance, similarities, assumptions: '', tradeoffs: '' };
  }

  function generateDifferences(aspects) {
    let content = '**Key Differences:**\n\n';
    let count = 0;

    for (const [aspect, values] of Object.entries(aspects)) {
      if (values.A !== values.B && count < 3) {
        content += `- **${aspect}:** ${values.A} vs ${values.B}\n`;
        count++;
      }
    }

    return content;
  }

  function generateGuidance(conceptA, conceptB, aspects) {
    let content = `**When to choose ${conceptA}:**\n`;
    content += `Consider ${conceptA} when the situation emphasizes its strengths`;
    if (aspects['Key Limitations']?.B) {
      content += ` and ${aspects['Key Limitations'].B.toLowerCase()}`;
    }
    content += '.\n\n';

    content += `**When to choose ${conceptB}:**\n`;
    content += `Consider ${conceptB} when the situation emphasizes its strengths`;
    if (aspects['Key Limitations']?.A) {
      content += ` and ${aspects['Key Limitations'].A.toLowerCase()}`;
    }
    content += '.';

    return content;
  }

  function generateSimilarities(conceptA, conceptB) {
    return `Both **${conceptA}** and **${conceptB}** are concepts within the AI/ML domain. They share common theoretical foundations and are often used in complementary ways.`;
  }

  function getAvailableComparisons() {
    return Object.keys(KNOWN_COMPARISONS);
  }

  function getComparisonDetails(key) {
    return KNOWN_COMPARISONS[key] || null;
  }

  return {
    parseComparisonQuery,
    compare,
    getAvailableComparisons,
    getComparisonDetails,
    getKnownComparisons: () => Object.keys(KNOWN_COMPARISONS),
    COMPARISON_ASPECTS
  };
}

if (typeof window !== 'undefined') {
  window.NeuralVerse = window.NeuralVerse || {};
  window.NeuralVerse.comparisonEngine = createComparisonEngine();
}

export { createComparisonEngine, KNOWN_COMPARISONS };
