import { useSearchParams } from '@remix-run/react'

export function useRentsQuery() {
    const [searchParams, setSearchParams] = useSearchParams()
    const page = searchParams.get('page') || '1'
    const search = searchParams.get('search') || ''

    const handlePageChange = (newPage: number) => {
        setSearchParams(prev => {
            prev.set('page', newPage.toString())
            return prev
        })
    }

    const handleSearch = (searchTerm: string) => {
        setSearchParams(prev => {
            if (searchTerm) {
                prev.set('search', searchTerm)
            } else {
                prev.delete('search')
            }
            prev.set('page', '1')
            return prev
        })
    }

    return {
        currentPage: parseInt(page),
        search,
        handlePageChange,
        handleSearch,
    }
}
