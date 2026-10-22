import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { AssistantRepository, AssistantChatService, seedDefaultDocumentation } from '../lib/assistant/engine.mjs';

const repo = new AssistantRepository();
seedDefaultDocumentation(repo, process.cwd());
const chat = new AssistantChatService(repo);

const golden = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'evals/golden-questions.json'), 'utf8'));

let hits = 0;
let validCitations = 0;
let answeredCount = 0;
const latencies = [];

for (const item of golden) {
  const t0 = Date.now();
  const res = await chat.handleChat({
    user: { id: 'eval-runner', groups: ['application-users'] },
    message: item.question,
    context: item.context
  });
  latencies.push(Date.now() - t0);

  if (res.status === item.expectedStatus) {
    if (item.expectedStatus === 'answered') {
      answeredCount++;
      if (res.sources.some((s) => s.section.includes(item.expectedSectionSubstring))) {
        hits++;
      }
      if (res.sources.length > 0 && res.sources.every((s) => repo.chunks.has(s.id))) {
        validCitations++;
      }
    } else {
      hits++;
    }
  }
}

latencies.sort((a, b) => a - b);
const p95LatencyMs = latencies[Math.floor(latencies.length * 0.95)] || 0;
const hitRate = (hits / golden.length) * 100;
const citationAccuracy = (validCitations / (answeredCount || 1)) * 100;

console.log('=== GOLDEN SET EVALUATION REPORT ===');
console.log(`Questions Evaluated : ${golden.length}`);
console.log(`Retrieval Hit Rate  : ${hitRate.toFixed(1)}% (Gate: >= 90.0%)`);
console.log(`Citation Accuracy   : ${citationAccuracy.toFixed(1)}% (Gate: >= 95.0%)`);
console.log(`p95 Full Answer Time: ${p95LatencyMs} ms (Gate: < 8000 ms)`);

assert.ok(hitRate >= 90, `Hit rate ${hitRate}% failed >=90% gate`);
assert.ok(citationAccuracy >= 95, `Citation accuracy ${citationAccuracy}% failed >=95% gate`);
assert.ok(p95LatencyMs < 8000, `p95 latency ${p95LatencyMs}ms failed <8000ms gate`);
console.log('ALL RELEASE EVALUATION GATES PASSED.');
