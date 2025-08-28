<script lang="ts">
	import '../app.css';
	import favicon from '$lib/assets/favicon.svg';
	import { onMount } from 'svelte';

	let { children } = $props();

	onMount(() => {
		// Theme switcher functionality
		const themeLinks = document.querySelectorAll('[data-set-theme]');
		themeLinks.forEach((link) => {
			link.addEventListener('click', (e) => {
				e.preventDefault();
				const theme = (e.target as HTMLElement).getAttribute('data-set-theme');
				if (theme) {
					document.documentElement.setAttribute('data-theme', theme);
					localStorage.setItem('theme', theme);
				}
			});
		});

		// Load saved theme
		const savedTheme = localStorage.getItem('theme');
		if (savedTheme) {
			document.documentElement.setAttribute('data-theme', savedTheme);
		}
	});
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	<title>Database GUI</title>
</svelte:head>

<div class="min-h-screen bg-base-200">
	<!-- Navigation -->
	<div class="navbar bg-base-100 shadow-lg">
		<div class="navbar-start">
			<div class="dropdown">
				<div tabindex="0" role="button" class="btn btn-ghost lg:hidden">
					<svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M4 6h16M4 12h8m-8 6h16"
						/>
					</svg>
				</div>
				<ul
					class="dropdown-content menu z-[1] mt-3 w-52 menu-sm rounded-box bg-base-100 p-2 shadow"
				>
					<li><a href="/">Query</a></li>
					<li><a href="/tables">Tables</a></li>
				</ul>
			</div>
			<a class="btn text-xl btn-ghost" href="/">
				<svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M4 7v10c0 2.21 1.79 4 4 4h8c0-1.1.9-2 2-2h2V7c0-2.21-1.79-4-4-4H8c-2.21 0-4 1.79-4 4z"
					/>
				</svg>
				Database GUI
			</a>
		</div>

		<div class="navbar-center hidden lg:flex">
			<ul class="menu menu-horizontal px-1">
				<li><a href="/">SQL Query</a></li>
				<li><a href="/tables">Tables</a></li>
			</ul>
		</div>

		<div class="navbar-end">
			<!-- Theme Toggle -->
			<div class="dropdown dropdown-end">
				<div tabindex="0" role="button" class="btn btn-ghost">
					<svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
						/>
					</svg>
				</div>
				<ul class="dropdown-content z-[1] w-52 rounded-box bg-base-100 p-2 shadow-2xl">
					<li><a data-set-theme="light" data-act-class="active">Light</a></li>
					<li><a data-set-theme="dark" data-act-class="active">Dark</a></li>
					<li><a data-set-theme="cupcake" data-act-class="active">Cupcake</a></li>
					<li><a data-set-theme="forest" data-act-class="active">Forest</a></li>
				</ul>
			</div>
		</div>
	</div>

	<!-- Main Content -->
	<main class="mx-auto">
		{@render children?.()}
	</main>
</div>
