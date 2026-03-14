import { defineConfig } from 'vite';
import { nxViteTsPaths } from '@nx/vite/plugins/nx-tsconfig-paths.plugin';
import { resolve } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

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
        // Preserve module format for Prisma Client
        preserveModules: false,
      },
      external: (id) => {
        // Keep all node_modules external (including @whizard/* workspace libs)
        // BFF only does HTTP proxying, no need to bundle libs
        if (id.startsWith('.') || id.startsWith('/')) return false;
        return true;
      },
    },
  },
  ssr: {
    // Keep all node_modules external (BFF now only does HTTP proxying)
    // No need to bundle @whizard/* libs anymore since we call Core-API via HTTP
    noExternal: [],
  },
});
