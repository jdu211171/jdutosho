import { vitePlugin as remix } from '@remix-run/dev'
import { defineConfig } from 'vite'
import tsconfigPaths from 'vite-tsconfig-paths'

declare module '@remix-run/node' {
	interface Future {
		v3_singleFetch: true
	}
}

export default defineConfig({
	plugins: [
		remix({
			future: {
				v3_fetcherPersist: true,
				v3_relativeSplatPath: true,
				v3_throwAbortReason: true,
				v3_singleFetch: true,
				v3_lazyRouteDiscovery: true,
			},
		}),
		tsconfigPaths(),
	],
	optimizeDeps: {
		exclude: [],
		include: [
			'react',
			'react-dom',
			'react/jsx-runtime',
			'react/jsx-dev-runtime',
			'@radix-ui/react-dialog',
			'@radix-ui/react-label',
			'@radix-ui/react-separator',
			'@radix-ui/react-slot',
			'@radix-ui/react-toast',
			'@radix-ui/react-tooltip',
			'@radix-ui/react-dropdown-menu',
			'@radix-ui/react-checkbox',
			'@radix-ui/react-select',
			'@radix-ui/react-switch',
			'@radix-ui/react-tabs',
			'@radix-ui/react-avatar',
			'@radix-ui/react-icons',
			'@radix-ui/react-alert-dialog',
			'@radix-ui/react-scroll-area',
			'@radix-ui/react-popover',
			'@hookform/resolvers/zod',
			'@tanstack/react-query',
			'@tanstack/react-table',
			'clsx',
			'tailwind-merge',
			'class-variance-authority',
			'lucide-react',
			'sonner',
			'zod',
			'axios',
			'date-fns',
			'lodash',
			'react-hook-form',
			'react-day-picker',
			'cmdk',
			'vaul',
			'recharts',
			'embla-carousel-react',
			'input-otp',
			'remix-themes',
			'next-themes',
		],
		force: true,
		esbuildOptions: {
			preserveSymlinks: false,
		},
	},
	resolve: {
		dedupe: ['react', 'react-dom'],
	},
	server: {
		fs: {
			strict: false,
		},
		proxy: {
			'/api': {
				target: 'http://localhost:8000',
				changeOrigin: true,
			},
		},
	},
})
