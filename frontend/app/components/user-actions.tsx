import { Button } from '~/components/ui/button'
import { Pencil, Trash } from 'lucide-react'
import { useFetcher } from '@remix-run/react'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '~/components/ui/alert-dialog'
import { toast } from '~/hooks/use-toast'
import { useEffect } from 'react'

interface EntityActionsProps<T> {
  data: T
  basePath: string
  idField: keyof T
  deleteField: string
  messages?: {
    deleteTitle?: string
    deleteDescription?: string
    deleteSuccess?: string
    deleteButton?: string
    deletingButton?: string
  }
  showEdit?: boolean
  editPathBuilder?: (basePath: string, id: string | number) => string
}

export function EntityActions<T extends Record<string, any>>({
  data,
  basePath,
  idField,
  deleteField,
  messages = {},
  showEdit = true,
  editPathBuilder,
}: EntityActionsProps<T>) {
  const fetcher = useFetcher<{ success: boolean; error: string }>()
  const isDeleting = fetcher.state !== 'idle'

  const defaultMessages = {
    deleteTitle: 'Delete',
    deleteDescription: 'Are you sure you want to delete? This action cannot be undone.',
    deleteSuccess: 'Item deleted successfully',
    deleteButton: 'Delete',
    deletingButton: 'Deleting...',
  }

  const finalMessages = { ...defaultMessages, ...messages }

  useEffect(() => {
    if (fetcher.state === 'idle' && fetcher.data?.success) {
      toast({
        title: 'Success',
        description: finalMessages.deleteSuccess,
      })
    } else if (fetcher.state === 'idle' && fetcher.data?.error) {
      toast({
        title: 'Error',
        description: fetcher.data.error,
        variant: 'destructive',
      })
    }
  }, [fetcher.state, fetcher.data, finalMessages.deleteSuccess])

  const getEditPath = () => {
    if (editPathBuilder) {
      return editPathBuilder(basePath, data[idField])
    }
    return `${basePath}/${data[idField]}/edit`
  }

  return (
    <div className='flex gap-2 justify-end'>
      {showEdit && (
        <Button size='icon' variant='ghost' className='h-8 w-8' asChild>
          <a href={getEditPath()}>
            <Pencil className='h-4 w-4' />
          </a>
        </Button>
      )}
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button
            size='icon'
            variant='ghost'
            className='h-8 w-8 text-destructive'
          >
            <Trash className='h-4 w-4' />
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{finalMessages.deleteTitle}</AlertDialogTitle>
            <AlertDialogDescription>
              {finalMessages.deleteDescription}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction asChild>
              <fetcher.Form className='bg-background py-0 px-0' method='delete'>
                <input type='hidden' name={deleteField} value={data[idField]} />
                <Button
                  type='submit'
                  variant='destructive'
                  disabled={isDeleting}
                >
                  {isDeleting ? finalMessages.deletingButton : finalMessages.deleteButton}
                </Button>
              </fetcher.Form>
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
