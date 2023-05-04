import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import { resolve } from "path";
import * as esbuild from 'esbuild';

export default defineConfig({
	plugins: [sveltekit(),
	{
		name: "static-compiled-typescript",
		transform(source, id) {
			if (!id.endsWith("?compiled"))
				return;
			const { code } = esbuild.transformSync(source, { legalComments: 'inline' });
			return { code: `export default ${JSON.stringify(code)}` };
		}
	}],

	resolve: {
		alias: {
			'@components': resolve('./src/components'),
			'@services': resolve('./src/services'),
		}
	},
	esbuild: {
		keepNames: true
	}
});
