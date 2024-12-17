import {
	Links,
	LiveReload,
	Meta,
	Outlet,
	Scripts,
	ScrollRestoration,
	useLoaderData,
} from '@remix-run/react'
import type { LinksFunction, LoaderFunctionArgs } from '@remix-run/node'

import './tailwind.css'
import { PreventFlashOnWrongTheme, ThemeProvider, useTheme } from 'remix-themes'
import { themeSessionResolver } from '~/services/theme.server'
import { SidebarProvider } from '~/components/ui/sidebar'
import { QueryClient } from '@tanstack/query-core'
import { QueryClientProvider } from '@tanstack/react-query'
import { getSessionToken } from './services/auth.server'
import { AuthProvider } from './context/auth-provider'

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

export async function loader({ request }: LoaderFunctionArgs) {
	const { getTheme } = await themeSessionResolver(request)
	const token = await getSessionToken(request)
	return {
		theme: getTheme(),
		ENV: {
			API_URL: process.env.API_URL,
		},
		token,
	}
}

const queryClient = new QueryClient()

export default function AppWithProviders() {
	const data = useLoaderData<typeof loader>()
	return (
		<ThemeProvider specifiedTheme={data.theme} themeAction='action/set-theme'>
			<AuthProvider initialToken={data.token ?? null}>
				<App />
			</AuthProvider>
		</ThemeProvider>
	)
}

function App() {
	const data = useLoaderData<typeof loader>()

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
			</body>
		</html>
	)
}
