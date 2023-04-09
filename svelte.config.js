import { readFile } from 'fs/promises';
import preprocess from 'svelte-preprocess';
import adapter from '@sveltejs/adapter-static';
const info = JSON.parse(await readFile(new URL('./package.json', import.meta.url)));
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
		paths: { assets: "", base: `/${info.name}` },
		adapter: adapter({
			pages: 'docs',
			assets: 'docs',
			fallback: 'index.html'
		})
	}
};

export default config;
