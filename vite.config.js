import { fileURLToPath } from 'node:url';
import { defineConfig } from "vite";
import { VitePWA } from "vite-plugin-pwa";
import pkg from './package.json';

export default defineConfig({
	appType: 'mpa',
	define: {
		__APP_VERSION__: JSON.stringify(pkg.version)
	},
	plugins: [
		VitePWA({
			registerType: "autoUpdate",
			manifest: {
				name: 'Unbang',
				short_name: 'Unbang',
				description: 'Your personal search engine with bangs',
				theme_color: '#fafafa',
				background_color: '#fafafa',
				icons: [
					{ src: 'img/favicon.svg', sizes: 'any', type: 'image/svg+xml' },
					{ src: 'img/favicon.png', sizes: '512x512', type: 'image/png' }
				]
			},
			workbox: {
				navigateFallback: null,
				// Match the cached home page while leaving the search query in the browser URL.
				ignoreURLParametersMatching: [/^utm_/, /^fbclid$/, /^q$/],
				globPatterns: ['**/*.{html,js,css,woff2,svg,png,xml}'],
				maximumFileSizeToCacheInBytes: 3 * 1024 * 1024,
			}
		}),
	],
	build: {
		// The shared chunk includes the catalog so direct searches can resolve without another request.
		chunkSizeWarningLimit: 3000,
		rollupOptions: {
			input: {
				index: fileURLToPath(new URL('./index.html', import.meta.url)),
				bang: fileURLToPath(new URL('./bang.html', import.meta.url))
			}
		}
	},
	test: {
		globals: true,
		environment: 'jsdom'
	}
});
