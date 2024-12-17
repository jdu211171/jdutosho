'use client'

import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useQuery } from '@tanstack/react-query'
import axios from 'axios'
import type React from 'react'
import { useState } from 'react'
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
import {
	Command,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
} from '~/components/ui/command'
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from '~/components/ui/popover'
import { Check, ChevronsUpDown } from 'lucide-react'
import { cn } from '~/lib/utils'

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
	const [bookPopoverOpen, setBookPopoverOpen] = useState(false)
	const [studentPopoverOpen, setStudentPopoverOpen] = useState(false)

	const form = useForm<LendingFormData>({
		resolver: zodResolver(lendingSchema),
		defaultValues: {
			bookId: initialBookId ?? '',
			studentId: '',
		},
	})

	const { data: booksData, isLoading: isLoadingBooks } = useQuery<
		ApiResponse<Book>,
		Error
	>({
		queryKey: ['books', bookSearch],
		queryFn: async () => {
			if (!bookSearch) return { data: [] }
			const response = await axios.get<ApiResponse<Book>>(
				`/books/list?search=${bookSearch}`
			)
			return response.data
		},
		enabled: bookSearch.length > 0,
	})

	const { data: studentsData, isLoading: isLoadingStudents } = useQuery<
		ApiResponse<Student>,
		Error
	>({
		queryKey: ['students', studentSearch],
		queryFn: async () => {
			if (!studentSearch) return { data: [] }
			const response = await axios.get<ApiResponse<Student>>(
				`/users/list?search=${studentSearch}`
			)
			return response.data
		},
		enabled: studentSearch.length > 0,
	})

	const onSubmit = async (data: LendingFormData) => {
		try {
			console.log('Form submitted:', data)
			setOpen(false)
		} catch (error) {
			console.error('Error submitting form:', error)
		}
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
								<FormItem className='flex flex-col'>
									<FormLabel>Book ID</FormLabel>
									<Popover
										open={bookPopoverOpen}
										onOpenChange={setBookPopoverOpen}
									>
										<PopoverTrigger asChild>
											<FormControl>
												<Button
													variant='outline'
													role='combobox'
													className={cn(
														'justify-between',
														!field.value && 'text-muted-foreground'
													)}
												>
													{field.value || 'Select book...'}
													<ChevronsUpDown className='ml-2 h-4 w-4 shrink-0 opacity-50' />
												</Button>
											</FormControl>
										</PopoverTrigger>
										<PopoverContent className='w-[300px] p-0'>
											<Command>
												<CommandInput
													placeholder='Search book ID...'
													onValueChange={setBookSearch}
												/>
												{isLoadingBooks ? (
													<CommandEmpty>Loading books...</CommandEmpty>
												) : (
													<CommandEmpty>No book found</CommandEmpty>
												)}
												<CommandGroup>
													{booksData?.data.map(book => (
														<CommandItem
															key={book.id}
															value={book.code}
															onSelect={() => {
																form.setValue('bookId', book.code)
																setBookPopoverOpen(false)
															}}
														>
															<Check
																className={cn(
																	'mr-2 h-4 w-4',
																	book.code === field.value
																		? 'opacity-100'
																		: 'opacity-0'
																)}
															/>
															{book.code}
														</CommandItem>
													))}
												</CommandGroup>
											</Command>
										</PopoverContent>
									</Popover>
									<FormMessage />
								</FormItem>
							)}
						/>

						<FormField
							control={form.control}
							name='studentId'
							render={({ field }) => (
								<FormItem className='flex flex-col'>
									<FormLabel>Student ID</FormLabel>
									<Popover
										open={studentPopoverOpen}
										onOpenChange={setStudentPopoverOpen}
									>
										<PopoverTrigger asChild>
											<FormControl>
												<Button
													variant='outline'
													role='combobox'
													className={cn(
														'justify-between',
														!field.value && 'text-muted-foreground'
													)}
												>
													{field.value || 'Select student...'}
													<ChevronsUpDown className='ml-2 h-4 w-4 shrink-0 opacity-50' />
												</Button>
											</FormControl>
										</PopoverTrigger>
										<PopoverContent className='w-[300px] p-0'>
											<Command>
												<CommandInput
													placeholder='Search student ID...'
													onValueChange={setStudentSearch}
												/>
												{isLoadingStudents ? (
													<CommandEmpty>Loading students...</CommandEmpty>
												) : (
													<CommandEmpty>No student found</CommandEmpty>
												)}
												<CommandGroup>
													{studentsData?.data.map(student => (
														<CommandItem
															key={student.id}
															value={student.loginID}
															onSelect={() => {
																form.setValue('studentId', student.loginID)
																setStudentPopoverOpen(false)
															}}
														>
															<Check
																className={cn(
																	'mr-2 h-4 w-4',
																	student.loginID === field.value
																		? 'opacity-100'
																		: 'opacity-0'
																)}
															/>
															{student.loginID}
														</CommandItem>
													))}
												</CommandGroup>
											</Command>
										</PopoverContent>
									</Popover>
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
