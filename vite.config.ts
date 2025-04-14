// vite.config.ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/R2S-Client/', // 👈 đúng với tên repo GitHub của bạn
})