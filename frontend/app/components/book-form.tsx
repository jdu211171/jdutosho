import { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import { Input } from '~/components/ui/input'
import { Label } from '~/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '~/components/ui/select'
import { Button } from '~/components/ui/button'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '~/components/ui/card'
import type { Category, BookFormFieldErrors, BookFormValues } from '~/types/books'

interface BookFormProps {
  initialValues?: BookFormValues
  categories: Category[]
  onSubmit: (formData: FormData) => void
  actionData?: {
    error?: string
    fieldErrors?: BookFormFieldErrors
  }
  isSubmitting?: boolean
}

export function BookForm({
  initialValues = {},
  categories,
  onSubmit,
  actionData,
  isSubmitting = false
}: BookFormProps) {
  const [codes, setCodes] = useState<string[]>(initialValues.codes || [])
  const [currentCode, setCurrentCode] = useState('')

  useEffect(() => {
    if (initialValues.codes) {
      setCodes(initialValues.codes)
    }
  }, [initialValues.codes])

  const addCode = () => {
    if (currentCode && !codes.includes(currentCode)) {
      setCodes([...codes, currentCode])
      setCurrentCode('')
    }
  }

  const removeCode = (code: string) => {
    setCodes(codes.filter(c => c !== code))
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{initialValues.name ? 'Edit Book' : 'New Book'}</CardTitle>
        <CardDescription>{initialValues.name ? 'Edit book information' : 'Add a new book to the library'}</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={(e) => {
          e.preventDefault()
          const formData = new FormData(e.currentTarget)
          codes.forEach(code => formData.append('codes', code))
          onSubmit(formData)
        }} className='space-y-4'>
          <div className='space-y-2'>
            <Label htmlFor='name'>Book Title</Label>
            <Input
              id='name'
              name='name'
              defaultValue={initialValues.name}
              placeholder='Enter book title'
              required
            />
            {actionData?.fieldErrors?.name && (
              <p className='text-sm text-destructive'>
                {actionData.fieldErrors.name}
              </p>
            )}
          </div>

          <div className='space-y-2'>
            <Label htmlFor='author'>Author</Label>
            <Input
              id='author'
              name='author'
              defaultValue={initialValues.author}
              placeholder='Enter author name'
              required
            />
            {actionData?.fieldErrors?.author && (
              <p className='text-sm text-destructive'>
                {actionData.fieldErrors.author}
              </p>
            )}
          </div>

          <div className='space-y-2'>
            <Label htmlFor='language'>Language</Label>
            <Select name='language' defaultValue={initialValues.language} required>
              <SelectTrigger>
                <SelectValue placeholder="Select book's language" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="uz">Uzbek</SelectItem>
                <SelectItem value="ru">Russian</SelectItem>
                <SelectItem value="en">English</SelectItem>
                <SelectItem value="ja">Japanese</SelectItem>
              </SelectContent>
            </Select>
            {actionData?.fieldErrors?.language && (
              <p className='text-sm text-destructive'>
                {actionData.fieldErrors.language}
              </p>
            )}
          </div>

          <div className='space-y-2'>
            <Label htmlFor='category'>Category</Label>
            <Select name='category' defaultValue={initialValues.category} required>
              <SelectTrigger>
                <SelectValue placeholder="Select book's category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id.toString()}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {actionData?.fieldErrors?.category && (
              <p className='text-sm text-destructive'>
                {actionData.fieldErrors.category}
              </p>
            )}
          </div>

          <div className='space-y-2'>
            <Label htmlFor='codes'>Book Codes</Label>
            <div className='flex space-x-2'>
              <Input
                id='codes'
                value={currentCode}
                onChange={(e) => setCurrentCode(e.target.value)}
                placeholder='Enter book code'
              />
              <Button type='button' onClick={addCode}>Add</Button>
            </div>
            <div className='flex flex-wrap gap-2 mt-2'>
              {codes.map((code) => (
                <div key={code} className='flex items-center bg-secondary text-secondary-foreground px-2 py-1 rounded'>
                  {code}
                  <Button
                    type='button'
                    variant='ghost'
                    size='sm'
                    className='ml-2 h-4 w-4 p-0'
                    onClick={() => removeCode(code)}
                  >
                    <X className='h-3 w-3' />
                  </Button>
                </div>
              ))}
            </div>
            {actionData?.fieldErrors?.codes && (
              <p className='text-sm text-destructive'>
                {actionData.fieldErrors.codes}
              </p>
            )}
          </div>

          <div className='flex gap-4'>
            <Button type='submit'>
              {initialValues.name ? 'Update Book' : 'Create Book'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
