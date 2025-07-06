import { isRouteErrorResponse, useRouteError } from '@remix-run/react'
import { AlertCircle, Home, RefreshCw } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '~/components/ui/alert'
import { Button } from '~/components/ui/button'
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '~/components/ui/card'

export function ErrorBoundary() {
	const error = useRouteError()

	if (isRouteErrorResponse(error)) {
		if (error.status === 404) {
			return (
				<div className='min-h-screen flex items-center justify-center p-4'>
					<Card className='max-w-md w-full'>
						<CardHeader>
							<div className='flex items-center gap-2'>
								<AlertCircle className='h-8 w-8 text-destructive' />
								<CardTitle className='text-2xl'>Page Not Found</CardTitle>
							</div>
							<CardDescription>
								The page you're looking for doesn't exist or has been moved.
							</CardDescription>
						</CardHeader>
						<CardContent className='flex gap-2'>
							<Button
								variant='default'
								onClick={() => (window.location.href = '/')}
							>
								<Home className='mr-2 h-4 w-4' />
								Go Home
							</Button>
							<Button variant='outline' onClick={() => window.history.back()}>
								Go Back
							</Button>
						</CardContent>
					</Card>
				</div>
			)
		}

		if (error.status === 401) {
			return (
				<div className='min-h-screen flex items-center justify-center p-4'>
					<Card className='max-w-md w-full'>
						<CardHeader>
							<div className='flex items-center gap-2'>
								<AlertCircle className='h-8 w-8 text-destructive' />
								<CardTitle className='text-2xl'>Unauthorized</CardTitle>
							</div>
							<CardDescription>
								You need to be logged in to access this page.
							</CardDescription>
						</CardHeader>
						<CardContent>
							<Button
								variant='default'
								onClick={() => (window.location.href = '/login')}
								className='w-full'
							>
								Go to Login
							</Button>
						</CardContent>
					</Card>
				</div>
			)
		}

		if (error.status === 403) {
			return (
				<div className='min-h-screen flex items-center justify-center p-4'>
					<Card className='max-w-md w-full'>
						<CardHeader>
							<div className='flex items-center gap-2'>
								<AlertCircle className='h-8 w-8 text-destructive' />
								<CardTitle className='text-2xl'>Access Denied</CardTitle>
							</div>
							<CardDescription>
								You don't have permission to access this resource.
							</CardDescription>
						</CardHeader>
						<CardContent className='flex gap-2'>
							<Button
								variant='default'
								onClick={() => (window.location.href = '/')}
							>
								<Home className='mr-2 h-4 w-4' />
								Go Home
							</Button>
							<Button variant='outline' onClick={() => window.history.back()}>
								Go Back
							</Button>
						</CardContent>
					</Card>
				</div>
			)
		}

		return (
			<div className='min-h-screen flex items-center justify-center p-4'>
				<Card className='max-w-md w-full'>
					<CardHeader>
						<div className='flex items-center gap-2'>
							<AlertCircle className='h-8 w-8 text-destructive' />
							<CardTitle className='text-2xl'>
								{error.status} {error.statusText || 'Error'}
							</CardTitle>
						</div>
						<CardDescription>
							{error.data || 'An unexpected error occurred.'}
						</CardDescription>
					</CardHeader>
					<CardContent className='flex gap-2'>
						<Button
							variant='default'
							onClick={() => (window.location.href = '/')}
						>
							<Home className='mr-2 h-4 w-4' />
							Go Home
						</Button>
						<Button variant='outline' onClick={() => window.location.reload()}>
							<RefreshCw className='mr-2 h-4 w-4' />
							Try Again
						</Button>
					</CardContent>
				</Card>
			</div>
		)
	}

	// Handle non-route errors
	let errorMessage = 'Unknown error'
	if (error instanceof Error) {
		errorMessage = error.message
	} else if (typeof error === 'string') {
		errorMessage = error
	}

	return (
		<div className='min-h-screen flex items-center justify-center p-4'>
			<Alert variant='destructive' className='max-w-2xl'>
				<AlertCircle className='h-4 w-4' />
				<AlertTitle>Something went wrong!</AlertTitle>
				<AlertDescription className='mt-2'>
					<p className='mb-4'>{errorMessage}</p>
					<div className='flex gap-2'>
						<Button
							variant='default'
							size='sm'
							onClick={() => (window.location.href = '/')}
						>
							<Home className='mr-2 h-4 w-4' />
							Go Home
						</Button>
						<Button
							variant='outline'
							size='sm'
							onClick={() => window.location.reload()}
						>
							<RefreshCw className='mr-2 h-4 w-4' />
							Reload Page
						</Button>
					</div>
				</AlertDescription>
			</Alert>
		</div>
	)
}
