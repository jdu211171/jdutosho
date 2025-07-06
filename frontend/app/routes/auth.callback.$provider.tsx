import { LoaderFunctionArgs, redirect } from '@remix-run/node'
import { api } from '~/lib/api'
import { createUserSession } from '~/services/auth.server'
import { LoadingCard } from '~/components/ui/loading-spinner'
import { transformBackendUser } from '~/lib/user-transform'

export async function loader({ request, params }: LoaderFunctionArgs) {
	const provider = params.provider
	const url = new URL(request.url)
	const code = url.searchParams.get('code')
	const state = url.searchParams.get('state')
	const error = url.searchParams.get('error')

	// Handle OAuth errors
	if (error) {
		return redirect(
			`/login?error=${encodeURIComponent('OAuth authentication failed: ' + error)}`
		)
	}

	if (!code) {
		return redirect('/login?error=No authorization code received')
	}

	try {
		// Exchange the code for tokens with the backend
		const response = await api.get(`/auth/callback/${provider}`, {
			params: { code, state },
		})

		const { token, user } = response.data
		const transformedUser = transformBackendUser(user)

		// Create session and redirect
		// The state parameter contains the returnTo URL if it was set
		const returnTo = state ? decodeURIComponent(state) : null
		return createUserSession(token, transformedUser, returnTo)
	} catch (error: any) {
		console.error('OAuth callback error:', error)

		const errorMessage =
			error.response?.data?.message || 'OAuth authentication failed'
		return redirect(`/login?error=${encodeURIComponent(errorMessage)}`)
	}
}

export default function OAuthCallback() {
	// This component is shown briefly while the loader processes
	return (
		<div className='min-h-screen flex items-center justify-center'>
			<LoadingCard message='Completing sign in...' />
		</div>
	)
}
