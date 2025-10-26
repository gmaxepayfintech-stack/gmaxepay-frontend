import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import compression from 'vite-plugin-compression';

export default defineConfig({
  plugins: [
    react(),
    compression({
      algorithm: 'brotliCompress', // You can also use 'brotliCompress'
      ext: '.br', // File extension for the compressed files
      deleteOriginalAssets: false // Set to true if you want to delete the original files
    })
  ],
  resolve: {
    alias: [{ find: '@', replacement: '/src' }]
  }
});
