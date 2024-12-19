export type Category = {
    id: number
    name: string
}

export type CategoriesPaginationMeta = {
    current_page: number
    last_page: number
    per_page: number
    total: number
}

export type CategoriesResponse = {
    data: Category[]
    meta: CategoriesPaginationMeta
}
