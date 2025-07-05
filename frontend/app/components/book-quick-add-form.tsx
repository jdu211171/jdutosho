import { useState } from 'react'
import { useFetcher } from '@remix-run/react'
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card'
import { Button } from '~/components/ui/button'
import { Input } from '~/components/ui/input'
import { Label } from '~/components/ui/label'
import { toast } from '~/hooks/use-toast'
import { PlusCircle, X } from 'lucide-react'

export function BookQuickAddForm() {
	const fetcher = useFetcher()
	const [isOpen, setIsOpen] = useState(false)
	const [codes, setCodes] = useState([''])

	const isSubmitting = fetcher.state !== 'idle'

	const handleAddCode = () => {
		setCodes([...codes, ''])
	}

	const handleRemoveCode = (index: number) => {
		const newCodes = codes.filter((_, i) => i !== index)
		setCodes(newCodes.length === 0 ? [''] : newCodes)
	}

	const handleCodeChange = (index: number, value: string) => {
		const newCodes = [...codes]
		newCodes[index] = value
		setCodes(newCodes)
	}

	const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault()
		const formData = new FormData(event.currentTarget)
		const title = formData.get('title') as string
		const validCodes = codes.filter(code => code.trim() !== '')

		if (!title || validCodes.length === 0) {
			toast({
				title: 'Validation Error',
				description: 'Please provide a title and at least one code',
				variant: 'destructive',
			})
			return
		}

		// Create a new FormData with the processed values
		const submitData = new FormData()
		submitData.append('name', title)
		submitData.append('author', 'Unknown')
		submitData.append('language', 'en')
		submitData.append('category', '1') // Default category
		validCodes.forEach(code => submitData.append('codes[]', code))

		fetcher.submit(submitData, {
			method: 'post',
			action: '/librarian/books',
		})

		// Reset form after submission
		if (fetcher.state === 'idle') {
			setIsOpen(false)
			setCodes([''])
			event.currentTarget.reset()
			toast({
				title: 'Book Added',
				description: 'The book has been added successfully',
			})
		}
	}

	if (!isOpen) {
		return (
			<Button
				variant='outline'
				size='sm'
				onClick={() => setIsOpen(true)}
				className='w-full'
			>
				<PlusCircle className='h-4 w-4 mr-2' />
				Quick Add Book
			</Button>
		)
	}

	return (
		<Card>
			<CardHeader className='pb-4'>
				<div className='flex justify-between items-center'>
					<CardTitle className='text-base'>Quick Add Book</CardTitle>
					<Button
						variant='ghost'
						size='sm'
						onClick={() => setIsOpen(false)}
						className='h-8 w-8 p-0'
					>
						<X className='h-4 w-4' />
					</Button>
				</div>
			</CardHeader>
			<CardContent>
				<fetcher.Form onSubmit={handleSubmit} className='space-y-4'>
					<div className='space-y-2'>
						<Label htmlFor='title'>Book Title</Label>
						<Input
							id='title'
							name='title'
							placeholder='Enter book title'
							required
							disabled={isSubmitting}
						/>
					</div>

					<div className='space-y-2'>
						<Label>Book Codes</Label>
						{codes.map((code, index) => (
							<div key={index} className='flex gap-2'>
								<Input
									placeholder='Enter book code'
									value={code}
									onChange={(e) => handleCodeChange(index, e.target.value)}
									disabled={isSubmitting}
								/>
								{codes.length > 1 && (
									<Button
										type='button'
										variant='ghost'
										size='sm'
										onClick={() => handleRemoveCode(index)}
										disabled={isSubmitting}
										className='h-10 w-10 p-0'
									>
										<X className='h-4 w-4' />
									</Button>
								)}
							</div>
						))}
						<Button
							type='button'
							variant='outline'
							size='sm'
							onClick={handleAddCode}
							disabled={isSubmitting}
							className='w-full'
						>
							<PlusCircle className='h-3 w-3 mr-1' />
							Add Another Code
						</Button>
					</div>

					<div className='flex gap-2'>
						<Button
							type='submit'
							size='sm'
							className='flex-1'
							disabled={isSubmitting}
						>
							{isSubmitting ? 'Adding...' : 'Add Book'}
						</Button>
						<Button
							type='button'
							variant='outline'
							size='sm'
							onClick={() => setIsOpen(false)}
							disabled={isSubmitting}
						>
							Cancel
						</Button>
					</div>
				</fetcher.Form>
			</CardContent>
		</Card>
	)
}