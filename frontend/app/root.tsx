import {
	Links,
	LiveReload,
	Meta,
	Outlet,
	Scripts,
	ScrollRestoration,
} from '@remix-run/react'
import type { LinksFunction } from '@remix-run/node'

import './tailwind.css'
import {
	PreventFlashOnWrongTheme,
	Theme,
	ThemeProvider,
	useTheme,
} from 'remix-themes'
import { LoaderFunction, useLoaderData } from 'react-router'
import { themeSessionResolver } from '~/services/theme.server'
import { SidebarProvider } from '~/components/ui/sidebar'
import { QueryClient } from '@tanstack/query-core'
import { QueryClientProvider } from '@tanstack/react-query'

export const links: LinksFunction = () => [
	{ rel: 'preconnect', href: 'https://fonts.googleapis.com' },
	{
		rel: 'preconnect',
		href: 'https://fonts.gstatic.com',
		crossOrigin: 'anonymous',
	},
	{
		rel: 'stylesheet',
		href: 'https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap',
	},
]

export const loader: LoaderFunction = async ({ request }) => {
	const { getTheme } = await themeSessionResolver(request)
	return {
		theme: getTheme(),
	}
}

type LoaderData = {
	theme: Theme
}

const queryClient = new QueryClient()

export default function AppWithProviders() {
	const data = useLoaderData() as LoaderData
	return (
		<ThemeProvider specifiedTheme={data.theme} themeAction='action/set-theme'>
			<App />
		</ThemeProvider>
	)
}

function App() {
	const data = useLoaderData() as LoaderData
	const [theme] = useTheme()
	return (
		<html lang='en' className={theme ?? ''}>
			<head>
				<meta charSet='utf-8' />
				<meta name='viewport' content='width=device-width,initial-scale=1' />
				<Meta />
				<PreventFlashOnWrongTheme ssrTheme={Boolean(data.theme)} />
				<Links />
				<title />
			</head>
			<body>
				<SidebarProvider>
					<QueryClientProvider client={queryClient}>
						<Outlet />
					</QueryClientProvider>
				</SidebarProvider>
				<ScrollRestoration />
				<Scripts />
				{process.env.NODE_ENV === 'development' && <LiveReload />}
			</body>
		</html>
	)
}
