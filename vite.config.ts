import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => ({
  base: mode === 'production' ? '/meridian-atlas/' : '/',
  plugins: [react()],
  build: {
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks: {
          'three-vendor': ['three', '@react-three/fiber'],
          'motion-vendor': ['framer-motion'],
          'katex-vendor': ['katex'],
        },
      },
    },
  },
}));
