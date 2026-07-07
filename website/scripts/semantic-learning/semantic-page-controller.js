/**
 * Semantic Learning Intelligence — Page Controller
 * Manages the semantic-learning route lifecycle:
 * initialization, concept browser population, selection flow,
 * rendering, context panel updates, and teardown.
 *
 * NV-1100 Phase 8 — Cross-System Intelligence Integration
 * Deep linking, shared context, cross-system navigation.
 */
(function () {
  'use strict';

  var REVEAL_DELAY_MS = 90;
  var TRANSITION_DURATION_MS = 200;
  var TOAST_DISMISS_MS = 3200;

  function escapeHtml(str) {
    if (typeof str !== 'string') return '';
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function getEngine() {
    return window.NeuralVerse?.SemanticEngine || null;
  }

  function getRecommendations() {
    return window.NeuralVerse?.RecommendationEngine || null;
  }

  function getTraversal() {
    return window.NeuralVerse?.SemanticTraversal || null;
  }

  function dispatch(name, detail) {
    window.dispatchEvent(new CustomEvent(name, { detail: detail || {} }));
  }

  /* ─── URL Helpers ─────────────────────────────────────── */

  function getConceptFromURL() {
    var hash = window.location.hash || '';
    var qIdx = hash.indexOf('?');
    if (qIdx === -1) return null;
    var params = new URLSearchParams(hash.substring(qIdx + 1));
    return params.get('concept') || null;
  }

  function setConceptInURL(conceptId) {
    var base = '#/semantic-learning';
    if (conceptId) {
      window.history.replaceState(null, '', base + '?concept=' + encodeURIComponent(conceptId));
    } else {
      window.history.replaceState(null, '', base);
    }
  }

  /* ─── Cross-System Actions ────────────────────────────── */

  function renderCrossSystemActions(conceptId, conceptName) {
    if (!conceptId || !conceptName) return '';

    var atlasHref = '#/knowledge-graph?focus=' + encodeURIComponent(conceptId);
    var retrievalHref = '#/retrieval-playground?q=' + encodeURIComponent(conceptName);
    var learningHref = '#/learning?concept=' + encodeURIComponent(conceptId);
    var memoryHref = '#/memory?concept=' + encodeURIComponent(conceptId);

    var html = '<div class="nv-sem-actions" role="region" aria-label="Cross-system navigation">';
    html += '<h3 class="nv-sem-actions__title">Explore Further</h3>';
    html += '<div class="nv-sem-actions__grid">';

    html += '<a href="' + atlasHref + '" class="nv-sem-action" aria-label="Open ' + escapeHtml(conceptName) + ' in Atlas">';
    html += '<span class="nv-sem-action__icon" aria-hidden="true">⬡</span>';
    html += '<span class="nv-sem-action__label">Open in Atlas</span>';
    html += '<span class="nv-sem-action__desc">View topology</span>';
    html += '</a>';

    html += '<a href="' + retrievalHref + '" class="nv-sem-action" aria-label="Search ' + escapeHtml(conceptName) + ' in Retrieval">';
    html += '<span class="nv-sem-action__icon" aria-hidden="true">⌕</span>';
    html += '<span class="nv-sem-action__label">Search in Retrieval</span>';
    html += '<span class="nv-sem-action__desc">Find evidence</span>';
    html += '</a>';

    html += '<a href="' + learningHref + '" class="nv-sem-action" aria-label="Continue learning ' + escapeHtml(conceptName) + '">';
    html += '<span class="nv-sem-action__icon" aria-hidden="true">▷</span>';
    html += '<span class="nv-sem-action__label">Continue Learning</span>';
    html += '<span class="nv-sem-action__desc">Follow curriculum</span>';
    html += '</a>';

    html += '<a href="' + memoryHref + '" class="nv-sem-action" aria-label="Save ' + escapeHtml(conceptName) + ' to Memory">';
    html += '<span class="nv-sem-action__icon" aria-hidden="true">⊞</span>';
    html += '<span class="nv-sem-action__label">Save to Memory</span>';
    html += '<span class="nv-sem-action__desc">Preserve context</span>';
    html += '</a>';

    html += '<button type="button" class="nv-sem-action nv-sem-action--workspace" data-action="workspace-context" aria-label="Set ' + escapeHtml(conceptName) + ' as workspace context">';
    html += '<span class="nv-sem-action__icon" aria-hidden="true">◎</span>';
    html += '<span class="nv-sem-action__label">Workspace Context</span>';
    html += '<span class="nv-sem-action__desc">Set focus</span>';
    html += '</button>';

    html += '</div></div>';
    return html;
  }

  /* ─── Shared Concept Context ──────────────────────────── */

  function publishConceptContext(conceptId, conceptName, category, stats) {
    dispatch('nv:semantic-concept-selected', {
      conceptId: conceptId,
      conceptName: conceptName,
      category: category || '',
      difficulty: '',
      relatedCount: stats ? stats.related : 0,
      prerequisitesCount: stats ? stats.prerequisites : 0,
      dependentsCount: stats ? stats.dependents : 0,
      timestamp: Date.now(),
      source: 'semantic'
    });

    // Use shared context module
    var SemanticContext = window.NeuralVerse?.SemanticContext;
    if (SemanticContext) {
      SemanticContext.setActiveContext(conceptId, conceptName, category, 'semantic');
    } else {
      // Fallback to sessionStorage
      try {
        sessionStorage.setItem('nv:semantic-active-concept', JSON.stringify({
          id: conceptId,
          name: conceptName,
          category: category || '',
          timestamp: Date.now(),
          source: 'semantic'
        }));
      } catch (e) {
        // sessionStorage unavailable — silent fail
      }
    }
  }

  /* ─── Concept Stats Helper ────────────────────────────── */

  function getConceptStats(conceptId) {
    var engine = getEngine();
    if (!engine) return { related: 0, prerequisites: 0, dependents: 0 };

    var related = engine.getRelatedConcepts(conceptId);
    var prereqs = engine.getPrerequisites(conceptId);
    var deps = engine.getDependents(conceptId);

    return {
      related: related.length,
      prerequisites: prereqs.length,
      dependents: deps.length
    };
  }

  function createSemanticPageController(options) {
    var root = (options && options.root) || document;
    var _listeners = [];
    var _initialized = false;
    var _selectedConceptId = null;
    var _vizInstance = null;
    var _breadcrumb = [];
    var _firstExplorationShown = false;
    var _transitionInProgress = false;
    var _revealTimers = [];

    function addListener(el, event, handler) {
      if (!el) return;
      el.addEventListener(event, handler);
      _listeners.push({ el: el, event: event, handler: handler });
    }

    function clearListeners() {
      for (var i = 0; i < _listeners.length; i++) {
        _listeners[i].el.removeEventListener(_listeners[i].event, _listeners[i].handler);
      }
      _listeners = [];
    }

    function clearRevealTimers() {
      for (var i = 0; i < _revealTimers.length; i++) {
        clearTimeout(_revealTimers[i]);
      }
      _revealTimers = [];
    }

    function getElements() {
      return {
        root: root.querySelector('[data-semantic-root]') || root.querySelector('#semantic-learning-root'),
        select: root.querySelector('#concept-select'),
        results: root.querySelector('#semantic-results'),
        loading: root.querySelector('#semantic-loading'),
        emptyState: root.querySelector('#semantic-empty-state'),
        conceptInfo: root.querySelector('#semantic-concept-info'),
        conceptCount: root.querySelector('#semantic-concept-count'),
        contextPanel: root.querySelector('.nv-context-panel') || root.querySelector('[data-context-panel]'),
        vizContainer: root.querySelector('#semantic-neighborhood-viz'),
        vizCanvas: root.querySelector('#semantic-viz-canvas'),
        breadcrumb: root.querySelector('#semantic-breadcrumb'),
        toast: root.querySelector('#semantic-toast'),
        intelligence: root.querySelector('#semantic-intelligence'),
        crossSystemActions: root.querySelector('#semantic-cross-system-actions')
      };
    }

    function showLoading() {
      var els = getElements();
      if (els.loading) {
        els.loading.hidden = false;
        els.loading.setAttribute('aria-busy', 'true');
      }
      if (els.emptyState) els.emptyState.hidden = true;
      if (els.results) els.results.innerHTML = '';
      if (els.conceptInfo) els.conceptInfo.hidden = true;
    }

    function hideLoading() {
      var els = getElements();
      if (els.loading) {
        els.loading.hidden = true;
        els.loading.removeAttribute('aria-busy');
      }
    }

    function showEmptyState() {
      var els = getElements();
      if (els.emptyState) els.emptyState.hidden = false;
      if (els.results) els.results.innerHTML = '';
      if (els.conceptInfo) els.conceptInfo.hidden = true;
    }

    function hideEmptyState() {
      var els = getElements();
      if (els.emptyState) els.emptyState.hidden = true;
    }

    function populateConceptBrowser() {
      var els = getElements();
      var engine = getEngine();
      if (!els.select || !engine) return 0;

      var concepts = engine.getAllConcepts();
      concepts.sort(function (a, b) {
        return (a.name || a.id).localeCompare(b.name || b.id);
      });

      els.select.innerHTML = '<option value="">Choose a concept...</option>';
      for (var i = 0; i < concepts.length; i++) {
        var opt = document.createElement('option');
        opt.value = concepts[i].id;
        opt.textContent = (concepts[i].name || concepts[i].id) + ' (' + (concepts[i].category || 'uncategorized') + ')';
        els.select.appendChild(opt);
      }

      if (els.conceptCount) {
        els.conceptCount.textContent = concepts.length + ' concepts loaded';
      }

      return concepts.length;
    }

    /* ─── Semantic Breadcrumb ────────────────────────────── */

    function pushBreadcrumb(conceptId) {
      var engine = getEngine();
      if (!engine) return;
      var concept = engine.getConcept(conceptId);
      if (!concept) return;

      for (var i = 0; i < _breadcrumb.length; i++) {
        if (_breadcrumb[i].id === conceptId) {
          _breadcrumb = _breadcrumb.slice(0, i + 1);
          renderBreadcrumb();
          return;
        }
      }

      _breadcrumb.push({ id: conceptId, name: concept.name || conceptId });
      if (_breadcrumb.length > 5) _breadcrumb.shift();
      renderBreadcrumb();
    }

    function renderBreadcrumb() {
      var els = getElements();
      if (!els.breadcrumb) return;
      if (_breadcrumb.length <= 1) {
        els.breadcrumb.hidden = true;
        els.breadcrumb.innerHTML = '';
        return;
      }

      var html = '<nav class="nv-sem-breadcrumb" aria-label="Semantic exploration path">';
      html += '<span class="nv-sem-breadcrumb__label nv-sr-only">Path:</span>';
      for (var i = 0; i < _breadcrumb.length; i++) {
        var isLast = i === _breadcrumb.length - 1;
        var item = _breadcrumb[i];
        if (i > 0) {
          html += '<span class="nv-sem-breadcrumb__sep" aria-hidden="true">→</span>';
        }
        if (isLast) {
          html += '<span class="nv-sem-breadcrumb__current" aria-current="page">' + escapeHtml(item.name) + '</span>';
        } else {
          html += '<button class="nv-sem-breadcrumb__link" data-breadcrumb-id="' + escapeHtml(item.id) + '" type="button">' + escapeHtml(item.name) + '</button>';
        }
      }
      html += '</nav>';

      els.breadcrumb.innerHTML = html;
      els.breadcrumb.hidden = false;

      var links = els.breadcrumb.querySelectorAll('.nv-sem-breadcrumb__link');
      for (var j = 0; j < links.length; j++) {
        addListener(links[j], 'click', function (e) {
          var id = e.currentTarget.getAttribute('data-breadcrumb-id');
          if (id && els.select) {
            els.select.value = id;
            handleSelection();
          }
        });
      }
    }

    function clearBreadcrumb() {
      _breadcrumb = [];
      var els = getElements();
      if (els.breadcrumb) {
        els.breadcrumb.hidden = true;
        els.breadcrumb.innerHTML = '';
      }
    }

    /* ─── First Exploration Toast ─────────────────────────── */

    function showFirstExplorationToast(conceptId) {
      if (_firstExplorationShown) return;
      _firstExplorationShown = true;

      var engine = getEngine();
      if (!engine) return;

      var concept = engine.getConcept(conceptId);
      if (!concept) return;

      var stats = getConceptStats(conceptId);
      var totalDiscovered = stats.related + stats.prerequisites + stats.dependents;

      var els = getElements();
      if (!els.toast) return;

      var msg = 'Semantic neighborhood generated · ' + totalDiscovered + ' related concepts discovered';
      els.toast.textContent = msg;
      els.toast.hidden = false;
      els.toast.classList.add('nv-sem-toast--visible');

      setTimeout(function () {
        els.toast.classList.remove('nv-sem-toast--visible');
        setTimeout(function () {
          els.toast.hidden = true;
        }, TRANSITION_DURATION_MS);
      }, TOAST_DISMISS_MS);
    }

    /* ─── Context Panel Intelligence ──────────────────────── */

    function updateContextPanel(conceptId) {
      var engine = getEngine();
      var recs = getRecommendations();
      var traversal = getTraversal();
      if (!engine || !conceptId) return;

      var concept = engine.getConcept(conceptId);
      if (!concept) return;

      var related = engine.getRelatedConcepts(conceptId);
      var prereqs = engine.getPrerequisites(conceptId);
      var deps = engine.getDependents(conceptId);
      var recommendations = recs ? recs.getRecommendations(conceptId) : null;
      var traversalResult = traversal ? traversal.getTraversal(conceptId, { maxDepth: 2 }) : null;

      var prereqNames = [];
      for (var i = 0; i < Math.min(prereqs.length, 3); i++) {
        prereqNames.push(prereqs[i].name || prereqs[i].id);
      }
      var depNames = [];
      for (var j = 0; j < Math.min(deps.length, 3); j++) {
        depNames.push(deps[j].name || deps[j].id);
      }

      dispatch('nv:context-update', {
        concept: concept.name,
        category: concept.category,
        difficulty: concept.difficulty || '—',
        prerequisites: prereqNames,
        prerequisitesCount: prereqs.length,
        dependents: depNames,
        dependentsCount: deps.length,
        relatedCount: related.length,
        recommendationCount: recommendations ? recommendations.total : 0,
        traversalDepth: traversalResult ? traversalResult.maxDepth : 0,
        traversalNodes: traversalResult ? traversalResult.totalNodes : 0
      });
    }

    /* ─── Concept Transition ──────────────────────────────── */

    function crossfadeContent(els, callback) {
      if (_transitionInProgress) return;
      _transitionInProgress = true;

      var contentAreas = [els.conceptInfo, els.intelligence, els.results, els.vizContainer, els.crossSystemActions];
      var hasVisible = false;

      for (var i = 0; i < contentAreas.length; i++) {
        if (contentAreas[i] && !contentAreas[i].hidden) {
          hasVisible = true;
          contentAreas[i].classList.add('nv-sem-crossfade-out');
        }
      }

      if (!hasVisible) {
        _transitionInProgress = false;
        callback();
        return;
      }

      setTimeout(function () {
        callback();
        for (var j = 0; j < contentAreas.length; j++) {
          if (contentAreas[j]) {
            contentAreas[j].classList.remove('nv-sem-crossfade-out');
            contentAreas[j].classList.add('nv-sem-crossfade-in');
          }
        }
        setTimeout(function () {
          for (var k = 0; k < contentAreas.length; k++) {
            if (contentAreas[k]) {
              contentAreas[k].classList.remove('nv-sem-crossfade-in');
            }
          }
          _transitionInProgress = false;
        }, TRANSITION_DURATION_MS);
      }, TRANSITION_DURATION_MS);
    }

    /* ─── Progressive Reveal ──────────────────────────────── */

    function progressiveReveal(els, conceptId) {
      clearRevealTimers();

      _revealTimers.push(setTimeout(function () {
        renderConceptInfo(conceptId);
        if (els.conceptInfo) els.conceptInfo.classList.add('nv-sem-reveal-step');
      }, REVEAL_DELAY_MS * 0));

      _revealTimers.push(setTimeout(function () {
        renderIntelligence(els, conceptId);
        if (els.intelligence) els.intelligence.classList.add('nv-sem-reveal-step');
      }, REVEAL_DELAY_MS * 1));

      _revealTimers.push(setTimeout(function () {
        renderNeighborhoodViz(conceptId);
        if (els.vizContainer) els.vizContainer.classList.add('nv-sem-reveal-step');
      }, REVEAL_DELAY_MS * 2));

      _revealTimers.push(setTimeout(function () {
        renderSemanticResults(conceptId);
        if (els.results) els.results.classList.add('nv-sem-reveal-step');
      }, REVEAL_DELAY_MS * 3));

      _revealTimers.push(setTimeout(function () {
        renderCrossSystem(els, conceptId);
        updateContextPanel(conceptId);
        showFirstExplorationToast(conceptId);
      }, REVEAL_DELAY_MS * 4));
    }

    /* ─── Rendering ───────────────────────────────────────── */

    function renderConceptInfo(conceptId) {
      var els = getElements();
      var engine = getEngine();
      if (!els.conceptInfo || !engine) return;

      var concept = engine.getConcept(conceptId);
      if (!concept) {
        els.conceptInfo.hidden = true;
        return;
      }

      var related = engine.getRelatedConcepts(conceptId);
      var prereqs = engine.getPrerequisites(conceptId);
      var deps = engine.getDependents(conceptId);
      var recs = getRecommendations();
      var recommendations = recs ? recs.getRecommendations(conceptId) : null;
      var traversal = getTraversal();
      var traversalResult = traversal ? traversal.getTraversal(conceptId, { maxDepth: 2 }) : null;

      var html = '<div class="nv-sem-concept-info" role="region" aria-label="Concept details for ' + escapeHtml(concept.name) + '">';

      html += '<div class="nv-sem-concept-info__header">';
      html += '<h3 class="nv-sem-concept-info__name">' + escapeHtml(concept.name) + '</h3>';
      if (concept.category) {
        html += '<span class="nv-sem-concept-info__category">' + escapeHtml(concept.category) + '</span>';
      }
      html += '</div>';

      html += '<dl class="nv-sem-concept-info__metrics">';
      if (concept.difficulty) {
        html += '<div class="nv-sem-metric"><dt class="nv-sem-metric__label">Difficulty</dt><dd class="nv-sem-metric__value">' + escapeHtml(concept.difficulty) + '</dd></div>';
      }
      html += '<div class="nv-sem-metric"><dt class="nv-sem-metric__label">Related</dt><dd class="nv-sem-metric__value">' + related.length + '</dd></div>';
      html += '<div class="nv-sem-metric"><dt class="nv-sem-metric__label">Prerequisites</dt><dd class="nv-sem-metric__value">' + prereqs.length + '</dd></div>';
      html += '<div class="nv-sem-metric"><dt class="nv-sem-metric__label">Dependents</dt><dd class="nv-sem-metric__value">' + deps.length + '</dd></div>';
      if (recommendations) {
        html += '<div class="nv-sem-metric"><dt class="nv-sem-metric__label">Recommendations</dt><dd class="nv-sem-metric__value">' + recommendations.total + '</dd></div>';
      }
      if (traversalResult) {
        html += '<div class="nv-sem-metric"><dt class="nv-sem-metric__label">Traversal</dt><dd class="nv-sem-metric__value">' + traversalResult.totalNodes + ' nodes</dd></div>';
      }
      html += '</dl>';

      if (concept.summary) {
        html += '<p class="nv-sem-concept-info__summary">' + escapeHtml(concept.summary) + '</p>';
      }

      html += '</div>';

      els.conceptInfo.innerHTML = html;
      els.conceptInfo.hidden = false;
    }

    function renderSemanticResults(conceptId) {
      var els = getElements();
      if (!els.results) return;

      var ui = window.NeuralVerse?.SemanticUIController;
      if (!ui) {
        els.results.innerHTML = '<p class="nv-sem-empty">Semantic UI controller not available.</p>';
        return;
      }

      var panelHtml = ui.renderSemanticPanel(conceptId);
      var traversalHtml = ui.renderTraversalPanel(conceptId);

      var html = '';
      if (panelHtml) html += panelHtml;
      if (traversalHtml) html += traversalHtml;

      if (!html) {
        html = '<p class="nv-sem-empty">No semantic data available for this concept.</p>';
      }

      els.results.innerHTML = html;
    }

    function renderIntelligence(els, conceptId) {
      if (!els.intelligence) return;

      var ui = window.NeuralVerse?.SemanticUIController;
      if (!ui) return;

      var html = ui.renderIntelligencePanels(conceptId);
      els.intelligence.innerHTML = html;
      els.intelligence.hidden = !html;
    }

    function renderCrossSystem(els, conceptId) {
      if (!els.crossSystemActions) return;

      var engine = getEngine();
      if (!engine) return;

      var concept = engine.getConcept(conceptId);
      if (!concept) {
        els.crossSystemActions.hidden = true;
        return;
      }

      var html = renderCrossSystemActions(conceptId, concept.name);
      els.crossSystemActions.innerHTML = html;
      els.crossSystemActions.hidden = !html;

      // Bind workspace context button
      var wsBtn = els.crossSystemActions.querySelector('[data-action="workspace-context"]');
      if (wsBtn) {
        addListener(wsBtn, 'click', function () {
          var stats = getConceptStats(conceptId);
          publishConceptContext(conceptId, concept.name, concept.category, stats);
          showActionToast('Workspace context updated');
        });
      }
    }

    function showActionToast(msg) {
      var els = getElements();
      if (!els.toast) return;

      els.toast.textContent = msg;
      els.toast.hidden = false;
      els.toast.classList.add('nv-sem-toast--visible');

      setTimeout(function () {
        els.toast.classList.remove('nv-sem-toast--visible');
        setTimeout(function () {
          els.toast.hidden = true;
        }, TRANSITION_DURATION_MS);
      }, 2000);
    }

    /* ─── Selection Handler ───────────────────────────────── */

    function handleSelection() {
      var els = getElements();
      if (!els.select) return;

      var conceptId = els.select.value;

      if (!conceptId) {
        _selectedConceptId = null;
        clearBreadcrumb();
        setConceptInURL(null);
        showEmptyState();
        if (els.conceptInfo) els.conceptInfo.hidden = true;
        if (els.results) els.results.innerHTML = '';
        if (els.intelligence) {
          els.intelligence.innerHTML = '';
          els.intelligence.hidden = true;
        }
        if (els.crossSystemActions) {
          els.crossSystemActions.innerHTML = '';
          els.crossSystemActions.hidden = true;
        }
        hideViz();
        return;
      }

      var isConceptSwitch = _selectedConceptId !== null && _selectedConceptId !== conceptId;
      _selectedConceptId = conceptId;
      hideEmptyState();

      setConceptInURL(conceptId);
      pushBreadcrumb(conceptId);

      if (isConceptSwitch) {
        crossfadeContent(els, function () {
          showLoading();
          requestAnimationFrame(function () {
            progressiveReveal(els, conceptId);
            hideLoading();
          });
        });
      } else {
        showLoading();
        requestAnimationFrame(function () {
          progressiveReveal(els, conceptId);
          hideLoading();
        });
      }
    }

    /* ─── Visualization ───────────────────────────────────── */

    function initViz() {
      var els = getElements();
      if (!els.vizCanvas) return;

      var factory = window.NeuralVerse?.createSemanticNeighborhoodViz;
      if (!factory) return;

      _vizInstance = factory({
        root: els.vizContainer,
        onConceptSelect: function (conceptId) {
          if (els.select) {
            els.select.value = conceptId;
            handleSelection();
          }
        }
      });

      _vizInstance.mount(els.vizCanvas);
    }

    function renderNeighborhoodViz(conceptId) {
      var els = getElements();
      if (!els.vizContainer) return;

      if (!_vizInstance) initViz();
      if (!_vizInstance) return;

      els.vizContainer.hidden = false;
      _vizInstance.renderViz(conceptId);
    }

    function hideViz() {
      var els = getElements();
      if (els.vizContainer) els.vizContainer.hidden = true;
    }

    function destroyViz() {
      if (_vizInstance) {
        _vizInstance.destroy();
        _vizInstance = null;
      }
    }

    /* ─── Lifecycle ───────────────────────────────────────── */

    function initialize() {
      if (_initialized) return;

      var els = getElements();
      if (!els.root) return;

      showLoading();

      var semanticLearning = window.NeuralVerse?.semanticLearning;
      var initPromise = semanticLearning && typeof semanticLearning.ensureInitialized === 'function'
        ? semanticLearning.ensureInitialized()
        : Promise.resolve();

      initPromise.then(function () {
        var count = populateConceptBrowser();
        hideLoading();

        if (count === 0) {
          showEmptyState();
          return;
        }

        if (els.select) {
          addListener(els.select, 'change', handleSelection);
        }

        // Deep linking: check URL for concept parameter
        var urlConcept = getConceptFromURL();
        if (urlConcept && els.select) {
          var engine = getEngine();
          var concept = engine ? engine.getConcept(urlConcept) : null;
          if (concept) {
            els.select.value = urlConcept;
            _initialized = true;
            handleSelection();
            dispatch('nv:semantic-page-ready', { conceptCount: count, deepLinked: true });
            return;
          } else {
            // Invalid concept — show fallback
            showEmptyState();
            _initialized = true;
            dispatch('nv:semantic-page-ready', { conceptCount: count, deepLinked: false, invalidConcept: urlConcept });
            return;
          }
        }

        showEmptyState();
        _initialized = true;

        dispatch('nv:semantic-page-ready', { conceptCount: count });
      }).catch(function (err) {
        hideLoading();
        showEmptyState();
        console.warn('Semantic Page: Initialization failed:', err.message);
      });
    }

    function destroy() {
      clearListeners();
      clearRevealTimers();
      destroyViz();
      clearBreadcrumb();

      var els = getElements();
      if (els.select) els.select.innerHTML = '<option value="">Choose a concept...</option>';
      if (els.results) els.results.innerHTML = '';
      if (els.conceptInfo) {
        els.conceptInfo.innerHTML = '';
        els.conceptInfo.hidden = true;
      }
      if (els.vizContainer) els.vizContainer.hidden = true;
      if (els.conceptCount) els.conceptCount.textContent = '';
      if (els.toast) {
        els.toast.hidden = true;
        els.toast.classList.remove('nv-sem-toast--visible');
      }
      if (els.intelligence) {
        els.intelligence.innerHTML = '';
        els.intelligence.hidden = true;
      }
      if (els.crossSystemActions) {
        els.crossSystemActions.innerHTML = '';
        els.crossSystemActions.hidden = true;
      }

      _initialized = false;
      _selectedConceptId = null;
      _firstExplorationShown = false;
      _transitionInProgress = false;
    }

    function reinitialize() {
      destroy();
      initialize();
    }

    return {
      initialize: initialize,
      destroy: destroy,
      reinitialize: reinitialize,
      isInitialized: function () { return _initialized; },
      getSelectedConcept: function () { return _selectedConceptId; }
    };
  }

  window.NeuralVerse = window.NeuralVerse || {};
  window.NeuralVerse.createSemanticPageController = createSemanticPageController;
})();
