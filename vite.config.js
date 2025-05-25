import { defineConfig } from "vite";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    VitePWA({
      registerType: "autoUpdate",
      workbox: {
        maximumFileSizeToCacheInBytes: 6 * 1024 * 1024, // 5MB
      }
    }),
  ],
  build: {
    chunkSizeWarningLimit: 1000,
    rollupOPtions: {
      output: {
        manualChunks: {
          vendor: ['lodash', 'workbox-core']
        }
      }
    }
  }
});
