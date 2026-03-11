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
        // Keep all node_modules external except our libs
        if (id.startsWith('@whizard/')) return false;
        if (id.startsWith('.') || id.startsWith('/')) return false;
        return true;
      },
    },
  },
  ssr: {
    // Keep node_modules external (only bundle our code)
    // But bundle @whizard/* libs
    noExternal: [/^@whizard\//],
  },
});
