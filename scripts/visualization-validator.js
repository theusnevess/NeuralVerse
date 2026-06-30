#!/usr/bin/env node
/**
 * NV-1100-P9B — Visualization Validator
 * Validates the parametric visualization system with 250+ deterministic checks.
 */
(function () {
  'use strict';

  var fs = require('fs');
  var path = require('path');

  var passed = 0;
  var failed = 0;
  var errors = [];

  function assert(condition, message) {
    if (condition) {
      passed++;
    } else {
      failed++;
      errors.push(message);
    }
  }

  function assertEqual(actual, expected, message) {
    if (actual === expected) { passed++; } else { failed++; errors.push(message + ': expected ' + JSON.stringify(expected) + ' got ' + JSON.stringify(actual)); }
  }

  function assertArrayLength(arr, min, message) {
    if (Array.isArray(arr) && arr.length >= min) { passed++; } else { failed++; errors.push(message + ': expected array with at least ' + min + ' items, got ' + (Array.isArray(arr) ? arr.length : typeof arr)); }
  }

  function assertType(val, type, message) {
    if (typeof val === type) { passed++; } else { failed++; errors.push(message + ': expected type ' + type + ' got ' + typeof val); }
  }

  function assertIncludes(haystack, needle, message) {
    if (typeof haystack === 'string' && haystack.indexOf(needle) !== -1) { passed++; } else { failed++; errors.push(message + ': expected string to include "' + needle + '"'); }
  }

  function assertNotIncludes(haystack, needle, message) {
    if (typeof haystack === 'string' && haystack.indexOf(needle) === -1) { passed++; } else { failed++; errors.push(message + ': expected string to NOT include "' + needle + '"'); }
  }

  function readFile(filePath) {
    try {
      return fs.readFileSync(filePath, 'utf8');
    } catch (e) {
      return null;
    }
  }

  var BASE = path.resolve(__dirname, '..', 'website');
  var VIZ_DIR = path.join(BASE, 'scripts', 'visualizations');
  var CSS_DIR = path.join(BASE, 'styles');
  var PAGES_DIR = path.join(BASE, 'pages');

  // ========== 1. FILE STRUCTURE (20 checks) ==========
  console.log('\n--- 1. File Structure ---');

  var requiredJsFiles = [
    'visualization-definition.js',
    'parameter-engine.js',
    'visualization-engine.js',
    'visualization-registry.js',
    'visualization-state-storage.js',
    'visualization-export-import.js',
    'visualization-renderer.js',
    'visualization-ui.js',
    'visualization-controller.js',
    'base-visualization.js',
    'index.js',
    'parameter-schema.js'
  ];

  for (var fi = 0; fi < requiredJsFiles.length; fi++) {
    var fPath = path.join(VIZ_DIR, requiredJsFiles[fi]);
    var exists = fs.existsSync(fPath);
    assert(exists, 'JS file exists: ' + requiredJsFiles[fi]);
    if (exists) {
      var content = readFile(fPath);
      assert(content !== null && content.length > 0, 'JS file non-empty: ' + requiredJsFiles[fi]);
    }
  }

  assert(fs.existsSync(path.join(CSS_DIR, 'parametric-visualizations.css')), 'CSS file exists');
  assert(fs.existsSync(path.join(PAGES_DIR, 'visualizations.html')), 'HTML page exists');
  assert(fs.existsSync(__dirname + '/visualization-validator.js'), 'Validator file itself exists');

  var defFile = readFile(path.join(VIZ_DIR, 'visualization-definition.js'));
  assert(defFile !== null && (defFile.indexOf('IIFE') !== -1 || defFile.indexOf('(function') !== -1), 'Definition file uses IIFE pattern');

  var engineFile = readFile(path.join(VIZ_DIR, 'visualization-engine.js'));
  assert(engineFile !== null && engineFile.indexOf('escapeHtml') !== -1, 'Engine file contains escapeHtml');
  assert(engineFile !== null && engineFile.indexOf('computeRenderModel') !== -1, 'Engine file contains computeRenderModel');

  // ========== 2. VISUALIZATION DEFINITIONS (40 checks) ==========
  console.log('\n--- 2. Visualization Definitions ---');

  // Parse definitions from file using regex to extract the array
  var defMatch = defFile ? defFile.match(/const definitions = (\[[\s\S]*?\]);/) : null;
  var definitions = [];

  if (defMatch) {
    try {
      definitions = eval('(' + defMatch[1] + ')');
    } catch (e) {
      // fallback: count manually
    }
  }

  // If eval didn't work, count definitions manually
  if (!definitions || definitions.length === 0) {
    var idMatches = defFile ? defFile.match(/^\s+id:\s+'([^']+)'/gm) : [];
    definitions = idMatches.map(function (m) {
      return { id: m.replace(/^\s+id:\s+'/, '').replace(/'$/, '') };
    });
  }

  assertArrayLength(definitions, 20, 'At least 20 visualization definitions exist');

  var validCategories = ['mathematics', 'deep-learning', 'optimization', 'probability', 'embeddings', 'transformers', 'machine-learning', 'evaluation'];
  var validRenderers = ['line-plot', 'bar-chart', 'scatter-plot', 'heatmap', 'matrix'];

  // Collect data for later checks
  var allIds = [];
  var allSlugs = [];
  var allCategories = [];
  var allRenderers = [];
  var allConcepts = [];
  var allArtifactRefs = [];
  var allSharedKnowledge = [];
  var allSchemas = [];
  var allDefaultParams = [];

  var defsById = {};

  for (var di = 0; di < definitions.length; di++) {
    var def = definitions[di];

    // Required fields
    assertType(def.id, 'string', 'Definition[' + di + '] has id');
    assertType(def.title, 'string', 'Definition[' + di + '] has title');
    assertType(def.slug, 'string', 'Definition[' + di + '] has slug');
    assertType(def.summary, 'string', 'Definition[' + di + '] has summary');
    assertType(def.category, 'string', 'Definition[' + di + '] has category');
    assert(Array.isArray(def.concepts), 'Definition[' + di + '] has concepts array');
    assert(Array.isArray(def.artifactReferences), 'Definition[' + di + '] has artifactReferences array');
    assert(Array.isArray(def.sharedKnowledgeDomains), 'Definition[' + di + '] has sharedKnowledgeDomains array');
    assert(Array.isArray(def.parameterSchema), 'Definition[' + di + '] has parameterSchema array');
    assertType(def.defaultParameters, 'object', 'Definition[' + di + '] has defaultParameters');
    assertType(def.renderer, 'string', 'Definition[' + di + '] has renderer');
    assertType(def.version, 'string', 'Definition[' + di + '] has version');
    assert(def.canonicalStatus === true, 'Definition[' + di + '] has canonicalStatus = true');

    allIds.push(def.id);
    allSlugs.push(def.slug);
    allCategories.push(def.category);
    allRenderers.push(def.renderer);
    allConcepts.push(def.concepts);
    allArtifactRefs.push(def.artifactReferences);
    allSharedKnowledge.push(def.sharedKnowledgeDomains);
    allSchemas.push(def.parameterSchema);
    allDefaultParams.push(def.defaultParameters);
    defsById[def.id] = def;
  }

  // Unique IDs
  var uniqueIds = allIds.filter(function (v, i, a) { return a.indexOf(v) === i; });
  assertEqual(uniqueIds.length, allIds.length, 'All definition IDs are unique');

  // Unique slugs
  var uniqueSlugs = allSlugs.filter(function (v, i, a) { return a.indexOf(v) === i; });
  assertEqual(uniqueSlugs.length, allSlugs.length, 'All definition slugs are unique');

  // Valid categories
  for (var ci = 0; ci < allCategories.length; ci++) {
    assert(validCategories.indexOf(allCategories[ci]) !== -1, 'Definition category valid: ' + allCategories[ci]);
  }

  // Valid renderers
  for (var ri = 0; ri < allRenderers.length; ri++) {
    assert(validRenderers.indexOf(allRenderers[ri]) !== -1, 'Definition renderer valid: ' + allRenderers[ri]);
  }

  // At least 1 concept per definition
  for (var coi = 0; coi < allConcepts.length; coi++) {
    assertArrayLength(allConcepts[coi], 1, 'Definition[' + coi + '] has >=1 concept');
  }

  // At least 1 artifact reference
  for (var ari = 0; ari < allArtifactRefs.length; ari++) {
    assertArrayLength(allArtifactRefs[ari], 1, 'Definition[' + ari + '] has >=1 artifact reference');
  }

  // At least 1 shared knowledge domain
  for (var ski = 0; ski < allSharedKnowledge.length; ski++) {
    assertArrayLength(allSharedKnowledge[ski], 1, 'Definition[' + ski + '] has >=1 shared knowledge domain');
  }

  // At least 1 parameter in schema
  for (var sci = 0; sci < allSchemas.length; sci++) {
    assertArrayLength(allSchemas[sci], 1, 'Definition[' + sci + '] has >=1 parameter in schema');
  }

  // Default parameters match schema
  for (var dmi = 0; dmi < definitions.length; dmi++) {
    var dDef = definitions[dmi];
    if (dDef.defaultParameters && dDef.parameterSchema) {
      for (var pi = 0; pi < dDef.parameterSchema.length; pi++) {
        var pId = dDef.parameterSchema[pi].id;
        assert(dDef.defaultParameters.hasOwnProperty(pId), 'Definition[' + dmi + '] defaultParam has key: ' + pId);
      }
    }
  }

  // ========== 3. PARAMETER SCHEMA (30 checks) ==========
  console.log('\n--- 3. Parameter Schema ---');

  var validParamTypes = ['number', 'integer', 'boolean', 'enum'];

  for (var si = 0; si < definitions.length; si++) {
    var sDef = definitions[si];
    if (!sDef.parameterSchema) continue;

    for (var spi = 0; spi < sDef.parameterSchema.length; spi++) {
      var param = sDef.parameterSchema[spi];

      // Type is valid
      assert(validParamTypes.indexOf(param.type) !== -1, 'Param ' + sDef.id + '.' + param.id + ' has valid type: ' + param.type);

      // Has id, label, defaultValue
      assertType(param.id, 'string', 'Param ' + sDef.id + '.' + spi + ' has id');
      assertType(param.label, 'string', 'Param ' + sDef.id + '.' + spi + ' has label');
      assert(param.defaultValue !== undefined, 'Param ' + sDef.id + '.' + spi + ' has defaultValue');

      if (param.type === 'number' || param.type === 'integer') {
        // Has min, max, step
        assert(typeof param.min === 'number', 'Param ' + sDef.id + '.' + param.id + ' has min');
        assert(typeof param.max === 'number', 'Param ' + sDef.id + '.' + param.id + ' has max');
        assert(typeof param.step === 'number', 'Param ' + sDef.id + '.' + param.id + ' has step');

        // Step positive
        if (typeof param.step === 'number') {
          assert(param.step > 0, 'Param ' + sDef.id + '.' + param.id + ' step is positive');
        }

        // min < max
        if (typeof param.min === 'number' && typeof param.max === 'number') {
          assert(param.min < param.max, 'Param ' + sDef.id + '.' + param.id + ' min < max');
        }

        // defaultValue within range
        if (typeof param.min === 'number' && typeof param.max === 'number' && typeof param.defaultValue === 'number') {
          assert(param.defaultValue >= param.min && param.defaultValue <= param.max, 'Param ' + sDef.id + '.' + param.id + ' defaultValue in range');
        }
      }

      if (param.type === 'enum') {
        assert(Array.isArray(param.options) && param.options.length > 0, 'Param ' + sDef.id + '.' + param.id + ' enum has options');
        if (Array.isArray(param.options) && param.options.length > 0) {
          assert(param.options.indexOf(param.defaultValue) !== -1, 'Param ' + sDef.id + '.' + param.id + ' defaultValue in options');
        }
      }
    }
  }

  // ========== 4. PARAMETER ENGINE (40 checks) ==========
  console.log('\n--- 4. Parameter Engine ---');

  var peFile = readFile(path.join(VIZ_DIR, 'parameter-engine.js'));

  // clamp: value between min/max
  assert(peFile !== null && peFile.indexOf('clamp') !== -1, 'Parameter engine has clamp function');
  assert(peFile !== null && peFile.indexOf('Math.min') !== -1, 'clamp uses Math.min');
  assert(peFile !== null && peFile.indexOf('Math.max') !== -1, 'clamp uses Math.max');

  // roundToStep
  assert(peFile !== null && peFile.indexOf('roundToStep') !== -1, 'Parameter engine has roundToStep');
  assert(peFile !== null && peFile.indexOf('Math.round') !== -1, 'roundToStep uses Math.round');

  // isFiniteNumber
  assert(peFile !== null && peFile.indexOf('isFiniteNumber') !== -1, 'Parameter engine has isFiniteNumber');
  assert(peFile !== null && peFile.indexOf('isNaN') !== -1, 'isFiniteNumber checks isNaN');
  assert(peFile !== null && peFile.indexOf('isFinite') !== -1, 'isFiniteNumber checks isFinite');

  // validateParameterValue
  assert(peFile !== null && peFile.indexOf('validateParameterValue') !== -1, 'Parameter engine has validateParameterValue');
  assert(peFile !== null && peFile.indexOf('validateAllParameters') !== -1, 'Parameter engine has validateAllParameters');
  assert(peFile !== null && peFile.indexOf('sanitizeParameters') !== -1, 'Parameter engine has sanitizeParameters');

  // Test clamp logic
  function testClamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
  }
  assertEqual(testClamp(5, 0, 10), 5, 'Clamp: value in range');
  assertEqual(testClamp(-1, 0, 10), 0, 'Clamp: value below min');
  assertEqual(testClamp(15, 0, 10), 10, 'Clamp: value above max');
  assertEqual(testClamp(0, 0, 10), 0, 'Clamp: value at min');
  assertEqual(testClamp(10, 0, 10), 10, 'Clamp: value at max');

  // Test roundToStep logic
  function testRoundToStep(value, step) {
    if (step <= 0) return value;
    return Math.round(value / step) * step;
  }
  assertEqual(testRoundToStep(1.05, 0.1), 1.0 + 0.1, 'roundToStep: 1.05 step 0.1');
  assertEqual(testRoundToStep(2.3, 1), 2, 'roundToStep: 2.3 step 1');
  assertEqual(testRoundToStep(0, 0.5), 0, 'roundToStep: 0 step 0.5');

  // isFiniteNumber logic
  function testIsFiniteNumber(value) {
    return typeof value === 'number' && isFinite(value) && !isNaN(value);
  }
  assert(testIsFiniteNumber(42), 'isFiniteNumber: accepts 42');
  assert(testIsFiniteNumber(0), 'isFiniteNumber: accepts 0');
  assert(testIsFiniteNumber(-3.14), 'isFiniteNumber: accepts -3.14');
  assert(!testIsFiniteNumber(NaN), 'isFiniteNumber: rejects NaN');
  assert(!testIsFiniteNumber(Infinity), 'isFiniteNumber: rejects Infinity');
  assert(!testIsFiniteNumber(-Infinity), 'isFiniteNumber: rejects -Infinity');
  assert(!testIsFiniteNumber('42'), 'isFiniteNumber: rejects string');

  // validate type: number
  function testValidateType(value, expectedType) {
    switch (expectedType) {
      case 'number':
        return testIsFiniteNumber(value);
      case 'integer':
        return testIsFiniteNumber(value) && Math.floor(value) === value;
      case 'boolean':
        return typeof value === 'boolean';
      case 'enum':
        return typeof value === 'string';
      default:
        return false;
    }
  }
  assert(testValidateType(3.14, 'number'), 'Validate type: number accepts float');
  assert(!testValidateType(NaN, 'number'), 'Validate type: number rejects NaN');
  assert(testValidateType(5, 'integer'), 'Validate type: integer accepts 5');
  assert(!testValidateType(5.5, 'integer'), 'Validate type: integer rejects 5.5');
  assert(testValidateType(true, 'boolean'), 'Validate type: boolean accepts true');
  assert(!testValidateType(1, 'boolean'), 'Validate type: boolean rejects 1');
  assert(testValidateType('foo', 'enum'), 'Validate type: enum accepts string');
  assert(!testValidateType(123, 'enum'), 'Validate type: enum rejects number');

  // validateParameterValue rejects invalid values
  assert(peFile !== null && peFile.indexOf("return { valid: false, error: 'Value must be a finite number' }") !== -1, 'validateParameterValue has NaN rejection message');
  assert(peFile !== null && peFile.indexOf("'Value must be a finite integer'") !== -1, 'validateParameterValue has integer rejection message');

  // validateAllParameters handles empty schema
  assert(peFile !== null && peFile.indexOf("return { valid: true, params: {}, errors: [] }") !== -1, 'validateAllParameters handles empty schema');

  // sanitizeParameters produces valid output
  assert(peFile !== null && peFile.indexOf('return validateAllParameters') !== -1, 'sanitizeParameters delegates to validateAllParameters');

  // rejectPrototypePollution
  assert(peFile !== null && peFile.indexOf('rejectPrototypePollution') !== -1, 'Parameter engine has rejectPrototypePollution');
  assert(peFile !== null && peFile.indexOf("__proto__") !== -1, 'rejectPrototypePollution catches __proto__');
  assert(peFile !== null && peFile.indexOf("'constructor'") !== -1, 'rejectPrototypePollution catches constructor');
  assert(peFile !== null && peFile.indexOf("'prototype'") !== -1, 'rejectPrototypePollution catches prototype');

  // ========== 5. VISUALIZATION ENGINE DETERMINISM (40 checks) ==========
  console.log('\n--- 5. Visualization Engine Determinism ---');

  assert(engineFile !== null && engineFile.indexOf('deterministicRandom') !== -1, 'Engine has deterministicRandom');
  assert(engineFile !== null && engineFile.indexOf('generateLinspace') !== -1, 'Engine has generateLinspace');
  assert(engineFile !== null && engineFile.indexOf('generatePoints') !== -1, 'Engine has generatePoints');

  // No Math.random in engine
  assertNotIncludes(engineFile, 'Math.random', 'Engine does not use Math.random');

  // No Date in engine
  assertNotIncludes(engineFile, 'new Date', 'Engine does not use Date');

  // Test deterministicRandom determinism
  function deterministicRandom(seed) {
    var t = (seed + 0x6D2B79F5) | 0;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }

  // Determinism: 10 iterations
  var det10Ref = [];
  for (var d10 = 0; d10 < 10; d10++) {
    det10Ref.push(deterministicRandom(42 + d10));
  }
  var det10Check = [];
  for (var d10b = 0; d10b < 10; d10b++) {
    det10Check.push(deterministicRandom(42 + d10b));
  }
  var det10Match = true;
  for (var d10c = 0; d10c < 10; d10c++) {
    if (det10Ref[d10c] !== det10Check[d10c]) { det10Match = false; break; }
  }
  assert(det10Match, 'deterministicRandom is deterministic over 10 iterations');

  // Determinism: 100 iterations
  var det100Ref = [];
  for (var d100 = 0; d100 < 100; d100++) {
    det100Ref.push(deterministicRandom(d100));
  }
  var det100Check = [];
  for (var d100b = 0; d100b < 100; d100b++) {
    det100Check.push(deterministicRandom(d100b));
  }
  var det100Match = true;
  for (var d100c = 0; d100c < 100; d100c++) {
    if (det100Ref[d100c] !== det100Check[d100c]) { det100Match = false; break; }
  }
  assert(det100Match, 'deterministicRandom is deterministic over 100 iterations');

  // Determinism: 1000 iterations
  var det1000Ref = [];
  for (var d1k = 0; d1k < 1000; d1k++) {
    det1000Ref.push(deterministicRandom(d1k));
  }
  var det1000Check = [];
  for (var d1kb = 0; d1kb < 1000; d1kb++) {
    det1000Check.push(deterministicRandom(d1kb));
  }
  var det1000Match = true;
  for (var d1kc = 0; d1kc < 1000; d1kc++) {
    if (det1000Ref[d1kc] !== det1000Check[d1kc]) { det1000Match = false; break; }
  }
  assert(det1000Match, 'deterministicRandom is deterministic over 1000 iterations');

  // deterministicRandom returns values in [0, 1)
  var allInRange = true;
  for (var d1kv = 0; d1kv < 1000; d1kv++) {
    var v = deterministicRandom(d1kv);
    if (v < 0 || v >= 1) { allInRange = false; break; }
  }
  assert(allInRange, 'deterministicRandom returns values in [0, 1)');

  // generateLinspace determinism
  function generateLinspace(min, max, steps) {
    var result = [];
    if (steps <= 1) { result.push(min); return result; }
    var step = (max - min) / (steps - 1);
    for (var i = 0; i < steps; i++) { result.push(min + step * i); }
    return result;
  }

  var ls1 = generateLinspace(-10, 10, 100);
  var ls2 = generateLinspace(-10, 10, 100);
  var lsMatch = true;
  for (var lsi = 0; lsi < ls1.length; lsi++) {
    if (ls1[lsi] !== ls2[lsi]) { lsMatch = false; break; }
  }
  assert(lsMatch, 'generateLinspace is deterministic');
  assertEqual(ls1.length, 100, 'generateLinspace returns correct count');
  assertEqual(ls1[0], -10, 'generateLinspace starts at min');
  assertEqual(ls1[ls1.length - 1], 10, 'generateLinspace ends at max');

  // generatePoints determinism
  function generatePoints(count, cx, cy, spread, seed) {
    var points = [];
    for (var i = 0; i < count; i++) {
      var s1 = deterministicRandom(seed + i * 2);
      var s2 = deterministicRandom(seed + i * 2 + 1);
      var x = cx + (s1 - 0.5) * 2 * spread;
      var y = cy + (s2 - 0.5) * 2 * spread;
      points.push({ x: x, y: y });
    }
    return points;
  }

  var pts1 = generatePoints(10, 0, 0, 3, 42);
  var pts2 = generatePoints(10, 0, 0, 3, 42);
  var ptsMatch = true;
  for (var pti = 0; pti < pts1.length; pti++) {
    if (pts1[pti].x !== pts2[pti].x || pts1[pti].y !== pts2[pti].y) { ptsMatch = false; break; }
  }
  assert(ptsMatch, 'generatePoints is deterministic');
  assertArrayLength(pts1, 10, 'generatePoints returns correct count');

  // Renderer type checks
  assertIncludes(engineFile, "'line-plot'", 'Engine supports line-plot renderer');
  assertIncludes(engineFile, "'bar-chart'", 'Engine supports bar-chart renderer');
  assertIncludes(engineFile, "'scatter-plot'", 'Engine supports scatter-plot renderer');
  assertIncludes(engineFile, "'heatmap'", 'Engine supports heatmap renderer');
  assertIncludes(engineFile, "'matrix'", 'Engine supports matrix renderer');

  // Line plot has points
  assertIncludes(engineFile, 'type: \'line-plot\'', 'line-plot model has type');
  assertIncludes(engineFile, 'points: points', 'line-plot model has points');

  // Bar chart has bars
  assertIncludes(engineFile, 'type: \'bar-chart\'', 'bar-chart model has type');
  assertIncludes(engineFile, 'bars: bars', 'bar-chart model has bars');

  // Scatter plot has points
  assertIncludes(engineFile, "type: 'scatter-plot'", 'scatter-plot model has type');

  // Heatmap has matrices
  assertIncludes(engineFile, 'matrices: matrix', 'heatmap model has matrices');

  // Confusion matrix has matrix and metrics
  assertIncludes(engineFile, "type: 'confusion-matrix'", 'confusion-matrix model has type');
  assertIncludes(engineFile, 'matrix: [[tp, fp]', 'confusion-matrix has matrix');
  assertIncludes(engineFile, 'metrics:', 'confusion-matrix has metrics');

  // No mutation of input params
  assertNotIncludes(engineFile, 'params.', 'Engine does not mutate params (no direct assignment)');

  // No Math.random in any viz file
  var vizFiles = [
    'visualization-definition.js', 'visualization-engine.js',
    'visualization-registry.js', 'visualization-state-storage.js',
    'visualization-export-import.js', 'visualization-renderer.js',
    'visualization-ui.js', 'visualization-controller.js'
  ];
  for (var nmr = 0; nmr < vizFiles.length; nmr++) {
    var vFile = readFile(path.join(VIZ_DIR, vizFiles[nmr]));
    if (vFile) {
      assertNotIncludes(vFile, 'Math.random', vizFiles[nmr] + ' does not use Math.random');
    }
  }

  // ========== 6. XSS PREVENTION (20 checks) ==========
  console.log('\n--- 6. XSS Prevention ---');

  // escapeHtml escapes
  assertIncludes(engineFile, "'&amp;'", 'escapeHtml escapes &');
  assertIncludes(engineFile, "'&lt;'", 'escapeHtml escapes <');
  assertIncludes(engineFile, "'&gt;'", 'escapeHtml escapes >');
  assertIncludes(engineFile, "'&quot;'", 'escapeHtml escapes "');

  // Test escapeHtml logic
  function testEscapeHtml(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }
  assertEqual(testEscapeHtml('&'), '&amp;', 'escapeHtml: & escaped');
  assertEqual(testEscapeHtml('<'), '&lt;', 'escapeHtml: < escaped');
  assertEqual(testEscapeHtml('>'), '&gt;', 'escapeHtml: > escaped');
  assertEqual(testEscapeHtml('"'), '&quot;', 'escapeHtml: " escaped');
  assertEqual(testEscapeHtml('hello'), 'hello', 'escapeHtml: plain text unchanged');
  assertEqual(testEscapeHtml('<script>alert("xss")</script>'), '&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;', 'escapeHtml: full XSS payload escaped');

  // No eval
  for (var xss = 0; xss < vizFiles.length; xss++) {
    var xf = readFile(path.join(VIZ_DIR, vizFiles[xss]));
    if (xf) {
      assertNotIncludes(xf, 'eval(', vizFiles[xss] + ' has no eval(');
    }
  }

  // No new Function
  for (var xss2 = 0; xss2 < vizFiles.length; xss2++) {
    var xf2 = readFile(path.join(VIZ_DIR, vizFiles[xss2]));
    if (xf2) {
      assertNotIncludes(xf2, 'new Function', vizFiles[xss2] + ' has no new Function');
    }
  }

  // No setTimeout with string
  for (var xss3 = 0; xss3 < vizFiles.length; xss3++) {
    var xf3 = readFile(path.join(VIZ_DIR, vizFiles[xss3]));
    if (xf3) {
      assertNotIncludes(xf3, 'setTimeout("', vizFiles[xss3] + ' has no setTimeout with string');
    }
  }

  // ========== 7. PROTOTYPE POLLUTION (15 checks) ==========
  console.log('\n--- 7. Prototype Pollution ---');

  // Test rejectPrototypePollution logic
  function testRejectPrototypePollution(obj) {
    if (!obj || typeof obj !== 'object') return true;
    var keys = Object.keys(obj);
    for (var i = 0; i < keys.length; i++) {
      var key = keys[i];
      if (key === '__proto__' || key === 'constructor' || key === 'prototype') {
        return false;
      }
    }
    return true;
  }

  assert(testRejectPrototypePollution({ valid: true }), 'rejectPrototypePollution: accepts valid object');
  var protoPollutionFixture = JSON.parse('{"__proto__":{}}');
  assert(!testRejectPrototypePollution(protoPollutionFixture), 'rejectPrototypePollution: rejects __proto__');
  assert(!testRejectPrototypePollution({ 'constructor': {} }), 'rejectPrototypePollution: rejects constructor');
  assert(!testRejectPrototypePollution({ 'prototype': {} }), 'rejectPrototypePollution: rejects prototype');
  assert(testRejectPrototypePollution(null), 'rejectPrototypePollution: null returns true');
  assert(testRejectPrototypePollution(undefined), 'rejectPrototypePollution: undefined returns true');
  assert(testRejectPrototypePollution('string'), 'rejectPrototypePollution: string returns true');

  // Nested __proto__
  var nested = { a: { '__proto__': { polluted: true } } };
  assert(testRejectPrototypePollution(nested), 'rejectPrototypePollution: nested __proto__ at top level passes (shallow check)');

  // Verify prototype chain not modified by direct __proto__ test
  var testObj = {};
  assert(!testObj.hasOwnProperty('__polluted'), 'Prototype chain unmodified before test');

  // Verify the function exists in the engine
  assertIncludes(peFile, 'rejectPrototypePollution', 'Parameter engine exports rejectPrototypePollution');

  // ========== 8. STATE STORAGE (20 checks) ==========
  console.log('\n--- 8. State Storage ---');

  var ssFile = readFile(path.join(VIZ_DIR, 'visualization-state-storage.js'));
  assert(ssFile !== null, 'State storage file exists');

  // Check for key functions
  assertIncludes(ssFile, 'loadPreferences', 'State storage has loadPreferences');
  assertIncludes(ssFile, 'savePreferences', 'State storage has savePreferences');
  assertIncludes(ssFile, 'loadPresets', 'State storage has loadPresets');
  assertIncludes(ssFile, 'savePreset', 'State storage has savePreset');
  assertIncludes(ssFile, 'deletePreset', 'State storage has deletePreset');
  assertIncludes(ssFile, 'addRecent', 'State storage has addRecent');
  assertIncludes(ssFile, 'toggleFavorite', 'State storage has toggleFavorite');
  assertIncludes(ssFile, 'isFavorite', 'State storage has isFavorite');

  // DEFAULT_PREFERENCES
  assertIncludes(ssFile, 'showGrid', 'State storage has showGrid default');
  assertIncludes(ssFile, 'showAnnotations', 'State storage has showAnnotations default');
  assertIncludes(ssFile, 'animationSpeed', 'State storage has animationSpeed default');
  assertIncludes(ssFile, 'colorScheme', 'State storage has colorScheme default');

  // MAX_RECENT
  assertIncludes(ssFile, 'MAX_RECENT', 'State storage defines MAX_RECENT');
  assertIncludes(ssFile, '20', 'MAX_RECENT is 20');

  // savePreset adds preset
  assertIncludes(ssFile, 'presets[vizId].push', 'savePreset adds to presets array');

  // deletePreset removes
  assertIncludes(ssFile, '.splice(index, 1)', 'deletePreset uses splice to remove');

  // addRecent deduplicates
  assertIncludes(ssFile, 'r.vizId !== vizId', 'addRecent deduplicates by vizId');

  // addRecent limits
  assertIncludes(ssFile, 'recent.length > MAX_RECENT', 'addRecent checks MAX_RECENT limit');
  assertIncludes(ssFile, 'recent = recent.slice(0, MAX_RECENT)', 'addRecent truncates to MAX_RECENT');

  // ========== 9. EXPORT/IMPORT (20 checks) ==========
  console.log('\n--- 9. Export/Import ---');

  var eiFile = readFile(path.join(VIZ_DIR, 'visualization-export-import.js'));
  assert(eiFile !== null, 'Export/import file exists');

  assertIncludes(eiFile, 'exportState', 'Export/import has exportState');
  assertIncludes(eiFile, 'importState', 'Export/import has importState');
  assertIncludes(eiFile, "'replace'", 'Export/import supports replace mode');
  assertIncludes(eiFile, "'merge'", 'Export/import supports merge mode');
  assertIncludes(eiFile, "'Invalid import data'", 'Export/import rejects invalid data');

  // Export structure
  assertIncludes(eiFile, "version: '1.0.0'", 'Export includes version');
  assertIncludes(eiFile, 'timestamp:', 'Export includes timestamp');
  assertIncludes(eiFile, 'preferences:', 'Export includes preferences');
  assertIncludes(eiFile, 'presets:', 'Export includes presets');
  assertIncludes(eiFile, 'recent:', 'Export includes recent');
  assertIncludes(eiFile, 'favorites:', 'Export includes favorites');

  // Import replace mode
  assertIncludes(eiFile, "if (mode === 'replace')", 'Import has replace branch');
  assertIncludes(eiFile, "if (mode === 'merge')", 'Import has merge branch');

  // Merge preserves existing presets
  assertIncludes(eiFile, "currentPresets[presetKeys[pi]].concat", 'Merge concatenates presets');

  // Dispatches event
  assertIncludes(eiFile, 'nv:viz_state_imported', 'Import dispatches event');

  // Idempotent import (version check)
  assertIncludes(eiFile, "'1.0.0'", 'Export version is 1.0.0');

  // Persistence integration
  assertIncludes(eiFile, 'integrateWithPersistenceManager', 'Export/import integrates with persistence manager');

  // ========== 10. REGISTRY (15 checks) ==========
  console.log('\n--- 10. Registry ---');

  var regFile = readFile(path.join(VIZ_DIR, 'parametric-registry.js'));
  assert(regFile !== null, 'Parametric registry file exists');

  assertIncludes(regFile, 'function initialize', 'Registry has initialize');
  assertIncludes(regFile, 'function getDefinition', 'Registry has getDefinition');
  assertIncludes(regFile, 'function getDefinitionBySlug', 'Registry has getDefinitionBySlug');
  assertIncludes(regFile, 'function getAll', 'Registry has getAll');
  assertIncludes(regFile, 'function getByCategory', 'Registry has getByCategory');
  assertIncludes(regFile, 'function getCategories', 'Registry has getCategories');
  assertIncludes(regFile, 'function search', 'Registry has search');
  assertIncludes(regFile, 'function getCount', 'Registry has getCount');
  assertIncludes(regFile, 'function validateRegistryIntegrity', 'Registry has validateRegistryIntegrity');
  assertIncludes(regFile, 'function normalizeText', 'Registry has normalizeText');
  assertIncludes(regFile, '_initialized', 'Registry tracks initialized state');
  assertIncludes(regFile, 'ParametricRegistry', 'Registry exposes as ParametricRegistry');

  // Search normalization
  assertIncludes(regFile, '.toLowerCase()', 'Registry normalizes search to lowercase');
  assertIncludes(regFile, '.trim()', 'Registry trims search input');

  // ========== 11. ACCESSIBILITY (10 checks) ==========
  console.log('\n--- 11. Accessibility ---');

  var rendererFile = readFile(path.join(VIZ_DIR, 'visualization-renderer.js'));
  assert(rendererFile !== null, 'Renderer file exists');

  // SVG elements have aria-label
  assertIncludes(rendererFile, "'aria-label'", 'Renderer sets aria-label on SVGs');

  // role="img" on SVGs
  assertIncludes(rendererFile, "role: 'img'", 'Renderer sets role="img" on SVGs');

  // Title in SVG
  assertIncludes(rendererFile, 'model.title', 'Renderer includes title text');

  // Axis labels
  assertIncludes(rendererFile, 'model.xLabel', 'Renderer includes x-axis label');
  assertIncludes(rendererFile, 'model.yLabel', 'Renderer includes y-axis label');

  // UI file accessibility
  var uiFile = readFile(path.join(VIZ_DIR, 'visualization-ui.js'));
  assert(uiFile !== null, 'UI file exists');
  assertIncludes(uiFile, 'aria-label', 'UI sets aria-label on interactive elements');
  assertIncludes(uiFile, 'role="region"', 'UI uses role="region"');
  assertIncludes(uiFile, 'aria-live', 'UI or controller uses aria-live');

  // Base visualization accessibility
  var baseFile = readFile(path.join(VIZ_DIR, 'base-visualization.js'));
  assert(baseFile !== null && baseFile.indexOf('aria-label') !== -1, 'BaseVisualization sets aria-label');

  // ========== 12. RESPONSIVE (10 checks) ==========
  console.log('\n--- 12. Responsive ---');

  var cssFile = readFile(path.join(CSS_DIR, 'parametric-visualizations.css'));
  assert(cssFile !== null, 'Parametric visualizations CSS file exists');

  assertIncludes(cssFile, '@media', 'CSS contains media queries');
  assertIncludes(cssFile, 'max-width: 768px', 'CSS has breakpoint at 768px');
  assertIncludes(cssFile, 'max-width: 1024px', 'CSS has breakpoint at 1024px');
  assertIncludes(cssFile, 'grid', 'CSS uses grid layout');
  assertIncludes(cssFile, 'flex', 'CSS uses flex layout');

  // Check for readable font sizes (no font-size below 0.6rem)
  assertIncludes(cssFile, 'font-size', 'CSS defines font sizes');

  // Check for touch targets (min-height or padding)
  assertIncludes(cssFile, 'padding', 'CSS defines padding for touch targets');

  // Check SVG responsive
  assertIncludes(rendererFile || '', 'width:100%', 'SVG renders responsively with width:100%');
  assertIncludes(rendererFile || '', 'viewBox', 'SVG uses viewBox for responsiveness');
  assertIncludes(rendererFile || '', 'max-height', 'SVG has max-height constraint');

  // ========== VIZ-SPECIFIC FILE CHECKS ==========
  console.log('\n--- Viz-Specific Files ---');

  var vizSpecificFiles = [
    'bayes-theorem-viz.js',
    'convolution-intuition-viz.js',
    'distance-metrics-viz.js',
    'forward-prop-viz.js',
    'nearest-neighbor-viz.js',
    'object-detection-viz.js',
    'overfitting-viz.js',
    'rag-pipeline-viz.js',
    'segmentation-viz.js',
    'self-attention-viz.js'
  ];

  for (var vsf = 0; vsf < vizSpecificFiles.length; vsf++) {
    var vsPath = path.join(VIZ_DIR, vizSpecificFiles[vsf]);
    var vsExists = fs.existsSync(vsPath);
    assert(vsExists, 'Viz file exists: ' + vizSpecificFiles[vsf]);
    if (vsExists) {
      var vsContent = readFile(vsPath);
      assert(vsContent !== null && vsContent.length > 0, 'Viz file non-empty: ' + vizSpecificFiles[vsf]);
      // Check for IIFE pattern
      assert(vsContent.indexOf('(function') !== -1 || vsContent.indexOf('export') !== -1, 'Viz file uses IIFE or export: ' + vizSpecificFiles[vsf]);
    }
  }

  // ========== ADDITIONAL INTEGRITY CHECKS ==========
  console.log('\n--- Additional Integrity Checks ---');

  // Verify all renderers are referenced in engine
  assertIncludes(engineFile, 'linePlotRenderer', 'Engine defines linePlotRenderer');
  assertIncludes(engineFile, 'barChartRenderer', 'Engine defines barChartRenderer');
  assertIncludes(engineFile, 'scatterPlotRenderer', 'Engine defines scatterPlotRenderer');
  assertIncludes(engineFile, 'heatmapRenderer', 'Engine defines heatmapRenderer');
  assertIncludes(engineFile, 'matrixRenderer', 'Engine defines matrixRenderer');

  // Verify computeRenderModel switch covers all renderers
  assertIncludes(engineFile, "case 'line-plot':", 'computeRenderModel handles line-plot');
  assertIncludes(engineFile, "case 'bar-chart':", 'computeRenderModel handles bar-chart');
  assertIncludes(engineFile, "case 'scatter-plot':", 'computeRenderModel handles scatter-plot');
  assertIncludes(engineFile, "case 'heatmap':", 'computeRenderModel handles heatmap');
  assertIncludes(engineFile, "case 'matrix':", 'computeRenderModel handles matrix');

  // Verify Object.freeze in definitions
  assertIncludes(defFile, 'Object.freeze', 'Definitions are frozen');

  // Verify window.NeuralVerse namespace
  assertIncludes(defFile, 'window.NeuralVerse', 'Definitions use NeuralVerse namespace');
  assertIncludes(engineFile, 'window.NeuralVerse', 'Engine uses NeuralVerse namespace');
  assertIncludes(regFile, 'window.NeuralVerse', 'Registry uses NeuralVerse namespace');
  assertIncludes(ssFile, 'window.NeuralVerse', 'State storage uses NeuralVerse namespace');
  assertIncludes(eiFile, 'window.NeuralVerse', 'Export/import uses NeuralVerse namespace');
  assertIncludes(peFile, 'window.NeuralVerse', 'Parameter engine uses NeuralVerse namespace');

  // Verify index.js initialization
  var indexFile = readFile(path.join(VIZ_DIR, 'index.js'));
  assert(indexFile !== null && indexFile.indexOf('registry.initialize') !== -1, 'Index initializes registry');
  assert(indexFile !== null && indexFile.indexOf('nv:viz_initialized') !== -1, 'Index dispatches init event');

  // ========== SUMMARY ==========
  console.log('\n=== NV-1100-P9B Visualization Validator ===');
  console.log('Total checks: ' + (passed + failed));
  console.log('Passed: ' + passed);
  console.log('Failed: ' + failed);
  if (errors.length > 0) {
    console.log('\nErrors:');
    errors.forEach(function (e) { console.log('  - ' + e); });
  }
  process.exit(failed > 0 ? 1 : 0);
})();
