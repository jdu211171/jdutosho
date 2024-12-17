import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useFetcher } from '@remix-run/react'
import { KeyboardEvent, useEffect, useMemo, useState } from 'react'
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
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from '~/components/ui/form'
import { Input } from '~/components/ui/input'
import { cn } from '~/lib/utils'
import { useAuth } from '~/context/auth-provider'
import axios from 'axios'
import { api } from '~/lib/api'
import { toast } from '~/hooks/use-toast'

interface Book {
	id: string
	code: string
}

interface Student {
	id: string
	loginID: string
}

interface ApiResponse<T> {
	data: T[]
}

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
}: LendBookDialogProps): JSX.Element {
	const [open, setOpen] = useState(false)
	const [bookSearch, setBookSearch] = useState('')
	const [studentSearch, setStudentSearch] = useState('')
	const [selectedBookIndex, setSelectedBookIndex] = useState(-1)
	const [selectedStudentIndex, setSelectedStudentIndex] = useState(-1)
	const [, setActiveField] = useState<'book' | 'student' | null>(null)

	const { debounce } = _
	const bookSearchFetcher = useFetcher<ApiResponse<Book>>()
	const studentSearchFetcher = useFetcher<ApiResponse<Student>>()

	const debouncedSetBookSearch = useMemo(
		() =>
			debounce((value: string) => {
				setBookSearch(value)
				if (value) {
					bookSearchFetcher.load(`/librarian/books/search?q=${value}`)
				}
			}, 300),
		[]
	)

	const debouncedSetStudentSearch = useMemo(
		() =>
			debounce((value: string) => {
				setStudentSearch(value)
				if (value) {
					studentSearchFetcher.load(`/librarian/students/search?q=${value}`)
				}
			}, 300),
		[]
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

	const SearchResults = ({
		type,
		data,
		isLoading,
		selectedIndex,
		onSelect,
	}: {
		type: 'book' | 'student'
		data?: ApiResponse<Book | Student>
		isLoading: boolean
		selectedIndex: number
		onSelect: (value: string) => void
	}) => {
		if (isLoading) {
			return <div className='p-2 text-foreground'>Loading...</div>
		}

		if (!data?.data.length) {
			return <div className='p-2 text-foreground'>No results found</div>
		}

		return data.data.map((item, index) => {
			const value =
				type === 'book' ? (item as Book).code : (item as Student).loginID
			return (
				<div
					key={item.id}
					className={cn(
						'cursor-pointer px-4 py-2 hover:bg-accent/50 transition-colors',
						index === selectedIndex && 'bg-accent text-accent-foreground',
						form.getValues(type === 'book' ? 'bookId' : 'studentId') ===
							value && 'font-medium'
					)}
					onClick={() => onSelect(value)}
				>
					{value}
				</div>
			)
		})
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
						<FormField
							control={form.control}
							name='studentId'
							render={({ field }) => (
								<FormItem>
									<FormLabel>Student ID</FormLabel>
									<FormControl>
										<div className='relative'>
											<Input
												placeholder='Search Student ID...'
												onChange={e => {
													debouncedSetStudentSearch(e.target.value)
													field.onChange(e.target.value)
												}}
												onFocus={() => setActiveField('student')}
												onKeyDown={e =>
													handleKeyNavigation(
														e,
														studentSearchFetcher.data?.data,
														setSelectedStudentIndex,
														selectedStudentIndex,
														'student'
													)
												}
												autoComplete='off'
												value={field.value}
											/>
											{studentSearch && (
												<div className='absolute z-10 mt-1 w-full bg-background border rounded-md shadow-md max-h-60 overflow-y-auto'>
													<SearchResults
														type='student'
														data={
															studentSearchFetcher.data as ApiResponse<Student>
														}
														isLoading={studentSearchFetcher.state === 'loading'}
														selectedIndex={selectedStudentIndex}
														onSelect={value => {
															form.setValue('studentId', value)
															setStudentSearch('')
														}}
													/>
												</div>
											)}
										</div>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						<FormField
							control={form.control}
							name='bookId'
							render={({ field }) => (
								<FormItem>
									<FormLabel>Book ID</FormLabel>
									<FormControl>
										<div className='relative'>
											<Input
												placeholder='Search Book ID...'
												onChange={e => {
													debouncedSetBookSearch(e.target.value)
													field.onChange(e.target.value)
												}}
												onFocus={() => setActiveField('book')}
												onKeyDown={e =>
													handleKeyNavigation(
														e,
														bookSearchFetcher.data?.data,
														setSelectedBookIndex,
														selectedBookIndex,
														'book'
													)
												}
												autoComplete='off'
												value={field.value}
											/>
											{bookSearch && (
												<div className='absolute z-10 mt-1 w-full bg-background border rounded-md shadow-md max-h-60 overflow-y-auto'>
													<SearchResults
														type='book'
														data={bookSearchFetcher.data}
														isLoading={bookSearchFetcher.state === 'loading'}
														selectedIndex={selectedBookIndex}
														onSelect={value => {
															form.setValue('bookId', value)
															setBookSearch('')
														}}
													/>
												</div>
											)}
										</div>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
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
