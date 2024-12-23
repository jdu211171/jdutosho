import { type ColumnDef } from '@tanstack/react-table'
import { Button } from '~/components/ui/button'
import { Pencil, Trash } from 'lucide-react'
import type { Category } from '~/types/categories'
import { useFetcher } from '@remix-run/react'
import { cleanText } from '~/lib/utils'
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '~/components/ui/alert-dialog'
import { useState, useEffect } from 'react'
import { toast } from '~/hooks/use-toast'

export const columns: ColumnDef<Category>[] = [
  {
    accessorKey: 'name',
    header: 'Name',
    cell: ({ row }) => {
      return cleanText(row.original.name)
    },
  },
  {
    id: 'actions',
    cell: ({ row }) => {
      const category = row.original
      const fetcher = useFetcher()
      const [isOpen, setIsOpen] = useState(false)
      const isDeleting = fetcher.state !== 'idle'

      // Handle success/error toast messages
      useEffect(() => {
        if (fetcher.state === 'idle') {
          if (fetcher.data?.success) {
            toast({
              title: 'Success',
              description: 'Category deleted successfully',
            })
          } else if (fetcher.data?.error) {
            toast({
              title: 'Error',
              description: fetcher.data.error,
              variant: 'destructive',
            })
          }
        }
      }, [fetcher.state, fetcher.data])

      const handleDelete = () => {
        fetcher.submit(
          null,
          {
            method: 'delete',
            action: `/book-categories/${category.id}`
          }
        )
        setIsOpen(false)
      }

      return (
        <div className='flex gap-2 justify-end'>
          <Button size='icon' variant='ghost' className='h-8 w-8' asChild>
            <a href={`/librarian/book-categories/${category.id}/edit`}>
              <Pencil className='h-4 w-4' />
            </a>
          </Button>
          <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
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
                <AlertDialogTitle>Delete Category</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to delete the category "{category.name}"? This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <Button
                  onClick={handleDelete}
                  variant='destructive'
                  disabled={isDeleting}
                >
                  {isDeleting ? 'Deleting...' : 'Delete'}
                </Button>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      )
    },
  },
]
