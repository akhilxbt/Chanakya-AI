import { Pool } from 'pg';

let pool: Pool | null = null;

export function getPostgresPool(): Pool {
  if (!pool) {
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      max: 10,
      idleTimeoutMillis: 30000
    });
  }
  return pool;
}

export async function runHybridSearchSql(
  queryText: string,
  queryEmbedding: number[],
  matchCount = 20,
  accessGroups = ['application-users']
) {
  const db = getPostgresPool();
  const vectorLiteral = `[${queryEmbedding.join(',')}]`;
  const { rows } = await db.query(
    `SELECT chunk_id, score FROM assistant_hybrid_search($1, $2::vector, $3, $4::text[])`,
    [queryText, vectorLiteral, matchCount, accessGroups]
  );
  return rows;
}
