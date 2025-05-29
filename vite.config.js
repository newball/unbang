import { defineConfig } from "vite";
import { VitePWA } from "vite-plugin-pwa";
import pkg from './package.json';

export default defineConfig({
	define: {
		__APP_VERSION__: JSON.stringify(pkg.version)
	},
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
		rollupOptions: {
			output: {
				manualChunks: {
					vendor: ['lodash', 'workbox-core']
				}
			}
		}
	}
});
