import { InMemoryReferenceRepository } from "../src/retrieval/reference/InMemoryReferenceRepository.ts";
import { ReferenceRegistry } from "../src/retrieval/reference/ReferenceRegistry.ts";
import { InMemoryRelationshipRepository } from "../src/retrieval/relationship/InMemoryRelationshipRepository.ts";
import { RelationshipGraph } from "../src/retrieval/relationship/RelationshipGraph.ts";

async function runDemo() {
  console.log("==================================================");
  console.log("NEURALVERSE RELATIONSHIP GRAPH RUNTIME DEMO");
  console.log("==================================================\n");

  // Initialize Reference Registry
  const refRepository = new InMemoryReferenceRepository();
  const referenceRegistry = new ReferenceRegistry(refRepository);

  // Initialize Relationship Graph
  const relRepository = new InMemoryRelationshipRepository();
  const graph = new RelationshipGraph(relRepository, referenceRegistry);

  // 1. Register references
  console.log("--- 1. Registering References ---");
  await referenceRegistry.registerReference({
    id: "arxiv-transformer",
    title: "Attention Is All You Need",
    type: "paper",
    source: "https://arxiv.org/abs/1706.03762"
  });
  await referenceRegistry.registerReference({
    id: "arxiv-bert",
    title: "BERT: Pre-training of Deep Bidirectional Transformers",
    type: "paper",
    source: "https://arxiv.org/abs/1810.04805"
  });
  await referenceRegistry.registerReference({
    id: "github-pytorch",
    title: "PyTorch Deep Learning Library",
    type: "repository",
    source: "https://github.com/pytorch/pytorch"
  });
  console.log("Registered: 'arxiv-transformer', 'arxiv-bert', 'github-pytorch'\n");

  // 2. Create relationships
  console.log("--- 2. Creating Relationships ---");
  const rel1 = await graph.createRelationship({
    id: "rel-bert-transformer",
    sourceReferenceId: "arxiv-bert",
    targetReferenceId: "arxiv-transformer",
    type: "cites",
    context: "section 3.1 architecture",
    strength: 0.95
  });
  console.log(`Created: ${rel1.id} (${rel1.sourceReferenceId} ➔ [${rel1.type}] ➔ ${rel1.targetReferenceId})`);

  const rel2 = await graph.createRelationship({
    id: "rel-bert-pytorch",
    sourceReferenceId: "arxiv-bert",
    targetReferenceId: "github-pytorch",
    type: "implements",
    context: "official codebase",
    strength: 0.8
  });
  console.log(`Created: ${rel2.id} (${rel2.sourceReferenceId} ➔ [${rel2.type}] ➔ ${rel2.targetReferenceId})`);
  console.log();

  // 3. List all relationships
  console.log("--- 3. Listing All Relationships ---");
  const allRel = await graph.listRelationships();
  allRel.forEach((rel, i) => {
    console.log(`${i + 1}. ${rel.id}: ${rel.sourceReferenceId} -[${rel.type}]-> ${rel.targetReferenceId} (strength: ${rel.strength})`);
  });
  console.log();

  // 4. List by source
  console.log("--- 4. Listing Relationships by Source ('arxiv-bert') ---");
  const bySource = await graph.listRelationshipsBySource("arxiv-bert");
  bySource.forEach((rel) => {
    console.log(`  ➔ Target: ${rel.targetReferenceId} | Type: ${rel.type}`);
  });
  console.log();

  // 5. List by target
  console.log("--- 5. Listing Relationships by Target ('github-pytorch') ---");
  const byTarget = await graph.listRelationshipsByTarget("github-pytorch");
  byTarget.forEach((rel) => {
    console.log(`  ➔ Source: ${rel.sourceReferenceId} | Type: ${rel.type}`);
  });
  console.log();

  // 6. Traverse direct connections
  console.log("--- 6. Traversing Direct Connections for 'arxiv-bert' ---");
  const direct = await graph.traverseDirectConnections("arxiv-bert");
  direct.forEach((rel) => {
    console.log(`  Connected: ${rel.sourceReferenceId} ➔ ${rel.targetReferenceId} via [${rel.type}]`);
  });
  console.log();

  // 7. Delete one relationship
  console.log("--- 7. Deleting Relationship 'rel-bert-pytorch' ---");
  await graph.deleteRelationship("rel-bert-pytorch");
  console.log("Deleted successfully.\n");

  // 8. Show final state
  console.log("--- 8. Final Graph State ---");
  const finalRel = await graph.listRelationships();
  if (finalRel.length === 0) {
    console.log("  (Graph is empty)");
  } else {
    finalRel.forEach((rel) => {
      console.log(`  ${rel.id}: ${rel.sourceReferenceId} -[${rel.type}]-> ${rel.targetReferenceId}`);
    });
  }
  console.log("\n==================================================");
  console.log("DEMO RUN COMPLETED SUCCESSFULLY");
  console.log("==================================================");
}

runDemo().catch((err) => {
  console.error("Demo failed:", err);
  process.exit(1);
});
