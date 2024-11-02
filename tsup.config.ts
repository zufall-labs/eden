// tsup.config.ts
import { defineConfig } from 'tsup';

export default defineConfig({
    entry: ['src/index.ts'],
    format: ['esm'],
    clean: true,
    splitting: false,
    sourcemap: true,
    minify: true,
    shims: true,
    dts: true,
    platform: 'node',
    banner: {
        js: '#!/usr/bin/env node'
    },
    external: [
        // Mark these as external to avoid bundling issues
        /^node:.*/
    ]
});