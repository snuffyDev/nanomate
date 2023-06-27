import { defineConfig } from "vite";
export default defineConfig({
	build: {
		// lib: { entry: "./src/index.ts", fileName: "nanopath", formats: ["es"] },
		minify: true,
		reportCompressedSize: true,
	},
});
