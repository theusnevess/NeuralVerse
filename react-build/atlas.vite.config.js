import { defineConfig } from 'vite'
import { resolve } from 'path'

const atlasRoot = resolve(__dirname, '../src/atlas/application-integration')

export default defineConfig({
  resolve: {
    alias: {
      'node:crypto': resolve(atlasRoot, 'browser-node-compat.ts'),
      'node:zlib': resolve(atlasRoot, 'browser-node-compat.ts'),
    },
  },
  build: {
    lib: {
      entry: resolve(atlasRoot, 'browser-entry.ts'),
      name: 'NeuralVerseAtlas',
      formats: ['es'],
      fileName: () => 'atlas-browser.js',
    },
    outDir: resolve(__dirname, '../website/dist'),
    emptyOutDir: false,
    copyPublicDir: false,
    minify: 'esbuild',
    sourcemap: false,
    target: 'es2022',
  },
})
