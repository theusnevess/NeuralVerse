import { DistanceMetricsViz } from './distance-metrics-viz.js';
import { NearestNeighborViz } from './nearest-neighbor-viz.js';
import { RagPipelineViz } from './rag-pipeline-viz.js';
import { SelfAttentionViz } from './self-attention-viz.js';
import { ConvolutionIntuitionViz } from './convolution-intuition-viz.js';
import { ObjectDetectionViz } from './object-detection-viz.js';
import { SegmentationViz } from './segmentation-viz.js';
import { BayesTheoremViz } from './bayes-theorem-viz.js';
import { OverfittingViz } from './overfitting-viz.js';
import { ForwardPropViz } from './forward-prop-viz.js';

const registry = {
  'artifact-distance-metrics-interactive-visualization': DistanceMetricsViz,
  'artifact-nearest-neighbor-search-interactive-visualization': NearestNeighborViz,
  'artifact-rag-foundations-interactive-visualization': RagPipelineViz,
  'artifact-self-attention-interactive-visualization': SelfAttentionViz,
  'artifact-convolution-intuition-interactive-visualization': ConvolutionIntuitionViz,
  'artifact-object-detection-fundamentals-interactive-visualization': ObjectDetectionViz,
  'artifact-encoder-decoder-segmentation-interactive-visualization': SegmentationViz,
  'artifact-bayes-theorem-interactive-visualization': BayesTheoremViz,
  'artifact-overfitting-underfitting-interactive-visualization': OverfittingViz,
  'artifact-forward-propagation-interactive-visualization': ForwardPropViz
};

/**
 * Checks if a visualization is registered for a given artifact ID.
 * @param {string} artifactId 
 * @returns {boolean}
 */
export function hasVisualization(artifactId) {
  return !!registry[artifactId];
}

/**
 * Instantiates and returns a visualization for a given artifact ID.
 * @param {string} artifactId 
 * @returns {BaseVisualization|null}
 */
export function createVisualization(artifactId) {
  const VizClass = registry[artifactId];
  if (!VizClass) return null;
  return new VizClass(artifactId);
}
