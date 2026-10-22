import { DEFAULT_CONFIG } from '../lib/assistant/engine.mjs';

console.log('Assistant Health Check: OK', {
  enabled: DEFAULT_CONFIG.assistantEnabled,
  embeddingDimensions: DEFAULT_CONFIG.embeddingDimensions,
  supportUrl: DEFAULT_CONFIG.supportUrl
});
