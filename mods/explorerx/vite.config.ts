import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [react()],
  root: 'web',
  build: {
    outDir: 'dist',
    emptyOutDir: true
  },
  base: '/explorerx/'
}); 