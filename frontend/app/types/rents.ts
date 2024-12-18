export type RentBook = {
    id: number
    book_code: string
    status: string
    book: string
    taken_by: string
    given_by: string
    given_date: string
    passed_days: number
}

export type RentsPaginationMeta = {
    current_page: number
    last_page: number
    per_page: number
    total: number
}

export type RentsResponse = {
    data: RentBook[]
    meta: RentsPaginationMeta
}

export type PendingReturn = {
    id: number
    book_code: string
    status: string
    book: string
    taken_by: string
    taken_by_login_id: string
    given_by: string
    given_date: string
    return_date: string
    passed_days: number
}

export type PendingReturnsResponse = {
    data: PendingReturn[]
    meta: RentsPaginationMeta
}
