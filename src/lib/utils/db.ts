import { Pool, type PoolClient, type QueryResult as PgQueryResult } from 'pg';
import type { QueryResult, QueryField, TableInfo, ColumnInfo } from '../types/index.js';
import { env } from '$env/dynamic/private';

let pool: Pool | null = null;

export function getPool(): Pool {
  if (!pool) {
    const databaseUrl = env.DATABASE_URL;
    if (!databaseUrl) {
      throw new Error('DATABASE_URL environment variable is required');
    }

    pool = new Pool({
      connectionString: databaseUrl,
      max: 10,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 10000,
    });

    pool.on('error', (err) => {
      console.error('Database pool error:', err);
    });
  }

  return pool;
}

export async function executeQuery(
  query: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  params: any[] = [],
  timeout: number = 30000
): Promise<QueryResult> {
  const pool = getPool();
  const client: PoolClient = await pool.connect();

  try {
    // Set query timeout
    await client.query(`SET statement_timeout = ${timeout}`);

    const result: PgQueryResult = await client.query(query, params);

    // Map PostgreSQL fields to our QueryField interface
    const fields: QueryField[] = result.fields?.map(field => ({
      name: field.name,
      type: getPostgreSQLTypeName(field.dataTypeID),
      nullable: true // PostgreSQL doesn't provide this info easily, would need schema query
    })) || [];

    return {
      rows: result.rows,
      fields,
      rowCount: result.rowCount || 0,
      command: result.command || 'UNKNOWN'
    };
  } finally {
    client.release();
  }
}

export async function getTables(): Promise<TableInfo[]> {
  const query = `
    SELECT table_name, table_schema 
    FROM information_schema.tables 
    WHERE table_schema NOT IN ('information_schema', 'pg_catalog')
    ORDER BY table_schema, table_name;
  `;

  const result = await executeQuery(query);
  return result.rows as TableInfo[];
}

export async function getTableColumns(tableName: string, schemaName: string = 'public'): Promise<ColumnInfo[]> {
  const query = `
    SELECT 
      column_name,
      data_type,
      is_nullable,
      column_default,
      character_maximum_length
    FROM information_schema.columns 
    WHERE table_name = $1 AND table_schema = $2
    ORDER BY ordinal_position;
  `;

  const result = await executeQuery(query, [tableName, schemaName]);
  return result.rows as ColumnInfo[];
}

export async function testConnection(): Promise<boolean> {
  try {
    await executeQuery('SELECT 1');
    return true;
  } catch (error) {
    console.error('Database connection test failed:', error);
    return false;
  }
}

export async function closePool(): Promise<void> {
  if (pool) {
    await pool.end();
    pool = null;
  }
}

// Helper function to map PostgreSQL data type IDs to type names
function getPostgreSQLTypeName(typeId: number): string {
  const typeMap: Record<number, string> = {
    16: 'boolean',
    20: 'bigint',
    21: 'smallint',
    23: 'integer',
    25: 'text',
    700: 'real',
    701: 'double precision',
    1043: 'varchar',
    1082: 'date',
    1114: 'timestamp',
    1184: 'timestamptz',
    // Add more as needed
  };

  return typeMap[typeId] || `unknown(${typeId})`;
}

// Security: Validate query for read-only operations
export function isReadOnlyQuery(query: string): boolean {
  const normalizedQuery = query.trim().toLowerCase();
  const readOnlyCommands = ['select', 'show', 'explain', 'describe', 'desc'];
  const firstWord = normalizedQuery.split(/\s+/)[0];

  return readOnlyCommands.includes(firstWord);
}

// Security: Basic SQL injection prevention
export function sanitizeQuery(query: string): string {
  // Remove comments
  query = query.replace(/--.*$/gm, '');
  query = query.replace(/\/\*.*?\*\//gs, '');

  // Remove dangerous patterns (basic protection)
  const dangerousPatterns = [
    /;\s*drop\s+/gi,
    /;\s*delete\s+/gi,
    /;\s*truncate\s+/gi,
    /;\s*alter\s+/gi,
    /xp_cmdshell/gi,
    /sp_executesql/gi
  ];

  for (const pattern of dangerousPatterns) {
    if (pattern.test(query)) {
      throw new Error('Query contains potentially dangerous operations');
    }
  }

  return query.trim();
}