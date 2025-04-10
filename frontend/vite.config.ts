import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  server: {
    host: '0.0.0.0', // Bind to all network interfaces
    port: 5173,      // Explicit port
    strictPort: true // Fail if port is occupied
  },
  preview: {
    host: '0.0.0.0', // Also bind preview server
    port: 5173
  }
});
