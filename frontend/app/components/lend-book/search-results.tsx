import { cn } from '~/lib/utils'
import type { Book, Student } from '~/types/lend-book'

interface SearchResultsProps {
	type: 'book' | 'student'
	data?: { data: (Book | Student)[] }
	isLoading: boolean
	selectedIndex: number
	onSelect: (value: string) => void
	currentValue: string
}

export function SearchResults({
	type,
	data,
	isLoading,
	selectedIndex,
	onSelect,
	currentValue,
}: SearchResultsProps) {
	if (isLoading) {
		return <div className='p-2 text-foreground'>Loading...</div>
	}

	if (!data?.data.length) {
		return <div className='p-2 text-foreground'>No results found</div>
	}

	return data.data.map((item, index) => {
		const value =
			type === 'book' ? (item as Book).code : (item as Student).loginID
		return (
			<div
				key={item.id}
				className={cn(
					'cursor-pointer px-4 py-2 hover:bg-accent/50 transition-colors',
					index === selectedIndex && 'bg-accent text-accent-foreground',
					currentValue === value && 'font-medium'
				)}
				role='button'
				tabIndex={0}
				onClick={() => onSelect(value)}
				onKeyDown={e => {
					if (e.key === 'Enter' || e.key === ' ') {
						onSelect(value)
					}
				}}
			>
				{value}
			</div>
		)
	})
}
