import { FileDown, X } from 'lucide-react'
import { Button } from '~/components/ui/button'
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from '~/components/ui/dialog'

interface PDFPreviewModalProps {
	isOpen: boolean
	onClose: () => void
	pdfUrl: string
	bookTitle: string
	bookId: number
}

export function PDFPreviewModal({
	isOpen,
	onClose,
	pdfUrl,
	bookTitle,
	bookId,
}: PDFPreviewModalProps) {
	const handleDownload = () => {
		// Direct download from backend since authentication is not required
		window.location.href = `http://localhost:8000/api/books/${bookId}/pdf/download`
	}

	// Use backend URL directly for PDF preview
	const backendPdfUrl = pdfUrl.replace('/api/books/', 'http://localhost:8000/api/books/')

	return (
		<Dialog open={isOpen} onOpenChange={onClose}>
			<DialogContent className='max-w-4xl h-[90vh] flex flex-col'>
				<DialogHeader className='flex-shrink-0'>
					<DialogTitle className='flex items-center justify-between'>
						<span>{bookTitle}</span>
						<div className='flex items-center gap-2'>
							<Button
								variant='outline'
								size='sm'
								onClick={handleDownload}
							>
								<FileDown className='h-4 w-4 mr-2' />
								Download
							</Button>
							<Button
								variant='ghost'
								size='icon'
								onClick={onClose}
							>
								<X className='h-4 w-4' />
							</Button>
						</div>
					</DialogTitle>
				</DialogHeader>
				<div className='flex-1 overflow-hidden'>
					<iframe
						src={backendPdfUrl}
						className='w-full h-full'
						title={`${bookTitle} PDF`}
					/>
				</div>
			</DialogContent>
		</Dialog>
	)
}