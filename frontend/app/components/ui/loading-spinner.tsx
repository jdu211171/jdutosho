import { Loader2 } from 'lucide-react'
import { cn } from '~/lib/utils'

interface LoadingSpinnerProps {
	className?: string
	size?: 'sm' | 'md' | 'lg' | 'xl'
}

export function LoadingSpinner({
	className,
	size = 'md',
}: LoadingSpinnerProps) {
	const sizeClasses = {
		sm: 'h-4 w-4',
		md: 'h-6 w-6',
		lg: 'h-8 w-8',
		xl: 'h-12 w-12',
	}

	return (
		<Loader2
			className={cn(
				'animate-spin text-muted-foreground',
				sizeClasses[size],
				className
			)}
		/>
	)
}

interface LoadingOverlayProps {
	className?: string
	message?: string
}

export function LoadingOverlay({
	className,
	message = 'Loading...',
}: LoadingOverlayProps) {
	return (
		<div
			className={cn(
				'fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm',
				className
			)}
		>
			<div className='flex flex-col items-center gap-2'>
				<LoadingSpinner size='lg' />
				<p className='text-sm text-muted-foreground'>{message}</p>
			</div>
		</div>
	)
}

interface LoadingCardProps {
	className?: string
	message?: string
}

export function LoadingCard({
	className,
	message = 'Loading...',
}: LoadingCardProps) {
	return (
		<div
			className={cn(
				'flex min-h-[200px] items-center justify-center rounded-lg border bg-card',
				className
			)}
		>
			<div className='flex flex-col items-center gap-2'>
				<LoadingSpinner size='md' />
				<p className='text-sm text-muted-foreground'>{message}</p>
			</div>
		</div>
	)
}
