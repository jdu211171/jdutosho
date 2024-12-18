import { useLoaderData, useSearchParams } from '@remix-run/react'
import type { LoaderFunctionArgs, ActionFunctionArgs } from '@remix-run/node'
import { api } from '~/lib/api'
import { requireLibrarianUser } from '~/services/auth.server'
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card'
import { BookOpen, CalendarDays, User } from 'lucide-react'
import { Button } from '~/components/ui/button'
import { useFetcher } from '@remix-run/react'
import { toast } from '~/hooks/use-toast'
import { useEffect } from 'react'

type PendingReturn = {
	id: number
	book_code: string
	status: string
	book: string
	taken_by: string
	taken_by_login_id: string
	given_by: string
	given_date: string
	return_date: string
	passed_days: number
}

export async function loader({ request }: LoaderFunctionArgs) {
	const user = await requireLibrarianUser(request)
	const url = new URL(request.url)
	const page = url.searchParams.get('page') || '1'
	const search = url.searchParams.get('search') || ''

	try {
		const response = await api.get<{ data: PendingReturn[] }>(
			'/rents/pending',
			{
				params: {
					page,
					search,
				},
				headers: {
					Authorization: `Bearer ${user.token}`,
				},
			}
		)
		return {
			returns: response.data.data,
			meta: response.data.meta,
			currentPage: parseInt(page),
			search,
		}
	} catch (error) {
		console.error('Error fetching pending returns:', error)
		return { returns: [], meta: {}, currentPage: 1, search: '' }
	}
}

export async function action({ request }: ActionFunctionArgs) {
	const user = await requireLibrarianUser(request)
	const formData = await request.formData()
	const rentId = formData.get('rentId')
	const loginId = formData.get('loginId')
	const bookCode = formData.get('bookCode')
	const action = formData.get('action')

	console.log('Form data:', {
		rentId,
		loginId,
		bookCode,
		action,
	})

	try {
		if (action === 'reject') {
			return { success: false, message: 'Reject not implemented yet' }
		}

		console.log('Sending request with:', {
			login_id: loginId,
			book_code: bookCode,
		})

		const response = await api.put(
			`/rents/${rentId}/accept`,
			{
				login_id: loginId,
				book_code: bookCode,
			},
			{
				headers: {
					Authorization: `Bearer ${user.token}`,
					'Content-Type': 'application/json',
					Accept: 'application/json',
				},
			}
		)

		if (response.status === 200) {
			return { success: true }
		}

		return { success: false }
	} catch (error: any) {
		console.error('Accept return error:', {
			data: error.response?.data,
			status: error.response?.status,
			formData: {
				loginId,
				bookCode,
			},
		})
		return {
			success: false,
			message: error.response?.data?.message || 'Failed to process return',
		}
	}
}

