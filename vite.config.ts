import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  server: {
    host: '0.0.0.0',
    port: process.env.PORT ? parseInt(process.env.PORT) : 5173,
    allowedHosts: [
      'localhost',
      '127.0.0.1',
      'dnav1.up.railway.app',
      '.railway.app',
      '.up.railway.app',
      '3000-ib5ju059t6m5xshrl4goh-85028021.manusvm.computer'
    ]
  },
  preview: {
    host: '0.0.0.0',
    port: process.env.PORT ? parseInt(process.env.PORT) : 5173,
    allowedHosts: [
      'localhost',
      '127.0.0.1', 
      'dnav1.up.railway.app',
      '.railway.app',
      '.up.railway.app',
      '3000-ib5ju059t6m5xshrl4goh-85028021.manusvm.computer'
    ]
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          router: ['react-router-dom'],
          ui: ['lucide-react', 'framer-motion'],
          supabase: ['@supabase/supabase-js']
        }
      }
    }
  },
  envDir: './',
  envPrefix: 'VITE_'
});


