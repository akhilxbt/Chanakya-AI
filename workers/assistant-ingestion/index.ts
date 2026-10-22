// pg-boss background ingestion worker entry point
import PgBoss from 'pg-boss';
import { getAssistantServices } from '@/lib/assistant/singleton';

export async function startIngestionWorker() {
  if (!process.env.DATABASE_URL) {
    console.log('No DATABASE_URL set; using synchronous in-process ingestion mode.');
    return;
  }
  const boss = new PgBoss(process.env.DATABASE_URL);
  await boss.start();
  await boss.work('assistant-ingest-version', async (job: any) => {
    const { repo } = getAssistantServices();
    const { documentId, versionId, actorId } = job.data;
    return repo.publishVersion({ documentId, versionId, actorId });
  });
}
