<script lang="ts">
	import SqlEditor from '$lib/components/SqlEditor.svelte';
	import ResultTable from '$lib/components/ResultTable.svelte';
	import type { QueryResult } from '$lib/types/index.js';
	
	let sqlQuery = $state('SELECT * FROM users LIMIT 10;');
	let queryResult: QueryResult | null = $state(null);
	let loading = $state(false);
	let error: string | null = $state(null);
	let readOnlyMode = $state(false);

	async function executeQuery() {
		if (!sqlQuery.trim()) return;

		loading = true;
		error = null;
		queryResult = null;

		try {
			const response = await fetch('/api/query', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					query: sqlQuery,
					readonly: readOnlyMode
				})
			});

			const data = await response.json();

			if (data.success) {
				queryResult = data.data;
			} else {
				error = data.error || 'Unknown error occurred';
			}
		} catch (err) {
			error = err instanceof Error ? err.message : 'Network error occurred';
		} finally {
			loading = false;
		}
	}

	function handleSqlChange(newValue: string) {
		sqlQuery = newValue;
	}

	function clearResults() {
		queryResult = null;
		error = null;
	}

	// Example queries
	const exampleQueries = [
		{
			name: 'Show all tables',
			query: "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';"
		},
		{
			name: 'Database version',
			query: 'SELECT version();'
		},
		{
			name: 'Current time',
			query: 'SELECT NOW() as current_time;'
		},
		{
			name: 'Show databases',
			query: 'SELECT datname FROM pg_database WHERE datistemplate = false;'
		}
	];

	function loadExampleQuery(query: string) {
		sqlQuery = query;
	}
</script>

<svelte:head>
	<title>SQL Query - Database GUI</title>
</svelte:head>

<div class="space-y-6">
	<!-- Page Header -->
	<div class="flex justify-between items-center">
		<div>
			<h1 class="text-3xl font-bold">SQL Query Editor</h1>
			<p class="text-base-content/70 mt-1">Execute SQL queries and view results</p>
		</div>
		
		<div class="flex items-center gap-4">
			<!-- Read-only mode toggle -->
			<div class="form-control">
				<label class="label cursor-pointer">
					<span class="label-text mr-2">Read-only mode</span>
					<input 
						type="checkbox" 
						class="toggle toggle-primary" 
						bind:checked={readOnlyMode}
					/>
				</label>
			</div>
		</div>
	</div>

	<!-- Example Queries -->
	<div class="card bg-base-100 shadow-lg">
		<div class="card-body p-4">
			<h3 class="font-semibold mb-3">Example Queries</h3>
			<div class="flex flex-wrap gap-2">
				{#each exampleQueries as example}
					<button 
						class="btn btn-sm btn-outline" 
						onclick={() => loadExampleQuery(example.query)}
					>
						{example.name}
					</button>
				{/each}
			</div>
		</div>
	</div>

	<!-- SQL Editor -->
	<div class="card bg-base-100 shadow-lg">
		<div class="card-body p-0">
			<SqlEditor 
				value={sqlQuery}
				onChange={handleSqlChange}
				readonly={false}
				height="400px"
			/>
			
			<!-- Action buttons -->
			<div class="flex justify-between items-center p-4 border-t border-base-300">
				<div class="flex items-center gap-2">
					<kbd class="kbd kbd-sm">Ctrl</kbd>
					<span class="text-sm opacity-70">+</span>
					<kbd class="kbd kbd-sm">Enter</kbd>
					<span class="text-sm opacity-70">to execute</span>
				</div>
				
				<div class="flex gap-2">
					<button 
						class="btn btn-ghost btn-sm" 
						onclick={clearResults}
						disabled={loading}
					>
						Clear Results
					</button>
					<button 
						class="btn btn-primary" 
						onclick={executeQuery}
						disabled={loading || !sqlQuery.trim()}
					>
						{#if loading}
							<span class="loading loading-spinner loading-sm"></span>
							Executing...
						{:else}
							<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h1m4 0h1m6-8V7a3 3 0 00-3-3H4a3 3 0 00-3 3v4a3 3 0 003 3v.172a2 2 0 002 2h2.828a2 2 0 002-2V10z" />
							</svg>
							Execute Query
						{/if}
					</button>
				</div>
			</div>
		</div>
	</div>

	<!-- Results -->
	<ResultTable 
		result={queryResult}
		{loading}
		{error}
	/>
</div>

<!-- Keyboard shortcuts -->
<svelte:window 
	on:keydown={(e) => {
		if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
			e.preventDefault();
			executeQuery();
		}
	}}
/>
