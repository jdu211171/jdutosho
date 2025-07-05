import { useState, useCallback } from 'react'
import type { ActionFunctionArgs } from '@remix-run/node'
import { json } from '@remix-run/node'
import { Form, useActionData, useNavigation } from '@remix-run/react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card'
import { Button } from '~/components/ui/button'
import { Input } from '~/components/ui/input'
import { Label } from '~/components/ui/label'
import { Alert, AlertDescription, AlertTitle } from '~/components/ui/alert'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '~/components/ui/table'
import { Upload, Download, CheckCircle, XCircle, AlertCircle, FileSpreadsheet, Loader2 } from 'lucide-react'
import { api } from '~/lib/api'
import { makeAuthenticatedRequest } from '~/services/auth.server'
import { Progress } from '~/components/ui/progress'
import { Badge } from '~/components/ui/badge'

export function meta() {
	return [
		{ title: 'Bulk Import Books' },
		{ description: 'Import multiple books from CSV file' },
	]
}

type ImportResult = {
	success: boolean
	message: string
	details?: {
		success: number
		failed: number
		errors: Array<{
			row: number
			title: string
			errors: string[]
		}>
	}
}

export async function action({ request }: ActionFunctionArgs) {
	const formData = await request.formData()
	const file = formData.get('file') as File

	if (!file || file.size === 0) {
		return json<ImportResult>({
			success: false,
			message: 'Please select a file to upload',
		})
	}

	const fileFormData = new FormData()
	fileFormData.append('file', file)

	return await makeAuthenticatedRequest(request, async () => {
		try {
			const response = await api.post<ImportResult>('/books/bulk', fileFormData, {
				headers: {
					'Content-Type': 'multipart/form-data',
				},
			})
			return json(response.data)
		} catch (error: any) {
			return json<ImportResult>({
				success: false,
				message: error.response?.data?.message || 'Failed to import books',
			})
		}
	})
}

