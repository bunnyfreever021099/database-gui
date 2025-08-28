<script lang="ts">
	import { onMount } from 'svelte';
	import type { TableInfo, ColumnInfo } from '$lib/types/index.js';
	
	let tables: TableInfo[] = $state([]);
	let selectedTable: TableInfo | null = $state(null);
	let columns: ColumnInfo[] = $state([]);
	let loading = $state(false);
	let error: string | null = $state(null);

	onMount(() => {
		loadTables();
	});

	async function loadTables() {
		loading = true;
		error = null;

		try {
			const response = await fetch('/api/tables');
			const data = await response.json();

			if (data.success) {
				tables = data.data;
			} else {
				error = data.error || 'Failed to load tables';
			}
		} catch (err) {
			error = err instanceof Error ? err.message : 'Network error occurred';
		} finally {
			loading = false;
		}
	}

	async function loadTableColumns(table: TableInfo) {
		selectedTable = table;
		loading = true;
		error = null;

		try {
			const response = await fetch(`/api/tables/${table.table_name}/columns?schema=${table.table_schema}`);
			const data = await response.json();

			if (data.success) {
				columns = data.data;
			} else {
				error = data.error || 'Failed to load table columns';
			}
		} catch (err) {
			error = err instanceof Error ? err.message : 'Network error occurred';
		} finally {
			loading = false;
		}
	}

	function generateSelectQuery(table: TableInfo) {
		return `SELECT * FROM ${table.table_schema !== 'public' ? table.table_schema + '.' : ''}${table.table_name} LIMIT 100;`;
	}

	function generateInsertQuery(table: TableInfo) {
		if (columns.length === 0) return '';
		
		const columnNames = columns.map(col => col.column_name).join(', ');
		const placeholders = columns.map(() => 'NULL').join(', ');
		
		return `INSERT INTO ${table.table_schema !== 'public' ? table.table_schema + '.' : ''}${table.table_name} (${columnNames}) VALUES (${placeholders});`;
	}

	function copyToClipboard(text: string) {
		navigator.clipboard.writeText(text).then(() => {
			// Could add a toast notification here
		});
	}
</script>

<svelte:head>
	<title>Database Tables - Database GUI</title>
</svelte:head>

<div class="space-y-6">
	<!-- Page Header -->
	<div class="flex justify-between items-center">
		<div>
			<h1 class="text-3xl font-bold">Database Tables</h1>
			<p class="text-base-content/70 mt-1">Browse database tables and their structure</p>
		</div>
		
		<button class="btn btn-primary" onclick={loadTables} disabled={loading}>
			{#if loading}
				<span class="loading loading-spinner loading-sm"></span>
				Loading...
			{:else}
				<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
				</svg>
				Refresh
			{/if}
		</button>
	</div>

	{#if error}
		<div class="alert alert-error">
			<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
			</svg>
			<div>
				<h3 class="font-bold">Error</h3>
				<div class="text-sm">{error}</div>
			</div>
		</div>
	{/if}

	<div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
		<!-- Tables List -->
		<div class="card bg-base-100 shadow-lg">
			<div class="card-body">
				<h2 class="card-title">Tables ({tables.length})</h2>
				
				{#if loading && tables.length === 0}
					<div class="flex items-center justify-center py-8">
						<span class="loading loading-spinner loading-lg"></span>
						<span class="ml-4">Loading tables...</span>
					</div>
				{:else if tables.length === 0}
					<div class="text-center py-8 opacity-70">
						<svg class="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
						</svg>
						<p>No tables found</p>
					</div>
				{:else}
					<div class="overflow-y-auto max-h-96">
						{#each tables as table}
							<div class="card bg-base-200 mb-2 cursor-pointer hover:bg-base-300 transition-colors" 
								 onclick={() => loadTableColumns(table)}
								 class:ring-2={selectedTable?.table_name === table.table_name}
								 class:ring-primary={selectedTable?.table_name === table.table_name}>
								<div class="card-body p-4">
									<div class="flex justify-between items-start">
										<div>
											<h3 class="font-semibold">{table.table_name}</h3>
											{#if table.table_schema !== 'public'}
												<p class="text-sm opacity-70">{table.table_schema}</p>
											{/if}
										</div>
										
										<div class="dropdown dropdown-end">
											<div tabindex="0" role="button" class="btn btn-ghost btn-xs" onclick={(e) => e.stopPropagation()}>
												<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
													<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
												</svg>
											</div>
											<ul class="dropdown-content bg-base-100 rounded-box z-[1] w-52 p-2 shadow">
												<li>
													<button class="w-full text-left p-2 hover:bg-base-200 rounded" 
														onclick={() => copyToClipboard(generateSelectQuery(table))}>
														Copy SELECT query
													</button>
												</li>
												<li>
													<button class="w-full text-left p-2 hover:bg-base-200 rounded"
														onclick={() => copyToClipboard(generateInsertQuery(table))}>
														Copy INSERT template
													</button>
												</li>
											</ul>
										</div>
									</div>
								</div>
							</div>
						{/each}
					</div>
				{/if}
			</div>
		</div>

		<!-- Table Details -->
		<div class="card bg-base-100 shadow-lg">
			<div class="card-body">
				<h2 class="card-title">
					{#if selectedTable}
						Table Schema: {selectedTable.table_name}
					{:else}
						Table Schema
					{/if}
				</h2>
				
				{#if loading && selectedTable}
					<div class="flex items-center justify-center py-8">
						<span class="loading loading-spinner loading-lg"></span>
						<span class="ml-4">Loading columns...</span>
					</div>
				{:else if selectedTable && columns.length > 0}
					<div class="overflow-x-auto">
						<table class="table table-zebra">
							<thead>
								<tr>
									<th>Column</th>
									<th>Type</th>
									<th>Nullable</th>
									<th>Default</th>
								</tr>
							</thead>
							<tbody>
								{#each columns as column}
									<tr>
										<td class="font-medium">{column.column_name}</td>
										<td>
											<div class="badge badge-outline">
												{column.data_type}
												{#if column.character_maximum_length}
													({column.character_maximum_length})
												{/if}
											</div>
										</td>
										<td>
											{#if column.is_nullable === 'YES'}
												<div class="badge badge-success badge-sm">YES</div>
											{:else}
												<div class="badge badge-error badge-sm">NO</div>
											{/if}
										</td>
										<td class="font-mono text-sm">
											{column.column_default || '-'}
										</td>
									</tr>
								{/each}
							</tbody>
						</table>
					</div>

					<!-- Quick Actions -->
					<div class="card-actions justify-end mt-4">
						<button class="btn btn-outline btn-sm" 
							onclick={() => copyToClipboard(generateSelectQuery(selectedTable!))}>
							<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
							</svg>
							Copy SELECT
						</button>
						<button class="btn btn-outline btn-sm"
							onclick={() => copyToClipboard(generateInsertQuery(selectedTable!))}>
							<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
							</svg>
							Copy INSERT
						</button>
						<a href="/" class="btn btn-primary btn-sm">
							<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
							</svg>
							Query Editor
						</a>
					</div>
				{:else if selectedTable}
					<div class="text-center py-8 opacity-70">
						<svg class="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
						</svg>
						<p>No columns found for this table</p>
					</div>
				{:else}
					<div class="text-center py-8 opacity-70">
						<svg class="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
						</svg>
						<p>Select a table to view its schema</p>
					</div>
				{/if}
			</div>
		</div>
	</div>
</div>