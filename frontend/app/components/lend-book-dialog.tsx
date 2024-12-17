'use client'

import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useQuery } from '@tanstack/react-query'
import { useState, useMemo, useEffect, KeyboardEvent } from 'react'
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
	const [activeField, setActiveField] = useState<'book' | 'student' | null>(
		null
	)

	const { debounce } = _
	const { token } = useAuth()

	const debouncedSetBookSearch = useMemo(
		() => debounce((value: string) => setBookSearch(value), 300),
		[]
	)
	const debouncedSetStudentSearch = useMemo(
		() => debounce((value: string) => setStudentSearch(value), 300),
		[]
	)

	const form = useForm<LendingFormData>({
		resolver: zodResolver(lendingSchema),
		defaultValues: {
			bookId: initialBookId ?? '',
			studentId: '',
		},
	})

	const { data: booksData, isLoading: booksLoading } = useQuery<
		ApiResponse<Book>,
		Error
	>({
		queryKey: ['books', bookSearch],
		queryFn: async () => {
			const response = await api.get(`/books/list?search=${bookSearch}`, {
				headers: {
					Authorization: `Bearer ${token}`,
				},
			})
			return response.data as ApiResponse<Book>
		},
		enabled: bookSearch.length > 0,
	})

	const { data: studentsData, isLoading: studentsLoading } = useQuery<
		ApiResponse<Student>,
		Error
	>({
		queryKey: ['students', studentSearch],
		queryFn: async () => {
			const response = await api.get(`/users/list?search=${studentSearch}`, {
				headers: {
					Authorization: `Bearer ${token}`,
				},
			})
			return response.data as ApiResponse<Student>
		},
		enabled: studentSearch.length > 0,
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

	// Reset selection when search changes
	useEffect(() => {
		setSelectedBookIndex(-1)
	}, [bookSearch])

	useEffect(() => {
		setSelectedStudentIndex(-1)
	}, [studentSearch])

	const onSubmit = async (data: LendingFormData) => {
		try {
			console.log('Form submitted:', data)
			setOpen(false)
		} catch (error) {
			console.error('Error submitting form:', error)
		}
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
														booksData?.data,
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
														data={booksData}
														isLoading={booksLoading}
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
														studentsData?.data,
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
														data={studentsData}
														isLoading={studentsLoading}
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

						<DialogFooter>
							<Button type='submit'>Lend Book</Button>
						</DialogFooter>
					</form>
				</Form>
			</DialogContent>
		</Dialog>
	)
}
