import { InMemoryReferenceRepository } from "../src/retrieval/reference/InMemoryReferenceRepository.ts";
import { ReferenceRegistry } from "../src/retrieval/reference/ReferenceRegistry.ts";
import { InMemoryRetrievalIndexRepository } from "../src/retrieval/index/InMemoryRetrievalIndexRepository.ts";
import { RetrievalIndexService } from "../src/retrieval/index/RetrievalIndexService.ts";

async function runDemo() {
  console.log("==================================================");
  console.log("NEURALVERSE RETRIEVAL INDEX RUNTIME DEMO");
  console.log("==================================================\n");

  // Initialize Reference Registry
  const refRepository = new InMemoryReferenceRepository();
  const referenceRegistry = new ReferenceRegistry(refRepository);

  // Initialize Retrieval Index Service
  const indexRepository = new InMemoryRetrievalIndexRepository();
  const indexService = new RetrievalIndexService(indexRepository, referenceRegistry);

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
    title: "BERT: Pre-training of Deep Bidirectional Transformers",
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
  console.log("--- 2. Indexing References with Keywords ---");
  await indexService.indexReference("ref-transformer", ["Attention", "transformer", "neural network", "attention"]);
  await indexService.indexReference("ref-bert", ["BERT", "transformer", "bidirectional", "NLP"]);
  await indexService.indexReference("ref-pytorch", ["PyTorch", "library", "deep learning", "python"]);
  console.log("Indexed all three references successfully.\n");

  // 3. Search by single keyword
  console.log("--- 3. Searching by Single Keyword ('transformer') ---");
  const search1 = await indexService.search("transformer");
  search1.forEach((res) => {
    console.log(`  Match: ${res.referenceId} | Score: ${res.score} | Keywords: ${res.matchedKeywords.join(", ")}`);
  });
  console.log();

  // 4. Search by multi-term query
  console.log("--- 4. Searching by Multi-term Query ('deep learning pytorch') ---");
  const search2 = await indexService.search("deep learning pytorch");
  search2.forEach((res) => {
    console.log(`  Match: ${res.referenceId} | Score: ${res.score} | Keywords: ${res.matchedKeywords.join(", ")}`);
  });
  console.log();

  // 5. Show score and matched keywords for multi-match query
  console.log("--- 5. Searching with Multiple Overlapping Terms ('transformer nlp bidirectional') ---");
  const search3 = await indexService.search("transformer nlp bidirectional");
  search3.forEach((res) => {
    console.log(`  Match: ${res.referenceId} | Score: ${res.score} | Keywords: ${res.matchedKeywords.join(", ")}`);
  });
  console.log();

  // 6. Archive one reference
  console.log("--- 6. Archiving Reference 'ref-bert' ---");
  await referenceRegistry.archiveReference("ref-bert");
  console.log("Archived 'ref-bert' in the registry.\n");

  // 7. Show archived reference excluded by default
  console.log("--- 7. Searching 'transformer' (Archived Excluded by Default) ---");
  const search4 = await indexService.search("transformer");
  search4.forEach((res) => {
    console.log(`  Match: ${res.referenceId} | Score: ${res.score}`);
  });
  console.log();

  // 8. Show archived reference included with option
  console.log("--- 8. Searching 'transformer' (With includeArchived: true) ---");
  const search5 = await indexService.search("transformer", { includeArchived: true });
  search5.forEach((res) => {
    console.log(`  Match: ${res.referenceId} | Score: ${res.score}`);
  });
  console.log();

  // 9. Remove indexed reference
  console.log("--- 9. Removing 'ref-pytorch' from Index ---");
  await indexService.removeReference("ref-pytorch");
  console.log("Removed 'ref-pytorch' from index.\n");

  // 10. Show final index state
  console.log("--- 10. Final Index State ---");
  const finalState = await indexService.listIndexedReferences();
  finalState.forEach((entry) => {
    console.log(`  Reference: ${entry.referenceId} | Keywords: [${entry.keywords.join(", ")}]`);
  });

  console.log("\n==================================================");
  console.log("DEMO RUN COMPLETED SUCCESSFULLY");
  console.log("==================================================");
}

runDemo().catch((err) => {
  console.error("Demo failed:", err);
  process.exit(1);
});
