import preprocess from 'svelte-preprocess';
import adapter from '@sveltejs/adapter-static';
const { GITHUB_REPOSITORY } = process.env; // ie. octocat/hello-world
const base = GITHUB_REPOSITORY ? GITHUB_REPOSITORY.substring(GITHUB_REPOSITORY.indexOf('/')) : '';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	// Consult https://github.com/sveltejs/svelte-preprocess
	// for more information about preprocessors
	preprocess: preprocess(),
	onwarn(warning, handler) {
		if (!warning.code.indexOf('a11y')) return;
		handler(warning);
	},
	kit: {
		paths: { assets: "", base },
		adapter: adapter({
			pages: 'docs',
			assets: 'docs',
			fallback: 'index.html'
		})
	}
};

export default config;
