import { LoaderFunctionArgs, json } from '@remix-run/node'
import { Link, useLocation } from '@remix-run/react'
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '~/components/ui/card'
import { Button } from '~/components/ui/button'
import { Home, AlertCircle } from 'lucide-react'

export async function loader({ request }: LoaderFunctionArgs) {
	const url = new URL(request.url)

	// Handle .well-known paths and other Chrome/browser specific requests
	if (
		url.pathname.startsWith('/.well-known') ||
		url.pathname.endsWith('.json') ||
		url.pathname.includes('favicon') ||
		url.pathname.includes('apple-touch-icon')
	) {
		// Return empty response for these requests to avoid console errors
		return json({}, { status: 404 })
	}

	// For actual 404 pages, throw to show the error boundary
	throw new Response('Not Found', { status: 404 })
}

export default function CatchAll() {
	const location = useLocation()

	return (
		<div className='min-h-screen flex items-center justify-center p-4'>
			<Card className='max-w-md w-full'>
				<CardHeader>
					<div className='flex items-center gap-2'>
						<AlertCircle className='h-8 w-8 text-destructive' />
						<CardTitle className='text-2xl'>Page Not Found</CardTitle>
					</div>
					<CardDescription>
						The page "{location.pathname}" doesn't exist or has been moved.
					</CardDescription>
				</CardHeader>
				<CardContent className='flex gap-2'>
					<Link to='/'>
						<Button variant='default'>
							<Home className='mr-2 h-4 w-4' />
							Go Home
						</Button>
					</Link>
					<Button variant='outline' onClick={() => window.history.back()}>
						Go Back
					</Button>
				</CardContent>
			</Card>
		</div>
	)
}
