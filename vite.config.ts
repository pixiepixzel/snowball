import { defineConfig } from 'vite';

// `base: './'` keeps every asset path relative, so the built `dist/` folder can be
// dropped straight into a Capacitor webDir later without changes.
export default defineConfig({
  base: './',
  server: {
    host: true, // listen on the LAN so a phone on the same Wi-Fi can open it
    port: 5173,
  },
  preview: {
    host: true,
    port: 4173,
  },
  build: {
    target: 'es2020',
    outDir: 'dist',
    chunkSizeWarningLimit: 900,
  },
});
