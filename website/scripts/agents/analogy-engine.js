/**
 * NV-1000-A1 — Analogy Engine
 *
 * Generates technically faithful, domain-appropriate analogies.
 * Explicitly states limitations. Avoids misleading simplifications.
 * Supports multiple domains: physics, everyday life, engineering,
 * transportation, libraries, cities, manufacturing, biology.
 */

const ANALOGY_TEMPLATES = {
  'neural network': [
    {
      analogy: 'A neural network is like a factory assembly line. Raw materials (input data) enter at one end, and each station (layer) performs a specific transformation. Early stations handle simple operations (edge detection), while later stations combine these into complex products (object recognition). The factory manager (loss function) tells each station how to adjust its operations based on the quality of the final product.',
      limitations: 'Unlike a real factory, neural networks learn their operations automatically. Also, information flows in parallel across many units, not sequentially through one path.',
      domain: 'manufacturing'
    },
    {
      analogy: 'A neural network is like a city water treatment system. Water enters muddy (raw data), and each processing stage removes different impurities. The first stages filter large particles (simple features), later stages handle molecular-level purification (complex patterns). The quality report at the end tells each stage how to adjust.',
      limitations: 'Water treatment is a fixed process. Neural networks learn their processing steps from data, and the "impurities" they remove are abstract statistical patterns, not physical contaminants.',
      domain: 'engineering'
    },
    {
      analogy: 'A neural network is like a biological nervous system. Sensory neurons receive signals, interneurons process them through layers of increasing complexity, and motor neurons produce actions. Each connection strength (synaptic weight) is adjusted through experience (training).',
      limitations: 'Biological neurons are far more complex than artificial ones — they use chemical signaling, have thousands of connection types, and operate asynchronously. The analogy captures the layered processing but not the biological complexity.',
      domain: 'biology'
    }
  ],
  'gradient descent': [
    {
      analogy: 'Gradient descent is like hiking downhill in thick fog. You can\'t see the valley floor, but you can feel which direction is steeper under your feet. Each step, you move in the direction that goes downhill fastest. The learning rate is your step size — too large and you might overshoot the valley, too small and you\'ll take forever.',
      limitations: 'Real gradient descent operates in millions of dimensions simultaneously. The "fog" analogy undersells the mathematical precision of gradient computation.',
      domain: 'everyday life'
    },
    {
      analogy: 'Gradient descent is like rolling a ball down a hilly landscape in molasses. The ball naturally rolls toward lower ground, but the thick fluid (learning rate) controls how fast it moves. If the fluid is too thin, the ball might overshoot the valley; too thick and it barely moves.',
      limitations: 'This captures the momentum aspect but undersells the high-dimensional nature of real optimization landscapes, which have millions of dimensions.',
      domain: 'physics'
    },
    {
      analogy: 'Gradient descent is like a ship navigating toward port in stormy seas. The captain can feel the current pushing the ship in various directions. At each moment, the captain steers toward the direction that brings the ship closest to port. The speed adjustment (learning rate) determines how aggressively to chase the current.',
      limitations: 'Ship navigation deals with 2D space and physical forces. Gradient descent operates in abstract high-dimensional spaces where "direction" is a vector of millions of partial derivatives.',
      domain: 'transportation'
    }
  ],
  'overfitting': [
    {
      analogy: 'Overfitting is like memorizing answers to a specific exam instead of understanding the subject. You\'ll ace that exact exam but fail any variation. A student who understands the principles might miss a few exact matches but handles novel questions well.',
      limitations: 'Overfitting is more nuanced than simple memorization — it includes learning spurious correlations that happen to work on training data.',
      domain: 'everyday life'
    },
    {
      analogy: 'Overfitting is like a tourist who memorizes exact directions from their hotel to each restaurant. They navigate perfectly on known routes but get completely lost when roads change. A tourist who understands the city layout (landmarks, street patterns, compass directions) can navigate anywhere, even places they haven\'t visited.',
      limitations: 'City navigation is sequential and 2D. Overfitting in high-dimensional spaces involves learning noise patterns that are far more subtle than wrong turns.',
      domain: 'transportation'
    },
    {
      analogy: 'Overfitting is like a chef who memorizes exact ingredient measurements for 10 recipes. They cook those 10 dishes perfectly but can\'t adapt when ingredients change slightly. A chef who understands flavor principles (salt balances acid, fat carries flavor) can improvise and adapt to any situation.',
      limitations: 'Cooking involves sensory intuition that is hard to formalize. Overfitting is about statistical patterns in data, not culinary creativity.',
      domain: 'manufacturing'
    }
  ],
  'attention mechanism': [
    {
      analogy: 'Attention is like a highlighter pen. When reading a long passage, you don\'t give equal weight to every word. You highlight (attend to) the words most relevant to your current question. Different questions highlight different words, and the highlighting changes as you move through the text.',
      limitations: 'Attention computes dynamic, learnable weights — not simple binary highlighting. It also operates bidirectionally in many architectures.',
      domain: 'everyday life'
    },
    {
      analogy: 'Attention is like a librarian helping a researcher. The researcher describes what they need, and the librarian scans the shelves, pulling out the most relevant books. Different research questions lead the librarian to different sections. The librarian doesn\'t read every book — they quickly assess relevance and focus on the most promising sources.',
      limitations: 'A librarian uses semantic understanding and experience. Attention uses mathematical similarity computations (dot products) without true understanding.',
      domain: 'libraries'
    },
    {
      analogy: 'Attention is like a doctor examining a patient. The doctor doesn\'t treat every symptom equally — they focus on the symptoms most relevant to the likely diagnosis. Different suspected conditions lead the doctor to examine different areas. The examination is dynamic and changes as new information comes in.',
      limitations: 'Medical diagnosis involves causal reasoning and accumulated expertise. Attention is a statistical weighting mechanism without causal understanding.',
      domain: 'biology'
    }
  ],
  'embedding': [
    {
      analogy: 'An embedding is like a GPS coordinate for meaning. Just as GPS coordinates place cities in a 2D space where nearby coordinates mean geographically close cities, embeddings place words in a high-dimensional space where nearby vectors mean semantically similar words.',
      limitations: 'GPS coordinates are 2D and interpretable. Embeddings operate in hundreds or thousands of dimensions, and individual dimensions are not human-interpretable.',
      domain: 'transportation'
    },
    {
      analogy: 'An embedding is like a library classification system. Books about similar topics get similar call numbers. A book on "quantum physics" might be near "particle physics" but far from "medieval history." The classification captures conceptual proximity, not physical storage location.',
      limitations: 'Library classification is designed by humans with explicit rules. Embeddings are learned from data and may capture relationships that are not obvious to humans.',
      domain: 'libraries'
    },
    {
      analogy: 'An embedding is like a city zoning map. Residential areas cluster together, commercial zones cluster together, and industrial zones cluster together. The spatial arrangement reflects functional relationships — places that serve similar purposes end up near each other.',
      limitations: 'City zoning is designed by planners with explicit rules. Embedding spaces are shaped by statistical patterns in data, and the "zones" are not pre-defined.',
      domain: 'cities'
    }
  ],
  'regularization': [
    {
      analogy: 'Regularization is like a teacher who limits how many notes a student can take during a lecture. By forcing the student to be selective, the teacher ensures the student focuses on the most important concepts rather than transcribing everything verbatim.',
      limitations: 'Different regularization techniques (L1, L2, dropout, data augmentation) constrain the model in fundamentally different ways. The "note-taking" analogy captures the spirit but not the mathematical specifics.',
      domain: 'everyday life'
    },
    {
      analogy: 'Regularization is like a quality control inspector in a factory. The inspector randomly disables some assembly stations (dropout) during training, forcing the remaining stations to learn robust processes. This prevents any single station from becoming a critical point of failure.',
      limitations: 'Factory quality control is about physical defects. Regularization prevents statistical overfitting, which is a fundamentally different kind of "defect."',
      domain: 'manufacturing'
    },
    {
      analogy: 'Regularization is like a budget constraint in city planning. By limiting how much each department can spend, the city forces departments to prioritize essential services and avoid wasteful projects. The constraint produces more efficient outcomes than unlimited spending.',
      limitations: 'Budget constraints are explicit and binary (over/under). Regularization provides soft, continuous constraints through mathematical penalties.',
      domain: 'cities'
    }
  ],
  'convolution': [
    {
      analogy: 'A convolution is like looking through a small magnifying glass that slides across an image. At each position, the magnifying glass summarizes what it sees into a single number. Different magnifying glasses (kernels) detect different features — one might highlight edges, another might detect textures.',
      limitations: 'Real convolutions involve learnable kernel weights and operate across multiple channels simultaneously. The "magnifying glass" analogy captures spatial locality but not the learnable aspect.',
      domain: 'everyday life'
    },
    {
      analogy: 'A convolution is like a security patrol walking through a building. At each room, the patrol checks for specific things (fire hazards, unlocked doors, unusual activity). Different patrols look for different things. The patrol doesn\'t see the whole building at once — it processes one area at a time.',
      limitations: 'Security patrols make binary decisions (safe/unsafe). Convolutions produce continuous feature maps that preserve spatial relationships.',
      domain: 'engineering'
    },
    {
      analogy: 'A convolution is like a doctor using a stethoscope to examine a patient. The doctor moves the stethoscope across the chest, listening for specific sounds at each position. Different listening techniques detect different things — heart murmurs, lung congestion, bowel sounds.',
      limitations: 'Medical examination involves expert interpretation. Convolutions apply mathematical operations (weighted sums) without interpretation.',
      domain: 'biology'
    }
  ],
  'transformer': [
    {
      analogy: 'A transformer is like a committee meeting where every participant can talk to every other participant simultaneously. Instead of passing messages in a chain (like RNNs), each participant broadcasts their perspective and everyone else decides how much attention to pay to each broadcast.',
      limitations: 'The committee analogy captures parallel attention but undersells the mathematical machinery of query-key-value computations and multi-head attention.',
      domain: 'everyday life'
    },
    {
      analogy: 'A transformer is like a city council meeting where every council member can address every other member simultaneously. Instead of passing proposals through a chain of committees (like RNNs), each member presents their perspective and every other member decides how much weight to give each input.',
      limitations: 'City council meetings involve human reasoning and negotiation. Transformers compute attention weights through mathematical operations without understanding.',
      domain: 'cities'
    },
    {
      analogy: 'A transformer is like an orchestra where every musician can hear every other musician simultaneously. Instead of following a sequential conductor (like RNNs), each musician adjusts their playing based on what they hear from everyone else, creating a coordinated performance through parallel awareness.',
      limitations: 'Orchestral musicians use auditory feedback and musical intuition. Transformers use mathematical attention without auditory processing.',
      domain: 'engineering'
    }
  ],
  'loss function': [
    {
      analogy: 'A loss function is like a grading rubric. It defines exactly how to score the difference between what the model predicted and what was expected. A strict rubric (high loss for small errors) pushes the model harder; a lenient one allows more flexibility.',
      limitations: 'Loss functions are differentiable, enabling gradient-based optimization. A grading rubric is typically discrete and non-differentiable.',
      domain: 'everyday life'
    },
    {
      analogy: 'A loss function is like a quality control metric in manufacturing. It measures the gap between the produced item and the specification. A tight tolerance (low loss) requires precise manufacturing; a loose tolerance allows more variation.',
      limitations: 'Manufacturing quality metrics are typically discrete (pass/fail). Loss functions are continuous and differentiable, enabling optimization.',
      domain: 'manufacturing'
    },
    {
      analogy: 'A loss function is like a doctor\'s diagnostic score. It quantifies how far the patient\'s symptoms deviate from the expected profile for a given condition. A high score indicates the diagnosis doesn\'t fit; a low score suggests the diagnosis is accurate.',
      limitations: 'Diagnostic scoring involves clinical judgment and multiple interacting factors. Loss functions are mathematical objective functions without clinical interpretation.',
      domain: 'biology'
    }
  ],
  'batch normalization': [
    {
      analogy: 'Batch normalization is like a teacher who periodically pauses the class to make sure everyone is on the same page. By normalizing activations across a batch, it prevents the "class" (network layers) from drifting too far from a common reference point.',
      limitations: 'Batch norm specifically normalizes to zero mean and unit variance, then applies learnable affine transforms. The "checking in" analogy captures the stabilization purpose but not the mathematical mechanism.',
      domain: 'everyday life'
    },
    {
      analogy: 'Batch normalization is like a calibration check in a factory. Periodically, all measurement instruments are recalibrated to a common standard. This prevents instruments from drifting apart over time, ensuring consistent quality across the production line.',
      limitations: 'Factory calibration resets instruments to fixed standards. Batch normalization uses learnable affine transforms that adapt during training.',
      domain: 'manufacturing'
    },
    {
      analogy: 'Batch normalization is like a traffic control system that periodically synchronizes traffic lights. By aligning the timing across intersections, it prevents traffic from bunching up or spreading too thin, keeping flow smooth through the network.',
      limitations: 'Traffic light synchronization follows fixed timing patterns. Batch normalization computes statistics dynamically from the data flowing through the network.',
      domain: 'cities'
    }
  ],
  'recurrent neural network': [
    {
      analogy: 'An RNN is like reading a book one word at a time. Each word you read changes your understanding of the story so far. Your "memory" of previous words helps you interpret the current word. But as the book gets longer, you start forgetting the beginning.',
      limitations: 'Human memory is associative and can recall distant events. RNNs struggle with long-range dependencies due to vanishing gradients, making the "forgetting" much more severe than human memory loss.',
      domain: 'everyday life'
    },
    {
      analogy: 'An RNN is like a train where each car carries information from the previous car. The locomotive (first timestep) pulls the first car, which pulls the second, and so on. Information flows through the chain, but by the time it reaches the last car, the original signal may be distorted.',
      limitations: 'Train cars maintain their physical connection. RNN hidden states are transformed at each step, and the mathematical "signal" can vanish or explode over long sequences.',
      domain: 'transportation'
    }
  ],
  'generative adversarial network': [
    {
      analogy: 'A GAN is like a counterfeiter and a detective playing an endless game. The counterfeiter (generator) creates fake currency, and the detective (discriminator) tries to spot the fakes. Each round, both get better — the counterfeiter makes more convincing fakes, and the detective gets better at detecting them.',
      limitations: 'Real counterfeiting involves physical production and detection. GANs operate in abstract data spaces, and the "counterfeiting" involves generating statistical patterns, not physical objects.',
      domain: 'everyday life'
    },
    {
      analogy: 'A GAN is like an evolutionary arms race between predator and prey. The prey (generator) develops better camouflage, the predator (discriminator) develops sharper senses, and both improve over generations. The result is increasingly sophisticated adaptations on both sides.',
      limitations: 'Evolution operates through random mutation and natural selection over generations. GANs use gradient-based optimization within a single training process.',
      domain: 'biology'
    }
  ],
  'dropout': [
    {
      analogy: 'Dropout is like a team project where, each day, some team members are randomly absent. The remaining members must learn to handle the work without relying on any specific person. This prevents the team from depending too heavily on one expert.',
      limitations: 'Team absences are binary and affect entire roles. Dropout randomly zeros individual neurons, which is a much finer-grained intervention.',
      domain: 'everyday life'
    },
    {
      analogy: 'Dropout is like a military exercise where some soldiers are randomly removed from the battlefield. The remaining soldiers must adapt their tactics and cover multiple roles. This builds resilience and prevents the unit from being vulnerable if any single soldier is lost.',
      limitations: 'Military exercises involve tactical reasoning. Dropout is a statistical regularization technique that prevents co-adaptation of neural units.',
      domain: 'engineering'
    }
  ],
  'learning rate': [
    {
      analogy: 'Learning rate is like the volume knob on a radio. Turn it too high and the signal is distorted (overshooting). Turn it too low and you can barely hear anything (slow convergence). The right setting lets you hear the music clearly.',
      limitations: 'Radio volume is linear and independent of content. Learning rate interacts with the loss landscape in complex ways — the optimal setting changes as training progresses.',
      domain: 'everyday life'
    },
    {
      analogy: 'Learning rate is like the step size of a hiker descending a mountain. Large steps cover ground quickly but might overshoot the valley. Small steps are precise but take forever. A good hiker adjusts step size based on the terrain steepness.',
      limitations: 'Hiking is 2D and physical. Learning rate operates in millions of dimensions, and the "terrain" is an abstract loss landscape.',
      domain: 'physics'
    }
  ]
};

