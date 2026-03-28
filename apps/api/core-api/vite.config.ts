import { resolve } from 'path';
import { dirname } from 'path';
import { fileURLToPath } from 'url';
import { nxViteTsPaths } from '@nx/vite/plugins/nx-tsconfig-paths.plugin';
import { defineConfig } from 'vite';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default defineConfig({
  plugins: [
    // Automatically resolves @whizard/* paths from tsconfig.base.json
    nxViteTsPaths(),
  ],
  build: {
    ssr: true,
    target: 'node22',
    outDir: resolve(__dirname, 'dist'),
    emptyOutDir: true,
    rollupOptions: {
      input: resolve(__dirname, 'src/server.ts'),
      output: {
        format: 'esm',
        entryFileNames: 'server.js',
      },
      external: (id) => {
        // Keep all node_modules external except our libs
        if (id.startsWith('@whizard/')) return false;
        if (id.startsWith('.') || id.startsWith('/')) return false;
        return true;
      },
    },
  },
  ssr: {
    // Bundle @whizard packages, keep everything else external
    noExternal: /^@whizard\//,
  },
});
