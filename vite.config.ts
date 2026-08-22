import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss()],
    build: {
      rollupOptions: {
        input: {
          main: path.resolve(__dirname, 'index.html'),
          incidents: path.resolve(__dirname, 'incidents.html'),
          inventory: path.resolve(__dirname, 'inventory.html'),
          procurement: path.resolve(__dirname, 'procurement.html'),
          approvals: path.resolve(__dirname, 'approvals.html'),
          workforce: path.resolve(__dirname, 'workforce.html'),
          reports: path.resolve(__dirname, 'reports.html'),
          audit: path.resolve(__dirname, 'audit.html'),
          admin: path.resolve(__dirname, 'admin.html'),
        },
      },
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
