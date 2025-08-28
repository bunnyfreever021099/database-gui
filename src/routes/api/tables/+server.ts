import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types.js';
import { getTables, testConnection } from '$lib/utils/db.js';

export const GET: RequestHandler = async () => {
  try {
    // Test connection first
    const isConnected = await testConnection();
    if (!isConnected) {
      return json(
        { success: false, error: 'Database connection failed' },
        { status: 500 }
      );
    }

    // Get all tables
    const tables = await getTables();

    return json({
      success: true,
      data: tables,
      count: tables.length,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Failed to fetch tables:', error);
    
    return json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch tables',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
};