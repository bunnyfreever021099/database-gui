import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types.js';
import { executeQuery, isReadOnlyQuery, sanitizeQuery } from '$lib/utils/db.js';

export const POST: RequestHandler = async ({ request }) => {
  try {
    const { query, params = [], readonly = false } = await request.json();

    if (!query || typeof query !== 'string') {
      return json(
        { success: false, error: 'Query is required and must be a string' },
        { status: 400 }
      );
    }

    // Sanitize the query
    const sanitizedQuery = sanitizeQuery(query);

    // Check if readonly mode is enforced
    if (readonly && !isReadOnlyQuery(sanitizedQuery)) {
      return json(
        { success: false, error: 'Only SELECT queries are allowed in readonly mode' },
        { status: 403 }
      );
    }

    // Execute the query
    const startTime = Date.now();
    const result = await executeQuery(sanitizedQuery, params);
    const executionTime = Date.now() - startTime;

    return json({
      success: true,
      data: result,
      executionTime,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Query execution error:', error);

    return json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
};

export const GET: RequestHandler = async () => {
  return json(
    {
      success: false,
      error: 'GET method not allowed. Use POST to execute queries.'
    },
    { status: 405 }
  );
};