import type { ActionFunctionArgs } from '@remix-run/node'
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

export function meta() {
	return [
		{ title: 'New Book' },
		{ description: 'Add a new book to the library' },
	]
}

type ActionData = {
	error?: string
	fieldErrors?: BookFormFieldErrors
}

type LoaderData = {
	categories: Category[]
}

export async function loader({ request }: ActionFunctionArgs) {
	await requireLibrarianUser(request)

	return await makeAuthenticatedRequest(request, async () => {
		const response = await api.get('/book-categories', { params: { list: true } })
		return json<LoaderData>({
			categories: response.data.data,
		})
	})
}

export async function action({ request }: ActionFunctionArgs) {
	await requireLibrarianUser(request)
	const formData = await request.formData()
	const name = formData.get('name')
	const author = formData.get('author')
	const language = formData.get('language')
	const category = formData.get('category')
	const codes = formData.getAll('codes')

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

	if (Object.keys(fieldErrors).length > 0) {
		return json<ActionData>({ fieldErrors }, { status: 400 })
	}

	return await makeAuthenticatedRequest(request, async () => {
		const response = await api.post('/books', {
			name,
			author,
			language,
			category,
			codes: Array.from(codes),
		})

		// Special error handling for code duplication
		if (response.data?.message?.includes('codes')) {
			return json<ActionData>(
				{
					fieldErrors: {
						codes: 'One or more codes are already in use',
					},
				},
				{ status: 400 }
			)
		}

		return redirect('/librarian/books')
	})
}

export default function LibrarianBooksNewPage() {
	const actionData = useActionData<ActionData>()
	const { categories } = useLoaderData<LoaderData>()
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

	return (
		<div className='mx-auto max-w-lg'>
			<BookForm
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
