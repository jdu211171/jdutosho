import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useNavigate, useParams, useSubmit } from '@remix-run/react'
import { z } from 'zod'
import { Form } from '~/components/ui/form'
import { Button } from '~/components/ui/button'
import type { ActionFunctionArgs } from '@remix-run/node'
import { json, redirect } from '@remix-run/node'
import { api } from '~/lib/api'
import {
	requireLibrarianUser,
	makeAuthenticatedRequest,
} from '~/services/auth.server'
import { SearchableSelect } from '~/components/searchable-select'

export function meta() {
	return [{ title: 'Lend Book' }, { description: 'Lend a book to a student' }]
}

const lendingSchema = z.object({
	studentId: z.string().min(1, 'Student ID is required'),
})

type LendingFormValues = z.infer<typeof lendingSchema>

export async function action({ request, params }: ActionFunctionArgs) {
	await requireLibrarianUser(request)
	const formData = await request.formData()
	const studentId = formData.get('studentId')
	const bookId = params.bookId

	if (typeof studentId !== 'string') {
		return json({ error: 'Invalid student ID' }, { status: 400 })
	}

	return await makeAuthenticatedRequest(request, async () => {
		await api.post('/rents', {
			book_code: bookId,
			login_id: studentId,
		})
		return redirect('/librarian/books')
	})
}

export default function LendBookPage() {
	const navigate = useNavigate()
	const params = useParams()
	const submit = useSubmit()

	const form = useForm<LendingFormValues>({
		resolver: zodResolver(lendingSchema),
	})

	const onSubmit = (data: LendingFormValues) => {
		const formData = new FormData()
		formData.append('studentId', data.studentId)
		submit(formData, { method: 'post' })
	}

	return (
		<div className='max-w-2xl mx-auto p-6'>
			<div className='flex justify-between items-center mb-6'>
				<div>
					<h1 className='text-2xl font-bold'>Lend Book</h1>
					<p className='text-muted-foreground'>
						Select a student to lend the book to
					</p>
				</div>
			</div>

			<Form {...form}>
				<form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6'>
					<SearchableSelect
						form={form}
						name='studentId'
						label='Student'
						placeholder='Search for student...'
						searchEndpoint='/librarian/students/search'
						getOptionLabel={item => item.loginID}
						getOptionValue={item => item.loginID}
					/>
					<div className='flex justify-end gap-4'>
						<Button
							variant='outline'
							type='button'
							onClick={() => navigate(-1)}
						>
							Cancel
						</Button>
						<Button type='submit'>Lend Book</Button>
					</div>
				</form>
			</Form>
		</div>
	)
}
