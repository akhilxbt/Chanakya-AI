import { AssistantRepository, seedDefaultDocumentation } from '../lib/assistant/engine.mjs';

const repo = new AssistantRepository();
const results = seedDefaultDocumentation(repo, process.cwd());
console.log('Ingested and published documentation guides:', JSON.stringify(results, null, 2));
