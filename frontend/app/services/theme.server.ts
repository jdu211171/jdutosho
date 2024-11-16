import { createThemeSessionResolver } from 'remix-themes'
import { createCookieSessionStorage } from '@remix-run/node'

const isProduction = process.env.NODE_ENV === 'production'

const sessionStorage = createCookieSessionStorage({
	cookie: {
		name: 'theme',
		path: '/',
		httpOnly: true,
		sameSite: 'lax',
		secrets: ['s3cr3t'],
		...(isProduction ? { domain: 'jdutosho.uz', secure: true } : {}),
	},
})

export const themeSessionResolver = createThemeSessionResolver(sessionStorage)
