'use client'

import { useState } from 'react'
import { useFetcher } from '@remix-run/react'
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
import { Label } from '~/components/ui/label'
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

interface LendBookDialogProps {
	book_id: string
	children: React.ReactNode
}

export function LendBookDialog({ book_id, children }: LendBookDialogProps) {
	const [open, setOpen] = useState(false)
	const [bookOpen, setBookOpen] = useState(false)
	const [studentOpen, setStudentOpen] = useState(false)
	const [bookValue, setBookValue] = useState(book_id)
	const [studentValue, setStudentValue] = useState('')
	const [bookSearch, setBookSearch] = useState('')
	const [studentSearch, setStudentSearch] = useState('')

	const bookFetcher = useFetcher()
	const studentFetcher = useFetcher()

	const books = bookFetcher.data?.data || []
	const students = studentFetcher.data?.data || []

	const onBookSearch = (value: string) => {
		setBookSearch(value)
		bookFetcher.load(`/books/list?search=${value}`)
	}

	const onStudentSearch = (value: string) => {
		setStudentSearch(value)
		studentFetcher.load(`/users/list?search=${value}`)
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
				<div className='grid gap-4 py-4'>
					<div className='grid grid-cols-4 items-center gap-4'>
						<Label htmlFor='bookId' className='text-right'>
							Book ID
						</Label>
						<Popover open={bookOpen} onOpenChange={setBookOpen}>
							<PopoverTrigger asChild>
								<Button
									variant='outline'
									role='combobox'
									aria-expanded={bookOpen}
									className='col-span-3 justify-between'
								>
									{bookValue ? bookValue : 'Select book...'}
									<ChevronsUpDown className='ml-2 h-4 w-4 shrink-0 opacity-50' />
								</Button>
							</PopoverTrigger>
							<PopoverContent className='w-[300px] p-0'>
								<Command>
									<CommandInput
										placeholder='Search book ID...'
										onValueChange={onBookSearch}
									/>
									<CommandEmpty>No book found.</CommandEmpty>
									<CommandGroup>
										{books.map(book => (
											<CommandItem
												key={book.id}
												onSelect={() => {
													setBookValue(book.code)
													setBookOpen(false)
												}}
											>
												<Check
													className={cn(
														'mr-2 h-4 w-4',
														bookValue === book.code
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
					</div>
					<div className='grid grid-cols-4 items-center gap-4'>
						<Label htmlFor='studentId' className='text-right'>
							Student ID
						</Label>
						<Popover open={studentOpen} onOpenChange={setStudentOpen}>
							<PopoverTrigger asChild>
								<Button
									variant='outline'
									role='combobox'
									aria-expanded={studentOpen}
									className='col-span-3 justify-between'
								>
									{studentValue ? studentValue : 'Select student...'}
									<ChevronsUpDown className='ml-2 h-4 w-4 shrink-0 opacity-50' />
								</Button>
							</PopoverTrigger>
							<PopoverContent className='w-[300px] p-0'>
								<Command>
									<CommandInput
										placeholder='Search student ID...'
										onValueChange={onStudentSearch}
									/>
									<CommandEmpty>No student found.</CommandEmpty>
									<CommandGroup>
										{students.map(student => (
											<CommandItem
												key={student.id}
												onSelect={() => {
													setStudentValue(student.loginID)
													setStudentOpen(false)
												}}
											>
												<Check
													className={cn(
														'mr-2 h-4 w-4',
														studentValue === student.loginID
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
					</div>
				</div>
				<DialogFooter>
					<Button type='submit'>Lend Book</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	)
}
