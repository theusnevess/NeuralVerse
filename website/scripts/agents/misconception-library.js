/**
 * NV-1000-A1 — Misconception Library
 *
 * Internal library of common misconceptions in AI/ML/CS.
 * Proactively clarifies misunderstandings when relevant topics are detected.
 * Enhanced with structured profiles including whyLearnersBelieveIt,
 * correction, intuition, and verificationPrompt.
 */

const MISCONCEPTIONS = [
  {
    id: 'training-vs-inference',
    title: 'Training vs Inference Confusion',
    triggers: ['training', 'inference', 'train', 'deploy', 'production'],
    wrong: 'Training and inference are the same process, just at different times.',
    correct: 'Training learns patterns from data (optimization). Inference applies learned patterns to new data (prediction). They have fundamentally different computational profiles, failure modes, and optimization strategies.',
    impact: 'Confusing these leads to deploying training-time operations (like dropout) into production, or expecting inference to improve without retraining.',
    whyLearnersBelieveIt: 'Both involve feeding data through the model and getting outputs. The distinction between learning and applying is subtle when you first encounter ML.',
    intuition: 'Training is like studying for an exam — you\'re actively learning and adjusting. Inference is like taking the exam — you\'re applying what you learned without changing your knowledge.',
    verificationPrompt: 'If you left dropout active during inference, what would happen to the model\'s outputs? Why is this different from training behavior?'
  },
  {
    id: 'iou-vs-accuracy',
    title: 'IoU vs Classification Accuracy',
    triggers: ['iou', 'intersection over union', 'accuracy', 'object detection'],
    wrong: 'High accuracy means the model is good at detection.',
    correct: 'Accuracy measures classification correctness. IoU measures spatial overlap between predicted and ground-truth bounding boxes. A model can have 99% classification accuracy but terrible IoU if its boxes are poorly localized.',
    impact: 'In object detection, IoU (typically @0.5 threshold) is the primary metric for localization quality. Optimizing only for accuracy produces models that classify correctly but locate objects poorly.',
    whyLearnersBelieveIt: 'Accuracy is the most intuitive metric — "how often is the model right?" The spatial aspect of detection is less obvious when you\'re new to the field.',
    intuition: 'Think of a model that says "there\'s a cat in this image" (correct classification) but draws the bounding box around the wrong part of the image (poor localization). The classification is right, but the detection is wrong.',
    verificationPrompt: 'If your model classifies all objects correctly but draws bounding boxes that are 50% smaller than ground truth, what metric would reveal this problem?'
  },
  {
    id: 'embeddings-as-storage',
    title: 'Embeddings as Database Storage',
    triggers: ['embedding', 'vector', 'storage', 'retrieval', 'database', 'rag'],
    wrong: 'Embeddings store the original data in a compressed format.',
    correct: 'Embeddings are dense vector representations that capture semantic relationships. They do not store the original data — they encode patterns and relationships. Retrieval finds similar patterns, not exact copies.',
    impact: 'This misunderstanding leads to expecting perfect reconstruction from embeddings, or treating vector databases as lossless storage rather than semantic search systems.',
    whyLearnersBelieveIt: 'The word "embedding" suggests something is being "put into" a space, like storing items in a container. The concept of a lossy, semantic representation is unfamiliar.',
    intuition: 'An embedding is like a summary of meaning — it captures the essence of what something means, not the exact details of what it is. Two different sentences with the same meaning will have similar embeddings, even if they use completely different words.',
    verificationPrompt: 'If you have an embedding of a paragraph, can you reconstruct the original text? Why or why not?'
  },
  {
    id: 'attention-as-memory',
    title: 'Attention Mechanism as Memory',
    triggers: ['attention', 'memory', 'transformer', 'self-attention', 'context window'],
    wrong: 'The attention mechanism gives the model memory of all previous tokens.',
    correct: 'Attention computes weighted relationships between tokens in the current context window. It is a dynamic weighting mechanism, not a persistent memory store. Outside the context window, information is inaccessible.',
    impact: 'This confusion leads to misunderstanding context window limitations, expecting models to remember conversations across sessions, or misinterpreting attention weights as stored knowledge.',
    whyLearnersBelieveIt: 'Attention "remembers" relationships within the context window, which feels like memory. The distinction between "current context" and "persistent memory" is subtle.',
    intuition: 'Attention is like a spotlight that can illuminate any part of the current page. It can\'t see previous pages. The context window is the page size — once you turn the page, the previous content is gone.',
    verificationPrompt: 'If you have a conversation that exceeds the model\'s context window, what happens to the information from the beginning of the conversation?'
  },
  {
    id: 'overfitting-vs-memorization',
    title: 'Overfitting vs Memorization',
    triggers: ['overfit', 'memoriz', 'generaliz', 'regulari', 'training loss'],
    wrong: 'Overfitting means the model memorized the training data.',
    correct: 'Overfitting means the model learned patterns specific to the training data that do not generalize to new data. Memorization is one form of overfitting, but overfitting also includes learning spurious correlations, noise patterns, and dataset-specific biases.',
    impact: 'This distinction matters because regularization techniques target different forms of overfitting. Understanding the nuance helps choose the right mitigation strategy.',
    whyLearnersBelieveIt: 'Memorization is the most intuitive form of overfitting — it\'s easy to understand "learning the answers instead of the principles." The broader concept of spurious correlations is less obvious.',
    intuition: 'Overfitting is like a student who aces the practice exam because they memorized the exact questions, but also aces the real exam because they noticed the exam writer always includes a trick question about Topic X — even though Topic X isn\'t important. They learned both the content AND the exam-writing pattern.',
    verificationPrompt: 'If a model performs perfectly on training data but poorly on test data, and you add more training data that\'s similar to the existing data, will performance improve? Why or why not?'
  },
  {
    id: 'gradient-descent-convergence',
    title: 'Gradient Descent Always Converges',
    triggers: ['gradient', 'converge', 'learning rate', 'optimizer', 'sgd', 'loss'],
    wrong: 'Gradient descent will always find the optimal solution given enough time.',
    correct: 'Gradient descent may converge to local minima, saddle points, or oscillate without converging. Learning rate, batch size, optimizer choice, and loss landscape geometry all affect convergence. Practical training requires careful hyperparameter tuning.',
    impact: 'This misconception leads to poor debugging when training fails — assuming the model just needs more epochs rather than investigating learning rate, architecture, or data issues.',
    whyLearnersBelieveIt: 'The intuition that "going downhill eventually reaches the bottom" is strong. The concept of saddle points and local minima in high-dimensional spaces is counterintuitive.',
    intuition: 'In a 2D landscape, you might get stuck in a small valley (local minimum). In millions of dimensions, saddle points are more common — places that are downhill in some directions but uphill in others. The optimizer can get stuck there.',
    verificationPrompt: 'If your loss plateaus at a non-zero value, what are three different things that could cause this, and how would you diagnose each?'
  },
  {
    id: 'loss-vs-accuracy',
    title: 'Loss Decrease = Accuracy Increase',
    triggers: ['loss', 'accuracy', 'metric', 'objective', 'training curve'],
    wrong: 'If the loss is decreasing, the model is getting better.',
    correct: 'Loss and accuracy are related but distinct metrics. Loss can decrease while accuracy plateaus, or loss can increase while accuracy improves (e.g., with label smoothing). Always monitor both training and validation metrics.',
    impact: 'Relying solely on loss curves can mask overfitting, underfitting, or metric-objective misalignment.',
    whyLearnersBelieveIt: 'Loss is the quantity being optimized, so it seems like it should directly correlate with performance. The disconnect between optimization objective and evaluation metric is non-obvious.',
    intuition: 'Loss is like a student\'s internal confidence score — it measures how certain the model feels about its predictions. Accuracy is like the exam score — it measures how many predictions are correct. A model can feel very confident (low loss) but be wrong (low accuracy), or feel uncertain (high loss) but be right (high accuracy).',
    verificationPrompt: 'Can you think of a scenario where loss increases but accuracy also increases? What does this tell you about the relationship between loss and accuracy?'
  },
  {
    id: 'batch-vs-epoch',
    title: 'Batch Size vs Epoch Confusion',
    triggers: ['batch', 'epoch', 'iteration', 'step', 'mini-batch', 'training'],
    wrong: 'One batch is one epoch.',
    correct: 'An epoch is one complete pass through the entire training dataset. A batch (or mini-batch) is a subset of data processed before updating weights. One epoch contains multiple batches: num_batches = dataset_size / batch_size.',
    impact: 'Confusing these leads to incorrect training schedules, wrong learning rate decay calculations, and misunderstood computational budgets.',
    whyLearnersBelieveIt: 'Both involve processing data and updating weights, so they feel like the same thing. The distinction between "one complete pass" and "one update step" is subtle.',
    intuition: 'An epoch is like reading an entire book. A batch is like reading one chapter and then discussing it. You might discuss several chapters (batches) before you\'ve finished the book (epoch).',
    verificationPrompt: 'If you have 1000 training samples and a batch size of 100, how many weight updates happen per epoch? How does this change if you double the batch size?'
  },
  {
    id: 'supervised-vs-unsupervised',
    title: 'Supervised vs Unsupervised Boundaries',
    triggers: ['supervised', 'unsupervised', 'labeled', 'unlabeled', 'semi-supervised', 'self-supervised'],
    wrong: 'Self-supervised learning is a form of unsupervised learning.',
    correct: 'Self-supervised learning generates its own labels from the data structure (e.g., predicting the next token). It uses supervision signals, just not human-provided labels. It is distinct from unsupervised learning, which finds structure without any explicit supervision signal.',
    impact: 'This distinction matters for understanding why self-supervised methods (like GPT, BERT) are so powerful — they leverage massive unlabeled data with learned supervision signals.',
    whyLearnersBelieveIt: 'Self-supervised uses unlabeled data, which sounds like unsupervised. The key insight — that it generates its own labels — is often glossed over in introductions.',
    intuition: 'Unsupervised learning is like sorting a pile of photos into groups without knowing what\'s in them — you might group by color, size, or visual similarity. Self-supervised learning is like using the photos themselves to create a puzzle (predict the missing piece) and learning from solving it.',
    verificationPrompt: 'If a model is trained to predict the next word in a sentence, is it using supervision? Where does the supervision signal come from?'
  },
  {
    id: 'bias-variance-tradeoff',
    title: 'Bias-Variance Tradeoff Oversimplification',
    triggers: ['bias', 'variance', 'tradeoff', 'trade-off', 'underfit', 'complexity'],
    wrong: 'More model complexity always increases variance and decreases bias.',
    correct: 'The classical bias-variance tradeoff is a useful framework but breaks down with modern deep learning. Double descent phenomena show that very large models can have both low bias AND low variance. The relationship is not always monotonic.',
    impact: 'Blindly applying the classical tradeoff to deep learning can lead to suboptimal model sizing decisions.',
    whyLearnersBelieveIt: 'The bias-variance tradeoff is taught as a fundamental principle, and the exceptions (double descent) are recent discoveries that haven\'t made it into most curricula yet.',
    intuition: 'The classical view says: simple model = high bias, low variance; complex model = low bias, high variance. But modern deep learning shows that very large models can have low bias AND low variance — they just need more data and careful regularization.',
    verificationPrompt: 'If you double the size of a neural network and also double the training data, what happens to bias and variance? Is the answer always the same?'
  },
  {
    id: 'dropout-at-inference',
    title: 'Dropout at Inference Time',
    triggers: ['dropout', 'inference', 'eval', 'predict', 'test time'],
    wrong: 'Dropout should be active during inference to add robustness.',
    correct: 'Dropout is disabled during inference. During training, it randomly zeros activations to prevent co-adaptation. During inference, all neurons are active and outputs are scaled appropriately (or equivalently, training outputs are scaled by 1/(1-p)).',
    impact: 'Leaving dropout active during inference produces stochastic, non-deterministic outputs and degrades performance.',
    whyLearnersBelieveIt: 'Dropout is described as "adding noise for robustness," so it seems like it should help at inference too. The distinction between training regularization and inference computation is often unclear.',
    intuition: 'Dropout is like practicing with one hand tied behind your back — it forces you to develop backup strategies. But when you actually perform, you want both hands free. At inference, you want the full network working together.',
    verificationPrompt: 'If you left dropout active during inference with p=0.5, and ran the same input through the model 10 times, would you get the same output each time? Why is this a problem?'
  },
  {
    id: 'normalization-scope',
    title: 'Batch Norm at Inference Time',
    triggers: ['batch norm', 'normalization', 'running mean', 'inference', 'eval'],
    wrong: 'Batch normalization uses the current batch statistics during inference.',
    correct: 'During inference, batch normalization uses running mean and running variance accumulated during training. Using batch statistics at inference would make predictions dependent on batch composition, which is non-deterministic and often impractical.',
    impact: 'Incorrect normalization at inference causes distribution shift between training and deployment, leading to degraded performance.',
    whyLearnersBelieveIt: 'Batch norm is described as "normalizing across the batch," so it seems like it should work the same way at inference. The distinction between training-time normalization and inference-time normalization is often glossed over.',
    intuition: 'During training, batch norm is like a teacher grading on a curve — the grade depends on how the class performs. During inference, it\'s like using the historical average — the grade depends on past performance, not the current batch.',
    verificationPrompt: 'If you process a single image at inference time (batch size = 1), what happens to batch normalization? Why is this different from training with batch size = 1?'
  }
];

