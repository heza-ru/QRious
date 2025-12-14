import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    strictPort: true,
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    // Optimize for mobile
    target: 'esnext',
    minify: 'esbuild',
    chunkSizeWarningLimit: 1000,
  },
  worker: {
    format: 'es',
  },
  // Content Security Policy
  define: {
    'process.env': {},
  },
  // Optimize dependencies
  optimizeDeps: {
    include: ['react', 'react-dom', 'framer-motion'],
  },
})

