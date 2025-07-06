import { ActionFunctionArgs, LoaderFunctionArgs } from '@remix-run/node'
import {
	json,
	redirect,
	useActionData,
	useLoaderData,
	useNavigate,
	useNavigation,
} from '@remix-run/react'
import { toast } from '~/hooks/use-toast'
import { api } from '~/lib/api'
import {
	requireLibrarianUser,
	makeAuthenticatedRequest,
} from '~/services/auth.server'
import { BookForm } from '~/components/book-form'
import { Button } from '~/components/ui/button'
import type { Category, BookFormFieldErrors } from '~/types/books'
import { FileDown, Eye } from 'lucide-react'
import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card'

export function meta() {
	return [
		{ title: 'Edit Book' },
		{ description: 'Edit book details and codes' },
	]
}

type ActionData = {
	error?: string
	fieldErrors?: BookFormFieldErrors
}

type LoaderData = {
	book: {
		id: number
		name: string
		author: string
		language: string
		category_id: number
		category: string
		codes: Array<{
			id: number
			code: string
			status: string
		}>
		has_pdf?: boolean
		pdf_url?: string
	}
	categories: Category[]
}

export async function loader({ request, params }: LoaderFunctionArgs) {
	await requireLibrarianUser(request)

	return await makeAuthenticatedRequest(request, async () => {
		const [bookResponse, categoriesResponse] = await Promise.all([
			api.get(`/books/${params.id}`),
			api.get('/book-categories', { params: { list: true } }),
		])

		return json<LoaderData>({
			book: bookResponse.data.data,
			categories: categoriesResponse.data.data,
		})
	})
}

export async function action({ request, params }: ActionFunctionArgs) {
	await requireLibrarianUser(request)
	const formData = await request.formData()

	const name = formData.get('name')
	const author = formData.get('author')
	const language = formData.get('language')
	const category = formData.get('category')
	const codes = formData.getAll('codes')
	const pdf = formData.get('pdf') as File | null

	const fieldErrors: ActionData['fieldErrors'] = {}
	if (!name) fieldErrors.name = 'Name is required'
	if (!author) fieldErrors.author = 'Author is required'
	if (!language) fieldErrors.language = 'Language is required'
	if (!category) fieldErrors.category = 'Category is required'
	if (!codes.length) fieldErrors.codes = 'At least one code is required'

	if (language && !['uz', 'ru', 'en', 'ja'].includes(language.toString())) {
		fieldErrors.language = 'Invalid language selected'
	}

	const uniqueCodes = new Set(codes)
	if (uniqueCodes.size !== codes.length) {
		fieldErrors.codes = 'Duplicate codes are not allowed'
	}

	// Validate PDF if provided
	if (pdf && pdf.size > 0) {
		if (pdf.type !== 'application/pdf') {
			fieldErrors.pdf = 'Only PDF files are allowed'
		} else if (pdf.size > 10 * 1024 * 1024) {
			fieldErrors.pdf = 'PDF file must be less than 10MB'
		}
	}

	if (Object.keys(fieldErrors).length > 0) {
		return json<ActionData>({ fieldErrors }, { status: 400 })
	}

	return await makeAuthenticatedRequest(request, async () => {
		// Update book details with FormData if PDF is being uploaded
		if (pdf && pdf.size > 0) {
			const bookFormData = new FormData()
			bookFormData.append('name', name as string)
			bookFormData.append('author', author as string)
			bookFormData.append('language', language as string)
			bookFormData.append('category', category as string)
			bookFormData.append('pdf', pdf)
			bookFormData.append('_method', 'PUT')

			await api.post(`/books/${params.id}`, bookFormData, {
				headers: {
					'Content-Type': 'multipart/form-data',
				},
			})
		} else {
			// Update without PDF
			await api.put(`/books/${params.id}`, {
				name,
				author,
				language,
				category,
			})
		}

		// Update book codes
		await api.put(`/books/${params.id}/code`, {
			codes: Array.from(codes),
		})

		return redirect('/librarian/books')
	})
}

export default function EditBookPage() {
	const actionData = useActionData<ActionData>()
	const { book, categories } = useLoaderData<LoaderData>()
	const navigate = useNavigate()
	const navigation = useNavigation()
	const isSubmitting = navigation.state === 'submitting'

	if (actionData?.error) {
		toast({
			title: 'Error',
			description: actionData.error,
			variant: 'destructive',
		})
	}

	const formValues = {
		name: book.name,
		author: book.author,
		language: book.language,
		category: book.category_id.toString(),
		codes: book.codes.map(code => code.code),
		has_pdf: book.has_pdf,
		pdf_url: book.pdf_url,
	}

	return (
		<div className='mx-auto max-w-lg space-y-4'>
			<BookForm
				initialValues={formValues}
				categories={categories}
				actionData={actionData}
				isSubmitting={isSubmitting}
			/>

			<div className='mt-4'>
				<Button
					type='button'
					variant='outline'
					onClick={() => navigate(-1)}
					disabled={isSubmitting}
				>
					Cancel
				</Button>
			</div>
		</div>
	)
}
