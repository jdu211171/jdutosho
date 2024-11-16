import { createCookieSessionStorage, redirect } from '@remix-run/node'
import { User } from '~/types/auth'
import { AUTH_COOKIE_NAME } from '~/lib/utils/auth'

export const sessionStorage = createCookieSessionStorage({
	cookie: {
		name: 'auth_session',
		secure: process.env.NODE_ENV === 'production',
		secrets: ['your-secret-key'], // Replace with your secret
		sameSite: 'lax',
		path: '/',
		maxAge: 60 * 60 * 24 * 30, // 30 days
		httpOnly: true,
	},
})

export async function createUserSession(token: string, user: User) {
	const session = await sessionStorage.getSession()
	session.set('token', token)
	session.set('user', user)

	return redirect(
		user.role === 'librarian' ? '/librarian/books' : '/student/books',
		{
			headers: {
				'Set-Cookie': await sessionStorage.commitSession(session),
			},
		}
	)
}

export async function serverLogout() {
	return redirect('/login', {
		headers: {
			'Set-Cookie': `${AUTH_COOKIE_NAME}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; HttpOnly; SameSite=Strict`,
		},
	})
}

export async function getUserSession(request: Request) {
	const session = await sessionStorage.getSession(request.headers.get('Cookie'))
	return {
		token: session.get('token'),
		user: session.get('user'),
	}
}
