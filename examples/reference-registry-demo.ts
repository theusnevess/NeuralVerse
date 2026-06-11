import { InMemoryReferenceRepository } from "../src/retrieval/reference/InMemoryReferenceRepository.ts";
import { ReferenceRegistry } from "../src/retrieval/reference/ReferenceRegistry.ts";

async function runDemo() {
  console.log("==================================================");
  console.log("NEURALVERSE REFERENCE REGISTRY RUNTIME DEMO");
  console.log("==================================================\n");

  // Initialize
  const repository = new InMemoryReferenceRepository();
  const registry = new ReferenceRegistry(repository);

  // 1. Register references
  console.log("--- 1. Registering References ---");
  const ref1 = await registry.registerReference({
    id: "arxiv-2104.12345",
    title: "Attention Is All You Need",
    type: "paper",
    source: "https://arxiv.org/abs/1706.03762"
  });
  console.log(`Registered: [${ref1.status}] ${ref1.id} - "${ref1.title}" (${ref1.source})`);

  const ref2 = await registry.registerReference({
    id: "github-nv-core",
    title: "NeuralVerse Core Engine Repository",
    type: "repository",
    source: "https://github.com/neuralverse/core"
  });
  console.log(`Registered: [${ref2.status}] ${ref2.id} - "${ref2.title}" (${ref2.source})`);
  console.log();

  // 2. List references
  console.log("--- 2. Listing References ---");
  const listBefore = await registry.listReferences();
  listBefore.forEach((ref, index) => {
    console.log(`${index + 1}. [${ref.status}] ${ref.id}: "${ref.title}"`);
  });
  console.log();

  // 3. Retrieve reference
  console.log("--- 3. Retrieving Reference details ---");
  const retrieved = await registry.getReference("arxiv-2104.12345");
  console.log(`Retrieved details for 'arxiv-2104.12345':`);
  console.log(`  Title: ${retrieved.title}`);
  console.log(`  Type:  ${retrieved.type}`);
  console.log(`  Source: ${retrieved.source}`);
  console.log(`  Status: ${retrieved.status}`);
  console.log();

  // 4. Update reference
  console.log("--- 4. Updating Reference ---");
  const updated = await registry.updateReference("arxiv-2104.12345", {
    title: "Attention Is All You Need (Updated Edition)",
    source: "https://arxiv.org/pdf/1706.03762"
  });
  console.log(`Updated 'arxiv-2104.12345':`);
  console.log(`  New Title:  ${updated.title}`);
  console.log(`  New Source: ${updated.source}`);
  console.log();

  // 5. Archive reference
  console.log("--- 5. Archiving Reference ---");
  const archived = await registry.archiveReference("github-nv-core");
  console.log(`Archived 'github-nv-core':`);
  console.log(`  Status: ${archived.status}`);
  console.log();

  // 6. Show final state
  console.log("--- 6. Final Registry State ---");
  const listAfter = await registry.listReferences();
  listAfter.forEach((ref, index) => {
    console.log(`${index + 1}. [${ref.status}] ${ref.id}: "${ref.title}" (Last updated: ${ref.updatedAt.toISOString()})`);
  });
  console.log("\n==================================================");
  console.log("DEMO RUN COMPLETED SUCCESSFULLY");
  console.log("==================================================");
}

runDemo().catch((err) => {
  console.error("Demo failed with error:", err);
  process.exit(1);
});
