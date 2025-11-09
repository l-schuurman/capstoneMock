import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { TanStackRouterVite } from '@tanstack/router-vite-plugin';
import path from 'path';
import TeamDConfig from '../../teamd.config.mts';

export default defineConfig({
  plugins: [
    react(),
    TanStackRouterVite(),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: TeamDConfig.webAdmin.port,
    proxy: {
      '/api': {
        target: TeamDConfig.api.url.local,
        changeOrigin: true,
      },
    },
  },
  build: {
    outDir: 'dist/client',
    sourcemap: true,
  },
  define: {
    'import.meta.env.VITE_PORT': JSON.stringify(TeamDConfig.webAdmin.port),
  },
});
