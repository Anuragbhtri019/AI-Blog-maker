import { defineConfig } from 'vite';
import reactOxC from '@vitejs/plugin-react-oxc';

export default defineConfig({
  plugins: [reactOxC()],
  server: {
    port: 5173,
    strictPort: false,
    // Enable faster HMR
    hmr: {
      overlay: true,
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    chunkSizeWarningLimit: 1000,
    rolldownOptions: {
      output: {
        // Improved code splitting for better caching
        manualChunks: id => {
          if (id.includes('node_modules')) {
            if (
              id.includes('react') ||
              id.includes('react-dom') ||
              id.includes('react-router-dom')
            ) {
              return 'vendor-react';
            }
            if (id.includes('@tanstack/react-query')) {
              return 'vendor-query';
            }
            if (id.includes('framer-motion') || id.includes('lucide-react')) {
              return 'vendor-ui';
            }
          }
        },
      },
    },
  },
  // Optimize dependencies
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      '@tanstack/react-query',
      'zustand',
      'axios',
    ],
  },
  define: {
    'process.env': {},
  },
});
