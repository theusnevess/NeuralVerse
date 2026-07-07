var Rt = {
  scientific: [
    "theory",
    "principle",
    "concept",
    "method",
    "phenomenon",
    "law",
    "hypothesis"
  ],
  engineering: [
    "technique",
    "pattern",
    "architecture",
    "algorithm",
    "datastructure",
    "framework",
    "library",
    "api",
    "protocol",
    "convention",
    "tool"
  ],
  evidence: [
    "proof",
    "experiment",
    "observation",
    "casestudy",
    "benchmark",
    "comparison",
    "analysis",
    "evaluation",
    "validation",
    "verification",
    "audit",
    "review",
    "citation"
  ],
  context: [
    "problem",
    "task",
    "constraint",
    "goal",
    "assumption"
  ]
}, ht = Object.fromEntries(Object.entries(Rt).flatMap(([e, t]) => t.map((n) => [n, e]))), Pt = {
  epistemic: [
    "requires",
    "enables",
    "contradicts",
    "refines",
    "generalizes",
    "specializes",
    "composes",
    "decomposes",
    "depends_on",
    "influences"
  ],
  structural: [
    "implements",
    "realizes",
    "constrains",
    "extends"
  ],
  pedagogical: [
    "teaches",
    "demonstrates",
    "assesses",
    "builds_on"
  ],
  engineering: [
    "uses",
    "configures",
    "deploys",
    "monitors",
    "optimizes",
    "replaces"
  ],
  evidentiary: [
    "supports",
    "refutes",
    "measures",
    "benchmarks"
  ],
  temporal: [
    "precedes",
    "follows",
    "evolves_to",
    "supersedes"
  ],
  inferential: [
    "implies",
    "suggests",
    "contradicts_evidence",
    "supports_evidence",
    "questions"
  ]
}, qe = Object.fromEntries(Object.entries(Pt).flatMap(([e, t]) => t.map((n) => [n, e]))), pt = /* @__PURE__ */ new Set([
  "requires",
  "depends_on",
  "generalizes",
  "specializes",
  "precedes",
  "follows",
  "evolves_to"
]), gt = /* @__PURE__ */ new Set([
  "requires",
  "depends_on",
  "implements",
  "uses",
  "builds_on"
]), ft = /* @__PURE__ */ new Set([
  "generalizes",
  "specializes",
  "composes",
  "decomposes"
]), yt = {
  implements: {
    source: ["engineering"],
    target: ["scientific"]
  },
  realizes: {
    source: ["engineering"],
    target: ["scientific"]
  },
  constrains: {
    source: ["engineering"],
    target: ["engineering"]
  },
  extends: {
    source: ["engineering"],
    target: ["engineering"]
  },
  uses: {
    source: ["engineering"],
    target: ["engineering"]
  },
  configures: {
    source: ["engineering"],
    target: ["engineering"]
  },
  deploys: {
    source: ["engineering"],
    target: ["engineering"]
  },
  monitors: {
    source: ["engineering"],
    target: ["engineering"]
  },
  optimizes: {
    source: ["engineering"],
    target: ["engineering"]
  },
  replaces: {
    source: ["engineering"],
    target: ["engineering"]
  },
  supports: {
    source: ["evidence"],
    target: [
      "scientific",
      "engineering",
      "context"
    ]
  },
  refutes: {
    source: ["evidence"],
    target: [
      "scientific",
      "engineering",
      "context"
    ]
  },
  measures: {
    source: ["evidence"],
    target: ["engineering"]
  },
  benchmarks: {
    source: ["evidence"],
    target: ["engineering"]
  },
  contradicts_evidence: {
    source: ["evidence"],
    target: ["evidence"]
  },
  supports_evidence: {
    source: ["evidence"],
    target: ["evidence"]
  }
}, ke = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
function vt() {
  let e = "";
  const t = {
    update(n) {
      return e += typeof n == "string" ? n : Array.from(n).join(","), t;
    },
    digest(n) {
      if (n !== "hex") throw new Error("Atlas browser hash compatibility supports hex output only.");
      return Ot(e);
    }
  };
  return t;
}
function Ot(e) {
  let t = 2166136261, n = 16777619;
  for (let i = 0; i < e.length; i += 1) {
    const r = e.charCodeAt(i);
    t ^= r, t = Math.imul(t, 16777619) >>> 0, n = Math.imul(n ^ r, 2246822507) >>> 0;
  }
  return `${t.toString(16).padStart(8, "0")}${n.toString(16).padStart(8, "0")}`.repeat(4).slice(0, 64);
}
function O(e) {
  if (!e || typeof e != "object" || Object.isFrozen(e)) return e;
  for (const t of Reflect.ownKeys(e)) {
    const n = e[t];
    O(n);
  }
  return Object.freeze(e);
}
function zt(e) {
  const t = new Set(e);
  return new Proxy(t, { get(n, i, r) {
    if (i === "add" || i === "delete" || i === "clear") return () => {
      throw new TypeError("Graph snapshot sets are immutable.");
    };
    const a = Reflect.get(n, i, n);
    return typeof a == "function" ? a.bind(n) : a;
  } });
}
function De(e) {
  const t = new Map(e);
  return new Proxy(t, { get(n, i, r) {
    if (i === "set" || i === "delete" || i === "clear") return () => {
      throw new TypeError("Graph snapshots are immutable.");
    };
    const a = Reflect.get(n, i, n);
    return typeof a == "function" ? a.bind(n) : a;
  } });
}
var $t = class {
  entities = /* @__PURE__ */ new Map();
  register(e) {
    if (Gt(e), this.entities.has(e.id)) throw new Error(`Duplicate entity ID forbidden: ${e.id}`);
    if (ht[e.type] !== e.family) throw new Error(`Invalid family/type combination: ${e.family}/${e.type}`);
    const t = O(de(e));
    return this.entities.set(t.id, t), t;
  }
  get(e) {
    return this.entities.get(e);
  }
  list() {
    return [...this.entities.values()];
  }
}, Bt = class {
  entityRegistry;
  edges = /* @__PURE__ */ new Map();
  edgeKeys = /* @__PURE__ */ new Set();
  constructor(e) {
    this.entityRegistry = e;
  }
  register(e) {
    if (Wt(e), this.edges.has(e.id)) throw new Error(`Duplicate relationship ID forbidden: ${e.id}`);
    if (e.source === e.target) throw new Error(`Self-loop relationship forbidden: ${e.id}`);
    if (!this.entityRegistry.get(e.source)) throw new Error(`Missing source entity: ${e.source}`);
    if (!this.entityRegistry.get(e.target)) throw new Error(`Missing target entity: ${e.target}`);
    if (qe[e.type] !== e.category) throw new Error(`Invalid relationship category for ${e.type}: ${e.category}`);
    const t = `${e.source}\0${e.target}\0${e.type}`;
    if (this.edgeKeys.has(t)) throw new Error(`Duplicate relationship tuple forbidden: ${e.source} -> ${e.target} (${e.type})`);
    const n = this.entityRegistry.get(e.source), i = this.entityRegistry.get(e.target), r = yt[e.type];
    if (r && (!r.source.includes(n.family) || !r.target.includes(i.family))) throw new Error(`Invalid relationship family combination for ${e.type}: ${n.family} -> ${i.family}`);
    const a = O(de(e));
    return this.edges.set(a.id, a), this.edgeKeys.add(t), a;
  }
  get(e) {
    return this.edges.get(e);
  }
  list() {
    return [...this.edges.values()];
  }
}, jt = class {
  id;
  version;
  entities = new $t();
  relationships = new Bt(this.entities);
  constructor(e, t) {
    this.id = e, this.version = t;
  }
  registerEntity(e) {
    return this.entities.register(e);
  }
  registerRelationship(e) {
    return this.relationships.register(e);
  }
  toDraftGraph() {
    const e = this.entities.list(), t = this.relationships.list(), n = _e(e, t), i = wt(e, t, n);
    return {
      nodes: e,
      edges: t,
      metadata: Yt(this.id, this.version, e, t),
      index: n,
      metrics: i
    };
  }
}, Vt = class {
  cache = /* @__PURE__ */ new Map();
  compile(e) {
    const t = e.toDraftGraph(), n = bt(t.nodes, t.edges);
    if (!n.valid) throw new Error(`Graph validation failed: ${n.issues.filter((d) => d.severity === "error").map((d) => d.message).join("; ")}`);
    const i = (/* @__PURE__ */ new Date()).toISOString(), r = ve(He({
      nodes: t.nodes,
      edges: t.edges,
      metadata: t.metadata
    })), a = `${e.id}:${e.version}:${r}`, s = this.cache.get(a);
    if (s) return s;
    const o = new Map(t.nodes.map((d) => [d.id, O(de(d))])), c = new Map(t.edges.map((d) => [d.id, O(de(d))])), l = O({
      id: ve(`${e.id}:${e.version}:${r}`).slice(0, 32),
      version: e.version,
      checksum: r,
      createdAt: i,
      nodes: De(o),
      edges: De(c),
      index: t.index,
      metrics: t.metrics,
      metadata: t.metadata
    });
    return this.cache.set(a, l), l;
  }
}, Ft = class {
  generate(e, t) {
    qt(e);
    const n = _t(e, t), i = /* @__PURE__ */ new Set();
    for (const d of n) {
      const u = e.edges.get(d);
      i.add(u.source), i.add(u.target);
    }
    if (t.includeIsolatedNodes)
      for (const d of e.nodes.values()) Ht(d, t) && i.add(d.id);
    const r = [...i].map((d) => e.nodes.get(d)).filter(Boolean), a = n.map((d) => e.edges.get(d)).filter((d) => i.has(d.source) && i.has(d.target)), s = wt(r, a, _e(r, a)), o = (/* @__PURE__ */ new Date()).toISOString(), c = ve(He({
      snapshotId: e.id,
      request: t,
      nodeIds: [...i].sort(),
      edgeIds: a.map((d) => d.id).sort()
    })), l = {
      id: c.slice(0, 32),
      snapshotId: e.id,
      kind: t.kind,
      request: de(t),
      nodeIds: O([...i].sort()),
      edgeIds: O(a.map((d) => d.id).sort()),
      metrics: s,
      metadata: {
        nodeCount: i.size,
        edgeCount: a.length,
        density: s.density,
        checksum: c,
        generatedAt: o
      }
    };
    return Ut(e, l), O(l);
  }
};
function bt(e, t) {
  const n = [], i = /* @__PURE__ */ new Set(), r = /* @__PURE__ */ new Map(), a = /* @__PURE__ */ new Set(), s = /* @__PURE__ */ new Set(), o = /* @__PURE__ */ new Map();
  for (const c of e)
    Mt(c, n), i.has(c.id) && n.push(L("DUPLICATE_ENTITY_ID", `Duplicate entity ID: ${c.id}`, c.id)), i.add(c.id), r.set(c.id, c), o.set(c.id, 0);
  for (const c of t) {
    xt(c, n), a.has(c.id) && n.push(L("DUPLICATE_EDGE_ID", `Duplicate edge ID: ${c.id}`, c.id)), a.add(c.id), c.source === c.target && n.push(L("SELF_LOOP", `Self-loop edge: ${c.id}`, c.id)), i.has(c.source) || n.push(L("MISSING_SOURCE", `Missing source entity: ${c.source}`, c.id)), i.has(c.target) || n.push(L("MISSING_TARGET", `Missing target entity: ${c.target}`, c.id));
    const l = `${c.source}\0${c.target}\0${c.type}`;
    s.has(l) && n.push(L("DUPLICATE_EDGE_TUPLE", `Duplicate edge tuple: ${c.source} -> ${c.target} (${c.type})`, c.id)), s.add(l), o.set(c.source, (o.get(c.source) ?? 0) + 1), o.set(c.target, (o.get(c.target) ?? 0) + 1);
    const d = r.get(c.source), u = r.get(c.target), h = yt[c.type];
    d && u && h && (!h.source.includes(d.family) || !h.target.includes(u.family)) && n.push(L("INVALID_RELATIONSHIP_FAMILY", `Invalid ${c.type} family combination: ${d.family} -> ${u.family}`, c.id));
  }
  for (const [c, l] of o) l === 0 && n.push(we("ORPHAN_NODE", `Orphan node: ${c}`, c));
  return et(e.map((c) => c.id), t.filter((c) => gt.has(c.type))) && n.push(L("CIRCULAR_DEPENDENCY", "Circular dependency detected in dependency relationships.")), et(e.map((c) => c.id), t.filter((c) => ft.has(c.type))) && n.push(L("INVALID_HIERARCHY", "Circular hierarchy detected.")), {
    valid: !n.some((c) => c.severity === "error"),
    issues: n
  };
}
function qt(e) {
  const t = bt([...e.nodes.values()], [...e.edges.values()]);
  return ve(He({
    nodes: [...e.nodes.values()],
    edges: [...e.edges.values()],
    metadata: e.metadata
  })) !== e.checksum && t.issues.push(L("CHECKSUM_MISMATCH", "Snapshot checksum validation failed.", e.id)), (e.metadata.nodeCount !== e.nodes.size || e.metadata.edgeCount !== e.edges.size) && t.issues.push(L("SNAPSHOT_METADATA_MISMATCH", "Snapshot metadata counts do not match graph content.", e.id)), {
    valid: !t.issues.some((n) => n.severity === "error"),
    issues: t.issues
  };
}
function _e(e, t) {
  const n = Kt();
  for (const i of e) {
    q(n.nodesByType, i.type, i.id), q(n.nodesByFamily, i.family, i.id), X(n.nodesByDomain, i.metadata.domain, i.id), X(n.nodesByModule, i.metadata.module, i.id), X(n.nodesByPath, i.metadata.path, i.id), X(n.nodesByApplication, i.metadata.application, i.id), X(n.nodesByArtifact, i.metadata.artifact ? "true" : void 0, i.id), X(n.nodesByAlgorithm, i.metadata.algorithm, i.id), X(n.nodesByArchitecture, i.metadata.architecture, i.id);
    for (const r of i.metadata.tags ?? []) q(n.nodesByTag, r, i.id);
    for (const r of i.metadata.aliases ?? []) q(n.nodesByAlias, r.toLowerCase(), i.id);
  }
  for (const i of t)
    q(n.edgesByType, i.type, i.id), q(n.edgesByCategory, i.category, i.id), q(n.edgesBySource, i.source, i.id), q(n.edgesByTarget, i.target, i.id), q(n.adjacencyList, i.source, i.target), q(n.reverseAdjacencyList, i.target, i.source);
  return Jt(n);
}
function wt(e, t, n = _e(e, t)) {
  const i = e.map((g) => g.id), r = i.length, a = r > 1 ? t.length / (r * (r - 1)) : 0, s = {}, o = {};
  let c = 0, l = 0, d = 0;
  const u = Xt(i, t), h = Zt(i, t);
  for (const g of i) {
    const v = n.adjacencyList.get(g)?.size ?? 0, f = n.reverseAdjacencyList.get(g)?.size ?? 0, M = v + f;
    o[M] = (o[M] ?? 0) + 1, M >= Math.max(3, Math.sqrt(Math.max(r, 1))) && (c += 1), v > 0 && (l += v, d += 1), s[g] = {
      degree: M,
      inDegree: f,
      outDegree: v,
      closeness: h.get(g) ?? 0,
      pageRank: 1 / Math.max(r, 1)
    };
  }
  return O({
    nodeCount: r,
    edgeCount: t.length,
    density: a,
    degreeDistribution: o,
    connectedComponents: u,
    clusters: u.filter((g) => g.length > 1),
    bridgeCount: en(i, t),
    hubCount: c,
    centrality: s,
    hierarchyDepth: Qe(i, t.filter((g) => ft.has(g.type))),
    averageBranching: d > 0 ? l / d : 0,
    orphanCount: Object.entries(s).filter(([, g]) => g.degree === 0).length,
    dependencyDepth: Qe(i, t.filter((g) => gt.has(g.type)))
  });
}
function _t(e, t) {
  const n = [...e.edges.values()], i = {
    curriculum: /* @__PURE__ */ new Set([
      "teaches",
      "demonstrates",
      "assesses",
      "builds_on",
      "requires"
    ]),
    dependency: /* @__PURE__ */ new Set([
      "requires",
      "depends_on",
      "implements",
      "uses",
      "builds_on"
    ]),
    implementation: /* @__PURE__ */ new Set([
      "uses",
      "configures",
      "deploys",
      "extends",
      "implements",
      "monitors",
      "optimizes"
    ]),
    pedagogical: /* @__PURE__ */ new Set([
      "teaches",
      "demonstrates",
      "assesses",
      "builds_on"
    ]),
    application: /* @__PURE__ */ new Set([
      "supports",
      "refutes",
      "measures",
      "benchmarks",
      "implements",
      "uses"
    ])
  }, r = { research: /* @__PURE__ */ new Set([
    "epistemic",
    "structural",
    "engineering",
    "evidentiary",
    "temporal",
    "inferential"
  ]) };
  return n.filter((a) => {
    const s = e.nodes.get(a.source), o = e.nodes.get(a.target), c = i[t.kind], l = r[t.kind], d = t.kind === "topology" || t.kind === "domain" || c?.has(a.type) || l?.has(a.category), u = !t.domain || s.metadata.domain === t.domain || o.metadata.domain === t.domain, h = !t.application || s.metadata.application === t.application || o.metadata.application === t.application, g = !t.module || s.metadata.module === t.module || o.metadata.module === t.module;
    return !!(d && u && h && g);
  }).map((a) => a.id);
}
function Ht(e, t) {
  return (!t.domain || e.metadata.domain === t.domain) && (!t.application || e.metadata.application === t.application) && (!t.module || e.metadata.module === t.module);
}
function Ut(e, t) {
  const n = new Set(t.nodeIds);
  for (const i of t.nodeIds) if (!e.nodes.has(i)) throw new Error(`Projection references missing node: ${i}`);
  for (const i of t.edgeIds) {
    const r = e.edges.get(i);
    if (!r) throw new Error(`Projection references missing edge: ${i}`);
    if (!n.has(r.source) || !n.has(r.target)) throw new Error(`Projection edge endpoints missing from projection: ${i}`);
  }
}
function Yt(e, t, n, i) {
  const r = {
    scientific: 0,
    engineering: 0,
    evidence: 0,
    context: 0
  }, a = {
    epistemic: 0,
    structural: 0,
    pedagogical: 0,
    engineering: 0,
    evidentiary: 0,
    temporal: 0,
    inferential: 0
  }, s = {};
  for (const o of n)
    r[o.family] += 1, o.metadata.domain && (s[o.metadata.domain] = (s[o.metadata.domain] ?? 0) + 1);
  for (const o of i) a[o.category] += 1;
  return O({
    id: e,
    version: t,
    lastUpdated: [...n.map((o) => o.updatedAt), ...i.map((o) => o.updatedAt)].sort().at(-1) ?? (/* @__PURE__ */ new Date(0)).toISOString(),
    nodeCount: n.length,
    edgeCount: i.length,
    domainDistribution: s,
    familyDistribution: r,
    relationshipDistribution: a
  });
}
function Gt(e) {
  const t = [];
  Mt(e, t);
  const n = t.find((i) => i.severity === "error");
  if (n) throw new Error(n.message);
}
function Wt(e) {
  const t = [];
  xt(e, t);
  const n = t.find((i) => i.severity === "error");
  if (n) throw new Error(n.message);
}
function Mt(e, t) {
  ke.test(e.id) || t.push(L("INVALID_ENTITY_ID", `Entity ID must be UUID v4: ${e.id}`, e.id)), e.name.trim() || t.push(L("MISSING_ENTITY_NAME", `Entity name is required: ${e.id}`, e.id)), e.description.trim() || t.push(L("MISSING_ENTITY_DESCRIPTION", `Entity description is required: ${e.id}`, e.id)), ht[e.type] !== e.family && t.push(L("INVALID_FAMILY_TYPE", `Invalid family/type combination: ${e.family}/${e.type}`, e.id)), e.metadata.domain || t.push(we("MISSING_DOMAIN", `Entity domain metadata is recommended: ${e.id}`, e.id)), e.metadata.importance !== void 0 && !be(e.metadata.importance) && t.push(L("INVALID_IMPORTANCE", `Entity importance must be 0..1: ${e.id}`, e.id)), e.metadata.confidence !== void 0 && !be(e.metadata.confidence) && t.push(L("INVALID_CONFIDENCE", `Entity confidence must be 0..1: ${e.id}`, e.id)), e.metadata.evidenceCount !== void 0 && e.metadata.evidenceCount < 0 && t.push(L("INVALID_EVIDENCE_COUNT", `Entity evidenceCount must be >= 0: ${e.id}`, e.id)), (!J(e.createdAt) || !J(e.updatedAt)) && t.push(L("INVALID_ENTITY_TIMESTAMP", `Entity timestamps must be ISO 8601: ${e.id}`, e.id)), e.versions.some((n) => !ke.test(n.id) || !J(n.timestamp)) && t.push(L("INVALID_VERSION", `Entity versions require UUID v4 IDs and ISO timestamps: ${e.id}`, e.id));
}
function xt(e, t) {
  ke.test(e.id) || t.push(L("INVALID_EDGE_ID", `Edge ID must be UUID v4: ${e.id}`, e.id)), qe[e.type] !== e.category && t.push(L("INVALID_RELATIONSHIP_TYPE", `Invalid relationship type/category: ${e.type}/${e.category}`, e.id)), be(e.metadata.weight) || t.push(L("INVALID_WEIGHT", `Edge weight must be 0..1: ${e.id}`, e.id)), be(e.metadata.confidence) || t.push(L("INVALID_EDGE_CONFIDENCE", `Edge confidence must be 0..1: ${e.id}`, e.id)), e.metadata.evidenceCount < 0 && t.push(L("INVALID_EDGE_EVIDENCE_COUNT", `Edge evidenceCount must be >= 0: ${e.id}`, e.id)), e.metadata.direction !== "directed" && t.push(L("INVALID_DIRECTION", `Edges must be directed: ${e.id}`, e.id)), e.metadata.transitive !== pt.has(e.type) && t.push(we("TRANSITIVITY_MISMATCH", `Edge transitivity does not match canonical default: ${e.id}`, e.id)), (!J(e.createdAt) || !J(e.updatedAt) || !J(e.metadata.temporal.createdAt) || !J(e.metadata.temporal.updatedAt)) && t.push(L("INVALID_EDGE_TIMESTAMP", `Edge timestamps must be ISO 8601: ${e.id}`, e.id)), e.metadata.temporal.expiresAt && !J(e.metadata.temporal.expiresAt) && t.push(L("INVALID_EXPIRY_TIMESTAMP", `Edge expiresAt must be ISO 8601: ${e.id}`, e.id)), e.metadata.weight > 0.8 && e.metadata.evidenceCount === 0 && t.push(we("HIGH_WEIGHT_WITHOUT_EVIDENCE", `High-weight edge lacks evidence: ${e.id}`, e.id));
}
function Kt() {
  return {
    nodesByType: /* @__PURE__ */ new Map(),
    nodesByFamily: /* @__PURE__ */ new Map(),
    nodesByDomain: /* @__PURE__ */ new Map(),
    nodesByModule: /* @__PURE__ */ new Map(),
    nodesByPath: /* @__PURE__ */ new Map(),
    nodesByApplication: /* @__PURE__ */ new Map(),
    nodesByArtifact: /* @__PURE__ */ new Map(),
    nodesByAlgorithm: /* @__PURE__ */ new Map(),
    nodesByArchitecture: /* @__PURE__ */ new Map(),
    nodesByTag: /* @__PURE__ */ new Map(),
    nodesByAlias: /* @__PURE__ */ new Map(),
    edgesByType: /* @__PURE__ */ new Map(),
    edgesByCategory: /* @__PURE__ */ new Map(),
    edgesBySource: /* @__PURE__ */ new Map(),
    edgesByTarget: /* @__PURE__ */ new Map(),
    adjacencyList: /* @__PURE__ */ new Map(),
    reverseAdjacencyList: /* @__PURE__ */ new Map()
  };
}
function Jt(e) {
  const t = (n) => De(new Map([...n].map(([i, r]) => [i, zt(r)])));
  return O(Object.fromEntries(Object.entries(e).map(([n, i]) => [n, t(i)])));
}
function q(e, t, n) {
  const i = e.get(t) ?? /* @__PURE__ */ new Set();
  i.add(n), e.set(t, i);
}
function X(e, t, n) {
  t && q(e, t, n);
}
function Xt(e, t) {
  const n = new Map(e.map((a) => [a, /* @__PURE__ */ new Set()]));
  for (const a of t)
    n.get(a.source)?.add(a.target), n.get(a.target)?.add(a.source);
  const i = /* @__PURE__ */ new Set(), r = [];
  for (const a of e) {
    if (i.has(a)) continue;
    const s = [a], o = [];
    i.add(a);
    for (let c = 0; c < s.length; c += 1) {
      const l = s[c];
      o.push(l);
      for (const d of n.get(l) ?? []) i.has(d) || (i.add(d), s.push(d));
    }
    r.push(o.sort());
  }
  return r;
}
function Zt(e, t) {
  const n = new Map(e.map((a) => [a, 0]));
  if (e.length === 0) return n;
  const i = e.length <= 512 ? e.length : Math.min(64, e.length), r = Qt(e.length <= i ? e : Array.from({ length: i }, (a, s) => e[Math.floor(s * e.length / i)]), e, t);
  for (const [a, s] of r) {
    const o = s.filter((l) => l > 0), c = o.reduce((l, d) => l + d, 0);
    n.set(a, c > 0 ? o.length / c : 0);
  }
  return n;
}
function Qt(e, t, n) {
  const i = new Map(t.map((a) => [a, /* @__PURE__ */ new Set()]));
  for (const a of n) i.get(a.source)?.add(a.target);
  const r = /* @__PURE__ */ new Map();
  for (const a of e) {
    const s = /* @__PURE__ */ new Map([[a, 0]]), o = [a];
    for (let c = 0; c < o.length; c += 1) {
      const l = o[c];
      for (const d of i.get(l) ?? []) s.has(d) || (s.set(d, s.get(l) + 1), o.push(d));
    }
    r.set(a, [...s.values()]);
  }
  return r;
}
function en(e, t) {
  const n = new Map(e.map((o) => [o, []]));
  for (const o of t)
    n.get(o.source)?.push({
      to: o.target,
      edgeId: o.id
    }), n.get(o.target)?.push({
      to: o.source,
      edgeId: o.id
    });
  const i = /* @__PURE__ */ new Map(), r = /* @__PURE__ */ new Map();
  let a = 0, s = 0;
  for (const o of e) {
    if (i.has(o)) continue;
    a += 1, i.set(o, a), r.set(o, a);
    const c = [{
      nodeId: o,
      nextIndex: 0
    }];
    for (; c.length > 0; ) {
      const l = c[c.length - 1], d = n.get(l.nodeId) ?? [];
      if (l.nextIndex < d.length) {
        const { to: u, edgeId: h } = d[l.nextIndex];
        if (l.nextIndex += 1, h === l.parentEdgeId) continue;
        i.has(u) ? r.set(l.nodeId, Math.min(r.get(l.nodeId), i.get(u))) : (a += 1, i.set(u, a), r.set(u, a), c.push({
          nodeId: u,
          parent: l.nodeId,
          parentEdgeId: h,
          nextIndex: 0
        }));
      } else
        c.pop(), l.parent && (r.set(l.parent, Math.min(r.get(l.parent), r.get(l.nodeId))), r.get(l.nodeId) > i.get(l.parent) && (s += 1));
    }
  }
  return s;
}
function Qe(e, t) {
  const n = new Map(e.map((s) => [s, []])), i = new Map(e.map((s) => [s, 0]));
  for (const s of t)
    n.get(s.source)?.push(s.target), i.set(s.target, (i.get(s.target) ?? 0) + 1);
  const r = new Map(e.map((s) => [s, 0])), a = e.filter((s) => (i.get(s) ?? 0) === 0);
  for (let s = 0; s < a.length; s += 1) {
    const o = a[s];
    for (const c of n.get(o) ?? [])
      r.set(c, Math.max(r.get(c) ?? 0, (r.get(o) ?? 0) + 1)), i.set(c, (i.get(c) ?? 0) - 1), i.get(c) === 0 && a.push(c);
  }
  return Math.max(0, ...r.values());
}
function et(e, t) {
  const n = new Map(e.map((r) => [r, []]));
  for (const r of t) n.get(r.source)?.push(r.target);
  const i = new Map(e.map((r) => [r, 0]));
  for (const r of e) {
    if (i.get(r) !== 0) continue;
    const a = [{
      nodeId: r,
      nextIndex: 0
    }];
    for (i.set(r, 1); a.length > 0; ) {
      const s = a[a.length - 1], o = n.get(s.nodeId) ?? [];
      if (s.nextIndex < o.length) {
        const c = o[s.nextIndex];
        s.nextIndex += 1;
        const l = i.get(c) ?? 0;
        if (l === 1) return !0;
        l === 0 && (i.set(c, 1), a.push({
          nodeId: c,
          nextIndex: 0
        }));
      } else
        i.set(s.nodeId, 2), a.pop();
    }
  }
  return !1;
}
function He(e) {
  return JSON.stringify(fe(e));
}
function fe(e) {
  return e instanceof Map ? fe(Object.fromEntries([...e.entries()].sort(([t], [n]) => String(t).localeCompare(String(n))))) : e instanceof Set ? [...e].sort() : Array.isArray(e) ? e.map(fe) : e && typeof e == "object" ? Object.fromEntries(Object.entries(e).sort(([t], [n]) => t.localeCompare(n)).map(([t, n]) => [t, fe(n)])) : e;
}
function de(e) {
  return JSON.parse(JSON.stringify(e));
}
function ve(e) {
  return vt("sha256").update(e).digest("hex");
}
function be(e) {
  return Number.isFinite(e) && e >= 0 && e <= 1;
}
function J(e) {
  return typeof e == "string" && !Number.isNaN(Date.parse(e)) && e.includes("T");
}
function L(e, t, n) {
  return {
    severity: "error",
    code: e,
    message: t,
    entityId: n
  };
}
function we(e, t, n) {
  return {
    severity: "warning",
    code: e,
    message: t,
    entityId: n
  };
}
var Z = "2026-07-05T00:00:00.000Z", oe = [
  I("linear-algebra", "Linear Algebra", "Vector spaces, linear maps and matrix operations forming the mathematical substrate of modern AI.", "Mathematics", ["vectors", "matrices"], "beginner", ["matrix algebra"], ["Gilbert Strang, Introduction to Linear Algebra"]),
  I("vectors", "Vectors", "Ordered numerical objects representing points, directions, embeddings and model parameters.", "Mathematics", ["geometry", "embeddings"], "beginner"),
  I("matrices", "Matrices", "Rectangular arrays encoding linear transformations, batched features and learned weights.", "Mathematics", ["linear-transform", "weights"], "beginner"),
  I("matrix-multiplication", "Matrix Multiplication", "Compositional operation at the core of dense layers, attention and GPU-accelerated inference.", "Mathematics", ["gemm", "linear-algebra"], "intermediate", ["GEMM"]),
  I("eigenvalues", "Eigenvalues", "Scalars describing invariant scaling factors of linear transformations.", "Mathematics", ["spectral-analysis"], "intermediate"),
  I("eigenvectors", "Eigenvectors", "Directions preserved by a linear transformation up to scalar multiplication.", "Mathematics", ["spectral-analysis"], "intermediate"),
  I("tensor", "Tensor", "Multidimensional numerical array used as the standard data representation in deep learning systems.", "Mathematics", ["array", "deep-learning"], "beginner"),
  I("norm", "Norm", "Function measuring vector or tensor magnitude for regularization, optimization and similarity.", "Mathematics", ["regularization", "distance"], "beginner"),
  I("gradient", "Gradient", "Vector of partial derivatives indicating steepest local increase of a scalar objective.", "Calculus", ["derivative", "optimization"], "beginner"),
  I("jacobian", "Jacobian", "Matrix of first-order partial derivatives for vector-valued functions.", "Calculus", ["derivative", "autodiff"], "advanced"),
  I("hessian", "Hessian", "Matrix of second-order derivatives used to analyze curvature and optimization dynamics.", "Calculus", ["curvature", "optimization"], "advanced"),
  E("optimization", "Optimization", "Selection of model parameters that minimize or maximize an objective under constraints.", "Mathematics", ["objective", "training"], "intermediate"),
  I("probability", "Probability", "Mathematical framework for uncertainty, stochastic processes and statistical learning.", "Statistics", ["uncertainty"], "beginner", ["probability theory"], ["Kevin Murphy, Probabilistic Machine Learning"]),
  I("statistics", "Statistics", "Methods for estimating, testing and reasoning from sampled data.", "Statistics", ["inference", "estimation"], "beginner"),
  I("calculus", "Calculus", "Study of continuous change underpinning gradients, optimization and differential models.", "Mathematics", ["derivatives", "integrals"], "beginner"),
  I("bias", "Bias", "Systematic error from simplifying assumptions or non-representative data.", "Machine Learning", ["generalization", "error"], "intermediate"),
  I("variance", "Variance", "Sensitivity of a model to changes in training data and sampling noise.", "Machine Learning", ["generalization", "error"], "intermediate"),
  y("python", "Python", "General-purpose language widely used for AI experimentation, data processing and model serving.", "Programming", "tool", ["language", "ml"], "beginner", { module: "programming" }, ["Python 3"]),
  y("cpp", "C++", "Systems programming language used for high-performance runtimes, kernels and inference infrastructure.", "Programming", "tool", ["language", "systems"], "advanced", { module: "programming" }, ["C++"]),
  y("rust", "Rust", "Memory-safe systems language used for reliable infrastructure and high-performance AI tooling.", "Programming", "tool", ["language", "systems"], "advanced", { module: "programming" }),
  y("cuda", "CUDA", "NVIDIA parallel programming platform for GPU acceleration of tensor operations and kernels.", "Programming", "framework", ["gpu", "parallel-computing"], "advanced", { module: "acceleration" }, ["CUDA Toolkit"]),
  y("gpu-memory", "GPU Memory", "Device memory hierarchy and bandwidth constraints shaping training and inference performance.", "Programming", "datastructure", ["memory", "gpu"], "advanced", { module: "acceleration" }),
  y("concurrency", "Concurrency", "Execution model for overlapping tasks, IO and parallel work in AI systems.", "Programming", "technique", ["parallelism", "systems"], "intermediate"),
  y("algorithmic-complexity", "Algorithmic Complexity", "Asymptotic analysis of computational cost and scalability.", "Programming", "technique", ["big-o", "performance"], "intermediate"),
  y("serialization", "Serialization", "Encoding structured data for storage, transport and reproducible artifacts.", "Programming", "technique", ["json", "protobuf"], "beginner"),
  y("data-structures", "Data Structures", "Organized representations enabling efficient access, mutation and traversal.", "Programming", "datastructure", ["arrays", "graphs"], "beginner"),
  I("supervised-learning", "Supervised Learning", "Learning from labeled examples to predict targets for new inputs.", "Machine Learning", ["labels", "prediction"], "beginner", [], ["Bishop, Pattern Recognition and Machine Learning"]),
  I("unsupervised-learning", "Unsupervised Learning", "Learning structure from unlabeled data through density, compression or grouping objectives.", "Machine Learning", ["unlabeled", "structure"], "beginner"),
  I("semi-supervised-learning", "Semi-Supervised Learning", "Learning from a mixture of labeled and unlabeled examples.", "Machine Learning", ["labels", "unlabeled"], "intermediate"),
  I("self-supervised-learning", "Self-Supervised Learning", "Learning representations from prediction tasks derived from the data itself.", "Machine Learning", ["representation-learning"], "intermediate"),
  E("regression", "Regression", "Predictive modeling of continuous target variables.", "Machine Learning", ["prediction", "continuous"], "beginner"),
  E("classification", "Classification", "Predictive modeling of discrete classes or labels.", "Machine Learning", ["prediction", "labels"], "beginner"),
  E("clustering", "Clustering", "Grouping examples by similarity without explicit labels.", "Machine Learning", ["unsupervised", "similarity"], "beginner"),
  E("feature-engineering", "Feature Engineering", "Design and transformation of input variables to improve model performance.", "Machine Learning", ["features", "preprocessing"], "beginner"),
  I("evaluation-metrics", "Evaluation Metrics", "Quantitative measures for assessing model quality and tradeoffs.", "Machine Learning", ["evaluation", "metrics"], "beginner"),
  E("cross-validation", "Cross Validation", "Evaluation method that estimates generalization across multiple data splits.", "Statistics", ["validation", "resampling"], "beginner"),
  y("linear-regression", "Linear Regression", "Algorithm estimating a linear relationship between features and continuous targets.", "Machine Learning", "algorithm", ["regression"], "beginner", { algorithm: "linear-regression" }),
  y("logistic-regression", "Logistic Regression", "Classification algorithm modeling class probability through a logistic link.", "Machine Learning", "algorithm", ["classification"], "beginner", { algorithm: "logistic-regression" }),
  y("k-means", "k-Means", "Clustering algorithm that partitions points into groups around learned centroids.", "Machine Learning", "algorithm", ["clustering"], "beginner", { algorithm: "k-means" }),
  y("random-forest", "Random Forest", "Ensemble algorithm combining decision trees to reduce variance and improve robustness.", "Machine Learning", "algorithm", ["ensemble", "trees"], "intermediate", { algorithm: "random-forest" }),
  y("xgboost", "XGBoost", "Gradient-boosted tree framework widely used for tabular machine learning.", "Machine Learning", "framework", ["boosting", "tabular"], "intermediate", { module: "frameworks" }),
  y("scikit-learn", "scikit-learn", "Python library for classical machine learning algorithms and evaluation workflows.", "Machine Learning", "library", ["python", "ml"], "beginner", { module: "libraries" }),
  I("neural-network", "Neural Network", "Parameterized composition of differentiable layers trained from data.", "Deep Learning", ["differentiable", "layers"], "beginner", [], ["Goodfellow, Bengio and Courville, Deep Learning"]),
  y("mlp", "MLP", "Feed-forward neural network composed of fully connected layers and nonlinear activations.", "Deep Learning", "architecture", ["feed-forward"], "beginner", { architecture: "mlp" }, ["multilayer perceptron"]),
  y("cnn", "CNN", "Neural architecture using convolutional operations for spatial representation learning.", "Computer Vision", "architecture", ["vision", "convolution"], "intermediate", { architecture: "cnn" }, ["Convolutional Neural Network"]),
  y("rnn", "RNN", "Recurrent neural architecture processing sequences through stateful recurrence.", "Deep Learning", "architecture", ["sequence"], "intermediate", { architecture: "rnn" }, ["Recurrent Neural Network"]),
  y("lstm", "LSTM", "Gated recurrent architecture designed to preserve long-range sequential information.", "Deep Learning", "architecture", ["sequence", "gating"], "intermediate", { architecture: "lstm" }),
  y("gru", "GRU", "Gated recurrent unit architecture simplifying LSTM-style recurrence.", "Deep Learning", "architecture", ["sequence", "gating"], "intermediate", { architecture: "gru" }),
  y("transformer", "Transformer", "Attention-based architecture for sequence and multimodal modeling.", "LLMs", "architecture", ["attention", "sequence-modeling"], "advanced", { architecture: "transformer" }, ["transformer architecture"]),
  I("attention", "Attention", "Mechanism computing context-dependent weighted combinations of representations.", "Deep Learning", ["sequence-modeling", "weights"], "advanced", ["attention mechanism"]),
  I("embedding", "Embedding", "Dense vector representation of discrete or structured objects in a learned space.", "NLP", ["representation", "vectors"], "beginner"),
  E("normalization", "Normalization", "Transformation that stabilizes feature or activation distributions during learning.", "Deep Learning", ["stability", "training"], "intermediate"),
  I("residual-connections", "Residual Connections", "Skip connections that improve gradient flow through deep architectures.", "Deep Learning", ["skip-connections", "optimization"], "intermediate", ["skip connections"]),
  E("dropout", "Dropout", "Regularization technique randomly masking activations during training.", "Deep Learning", ["regularization"], "intermediate"),
  y("batchnorm", "BatchNorm", "Normalization layer using mini-batch statistics to stabilize training.", "Deep Learning", "technique", ["normalization"], "intermediate", { algorithm: "batch-normalization" }, ["Batch Normalization"]),
  y("layernorm", "LayerNorm", "Normalization technique computing statistics across features within an example.", "Deep Learning", "technique", ["normalization"], "intermediate", { algorithm: "layer-normalization" }, ["Layer Normalization"]),
  E("backpropagation", "Backpropagation", "Efficient gradient computation through compositions of differentiable operations.", "Deep Learning", ["autodiff", "training"], "intermediate"),
  y("sgd", "Stochastic Gradient Descent", "Optimization algorithm using stochastic mini-batch gradient estimates.", "Machine Learning", "algorithm", ["optimizer"], "intermediate", { algorithm: "sgd" }),
  y("adam", "Adam", "Adaptive gradient optimization algorithm combining momentum and per-parameter scaling.", "Deep Learning", "algorithm", ["optimizer"], "intermediate", { algorithm: "adam" }),
  y("pytorch", "PyTorch", "Deep learning framework for tensor computation, automatic differentiation and model deployment.", "Programming", "framework", ["python", "deep-learning"], "intermediate", { module: "frameworks" }),
  y("tensorflow", "TensorFlow", "Machine learning framework for training, deployment and production inference graphs.", "Programming", "framework", ["deep-learning", "serving"], "intermediate", { module: "frameworks" }),
  E("image-classification", "Image Classification", "Computer vision task assigning category labels to images.", "Computer Vision", ["vision", "classification"], "beginner", ["ImageNet Classification"]),
  E("object-detection", "Object Detection", "Computer vision task locating and classifying object instances in images.", "Computer Vision", ["vision", "localization"], "intermediate"),
  E("segmentation", "Segmentation", "Computer vision task assigning labels to pixels or regions.", "Computer Vision", ["vision", "pixels"], "intermediate"),
  E("tracking", "Tracking", "Computer vision task maintaining object identities across time.", "Computer Vision", ["video", "temporal"], "advanced"),
  E("pose-estimation", "Pose Estimation", "Computer vision task estimating body, object or camera pose from sensory data.", "Computer Vision", ["geometry", "keypoints"], "advanced"),
  E("ocr", "OCR", "Recognition of text characters and words from image data.", "Computer Vision", ["text", "vision"], "intermediate", ["Optical Character Recognition"]),
  E("stereo-vision", "Stereo Vision", "Depth inference from multiple calibrated viewpoints.", "Computer Vision", ["geometry", "depth"], "advanced"),
  E("depth-estimation", "Depth Estimation", "Prediction of scene depth from visual inputs.", "Computer Vision", ["geometry", "3d"], "advanced"),
  y("slam", "SLAM", "Simultaneous localization and mapping for estimating trajectory and environment structure.", "Computer Vision", "algorithm", ["robotics", "mapping"], "advanced", { algorithm: "slam" }),
  y("visual-odometry", "Visual Odometry", "Estimation of camera motion from image sequences.", "Computer Vision", "algorithm", ["motion", "geometry"], "advanced", { algorithm: "visual-odometry" }),
  y("yolo", "YOLO", "Single-stage object detection architecture optimized for real-time detection.", "Computer Vision", "architecture", ["object-detection", "real-time"], "advanced", { architecture: "yolo" }, ["You Only Look Once"]),
  I("anchor-boxes", "Anchor Boxes", "Predefined bounding box priors used by several object detection models.", "Computer Vision", ["detection", "bounding-boxes"], "intermediate"),
  I("iou", "IoU", "Intersection over Union metric for overlap between predicted and target regions.", "Computer Vision", ["metric", "bounding-boxes"], "beginner", ["Intersection over Union"]),
  y("nms", "NMS", "Non-maximum suppression algorithm removing redundant overlapping detections.", "Computer Vision", "algorithm", ["post-processing", "detection"], "intermediate", { algorithm: "nms" }, ["Non-Maximum Suppression"]),
  E("tokenization", "Tokenization", "Conversion of text into discrete units consumed by language models.", "NLP", ["text", "preprocessing"], "beginner"),
  y("word2vec", "Word2Vec", "Neural embedding algorithm learning word vectors from local context.", "NLP", "algorithm", ["embeddings"], "intermediate", { algorithm: "word2vec" }),
  y("bert", "BERT", "Bidirectional transformer encoder architecture for language understanding.", "NLP", "architecture", ["transformer", "encoder"], "advanced", { architecture: "bert" }, ["Bidirectional Encoder Representations from Transformers"]),
  y("gpt", "GPT", "Autoregressive transformer decoder architecture for language generation.", "LLMs", "architecture", ["transformer", "decoder"], "advanced", { architecture: "gpt" }, ["Generative Pre-trained Transformer"]),
  y("t5", "T5", "Text-to-text transformer architecture framing NLP tasks as sequence generation.", "NLP", "architecture", ["seq2seq", "transformer"], "advanced", { architecture: "t5" }),
  y("seq2seq", "Seq2Seq", "Encoder-decoder architecture mapping input sequences to output sequences.", "NLP", "architecture", ["encoder-decoder"], "intermediate", { architecture: "seq2seq" }),
  E("prompt-engineering", "Prompt Engineering", "Design of instructions and context to steer model behavior.", "LLMs", ["prompts", "instructions"], "intermediate"),
  y("rag", "RAG", "Retrieval-augmented generation architecture grounding generation in retrieved external knowledge.", "LLMs", "architecture", ["retrieval", "grounding"], "advanced", {
    architecture: "rag",
    application: "question-answering"
  }, ["Retrieval-Augmented Generation"]),
  y("vector-database", "Vector Database", "Storage and retrieval system optimized for embedding similarity search.", "NLP", "tool", ["retrieval", "embeddings"], "intermediate", { module: "retrieval" }),
  y("semantic-search", "Semantic Search", "Retrieval application using embedding similarity rather than exact lexical matching.", "NLP", "technique", ["search", "embeddings"], "intermediate", { application: "semantic-search" }),
  E("fine-tuning", "Fine Tuning", "Adapting a pretrained model to a downstream domain or task with additional training.", "LLM Engineering", ["adaptation", "training"], "intermediate"),
  y("lora", "LoRA", "Parameter-efficient fine tuning technique using low-rank adaptation matrices.", "LLM Engineering", "technique", ["peft", "fine-tuning"], "advanced", { algorithm: "lora" }, ["Low-Rank Adaptation"]),
  y("qlora", "QLoRA", "Quantized low-rank adaptation enabling efficient fine tuning of large models.", "LLM Engineering", "technique", ["peft", "quantization"], "advanced", { algorithm: "qlora" }),
  E("rlhf", "RLHF", "Alignment method training models from human preference feedback through reinforcement learning.", "LLM Engineering", ["alignment", "preferences"], "advanced", ["Reinforcement Learning from Human Feedback"]),
  y("dpo", "DPO", "Preference optimization method directly training on preference pairs without explicit reward modeling.", "LLM Engineering", "algorithm", ["alignment", "preferences"], "advanced", { algorithm: "dpo" }, ["Direct Preference Optimization"]),
  E("llm-inference", "LLM Inference", "Runtime process of generating outputs from a trained large language model.", "LLM Engineering", ["serving", "generation"], "intermediate"),
  y("quantization", "Quantization", "Technique reducing numerical precision to improve memory and inference efficiency.", "LLM Engineering", "technique", ["compression", "inference"], "advanced", { algorithm: "quantization" }),
  y("kv-cache", "KV Cache", "Cached transformer key/value tensors reused during autoregressive generation.", "LLM Engineering", "datastructure", ["inference", "memory"], "advanced", { module: "inference" }),
  y("speculative-decoding", "Speculative Decoding", "Inference acceleration method verifying draft-model tokens with a target model.", "LLM Engineering", "algorithm", ["inference", "latency"], "advanced", { algorithm: "speculative-decoding" }),
  y("prompt-templates", "Prompt Templates", "Reusable structured prompts with variable slots and constraints.", "LLM Engineering", "pattern", ["prompts", "templates"], "beginner", { module: "prompting" }),
  E("planning", "Planning", "Agent capability for decomposing goals into ordered actions or subgoals.", "Agents", ["goals", "actions"], "advanced"),
  E("reasoning", "Reasoning", "Structured inference over context, goals and constraints to choose actions or explanations.", "Agents", ["inference", "decisions"], "advanced"),
  I("agent-memory", "Agent Memory", "State retained across turns or tasks to support continuity and adaptation.", "Agents", ["state", "context"], "advanced", ["memory"]),
  E("reflection", "Reflection", "Agent self-evaluation process used to critique, revise or improve outputs.", "Agents", ["self-evaluation"], "advanced"),
  y("tool-use", "Tool Use", "Agent pattern for invoking external capabilities through explicit tool interfaces.", "Agents", "pattern", ["tools", "agents"], "advanced", { application: "agentic-systems" }),
  y("mcp", "MCP", "Protocol for connecting AI applications to external tools, data sources and contextual capabilities.", "Agents", "protocol", ["tools", "context"], "advanced", { module: "protocols" }, ["Model Context Protocol"]),
  y("multi-agent", "Multi-Agent System", "Architecture coordinating multiple agents with specialized roles or shared workflows.", "Agents", "architecture", ["coordination", "agents"], "advanced", { architecture: "multi-agent" }),
  y("agent-workflow", "Agent Workflow", "Structured sequence of agent steps, tool calls and validation gates.", "Agents", "pattern", ["workflow", "orchestration"], "intermediate", { module: "orchestration" }),
  I("autonomy", "Autonomy", "Degree to which an agent can plan, act and recover without direct human steering.", "Agents", ["agency", "control"], "advanced"),
  y("experiment-tracking", "Experiment Tracking", "Recording parameters, metrics, artifacts and lineage for model experiments.", "MLOps", "tool", ["experiments", "lineage"], "intermediate", { module: "mlops" }),
  y("deployment", "Deployment", "Process of publishing model artifacts into executable production environments.", "MLOps", "technique", ["release", "production"], "intermediate", { path: "mlops/deployment" }),
  y("serving", "Serving", "Runtime infrastructure exposing trained models for online or batch inference.", "MLOps", "architecture", ["inference", "production"], "intermediate", { architecture: "serving" }),
  y("monitoring", "Monitoring", "Continuous measurement of model, data and system behavior in production.", "MLOps", "technique", ["observability", "drift"], "intermediate"),
  y("cicd", "CI/CD", "Automation pipeline for testing, packaging and releasing software and model changes.", "MLOps", "technique", ["automation", "release"], "intermediate", { module: "delivery" }),
  y("versioning", "Versioning", "Traceable management of datasets, code, models and configurations over time.", "MLOps", "convention", ["lineage", "governance"], "beginner"),
  y("feature-store", "Feature Store", "System for managing, serving and reusing machine learning features.", "MLOps", "architecture", ["features", "serving"], "intermediate", { architecture: "feature-store" }),
  y("model-registry", "Model Registry", "Governed catalog of model artifacts, stages and deployment metadata.", "MLOps", "tool", ["models", "governance"], "intermediate", { module: "registry" }),
  y("mlflow", "MLflow", "Open-source platform for experiment tracking, model registry and deployment workflows.", "MLOps", "tool", ["tracking", "registry"], "intermediate", { module: "mlops" }),
  I("data-drift", "Data Drift", "Change in production data distribution relative to training data.", "MLOps", ["monitoring", "distribution-shift"], "intermediate"),
  ne("model-deployment-task", "Model Deployment", "Operational task of promoting a trained model into production inference.", "task", "MLOps", ["deployment"], "intermediate", { path: "mlops/deployment" }),
  B("imagenet", "ImageNet", "Large-scale image classification dataset and benchmark for visual recognition.", "benchmark", "Computer Vision", ["dataset", "benchmark"], "intermediate", { artifact: "dataset" }),
  B("coco", "COCO", "Dataset and benchmark for object detection, segmentation and captioning.", "benchmark", "Computer Vision", ["dataset", "object-detection"], "intermediate", { artifact: "dataset" }, ["Common Objects in Context"]),
  B("glue", "GLUE", "Benchmark suite for natural language understanding evaluation.", "benchmark", "NLP", ["benchmark", "language"], "intermediate", { artifact: "dataset" }),
  B("squad", "SQuAD", "Question-answering dataset for evaluating reading comprehension systems.", "benchmark", "NLP", ["qa", "benchmark"], "intermediate", { artifact: "dataset" }),
  B("mmlu", "MMLU", "Benchmark measuring multitask language understanding across academic and professional domains.", "benchmark", "LLMs", ["benchmark", "knowledge"], "advanced", { artifact: "dataset" }),
  B("helm", "HELM", "Holistic evaluation benchmark framework for language models.", "evaluation", "LLMs", ["evaluation", "benchmark"], "advanced"),
  B("ablation-study", "Ablation Study", "Experimental method isolating component contributions by removing or varying them.", "experiment", "Research", ["experiments", "causality"], "intermediate"),
  B("baseline", "Baseline", "Reference method or result used as a comparison point in empirical research.", "comparison", "Research", ["evaluation", "comparison"], "beginner"),
  B("reproducibility", "Reproducibility", "Ability to independently obtain consistent results from documented methods and artifacts.", "validation", "Research", ["science", "governance"], "intermediate"),
  B("open-source", "Open Source", "Publicly accessible implementation or artifact enabling inspection, reuse and verification.", "citation", "Research", ["software", "reproducibility"], "beginner"),
  B("transformer-paper", "Attention Is All You Need", "Research paper introducing the Transformer architecture.", "citation", "Research", ["paper", "transformer"], "advanced"),
  B("bert-paper", "BERT Paper", "Research paper introducing bidirectional encoder representations from transformers.", "citation", "Research", ["paper", "bert"], "advanced"),
  B("yolo-paper", "YOLO Paper", "Research paper family introducing real-time single-stage object detection.", "citation", "Research", ["paper", "object-detection"], "advanced"),
  B("lora-paper", "LoRA Paper", "Research paper introducing low-rank adaptation for efficient model fine tuning.", "citation", "Research", ["paper", "fine-tuning"], "advanced"),
  ne("hallucination", "Hallucination", "Unsupported or contradicted model output relative to available evidence or context.", "problem", "LLMs", ["reliability"], "advanced"),
  ne("latency-constraint", "Latency Constraint", "Operational limit on end-to-end response time for inference systems.", "constraint", "MLOps", ["latency", "serving"], "intermediate"),
  ne("privacy-constraint", "Privacy Constraint", "Requirement limiting exposure, storage or processing of sensitive data.", "constraint", "MLOps", ["privacy", "governance"], "intermediate"),
  ne("reliable-ai-goal", "Reliable AI Goal", "Desired outcome that AI systems remain correct, observable and recoverable in realistic operation.", "goal", "MLOps", ["reliability", "governance"], "advanced")
], tn = [
  m("vectors", "linear-algebra", "composes"),
  m("matrices", "linear-algebra", "composes"),
  m("matrix-multiplication", "matrices", "requires"),
  m("eigenvalues", "matrices", "requires"),
  m("eigenvectors", "eigenvalues", "requires"),
  m("gradient", "calculus", "requires"),
  m("jacobian", "gradient", "requires"),
  m("hessian", "jacobian", "requires"),
  m("optimization", "gradient", "requires"),
  m("probability", "statistics", "influences"),
  m("bias", "statistics", "requires"),
  m("variance", "statistics", "requires"),
  m("supervised-learning", "probability", "requires"),
  m("unsupervised-learning", "statistics", "requires"),
  m("semi-supervised-learning", "supervised-learning", "requires"),
  m("self-supervised-learning", "unsupervised-learning", "requires"),
  m("regression", "supervised-learning", "specializes"),
  m("classification", "supervised-learning", "specializes"),
  m("clustering", "unsupervised-learning", "specializes"),
  m("cross-validation", "evaluation-metrics", "requires"),
  m("linear-regression", "regression", "implements"),
  m("logistic-regression", "classification", "implements"),
  m("k-means", "clustering", "implements"),
  m("random-forest", "classification", "implements"),
  m("xgboost", "random-forest", "extends"),
  m("scikit-learn", "linear-regression", "uses"),
  m("scikit-learn", "logistic-regression", "uses"),
  m("scikit-learn", "k-means", "uses"),
  m("neural-network", "linear-algebra", "requires"),
  m("neural-network", "optimization", "requires"),
  m("mlp", "neural-network", "implements"),
  m("cnn", "neural-network", "implements"),
  m("rnn", "neural-network", "implements"),
  m("lstm", "rnn", "extends"),
  m("gru", "rnn", "extends"),
  m("transformer", "attention", "implements"),
  m("transformer", "embedding", "requires"),
  m("transformer", "matrix-multiplication", "requires"),
  m("attention", "matrix-multiplication", "requires"),
  m("backpropagation", "gradient", "requires"),
  m("sgd", "optimization", "implements"),
  m("adam", "sgd", "extends"),
  m("pytorch", "tensor", "implements"),
  m("pytorch", "backpropagation", "implements"),
  m("pytorch", "cuda", "uses"),
  m("tensorflow", "tensor", "implements"),
  m("batchnorm", "normalization", "implements"),
  m("layernorm", "normalization", "implements"),
  m("dropout", "neural-network", "requires"),
  m("residual-connections", "gradient", "influences"),
  m("image-classification", "cnn", "requires"),
  m("object-detection", "image-classification", "requires"),
  m("segmentation", "image-classification", "requires"),
  m("tracking", "object-detection", "requires"),
  m("pose-estimation", "linear-algebra", "requires"),
  m("stereo-vision", "linear-algebra", "requires"),
  m("depth-estimation", "stereo-vision", "requires"),
  m("slam", "visual-odometry", "uses"),
  m("visual-odometry", "matrix-multiplication", "requires"),
  m("yolo", "object-detection", "implements"),
  m("yolo", "anchor-boxes", "requires"),
  m("yolo", "nms", "uses"),
  m("nms", "iou", "requires"),
  m("coco", "yolo", "benchmarks"),
  m("imagenet", "cnn", "benchmarks"),
  m("tokenization", "statistics", "requires"),
  m("embedding", "vectors", "requires"),
  m("word2vec", "embedding", "implements"),
  m("bert", "transformer", "extends"),
  m("gpt", "transformer", "extends"),
  m("t5", "transformer", "extends"),
  m("seq2seq", "rnn", "extends"),
  m("prompt-engineering", "gpt", "requires"),
  m("rag", "semantic-search", "uses"),
  m("rag", "vector-database", "uses"),
  m("rag", "hallucination", "influences"),
  m("semantic-search", "embedding", "requires"),
  m("glue", "bert", "benchmarks"),
  m("squad", "bert", "benchmarks"),
  m("fine-tuning", "transformer", "requires"),
  m("lora", "fine-tuning", "implements"),
  m("qlora", "lora", "extends"),
  m("rlhf", "fine-tuning", "requires"),
  m("dpo", "rlhf", "requires"),
  m("llm-inference", "gpt", "requires"),
  m("quantization", "gpu-memory", "influences"),
  m("kv-cache", "llm-inference", "requires"),
  m("speculative-decoding", "llm-inference", "requires"),
  m("prompt-templates", "prompt-engineering", "implements"),
  m("mmlu", "gpt", "benchmarks"),
  m("helm", "gpt", "benchmarks"),
  m("planning", "reasoning", "requires"),
  m("reflection", "reasoning", "requires"),
  m("tool-use", "planning", "requires"),
  m("mcp", "tool-use", "extends"),
  m("multi-agent", "agent-workflow", "uses"),
  m("agent-workflow", "tool-use", "uses"),
  m("autonomy", "planning", "requires"),
  m("agent-memory", "embedding", "requires"),
  m("experiment-tracking", "versioning", "uses"),
  m("deployment", "model-registry", "uses"),
  m("serving", "deployment", "extends"),
  m("monitoring", "data-drift", "implements"),
  m("cicd", "deployment", "uses"),
  m("feature-store", "feature-engineering", "implements"),
  m("model-registry", "versioning", "uses"),
  m("mlflow", "experiment-tracking", "uses"),
  m("mlflow", "model-registry", "uses"),
  m("model-deployment-task", "deployment", "precedes"),
  m("latency-constraint", "quantization", "influences"),
  m("privacy-constraint", "deployment", "influences"),
  m("reliable-ai-goal", "monitoring", "influences"),
  m("ablation-study", "baseline", "requires"),
  m("reproducibility", "open-source", "supports_evidence"),
  m("transformer-paper", "transformer", "supports"),
  m("bert-paper", "bert", "supports"),
  m("yolo-paper", "yolo", "supports"),
  m("lora-paper", "lora", "supports"),
  m("baseline", "evaluation-metrics", "supports"),
  m("ablation-study", "evaluation-metrics", "supports"),
  m("cuda", "cpp", "uses"),
  m("cuda", "gpu-memory", "uses"),
  m("concurrency", "algorithmic-complexity", "requires"),
  m("concurrency", "cuda", "influences"),
  m("rust", "concurrency", "influences"),
  m("serialization", "versioning", "influences"),
  m("data-structures", "algorithmic-complexity", "influences"),
  m("data-structures", "python", "influences"),
  m("python", "pytorch", "precedes"),
  m("python", "scikit-learn", "precedes")
];
function nn() {
  const e = new jt("atlas-canonical-knowledge", "2.0.0"), t = new Map(oe.map((i, r) => [i.key, Ue("10000000", r + 1)])), n = rn(t);
  for (const [i, r] of oe.entries()) e.registerEntity(an(r, t.get(r.key), i + 1));
  for (const [i, r] of n.entries()) e.registerRelationship(on(r, t, i + 1));
  return e;
}
function rn(e) {
  const t = new Map(oe.map((o) => [o.key, o])), n = /* @__PURE__ */ new Set(), i = [], r = (o) => {
    if (!e.has(o.source) || !e.has(o.target) || o.source === o.target) return;
    const c = `${o.source}\0${o.target}\0${o.type}`;
    n.has(c) || (n.add(c), i.push(o));
  };
  for (const o of tn) r(o);
  const a = [
    "linear-algebra",
    "probability",
    "supervised-learning",
    "neural-network",
    "transformer",
    "image-classification",
    "embedding",
    "llm-inference",
    "reasoning",
    "deployment"
  ];
  for (const o of oe) {
    const c = a.find((l) => t.get(l)?.domain === o.domain);
    if (c && c !== o.key) {
      const l = t.get(c)?.family, d = o.family === "engineering" && l === "engineering" ? "influences" : o.family === "engineering" && l === "scientific" ? "realizes" : "requires";
      r(m(o.key, c, d, 0.66));
    }
    o.family === "engineering" && (o.domain !== "Programming" && r(m(o.key, "python", "uses", 0.6)), [
      "Deep Learning",
      "Computer Vision",
      "LLMs",
      "LLM Engineering"
    ].includes(o.domain) && r(m(o.key, "pytorch", "uses", 0.68))), o.family === "scientific" && o.key !== "statistics" && r(m(o.key, "statistics", "influences", 0.55)), o.family === "context" && r(m(o.key, "reliable-ai-goal", "influences", 0.58));
  }
  const s = /* @__PURE__ */ new Map([
    ["Computer Vision", "object-detection"],
    ["NLP", "bert"],
    ["LLMs", "gpt"],
    ["Research", "reproducibility"],
    ["MLOps", "monitoring"]
  ]);
  for (const o of oe.filter((c) => c.family === "evidence")) {
    const c = s.get(o.domain) ?? "evaluation-metrics", l = t.get(c)?.family, d = l === "evidence" ? "supports_evidence" : l === "engineering" && o.type !== "citation" ? "benchmarks" : "supports";
    r(m(o.key, c, d, 0.75));
  }
  return i;
}
function I(e, t, n, i, r, a, s = [], o = []) {
  return {
    key: e,
    type: "concept",
    family: "scientific",
    name: t,
    description: n,
    domain: i,
    tags: r,
    difficulty: a,
    aliases: s,
    references: o
  };
}
function E(e, t, n, i, r, a, s = []) {
  return {
    key: e,
    type: "method",
    family: "scientific",
    name: t,
    description: n,
    domain: i,
    tags: r,
    difficulty: a,
    aliases: s
  };
}
function y(e, t, n, i, r, a, s, o = {}, c = []) {
  return {
    key: e,
    type: r,
    family: "engineering",
    name: t,
    description: n,
    domain: i,
    tags: a,
    difficulty: s,
    metadata: o,
    aliases: c
  };
}
function B(e, t, n, i, r, a, s, o = {}, c = []) {
  return {
    key: e,
    type: i,
    family: "evidence",
    name: t,
    description: n,
    domain: r,
    tags: a,
    difficulty: s,
    metadata: o,
    aliases: c
  };
}
function ne(e, t, n, i, r, a, s, o = {}) {
  return {
    key: e,
    type: i,
    family: "context",
    name: t,
    description: n,
    domain: r,
    tags: a,
    difficulty: s,
    metadata: o
  };
}
function m(e, t, n, i = 0.72) {
  return {
    source: e,
    target: t,
    type: n,
    weight: i
  };
}
function an(e, t, n) {
  const i = [.../* @__PURE__ */ new Set([
    e.name.toLowerCase(),
    e.key,
    ...(e.aliases ?? []).map((r) => r.toLowerCase())
  ])];
  return {
    id: t,
    type: e.type,
    family: e.family,
    name: e.name,
    description: e.description,
    metadata: {
      domain: e.domain,
      tags: e.tags,
      difficulty: e.difficulty,
      importance: e.metadata?.importance ?? 0.82,
      confidence: e.metadata?.confidence ?? 0.92,
      evidenceCount: e.metadata?.evidenceCount ?? Math.max(1, e.references?.length ?? 1),
      aliases: i,
      references: e.references ?? [],
      ...e.metadata
    },
    versions: [{
      id: Ue("20000000", n),
      version: 1,
      changes: ["phase 2 canonical AI engineering population"],
      author: "atlas-knowledge-population",
      timestamp: Z,
      reason: "NV-700 Phase 2 Knowledge Population",
      snapshot: {
        id: t,
        name: e.name,
        type: e.type,
        family: e.family
      }
    }],
    createdAt: Z,
    updatedAt: Z,
    status: "active"
  };
}
function on(e, t, n) {
  const i = e.type, r = {
    weight: e.weight ?? 0.72,
    confidence: 0.9,
    evidenceCount: 1,
    canonicalStatus: "canonical",
    temporal: {
      createdAt: Z,
      updatedAt: Z,
      expiresAt: null
    },
    sourceEvidence: [],
    direction: "directed",
    transitive: pt.has(i),
    multiplicity: "many-to-many"
  };
  return {
    id: Ue("30000000", n),
    source: t.get(e.source),
    target: t.get(e.target),
    type: i,
    category: qe[i],
    metadata: r,
    createdAt: Z,
    updatedAt: Z,
    status: "active"
  };
}
function Ue(e, t) {
  return `${e}-0000-4000-8000-${t.toString(16).padStart(12, "0")}`;
}
function R(e) {
  if (e && typeof e == "object") {
    Object.freeze(e);
    for (const t of Object.values(e)) t && typeof t == "object" && !Object.isFrozen(t) && R(t);
  }
  return e;
}
var sn = 0.25, cn = 6, ln = 96, dn = 280, un = (e) => 1 - Math.pow(1 - e, 3), mn = class {
  viewport;
  initialViewport;
  baseVisibleBounds = null;
  minZoom;
  maxZoom;
  padding;
  animationFrame = null;
  animationStart = null;
  animationFrom = null;
  animationTo = null;
  animationCallback = null;
  constructor(e, t, n = {}) {
    this.minZoom = n.minZoom ?? sn, this.maxZoom = n.maxZoom ?? cn, this.padding = n.viewportPadding ?? ln, this.viewport = this.normalize(e, t), this.baseVisibleBounds = this.viewport.visibleBounds, this.initialViewport = this.viewport;
  }
  getViewport() {
    return this.viewport;
  }
  get isAnimating() {
    return this.animationFrame !== null;
  }
  reset() {
    return this.cancelAnimation(), this.viewport = this.initialViewport, this.viewport;
  }
  resetAnimated(e) {
    this.cancelAnimation(), this.animationFrom = { ...this.viewport }, this.animationTo = { ...this.initialViewport }, this.animationStart = performance.now(), this.animationCallback = e, this.animationFrame = requestAnimationFrame((t) => this.stepAnimation(t));
  }
  focusOnAnimated(e, t) {
    this.cancelAnimation();
    const n = this.withCenter(e);
    this.animationFrom = { ...this.viewport }, this.animationTo = { ...n }, this.animationStart = performance.now(), this.animationCallback = t, this.animationFrame = requestAnimationFrame((i) => this.stepAnimation(i));
  }
  stepAnimation(e) {
    if (!this.animationFrom || !this.animationTo || this.animationStart === null) return;
    const t = e - this.animationStart, n = Math.min(1, t / dn), i = un(n);
    this.viewport = {
      ...this.viewport,
      center: {
        x: this.animationFrom.center.x + (this.animationTo.center.x - this.animationFrom.center.x) * i,
        y: this.animationFrom.center.y + (this.animationTo.center.y - this.animationFrom.center.y) * i
      },
      zoom: this.animationFrom.zoom + (this.animationTo.zoom - this.animationFrom.zoom) * i
    }, this.viewport = this.withCenter(this.viewport.center, this.viewport.zoom), n < 1 ? this.animationFrame = requestAnimationFrame((r) => this.stepAnimation(r)) : (this.animationFrame = null, this.animationFrom = null, this.animationTo = null, this.animationStart = null), this.animationCallback?.();
  }
  cancelAnimation() {
    this.animationFrame !== null && (cancelAnimationFrame(this.animationFrame), this.animationFrame = null, this.animationFrom = null, this.animationTo = null, this.animationStart = null);
  }
  pan(e, t) {
    const n = Ye(this.viewport, t), i = {
      ...this.viewport,
      center: {
        x: this.viewport.center.x - e.x / n,
        y: this.viewport.center.y - e.y / n
      }
    };
    return this.viewport = this.withCenter(i.center), this.viewport;
  }
  zoom(e, t, n) {
    const i = gn(e);
    if (i === 0) return this.viewport;
    const r = Te(t, this.viewport, n), a = Math.exp(-i * 12e-4), s = ue(this.viewport.zoom * a, this.minZoom, this.maxZoom), o = {
      ...this.rebuildViewport(this.viewport.center, s),
      worldBounds: this.viewport.worldBounds
    }, c = Te(t, o, n), l = {
      x: r.x - c.x,
      y: r.y - c.y
    };
    return this.viewport = this.withCenter({
      x: o.center.x + l.x,
      y: o.center.y + l.y
    }, s), this.viewport;
  }
  focusOn(e) {
    return this.cancelAnimation(), this.viewport = this.withCenter(e), this.viewport;
  }
  normalize(e, t) {
    const n = ue(e.zoom, this.minZoom, this.maxZoom), i = e.center ?? {
      x: t.x + t.width / 2,
      y: t.y + t.height / 2
    };
    return R({
      ...this.rebuildViewport(i, n, e.visibleBounds),
      worldBounds: t
    });
  }
  withCenter(e, t = this.viewport.zoom) {
    return R({
      ...this.rebuildViewport(pn(e, this.viewport.worldBounds, this.padding), t),
      worldBounds: this.viewport.worldBounds
    });
  }
  rebuildViewport(e, t, n = this.baseVisibleBounds ?? this.viewport.visibleBounds) {
    const i = n.width / t, r = n.height / t, a = {
      x: e.x - i / 2,
      y: e.y - r / 2,
      width: i,
      height: r
    };
    return {
      center: e,
      zoom: t,
      visibleBounds: a,
      scale: t,
      clippingBounds: a
    };
  }
};
function Te(e, t, n) {
  const i = Ye(t, n), r = hn(t, n, i);
  return {
    x: t.visibleBounds.x + (e.x - r.x) / i,
    y: t.visibleBounds.y + (e.y - r.y) / i
  };
}
function Ye(e, t) {
  const n = e.visibleBounds.width > 0 ? t.width / e.visibleBounds.width : e.scale, i = e.visibleBounds.height > 0 ? t.height / e.visibleBounds.height : e.scale;
  return Math.max(1e-4, Math.min(n, i));
}
function hn(e, t, n = Ye(e, t)) {
  return {
    x: (t.width - e.visibleBounds.width * n) / 2,
    y: (t.height - e.visibleBounds.height * n) / 2
  };
}
function pn(e, t, n) {
  return {
    x: ue(e.x, t.x - n, t.x + t.width + n),
    y: ue(e.y, t.y - n, t.y + t.height + n)
  };
}
function ue(e, t, n) {
  return Number.isFinite(e) ? Math.max(t, Math.min(n, e)) : t;
}
function gn(e) {
  return !Number.isFinite(e) || Math.abs(e) < 0.01 ? 0 : ue(e, -480, 480);
}
function fn(e, t, n) {
  return R({
    type: "NodeSelected",
    timestamp: e,
    state: t,
    target: n
  });
}
function yn(e, t, n) {
  return R({
    type: "SelectionCleared",
    timestamp: e,
    state: t,
    previous: n
  });
}
function vn(e, t, n, i) {
  return R({
    type: "HoverChanged",
    timestamp: e,
    state: t,
    previous: n,
    current: i
  });
}
function tt(e, t, n, i) {
  return R({
    type: "FocusChanged",
    timestamp: e,
    state: t,
    previous: n,
    current: i
  });
}
function te(e, t, n) {
  return R({
    type: "ViewportMoved",
    timestamp: e,
    state: t,
    viewport: n
  });
}
function bn(e, t, n) {
  return R({
    type: "ViewportZoomed",
    timestamp: e,
    state: t,
    viewport: n
  });
}
var wn = 10;
function Mn(e) {
  const t = Te(e.screenPoint, e.viewport, e.viewportSize), n = e.tolerance ?? wn, i = xn(e.payload.nodes, t, n);
  if (i) return R(i);
  const r = In(e.payload.edges, e.payload.nodes, t, n);
  if (r) return R(r);
  const a = Ln(e.payload.regions, t);
  return R(a || {
    kind: "background",
    distance: 0
  });
}
function xn(e, t, n) {
  let i = null;
  for (const r of e) {
    if (r.visibility !== "visible") continue;
    const a = Ne(t, r.position);
    a <= r.radius + n && (!i || a < i.distance) && (i = {
      kind: "node",
      id: r.entityId,
      visualId: r.visualId,
      node: r,
      distance: a
    });
  }
  return i;
}
function In(e, t, n, i) {
  let r = null;
  for (const a of e) {
    if (a.visibility !== "visible") continue;
    const s = t.find((l) => l.entityId === a.source), o = t.find((l) => l.entityId === a.target);
    if (!s || !o) continue;
    const c = Sn(n, s.position, o.position);
    c <= i && (!r || c < r.distance) && (r = {
      kind: "edge",
      id: a.edgeId,
      edge: a,
      distance: c
    });
  }
  return r;
}
function Ln(e, t) {
  const n = e.filter((i) => i.visibility !== "hidden" && Cn(i.boundaryHints.bounds, t)).sort((i, r) => i.boundaryHints.bounds.width * i.boundaryHints.bounds.height - r.boundaryHints.bounds.width * r.boundaryHints.bounds.height)[0];
  return n ? {
    kind: "region",
    id: n.regionId,
    region: n,
    distance: 0
  } : null;
}
function Sn(e, t, n) {
  const i = n.x - t.x, r = n.y - t.y, a = i * i + r * r;
  if (a === 0) return Ne(e, t);
  const s = Math.max(0, Math.min(1, ((e.x - t.x) * i + (e.y - t.y) * r) / a));
  return Ne(e, {
    x: t.x + s * i,
    y: t.y + s * r
  });
}
function Ne(e, t) {
  return Math.hypot(e.x - t.x, e.y - t.y);
}
function Cn(e, t) {
  return t.x >= e.x && t.x <= e.x + e.width && t.y >= e.y && t.y <= e.y + e.height;
}
function En(e, t, n) {
  return R({
    selected: nt(e, t),
    focused: nt(e, n),
    metadata: {
      payloadId: e.metadata.payloadId,
      projectionId: e.metadata.projectionId,
      projectionKind: e.metadata.projectionKind,
      generatedAt: e.metadata.generatedAt
    }
  });
}
function nt(e, t) {
  return !t || t.kind === "background" ? null : t.kind === "node" ? {
    kind: "node",
    id: t.id,
    label: t.node.label,
    metadata: {
      visualId: t.node.visualId,
      family: t.node.family,
      type: t.node.type,
      importance: t.node.importance,
      hierarchyLevel: t.node.hierarchyLevel,
      lodLevel: t.node.lodLevel
    },
    lineage: [`family:${t.node.family}`, `type:${t.node.type}`],
    relationships: An(e.edges, t.id)
  } : t.kind === "edge" ? {
    kind: "edge",
    id: t.id,
    label: t.edge.relationshipType,
    metadata: {
      source: t.edge.source,
      target: t.edge.target,
      relationshipType: t.edge.relationshipType,
      relationshipCategory: t.edge.relationshipCategory,
      importance: t.edge.importance,
      lodLevel: t.edge.lodLevel
    },
    lineage: [`relationship:${t.edge.relationshipCategory}`, `type:${t.edge.relationshipType}`],
    relationships: [Ge(t.edge)]
  } : {
    kind: "region",
    id: t.id,
    label: t.region.domain,
    metadata: {
      domain: t.region.domain,
      memberCount: t.region.members.length,
      importance: t.region.importance,
      dominantFamily: t.region.boundaryHints.dominantFamily,
      lodLevel: t.region.lodLevel
    },
    lineage: [`domain:${t.region.domain}`, `family:${t.region.boundaryHints.dominantFamily}`],
    relationships: kn(e.edges, t.region.members)
  };
}
function An(e, t) {
  return e.filter((n) => n.source === t || n.target === t).map(Ge);
}
function kn(e, t) {
  const n = new Set(t);
  return e.filter((i) => n.has(i.source) || n.has(i.target)).slice(0, 50).map(Ge);
}
function Ge(e) {
  return {
    edgeId: e.edgeId,
    source: e.source,
    target: e.target,
    relationshipType: e.relationshipType,
    relationshipCategory: e.relationshipCategory,
    importance: e.importance
  };
}
var Dn = class {
  selections = 0;
  hoverEvents = 0;
  viewportMoves = 0;
  zoomCount = 0;
  selectionStartedAt = null;
  selectionDurationMs = 0;
  interactionLatencyMs = 0;
  hitTestLatencyMs = 0;
  dragLatencyMs = 0;
  wheelLatencyMs = 0;
  selectionLatencyMs = 0;
  recordSelection(e) {
    this.closeSelection(e), this.selections += 1, this.selectionStartedAt = e;
  }
  clearSelection(e) {
    this.closeSelection(e), this.selectionStartedAt = null;
  }
  recordHover() {
    this.hoverEvents += 1;
  }
  recordViewportMove() {
    this.viewportMoves += 1;
  }
  recordZoom() {
    this.zoomCount += 1;
  }
  recordInteractionLatency(e) {
    this.interactionLatencyMs = ie(this.interactionLatencyMs, e);
  }
  recordHitTestLatency(e) {
    this.hitTestLatencyMs = ie(this.hitTestLatencyMs, e);
  }
  recordDragLatency(e) {
    this.dragLatencyMs = ie(this.dragLatencyMs, e);
  }
  recordWheelLatency(e) {
    this.wheelLatencyMs = ie(this.wheelLatencyMs, e);
  }
  recordSelectionLatency(e) {
    this.selectionLatencyMs = ie(this.selectionLatencyMs, e);
  }
  snapshot(e) {
    const t = this.selectionStartedAt === null ? 0 : Math.max(0, e - this.selectionStartedAt);
    return R({
      selections: this.selections,
      hoverEvents: this.hoverEvents,
      viewportMoves: this.viewportMoves,
      zoomCount: this.zoomCount,
      selectionDurationMs: this.selectionDurationMs + t,
      interactionLatencyMs: this.interactionLatencyMs,
      hitTestLatencyMs: this.hitTestLatencyMs,
      dragLatencyMs: this.dragLatencyMs,
      wheelLatencyMs: this.wheelLatencyMs,
      selectionLatencyMs: this.selectionLatencyMs
    });
  }
  closeSelection(e) {
    this.selectionStartedAt !== null && (this.selectionDurationMs += Math.max(0, e - this.selectionStartedAt));
  }
};
function ie(e, t) {
  return Math.max(e, Math.max(0, t));
}
var Tn = {
  Idle: [
    "Hover",
    "Selected",
    "Focused",
    "Dragging Viewport",
    "Zooming"
  ],
  Hover: [
    "Idle",
    "Selected",
    "Focused",
    "Dragging Viewport",
    "Zooming"
  ],
  Selected: [
    "Idle",
    "Hover",
    "Focused",
    "Dragging Viewport",
    "Zooming"
  ],
  Focused: [
    "Idle",
    "Hover",
    "Selected",
    "Dragging Viewport",
    "Zooming"
  ],
  "Dragging Viewport": [
    "Idle",
    "Hover",
    "Selected",
    "Focused"
  ],
  Zooming: [
    "Idle",
    "Hover",
    "Selected",
    "Focused"
  ]
}, Nn = class {
  current = "Idle";
  get state() {
    return this.current;
  }
  transition(e) {
    if (e === this.current) return this.current;
    if (!Tn[this.current].includes(e)) throw new Error(`Forbidden Atlas interaction state transition: ${this.current} -> ${e}`);
    return this.current = e, this.current;
  }
}, Rn = 6, Pn = class {
  payload;
  clock;
  viewportSize;
  camera;
  stateMachine = new Nn();
  metrics = new Dn();
  events = [];
  selected = null;
  selectedAt = null;
  hovered = null;
  hoverUpdatedAt = null;
  focused = null;
  focusedAt = null;
  dragStart = null;
  dragConfirmed = !1;
  accumulatedDragDistance = 0;
  suppressNextClick = !1;
  dragThreshold;
  constructor(e) {
    this.payload = e.payload, this.clock = e.options.clock ?? (() => performance.now()), this.viewportSize = e.options.viewportSize, this.dragThreshold = Math.max(5, e.options.dragThreshold ?? Rn), this.camera = new mn(e.payload.viewport, e.payload.scene.bounds, e.options.camera);
  }
  snapshot() {
    const e = this.clock();
    return R({
      state: this.stateMachine.state,
      viewport: this.camera.getViewport(),
      selection: {
        selected: this.selected,
        selectedAt: this.selectedAt
      },
      hover: {
        hovered: this.hovered,
        lastUpdatedAt: this.hoverUpdatedAt
      },
      focus: {
        focused: this.focused,
        focusedAt: this.focusedAt
      },
      inspector: En(this.payload, this.selected, this.focused),
      metrics: this.metrics.snapshot(e)
    });
  }
  drainEvents() {
    return R(this.events.splice(0, this.events.length));
  }
  setViewportSize(e) {
    this.viewportSize = R({
      width: Math.max(1, e.width),
      height: Math.max(1, e.height)
    });
  }
  pointerMove(e) {
    const t = this.clock();
    if (this.dragStart) {
      const i = e.point.x - this.dragStart.point.x, r = e.point.y - this.dragStart.point.y;
      if (this.accumulatedDragDistance = Math.sqrt(i * i + r * r), !this.dragConfirmed && this.accumulatedDragDistance >= this.dragThreshold && (this.dragConfirmed = !0), this.dragConfirmed) {
        const a = this.camera.pan({
          x: e.point.x - this.dragStart.point.x,
          y: e.point.y - this.dragStart.point.y
        }, this.viewportSize);
        this.dragStart = { point: e.point }, this.stateMachine.transition("Dragging Viewport"), this.metrics.recordViewportMove(), this.push(te(this.clock(), this.stateMachine.state, a)), this.metrics.recordDragLatency(this.clock() - t);
      }
      return this.metrics.recordInteractionLatency(this.clock() - t), null;
    }
    const n = this.measureHit(e);
    if (!zn(this.hovered, n)) {
      const i = this.hovered;
      this.hovered = n.kind === "background" ? null : n, this.hoverUpdatedAt = this.clock(), this.stateMachine.transition(this.hovered ? "Hover" : "Idle"), this.metrics.recordHover(), this.push(vn(this.hoverUpdatedAt, this.stateMachine.state, i, this.hovered));
    }
    return this.metrics.recordInteractionLatency(this.clock() - t), this.hovered;
  }
  pointerDown(e) {
    this.dragStart = { point: e.point }, this.dragConfirmed = !1, this.accumulatedDragDistance = 0, this.stateMachine.transition("Dragging Viewport");
  }
  pointerUp() {
    this.suppressNextClick = this.dragConfirmed || this.accumulatedDragDistance >= this.dragThreshold, this.dragStart = null, this.dragConfirmed = !1, this.stateMachine.transition(this.selected ? "Selected" : this.focused ? "Focused" : this.hovered ? "Hover" : "Idle");
  }
  click(e) {
    const t = this.clock();
    if (this.suppressNextClick || this.accumulatedDragDistance >= this.dragThreshold)
      return this.suppressNextClick = !1, this.accumulatedDragDistance = 0, this.metrics.recordInteractionLatency(this.clock() - t), null;
    this.accumulatedDragDistance = 0;
    const n = this.measureHit(e), i = this.clock();
    return n.kind !== "node" ? (this.clearSelection(), this.metrics.recordInteractionLatency(this.clock() - t), null) : (this.selected = n, this.selectedAt = i, this.stateMachine.transition("Selected"), this.metrics.recordSelection(i), this.push(fn(i, this.stateMachine.state, n)), this.metrics.recordSelectionLatency(this.clock() - t), this.metrics.recordInteractionLatency(this.clock() - t), n);
  }
  focus(e = this.selected) {
    const t = this.focused;
    this.focused = e && e.kind !== "background" ? e : null, this.focusedAt = this.focused ? this.clock() : null, this.stateMachine.transition(this.focused ? "Focused" : "Idle");
    const n = this.focused?.kind === "node" ? this.camera.focusOn(this.focused.node.position) : this.focused?.kind === "region" ? this.camera.focusOn(this.focused.region.boundaryHints.centroid) : null;
    return this.push(tt(this.clock(), this.stateMachine.state, t, this.focused)), n && this.push(te(this.clock(), this.stateMachine.state, n)), this.focused;
  }
  focusAnimated(e, t = this.selected) {
    const n = this.focused;
    return this.focused = t && t.kind !== "background" ? t : null, this.focusedAt = this.focused ? this.clock() : null, this.stateMachine.transition(this.focused ? "Focused" : "Idle"), this.push(tt(this.clock(), this.stateMachine.state, n, this.focused)), this.focused?.kind === "node" ? this.camera.focusOnAnimated(this.focused.node.position, () => {
      this.push(te(this.clock(), this.stateMachine.state, this.camera.getViewport())), e();
    }) : this.focused?.kind === "region" && this.camera.focusOnAnimated(this.focused.region.boundaryHints.centroid, () => {
      this.push(te(this.clock(), this.stateMachine.state, this.camera.getViewport())), e();
    }), this.focused;
  }
  focusAt(e, t) {
    const n = this.measureHit(e);
    return this.focusAnimated(t, n.kind === "background" ? null : n);
  }
  wheel(e) {
    const t = this.clock(), n = this.camera.zoom(e.deltaY ?? 0, e.point, this.viewportSize);
    this.stateMachine.transition("Zooming"), this.metrics.recordZoom(), this.push(bn(this.clock(), this.stateMachine.state, n)), this.stateMachine.transition(this.hovered ? "Hover" : this.selected ? "Selected" : this.focused ? "Focused" : "Idle"), this.metrics.recordWheelLatency(this.clock() - t), this.metrics.recordInteractionLatency(this.clock() - t);
  }
  resetViewport() {
    const e = this.camera.reset();
    this.push(te(this.clock(), this.stateMachine.state, e));
  }
  resetViewportAnimated(e) {
    this.camera.resetAnimated(() => {
      const t = this.camera.getViewport();
      this.push(te(this.clock(), this.stateMachine.state, t)), e();
    });
  }
  clearSelection() {
    const e = this.selected;
    this.selected = null, this.selectedAt = null, this.stateMachine.transition(this.focused ? "Focused" : this.hovered ? "Hover" : "Idle"), this.metrics.clearSelection(this.clock()), this.push(yn(this.clock(), this.stateMachine.state, e));
  }
  measureHit(e) {
    const t = this.clock(), n = Mn({
      payload: this.payload,
      viewport: this.camera.getViewport(),
      viewportSize: this.viewportSize,
      screenPoint: e.point
    });
    return this.metrics.recordHitTestLatency(this.clock() - t), n;
  }
  push(e) {
    this.events.push(e);
  }
};
function On(e) {
  return new Pn(e);
}
function zn(e, t) {
  return e === t ? !0 : !e || !t ? !1 : e.kind === "background" || t.kind === "background" ? e.kind === t.kind : e.kind === t.kind && e.id === t.id;
}
var It = /* @__PURE__ */ new Set([
  "requires",
  "depends_on",
  "builds_on",
  "precedes",
  "teaches",
  "enables",
  "composes",
  "extends"
]), $n = /* @__PURE__ */ new Set([
  "cuda",
  "pytorch",
  "onnx",
  "tensorrt",
  "deployment",
  "mlops",
  "runtime",
  "inference",
  "serving"
]), Bn = /* @__PURE__ */ new Set([
  "cuda",
  "onnx",
  "embeddings",
  "embedding",
  "vector",
  "database",
  "feature",
  "engineering",
  "retrieval",
  "interface"
]), jn = Object.freeze({
  minimumNodeDistance: 34,
  labelPadding: 7,
  clusterSpacing: 660,
  clusterInflation: 1.08,
  hubSpacing: 110,
  bridgeSpacing: 138,
  corridorSpacing: 128,
  hierarchyLayerSpacing: 120,
  boundaryPadding: 220,
  densityCellSize: 46,
  maxDensityCorrectionPasses: 5,
  maxExactEdgeCrossingEdges: 700
});
function Vn(e, t, n, i = {}) {
  const r = Object.freeze({
    ...jn,
    ...i
  }), a = t.nodeIds.filter((x) => e.nodes.has(x)).slice().sort(), s = t.edgeIds.filter((x) => e.edges.has(x)).slice().sort(), o = a.map((x) => e.nodes.get(x)), c = s.map((x) => e.edges.get(x)), l = Fn(o, n, t.kind), d = qn(a, c), u = _n(c, l), h = Hn(o, e), g = Un(o, e, u), v = o.map((x) => Yn(x, e, l, d, u, h, g)), f = Gn(v, n), M = ei(Qn(v, Wn(f, r), n, r), v, r), k = ti(f, M, v, r);
  return {
    positions: M,
    clusters: k,
    metrics: ni(M, v, c, k, r),
    constraints: r
  };
}
function Fn(e, t, n) {
  const i = /* @__PURE__ */ new Map();
  for (const r of e) {
    const a = r.metadata, s = a.tags?.map((l) => l.toLowerCase()) ?? [], o = s.find((l) => $n.has(l)), c = t === "research" || n === "research" ? a.architecture ?? a.algorithm ?? ci(s) ?? a.domain ?? r.family : t === "dependency" || t === "hierarchical" || n === "curriculum" || n === "pedagogical" ? a.module ?? a.path ?? a.domain ?? r.family : n === "implementation" ? o ?? a.application ?? a.artifact ?? a.algorithm ?? a.domain ?? r.family : n === "application" ? a.application ?? a.domain ?? r.family : a.domain ?? a.path ?? a.module ?? r.family;
    i.set(r.id, St(String(c)));
  }
  return i;
}
function qn(e, t) {
  const n = new Set(e), i = /* @__PURE__ */ new Map(), r = /* @__PURE__ */ new Map();
  for (const c of e)
    i.set(c, 0), r.set(c, []);
  for (const c of t)
    !n.has(c.source) || !n.has(c.target) || !It.has(c.type) || (r.get(c.source)?.push(c.target), i.set(c.target, (i.get(c.target) ?? 0) + 1));
  for (const c of r.values()) c.sort();
  const a = e.filter((c) => (i.get(c) ?? 0) === 0).sort();
  let s = 0;
  const o = new Map(e.map((c) => [c, 0]));
  for (; s < a.length; ) {
    const c = a[s++];
    for (const l of r.get(c) ?? [])
      o.set(l, Math.max(o.get(l) ?? 0, (o.get(c) ?? 0) + 1)), i.set(l, (i.get(l) ?? 1) - 1), (i.get(l) ?? 0) === 0 && a.push(l);
  }
  for (const c of e) (i.get(c) ?? 0) > 0 && o.set(c, Math.max(o.get(c) ?? 0, 1));
  return o;
}
function _n(e, t) {
  const n = /* @__PURE__ */ new Map();
  for (const i of e) {
    const r = t.get(i.source), a = t.get(i.target);
    !r || !a || r === a || (n.has(i.source) || n.set(i.source, /* @__PURE__ */ new Set()), n.has(i.target) || n.set(i.target, /* @__PURE__ */ new Set()), n.get(i.source).add(a), n.get(i.target).add(r));
  }
  return new Map([...n.entries()].map(([i, r]) => [i, [...r].sort()]));
}
function Hn(e, t) {
  const n = Math.max(4, Math.ceil(Math.sqrt(e.length) * 0.75)), i = e.map((r) => {
    const a = t.metrics.centrality[r.id], s = a?.degree ?? 0, o = typeof r.metadata.importance == "number" ? r.metadata.importance : 0;
    return {
      id: r.id,
      score: s * 4 + o * 3 + (a?.pageRank ?? 0)
    };
  }).sort((r, a) => a.score - r.score || r.id.localeCompare(a.id));
  return new Set(i.slice(0, n).map((r) => r.id));
}
function Un(e, t, n) {
  const i = Math.max(4, Math.ceil(Math.sqrt(e.length) * 0.8)), r = e.map((a) => {
    const s = t.metrics.centrality[a.id], o = s?.degree ?? 0, c = n.get(a.id)?.length ?? 0, l = `${a.name} ${(a.metadata.tags ?? []).join(" ")} ${a.metadata.domain ?? ""}`.toLowerCase(), d = [...Bn].some((u) => l.includes(u)) ? 3 : 0;
    return {
      id: a.id,
      score: c * 8 + o * 1.5 + d + (s?.pageRank ?? 0)
    };
  }).filter((a) => a.score > 0).sort((a, s) => s.score - a.score || a.id.localeCompare(s.id));
  return new Set(r.slice(0, i).map((a) => a.id));
}
function Yn(e, t, n, i, r, a, s) {
  const o = t.metrics.centrality[e.id]?.degree ?? 0, c = typeof e.metadata.importance == "number" ? e.metadata.importance : void 0, l = o / Math.max(1, Math.sqrt(t.metadata.nodeCount)), d = Ke(c ?? l), u = r.get(e.id) ?? [];
  return {
    node: e,
    degree: o,
    importance: d,
    clusterKey: n.get(e.id) ?? St(e.family),
    dependencyDepth: i.get(e.id) ?? 0,
    hierarchyLayer: si(e),
    adjacentClusters: u,
    isHub: a.has(e.id),
    isBridge: s.has(e.id)
  };
}
function Gn(e, t) {
  const n = /* @__PURE__ */ new Map();
  for (const r of e) {
    const a = n.get(r.clusterKey);
    a ? a.push(r) : n.set(r.clusterKey, [r]);
  }
  const i = t === "research" ? "research" : t === "dependency" || t === "hierarchical" ? "curriculum" : t === "domain" ? "domain" : "implementation";
  return [...n.entries()].sort(([r], [a]) => r.localeCompare(a)).map(([r, a]) => ({
    id: r,
    kind: i,
    label: r,
    members: a.map((s) => s.node.id).sort(),
    importance: Ke(a.reduce((s, o) => s + o.importance, 0) / Math.max(1, a.length))
  }));
}
function Wn(e, t) {
  const n = Math.max(1, e.length), i = Math.max(t.clusterSpacing, t.clusterSpacing * Math.sqrt(n) * 0.58), r = /* @__PURE__ */ new Map();
  return e.forEach((a, s) => {
    const o = Kn(a.id, t.clusterSpacing);
    if (o) {
      r.set(a.id, o);
      return;
    }
    const c = -Math.PI / 2 + s / n * Math.PI * 2, l = 1 + a.importance * 0.18;
    r.set(a.id, {
      x: Math.cos(c) * i * l,
      y: Math.sin(c) * i * 0.72 * l
    });
  }), r;
}
function Kn(e, t) {
  const n = t / 660, i = {
    mathematics: {
      x: -680,
      y: 180
    },
    calculus: {
      x: -560,
      y: -40
    },
    statistics: {
      x: -420,
      y: -220
    },
    programming: {
      x: -360,
      y: 280
    },
    research: {
      x: -240,
      y: -340
    },
    "machine-learning": {
      x: -80,
      y: 60
    },
    "deep-learning": {
      x: 120,
      y: -10
    },
    "computer-vision": {
      x: 380,
      y: -240
    },
    nlp: {
      x: 340,
      y: 200
    },
    llms: {
      x: 560,
      y: 60
    },
    "llm-engineering": {
      x: 720,
      y: 260
    },
    agents: {
      x: 800,
      y: -160
    },
    mlops: {
      x: 540,
      y: 400
    }
  }[e];
  return i ? {
    x: T(i.x * n),
    y: T(i.y * n)
  } : null;
}
var Jn = {
  mathematics: {
    xScale: 1,
    yScale: 0.75,
    hubBias: 0.6,
    perimeterWeight: 0.3
  },
  calculus: {
    xScale: 0.85,
    yScale: 1.1,
    hubBias: 0.5,
    perimeterWeight: 0.25
  },
  statistics: {
    xScale: 1.15,
    yScale: 0.8,
    hubBias: 0.55,
    perimeterWeight: 0.35
  },
  programming: {
    xScale: 1.3,
    yScale: 0.7,
    hubBias: 0.45,
    perimeterWeight: 0.2
  },
  research: {
    xScale: 0.9,
    yScale: 1.2,
    hubBias: 0.65,
    perimeterWeight: 0.4
  },
  "machine-learning": {
    xScale: 1.1,
    yScale: 1,
    hubBias: 0.5,
    perimeterWeight: 0.3
  },
  "deep-learning": {
    xScale: 1,
    yScale: 1.15,
    hubBias: 0.55,
    perimeterWeight: 0.35
  },
  "computer-vision": {
    xScale: 0.75,
    yScale: 1.3,
    hubBias: 0.6,
    perimeterWeight: 0.3
  },
  nlp: {
    xScale: 1.2,
    yScale: 0.85,
    hubBias: 0.5,
    perimeterWeight: 0.25
  },
  llms: {
    xScale: 1.05,
    yScale: 1.05,
    hubBias: 0.55,
    perimeterWeight: 0.3
  },
  "llm-engineering": {
    xScale: 1.15,
    yScale: 0.9,
    hubBias: 0.5,
    perimeterWeight: 0.25
  },
  agents: {
    xScale: 0.95,
    yScale: 1.15,
    hubBias: 0.6,
    perimeterWeight: 0.35
  },
  mlops: {
    xScale: 1.25,
    yScale: 0.8,
    hubBias: 0.45,
    perimeterWeight: 0.2
  }
}, Xn = {
  xScale: 1,
  yScale: 1,
  hubBias: 0.5,
  perimeterWeight: 0.3
};
function Zn(e) {
  return Jn[e] ?? Xn;
}
function Qn(e, t, n, i) {
  const r = /* @__PURE__ */ new Map();
  for (const s of e) {
    const o = r.get(s.clusterKey);
    o ? o.push(s) : r.set(s.clusterKey, [s]);
  }
  const a = /* @__PURE__ */ new Map();
  for (const [s, o] of [...r.entries()].sort(([c], [l]) => c.localeCompare(l))) {
    const c = t.get(s) ?? {
      x: 0,
      y: 0
    }, l = Zn(s), d = [...o].sort((f, M) => M.isHub === f.isHub ? f.node.id.localeCompare(M.node.id) : Number(M.isHub) - Number(f.isHub)), u = new Map(d.filter((f) => f.isHub).map((f, M) => [f.node.id, M])), h = new Map(d.filter((f) => f.isBridge && !f.isHub).map((f, M) => [f.node.id, M])), g = d.reduce((f, M) => f + M.dependencyDepth, 0) / Math.max(1, d.length), v = d.length;
    d.forEach((f, M) => {
      const k = M / Math.max(1, v), x = Math.ceil(Math.sqrt(M + 1)), b = ((M + 1) * 2.399963229728653 + ye(s) * 0.13) % (Math.PI * 2), C = (i.minimumNodeDistance + i.labelPadding + se(f.node)) * x * i.clusterInflation * (1 - k * 0.25);
      let S = c.x + Math.cos(b) * C * l.xScale, N = c.y + Math.sin(b) * C * l.yScale;
      if ((n === "dependency" || n === "hierarchical") && (S = c.x + (f.dependencyDepth - g) * i.corridorSpacing, N = c.y + (f.hierarchyLayer - 0.5) * i.hierarchyLayerSpacing + (M - d.length / 2) * i.minimumNodeDistance * 0.48), f.isHub) {
        const j = 1 + l.hubBias * 0.4, _ = u.get(f.node.id) ?? 0, H = Math.ceil(Math.sqrt(_ + 1)), F = ((_ + 1) * 2.399963229728653 + ye(`hub:${s}`) * 0.17) % (Math.PI * 2), A = (i.hubSpacing * j + se(f.node) * 0.8) * H;
        S = c.x + Math.cos(F) * A * l.xScale, N = c.y + Math.sin(F) * A * l.yScale;
      }
      if (f.isBridge && f.adjacentClusters.length > 0) {
        const j = Ct([c, ...f.adjacentClusters.map((w) => t.get(w)).filter((w) => !!w)]), _ = h.get(f.node.id) ?? 0, H = Math.ceil(Math.sqrt(_ + 1)), F = ((_ + 1) * 2.399963229728653 + ye(`bridge:${s}`) * 0.11) % (Math.PI * 2), A = (i.bridgeSpacing + se(f.node) * 0.55) * H;
        S = (c.x + j.x) / 2 + Math.cos(F) * A * l.xScale, N = (c.y + j.y) / 2 + Math.sin(F) * A * l.yScale;
      }
      a.set(f.node.id, {
        x: T(S),
        y: T(N)
      });
    });
  }
  return a;
}
function ei(e, t, n) {
  let i = new Map(e);
  const r = new Set(t.filter((a) => a.isHub).map((a) => a.node.id));
  for (let a = 0; a < n.maxDensityCorrectionPasses; a += 1) {
    const s = /* @__PURE__ */ new Map(), o = /* @__PURE__ */ new Map();
    for (const c of [...t].sort((l, d) => d.importance - l.importance || l.node.id.localeCompare(d.node.id))) {
      const l = i.get(c.node.id), d = r.has(c.node.id) ? n.minimumNodeDistance * 0.6 : 0, u = n.minimumNodeDistance + se(c.node) * 0.18 + d;
      let h = l;
      for (const f of Lt(l, s, n.densityCellSize)) {
        const M = o.get(f);
        if (!M) continue;
        const k = me(h, M);
        if (k >= u) continue;
        const x = ye(`${c.node.id}:${f}:${a}`), b = (u - k + n.minimumNodeDistance * 0.35) / 2;
        h = {
          x: T(h.x + Math.cos(x) * b),
          y: T(h.y + Math.sin(x) * b)
        };
      }
      o.set(c.node.id, h);
      const g = We(h, n.densityCellSize), v = s.get(g);
      v ? v.push(c.node.id) : s.set(g, [c.node.id]);
    }
    i = o;
  }
  return i;
}
function ti(e, t, n, i) {
  const r = new Map(n.map((a) => [a.node.id, a]));
  return e.map((a) => {
    const s = a.members.map((l) => t.get(l)).filter((l) => !!l), o = Ct(s), c = Math.max(i.clusterSpacing * 0.28, Math.max(...s.map((l) => me(l, o)), 0) + i.boundaryPadding * 0.25);
    return {
      ...a,
      centroid: o,
      radius: T(c),
      density: T(a.members.length / Math.max(1, Math.PI * c * c), 8),
      hubCount: a.members.filter((l) => r.get(l)?.isHub).length
    };
  });
}
function ni(e, t, n, i, r) {
  const a = oi(e, r.boundaryPadding), s = ii(e, i), o = 1 / (1 + it(e, t, r) / Math.max(1, t.length)), c = 1 / (1 + Re(e, n, r) / Math.max(1, n.length * 20)), l = ri(e, t, r), d = ai(e, n), u = T((o * 0.22 + c * 0.14 + l * 0.16 + s.silhouetteScore * 0.2 + d * 0.16 + Math.min(1, s.clusterSeparation) * 0.12) * 100, 2);
  return {
    collisionPairs: it(e, t, r),
    edgeCrossingsEstimate: Re(e, n, r),
    clusterCohesion: s.clusterCohesion,
    clusterSeparation: s.clusterSeparation,
    silhouetteScore: s.silhouetteScore,
    densityScore: l,
    layoutQualityScore: u,
    bridgeCount: t.filter((h) => h.isBridge).length,
    hubCount: t.filter((h) => h.isHub).length,
    dependencyCorridorScore: d,
    bounds: a
  };
}
function ii(e, t) {
  const n = Me(t.map((s) => s.members.reduce((o, c) => o + me(e.get(c) ?? s.centroid, s.centroid), 0) / Math.max(1, s.members.length) / Math.max(1, s.radius))), i = [];
  for (let s = 0; s < t.length; s += 1) for (let o = s + 1; o < t.length; o += 1) i.push(me(t[s].centroid, t[o].centroid) / Math.max(1, t[s].radius + t[o].radius));
  const r = Me(i), a = Ke(r / (r + n + 1e-3));
  return {
    clusterCohesion: T(n, 4),
    clusterSeparation: T(r, 4),
    silhouetteScore: T(a, 4)
  };
}
function ri(e, t, n) {
  const i = /* @__PURE__ */ new Map();
  for (const o of t) {
    const c = e.get(o.node.id);
    if (!c) continue;
    const l = We(c, n.densityCellSize * 2);
    i.set(l, (i.get(l) ?? 0) + 1);
  }
  const r = [...i.values()];
  if (!r.length) return 1;
  const a = Me(r), s = Me(r.map((o) => (o - a) ** 2));
  return T(1 / (1 + Math.sqrt(s) / Math.max(1, a)), 4);
}
function it(e, t, n) {
  const i = /* @__PURE__ */ new Map(), r = new Map(t.map((s) => [s.node.id, n.minimumNodeDistance + se(s.node) * 0.15]));
  let a = 0;
  for (const s of t) {
    const o = e.get(s.node.id);
    if (!o) continue;
    for (const d of Lt(o, i, n.densityCellSize)) {
      const u = e.get(d);
      u && me(o, u) < Math.max(r.get(d) ?? 0, r.get(s.node.id) ?? 0) && (a += 1);
    }
    const c = We(o, n.densityCellSize), l = i.get(c);
    l ? l.push(s.node.id) : i.set(c, [s.node.id]);
  }
  return a;
}
function Re(e, t, n) {
  const i = t.filter((a) => e.has(a.source) && e.has(a.target)).slice(0, n.maxExactEdgeCrossingEdges);
  if (t.length > n.maxExactEdgeCrossingEdges) {
    const a = Re(e, i, {
      ...n,
      maxExactEdgeCrossingEdges: i.length
    });
    return Math.round(a * (t.length / Math.max(1, i.length)) * 0.55);
  }
  let r = 0;
  for (let a = 0; a < i.length; a += 1) {
    const s = i[a], o = e.get(s.source), c = e.get(s.target);
    for (let l = a + 1; l < i.length; l += 1) {
      const d = i[l];
      s.source === d.source || s.source === d.target || s.target === d.source || s.target === d.target || li(o, c, e.get(d.source), e.get(d.target)) && (r += 1);
    }
  }
  return r;
}
function ai(e, t) {
  const n = t.filter((r) => It.has(r.type) && e.has(r.source) && e.has(r.target));
  if (!n.length) return 1;
  const i = n.filter((r) => e.get(r.target).x - e.get(r.source).x >= -20).length;
  return T(i / n.length, 4);
}
function oi(e, t) {
  const n = [...e.values()];
  if (!n.length) return {
    x: 0,
    y: 0,
    width: 0,
    height: 0
  };
  const i = Math.min(...n.map((o) => o.x)) - t, r = Math.min(...n.map((o) => o.y)) - t, a = Math.max(...n.map((o) => o.x)) + t, s = Math.max(...n.map((o) => o.y)) + t;
  return {
    x: T(i),
    y: T(r),
    width: T(a - i),
    height: T(s - r)
  };
}
function Lt(e, t, n) {
  const i = Math.floor(e.x / n), r = Math.floor(e.y / n), a = [];
  for (let s = -1; s <= 1; s += 1) for (let o = -1; o <= 1; o += 1) a.push(...t.get(`${i + s}:${r + o}`) ?? []);
  return a;
}
function We(e, t) {
  return `${Math.floor(e.x / t)}:${Math.floor(e.y / t)}`;
}
function si(e) {
  return e.type === "theory" || e.type === "principle" ? 0 : e.type === "concept" || e.type === "method" || e.type === "algorithm" ? 1 : e.type === "architecture" || e.type === "framework" || e.type === "library" || e.type === "tool" ? 2 : e.family === "evidence" || e.type === "benchmark" || e.type === "experiment" ? 3 : 1;
}
function ci(e) {
  return e.find((t) => t.includes("transformer") || t.includes("attention") || t.includes("embedding") || t.includes("vision") || t.includes("robot"));
}
function St(e) {
  return e.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "unclassified";
}
function ye(e) {
  let t = 2166136261;
  for (let n = 0; n < e.length; n += 1)
    t ^= e.charCodeAt(n), t = Math.imul(t, 16777619);
  return (t >>> 0) / 4294967295 * Math.PI * 2;
}
function se(e) {
  return Math.min(120, Math.max(24, e.name.length * 5.8));
}
function Me(e) {
  return e.length ? e.reduce((t, n) => t + n, 0) / e.length : 0;
}
function Ct(e) {
  return e.length ? {
    x: T(e.reduce((t, n) => t + n.x, 0) / e.length),
    y: T(e.reduce((t, n) => t + n.y, 0) / e.length)
  } : {
    x: 0,
    y: 0
  };
}
function me(e, t) {
  return Math.hypot(e.x - t.x, e.y - t.y);
}
function li(e, t, n, i) {
  const r = he(e, t, n), a = he(e, t, i), s = he(n, i, e), o = he(n, i, t);
  return r !== a && s !== o;
}
function he(e, t, n) {
  const i = (t.y - e.y) * (n.x - t.x) - (t.x - e.x) * (n.y - t.y);
  return Math.abs(i) < 1e-6 ? 0 : i > 0 ? 1 : 2;
}
function T(e, t = 3) {
  const n = 10 ** t;
  return Math.round(e * n) / n;
}
function Ke(e) {
  return Math.max(0, Math.min(1, Number.isFinite(e) ? e : 0));
}
var di = [
  "LOD0",
  "LOD1",
  "LOD2",
  "LOD3",
  "LOD4",
  "LOD5"
], ui = [
  "regions",
  "edges",
  "nodes",
  "labels",
  "decorations"
];
function rt(e) {
  Ii(e.snapshot, e.projection);
  const t = e.layout ?? Li(e.projection.kind), n = mi(e.projection.nodeIds.length), i = Vn(e.snapshot, e.projection, t), r = i.positions, a = $i(i), s = e.projection.nodeIds.map((x) => pi(e.snapshot.nodes.get(x), e.snapshot, r.get(x), n, a)), o = new Set(s.map((x) => x.entityId)), c = at(e.snapshot, s, [], a, n), l = new Map(c.map((x) => [x.domain, x.regionId])), d = e.projection.edgeIds.map((x) => e.snapshot.edges.get(x)).filter((x) => o.has(x.source) && o.has(x.target)).map((x, b) => gi(x, e.snapshot, n, b, l)), u = fi(s, d, at(e.snapshot, s, d, a, n), n), h = bi(u.nodes, u.edges, u.regions, n), g = At(u.nodes, u.regions), v = Mi(e.viewport, g), f = wi(ot("scene", e.projection.id, t), u.nodes, u.edges, u.regions, h, g), M = xi(f, n, e.projection, i.metrics), k = {
    metadata: {
      payloadId: ot("payload", e.snapshot.id, e.projection.id, t, Ai(g)),
      snapshotId: e.snapshot.id,
      projectionId: e.projection.id,
      projectionKind: e.projection.kind,
      generatedAt: e.generatedAt ?? e.projection.metadata.generatedAt,
      layoutKind: t,
      rendererIndependent: !0,
      worldSpaceOnly: !0
    },
    viewport: v,
    lod: n,
    scene: f,
    nodes: u.nodes,
    edges: u.edges,
    regions: u.regions,
    labels: h,
    metrics: M
  };
  return Et(k), O(k);
}
function mi(e) {
  const t = e < 50 ? "LOD0" : e <= 200 ? "LOD1" : e <= 1e3 ? "LOD2" : e <= 5e3 ? "LOD3" : e <= 5e4 ? "LOD4" : "LOD5";
  return O({
    level: t,
    ...{
      LOD0: {
        nodeThreshold: 50,
        labelImportanceThreshold: 0,
        edgeImportanceThreshold: 0,
        aggregation: "none"
      },
      LOD1: {
        nodeThreshold: 200,
        labelImportanceThreshold: 0.5,
        edgeImportanceThreshold: 0.35,
        aggregation: "small_clusters"
      },
      LOD2: {
        nodeThreshold: 1e3,
        labelImportanceThreshold: 0.7,
        edgeImportanceThreshold: 0.5,
        aggregation: "medium_clusters"
      },
      LOD3: {
        nodeThreshold: 5e3,
        labelImportanceThreshold: 0.9,
        edgeImportanceThreshold: 0.75,
        aggregation: "large_clusters"
      },
      LOD4: {
        nodeThreshold: 5e4,
        labelImportanceThreshold: 1,
        edgeImportanceThreshold: 0.9,
        aggregation: "region_view"
      },
      LOD5: {
        nodeThreshold: 5e5,
        labelImportanceThreshold: 1,
        edgeImportanceThreshold: 0.98,
        aggregation: "domain_view"
      }
    }[t],
    distribution: Ci(t, e)
  });
}
function Et(e) {
  if (!e.metadata.rendererIndependent || !e.metadata.worldSpaceOnly) throw new Error("Visualization payload must be renderer independent and world-space only.");
  const t = new Set(e.nodes.map((n) => n.entityId));
  for (const n of e.edges) if (!t.has(n.source) || !t.has(n.target)) throw new Error(`Visual edge references missing visual node: ${n.edgeId}`);
  if (e.scene.nodes.length !== e.nodes.length || e.scene.edges.length !== e.edges.length) throw new Error("Scene graph content does not match payload content.");
}
var hi = class {
};
function pi(e, t, n, i, r) {
  const a = t.metrics.centrality[e.id], s = a ? Math.min(1, a.degree / Math.max(1, Math.sqrt(t.metadata.nodeCount))) : 0, o = Math.min(1, (e.metadata.evidenceCount ?? 0) / 10), c = Ie((typeof e.metadata.importance == "number" ? e.metadata.importance : void 0) ?? s * 0.7 + o * 0.3), l = 6 + c * 12, d = r.get(e.id) ?? {
    isHub: !1,
    isBridge: !1
  };
  return {
    visualId: `visual-node:${e.id}`,
    entityId: e.id,
    label: e.name,
    importance: c,
    hierarchyLevel: Si(e, t),
    radius: l,
    family: e.family,
    type: e.type,
    colorToken: `atlas.family.${e.family}`,
    labelPriority: Math.round(c * 1e3),
    state: "default",
    position: n,
    boundingBox: {
      x: n.x - l,
      y: n.y - l,
      width: l * 2,
      height: l * 2
    },
    visibility: "visible",
    lodLevel: i.level,
    isHub: d.isHub,
    isBridge: d.isBridge,
    domain: e.metadata.domain ?? "Unclassified"
  };
}
function gi(e, t, n, i, r) {
  const a = Ie(e.metadata.weight * 0.55 + e.metadata.confidence * 0.35 + Math.min(1, e.metadata.evidenceCount / 10) * 0.1), s = t.nodes.get(e.source), o = t.nodes.get(e.target), c = s?.metadata.domain ?? "Unclassified", l = o?.metadata.domain ?? "Unclassified", d = r.get(c) ?? "", u = r.get(l) ?? "", h = !!(d && u && d !== u);
  return {
    edgeId: e.id,
    source: e.source,
    target: e.target,
    relationshipType: e.type,
    relationshipCategory: e.category,
    importance: a,
    curvatureHint: (i % 7 - 3) / 10,
    visibility: a >= n.edgeImportanceThreshold ? "visible" : "hidden",
    labelPriority: Math.round(a * 1e3),
    lodLevel: n.level,
    sourceRegion: d,
    targetRegion: u,
    isCorridor: h
  };
}
function at(e, t, n, i, r) {
  const a = /* @__PURE__ */ new Map();
  for (const u of t) {
    const h = u.domain || e.nodes.get(u.entityId)?.metadata.domain || "Unclassified";
    a.set(h, [...a.get(h) ?? [], u]);
  }
  const s = [...a.entries()].sort(([u], [h]) => u.localeCompare(h)), o = /* @__PURE__ */ new Map(), c = s.map(([u, h], g) => {
    const v = At(h, []), f = {
      x: v.x + v.width / 2,
      y: v.y + v.height / 2
    }, M = Ei(h.map((A) => A.family)), k = Object.entries(M).sort((A, w) => w[1] - A[1] || A[0].localeCompare(w[0]))[0]?.[0], x = Ie(h.reduce((A, w) => A + w.importance, 0) / Math.max(1, h.length)), b = h.map((A) => A.entityId).sort(), C = b.filter((A) => i.get(A)?.isHub), S = b.filter((A) => i.get(A)?.isBridge), N = ki(h, i), j = Di(h, f, v), _ = Oi(u, g), H = zi(u), F = `visual-region:${xe(u)}`;
    return o.set(u, F), {
      regionId: F,
      domain: u,
      members: b,
      importance: x,
      visibility: r.level === "LOD0" ? "hidden" : "visible",
      lodLevel: r.level,
      boundaryHints: {
        centroid: f,
        bounds: v,
        nestingLevel: 0,
        dominantFamily: k ?? "scientific"
      },
      hubIds: C,
      bridgeIds: S,
      interRegionEdges: [],
      capitalId: N,
      neighborhoods: j,
      neighborRegionIds: [],
      storyOrder: _,
      storyRole: H,
      identityTag: ji(xe(u))
    };
  }), l = /* @__PURE__ */ new Map(), d = /* @__PURE__ */ new Map();
  for (const u of n) {
    if (!u.isCorridor) continue;
    const h = l.get(u.sourceRegion) ?? /* @__PURE__ */ new Set();
    h.add(u.edgeId), l.set(u.sourceRegion, h);
    const g = l.get(u.targetRegion) ?? /* @__PURE__ */ new Set();
    if (g.add(u.edgeId), l.set(u.targetRegion, g), u.sourceRegion && u.targetRegion) {
      const v = d.get(u.sourceRegion) ?? /* @__PURE__ */ new Set();
      v.add(u.targetRegion), d.set(u.sourceRegion, v);
      const f = d.get(u.targetRegion) ?? /* @__PURE__ */ new Set();
      f.add(u.sourceRegion), d.set(u.targetRegion, f);
    }
  }
  return c.map((u) => ({
    ...u,
    interRegionEdges: [...l.get(u.regionId) ?? /* @__PURE__ */ new Set()].sort(),
    neighborRegionIds: [...d.get(u.regionId) ?? /* @__PURE__ */ new Set()].sort()
  }));
}
function fi(e, t, n, i) {
  const r = new Map(e.map((o) => [o.entityId, o])), a = e.map((o) => ({
    ...o,
    visibility: yi(o, i)
  })), s = new Set(a.filter((o) => o.visibility !== "hidden").map((o) => o.entityId));
  return {
    nodes: a,
    edges: t.map((o) => ({
      ...o,
      visibility: o.importance >= i.edgeImportanceThreshold && s.has(o.source) && s.has(o.target) ? "visible" : "hidden"
    })),
    regions: n.map((o) => ({
      ...o,
      visibility: vi(o, i, r)
    }))
  };
}
function yi(e, t) {
  return t.level === "LOD5" && e.importance < 0.98 ? "hidden" : t.level === "LOD4" && e.importance < 0.9 || t.level === "LOD3" && e.importance < 0.35 ? "summary" : "visible";
}
function vi(e, t, n) {
  return t.level === "LOD0" ? "hidden" : t.level === "LOD5" || t.level === "LOD4" ? "summary" : e.members.some((i) => n.has(i)) ? "visible" : "hidden";
}
function bi(e, t, n, i) {
  const r = e.map((o) => ({
    labelId: `label:${o.visualId}`,
    ownerId: o.entityId,
    ownerKind: "node",
    text: o.label,
    priority: o.labelPriority,
    visibility: o.importance >= i.labelImportanceThreshold && o.visibility === "visible" ? "visible" : "hidden",
    lodLevel: i.level
  })), a = t.map((o) => ({
    labelId: `label:edge:${o.edgeId}`,
    ownerId: o.edgeId,
    ownerKind: "edge",
    text: o.relationshipType,
    priority: o.labelPriority,
    visibility: i.level === "LOD0" || o.importance > 0.85 && o.visibility === "visible" ? "visible" : "hidden",
    lodLevel: i.level
  })), s = n.map((o) => ({
    labelId: `label:${o.regionId}`,
    ownerId: o.regionId,
    ownerKind: "region",
    text: o.domain,
    priority: Math.round(o.importance * 1e3),
    visibility: o.visibility === "hidden" ? "hidden" : "visible",
    lodLevel: i.level
  }));
  return [
    ...r,
    ...a,
    ...s
  ].sort((o, c) => c.priority - o.priority || o.labelId.localeCompare(c.labelId));
}
function wi(e, t, n, i, r, a) {
  return O({
    sceneId: e,
    layers: ui,
    regions: [...i].sort((s, o) => s.regionId.localeCompare(o.regionId)),
    edges: [...n].sort((s, o) => o.importance - s.importance || s.edgeId.localeCompare(o.edgeId)),
    nodes: [...t].sort((s, o) => s.hierarchyLevel - o.hierarchyLevel || o.importance - s.importance || s.entityId.localeCompare(o.entityId)),
    labels: [...r],
    decorations: i.map((s) => ({
      decorationId: `decoration:${s.regionId}`,
      kind: "region_summary",
      ownerId: s.regionId,
      visibility: s.visibility,
      lodLevel: s.lodLevel
    })),
    bounds: a
  });
}
function Mi(e, t) {
  const n = e?.center ?? {
    x: t.x + t.width / 2,
    y: t.y + t.height / 2
  }, i = e?.zoom ?? 1, r = e?.scale ?? i, a = e?.visibleBounds ?? t;
  return O({
    center: n,
    zoom: i,
    visibleBounds: a,
    scale: r,
    clippingBounds: e?.clippingBounds ?? a
  });
}
function xi(e, t, n, i) {
  const r = e.nodes.filter((s) => s.visibility === "visible").length, a = e.edges.filter((s) => s.visibility === "visible").length;
  return O({
    visibleNodes: r,
    visibleEdges: a,
    collapsedRegions: e.regions.filter((s) => s.visibility === "summary").length,
    averageDensity: n.metadata.density,
    edgeCrossingsEstimate: i.edgeCrossingsEstimate,
    clusterCount: e.regions.filter((s) => s.members.length > 1).length,
    hiddenLabels: e.labels.filter((s) => s.visibility === "hidden").length,
    lodDistribution: t.distribution
  });
}
function Ii(e, t) {
  if (t.snapshotId !== e.id) throw new Error("Projection does not belong to snapshot.");
  for (const n of t.nodeIds) if (!e.nodes.has(n)) throw new Error(`Projection references missing node: ${n}`);
  for (const n of t.edgeIds) if (!e.edges.has(n)) throw new Error(`Projection references missing edge: ${n}`);
}
function Li(e) {
  return e === "dependency" ? "dependency" : e === "domain" || e === "application" ? "domain" : e === "research" ? "research" : e === "pedagogical" || e === "curriculum" ? "hierarchical" : "force";
}
function Si(e, t) {
  return t.index.edgesByTarget.get(e.id)?.size ? 1 : 0;
}
function At(e, t) {
  const n = [...e.map((o) => o.boundingBox), ...t.map((o) => o.boundaryHints.bounds)];
  if (n.length === 0) return {
    x: 0,
    y: 0,
    width: 0,
    height: 0
  };
  const i = Math.min(...n.map((o) => o.x)), r = Math.min(...n.map((o) => o.y)), a = Math.max(...n.map((o) => o.x + o.width)), s = Math.max(...n.map((o) => o.y + o.height));
  return {
    x: i,
    y: r,
    width: a - i,
    height: s - r
  };
}
function Ci(e, t) {
  return Object.fromEntries(di.map((n) => [n, n === e ? t : 0]));
}
function Ei(e) {
  const t = {};
  for (const n of e) t[n] = (t[n] ?? 0) + 1;
  return t;
}
function ot(...e) {
  return vt("sha256").update(e.join("\0")).digest("hex").slice(0, 32);
}
function Ai(e) {
  return JSON.stringify(Pe(e));
}
function Pe(e) {
  return Array.isArray(e) ? e.map(Pe) : e && typeof e == "object" ? Object.fromEntries(Object.entries(e).sort(([t], [n]) => t.localeCompare(n)).map(([t, n]) => [t, Pe(n)])) : e;
}
function Ie(e) {
  return Math.max(0, Math.min(1, Number.isFinite(e) ? e : 0));
}
function ki(e, t) {
  let n = null, i = -1;
  for (const r of e) {
    const a = t.get(r.entityId), s = r.importance * 2 + (a?.isHub ? 1.2 : 0) + (a?.isBridge ? 0.4 : 0);
    s > i && (i = s, n = r.entityId);
  }
  return n;
}
function Di(e, t, n) {
  if (e.length < 2) return [];
  const i = /* @__PURE__ */ new Map();
  for (const a of e) {
    const s = i.get(a.family) ?? [];
    s.push(a), i.set(a.family, s);
  }
  const r = [];
  for (const [a, s] of i) {
    if (s.length < 1) continue;
    const o = s.map((u) => u.position).filter((u) => !!u);
    if (o.length === 0) continue;
    const c = Ti(o), l = Math.max(0, ...o.map((u) => Math.hypot(u.x - c.x, u.y - c.y))), d = Ie(s.reduce((u, h) => u + h.importance, 0) / Math.max(1, s.length));
    r.push({
      neighborhoodId: `neighborhood:${a}:${s.length}`,
      label: Ni(a, s.length),
      family: a,
      memberIds: s.map((u) => u.entityId).sort(),
      centroid: c,
      radius: Math.max(36, l + 24),
      importance: d,
      isSubregion: s.length > 1
    });
  }
  return r.length === 0 ? [] : r.sort((a, s) => s.importance - a.importance || a.family.localeCompare(s.family));
}
function Ti(e) {
  return e.length ? {
    x: e.reduce((t, n) => t + n.x, 0) / e.length,
    y: e.reduce((t, n) => t + n.y, 0) / e.length
  } : {
    x: 0,
    y: 0
  };
}
function Ni(e, t) {
  const n = {
    scientific: "Theoretical Core",
    engineering: "Engineering Practice",
    evidence: "Empirical Layer",
    context: "Contextual Layer"
  };
  return t === 1 ? `${n[e]} · Singleton` : n[e];
}
var Ri = {
  mathematics: 0,
  calculus: 1,
  statistics: 2,
  programming: 3,
  research: 4,
  "machine-learning": 5,
  "deep-learning": 6,
  "computer-vision": 7,
  nlp: 8,
  llms: 9,
  "llm-engineering": 10,
  agents: 11,
  mlops: 12
}, Pi = {
  mathematics: "foundation",
  calculus: "foundation",
  statistics: "foundation",
  programming: "method",
  research: "method",
  "machine-learning": "method",
  "deep-learning": "specialization",
  "computer-vision": "specialization",
  nlp: "specialization",
  llms: "specialization",
  "llm-engineering": "application",
  agents: "application",
  mlops: "operation"
};
function Oi(e, t) {
  return Ri[xe(e)] ?? t;
}
function zi(e) {
  return Pi[xe(e)] ?? "method";
}
function xe(e) {
  return e.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "unclassified";
}
function $i(e) {
  const t = /* @__PURE__ */ new Map();
  if (e.clusters.length === 0 || e.positions.size === 0) return t;
  for (const r of e.clusters) {
    const a = r.members.map((c) => {
      const l = e.positions.get(c);
      if (!l) return null;
      const d = Math.hypot(l.x - r.centroid.x, l.y - r.centroid.y);
      return {
        id: c,
        distance: d,
        importance: 1 / (1 + d)
      };
    }).filter((c) => c !== null).sort((c, l) => c.distance - l.distance || c.id.localeCompare(l.id)), s = Math.max(1, Math.min(2, Math.round(r.members.length / 7) + 1)), o = new Set(a.slice(0, s).map((c) => c.id));
    for (const c of r.members) t.set(c, {
      isHub: o.has(c),
      isBridge: !1
    });
  }
  const n = [];
  for (let r = 0; r < e.clusters.length; r += 1) for (let a = r + 1; a < e.clusters.length; a += 1) {
    const s = e.clusters[r], o = e.clusters[a];
    n.push({
      from: s.id,
      to: o.id,
      distance: Math.hypot(s.centroid.x - o.centroid.x, s.centroid.y - o.centroid.y)
    });
  }
  const i = new Map(e.clusters.map((r) => [r.id, r]));
  for (const r of e.positions.keys()) {
    const a = Bi(e.positions.get(r), i, e.positions, 3);
    if (a.length < 2) continue;
    const s = i.get(a[0].clusterId);
    if (!s || !s.members.includes(r)) continue;
    const o = /* @__PURE__ */ new Set();
    for (const l of a.slice(1)) l.distance < a[0].distance * 1.65 && o.add(l.clusterId);
    if (o.size === 0) continue;
    const c = t.get(r);
    c && t.set(r, {
      ...c,
      isBridge: !0
    });
  }
  return t;
}
function Bi(e, t, n, i) {
  const r = [];
  for (const [a, s] of t) {
    let o = null;
    for (const c of s.members) {
      const l = n.get(c);
      if (!l) continue;
      const d = Math.hypot(l.x - e.x, l.y - e.y);
      (!o || d < o.distance) && (o = {
        id: c,
        distance: d
      });
    }
    o && r.push({
      clusterId: a,
      distance: o.distance,
      memberId: o.id
    });
  }
  return r.sort((a, s) => a.distance - s.distance || a.clusterId.localeCompare(s.clusterId)), r.slice(0, i);
}
function ji(e) {
  return {
    mathematics: "MTH",
    calculus: "CAL",
    statistics: "STA",
    programming: "PRG",
    research: "RES",
    "machine-learning": "ML",
    "deep-learning": "DL",
    "computer-vision": "CV",
    nlp: "NLP",
    llms: "LLM",
    "llm-engineering": "LLE",
    agents: "AGT",
    mlops: "OPS"
  }[e] ?? e.slice(0, 3).toUpperCase();
}
var Vi = class extends hi {
  canvas;
  context;
  options;
  rendererId = "atlas-canvas-renderer-v14";
  rendererKind = "canvas";
  redrawCount = 0;
  metrics = yr();
  visualState = {};
  constructor(e, t, n) {
    super(), this.canvas = e, this.context = t, this.options = n, this.resize(n.width, n.height, n.devicePixelRatio ?? 1);
  }
  resize(e, t, n = this.options.devicePixelRatio ?? 1) {
    this.canvas.width = Math.max(1, Math.floor(e * n)), this.canvas.height = Math.max(1, Math.floor(t * n));
  }
  render(e) {
    const t = performance.now();
    Wi(e);
    const n = Fi(this.context), i = st(e, this.canvas.width, this.canvas.height), r = this.options.compact ?? this.canvas.width <= 720;
    this.beginFrame(e, n, r), this.renderCorridors(e, i, n, r), this.renderRegions(e, i, n, r), this.renderEdges(e, i, n, r), this.renderNodes(e, i, n, r);
    const a = this.renderLabels(e, i, n, r);
    this.renderCompass(e, i, n, r), this.options.debug && this.renderDebugOverlay(e, i, n), this.redrawCount += 1;
    const s = performance.now() - t;
    return this.metrics = {
      frameTimeMs: s,
      fps: s > 0 ? 1e3 / s : 0,
      visibleNodes: e.nodes.filter((o) => o.visibility === "visible").length,
      visibleEdges: e.edges.filter((o) => o.visibility === "visible").length,
      visibleLabels: a.visibleLabels,
      visibleRegions: e.regions.filter((o) => o.visibility !== "hidden").length,
      visibleCorridors: e.scene.edges.filter((o) => o.isCorridor && o.visibility === "visible").length,
      labelCollisions: a.labelCollisions,
      edgeLabelCollisions: a.edgeLabelCollisions,
      lodLevel: e.lod.level,
      zoom: e.viewport.zoom,
      canvasWidth: this.canvas.width,
      canvasHeight: this.canvas.height,
      drawCalls: n.count,
      redrawCount: this.redrawCount,
      memoryEstimateBytes: fr(e)
    }, {
      rendererId: this.rendererId,
      payloadId: e.metadata.payloadId,
      metrics: this.metrics
    };
  }
  getMetrics() {
    return this.metrics;
  }
  setVisualState(e) {
    const t = this.visualState;
    t.hoveredId === e.hoveredId && t.selectedId === e.selectedId && t.focusedId === e.focusedId && ge(t.highlightedIds, e.highlightedIds) && ge(t.dimmedIds, e.dimmedIds) && ge(t.suppressedIds, e.suppressedIds) && ge(t.filteredIds, e.filteredIds) || (this.visualState = {
      hoveredId: e.hoveredId ?? null,
      selectedId: e.selectedId ?? null,
      focusedId: e.focusedId ?? null,
      highlightedIds: e.highlightedIds ?? [],
      dimmedIds: e.dimmedIds ?? [],
      suppressedIds: e.suppressedIds ?? [],
      filteredIds: e.filteredIds ?? []
    });
  }
  worldToCanvas(e, t) {
    return st(e, this.canvas.width, this.canvas.height)(t);
  }
  beginFrame(e, t, n) {
    t.call(() => this.context.clearRect(0, 0, this.canvas.width, this.canvas.height)), qi(this.context, this.canvas.width, this.canvas.height, e, t, n);
  }
  renderCorridors(e, t, n, i) {
  }
  renderRegions(e, t, n, i) {
  }
  renderEdges(e, t, n, i) {
    const r = new Map(e.nodes.map((a) => [a.entityId, a]));
    for (const a of e.scene.edges) {
      if (a.isCorridor || a.visibility !== "visible") continue;
      const s = r.get(a.source), o = r.get(a.target);
      !s || !o || ir(a, e.lod.level, e.viewport.zoom, this.canvas.width, this.visualState, i) && _i(this.context, a, s, o, t, n, e.lod.level, this.visualState);
    }
  }
  renderNodes(e, t, n, i) {
    for (const r of e.scene.nodes)
      r.visibility === "visible" && (this.visualState.suppressedIds?.includes(r.entityId) || rr(r, e.lod.level, e.viewport.zoom, this.canvas.width, this.visualState, i) && Hi(this.context, r, t, n, e.lod.level, this.visualState, i));
  }
  renderLabels(e, t, n, i) {
    const r = new Map(e.nodes.map((u) => [u.entityId, u])), a = new Map(e.edges.map((u) => [u.edgeId, u])), s = [];
    let o = 0, c = 0, l = 0;
    const d = [...e.scene.labels].filter((u) => u.ownerKind !== "region").sort((u, h) => {
      const g = u.ownerKind === "node" ? 200 + (r.get(u.ownerId)?.importance ?? 0) * 100 : 100 + (a.get(u.ownerId)?.importance ?? 0) * 100;
      return (h.ownerKind === "node" ? 200 + (r.get(h.ownerId)?.importance ?? 0) * 100 : 100 + (a.get(h.ownerId)?.importance ?? 0) * 100) - g;
    });
    for (const u of d) {
      if (u.visibility !== "visible") continue;
      const h = Ki(u, r, a);
      if (!h) continue;
      const g = t(h), v = Ji(u, r, a, e.lod.level, e.viewport.zoom, this.canvas.width, this.visualState, i);
      if (!v.visible) continue;
      const f = Xi(this.context, u.text, g, v);
      if (hr(f, this.canvas.width, this.canvas.height)) {
        if (mr(f, s, u.ownerKind === "node" ? 6 : 4)) {
          c += 1, u.ownerKind === "edge" && (l += 1);
          continue;
        }
        Gi(this.context, u, g, n, v), s.push(f), o += 1;
      }
    }
    return {
      visibleLabels: o,
      labelCollisions: c,
      edgeLabelCollisions: l
    };
  }
  renderCompass(e, t, n, i) {
    gr(this.context, this.canvas.width, this.canvas.height, e, n, i);
  }
  renderDebugOverlay(e, t, n) {
    this.context.save(), this.context.fillStyle = "rgba(160, 184, 200, 0.88)", this.context.font = "11px 'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, monospace", this.context.textAlign = "left", this.context.textBaseline = "top";
    const i = [
      "CELESTIAL ATLAS",
      `lod ${e.lod.level} zoom ${e.viewport.zoom.toFixed(2)}`,
      `stars ${this.metrics.visibleNodes} corridors ${this.metrics.visibleEdges}`,
      `labels ${this.metrics.visibleLabels} collisions ${this.metrics.labelCollisions}`,
      `fps ${this.metrics.fps.toFixed(1)} draw ${this.metrics.drawCalls}`
    ];
    for (let r = 0; r < i.length; r += 1) n.call(() => this.context.fillText(i[r], 8, 8 + r * 13));
    this.context.restore();
  }
};
function Fi(e) {
  return {
    count: 0,
    call(t) {
      t(), this.count += 1;
    }
  };
}
function st(e, t, n) {
  const { visibleBounds: i } = e.viewport, r = i.width > 0 ? t / i.width : e.viewport.scale, a = i.height > 0 ? n / i.height : e.viewport.scale, s = Math.min(r, a), o = (t - i.width * s) / 2, c = (n - i.height * s) / 2;
  return (l) => ({
    x: o + (l.x - i.x) * s,
    y: c + (l.y - i.y) * s
  });
}
function qi(e, t, n, i, r, a) {
  e.save(), e.globalAlpha = 1, e.fillStyle = "#040810", e.setLineDash([]), e.beginPath(), e.rect(0, 0, t, n), r.call(() => e.fill()), e.globalAlpha = a ? 2e-3 : 3e-3, e.strokeStyle = "#0c1824", e.lineWidth = 0.25;
  const s = Math.max(120, Math.min(t, n) / 6);
  for (let l = s; l < t; l += s)
    e.beginPath(), e.moveTo(l, 0), e.lineTo(l, n), r.call(() => e.stroke());
  for (let l = s; l < n; l += s)
    e.beginPath(), e.moveTo(0, l), e.lineTo(t, l), r.call(() => e.stroke());
  e.globalAlpha = a ? 0.015 : 0.025, e.strokeStyle = "#1a2a3a", e.lineWidth = 0.4;
  const o = 4, c = 8;
  for (let l = s; l < t; l += s)
    e.beginPath(), e.moveTo(l, c), e.lineTo(l, 12), e.moveTo(l, n - c), e.lineTo(l, n - c - o), r.call(() => e.stroke());
  for (let l = s; l < n; l += s)
    e.beginPath(), e.moveTo(c, l), e.lineTo(12, l), e.moveTo(t - c, l), e.lineTo(t - c - o, l), r.call(() => e.stroke());
  a || (e.globalAlpha = 0.04, e.fillStyle = "#1a2a3a", e.font = "7px 'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, monospace", e.textAlign = "left", e.textBaseline = "top", r.call(() => e.fillText("0,0", 10, 10)), e.textAlign = "right", r.call(() => e.fillText(`${t},${n}`, t - c - 2, n - c - 10))), e.restore();
}
function _i(e, t, n, i, r, a, s, o) {
  const c = r(n.position), l = r(i.position), d = Zi(c, l, t.curvatureHint), u = Q(t.source, o) || Q(t.target, o), h = Oe(t.source, o) || Oe(t.target, o);
  e.save(), e.globalAlpha = or(t, s, u, h), e.strokeStyle = pr(t.relationshipCategory), e.lineWidth = sr(t, s, u), e.setLineDash([]), e.beginPath(), e.moveTo(c.x, c.y), Math.abs(t.curvatureHint) > 1e-3 ? e.quadraticCurveTo(d.x, d.y, l.x, l.y) : e.lineTo(l.x, l.y), a.call(() => e.stroke()), e.restore();
}
function Hi(e, t, n, i, r, a, s) {
  const o = n(t.position), c = Q(t.entityId, a), l = a.hoveredId === t.entityId, d = Oe(t.entityId, a), u = Je(t), h = K(t, r, c || l);
  e.save(), e.globalAlpha = cr(t, r, d), e.strokeStyle = er(t, u, c, l), e.fillStyle = Qi(u, c), e.lineWidth = lr(t, c, l, u), e.setLineDash([]), Ui(e, t, o, h, u, c, l, d, i), e.restore();
}
function Je(e) {
  return e.isHub && e.importance > 0.9 ? "capital" : e.isHub || e.importance > 0.86 ? "landmark" : e.isBridge ? "bridge" : e.family === "context" || e.importance < 0.5 ? "peripheral" : "concept";
}
function Ui(e, t, n, i, r, a, s, o, c) {
  if (r === "capital") {
    pe(e, n, i * 0.32, a, t, c), Se(e, n, i, c);
    return;
  }
  if (r === "landmark") {
    pe(e, n, i * 0.4, a, t, c), Se(e, n, i, c);
    return;
  }
  if (r === "bridge") {
    Yi(e, n, i, !1, c);
    return;
  }
  if (r === "peripheral") {
    pe(e, n, i * 0.35, a, t, c);
    return;
  }
  Se(e, n, i, c), (a || s) && pe(e, n, i * 0.15, a, t, c);
}
function Se(e, t, n, i) {
  e.beginPath(), e.arc(t.x, t.y, n, 0, Math.PI * 2), i.call(() => e.stroke());
}
function pe(e, t, n, i, r, a) {
  const s = e.globalAlpha;
  e.globalAlpha = Math.min(0.72, s + (i ? 0.12 : 0.02)), e.fillStyle = tr(r, i), e.beginPath(), e.arc(t.x, t.y, n, 0, Math.PI * 2), a.call(() => e.fill()), e.globalAlpha = s;
}
function Yi(e, t, n, i, r) {
  e.beginPath(), e.moveTo(t.x, t.y - n), e.lineTo(t.x + n * 0.72, t.y), e.lineTo(t.x, t.y + n), e.lineTo(t.x - n * 0.72, t.y), e.closePath(), i && r.call(() => e.fill()), r.call(() => e.stroke());
}
function Gi(e, t, n, i, r) {
  e.save(), e.globalAlpha = r.opacity, e.fillStyle = r.color;
  const a = r.letterSpacing > 0 ? `${r.letterSpacing}px ` : "", s = r.uppercase ? "'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, monospace" : "'IBM Plex Sans', 'Inter', system-ui, sans-serif";
  e.font = `${r.weight} ${a}${r.fontSize}px ${s}`, e.textAlign = "center", e.textBaseline = "middle";
  const o = r.uppercase ? t.text.toUpperCase() : t.text;
  if (r.uppercase) {
    e.globalAlpha = Math.min(0.45, r.opacity * 0.4), e.fillStyle = "#020408";
    for (const [c, l] of [
      [-0.5, 0],
      [0.5, 0],
      [0, -0.5],
      [0, 0.5]
    ]) i.call(() => e.fillText(o, n.x + c, n.y + r.offsetY + l, r.maxWidth));
    e.globalAlpha = r.opacity, e.fillStyle = r.color;
  }
  i.call(() => e.fillText(o, n.x, n.y + r.offsetY, r.maxWidth)), e.restore();
}
function Wi(e) {
  if (Et(e), !Number.isFinite(e.viewport.zoom) || e.viewport.zoom <= 0) throw new Error("Canvas renderer viewport zoom must be positive.");
  if (e.viewport.visibleBounds.width < 0 || e.viewport.visibleBounds.height < 0) throw new Error("Canvas renderer viewport bounds must be non-negative.");
  for (const t of e.nodes) {
    if (!Number.isFinite(t.position.x) || !Number.isFinite(t.position.y)) throw new Error(`Invalid visual node position: ${t.entityId}`);
    if (t.radius < 0) throw new Error(`Invalid visual node radius: ${t.entityId}`);
  }
}
function Ki(e, t, n) {
  if (e.ownerKind === "node") return t.get(e.ownerId)?.position;
  const i = n.get(e.ownerId);
  if (!i) return;
  const r = t.get(i.source), a = t.get(i.target);
  if (!(!r || !a))
    return {
      x: (r.position.x + a.position.x) / 2,
      y: (r.position.y + a.position.y) / 2
    };
}
function Ji(e, t, n, i, r, a, s, o) {
  const c = Q(e.ownerId, s);
  if (e.ownerKind === "edge") {
    if (o) return {
      visible: !1,
      opacity: 0,
      fontSize: 0,
      maxWidth: 0,
      offsetY: 0,
      height: 0,
      color: "#000",
      weight: 0,
      letterSpacing: 0,
      uppercase: !1
    };
    const v = n.get(e.ownerId), f = !!(v && v.importance > ur(i, r)), M = v?.importance ?? 0;
    return {
      visible: c || f,
      opacity: c ? 0.55 : M > 0.85 ? 0.22 : 0.12,
      fontSize: c ? 9.5 : 8,
      maxWidth: 110,
      offsetY: -8,
      height: 10,
      color: c ? "#a0c0d0" : "#5a7080",
      weight: c ? 480 : 400,
      letterSpacing: 0.15,
      uppercase: !1
    };
  }
  const l = t.get(e.ownerId), d = l?.importance ?? 0, u = l?.isHub || d > 0.82, h = l?.isBridge, g = !!(l && (c || Xe(r, a) && u || d >= dr(i, r) || h && r > 1.4 && !o));
  return o ? {
    visible: g && !!l?.isHub,
    opacity: 0.78,
    fontSize: 10,
    maxWidth: 96,
    offsetY: -(K(l, i, c) + 7),
    height: 12,
    color: c ? "#e0e8f0" : "#a0b8c8",
    weight: 600,
    letterSpacing: 0.3,
    uppercase: !1
  } : l?.isHub ? {
    visible: g,
    opacity: c ? 0.78 : 0.45,
    fontSize: c ? 11 : 10,
    maxWidth: c ? 170 : 140,
    offsetY: c ? -(K(l, i, !0) + 14) : -(K(l, i, !1) + 11),
    height: c ? 16 : 14,
    color: c ? "#e0f0ff" : "#a0c0d0",
    weight: 600,
    letterSpacing: 0.3,
    uppercase: !1
  } : h ? {
    visible: g,
    opacity: c ? 0.65 : 0.3,
    fontSize: c ? 10 : 9,
    maxWidth: c ? 150 : 130,
    offsetY: c ? -(K(l, i, !0) + 12) : -(K(l, i, !1) + 9),
    height: c ? 14 : 12,
    color: c ? "#d8c878" : "#a09050",
    weight: 520,
    letterSpacing: 0.2,
    uppercase: !1
  } : {
    visible: g,
    opacity: c ? 0.72 : d > 0.75 ? 0.2 : d > 0.55 ? 0.14 : 0.08,
    fontSize: c ? 9.5 : d > 0.75 ? 8.5 : 7.5,
    maxWidth: c ? 130 : d > 0.75 ? 100 : 70,
    offsetY: c ? -(K(l, i, !0) + 8) : -(K(l, i, !1) + 6),
    height: c ? 12 : 9,
    color: c ? "#d0e8f0" : d > 0.75 ? "#8a9ca8" : "#5a6a78",
    weight: c ? 480 : d > 0.75 ? 440 : 400,
    letterSpacing: d > 0.75 ? 0.08 : 0.04,
    uppercase: !1
  };
}
function Xi(e, t, n, i) {
  e.save();
  const r = i.letterSpacing > 0 ? `${i.letterSpacing}px ` : "", a = i.uppercase ? "'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, monospace" : "'IBM Plex Sans', 'Inter', system-ui, sans-serif";
  e.font = `${i.weight} ${r}${i.fontSize}px ${a}`;
  const s = Math.min(i.maxWidth, Math.max(24, e.measureText(i.uppercase ? t.toUpperCase() : t).width + 10));
  return e.restore(), {
    x: n.x - s / 2,
    y: n.y + i.offsetY - i.height / 2,
    width: s,
    height: i.height
  };
}
function Zi(e, t, n) {
  const i = {
    x: (e.x + t.x) / 2,
    y: (e.y + t.y) / 2
  }, r = t.x - e.x, a = t.y - e.y;
  return {
    x: i.x - a * n,
    y: i.y + r * n
  };
}
function Qi(e, t) {
  return e === "capital" ? t ? "#0a1014" : "#050a0e" : t && e === "landmark" ? "rgba(6, 12, 18, 0.15)" : "rgba(0, 0, 0, 0)";
}
function er(e, t, n, i) {
  return n ? "#d0e8f8" : i && t === "bridge" ? "#c8b868" : i ? "#68a8c0" : t === "capital" ? "#4890a8" : t === "landmark" ? "#3a7888" : t === "bridge" ? "#8a7a40" : t === "peripheral" ? "#4a6070" : nr(e);
}
function tr(e, t) {
  return t ? "#e0f0ff" : e.family === "scientific" ? "#2a6a7a" : e.family === "engineering" ? "#2a7868" : e.family === "evidence" ? "#7a6a28" : "#5a4a6a";
}
function nr(e) {
  return e.family === "scientific" ? "#408898" : e.family === "engineering" ? "#408878" : e.family === "evidence" ? "#8a7a38" : "#6a5a7a";
}
function ir(e, t, n, i, r, a) {
  return Q(e.source, r) || Q(e.target, r) ? !0 : e.visibility !== "visible" ? !1 : a ? e.importance > 0.88 : t === "LOD0" ? e.importance > 0.8 : t === "LOD1" ? e.importance > 0.72 : e.importance >= ar(t, n, i);
}
function rr(e, t, n, i, r, a) {
  return Q(e.entityId, r) ? !0 : a ? e.isHub || e.isBridge || e.importance > 0.78 : Xe(n, i) && e.importance < 0.82 && !e.isHub && !e.isBridge ? !1 : t === "LOD0" ? e.isHub || e.isBridge || e.importance > 0.48 : t === "LOD1" ? e.isHub || e.isBridge || e.importance > 0.38 : !0;
}
function ar(e, t, n) {
  return Xe(t, n) ? 0.88 : t > 3 ? 0.82 : t > 2.2 ? 0.76 : e === "LOD0" ? 0.7 : e === "LOD1" ? 0.8 : e === "LOD2" ? 0.6 : e === "LOD3" ? 0.48 : 0.76;
}
function Xe(e, t) {
  return t <= 720 && e <= 1.2;
}
function or(e, t, n, i) {
  if (i) return 0.03;
  const r = e.importance;
  return n ? r > 0.85 ? 0.75 : r > 0.7 ? 0.55 : 0.38 : t === "LOD0" ? r > 0.9 ? 0.18 : r > 0.82 ? 0.12 : 0.06 : t === "LOD1" ? r > 0.88 ? 0.22 : r > 0.78 ? 0.14 : 0.08 : r > 0.85 ? 0.32 : r > 0.7 ? 0.22 : r > 0.6 ? 0.14 : 0.08;
}
function sr(e, t, n) {
  const i = e.importance;
  if (n)
    return i > 0.85 ? 2.2 : i > 0.7 ? 1.7 : 1.2;
  const r = t === "LOD0" ? 0.4 : t === "LOD1" ? 0.6 : t === "LOD2" ? 0.85 : 1;
  return i > 0.85 ? (1.5 + i * 0.6) * r : i > 0.7 ? (1.2 + i * 0.5) * r : i > 0.6 ? (0.9 + i * 0.4) * r : Math.max(0.4, (0.6 + i * 0.3) * r);
}
function K(e, t, n) {
  if (!e) return 4;
  const i = Je(e), r = e.family === "context" ? -0.4 : e.family === "evidence" ? -0.06 : 0.1, a = t === "LOD0" ? 0.72 : t === "LOD1" ? 0.84 : t === "LOD2" ? 1 : 1.12, s = e.importance > 0.85 ? 1.15 : e.importance > 0.7 ? 1.05 : e.importance > 0.5 ? 0.9 : 0.76, o = (e.radius + r) * a * s + (n ? 0.6 : 0);
  return i === "capital" ? Math.max(6, (o + 4.2) * 0.82) : i === "landmark" ? Math.max(4.8, (o + 2.8) * 0.78) : i === "bridge" ? Math.max(2.4, o * 0.48) : i === "peripheral" ? Math.max(1.8, o * 0.24) : Math.max(2.6, o * 0.32);
}
function cr(e, t, n) {
  if (n) return 0.08;
  const i = e.importance, r = Je(e);
  return r === "capital" ? t === "LOD0" ? 0.85 : t === "LOD1" ? 0.9 : 0.95 : r === "landmark" ? t === "LOD0" ? 0.8 : t === "LOD1" ? 0.85 : 0.9 : r === "bridge" ? t === "LOD0" ? 0.52 : t === "LOD1" ? 0.62 : 0.72 : r === "peripheral" ? t === "LOD0" ? 0.12 : t === "LOD1" ? 0.18 : 0.25 : i > 0.82 ? t === "LOD0" ? 0.52 : 0.62 : i > 0.65 ? t === "LOD0" ? 0.38 : t === "LOD1" ? 0.45 : 0.52 : t === "LOD0" ? 0.22 : t === "LOD1" ? 0.3 : 0.38;
}
function lr(e, t, n, i) {
  return t ? i === "capital" ? 1.2 : i === "landmark" ? 1 : 0.7 : n ? i === "capital" ? 1.1 : i === "landmark" ? 0.9 : 0.6 : i === "capital" ? 0.9 : i === "landmark" ? 0.7 : i === "bridge" ? 0.5 : i === "peripheral" ? 0.25 : 0.4;
}
function dr(e, t) {
  return Math.max(0.12, (e === "LOD0" ? 0.94 : e === "LOD1" ? 0.92 : e === "LOD2" ? 0.8 : e === "LOD3" ? 0.62 : 0.48) + (t > 2.4 ? -0.28 : t > 1.6 ? -0.18 : t > 1.15 ? -0.06 : t < 0.95 ? 0.12 : 0));
}
function ur(e, t) {
  const n = e === "LOD0" ? 0.96 : e === "LOD1" ? 0.94 : 0.84;
  return t > 2 ? n - 0.14 : n;
}
function Q(e, t) {
  return t.selectedId === e || t.focusedId === e || t.hoveredId === e || !!t.highlightedIds?.includes(e);
}
function Oe(e, t) {
  return t.dimmedIds?.includes(e) ? !0 : t.filteredIds?.length ? !t.filteredIds.includes(e) : !1;
}
function mr(e, t, n) {
  return t.some((i) => e.x - n < i.x + i.width + n && e.x + e.width + n > i.x - n && e.y - n < i.y + i.height + n && e.y + e.height + n > i.y - n);
}
function hr(e, t, n) {
  return e.x >= 0 && e.y >= 0 && e.x + e.width <= t && e.y + e.height <= n;
}
function pr(e) {
  return {
    epistemic: "#5a7a8a",
    structural: "#508898",
    pedagogical: "#408878",
    engineering: "#409080",
    evidentiary: "#9a8a48",
    temporal: "#6a5a78",
    inferential: "#409080"
  }[e];
}
function gr(e, t, n, i, r, a) {
  e.save(), e.globalAlpha = 0.12, e.fillStyle = "#4a6070", e.font = "7px 'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, monospace", e.textAlign = "left", e.textBaseline = "top";
  const o = i.metadata.snapshotId.slice(0, 6).toUpperCase();
  r.call(() => e.fillText(`ATLAS · ${o}`, 10, 10)), a || (e.textAlign = "right", e.globalAlpha = 0.08, r.call(() => e.fillText(i.lod.level, t - 10, 10))), a || (e.textAlign = "left", e.textBaseline = "bottom", e.globalAlpha = 0.06, r.call(() => e.fillText(`${i.nodes.length} nodes · ${i.edges.length} edges`, 10, n - 10))), e.restore();
}
function fr(e) {
  return e.nodes.length * 248 + e.edges.length * 152 + e.labels.length * 104 + e.regions.length * 220;
}
function yr() {
  return {
    frameTimeMs: 0,
    fps: 0,
    visibleNodes: 0,
    visibleEdges: 0,
    visibleLabels: 0,
    visibleRegions: 0,
    visibleCorridors: 0,
    labelCollisions: 0,
    edgeLabelCollisions: 0,
    lodLevel: "LOD0",
    zoom: 1,
    canvasWidth: 0,
    canvasHeight: 0,
    drawCalls: 0,
    redrawCount: 0,
    memoryEstimateBytes: 0
  };
}
function ge(e, t) {
  if (e === t) return !0;
  if (!e || !t || e.length !== t.length) return !1;
  for (let n = 0; n < e.length; n++) if (e[n] !== t[n]) return !1;
  return !0;
}
var vr = "topology", br = "nv.atlas.viewport", wr = class {
  options;
  status = "idle";
  projectionKind;
  snapshotRef = null;
  projectionRef = null;
  payloadRef = null;
  renderer = null;
  interaction = null;
  renderResult = null;
  canvasMount = null;
  diagnosticsId = null;
  listeners = [];
  pendingFrame = null;
  resizeObserver = null;
  resizeDebounceTimer = null;
  resizeEntryGuard = !1;
  lastAnnouncedSelectionId = null;
  pendingVisualStateUpdate = !1;
  constructor(e) {
    this.options = e, this.projectionKind = this.readPersistedViewport()?.projection ?? e.initialProjection ?? vr;
  }
  start() {
    if (this.status === "destroyed") throw new Error("Atlas page controller cannot restart after destroy.");
    this.cleanupActiveResources(), this.status = "loading", this.diagnosticsId = null, this.options.host.showLoading("Preparing Atlas topology");
    try {
      const e = (this.options.graphSourceFactory ?? nn)(), t = new Vt().compile(e);
      if (this.snapshotRef = t, t.nodes.size === 0)
        return this.status = "empty", this.options.host.showEmpty({ message: "Atlas has no knowledge entities to render." }), this.snapshot();
      const n = this.readPersistedViewport();
      this.projectionKind = n?.projection ?? this.projectionKind;
      const i = new Ft().generate(t, {
        kind: this.projectionKind,
        includeIsolatedNodes: !0
      }), r = rt({
        snapshot: t,
        projection: i,
        viewport: n ? Ir(n) : void 0
      }), a = this.options.host.mountCanvas(), s = new Vi(a.canvas, a.context, {
        width: a.width,
        height: a.height,
        devicePixelRatio: a.devicePixelRatio ?? 1
      }), o = On({
        payload: r,
        options: {
          viewportSize: {
            width: a.width,
            height: a.height
          },
          clock: this.options.clock,
          dragThreshold: 5
        }
      });
      return this.projectionRef = i, this.payloadRef = r, this.canvasMount = a, this.renderer = s, this.interaction = o, this.renderResult = s.render(r), this.attachInteraction(a), this.observeCanvasResize(a), this.announceSelection(null), this.status = "ready", this.snapshot();
    } catch (e) {
      const t = this.createDiagnosticsId(e);
      return this.status = "error", this.diagnosticsId = t, this.options.host.showError({
        message: "Atlas snapshot could not be built.",
        diagnosticsId: t,
        retry: () => {
          this.start();
        }
      }), this.snapshot();
    }
  }
  resetViewport() {
    return this.interaction ? (this.interaction.resetViewportAnimated(() => {
      this.syncViewportFromInteraction();
    }), this.snapshot()) : this.snapshot();
  }
  clearSelection() {
    return this.interaction ? (this.interaction.clearSelection(), this.announceSelection(null), this.snapshot()) : this.snapshot();
  }
  destroy() {
    this.cleanupActiveResources(), this.options.host.clear(), this.status = "destroyed";
  }
  snapshot() {
    return {
      status: this.status,
      projection: this.projectionKind,
      payloadId: this.payloadRef?.metadata.payloadId ?? null,
      nodeCount: this.payloadRef?.nodes.length ?? 0,
      edgeCount: this.payloadRef?.edges.length ?? 0,
      render: this.renderResult,
      interaction: this.interaction?.snapshot() ?? null,
      diagnosticsId: this.diagnosticsId
    };
  }
  attachInteraction(e) {
    if (!e.eventTarget || !this.interaction) return;
    const t = e.eventTarget;
    this.addListener(t, "pointermove", (n) => {
      const i = this.interaction?.snapshot().viewport ?? null;
      this.interaction?.pointerMove(re(n, this.canvasMount));
      const r = this.interaction?.snapshot().viewport ?? null;
      if (i && r && Cr(i, r)) {
        "preventDefault" in n && n.preventDefault(), this.setCanvasDragging(!0), this.syncViewportFromInteraction();
        return;
      }
      this.renderInteractionVisualState();
    }), this.addListener(t, "pointerdown", (n) => {
      n.button === 0 && ("preventDefault" in n && n.preventDefault(), G(t) && "setPointerCapture" in t && "pointerId" in n && t.setPointerCapture(n.pointerId), this.setCanvasDragging(!0), this.interaction?.pointerDown(re(n, this.canvasMount)));
    }), this.addListener(t, "pointerup", (n) => {
      if (G(t) && "releasePointerCapture" in t && "pointerId" in n) try {
        t.releasePointerCapture(n.pointerId);
      } catch {
      }
      this.interaction?.pointerUp(), this.setCanvasDragging(!1), this.syncViewportFromInteraction(), this.renderInteractionVisualState();
    }), this.addListener(t, "pointercancel", (n) => {
      if (G(t) && "releasePointerCapture" in t && "pointerId" in n) try {
        t.releasePointerCapture(n.pointerId);
      } catch {
      }
      this.interaction?.pointerUp(), this.setCanvasDragging(!1), this.renderInteractionVisualState();
    }), this.addListener(t, "click", (n) => {
      this.interaction?.click(re(n, this.canvasMount)), this.renderInteractionVisualState();
    }), this.addListener(t, "dblclick", (n) => {
      "preventDefault" in n && n.preventDefault(), this.interaction?.focusAt(re(n, this.canvasMount), () => {
        this.syncViewportFromInteraction();
      }) && this.renderInteractionVisualState();
    }), this.addListener(t, "wheel", (n) => {
      "preventDefault" in n && n.preventDefault(), this.interaction?.wheel(re(n, this.canvasMount)), this.syncViewportFromInteraction();
    });
  }
  addListener(e, t, n) {
    e.addEventListener(t, n, t === "wheel" ? { passive: !1 } : void 0), this.listeners.push({
      target: e,
      type: t,
      listener: n
    });
  }
  setCanvasDragging(e) {
    G(this.canvasMount?.eventTarget) && (e ? this.canvasMount.eventTarget.dataset.draggingViewport = "true" : delete this.canvasMount.eventTarget.dataset.draggingViewport);
  }
  syncViewportFromInteraction() {
    if (!this.interaction || !this.snapshotRef || !this.projectionRef || !this.renderer) return;
    const e = this.interaction.snapshot().viewport;
    this.persistViewport(e), this.scheduleRender(e);
  }
  renderInteractionVisualState() {
    !this.interaction || !this.renderer || !this.payloadRef || this.pendingVisualStateUpdate || (this.pendingVisualStateUpdate = !0, ct(() => {
      if (this.pendingVisualStateUpdate = !1, !this.interaction || !this.renderer || !this.payloadRef) return;
      const e = this.interaction.snapshot(), t = Ce(e.selection.selected), n = Ce(e.focus.focused), i = Ce(e.hover.hovered), r = [
        t,
        n,
        i
      ].filter((a) => !!a);
      if (t && e.inspector.selected) for (const a of e.inspector.selected.relationships)
        a.source !== t && r.push(a.source), a.target !== t && r.push(a.target);
      if (this.renderer.setVisualState({
        selectedId: t,
        focusedId: n,
        hoveredId: i,
        highlightedIds: r
      }), this.renderResult = this.renderer.render(this.payloadRef), this.announceSelection(e.inspector.selected), G(this.canvasMount?.eventTarget)) {
        const a = this.canvasMount.eventTarget;
        i ? a.dataset.hoveringNode = "true" : delete a.dataset.hoveringNode;
      }
    }));
  }
  scheduleRender(e) {
    this.pendingFrame && lt(this.pendingFrame), this.pendingFrame = ct(() => {
      if (this.pendingFrame = null, !this.snapshotRef || !this.projectionRef || !this.renderer) return;
      const t = rt({
        snapshot: this.snapshotRef,
        projection: this.projectionRef,
        viewport: e
      });
      this.payloadRef = t, this.renderResult = this.renderer.render(t);
    });
  }
  observeCanvasResize(e) {
    !G(e.eventTarget) || typeof ResizeObserver > "u" || (this.resizeObserver?.disconnect(), this.resizeObserver = new ResizeObserver(() => this.scheduleResizeSync()), this.resizeObserver.observe(e.eventTarget));
  }
  scheduleResizeSync() {
    this.resizeEntryGuard || (this.resizeDebounceTimer !== null && clearTimeout(this.resizeDebounceTimer), this.resizeDebounceTimer = setTimeout(() => {
      this.resizeDebounceTimer = null, this.syncCanvasSizeToLayout();
    }, 0));
  }
  syncCanvasSizeToLayout() {
    if (!(!this.canvasMount || !this.renderer || !this.interaction || !G(this.canvasMount.eventTarget)) && !this.resizeEntryGuard) {
      this.resizeEntryGuard = !0;
      try {
        const e = this.canvasMount.eventTarget.getBoundingClientRect(), t = window.devicePixelRatio || 1, n = Math.max(320, Math.floor(e.width || this.canvasMount.width)), i = Math.max(360, Math.floor(e.height || this.canvasMount.height));
        if (n === this.canvasMount.width && i === this.canvasMount.height) return;
        this.canvasMount = {
          ...this.canvasMount,
          width: n,
          height: i,
          devicePixelRatio: t
        }, this.renderer.resize(n, i, t), this.interaction.setViewportSize({
          width: n,
          height: i
        }), this.scheduleRender(this.interaction.snapshot().viewport);
      } finally {
        this.resizeEntryGuard = !1;
      }
    }
  }
  cleanupActiveResources() {
    for (const { target: e, type: t, listener: n } of this.listeners.splice(0)) e.removeEventListener(t, n);
    this.pendingFrame && (lt(this.pendingFrame), this.pendingFrame = null), this.resizeDebounceTimer !== null && (clearTimeout(this.resizeDebounceTimer), this.resizeDebounceTimer = null), this.resizeObserver?.disconnect(), this.resizeObserver = null, this.resizeEntryGuard = !1, this.pendingVisualStateUpdate = !1, this.interaction && this.interaction.resetViewport(), this.snapshotRef = null, this.projectionRef = null, this.payloadRef = null, this.renderer = null, this.interaction = null, this.renderResult = null, this.canvasMount = null, this.lastAnnouncedSelectionId = null, this.options.host.clear();
  }
  announceSelection(e) {
    const t = e?.id ?? null;
    if (t !== this.lastAnnouncedSelectionId) {
      if (this.lastAnnouncedSelectionId = t, G(this.canvasMount?.eventTarget)) {
        this.canvasMount.eventTarget.setAttribute("aria-label", e ? `Atlas knowledge topology. Selected ${e.label}.` : "Atlas knowledge topology. No entity selected.");
        const n = this.canvasMount.eventTarget.closest("[data-knowledge-graph-root]")?.querySelector("[data-atlas-selection-readout]");
        n && (n.textContent = e ? `${e.label} · ${e.kind} · ${e.relationships.length} relationships` : "No Atlas entity selected. Select a concept, landmark, or continent to begin exploring.");
      }
      typeof window < "u" && window.dispatchEvent(new CustomEvent("nv:atlas-selection", { detail: { selected: e } }));
    }
  }
  readPersistedViewport() {
    const e = this.options.storage?.load() ?? null;
    return Lr(e) ? e : null;
  }
  persistViewport(e) {
    this.options.storage?.save({
      projection: this.projectionKind,
      zoom: e.zoom,
      pan: {
        x: e.center.x,
        y: e.center.y
      }
    });
  }
  createDiagnosticsId(e) {
    if (this.options.diagnostics) return this.options.diagnostics.createId(e);
    const t = e instanceof Error ? e.message : String(e);
    let n = 0;
    for (let i = 0; i < t.length; i += 1) n = n * 31 + t.charCodeAt(i) >>> 0;
    return `atlas-${n.toString(16).padStart(8, "0")}`;
  }
};
function Mr(e) {
  return new wr(e);
}
function xr(e, t = br) {
  return {
    load() {
      const n = e.getItem(t);
      if (!n) return null;
      try {
        return JSON.parse(n);
      } catch {
        return null;
      }
    },
    save(n) {
      e.setItem(t, JSON.stringify(n));
    }
  };
}
function Ir(e) {
  return {
    center: {
      x: e.pan.x,
      y: e.pan.y
    },
    zoom: e.zoom,
    scale: e.zoom
  };
}
function Lr(e) {
  return !!(e && typeof e.zoom == "number" && Number.isFinite(e.zoom) && e.zoom > 0 && typeof e.pan?.x == "number" && typeof e.pan?.y == "number" && typeof e.projection == "string");
}
function re(e, t) {
  const n = e;
  return {
    point: Sr(n, t),
    buttons: n.buttons,
    deltaY: typeof n.deltaY == "number" ? n.deltaY : void 0
  };
}
function Sr(e, t) {
  const n = {
    x: Number.isFinite(e.offsetX) ? e.offsetX ?? 0 : e.clientX,
    y: Number.isFinite(e.offsetY) ? e.offsetY ?? 0 : e.clientY
  };
  if (!t || !G(t.eventTarget)) return n;
  const i = t.eventTarget.getBoundingClientRect();
  if (!i.width || !i.height) return n;
  const r = typeof e.clientX == "number" ? e.clientX - i.left : n.x, a = typeof e.clientY == "number" ? e.clientY - i.top : n.y;
  return {
    x: r * (t.width / i.width),
    y: a * (t.height / i.height)
  };
}
function Ce(e) {
  return !e || e.kind === "background" ? null : e.id;
}
function Cr(e, t) {
  return e.zoom !== t.zoom || e.center.x !== t.center.x || e.center.y !== t.center.y;
}
function G(e) {
  return typeof HTMLCanvasElement < "u" && e instanceof HTMLCanvasElement;
}
function ct(e) {
  return typeof requestAnimationFrame == "function" ? requestAnimationFrame(e) : setTimeout(() => e(Date.now()), 0);
}
function lt(e) {
  if (typeof cancelAnimationFrame == "function" && typeof e == "number") {
    cancelAnimationFrame(e);
    return;
  }
  clearTimeout(e);
}
function Er(e) {
  return {
    showLoading(t) {
      Ae(e, Ee("status", "Atlas loading", t));
    },
    showError(t) {
      const n = Ee("alert", "Atlas unavailable", `${t.message} Diagnostics: ${t.diagnosticsId}`), i = document.createElement("button");
      i.type = "button", i.textContent = "Retry", i.addEventListener("click", t.retry), n.append(i), Ae(e, n);
    },
    showEmpty(t) {
      Ae(e, Ee("status", "Atlas empty", t.message));
    },
    mountCanvas() {
      e.replaceChildren();
      const t = document.createElement("section");
      t.className = "nv-atlas-page", t.setAttribute("aria-labelledby", "nv-atlas-title");
      const n = document.createElement("header");
      n.className = "nv-atlas-header";
      const i = document.createElement("p");
      i.className = "nv-atlas-eyebrow", i.textContent = "Celestial knowledge atlas";
      const r = document.createElement("h1");
      r.id = "nv-atlas-title", r.className = "nv-atlas-title", r.textContent = "Atlas";
      const a = document.createElement("p");
      a.className = "nv-atlas-copy", a.textContent = "A celestial knowledge atlas of AI Engineering concepts, dependencies, and semantic constellations.";
      const s = document.createElement("div");
      s.className = "nv-atlas-actions";
      const o = document.createElement("button");
      o.type = "button", o.className = "nv-atlas-reset", o.dataset.atlasResetView = "true", o.textContent = "Reset view", s.append(o);
      const c = document.createElement("p");
      c.className = "nv-sr-only", c.dataset.atlasSummary = "true", c.textContent = "Atlas graph loaded. Use pointer gestures to pan and zoom. Select a node to inspect its relationships.", n.append(i, r, a, s, c);
      const l = document.createElement("div");
      l.className = "nv-atlas-canvas-frame";
      const d = document.createElement("canvas");
      d.setAttribute("aria-label", "Atlas knowledge topology"), d.setAttribute("role", "img"), d.tabIndex = 0, d.style.display = "block", d.style.width = "100%", d.style.height = "100%", d.style.touchAction = "none";
      const u = document.createElement("p");
      u.className = "nv-atlas-selection-readout", u.dataset.atlasSelectionReadout = "true", u.id = "nv-atlas-selection-readout", u.setAttribute("aria-live", "polite"), u.textContent = "Select a star, landmark, or constellation to begin exploring.", d.setAttribute("aria-describedby", "nv-atlas-selection-readout"), l.append(d);
      const h = document.createElement("div");
      h.className = "nv-atlas-orientation", h.dataset.atlasOrientation = "true", h.setAttribute("aria-label", "Atlas orientation strip");
      const g = document.createElement("span");
      g.className = "nv-atlas-orientation-eyebrow", g.textContent = "You are exploring";
      const v = document.createElement("span");
      v.className = "nv-atlas-orientation-value", v.dataset.atlasOrientationValue = "true", v.textContent = "the world of AI Engineering";
      const f = document.createElement("span");
      f.className = "nv-atlas-orientation-hint", f.textContent = "Navigate between constellations · follow the stellar corridors", h.append(g, v, f);
      const M = document.createElement("div");
      M.className = "nv-atlas-legend", M.dataset.atlasLegend = "true", M.setAttribute("aria-hidden", "true"), M.innerHTML = "", t.append(n, l, h, M, u), e.append(t);
      const k = l.getBoundingClientRect(), x = Math.max(320, Math.floor(k.width || l.clientWidth || 960)), b = Math.max(360, Math.floor(k.height || l.clientHeight || 640)), C = d.getContext("2d");
      if (!C) throw new Error("Atlas canvas context unavailable.");
      return {
        canvas: d,
        context: C,
        width: x,
        height: b,
        devicePixelRatio: window.devicePixelRatio || 1,
        eventTarget: d
      };
    },
    clear() {
      e.replaceChildren();
    }
  };
}
function Ee(e, t, n) {
  const i = document.createElement("section");
  i.setAttribute("role", e), i.setAttribute("aria-live", e === "alert" ? "assertive" : "polite"), i.dataset.atlasState = t.toLowerCase().replace(/\s+/g, "-");
  const r = document.createElement("h1");
  r.textContent = t;
  const a = document.createElement("p");
  return a.textContent = n, i.append(r, a), i;
}
function Ae(e, t) {
  e.replaceChildren(t);
}
var Le = [
  {
    id: "journey-introduction-to-ai",
    name: "Introduction to AI Engineering",
    description: "A foundational path from mathematics through machine learning to deep learning fundamentals.",
    tags: [
      "beginner",
      "foundations",
      "mathematics",
      "machine-learning"
    ],
    steps: [
      p("linear-algebra", "Linear Algebra", "Mathematics", "foundation"),
      p("probability", "Probability", "Statistics", "foundation"),
      p("calculus", "Calculus", "Mathematics", "foundation"),
      p("optimization", "Optimization", "Mathematics", "method"),
      p("statistics", "Statistics", "Statistics", "foundation"),
      p("supervised-learning", "Supervised Learning", "Machine Learning", "method"),
      p("neural-network", "Neural Network", "Deep Learning", "method"),
      p("backpropagation", "Backpropagation", "Deep Learning", "method"),
      p("python", "Python", "Programming", "foundation"),
      p("pytorch", "PyTorch", "Programming", "bridge")
    ]
  },
  {
    id: "journey-deep-learning-fundamentals",
    name: "Deep Learning Fundamentals",
    description: "From neural network basics through architectures to modern deep learning techniques.",
    tags: [
      "intermediate",
      "deep-learning",
      "architectures"
    ],
    steps: [
      p("neural-network", "Neural Network", "Deep Learning", "foundation"),
      p("mlp", "MLP", "Deep Learning", "method"),
      p("backpropagation", "Backpropagation", "Deep Learning", "method"),
      p("optimization", "Optimization", "Mathematics", "method"),
      p("sgd", "Stochastic Gradient Descent", "Machine Learning", "method"),
      p("adam", "Adam", "Deep Learning", "method"),
      p("normalization", "Normalization", "Deep Learning", "method"),
      p("dropout", "Dropout", "Deep Learning", "method"),
      p("residual-connections", "Residual Connections", "Deep Learning", "method"),
      p("cnn", "CNN", "Computer Vision", "specialization"),
      p("rnn", "RNN", "Deep Learning", "specialization"),
      p("transformer", "Transformer", "LLMs", "specialization")
    ]
  },
  {
    id: "journey-computer-vision",
    name: "Computer Vision Path",
    description: "From image classification foundations to advanced detection and segmentation.",
    tags: [
      "intermediate",
      "computer-vision",
      "detection",
      "segmentation"
    ],
    steps: [
      p("linear-algebra", "Linear Algebra", "Mathematics", "foundation"),
      p("neural-network", "Neural Network", "Deep Learning", "foundation"),
      p("cnn", "CNN", "Computer Vision", "method"),
      p("image-classification", "Image Classification", "Computer Vision", "method"),
      p("object-detection", "Object Detection", "Computer Vision", "method"),
      p("segmentation", "Segmentation", "Computer Vision", "specialization"),
      p("yolo", "YOLO", "Computer Vision", "application"),
      p("tracking", "Tracking", "Computer Vision", "specialization"),
      p("pose-estimation", "Pose Estimation", "Computer Vision", "specialization"),
      p("depth-estimation", "Depth Estimation", "Computer Vision", "specialization")
    ]
  },
  {
    id: "journey-nlp-transformers",
    name: "NLP & Transformers",
    description: "From tokenization and embeddings through transformer architectures to modern NLP.",
    tags: [
      "advanced",
      "nlp",
      "transformers",
      "embeddings"
    ],
    steps: [
      p("tokenization", "Tokenization", "NLP", "foundation"),
      p("embedding", "Embedding", "NLP", "foundation"),
      p("word2vec", "Word2Vec", "NLP", "method"),
      p("attention", "Attention", "Deep Learning", "method"),
      p("transformer", "Transformer", "LLMs", "method"),
      p("bert", "BERT", "NLP", "application"),
      p("gpt", "GPT", "LLMs", "application"),
      p("t5", "T5", "NLP", "application"),
      p("semantic-search", "Semantic Search", "NLP", "application"),
      p("rag", "RAG", "LLMs", "application")
    ]
  },
  {
    id: "journey-llm-engineering",
    name: "LLM Engineering",
    description: "From transformer foundations through fine-tuning and alignment to production deployment.",
    tags: [
      "advanced",
      "llms",
      "fine-tuning",
      "deployment"
    ],
    steps: [
      p("transformer", "Transformer", "LLMs", "foundation"),
      p("gpt", "GPT", "LLMs", "foundation"),
      p("prompt-engineering", "Prompt Engineering", "LLMs", "method"),
      p("fine-tuning", "Fine Tuning", "LLM Engineering", "method"),
      p("lora", "LoRA", "LLM Engineering", "method"),
      p("qlora", "QLoRA", "LLM Engineering", "method"),
      p("rlhf", "RLHF", "LLM Engineering", "method"),
      p("dpo", "DPO", "LLM Engineering", "method"),
      p("llm-inference", "LLM Inference", "LLM Engineering", "application"),
      p("quantization", "Quantization", "LLM Engineering", "method"),
      p("kv-cache", "KV Cache", "LLM Engineering", "application")
    ]
  },
  {
    id: "journey-agents",
    name: "AI Agents & Autonomy",
    description: "From reasoning fundamentals through tool use to multi-agent orchestration.",
    tags: [
      "advanced",
      "agents",
      "reasoning",
      "orchestration"
    ],
    steps: [
      p("reasoning", "Reasoning", "Agents", "foundation"),
      p("planning", "Planning", "Agents", "method"),
      p("agent-memory", "Agent Memory", "Agents", "method"),
      p("tool-use", "Tool Use", "Agents", "method"),
      p("reflection", "Reflection", "Agents", "method"),
      p("agent-workflow", "Agent Workflow", "Agents", "application"),
      p("mcp", "MCP", "Agents", "application"),
      p("multi-agent", "Multi-Agent System", "Agents", "application"),
      p("autonomy", "Autonomy", "Agents", "specialization")
    ]
  },
  {
    id: "journey-mlops",
    name: "MLOps & Production",
    description: "From experiment tracking through deployment to production monitoring.",
    tags: [
      "intermediate",
      "mlops",
      "deployment",
      "monitoring"
    ],
    steps: [
      p("python", "Python", "Programming", "foundation"),
      p("versioning", "Versioning", "MLOps", "foundation"),
      p("experiment-tracking", "Experiment Tracking", "MLOps", "method"),
      p("mlflow", "MLflow", "MLOps", "application"),
      p("model-registry", "Model Registry", "MLOps", "application"),
      p("deployment", "Deployment", "MLOps", "method"),
      p("serving", "Serving", "MLOps", "application"),
      p("monitoring", "Monitoring", "MLOps", "method"),
      p("data-drift", "Data Drift", "MLOps", "specialization"),
      p("cicd", "CI/CD", "MLOps", "application")
    ]
  },
  {
    id: "journey-practical-engineering",
    name: "Practical AI Engineering",
    description: "From programming foundations through frameworks to production systems.",
    tags: [
      "beginner",
      "programming",
      "frameworks",
      "practical"
    ],
    steps: [
      p("python", "Python", "Programming", "foundation"),
      p("data-structures", "Data Structures", "Programming", "foundation"),
      p("algorithmic-complexity", "Algorithmic Complexity", "Programming", "foundation"),
      p("pytorch", "PyTorch", "Programming", "method"),
      p("tensorflow", "TensorFlow", "Programming", "method"),
      p("scikit-learn", "scikit-learn", "Machine Learning", "application"),
      p("cuda", "CUDA", "Programming", "specialization"),
      p("deployment", "Deployment", "MLOps", "application")
    ]
  }
];
function p(e, t, n, i) {
  return {
    nodeId: e,
    label: t,
    domain: n,
    role: i,
    isOptional: !1
  };
}
function Ar(e) {
  return Le.filter((t) => t.steps.some((n) => n.nodeId === e));
}
function kr(e) {
  const t = Ar(e);
  return t.length === 0 ? null : t.reduce((n, i) => {
    const r = n.steps.findIndex((o) => o.nodeId === e), a = i.steps.findIndex((o) => o.nodeId === e), s = Math.min(r, n.steps.length - 1 - r);
    return Math.min(a, i.steps.length - 1 - a) < s ? i : n;
  });
}
function ze() {
  return {
    selectedNodeId: null,
    breadcrumbs: [],
    activeJourneyId: null,
    completedJourneySteps: /* @__PURE__ */ new Set(),
    visitedNodes: /* @__PURE__ */ new Set()
  };
}
function dt(e, t, n, i) {
  if (!t) return {
    ...e,
    selectedNodeId: null
  };
  const r = [...e.breadcrumbs];
  e.selectedNodeId && e.selectedNodeId !== t && (r.push({
    nodeId: e.selectedNodeId,
    label: n,
    domain: i,
    timestamp: Date.now(),
    selectionIndex: r.length
  }), r.length > 20 && r.shift());
  const a = new Set(e.visitedNodes);
  a.add(t);
  const s = new Set(e.completedJourneySteps);
  for (const o of Le) {
    const c = o.steps.findIndex((l) => l.nodeId === t);
    if (c >= 0) for (let l = 0; l <= c; l++) s.add(o.steps[l].nodeId);
  }
  return {
    selectedNodeId: t,
    breadcrumbs: r,
    activeJourneyId: kr(t)?.id ?? e.activeJourneyId,
    completedJourneySteps: s,
    visitedNodes: a
  };
}
function Dr(e, t) {
  return e.slice(-t);
}
var P = null, W = null, Y = null, U = null, ae = null;
function Tr(e = {}) {
  const t = e.root ?? document;
  let n = null, i = null, r = null, a = null, s = ze(), o = null, c = null, l = null;
  function d() {
    return t.querySelector("[data-knowledge-graph-root]");
  }
  async function u() {
    const b = d();
    if (!b) {
      g();
      return;
    }
    b === i && n || (g(), i = b, b.dataset.atlasController = "nv-700", b.classList.add("nv-atlas-browser-host"), n = Mr({
      host: Er(b),
      storage: xr(window.localStorage)
    }), n.start(), s = ze(), k(b), $e(null, n, s), M());
  }
  function h() {
    window.addEventListener("nv:routerendered", u), typeof document < "u" && document.addEventListener("visibilitychange", v), u();
  }
  function g() {
    n?.destroy(), n = null, x(), Gr(), typeof document < "u" && document.removeEventListener("visibilitychange", v), i && (delete i.dataset.atlasController, i.classList.remove("nv-atlas-browser-host")), i = null, M();
  }
  function v() {
    document.hidden && n && n.snapshot();
  }
  function f() {
    return n?.snapshot() ?? null;
  }
  function M() {
    window.NeuralVerse = window.NeuralVerse ?? {}, window.NeuralVerse.atlasPageController = n;
  }
  function k(b) {
    x(), r = (S) => {
      S.target instanceof Element && S.target.closest("[data-atlas-reset-view]") && n?.resetViewport();
    }, a = (S) => {
      const N = (S instanceof CustomEvent ? S.detail : null)?.selected ?? null;
      if (N?.id && N.label) {
        const j = typeof N.metadata?.domain == "string" ? N.metadata.domain : "Unclassified";
        s = dt(s, N.id, N.label, j);
      } else N || (s = dt(s, null, "", ""));
      $e(N, n, s), kt(N);
    }, b.addEventListener("click", r), window.addEventListener("nv:atlas-selection", a), b.addEventListener("click", je), b.addEventListener("click", Ve), b.addEventListener("keydown", mt);
    const C = b.querySelector("canvas");
    C && (o = (S) => Ur(S, b), c = () => Fe(), C.addEventListener("mousemove", o), C.addEventListener("mouseleave", c)), C && (l = (S) => Wr(S, b, n), C.addEventListener("keydown", l)), Kr(b), C && (U = (S) => _r(S, b, n), C.addEventListener("touchstart", U, { passive: !1 }), C.addEventListener("touchmove", U, { passive: !1 }), C.addEventListener("touchend", U), C.addEventListener("touchcancel", U));
  }
  function x() {
    if (r && i && i.removeEventListener("click", r), a && window.removeEventListener("nv:atlas-selection", a), i && (i.removeEventListener("click", je), i.removeEventListener("click", Ve), i.removeEventListener("keydown", mt)), o || c) {
      const b = i?.querySelector("canvas");
      b && (o && b.removeEventListener("mousemove", o), c && b.removeEventListener("mouseleave", c));
    }
    if (l) {
      const b = i?.querySelector("canvas");
      b && b.removeEventListener("keydown", l);
    }
    if (U) {
      const b = i?.querySelector("canvas");
      b && (b.removeEventListener("touchstart", U), b.removeEventListener("touchmove", U), b.removeEventListener("touchend", U), b.removeEventListener("touchcancel", U));
    }
    Fe(), Tt(), r = null, a = null, o = null, c = null, l = null, ae = null;
  }
  return {
    init: h,
    renderCurrentRoute: u,
    destroy: g,
    snapshot: f
  };
}
function $e(e, t, n) {
  const i = document.querySelector(".nv-context-panel");
  if (!i) return;
  const r = i.querySelector(".nv-context-title");
  r && (r.textContent = "Atlas · Exploration");
  const a = i.querySelector(".nv-workspace-context");
  if (!a) return;
  let s = a.querySelector("[data-atlas-context-readout]");
  s || (s = document.createElement("div"), s.dataset.atlasContextReadout = "true", s.className = "nv-atlas-context-readout", s.setAttribute("role", "region"), s.setAttribute("aria-live", "polite"), s.setAttribute("aria-label", "Atlas exploration details"), a.append(s));
  const o = a.querySelector("[data-context-onboarding]"), c = a.querySelector("[data-context-details]");
  if (c && (c.hidden = !0), !e) {
    o && (o.hidden = !1, o.innerHTML = Or()), s.hidden = !0, s.textContent = "";
    return;
  }
  o && (o.hidden = !0), s.hidden = !1, s.innerHTML = "";
  const l = t?.snapshot() ?? null, d = zr(e, l, n ?? ze());
  Br(s, e, l, d);
}
function Nr(e, t, n, i, r, a, s) {
  if (e.kind === "region") return `${ce(i ?? "")} constellation groups ${e.relationships?.length ?? 0} stars. Explore its landmarks, bridges, and stellar corridors to understand the constellation.`;
  const o = Ze(e.kind, t, n), c = s === null ? "key" : s > 0.85 ? "foundational" : s > 0.6 ? "structural" : "supporting";
  return a > 0 && r > 0 ? `${o}. Connects ${r} prerequisite${r === 1 ? "" : "s"} and unlocks ${a} downstream star${a === 1 ? "" : "s"}. A ${c} star in the ${i ? ce(i) : "Atlas"} constellation.` : a > 0 ? `${o}. Unlocks ${a} downstream star${a === 1 ? "" : "s"} with no prerequisites. A ${c} entry point for the ${i ? ce(i) : "Atlas"} constellation.` : r > 0 ? `${o}. Requires ${r} prerequisite${r === 1 ? "" : "s"}. A ${c} destination after exploring its dependencies.` : `${o}. An isolated star within its constellation.`;
}
function ut(e, t, n, i) {
  const r = document.createElement("li"), a = document.createElement("span");
  a.className = "nv-atlas-context-relationship-type", a.textContent = ee(e || i);
  const s = document.createElement("span");
  s.className = `nv-atlas-context-relationship-category nv-atlas-context-category-${t}`, s.textContent = ee(t);
  const o = document.createElement("span");
  return o.className = "nv-atlas-context-relationship-weight", o.textContent = `${Math.round(n * 100)}%`, r.append(a, s, o), r;
}
function Rr(e, t) {
  const n = [];
  for (const i of e) n.push({
    label: ee(i.relationshipType || "explore further"),
    weight: i.importance,
    category: i.relationshipCategory
  });
  for (const i of t) n.push({
    label: ee(i.relationshipType || "trace back"),
    weight: i.importance,
    category: i.relationshipCategory
  });
  return n.sort((i, r) => r.weight - i.weight).slice(0, 3).map((i) => ({
    label: `${i.label}`,
    weight: i.weight,
    category: i.category
  }));
}
function Pr(e) {
  const t = document.createElement("li");
  t.className = "nv-atlas-context-suggestion";
  const n = document.createElement("span");
  n.className = "nv-atlas-context-suggestion-label", n.textContent = e.label;
  const i = document.createElement("span");
  return i.className = `nv-atlas-context-suggestion-meta nv-atlas-context-category-${e.category}`, i.textContent = `${Math.round(e.weight * 100)}%`, t.append(n, i), t;
}
function V(e, t, n) {
  const i = document.createElement("dt");
  i.textContent = t;
  const r = document.createElement("dd");
  r.textContent = n, e.append(i, r);
}
function Or() {
  return `
    <p class="nv-atlas-onboarding-intro">Explore Atlas by selecting a constellation, landmark, bridge, or star.</p>
    <div class="nv-atlas-onboarding-journeys">
      <h4>Guided Journeys</h4>
      <p class="nv-atlas-onboarding-hint">Follow a curated path through the celestial knowledge chart.</p>
      <ul class="nv-atlas-onboarding-journey-list">
        <li data-journey="introduction" tabindex="0" role="button">Introduction to AI Engineering</li>
        <li data-journey="deep-learning" tabindex="0" role="button">Deep Learning Fundamentals</li>
        <li data-journey="computer-vision" tabindex="0" role="button">Computer Vision Path</li>
        <li data-journey="nlp" tabindex="0" role="button">NLP & Transformers</li>
        <li data-journey="llm" tabindex="0" role="button">LLM Engineering</li>
        <li data-journey="agents" tabindex="0" role="button">AI Agents & Autonomy</li>
        <li data-journey="mlops" tabindex="0" role="button">MLOps & Production</li>
      </ul>
    </div>
  `;
}
function zr(e, t, n) {
  if (!e.id) return null;
  const i = Array.isArray(e.relationships) ? e.relationships : [], r = i.filter((g) => g.target === e.id), a = i.filter((g) => g.source === e.id), s = e.metadata ?? {}, o = typeof s.family == "string" ? s.family : null, c = typeof s.type == "string" ? s.type : null, l = typeof s.domain == "string" ? s.domain : null, d = typeof s.importance == "number" ? s.importance : null, u = [];
  for (const g of a.slice(0, 4)) u.push({
    nodeId: g.target,
    label: ee(g.relationshipType),
    domain: l ?? "Unclassified",
    score: g.importance,
    signals: {
      semanticProximity: 0.7,
      dependencyRelevance: g.importance,
      bridgeImportance: 0.3,
      hubCentrality: 0.5,
      curriculumProgression: 0.6,
      novelty: 0.5
    },
    reason: "outgoing relationship"
  });
  const h = $r(e.id, n);
  return {
    currentPosition: h,
    candidates: u,
    landmark: {
      nodeId: e.id,
      label: e.label || e.id || "",
      scientificRole: Ze(e.kind, o, c),
      historicalImportance: d !== null ? d > 0.85 ? "Foundational concept" : d > 0.6 ? "Structurally significant" : "Supporting concept" : "Knowledge entity",
      structuralImportance: `Connects ${r.length} prerequisites to ${a.length} downstream concepts`,
      dependencyImportance: `${r.length} dependencies · ${a.length} dependents`,
      domainContext: l ?? "Unclassified"
    },
    breadcrumbs: n.breadcrumbs,
    guidedMessage: h ? {
      text: `Exploring ${h.journey.name} · Step ${h.currentStepIndex + 1} of ${h.journey.steps.length}`,
      kind: "journey",
      priority: 8
    } : null,
    regionContext: l ? {
      domain: l,
      memberCount: i.length,
      storyRole: "method",
      neighborRegions: [],
      capitalLabel: null,
      hubLabels: [],
      bridgeLabels: []
    } : null
  };
}
function $r(e, t) {
  for (const n of Le) {
    const i = n.steps.findIndex((r) => r.nodeId === e);
    if (i >= 0) {
      const r = n.steps.filter((a) => t.completedJourneySteps.has(a.nodeId)).map((a) => a.nodeId);
      return {
        journey: n,
        currentStepIndex: i,
        completedSteps: r,
        progress: r.length / n.steps.length,
        nextStep: i < n.steps.length - 1 ? n.steps[i + 1] : null,
        previousStep: i > 0 ? n.steps[i - 1] : null
      };
    }
  }
  return null;
}
function Br(e, t, n, i) {
  const r = Array.isArray(t.relationships) ? t.relationships : [], a = r.filter((w) => w.target === t.id), s = r.filter((w) => w.source === t.id), o = t.metadata ?? {}, c = typeof o.family == "string" ? o.family : null, l = typeof o.type == "string" ? o.type : null, d = typeof o.domain == "string" ? o.domain : null, u = typeof o.importance == "number" ? o.importance : null, h = typeof t.kind == "string" ? t.kind : "entity", g = Ze(h, c, l), v = document.createElement("header");
  v.className = "nv-atlas-context-header";
  const f = document.createElement("p");
  f.className = "nv-atlas-context-eyebrow", f.textContent = h === "region" ? "CONSTELLATION" : "STAR";
  const M = document.createElement("h3");
  if (M.className = "nv-atlas-context-heading", M.textContent = t.label || t.id || "Selected Atlas entity", v.append(f, M), g) {
    const w = document.createElement("p");
    w.className = "nv-atlas-context-role", w.textContent = g, v.append(w);
  }
  if (e.append(v), i?.guidedMessage) {
    const w = document.createElement("div");
    w.className = "nv-atlas-context-guidance-banner", w.textContent = i.guidedMessage.text, e.append(w);
  }
  if (i?.currentPosition) {
    const w = jr(i.currentPosition);
    e.append(w);
  }
  const k = document.createElement("section");
  k.className = "nv-atlas-context-why";
  const x = document.createElement("h4");
  x.textContent = "Why it matters", k.append(x);
  const b = document.createElement("p");
  if (b.className = "nv-atlas-context-why-copy", b.textContent = Nr(t, c, l, d, a.length, s.length, u), k.append(b), e.append(k), i?.landmark) {
    const w = Vr(i.landmark);
    e.append(w);
  }
  const C = document.createElement("section");
  if (C.className = "nv-atlas-context-guidance", s.length) {
    const w = document.createElement("div");
    w.className = "nv-atlas-context-group";
    const z = document.createElement("h5");
    z.textContent = "What it unlocks", w.append(z);
    const $ = document.createElement("ul");
    for (const D of s.slice(0, 4)) $.append(ut(D.relationshipType, D.relationshipCategory, D.importance, "enables"));
    if (s.length > 4) {
      const D = document.createElement("li");
      D.className = "nv-atlas-context-overflow", D.textContent = `+${s.length - 4} more destinations`, $.append(D);
    }
    w.append($), C.append(w);
  }
  if (a.length) {
    const w = document.createElement("div");
    w.className = "nv-atlas-context-group";
    const z = document.createElement("h5");
    z.textContent = "What depends on it", w.append(z);
    const $ = document.createElement("ul");
    for (const D of a.slice(0, 4)) $.append(ut(D.relationshipType, D.relationshipCategory, D.importance, "depends on"));
    if (a.length > 4) {
      const D = document.createElement("li");
      D.className = "nv-atlas-context-overflow", D.textContent = `+${a.length - 4} more prerequisites`, $.append(D);
    }
    w.append($), C.append(w);
  }
  if (i?.candidates && i.candidates.length > 0) {
    const w = document.createElement("div");
    w.className = "nv-atlas-context-group nv-atlas-context-suggestions";
    const z = document.createElement("h5");
    z.textContent = "Recommended next", w.append(z);
    const $ = document.createElement("ol");
    for (const D of i.candidates.slice(0, 3)) $.append(Fr(D));
    w.append($), C.append(w);
  } else {
    const w = Rr(s, a);
    if (w.length) {
      const z = document.createElement("div");
      z.className = "nv-atlas-context-group nv-atlas-context-suggestions";
      const $ = document.createElement("h5");
      $.textContent = "Suggested next", z.append($);
      const D = document.createElement("ol");
      for (const Nt of w.slice(0, 3)) D.append(Pr(Nt));
      z.append(D), C.append(z);
    }
  }
  if (e.append(C), i?.breadcrumbs && i.breadcrumbs.length > 0) {
    const w = qr(i.breadcrumbs);
    e.append(w);
  }
  const S = document.createElement("dl");
  S.className = "nv-atlas-context-identity", V(S, "Entity family", c ? Be(c) : "—"), V(S, "Entity type", l ? ee(l) : "—"), V(S, "Constellation", d ? ce(d) : "Unclassified"), V(S, "Atlas importance", u === null ? "—" : `${Math.round(u * 100)}%`);
  const N = typeof o.hierarchyLevel == "number" ? o.hierarchyLevel : null;
  V(S, "Hierarchy layer", N === null ? "—" : `Layer ${N}`), e.append(S);
  const j = document.createElement("section");
  j.className = "nv-atlas-context-cartography";
  const _ = document.createElement("h4");
  _.textContent = "Stellar identity", j.append(_);
  const H = document.createElement("dl"), F = Array.isArray(t.lineage) ? t.lineage : [];
  if (F.length === 0) V(H, "Atlas tag", h);
  else for (const w of F) {
    const [z, $] = w.includes(":") ? w.split(/:(.+)/) : [w, ""];
    V(H, z ? Be(z.replace(/-/g, " ")) : "Tag", $ ? ee($) : "—");
  }
  const A = n?.render?.metrics;
  A && V(H, "Atlas chart", `${A.visibleNodes ?? 0} stars · ${A.visibleEdges ?? 0} corridors · ${A.visibleLabels ?? 0} labels`), j.append(H), e.append(j);
}
function jr(e) {
  const t = document.createElement("section");
  t.className = "nv-atlas-context-journey";
  const n = document.createElement("div");
  n.className = "nv-atlas-journey-header";
  const i = document.createElement("span");
  i.className = "nv-atlas-journey-label", i.textContent = e.journey.name;
  const r = document.createElement("span");
  r.className = "nv-atlas-journey-progress", r.textContent = `Step ${e.currentStepIndex + 1} of ${e.journey.steps.length}`, n.append(i, r), t.append(n);
  const a = document.createElement("div");
  a.className = "nv-atlas-journey-bar", a.setAttribute("role", "progressbar"), a.setAttribute("aria-valuenow", String(Math.round(e.progress * 100))), a.setAttribute("aria-valuemin", "0"), a.setAttribute("aria-valuemax", "100");
  const s = document.createElement("div");
  if (s.className = "nv-atlas-journey-bar-fill", s.style.width = `${Math.round(e.progress * 100)}%`, a.append(s), t.append(a), e.nextStep) {
    const o = document.createElement("p");
    o.className = "nv-atlas-journey-next", o.textContent = `Next: ${e.nextStep.label}`, t.append(o);
  }
  return t;
}
function Vr(e) {
  const t = document.createElement("section");
  t.className = "nv-atlas-context-landmark";
  const n = document.createElement("h4");
  n.textContent = "Landmark Narrative", t.append(n);
  const i = document.createElement("dl");
  return i.className = "nv-atlas-landmark-items", V(i, "Scientific role", e.scientificRole), V(i, "Historical context", e.historicalImportance), V(i, "Structural position", e.structuralImportance), V(i, "Dependency role", e.dependencyImportance), t.append(i), t;
}
function Fr(e) {
  const t = document.createElement("li");
  t.className = "nv-atlas-context-candidate", t.dataset.candidateNodeId = e.nodeId, t.tabIndex = 0, t.setAttribute("role", "button"), t.setAttribute("aria-label", `Navigate to ${e.label}`);
  const n = document.createElement("span");
  n.className = "nv-atlas-context-candidate-label", n.textContent = e.label;
  const i = document.createElement("span");
  i.className = "nv-atlas-context-candidate-reason", i.textContent = e.reason;
  const r = document.createElement("span");
  return r.className = "nv-atlas-context-candidate-score", r.textContent = `${Math.round(e.score * 100)}%`, t.append(n, i, r), t;
}
function qr(e) {
  const t = document.createElement("section");
  t.className = "nv-atlas-context-breadcrumbs";
  const n = document.createElement("h4");
  n.textContent = "Exploration path", t.append(n);
  const i = document.createElement("ol");
  i.className = "nv-atlas-breadcrumb-trail";
  const r = Dr(e, 8);
  for (const s of r) {
    const o = document.createElement("li");
    o.className = "nv-atlas-breadcrumb-item", o.textContent = s.label, i.append(o);
  }
  t.append(i);
  const a = new Set(r.map((s) => s.domain)).size;
  if (a > 1) {
    const s = document.createElement("p");
    s.className = "nv-atlas-breadcrumb-meta", s.textContent = `${a} constellations explored · ${r.length} steps`, t.append(s);
  }
  return t;
}
function Ze(e, t, n) {
  return e === "region" ? "Constellation" : t === "scientific" && (n === "theory" || n === "principle" || n === "law") ? "Theoretical foundation" : t === "scientific" && (n === "method" || n === "algorithm") ? "Scientific method" : t === "engineering" && (n === "library" || n === "framework" || n === "tool") ? "Engineering instrument" : t === "evidence" ? "Empirical evidence" : t === "context" ? "Contextual constraint" : "Knowledge star";
}
function Be(e) {
  return e && e.charAt(0).toUpperCase() + e.slice(1);
}
function ee(e) {
  return e.replace(/[_-]+/g, " ").split(" ").filter(Boolean).map((t) => t.toLowerCase() === t ? t : t.toLowerCase()).join(" ");
}
function ce(e) {
  return e.split(" ").map((t) => t.length <= 3 ? t.toUpperCase() : Be(t.toLowerCase())).join(" ");
}
function kt(e) {
  const t = document.querySelector("[data-atlas-orientation-value]");
  if (!t) return;
  if (!e) {
    t.textContent = "the celestial knowledge chart", t.dataset.atlasOrientationState = "overview";
    return;
  }
  if ((e.kind ?? "entity") === "region") {
    t.textContent = `the ${ce(typeof e.metadata?.domain == "string" ? e.metadata.domain : "Unclassified")} constellation`, t.dataset.atlasOrientationState = "constellation";
    return;
  }
  const n = typeof e.metadata?.family == "string" ? e.metadata.family : "scientific";
  t.textContent = `${e.label || e.id || "selected entity"} · ${n}`, t.dataset.atlasOrientationState = "entity";
}
function mt(e) {
  if (e.key !== "Enter") return;
  const t = e.target instanceof Element ? e.target : null;
  t && (t.closest("[data-journey]") ? je(e) : t.closest("[data-candidate-node-id]") && Ve(e));
}
function je(e) {
  const t = e.target instanceof Element ? e.target.closest("[data-journey]") : null;
  if (!t) return;
  e.preventDefault();
  const n = t.getAttribute("data-journey");
  if (!n) return;
  const i = Le.find((a) => a.id.endsWith(n) || a.id === n);
  if (!i || i.steps.length === 0) return;
  const r = i.steps[0].nodeId;
  le(r);
}
function Ve(e) {
  const t = e.target instanceof Element ? e.target.closest("[data-candidate-node-id]") : null;
  if (!t) return;
  e.preventDefault();
  const n = t.getAttribute("data-candidate-node-id");
  n && le(n);
}
function le(e) {
  const t = document.querySelector('[data-atlas-controller="nv-700"] canvas');
  if (!t) return;
  const n = window.NeuralVerse?.atlasPageController ?? null;
  if (!n) return;
  const i = n.payloadRef ?? null;
  if (!i?.nodes || !i?.viewport) return;
  const r = i.nodes.find((c) => c.entityId === e || c.visualId === e);
  if (!r?.position) return;
  const a = Dt(r, t, n);
  if (!a) return;
  const s = a.x, o = a.y;
  t.dispatchEvent(new PointerEvent("pointerdown", {
    clientX: s,
    clientY: o,
    bubbles: !0,
    cancelable: !0
  })), t.dispatchEvent(new PointerEvent("pointerup", {
    clientX: s,
    clientY: o,
    bubbles: !0,
    cancelable: !0
  })), t.dispatchEvent(new MouseEvent("click", {
    clientX: s,
    clientY: o,
    bubbles: !0,
    cancelable: !0
  }));
}
function _r(e, t, n) {
  if (e.touches.length === 2) {
    e.preventDefault();
    const i = e.touches[0].clientX - e.touches[1].clientX, r = e.touches[0].clientY - e.touches[1].clientY, a = Math.sqrt(i * i + r * r);
    if (ae !== null) {
      const s = ae - a, o = (e.touches[0].clientX + e.touches[1].clientX) / 2, c = (e.touches[0].clientY + e.touches[1].clientY) / 2, l = t.querySelector("canvas");
      if (l) {
        l.getBoundingClientRect();
        const d = new WheelEvent("wheel", {
          deltaY: s * 2,
          clientX: o,
          clientY: c,
          bubbles: !0,
          cancelable: !0
        });
        l.dispatchEvent(d);
      }
    }
    ae = a;
  } else ae = null;
}
function Hr(e, t) {
  const n = t.querySelector("canvas");
  if (!n) return null;
  const i = window.NeuralVerse?.atlasPageController ?? null;
  if (!i) return null;
  const r = i.payloadRef ?? null;
  if (!r?.nodes || !r?.viewport) return null;
  const a = 18;
  let s = null, o = 1 / 0;
  for (const c of r.nodes) {
    if (!c?.position) continue;
    const l = Dt(c, n, i);
    if (!l) continue;
    const d = l.x, u = l.y, h = e.clientX - d, g = e.clientY - u, v = Math.sqrt(h * h + g * g);
    v < a && v < o && (o = v, s = {
      nodeId: c.entityId,
      label: c.label || c.entityId,
      domain: c.domain || "",
      screenX: d,
      screenY: u
    });
  }
  return s;
}
function Dt(e, t, n) {
  if (!e?.position) return null;
  const i = n?.snapshot?.()?.interaction?.viewport ?? n?.payloadRef?.viewport ?? null;
  if (!i?.visibleBounds) return null;
  const r = t.getBoundingClientRect(), a = Math.min(r.width / i.visibleBounds.width, r.height / i.visibleBounds.height), s = (r.width - i.visibleBounds.width * a) / 2, o = (r.height - i.visibleBounds.height * a) / 2;
  return {
    x: r.left + s + (e.position.x - i.visibleBounds.x) * a,
    y: r.top + o + (e.position.y - i.visibleBounds.y) * a
  };
}
function Ur(e, t) {
  W !== null && cancelAnimationFrame(W), W = requestAnimationFrame(() => {
    const n = Hr(e, t);
    if (!n) {
      Fe();
      return;
    }
    const i = e.clientX, r = e.clientY;
    Y !== null && clearTimeout(Y), Y = setTimeout(() => {
      Yr(n.label, n.domain, i, r), Y = null;
    }, 90);
  });
}
function Yr(e, t, n, i) {
  P || (P = document.createElement("div"), P.className = "nv-atlas-hover-tooltip", P.setAttribute("role", "tooltip"), P.setAttribute("aria-hidden", "true"), document.body.append(P)), P.innerHTML = "";
  const r = document.createElement("span");
  if (r.className = "nv-atlas-hover-tooltip-label", r.textContent = e, P.append(r), t) {
    const a = document.createElement("span");
    a.className = "nv-atlas-hover-tooltip-domain", a.textContent = t, P.append(a);
  }
  P.style.left = `${n + 12}px`, P.style.top = `${i - 8}px`, P.dataset.visible = "true";
}
function Fe() {
  Y !== null && (clearTimeout(Y), Y = null), W !== null && (cancelAnimationFrame(W), W = null), P && (P.dataset.visible = "false");
}
function Gr() {
  Y !== null && (clearTimeout(Y), Y = null), W !== null && (cancelAnimationFrame(W), W = null), P && (P.remove(), P = null);
}
function Wr(e, t, n) {
  if (e.key === "Escape") {
    n?.clearSelection?.(), $e(null, n, void 0), kt(null), e.preventDefault();
    return;
  }
  if (e.key !== "ArrowUp" && e.key !== "ArrowDown" && e.key !== "ArrowLeft" && e.key !== "ArrowRight" && e.key !== "Enter") return;
  if (e.key === "Enter") {
    const c = n?.snapshot?.()?.interaction?.inspector?.selected;
    c?.id && le(c.id), e.preventDefault();
    return;
  }
  const i = n?.snapshot?.()?.interaction?.inspector?.selected?.id ?? null, r = n?.payloadRef ?? null;
  if (!r?.nodes) return;
  const a = r.nodes.map((c) => c.entityId).filter(Boolean);
  if (a.length === 0) return;
  if (!i) {
    le(a[0]), e.preventDefault();
    return;
  }
  const s = a.indexOf(i);
  let o;
  switch (e.key) {
    case "ArrowDown":
    case "ArrowRight":
      o = s < a.length - 1 ? s + 1 : 0;
      break;
    case "ArrowUp":
    case "ArrowLeft":
      o = s > 0 ? s - 1 : a.length - 1;
      break;
    default:
      return;
  }
  le(a[o]), e.preventDefault();
}
function Kr(e) {
  Tt();
  const t = document.createElement("a");
  t.className = "nv-atlas-skip-link", t.href = "#atlas-context-panel", t.textContent = "Skip graph, go to context panel";
  const n = document.querySelector(".nv-context-panel");
  n && (n.id || (n.id = "atlas-context-panel"), t.href = `#${n.id}`), e.prepend(t);
}
function Tt() {
  const e = document.querySelector(".nv-atlas-skip-link");
  e && e.remove();
}
window.NeuralVerse = window.NeuralVerse ?? {};
window.NeuralVerse.createBrowserAtlasController = Tr;
export {
  Tr as createBrowserAtlasController
};
