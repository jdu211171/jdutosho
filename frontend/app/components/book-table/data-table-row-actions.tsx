import { DotsHorizontalIcon } from '@radix-ui/react-icons'
import { Button } from '~/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '~/components/ui/dropdown-menu'
import { LendBookDialog } from '~/components/lend-book-dialog'
import { Link } from '@remix-run/react'
import { useFetcher } from '@remix-run/react'
import { useEffect } from 'react'
import { toast } from '~/hooks/use-toast'
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
import { Trash } from 'lucide-react'

export function DataTableRowActions({ row }: { row: any }) {
  const fetcher = useFetcher<{ success: boolean; error: string }>()
  const isDeleting = fetcher.state !== 'idle'

  useEffect(() => {
    if (fetcher.state === 'idle' && fetcher.data?.success) {
      toast({
        title: 'Success',
        description: 'Book deleted successfully',
      })
    } else if (fetcher.state === 'idle' && fetcher.data?.error) {
      toast({
        title: 'Error',
        description: fetcher.data.error,
        variant: 'destructive',
      })
    }
  }, [fetcher.state, fetcher.data])

  const handleDelete = () => {
    const formData = new FormData()
    formData.append('bookId', row.original.id.toString())
    fetcher.submit(formData, { method: 'delete' })
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="flex h-8 w-8 p-0 data-[state=open]:bg-muted"
        >
          <DotsHorizontalIcon className="h-4 w-4" />
          <span className="sr-only">Open menu</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[160px]">
        <Link to={`/librarian/books/${row.original.id}/edit`}>
          <DropdownMenuItem>Edit</DropdownMenuItem>
        </Link>
        {row.original.status !== 'rent' && row.original.status !== 'lost' && (
          <LendBookDialog initialBookId={row.original.code}>
            <DropdownMenuItem onSelect={e => e.preventDefault()}>
              Lend
            </DropdownMenuItem>
          </LendBookDialog>
        )}
        {(row.original.status === 'rent' || row.original.status === 'lost') && (
          <DropdownMenuItem disabled>Lend</DropdownMenuItem>
        )}
        <DropdownMenuSeparator />
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <DropdownMenuItem onSelect={e => e.preventDefault()}>
              Delete
            </DropdownMenuItem>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Book</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete the book "{row.original.name}"? This action cannot be
                undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <Button
                type="button"
                variant="destructive"
                disabled={isDeleting}
                onClick={handleDelete}
              >
                {isDeleting ? 'Deleting...' : 'Delete'}
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
