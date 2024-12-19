import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useFetcher } from '@remix-run/react'
import type { KeyboardEvent } from 'react'
import { useEffect, useMemo, useState } from 'react'
import _ from 'lodash'
import { Button } from '~/components/ui/button'
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from '~/components/ui/dialog'
import { Form } from '~/components/ui/form'
import { SearchField } from './lend-book/search-field'
import type { ApiResponse, Book, Student } from '~/types/lend-book'

const lendingSchema = z.object({
	bookId: z.string().min(1, 'Book ID is required'),
	studentId: z.string().min(1, 'Student ID is required'),
})

type LendingFormData = z.infer<typeof lendingSchema>

interface LendBookDialogProps {
	children: React.ReactNode
	initialBookId?: string
}

export function LendBookDialog({
	children,
	initialBookId,
}: LendBookDialogProps) {
	const [open, setOpen] = useState(false)
	const [bookSearch, setBookSearch] = useState('')
	const [studentSearch, setStudentSearch] = useState('')
	const [selectedBookIndex, setSelectedBookIndex] = useState(-1)
	const [selectedStudentIndex, setSelectedStudentIndex] = useState(-1)
	const [activeField, setActiveField] = useState<'book' | 'student' | null>(
		null
	)

	const bookSearchFetcher = useFetcher<ApiResponse<Book>>()
	const studentSearchFetcher = useFetcher<ApiResponse<Student>>()

	const debouncedSetBookSearch = useMemo(
		() =>
			_.debounce((value: string) => {
				setBookSearch(value)
				if (value) {
					bookSearchFetcher.load(`/librarian/books/search?q=${value}`)
				}
			}, 300),
		[bookSearchFetcher]
	)

	const debouncedSetStudentSearch = useMemo(
		() =>
			_.debounce((value: string) => {
				setStudentSearch(value)
				if (value) {
					studentSearchFetcher.load(`/librarian/students/search?q=${value}`)
				}
			}, 300),
		[studentSearchFetcher]
	)

	const form = useForm<LendingFormData>({
		resolver: zodResolver(lendingSchema),
		defaultValues: {
			bookId: initialBookId ?? '',
			studentId: '',
		},
	})

	const handleKeyNavigation = (
		e: KeyboardEvent,
		items: Book[] | Student[] | undefined,
		setIndex: (index: number) => void,
		currentIndex: number,
		field: 'book' | 'student'
	) => {
		if (!items?.length) return

		switch (e.key) {
			case 'ArrowDown':
				e.preventDefault()
				setIndex(Math.min(currentIndex + 1, items.length - 1))
				break
			case 'ArrowUp':
				e.preventDefault()
				setIndex(Math.max(currentIndex - 1, 0))
				break
			case 'Enter':
				e.preventDefault()
				if (currentIndex >= 0) {
					const selected = items[currentIndex]
					if (field === 'book') {
						form.setValue('bookId', (selected as Book).code)
						setBookSearch('')
					} else {
						form.setValue('studentId', (selected as Student).loginID)
						setStudentSearch('')
					}
					setIndex(-1)
				}
				break
			case 'Escape':
				e.preventDefault()
				field === 'book' ? setBookSearch('') : setStudentSearch('')
				setIndex(-1)
				break
		}
	}

	useEffect(() => {
		setSelectedBookIndex(-1)
	}, [bookSearch])

	useEffect(() => {
		setSelectedStudentIndex(-1)
	}, [studentSearch])

	const lendFetcher = useFetcher()

	const onSubmit = async (formData: LendingFormData) => {
		lendFetcher.submit(
			{ bookId: formData.bookId, studentId: formData.studentId },
			{ method: 'POST', action: '/librarian/lend-book' }
		)
		setOpen(false)
	}

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>{children}</DialogTrigger>
			<DialogContent className='sm:max-w-[425px]'>
				<DialogHeader>
					<DialogTitle>Lend a Book</DialogTitle>
					<DialogDescription>
						Enter the book ID and student ID to lend a book.
					</DialogDescription>
				</DialogHeader>

				<Form {...form}>
					<form
						onSubmit={e => void form.handleSubmit(onSubmit)(e)}
						className='space-y-4'
					>
						<SearchField
							form={form}
							name='studentId'
							label='Student ID'
							placeholder='Search Student ID...'
							onSearch={debouncedSetStudentSearch}
							searchValue={studentSearch}
							searchResults={studentSearchFetcher.data}
							isLoading={studentSearchFetcher.state === 'loading'}
							selectedIndex={selectedStudentIndex}
							onKeyNavigation={e =>
								handleKeyNavigation(
									e,
									studentSearchFetcher.data?.data,
									setSelectedStudentIndex,
									selectedStudentIndex,
									'student'
								)
							}
							onSelect={setStudentSearch}
							onFocus={() => setActiveField('student')}
						/>

						<SearchField
							form={form}
							name='bookId'
							label='Book ID'
							placeholder='Search Book ID...'
							onSearch={debouncedSetBookSearch}
							searchValue={bookSearch}
							searchResults={bookSearchFetcher.data}
							isLoading={bookSearchFetcher.state === 'loading'}
							selectedIndex={selectedBookIndex}
							onKeyNavigation={e =>
								handleKeyNavigation(
									e,
									bookSearchFetcher.data?.data,
									setSelectedBookIndex,
									selectedBookIndex,
									'book'
								)
							}
							onSelect={setBookSearch}
							onFocus={() => setActiveField('book')}
						/>

						<DialogFooter>
							<Button
								type='submit'
								disabled={lendFetcher.state === 'submitting'}
							>
								{lendFetcher.state === 'submitting'
									? 'Lending...'
									: 'Lend Book'}
							</Button>
						</DialogFooter>
					</form>
				</Form>
			</DialogContent>
		</Dialog>
	)
}
