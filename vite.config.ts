import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: './', // Ensures assets work on GitHub Pages regardless of repo name
  define: {
    'process.env.API_KEY': JSON.stringify(process.env.API_KEY)
  }
})