function createMisconceptionLibrary() {
  function detect(topic, query) {
    const combined = `${topic} ${query}`.toLowerCase();
    const detected = [];

    for (const misconception of MISCONCEPTIONS) {
      const matchCount = misconception.triggers.filter(t => combined.includes(t)).length;
      if (matchCount >= 1) {
        detected.push({
          ...misconception,
          relevance: matchCount / misconception.triggers.length
        });
      }
    }

    detected.sort((a, b) => b.relevance - a.relevance);
    return detected.slice(0, 3);
  }

  function detectProactive(topic, query) {
    const combined = `${topic} ${query}`.toLowerCase();
    const detected = [];

    for (const misconception of MISCONCEPTIONS) {
      const matchCount = misconception.triggers.filter(t => combined.includes(t)).length;
      if (matchCount >= 2) {
        detected.push({
          ...misconception,
          relevance: matchCount / misconception.triggers.length
        });
      }
    }

    detected.sort((a, b) => b.relevance - a.relevance);
    return detected.slice(0, 2);
  }

  function getAll() {
    return [...MISCONCEPTIONS];
  }

  function getById(id) {
    return MISCONCEPTIONS.find(m => m.id === id) || null;
  }

  function getByTrigger(word) {
    const lower = word.toLowerCase();
    return MISCONCEPTIONS.filter(m =>
      m.triggers.some(t => lower.includes(t))
    );
  }

  function getFormattedProfile(misconception) {
    if (!misconception) return null;

    let content = `**Misconception: ${misconception.title}**\n\n`;
    content += `*Wrong belief:* ${misconception.wrong}\n\n`;
    content += `*Correct understanding:* ${misconception.correct}\n\n`;
    content += `*Why learners believe this:* ${misconception.whyLearnersBelieveIt}\n\n`;
    content += `*Intuition:* ${misconception.intuition}\n\n`;
    content += `*Verification:* ${misconception.verificationPrompt}\n\n`;
    content += `*Why it matters:* ${misconception.impact}`;

    return content;
  }

  function getProfileById(id) {
    const misconception = getById(id);
    return getFormattedProfile(misconception);
  }

  return {
    detect,
    detectProactive,
    getAll,
    getById,
    getByTrigger,
    getFormattedProfile,
    getProfileById,
    MISCONCEPTIONS
  };
}

if (typeof window !== 'undefined') {
  window.NeuralVerse = window.NeuralVerse || {};
  window.NeuralVerse.misconceptionLibrary = createMisconceptionLibrary();
}

export { createMisconceptionLibrary, MISCONCEPTIONS };
