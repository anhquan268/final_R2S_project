// vite.config.ts
import { defineConfig } from 'vite'

export default defineConfig({
  build: {
    target: 'esnext',
    outDir: 'dist',
  },
  base: '/R2S-Client/',  // Correct the base path if necessary
})