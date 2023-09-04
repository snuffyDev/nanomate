import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	server: {
		fs: {
			strict: false,
			allow: ['.', './../**/*.ts']
		},
		watch: {}
	},
	plugins: [sveltekit()]
});
