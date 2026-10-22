import { AssistantRepository, seedDefaultDocumentation } from '../lib/assistant/engine.mjs';

const repo = new AssistantRepository();
const results = seedDefaultDocumentation(repo, process.cwd());
console.log('Re-indexed active documentation versions:', results.length);
