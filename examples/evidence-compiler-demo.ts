import { InMemoryReferenceRepository } from "../src/retrieval/reference/InMemoryReferenceRepository.ts";
import { ReferenceRegistry } from "../src/retrieval/reference/ReferenceRegistry.ts";
import { InMemoryRelationshipRepository } from "../src/retrieval/relationship/InMemoryRelationshipRepository.ts";
import { RelationshipGraph } from "../src/retrieval/relationship/RelationshipGraph.ts";
import { InMemoryRetrievalIndexRepository } from "../src/retrieval/index/InMemoryRetrievalIndexRepository.ts";
import { RetrievalIndexService } from "../src/retrieval/index/RetrievalIndexService.ts";
import { EvidenceCompiler } from "../src/retrieval/evidence/EvidenceCompiler.ts";

async function runDemo() {
  console.log("==================================================");
  console.log("NEURALVERSE EVIDENCE COMPILER RUNTIME DEMO");
  console.log("==================================================\n");

  // Initialize all underlying systems
  const refRepository = new InMemoryReferenceRepository();
  const referenceRegistry = new ReferenceRegistry(refRepository);

  const relRepository = new InMemoryRelationshipRepository();
  const graph = new RelationshipGraph(relRepository, referenceRegistry);

  const indexRepository = new InMemoryRetrievalIndexRepository();
  const indexService = new RetrievalIndexService(indexRepository, referenceRegistry);

  // Initialize Evidence Compiler
  const compiler = new EvidenceCompiler(referenceRegistry, indexService, graph);

  // 1. Register references
  console.log("--- 1. Registering References ---");
  await referenceRegistry.registerReference({
    id: "ref-transformer",
    title: "Attention Is All You Need",
    type: "paper",
    source: "https://arxiv.org/abs/1706.03762"
  });
  await referenceRegistry.registerReference({
    id: "ref-bert",
    title: "BERT: Bidirectional Transformers",
    type: "paper",
    source: "https://arxiv.org/abs/1810.04805"
  });
  await referenceRegistry.registerReference({
    id: "ref-pytorch",
    title: "PyTorch Deep Learning Framework",
    type: "repository",
    source: "https://github.com/pytorch/pytorch"
  });
  console.log("Registered: 'ref-transformer', 'ref-bert', 'ref-pytorch'\n");

  // 2. Index references
  console.log("--- 2. Indexing References ---");
  await indexService.indexReference("ref-transformer", ["attention", "transformer", "neural-network", "nlp"]);
  await indexService.indexReference("ref-bert", ["bert", "transformer", "bidirectional", "nlp"]);
  await indexService.indexReference("ref-pytorch", ["pytorch", "library", "deep-learning", "python"]);
  console.log("Indexed all three references.\n");

  // 3. Create relationships
  console.log("--- 3. Creating Relationships ---");
  await graph.createRelationship({
    id: "rel-bert-transformer",
    sourceReferenceId: "ref-bert",
    targetReferenceId: "ref-transformer",
    type: "cites",
    context: "transformer architecture core",
    strength: 0.95
  });
  await graph.createRelationship({
    id: "rel-transformer-pytorch",
    sourceReferenceId: "ref-transformer",
    targetReferenceId: "ref-pytorch",
    type: "implements",
    context: "pytorch ecosystem models",
    strength: 0.8
  });
  console.log("Created: 'rel-bert-transformer', 'rel-transformer-pytorch'\n");

  // Helper function to print a compilation result
  const printCompilation = (comp: any) => {
    console.log(`Compilation ID: ${comp.id}`);
    console.log(`Mode:           ${comp.mode}`);
    console.log(`Input:          "${comp.input}"`);
    console.log(`Confidence:     ${comp.confidence.toUpperCase()}`);
    console.log("\nMatched References:");
    comp.matchedReferences.forEach((r: any) => {
      console.log(`  - [${r.status}] ${r.referenceId}: "${r.title}" (${r.type})`);
    });
    console.log("\nRelated References:");
    if (comp.relatedReferences.length === 0) {
      console.log("  - None");
    } else {
      comp.relatedReferences.forEach((r: any) => {
        console.log(`  - [${r.status}] ${r.referenceId}: "${r.title}" (${r.type})`);
      });
    }
    console.log("\nTraversed Relationships:");
    if (comp.relationships.length === 0) {
      console.log("  - None");
    } else {
      comp.relationships.forEach((rel: any) => {
        console.log(`  - ${rel.relationshipId}: ${rel.sourceReferenceId} -[${rel.type}]-> ${rel.targetReferenceId} (strength: ${rel.strength || "N/A"})`);
      });
    }
    console.log(`\nSummary:\n  ${comp.summary}\n`);
  };

  // 4. Compile evidence from query
  console.log("--- 4. Compiling Evidence From Query ('transformer') ---");
  const compQuery = await compiler.compileFromQuery("transformer");
  printCompilation(compQuery);

  // 5. Compile evidence from reference
  console.log("--- 5. Compiling Evidence From Reference ('ref-bert') ---");
  const compRef = await compiler.compileFromReference("ref-bert");
  printCompilation(compRef);

  console.log("==================================================");
  console.log("DEMO RUN COMPLETED SUCCESSFULLY");
  console.log("==================================================");
}

runDemo().catch((err) => {
  console.error("Demo failed:", err);
  process.exit(1);
});
