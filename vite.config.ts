import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/LearnMate/', // Needed for GitHub Pages
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-markdown', 'mermaid', '@google/generative-ai'],
        },
      },
    },
  },
})


