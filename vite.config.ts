import { defineConfig } from 'vite';
//import { crx } from '@crxjs/vite-plugin';
import manifest from './public/manifest.json';
import { dirname, resolve } from 'path';

export default defineConfig({
  plugins: [
    //crx({ manifest }), // hand it your manifest, it does the rest
  ],
  build: {
    outDir: 'dist',       // output to outDir
    sourcemap: true,
    
    rollupOptions: {
      input: {
        //root dir
        background: "src/background.ts",
        dashboard: "dashboard.html",
        popup: "popup.html",
        content: "src/content.ts"
      },
      output: {
        entryFileNames: '[name].js', //entries
        chunkFileNames: '[name].js', //prob not needed
        assetFileNames: 'assets/[name].[ext]', //css
        format: 'es',
      }
    },
  },
  publicDir: 'public',
});