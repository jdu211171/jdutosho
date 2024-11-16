import { isRouteErrorResponse, Link, useRouteError } from '@remix-run/react'
import { logout } from '~/lib/utils/auth'

export function AuthErrorBoundary() {
	const error = useRouteError()

	if (isRouteErrorResponse(error)) {
		// Handle specific HTTP status codes
		if (error.status === 401) {
			return (
				<div className='flex items-center min-h-screen px-4 py-12 sm:px-6 md:px-8 lg:px-12 xl:px-16'>
					<div className='w-full space-y-6 text-center'>
						<div className='space-y-3'>
							<h1 className='text-4xl font-bold tracking-tighter sm:text-5xl animate-bounce'>
								401
							</h1>
							<p className='text-gray-500'>
								Your session has expired. Please log in again.
							</p>
						</div>
						<Link
							to='#'
							className='inline-flex h-10 items-center rounded-md bg-gray-900 px-8 text-sm font-medium text-gray-50 shadow transition-colors hover:bg-gray-900/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gray-950 disabled:pointer-events-none disabled:opacity-50 dark:bg-gray-50 dark:text-gray-900 dark:hover:bg-gray-50/90 dark:focus-visible:ring-gray-300'
							onClick={() => logout()}
						>
							Go to Login
						</Link>
					</div>
				</div>
			)
		}
	}

	// Fallback error handling
	return (
		<div>
			<h1>Unexpected Error</h1>
			<p>Something went wrong.</p>
		</div>
	)
}
