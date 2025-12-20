import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // Any request starting with /api will be forwarded to Azure
      '/api': {
        target: 'https://deployment.mangoisland-dd0744d7.italynorth.azurecontainerapps.io',
        changeOrigin: true,
        secure: false,
      }
    }
  }
})