import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    outDir: 'dist',       // output to outDir
    rollupOptions: {
      input: {
        popup: "src/popup/popup.html",
        dashboard: "src/dashboard/dashboard.html",
      }
    },
  },
  publicDir: 'public',
});