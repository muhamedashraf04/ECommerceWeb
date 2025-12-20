import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'https://deployment.mangoisland-dd0744d7.italynorth.azurecontainerapps.io', // Your Docker Backend Port
        changeOrigin: true,
        secure: false,
      },
    },
  },
})