export default function BulkImportBooks() {
	const actionData = useActionData<ImportResult>()
	const navigation = useNavigation()
	const [preview, setPreview] = useState<string[][]>([])
	const [fileName, setFileName] = useState<string>('')
	const [fileSize, setFileSize] = useState<number>(0)
	const [validationErrors, setValidationErrors] = useState<string[]>([])
	
	const isSubmitting = navigation.state === 'submitting'

	const handleFileChange = useCallback(
		(event: React.ChangeEvent<HTMLInputElement>) => {
			const file = event.target.files?.[0]
			setValidationErrors([])
			
			if (file) {
				setFileName(file.name)
				setFileSize(file.size)
				
				// Validate file
				const errors: string[] = []
				
				// Check file extension
				if (!file.name.endsWith('.csv') && !file.name.endsWith('.txt')) {
					errors.push('File must be a CSV or TXT file')
				}
				
				// Check file size (10MB limit)
				const maxSize = 10 * 1024 * 1024 // 10MB
				if (file.size > maxSize) {
					errors.push('File size must be less than 10MB')
				}
				
				if (errors.length > 0) {
					setValidationErrors(errors)
					setPreview([])
					return
				}
				
				const reader = new FileReader()
				reader.onload = (e) => {
					const text = e.target?.result as string
					const lines = text.split('\n').filter(line => line.trim())
					const csvData = lines.map(line => {
						// Handle quoted values properly
						const matches = line.match(/(".*?"|[^",]+)(?=\s*,|\s*$)/g)
						return matches ? matches.map(cell => cell.replace(/^"|"$/g, '').trim()) : []
					})
					
					// Validate CSV structure
					if (csvData.length === 0) {
						errors.push('CSV file is empty')
					} else {
						const headers = csvData[0].map(h => h.toLowerCase())
						if (!headers.includes('title') || !headers.includes('code')) {
							errors.push('CSV must have "title" and "code" columns')
						}
					}
					
					if (errors.length > 0) {
						setValidationErrors(errors)
						setPreview([])
					} else {
						setPreview(csvData.slice(0, 6)) // Show first 5 rows + header
					}
				}
				reader.readAsText(file)
			}
		},
		[]
	)

	const downloadSampleCSV = () => {
		const sampleData = `title,code,author,language,category
"The Great Gatsby","LIB001,LIB002","F. Scott Fitzgerald",en,Fiction
"1984","LIB003","George Orwell",en,Fiction
"To Kill a Mockingbird","LIB004,LIB005,LIB006","Harper Lee",en,Fiction
"Sherbirinchi Fasl","LIB007","Said Ahmad",uz,Fiction
"War and Peace","LIB008","Leo Tolstoy",ru,Classics`

		const blob = new Blob([sampleData], { type: 'text/csv' })
		const url = window.URL.createObjectURL(blob)
		const a = document.createElement('a')
		a.href = url
		a.download = 'sample_books_import.csv'
		a.click()
		window.URL.revokeObjectURL(url)
	}

	return (
		<div className='space-y-6'>
			<div className='flex justify-between items-center'>
				<h2 className='text-3xl font-bold tracking-tight'>Bulk Import Books</h2>
				<Button variant='outline' onClick={downloadSampleCSV}>
					<Download className='h-4 w-4 mr-2' />
					Download Sample CSV
				</Button>
			</div>

			<Card>
				<CardHeader>
					<CardTitle>Upload CSV File</CardTitle>
					<CardDescription>
						Import multiple books at once using a CSV file. Required columns: title, code. 
						Optional columns: author, language, category.
					</CardDescription>
				</CardHeader>
				<CardContent>
					<Form method='post' encType='multipart/form-data' className='space-y-4'>
						<div className='space-y-2'>
							<Label htmlFor='file'>Select CSV File</Label>
							<div className='flex items-center gap-3'>
								<FileSpreadsheet className='h-10 w-10 text-muted-foreground' />
								<div className='flex-1'>
									<Input
										id='file'
										name='file'
										type='file'
										accept='.csv,.txt'
										onChange={handleFileChange}
										required
										disabled={isSubmitting}
									/>
								</div>
							</div>
							{fileName && !validationErrors.length && (
								<div className='flex items-center gap-2 text-sm text-muted-foreground'>
									<CheckCircle className='h-4 w-4 text-green-600' />
									<span>{fileName}</span>
									<Badge variant='secondary' className='ml-auto'>
										{(fileSize / 1024).toFixed(1)} KB
									</Badge>
								</div>
							)}
							{validationErrors.length > 0 && (
								<Alert variant='destructive'>
									<AlertCircle className='h-4 w-4' />
									<AlertTitle>Validation Error</AlertTitle>
									<AlertDescription>
										<ul className='list-disc list-inside text-sm'>
											{validationErrors.map((error, index) => (
												<li key={index}>{error}</li>
											))}
										</ul>
									</AlertDescription>
								</Alert>
							)}
						</div>

						{preview.length > 0 && (
							<div className='space-y-2'>
								<h4 className='text-sm font-medium'>Preview:</h4>
								<div className='border rounded-md overflow-hidden'>
									<Table>
										<TableHeader>
											<TableRow>
												{preview[0].map((header, index) => (
													<TableHead key={index} className='text-xs'>
														{header}
													</TableHead>
												))}
											</TableRow>
										</TableHeader>
										<TableBody>
											{preview.slice(1).map((row, rowIndex) => (
												<TableRow key={rowIndex}>
													{row.map((cell, cellIndex) => (
														<TableCell key={cellIndex} className='text-xs'>
															{cell || '-'}
														</TableCell>
													))}
												</TableRow>
											))}
										</TableBody>
									</Table>
								</div>
								{preview.length > 5 && (
									<p className='text-xs text-muted-foreground'>
										Showing first 5 rows of {preview.length - 1} total
									</p>
								)}
							</div>
						)}

						<Button 
							type='submit' 
							disabled={!fileName || validationErrors.length > 0 || isSubmitting}
						>
							{isSubmitting ? (
								<>
									<Loader2 className='h-4 w-4 mr-2 animate-spin' />
									Importing...
								</>
							) : (
								<>
									<Upload className='h-4 w-4 mr-2' />
									Import Books
								</>
							)}
						</Button>
						
						{isSubmitting && (
							<div className='space-y-2'>
								<Progress value={30} className='w-full' />
								<p className='text-sm text-muted-foreground text-center'>
									Processing CSV file... This may take a few moments for large files.
								</p>
							</div>
						)}
					</Form>

					{actionData && (
						<div className='mt-6'>
							<Alert variant={actionData.success ? 'default' : 'destructive'}>
								{actionData.success ? (
									<CheckCircle className='h-4 w-4' />
								) : (
									<XCircle className='h-4 w-4' />
								)}
								<AlertTitle>
									{actionData.success ? 'Import Successful' : 'Import Failed'}
								</AlertTitle>
								<AlertDescription>{actionData.message}</AlertDescription>
							</Alert>

							{actionData.details && (
								<div className='mt-4 space-y-4'>
									<div className='grid grid-cols-2 gap-4'>
										<Card>
											<CardContent className='pt-6'>
												<div className='text-2xl font-bold text-green-600'>
													{actionData.details.success}
												</div>
												<p className='text-xs text-muted-foreground'>
													Books imported successfully
												</p>
											</CardContent>
										</Card>
										<Card>
											<CardContent className='pt-6'>
												<div className='text-2xl font-bold text-red-600'>
													{actionData.details.failed}
												</div>
												<p className='text-xs text-muted-foreground'>
													Books failed to import
												</p>
											</CardContent>
										</Card>
									</div>

									{actionData.details.errors.length > 0 && (
										<Card>
											<CardHeader>
												<CardTitle className='text-base'>Import Errors</CardTitle>
											</CardHeader>
											<CardContent>
												<div className='space-y-2'>
													{actionData.details.errors.map((error, index) => (
														<Alert key={index} variant='destructive'>
															<AlertCircle className='h-4 w-4' />
															<AlertTitle className='text-sm'>
																Row {error.row}: {error.title}
															</AlertTitle>
															<AlertDescription>
																<ul className='list-disc list-inside text-xs'>
																	{error.errors.map((err, errIndex) => (
																		<li key={errIndex}>{err}</li>
																	))}
																</ul>
															</AlertDescription>
														</Alert>
													))}
												</div>
											</CardContent>
										</Card>
									)}
								</div>
							)}
						</div>
					)}
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<CardTitle>CSV Format Guidelines</CardTitle>
				</CardHeader>
				<CardContent className='space-y-4'>
					<div>
						<h4 className='font-medium mb-2'>Required Columns:</h4>
						<ul className='list-disc list-inside text-sm text-muted-foreground space-y-1'>
							<li><code>title</code> - The book title</li>
							<li><code>code</code> - Book inventory code(s), comma-separated for multiple codes</li>
						</ul>
					</div>
					<div>
						<h4 className='font-medium mb-2'>Optional Columns:</h4>
						<ul className='list-disc list-inside text-sm text-muted-foreground space-y-1'>
							<li><code>author</code> - Author name (defaults to "Unknown")</li>
							<li><code>language</code> - Language code: uz, ru, en, or ja (defaults to "en")</li>
							<li><code>category</code> - Category name (will be created if doesn't exist)</li>
						</ul>
					</div>
					<div>
						<h4 className='font-medium mb-2'>Tips:</h4>
						<ul className='list-disc list-inside text-sm text-muted-foreground space-y-1'>
							<li>Multiple book codes can be separated by commas in the code column</li>
							<li>Empty rows will be skipped automatically</li>
							<li>The first row should contain column headers</li>
							<li>Maximum file size: 10MB</li>
						</ul>
					</div>
				</CardContent>
			</Card>
		</div>
	)
}