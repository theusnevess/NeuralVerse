/**
 * NV-1300-D1C — Media Density Optimizer
 *
 * Prevents consecutive media elements (visualization-visualization,
 * laboratory-laboratory) and ensures natural alternation between
 * textual and media content.
 *
 * Deterministic. No Math.random. No Date.now.
 */

var DENSITY_CONSTRAINTS = {
  maxConsecutiveMedia: 1,
  minTextBetweenMedia: 1,
  preferVisualizationBeforeLab: true
};

function createMediaDensityOptimizer() {
  function measureDensity(timeline) {
    if (!Array.isArray(timeline) || timeline.length === 0) {
      return {
        totalSections: 0,
        mediaSections: 0,
        textSections: 0,
        densityRatio: 0,
        consecutiveMediaRuns: [],
        maxConsecutiveMedia: 0,
        balanced: true
      };
    }

    var totalSections = 0;
    var mediaSections = 0;
    var textSections = 0;
    var consecutiveMediaRuns = [];
    var currentRun = 0;

    for (var i = 0; i < timeline.length; i++) {
      if (!timeline[i].included) continue;
      totalSections++;

      if (timeline[i].mediaType !== 'none') {
        mediaSections++;
        currentRun++;
      } else {
        textSections++;
        if (currentRun > 0) {
          consecutiveMediaRuns.push(currentRun);
        }
        currentRun = 0;
      }
    }

    if (currentRun > 0) {
      consecutiveMediaRuns.push(currentRun);
    }

    var maxConsecutiveMedia = 0;
    for (var r = 0; r < consecutiveMediaRuns.length; r++) {
      if (consecutiveMediaRuns[r] > maxConsecutiveMedia) {
        maxConsecutiveMedia = consecutiveMediaRuns[r];
      }
    }

    return {
      totalSections: totalSections,
      mediaSections: mediaSections,
      textSections: textSections,
      densityRatio: totalSections > 0 ? Math.round((mediaSections / totalSections) * 100) / 100 : 0,
      consecutiveMediaRuns: consecutiveMediaRuns,
      maxConsecutiveMedia: maxConsecutiveMedia,
      balanced: maxConsecutiveMedia <= DENSITY_CONSTRAINTS.maxConsecutiveMedia
    };
  }

  function optimizeSequence(timeline) {
    if (!Array.isArray(timeline) || timeline.length === 0) return [];

    var optimized = timeline.map(function (entry) {
      return {
        sectionId: entry.sectionId,
        sectionLabel: entry.sectionLabel,
        position: entry.position,
        mediaType: entry.mediaType,
        mediaId: entry.mediaId,
        mediaTitle: entry.mediaTitle,
        included: entry.included
      };
    });

    var violations = _findConsecutiveMediaViolations(optimized);

    var _maxIter = optimized.length * optimized.length;
    var _iter = 0;
    while (violations.length > 0 && _iter < _maxIter) {
      _iter++;
      var resolved = false;

      for (var v = 0; v < violations.length; v++) {
        var violation = violations[v];
        var insertionPoint = _findBestInsertionPoint(optimized, violation);

        if (insertionPoint !== -1) {
          var moved = optimized.splice(violation.startIndex, 1)[0];

          var targetIdx = insertionPoint > violation.startIndex ? insertionPoint - 1 : insertionPoint;
          optimized.splice(targetIdx, 0, moved);

          _reindex(optimized);
          resolved = true;
          break;
        }
      }

      if (!resolved) break;

      violations = _findConsecutiveMediaViolations(optimized);
    }

    return optimized;
  }

  function _findConsecutiveMediaViolations(timeline) {
    var violations = [];
    var runStart = -1;

    for (var i = 0; i < timeline.length; i++) {
      if (!timeline[i].included) continue;

      if (timeline[i].mediaType !== 'none') {
        if (runStart === -1) {
          runStart = i;
        }
      } else {
        if (runStart !== -1) {
          var runLength = i - runStart;
          if (runLength > DENSITY_CONSTRAINTS.maxConsecutiveMedia) {
            violations.push({ startIndex: runStart, endIndex: i - 1, length: runLength });
          }
          runStart = -1;
        }
      }
    }

    if (runStart !== -1) {
      var tailLength = timeline.length - runStart;
      if (tailLength > DENSITY_CONSTRAINTS.maxConsecutiveMedia) {
        violations.push({ startIndex: runStart, endIndex: timeline.length - 1, length: tailLength });
      }
    }

    return violations;
  }

  function _findBestInsertionPoint(timeline, violation) {
    var mediaEntry = timeline[violation.startIndex];
    if (!mediaEntry) return -1;

    for (var i = violation.endIndex + 1; i < timeline.length; i++) {
      if (timeline[i].included && timeline[i].mediaType === 'none') {
        return i;
      }
    }

    for (var j = violation.startIndex - 1; j >= 0; j--) {
      if (timeline[j].included && timeline[j].mediaType === 'none') {
        return j + 1;
      }
    }

    return -1;
  }

  function _reindex(timeline) {
    for (var i = 0; i < timeline.length; i++) {
      timeline[i].position = i;
    }
  }

  function balance(timeline) {
    if (!Array.isArray(timeline) || timeline.length === 0) return [];

    var optimized = optimizeSequence(timeline);

    if (DENSITY_CONSTRAINTS.preferVisualizationBeforeLab) {
      optimized = _ensureVisualizationBeforeLab(optimized);
    }

    return optimized;
  }

  function _ensureVisualizationBeforeLab(timeline) {
    var vizIdx = -1;
    var labIdx = -1;

    for (var i = 0; i < timeline.length; i++) {
      if (timeline[i].mediaType === 'visualization' && vizIdx === -1) vizIdx = i;
      if (timeline[i].mediaType === 'laboratory' && labIdx === -1) labIdx = i;
    }

    if (vizIdx !== -1 && labIdx !== -1 && labIdx < vizIdx) {
      var labEntry = timeline.splice(labIdx, 1)[0];
      var newVizIdx = -1;
      for (var j = 0; j < timeline.length; j++) {
        if (timeline[j].mediaType === 'visualization') { newVizIdx = j; break; }
      }
      var insertAt = newVizIdx !== -1 ? newVizIdx + 1 : vizIdx;
      timeline.splice(insertAt, 0, labEntry);
      _reindex(timeline);
    }

    return timeline;
  }

  return {
    measureDensity: measureDensity,
    optimizeSequence: optimizeSequence,
    balance: balance,
    DENSITY_CONSTRAINTS: DENSITY_CONSTRAINTS
  };
}

if (typeof window !== 'undefined') {
  window.NeuralVerse = window.NeuralVerse || {};
  window.NeuralVerse.createMediaDensityOptimizer = createMediaDensityOptimizer;
}

export { createMediaDensityOptimizer };
