export interface DatabaseConfig {
  host: string;
  port: number;
  database: string;
  user: string;
  password: string;
}

export interface QueryResult {
  rows: any[];
  fields: QueryField[];
  rowCount: number;
  command: string;
}

export interface QueryField {
  name: string;
  type: string;
  nullable: boolean;
}

export interface TableInfo {
  table_name: string;
  table_schema: string;
}

export interface ColumnInfo {
  column_name: string;
  data_type: string;
  is_nullable: string;
  column_default: string | null;
  character_maximum_length: number | null;
}

export interface User {
  id: number;
  username: string;
  role: 'admin' | 'readonly';
}

export interface QueryHistory {
  id: number;
  query: string;
  timestamp: Date;
  execution_time: number;
  success: boolean;
  error?: string;
}

export interface ExportOptions {
  format: 'csv' | 'json';
  filename: string;
  includeHeaders: boolean;
}