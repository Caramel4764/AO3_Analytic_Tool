import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    outDir: 'dist',       // output to outDir
    rollupOptions: {
      input: {
        background_script: "src/background.js",
        dashboard: "./dashboard.html",
        dashboard_script: "src/dashboard/dashboard.js",
        popup: "./popup.html",
        popup_script: "src/popup/popup.js",
        Ao3AddTrack_script: "src/Ao3AddTrack.js"
      },
      output: {
        entryFileNames: '[name].js', //entries
        //chunkFileNames: '[name].js', prob not needed
        assetFileNames: 'assets/[name].[ext]', //css
      }
    },
  },
  publicDir: 'public',
});