function ReturnCard({ pendingReturn }: { pendingReturn: PendingReturn }) {
	const fetcher = useFetcher<{ success: boolean }>()
	const isAccepting = fetcher.state !== 'idle'

	useEffect(() => {
		if (fetcher.state === 'idle' && fetcher.data?.success === true) {
			toast({
				title: 'Return accepted',
				description: 'The book return has been accepted successfully',
			})
		} else if (fetcher.state === 'idle' && fetcher.data?.success === false) {
			toast({
				title: 'Failed to accept return',
				description: 'There was an error accepting the return',
				variant: 'destructive',
			})
		}
	}, [fetcher.state, fetcher.data?.success])

	return (
		<Card
			className={`relative ${pendingReturn.status === 'pending' ? 'border-yellow-500' : ''}`}
		>
			<CardHeader>
				<div className='flex justify-between items-start'>
					<div>
						<CardTitle className='text-lg font-bold'>
							{pendingReturn.book}
						</CardTitle>
						<p className='text-sm text-muted-foreground'>
							Code: {pendingReturn.book_code}
						</p>
					</div>
					<span className='px-2 py-1 shrink-0 absolute right-2 top-2 rounded-full bg-yellow-100 text-yellow-800 text-xs font-medium'>
						Pending Return
					</span>
				</div>
			</CardHeader>
			<CardContent className='space-y-3'>
				<div className='flex items-center space-x-2'>
					<User className='h-4 w-4 shrink-0 text-muted-foreground' />
					<span className='text-sm'>Student: {pendingReturn.taken_by}</span>
				</div>
				<div className='flex items-center space-x-2'>
					<CalendarDays className='h-4 w-4 shrink-0 text-muted-foreground' />
					<span className='text-sm'>
						Return requested: {pendingReturn.return_date}
					</span>
				</div>
				<div className='flex items-center space-x-2'>
					<CalendarDays className='h-4 w-4 shrink-0 text-muted-foreground' />
					<span className='text-sm'>
						Borrowed on: {pendingReturn.given_date}
						<span className='ml-1 text-muted-foreground'>
							({pendingReturn.passed_days} days ago)
						</span>
					</span>
				</div>
				<fetcher.Form method='post'>
					<input type='hidden' name='rentId' value={pendingReturn.id} />
					<input type='hidden' name='loginId' value={pendingReturn.taken_by} />
					<input
						type='hidden'
						name='bookCode'
						value={pendingReturn.book_code}
					/>
					<div className='flex gap-2'>
						<Button type='submit' className='flex-1' disabled={isAccepting}>
							Accept Return
						</Button>
						<Button
							type='submit'
							name='action'
							value='reject'
							variant='destructive'
							className='flex-1'
							disabled={isAccepting}
						>
							Reject
						</Button>
					</div>
				</fetcher.Form>
			</CardContent>
		</Card>
	)
}

export default function LibrarianRentsPendingPage() {
	const { returns, meta, currentPage, search } = useLoaderData<typeof loader>()
	const [, setSearchParams] = useSearchParams()

	const handlePageChange = (page: number) => {
		setSearchParams(prev => {
			prev.set('page', page.toString())
			return prev
		})
	}

	const handleSearch = (search: string) => {
		setSearchParams(prev => {
			if (search) {
				prev.set('search', search)
			} else {
				prev.delete('search')
			}
			prev.set('page', '1')
			return prev
		})
	}

	if (returns.length === 0) {
		return (
			<div className='space-y-6'>
				<h1 className='text-3xl font-bold'>Pending Returns</h1>
				<Card className='mx-auto max-w-md text-center'>
					<CardContent className='pt-6'>
						<BookOpen className='mx-auto h-12 w-12 text-muted-foreground opacity-50' />
						<p className='mt-4 text-sm text-muted-foreground'>
							No pending returns at the moment
						</p>
					</CardContent>
				</Card>
			</div>
		)
	}

	return (
		<div className='space-y-6'>
			<div className='flex justify-between items-center'>
				<div>
					<h1 className='text-3xl font-bold'>Return Requests</h1>
					<p className='text-muted-foreground'>
						Review and process book return requests from students
					</p>
				</div>
				<div className='flex items-center gap-2'>
					<input
						type='text'
						placeholder='Search returns...'
						className='px-3 py-1 border rounded-md'
						value={search}
						onChange={e => handleSearch(e.target.value)}
					/>
				</div>
			</div>

			<div className='grid gap-4 md:grid-cols-2 lg:grid-cols-3'>
				{returns.map(pendingReturn => (
					<ReturnCard key={pendingReturn.id} pendingReturn={pendingReturn} />
				))}
			</div>

			{meta.last_page > 1 && (
				<div className='flex justify-center gap-2 mt-4'>
					{Array.from({ length: meta.last_page }, (_, i) => (
						<button
							key={i + 1}
							onClick={() => handlePageChange(i + 1)}
							className={`px-3 py-1 rounded ${
								currentPage === i + 1
									? 'bg-primary text-primary-foreground'
									: 'bg-secondary'
							}`}
						>
							{i + 1}
						</button>
					))}
				</div>
			)}
		</div>
	)
}
