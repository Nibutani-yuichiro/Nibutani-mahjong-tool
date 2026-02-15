import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  base: '/Nibutani-mahjong-tool/', // Added for GitHub Pages deployment
  server: {
    port: 3900
  },
  plugins: [react()],
})
