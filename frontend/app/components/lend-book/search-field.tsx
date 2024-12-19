import {
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from '~/components/ui/form'
import { Input } from '~/components/ui/input'
import type { KeyboardEvent } from 'react'
import { SearchResults } from './search-results'
import type { Book, Student } from '~/types/lend-book'

interface SearchFieldProps {
	form: any
	name: 'bookId' | 'studentId'
	label: string
	placeholder: string
	onSearch: (value: string) => void
	searchValue: string
	searchResults?: { data: (Book | Student)[] }
	isLoading: boolean
	selectedIndex: number
	onKeyNavigation: (e: KeyboardEvent) => void
	onSelect: (value: string) => void
	onFocus: () => void
}

export function SearchField({
	form,
	name,
	label,
	placeholder,
	onSearch,
	searchValue,
	searchResults,
	isLoading,
	selectedIndex,
	onKeyNavigation,
	onSelect,
	onFocus,
}: SearchFieldProps) {
	return (
		<FormField
			control={form.control}
			name={name}
			render={({ field }) => (
				<FormItem>
					<FormLabel>{label}</FormLabel>
					<FormControl>
						<div className='relative'>
							<Input
								{...field}
								placeholder={placeholder}
								onChange={e => {
									onSearch(e.target.value)
									field.onChange(e.target.value)
								}}
								onFocus={onFocus}
								onKeyDown={onKeyNavigation}
								autoComplete='off'
							/>
							{searchValue && (
								<div className='absolute z-10 mt-1 w-full bg-background border rounded-md shadow-md max-h-60 overflow-y-auto'>
									<SearchResults
										type={name === 'bookId' ? 'book' : 'student'}
										data={searchResults}
										isLoading={isLoading}
										selectedIndex={selectedIndex}
										onSelect={value => {
											form.setValue(name, value)
											onSelect('')
										}}
										currentValue={field.value}
									/>
								</div>
							)}
						</div>
					</FormControl>
					<FormMessage />
				</FormItem>
			)}
		/>
	)
}
