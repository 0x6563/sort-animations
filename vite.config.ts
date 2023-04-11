import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import { resolve } from "path";

export default defineConfig({
	plugins: [sveltekit()],

	resolve: {
		alias: {
			'@components': resolve('./src/components'),
			'@services': resolve('./src/services'),
		}
	},
	esbuild: {
		keepNames: true
	},
	// ...
	// TODO: Remove once vite 4.3 is out
	worker: {
		plugins: [
			{
				name: 'remove-manifest',
				configResolved(c) {
					const manifestPlugin = c.worker.plugins.findIndex((p) => p.name === 'vite:manifest');
					c.worker.plugins.splice(manifestPlugin, 1);
					const ssrManifestPlugin = c.worker.plugins.findIndex(
						(p) => p.name === 'vite:ssr-manifest'
					);
					(c.plugins as any).splice(ssrManifestPlugin, 1);
				}
			}
		]
	}
});
