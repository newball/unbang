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
				entryFileNames:   'js/[name].[hash].js',
				chunkFileNames:   'js/[name].[hash].js',
				assetFileNames: assetInfo => {
					const ext = assetInfo.name?.split('.').pop()
					if (ext === 'css')        return 'css/[name].[hash][extname]'
					if (/(png|jpe?g|svg|gif|webp)$/.test(ext)) return 'img/[name].[hash][extname]'
					return 'assets/[name].[hash][extname]'
				},
				manualChunks: {
					vendor: ['lodash', 'workbox-core']
				}
			}
		}
	}
});
