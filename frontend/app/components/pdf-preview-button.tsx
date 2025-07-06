import { useState } from 'react'
import { FileText } from 'lucide-react'
import { Button } from '~/components/ui/button'
import { PDFPreviewModal } from '~/components/pdf-preview-modal'
import type { Book } from '~/types/books'

interface PDFPreviewButtonProps {
	book: Book
	variant?: 'ghost' | 'outline' | 'default'
	size?: 'sm' | 'default' | 'lg' | 'icon'
}

export function PDFPreviewButton({ book, variant = 'ghost', size = 'sm' }: PDFPreviewButtonProps) {
	const [isModalOpen, setIsModalOpen] = useState(false)

	if (!book.has_pdf) return null

	return (
		<>
			<Button
				variant={variant}
				size={size}
				onClick={() => setIsModalOpen(true)}
				title='Preview PDF'
			>
				<FileText className='h-4 w-4' />
			</Button>
			<PDFPreviewModal
				isOpen={isModalOpen}
				onClose={() => setIsModalOpen(false)}
				pdfUrl={`/api/books/${book.id}/pdf/preview`}
				bookTitle={book.name}
				bookId={book.id}
			/>
		</>
	)
}