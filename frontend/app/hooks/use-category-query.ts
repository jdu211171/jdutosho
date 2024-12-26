import { useSearchParams } from '@remix-run/react'

export function useCategoryQuery() {
	const [searchParams, setSearchParams] = useSearchParams()
	const page = searchParams.get('page') || '1'
	const query = searchParams.get('query') || ''

	const handlePageChange = (newPage: number) => {
		setSearchParams(prev => {
			prev.set('page', newPage.toString())
			return prev
		})
	}

	const handleSearch = (searchTerm: string) => {
		setSearchParams(prev => {
			if (searchTerm) {
				prev.set('query', searchTerm)
			} else {
				prev.delete('query')
			}
			prev.set('page', '1')
			return prev
		})
	}

	return {
		currentPage: parseInt(page),
		query,
		handlePageChange,
		handleSearch,
	}
}
