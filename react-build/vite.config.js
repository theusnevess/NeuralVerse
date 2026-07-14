import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

// NV-500-UX-007E.2 — React Islands Build
// Produces a self-contained IIFE bundle with zero runtime CDN dependencies.
// Output: website/dist/react-islands.js
export default defineConfig({
  plugins: [react()],
  server: {
    port: 8080,
    strictPort: true,
    host: true,
  },
  define: {
    'process.env.NODE_ENV': JSON.stringify('production'),
  },
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.jsx'),
      name: 'NeuralVerseReact',
      formats: ['iife'],
      fileName: () => 'react-islands.js',
    },
    outDir: resolve(__dirname, '../website/dist'),
    emptyOutDir: false,   // never wipe website/dist contents we don't own
    copyPublicDir: false,
    rollupOptions: {
      output: {
        inlineDynamicImports: true,
      },
    },
    minify: 'esbuild',
    sourcemap: false,
  },
})
