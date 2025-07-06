import { LoaderFunctionArgs } from '@remix-run/node'
import { json, useLoaderData } from '@remix-run/react'
import { api } from '~/lib/api'
import {
	requireLibrarianUser,
	makeAuthenticatedRequest,
} from '~/services/auth.server'
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '~/components/ui/card'
import { Badge } from '~/components/ui/badge'
import { ScrollArea } from '~/components/ui/scroll-area'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '~/components/ui/tabs'

export function meta() {
	return [
		{ title: 'Book List' },
		{ description: 'Complete list of all books in the library' },
	]
}

type Book = {
	id: number
	name: string
	author: string
	language: string
	category: string
	total_count: number
	available_count: number
}

type LoaderData = {
	books: Book[]
	totalBooks: number
	totalAvailable: number
}

export async function loader({ request }: LoaderFunctionArgs) {
	await requireLibrarianUser(request)

	return await makeAuthenticatedRequest(request, async () => {
		const response = await api.get('/books/list')
		const books = response.data.data || []

		const totalBooks = books.reduce(
			(sum: number, book: Book) => sum + book.total_count,
			0
		)
		const totalAvailable = books.reduce(
			(sum: number, book: Book) => sum + book.available_count,
			0
		)

		return json<LoaderData>({
			books,
			totalBooks,
			totalAvailable,
		})
	})
}

export default function BookListPage() {
	const { books, totalBooks, totalAvailable } = useLoaderData<typeof loader>()

	// Group books by category
	const booksByCategory = books.reduce(
		(acc, book) => {
			if (!acc[book.category]) {
				acc[book.category] = []
			}
			acc[book.category].push(book)
			return acc
		},
		{} as Record<string, Book[]>
	)

	// Group books by language
	const booksByLanguage = books.reduce(
		(acc, book) => {
			if (!acc[book.language]) {
				acc[book.language] = []
			}
			acc[book.language].push(book)
			return acc
		},
		{} as Record<string, Book[]>
	)

	const languageNames: Record<string, string> = {
		uz: 'Uzbek',
		ru: 'Russian',
		en: 'English',
		ja: 'Japanese',
	}

	return (
		<div className='space-y-6'>
			<div className='flex justify-between items-center'>
				<div>
					<h2 className='text-3xl font-bold tracking-tight'>Book List</h2>
					<p className='text-muted-foreground'>
						Total: {totalBooks} books • Available: {totalAvailable} books
					</p>
				</div>
			</div>

			<Tabs defaultValue='category' className='w-full'>
				<TabsList className='grid w-full grid-cols-3'>
					<TabsTrigger value='category'>By Category</TabsTrigger>
					<TabsTrigger value='language'>By Language</TabsTrigger>
					<TabsTrigger value='all'>All Books</TabsTrigger>
				</TabsList>

				<TabsContent value='category' className='space-y-4'>
					{Object.entries(booksByCategory).map(([category, categoryBooks]) => (
						<Card key={category}>
							<CardHeader>
								<CardTitle>{category}</CardTitle>
								<CardDescription>
									{categoryBooks.length} unique titles
								</CardDescription>
							</CardHeader>
							<CardContent>
								<ScrollArea className='h-[300px]'>
									<div className='space-y-2'>
										{categoryBooks.map(book => (
											<BookItem key={book.id} book={book} />
										))}
									</div>
								</ScrollArea>
							</CardContent>
						</Card>
					))}
				</TabsContent>

				<TabsContent value='language' className='space-y-4'>
					{Object.entries(booksByLanguage).map(([language, languageBooks]) => (
						<Card key={language}>
							<CardHeader>
								<CardTitle>{languageNames[language] || language}</CardTitle>
								<CardDescription>
									{languageBooks.length} unique titles
								</CardDescription>
							</CardHeader>
							<CardContent>
								<ScrollArea className='h-[300px]'>
									<div className='space-y-2'>
										{languageBooks.map(book => (
											<BookItem key={book.id} book={book} />
										))}
									</div>
								</ScrollArea>
							</CardContent>
						</Card>
					))}
				</TabsContent>

				<TabsContent value='all'>
					<Card>
						<CardHeader>
							<CardTitle>All Books</CardTitle>
							<CardDescription>
								Complete list of {books.length} unique titles
							</CardDescription>
						</CardHeader>
						<CardContent>
							<ScrollArea className='h-[600px]'>
								<div className='space-y-2'>
									{books.map(book => (
										<BookItem
											key={book.id}
											book={book}
											showCategory
											showLanguage
										/>
									))}
								</div>
							</ScrollArea>
						</CardContent>
					</Card>
				</TabsContent>
			</Tabs>
		</div>
	)
}

function BookItem({
	book,
	showCategory = false,
	showLanguage = false,
}: {
	book: Book
	showCategory?: boolean
	showLanguage?: boolean
}) {
	const availabilityRate = (book.available_count / book.total_count) * 100
	const availabilityColor =
		availabilityRate === 0
			? 'destructive'
			: availabilityRate < 50
				? 'secondary'
				: 'default'

	return (
		<div className='flex items-center justify-between p-3 rounded-lg border'>
			<div className='space-y-1'>
				<p className='font-medium'>{book.name}</p>
				<p className='text-sm text-muted-foreground'>
					by {book.author}
					{showCategory && ` • ${book.category}`}
					{showLanguage && ` • ${book.language.toUpperCase()}`}
				</p>
			</div>
			<div className='flex items-center gap-2'>
				<Badge variant={availabilityColor}>
					{book.available_count}/{book.total_count} available
				</Badge>
			</div>
		</div>
	)
}
