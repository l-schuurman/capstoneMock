import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { TanStackRouterVite } from '@tanstack/router-vite-plugin';
import path from 'path';
import TeamDConfig from '../../teamd.config';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  return {
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
      port: TeamDConfig.webUser.port,
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
  };
});
