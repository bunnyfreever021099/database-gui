import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types.js';
import { getTableColumns } from '$lib/utils/db.js';

export const GET: RequestHandler = async ({ params, url }) => {
  try {
    const { table } = params;
    const schema = url.searchParams.get('schema') || 'public';

    if (!table) {
      return json(
        { success: false, error: 'Table name is required' },
        { status: 400 }
      );
    }

    // Get table columns
    const columns = await getTableColumns(table, schema);

    return json({
      success: true,
      data: columns,
      count: columns.length,
      table,
      schema,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Failed to fetch table columns:', error);
    
    return json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch table columns',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
};