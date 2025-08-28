<script lang="ts">
	import { onMount } from 'svelte';
	import { browser } from '$app/environment';
	
	let {
		value = 'SELECT * FROM users LIMIT 10;',
		onChange = (val: string) => {},
		readonly = false,
		height = '300px'
	} = $props();

	let editorContainer: HTMLDivElement;
	let editor = $state<any>(null);
	let mounted = $state(false);
	let monaco: any = null;

	onMount(async () => {
		if (!browser) return;
		
		try {
			// Dynamic import Monaco Editor only on client-side
			monaco = await import('monaco-editor');
			
			// Configure Monaco Editor environment
			monaco.editor.defineTheme('dark-theme', {
				base: 'vs-dark',
				inherit: true,
				rules: [],
				colors: {
					'editor.background': '#0f172a',
					'editor.foreground': '#e2e8f0',
					'editorLineNumber.foreground': '#64748b',
					'editor.selectionBackground': '#334155',
				}
			});

			// Create editor
			editor = monaco.editor.create(editorContainer, {
				value: value,
				language: 'sql',
				theme: 'dark-theme',
				minimap: { enabled: false },
				fontSize: 14,
				lineNumbers: 'on',
				wordWrap: 'on',
				automaticLayout: true,
				scrollBeyondLastLine: false,
				readOnly: readonly,
				suggest: {
					showKeywords: true,
					showSnippets: true,
					showFunctions: true
				},
				quickSuggestions: {
					other: true,
					comments: false,
					strings: false
				}
			});

			// Listen for content changes
			editor.onDidChangeModelContent(() => {
				const newValue = editor?.getValue() || '';
				onChange(newValue);
			});

			mounted = true;
		} catch (error) {
			console.error('Failed to load Monaco Editor:', error);
			mounted = false;
		}

		return () => {
			editor?.dispose();
		};
	});

	// Update editor value when prop changes
	$effect(() => {
		if (editor && editor.getValue() !== value) {
			editor.setValue(value);
		}
	});
</script>

<div class="sql-editor border border-base-300 rounded-lg overflow-hidden bg-base-100">
	<div class="bg-base-300 px-4 py-2 text-sm font-medium flex justify-between items-center">
		<span>SQL Query Editor</span>
		<div class="text-xs opacity-70">
			Use Ctrl+Enter to execute • Monaco Editor with SQL syntax highlighting
		</div>
	</div>
	
	<div bind:this={editorContainer} class="editor-container" style="height: {height}">
		{#if !browser}
			<!-- SSR Fallback -->
			<div class="flex items-center justify-center h-full">
				<div class="text-center">
					<div class="loading loading-spinner loading-md mb-2"></div>
					<p class="text-sm opacity-70">Loading editor...</p>
				</div>
			</div>
		{:else if !mounted}
			<!-- Client-side loading -->
			<div class="flex items-center justify-center h-full">
				<div class="text-center">
					<div class="loading loading-spinner loading-md mb-2"></div>
					<p class="text-sm opacity-70">Loading Monaco Editor...</p>
				</div>
			</div>
		{:else if !editor}
			<!-- Fallback textarea if Monaco fails to load -->
			<div class="fallback-editor relative" style="height: {height}">
				<textarea
					class="textarea textarea-ghost w-full h-full resize-none border-none bg-base-100 font-mono text-sm leading-relaxed p-4 focus:outline-none"
					placeholder="Enter your SQL query here..."
					spellcheck="false"
					{readonly}
					{value}
					oninput={(e) => onChange((e.target as HTMLTextAreaElement).value)}
					style="min-height: {height}; padding-left: 3rem;"
				></textarea>
				
				<!-- Line numbers for fallback -->
				<div class="absolute top-0 left-0 w-10 h-full bg-base-200 border-r border-base-300 text-xs text-base-content/50 p-2 select-none pointer-events-none">
					{#each Array.from({length: Math.max(1, (value || '').split('\n').length)}) as _, i}
						<div class="leading-relaxed">{i + 1}</div>
					{/each}
				</div>
				
				<div class="absolute top-2 right-2 text-xs opacity-50">
					Simple Editor (Monaco failed to load)
				</div>
			</div>
		{/if}
	</div>
</div>

<style>
	.sql-editor {
		min-height: 200px;
	}
	
	.editor-container {
		position: relative;
	}
	
	:global(.monaco-editor) {
		border-radius: 0 !important;
	}
	
	:global(.monaco-editor .margin) {
		background-color: oklch(var(--b2)) !important;
	}
	
	:global(.monaco-editor .monaco-editor-background) {
		background-color: oklch(var(--b1)) !important;
	}
	
	:global(.monaco-editor .current-line) {
		background-color: oklch(var(--b2) / 0.5) !important;
	}
</style>