const GENERIC_ANALOGIES = [
  {
    trigger: /.+/,
    analogy: (topic) => `Understanding **${topic}** is like learning to drive a car. At first, you focus on individual controls (steering, gas, brakes). With practice, these become automatic and you can focus on higher-level decisions (route planning, traffic patterns). Similarly, mastering this concept means moving from mechanical understanding to strategic application.`,
    limitations: 'Driving is a sequential, single-threaded task. Many AI/ML concepts involve parallel, high-dimensional processes that have no direct driving equivalent.',
    domain: 'transportation'
  }
];

const DOMAIN_LABELS = {
  physics: 'Physics',
  'everyday life': 'Everyday Life',
  engineering: 'Engineering',
  transportation: 'Transportation',
  libraries: 'Libraries',
  cities: 'Cities',
  manufacturing: 'Manufacturing',
  biology: 'Biology',
  systems: 'Systems',
  optimization: 'Optimization',
  learning: 'Learning',
  nlp: 'NLP',
  representation: 'Representation',
  'computer-vision': 'Computer Vision',
  training: 'Training',
  general: 'General'
};

function createAnalogyEngine() {
  function generate(topic, context, mode) {
    const lowerTopic = (topic || '').toLowerCase();
    const lowerQuery = (context?.userQuery || '').toLowerCase();
    const combined = `${lowerTopic} ${lowerQuery}`;

    let bestMatch = null;
    let bestScore = 0;

    for (const [key, templates] of Object.entries(ANALOGY_TEMPLATES)) {
      const arr = Array.isArray(templates) ? templates : [templates];
      for (const template of arr) {
        const score = calculateRelevance(combined, key);
        if (score > bestScore) {
          bestScore = score;
          bestMatch = template;
        }
      }
    }

    if (!bestMatch || bestScore < 0.3) {
      const generic = GENERIC_ANALOGIES[0];
      return formatAnalogy(generic.analogy(topic), generic.limitations, mode, generic.domain);
    }

    return formatAnalogy(bestMatch.analogy, bestMatch.limitations, mode, bestMatch.domain);
  }

  function generateByDomain(topic, domain) {
    const lowerTopic = (topic || '').toLowerCase();
    const lowerDomain = (domain || '').toLowerCase();

    for (const [key, templates] of Object.entries(ANALOGY_TEMPLATES)) {
      const arr = Array.isArray(templates) ? templates : [templates];
      for (const template of arr) {
        if (template.domain === lowerDomain && (lowerTopic.includes(key) || key.includes(lowerTopic))) {
          return formatAnalogy(template.analogy, template.limitations, 'default', template.domain);
        }
      }
    }

    for (const [key, templates] of Object.entries(ANALOGY_TEMPLATES)) {
      const arr = Array.isArray(templates) ? templates : [templates];
      for (const template of arr) {
        if (template.domain === lowerDomain) {
          return formatAnalogy(template.analogy, template.limitations, 'default', template.domain);
        }
      }
    }

    return null;
  }

  function generateMultiDomain(topic, context, count = 3) {
    const lowerTopic = (topic || '').toLowerCase();
    const results = [];
    const usedDomains = new Set();

    for (const [key, templates] of Object.entries(ANALOGY_TEMPLATES)) {
      if (results.length >= count) break;
      const arr = Array.isArray(templates) ? templates : [templates];
      for (const template of arr) {
        if (results.length >= count) break;
        if (!usedDomains.has(template.domain) && (lowerTopic.includes(key) || key.includes(lowerTopic))) {
          results.push({
            analogy: template.analogy,
            limitations: template.limitations,
            domain: template.domain,
            domainLabel: DOMAIN_LABELS[template.domain] || template.domain
          });
          usedDomains.add(template.domain);
        }
      }
    }

    return results;
  }

  function calculateRelevance(text, keyword) {
    const words = keyword.split(' ');
    let matches = 0;
    for (const word of words) {
      if (text.includes(word)) matches++;
    }
    return matches / words.length;
  }

  function formatAnalogy(analogyText, limitations, mode, domain) {
    let content = `**Analogy:**\n\n${analogyText}`;

    if (domain) {
      content += `\n\n*Domain: ${DOMAIN_LABELS[domain] || domain}*`;
    }

    if (mode !== 'executive-summary') {
      content += `\n\n**Where this analogy breaks down:**\n${limitations}`;
    }

    return content;
  }

  function getAvailableAnalogies() {
    return Object.keys(ANALOGY_TEMPLATES);
  }

  function getAnalogyForTopic(topic) {
    const lower = (topic || '').toLowerCase();
    for (const [key, templates] of Object.entries(ANALOGY_TEMPLATES)) {
      const arr = Array.isArray(templates) ? templates : [templates];
      if (lower.includes(key) || key.includes(lower)) {
        return arr[0];
      }
    }
    return null;
  }

  function getAvailableDomains() {
    const domains = new Set();
    for (const templates of Object.values(ANALOGY_TEMPLATES)) {
      const arr = Array.isArray(templates) ? templates : [templates];
      for (const t of arr) {
        domains.add(t.domain);
      }
    }
    return Array.from(domains);
  }

  function getAnalogiesByDomain(domain) {
    const lower = (domain || '').toLowerCase();
    const results = [];
    for (const [key, templates] of Object.entries(ANALOGY_TEMPLATES)) {
      const arr = Array.isArray(templates) ? templates : [templates];
      for (const t of arr) {
        if (t.domain === lower) {
          results.push({ topic: key, ...t });
        }
      }
    }
    return results;
  }

  return {
    generate,
    generateByDomain,
    generateMultiDomain,
    getAvailableAnalogies,
    getAnalogyForTopic,
    getAvailableDomains,
    getAnalogiesByDomain,
    ANALOGY_TEMPLATES,
    DOMAIN_LABELS
  };
}

if (typeof window !== 'undefined') {
  window.NeuralVerse = window.NeuralVerse || {};
  window.NeuralVerse.analogyEngine = createAnalogyEngine();
}

export { createAnalogyEngine, ANALOGY_TEMPLATES, DOMAIN_LABELS };
