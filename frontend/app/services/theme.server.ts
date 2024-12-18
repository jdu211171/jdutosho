import { createCookieSessionStorage } from '@remix-run/node'
import { createThemeSessionResolver } from 'remix-themes'

const themeStorage = createCookieSessionStorage({
	cookie: {
		name: '__theme',
		path: '/',
		httpOnly: true,
		sameSite: 'lax',
		secrets: ['s3cr3t'],
		secure: process.env.NODE_ENV === 'production',
		maxAge: 34560000, // 400 days
	},
})

export const themeSessionResolver = createThemeSessionResolver(themeStorage)
