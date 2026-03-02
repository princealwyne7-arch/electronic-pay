import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: './',        // ensures CSS/JS assets load correctly
  plugins: [react()],
  build: {
    outDir: 'dist'   // build output folder
  }
})
