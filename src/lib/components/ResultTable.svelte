<script lang="ts">
	import type { QueryResult } from '$lib/types/index.js';

	let {
		result = null as QueryResult | null,
		loading = false,
		error = null as string | null
	} = $props();

	let currentPage = $state(0);
	const itemsPerPage = 50;

	const paginatedRows = $derived(() => {
		if (!result?.rows) return [];
		const startIndex = currentPage * itemsPerPage;
		return result.rows.slice(startIndex, startIndex + itemsPerPage);
	});

	const totalPages = $derived(() => {
		if (!result?.rows) return 0;
		return Math.ceil(result.rows.length / itemsPerPage);
	});

	function nextPage() {
		if (currentPage < totalPages() - 1) {
			currentPage++;
		}
	}

	function prevPage() {
		if (currentPage > 0) {
			currentPage--;
		}
	}

	function exportToCSV() {
		if (!result?.rows || result.rows.length === 0) return;

		const headers = result.fields.map((f) => f.name).join(',');
		const csvRows = result.rows.map((row) =>
			result.fields
				.map((field) => {
					const value = row[field.name];
					// Escape values containing commas or quotes
					if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
						return `"${value.replace(/"/g, '""')}"`;
					}
					return value ?? '';
				})
				.join(',')
		);

		const csvContent = [headers, ...csvRows].join('\n');
		const blob = new Blob([csvContent], { type: 'text/csv' });
		const url = URL.createObjectURL(blob);

		const a = document.createElement('a');
		a.href = url;
		a.download = `query_result_${new Date().toISOString().slice(0, 19)}.csv`;
		document.body.appendChild(a);
		a.click();
		document.body.removeChild(a);
		URL.revokeObjectURL(url);
	}

	function exportToJSON() {
		if (!result?.rows || result.rows.length === 0) return;

		const jsonContent = JSON.stringify(result.rows, null, 2);
		const blob = new Blob([jsonContent], { type: 'application/json' });
		const url = URL.createObjectURL(blob);

		const a = document.createElement('a');
		a.href = url;
		a.download = `query_result_${new Date().toISOString().slice(0, 19)}.json`;
		document.body.appendChild(a);
		a.click();
		document.body.removeChild(a);
		URL.revokeObjectURL(url);
	}
</script>

<div class="result-table shadow-lg">
	<div class="p-0">
		{#if loading}
			<div class="flex items-center justify-center p-8">
				<span class="loading loading-lg loading-spinner"></span>
				<span class="ml-4 text-lg">Executing query...</span>
			</div>
		{:else if error}
			<div class="m-4 alert alert-error">
				<svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
					/>
				</svg>
				<div>
					<h3 class="font-bold">Query Error</h3>
					<div class="text-sm">{error}</div>
				</div>
			</div>
		{:else if result && result.rows.length > 0}
			<!-- Results Header -->
			<div class="flex items-center justify-between border-b border-base-300 p-4">
				<div class="stats stats-horizontal">
					<div class="stat">
						<div class="stat-title">Rows</div>
						<div class="stat-value text-lg">{result.rowCount}</div>
					</div>
					<div class="stat">
						<div class="stat-title">Columns</div>
						<div class="stat-value text-lg">{result.fields.length}</div>
					</div>
				</div>

				<div class="flex gap-2">
					<button class="btn btn-outline btn-sm" onclick={exportToCSV}>
						<svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
							/>
						</svg>
						CSV
					</button>
					<button class="btn btn-outline btn-sm" onclick={exportToJSON}>
						<svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
							/>
						</svg>
						JSON
					</button>
				</div>
			</div>

			<!-- Table -->
			<div class="overflow-x-auto">
				<table class="table-pin-rows table table-zebra">
					<thead>
						<tr class="bg-base-200">
							{#each result.fields as field}
								<th class="font-semibold">
									<div class="flex flex-col">
										<span>{field.name}</span>
										<span class="text-xs font-normal opacity-70">{field.type}</span>
									</div>
								</th>
							{/each}
						</tr>
					</thead>
					<tbody>
						{#each paginatedRows() as row, i}
							<tr class="hover">
								{#each result.fields as field}
									<td class="max-w-xs">
										<div class="truncate" title={String((row as any)[field.name] ?? '')}>
											{#if (row as any)[field.name] === null}
												<span class="text-base-content/50 italic">NULL</span>
											{:else if typeof (row as any)[field.name] === 'boolean'}
												<span
													class="badge badge-sm {(row as any)[field.name]
														? 'badge-success'
														: 'badge-error'}"
												>
													{(row as any)[field.name]}
												</span>
											{:else}
												{String((row as any)[field.name])}
											{/if}
										</div>
									</td>
								{/each}
							</tr>
						{/each}
					</tbody>
				</table>
			</div>

			<!-- Pagination -->
			{#if totalPages() > 1}
				<div class="flex items-center justify-between border-t border-base-300 p-4">
					<div class="text-sm opacity-70">
						Showing {currentPage * itemsPerPage + 1}-{Math.min(
							(currentPage + 1) * itemsPerPage,
							result.rowCount
						)} of {result.rowCount} rows
					</div>

					<div class="join">
						<button class="btn join-item btn-sm" onclick={prevPage} disabled={currentPage === 0}>
							«
						</button>
						<button class="btn btn-active join-item btn-sm">
							Page {currentPage + 1}
						</button>
						<button
							class="btn join-item btn-sm"
							onclick={nextPage}
							disabled={currentPage >= totalPages() - 1}
						>
							»
						</button>
					</div>
				</div>
			{/if}
		{:else if result}
			<div class="flex items-center justify-center p-8">
				<div class="text-center">
					<svg
						class="mx-auto mb-4 h-16 w-16 opacity-50"
						fill="none"
						stroke="currentColor"
						viewBox="0 0 24 24"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
						/>
					</svg>
					<p class="text-lg opacity-70">Query executed successfully</p>
					<p class="text-sm opacity-50">No rows returned</p>
				</div>
			</div>
		{:else}
			<div class="flex items-center justify-center p-8">
				<div class="text-center">
					<svg
						class="mx-auto mb-4 h-16 w-16 opacity-50"
						fill="none"
						stroke="currentColor"
						viewBox="0 0 24 24"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
						/>
					</svg>
					<p class="text-lg opacity-70">Ready to execute SQL queries</p>
					<p class="text-sm opacity-50">Results will appear here</p>
				</div>
			</div>
		{/if}
	</div>
</div>
