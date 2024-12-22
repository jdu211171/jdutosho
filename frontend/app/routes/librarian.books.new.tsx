import { ActionFunctionArgs } from "@remix-run/node"
import { json, redirect, useActionData, useLoaderData, useNavigate } from "@remix-run/react"
import { X } from "lucide-react"
import { Input } from "~/components/ui/input"
import { Label } from "~/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select"
import { useState } from "react"
import { Button } from "~/components/ui/button"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "~/components/ui/card"
import { toast } from "~/hooks/use-toast"
import { api } from "~/lib/api"
import { requireLibrarianUser } from "~/services/auth.server"

type ActionData = {
  error?: string
  fieldErrors?: {
    name?: string
    author?: string
    language?: string
    category?: string
    codes?: string
  }
}

type LoaderData = {
	categories: Array<{
		id: number
		name: string
	}>
}

export async function loader({ request }: ActionFunctionArgs) {
	const user = await requireLibrarianUser(request)

	try {
		const response = await api.get('/book-categories/list', {
			headers: {
				Authorization: `Bearer ${user.token}`,
			},
		})

		return json<LoaderData>({
			categories: response.data.data,
		})
	} catch (error: any) {
		throw new Error(error.response?.data?.message || 'Failed to load categories')
	}
}

export async function action({ request }: ActionFunctionArgs) {
  const user = await requireLibrarianUser(request)
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

  try {
    const response = await api.post(
      '/books',
      {
        name,
        author,
        language,
        category,
        codes: Array.from(codes),
      },
      {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      }
    )

    console.log(response.data)

    return redirect('/librarian/books')
  } catch (error: any) {
	  console.error('Create book error:', error)
	  const message = error.response?.data?.message
	  if (message?.includes('codes')) {
	    return json<ActionData>(
	      {
	        fieldErrors: {
	          codes: 'One or more codes are already in use'
	        }
	      },
	      { status: 400 }
			)
		}
  }
}

export default function LibrarianBooksNewPage() {
	const actionData = useActionData<ActionData>()
	const { categories } = useLoaderData<LoaderData>()
  const navigate = useNavigate()
  const [codes, setCodes] = useState<string[]>([])
  const [currentCode, setCurrentCode] = useState('')

  if (actionData?.error) {
    toast({
      title: 'Error',
      description: actionData.error,
      variant: 'destructive',
    })
  }

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
    <div className='mx-auto max-w-lg'>
      <Card>
        <CardHeader>
          <CardTitle>New Book</CardTitle>
          <CardDescription>Add a new book to the library</CardDescription>
        </CardHeader>
        <CardContent>
          <form method='post' className='space-y-4'>
            <div className='space-y-2'>
              <Label htmlFor='name'>Book Title</Label>
              <Input
                id='name'
                name='name'
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
              <Select name='language' required>
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
              <Select name='category' required>
                <SelectTrigger>
                  <SelectValue placeholder="Select book's category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id.toString()}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>              </Select>
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
                    <input type='hidden' name='codes' value={code} />
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
              <Button
                type='button'
                variant='outline'
                onClick={() => navigate(-1)}
              >
                Cancel
              </Button>
              <Button type='submit'>Create Book</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
