import { defineConfig } from 'vite';
//import { crx } from '@crxjs/vite-plugin';

export default defineConfig({
  plugins: [
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
        content: "src/content.ts",
        help: "help.html",
        option: "option.html"
      },
      output: {
        entryFileNames: '[name].js', //entries
        chunkFileNames: '[name].js', //prob not needed
        assetFileNames: 'assets/[name].[ext]', //css
        inlineDynamicImports: false,
        format: 'es'
      }
    },
  },
  publicDir: 'public',
});