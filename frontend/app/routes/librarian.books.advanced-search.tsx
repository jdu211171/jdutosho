import { LoaderFunctionArgs } from "@remix-run/node";
import { json, useLoaderData, useNavigate, useSearchParams } from "@remix-run/react";
import { useState } from "react";
import { api } from "~/lib/api";
import { requireLibrarianUser, makeAuthenticatedRequest } from "~/services/auth.server";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Button } from "~/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select";
import { Badge } from "~/components/ui/badge";
import { Search, Filter, X, FileDown, Eye } from "lucide-react";
import { DataTable } from "~/components/book-table/data-table";
import { DataTableSkeleton } from "~/components/book-table/data-table-skeleton";
import type { ColumnDef } from "@tanstack/react-table";

export function meta() {
  return [
    { title: "Advanced Book Search" },
    { description: "Search books with advanced filters" },
  ];
}

type Book = {
  id: number;
  code: string;
  name: string;
  author: string;
  language: string;
  category: string;
  status: string;
  isbn?: string;
  taken_by?: string;
};

type LoaderData = {
  books: Book[];
  categories: Array<{ id: number; name: string }>;
  total: number;
  page: number;
  lastPage: number;
};

export async function loader({ request }: LoaderFunctionArgs) {
  await requireLibrarianUser(request);
  
  const url = new URL(request.url);
  const search = url.searchParams.get("search") || "";
  const category = url.searchParams.get("category") || "";
  const language = url.searchParams.get("language") || "";
  const status = url.searchParams.get("status") || "";
  const page = url.searchParams.get("page") || "1";

  return await makeAuthenticatedRequest(request, async () => {
    const [booksResponse, categoriesResponse] = await Promise.all([
      api.get("/books", {
        params: {
          search,
          category,
          language,
          status,
          page,
          view: "codes",
        },
      }),
      api.get("/book-categories/list"),
    ]);

    return json<LoaderData>({
      books: booksResponse.data.data || [],
      categories: categoriesResponse.data.data || [],
      total: booksResponse.data.meta?.total || 0,
      page: parseInt(page),
      lastPage: booksResponse.data.meta?.last_page || 1,
    });
  });
}

const columns: ColumnDef<Book>[] = [
  {
    accessorKey: "code",
    header: "Code",
    cell: ({ row }) => <Badge variant="outline">{row.getValue("code")}</Badge>,
  },
  {
    accessorKey: "name",
    header: "Title",
    cell: ({ row }) => (
      <div>
        <div className="font-medium">{row.getValue("name")}</div>
        {row.original.isbn && (
          <div className="text-sm text-muted-foreground">ISBN: {row.original.isbn}</div>
        )}
      </div>
    ),
  },
  {
    accessorKey: "author",
    header: "Author",
  },
  {
    accessorKey: "category",
    header: "Category",
    cell: ({ row }) => <Badge variant="secondary">{row.getValue("category")}</Badge>,
  },
  {
    accessorKey: "language",
    header: "Language",
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as string;
      const variant = status === "exist" ? "default" : "destructive";
      return <Badge variant={variant}>{status}</Badge>;
    },
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => {
      const book = row.original;
      return (
        <div className="flex gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => window.open(`/api/books/${book.id}/pdf/preview`, "_blank")}
            title="Preview PDF"
          >
            <Eye className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => (window.location.href = `/api/books/${book.id}/pdf/download`)}
            title="Download PDF"
          >
            <FileDown className="h-4 w-4" />
          </Button>
        </div>
      );
    },
  },
];

export default function AdvancedSearchPage() {
  const { books, categories, total, page, lastPage } = useLoaderData<typeof loader>();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);

  // Form state
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [category, setCategory] = useState(searchParams.get("category") || "");
  const [language, setLanguage] = useState(searchParams.get("language") || "");
  const [status, setStatus] = useState(searchParams.get("status") || "");

  const handleSearch = () => {
    setIsLoading(true);
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (category) params.set("category", category);
    if (language) params.set("language", language);
    if (status) params.set("status", status);
    params.set("page", "1");
    
    navigate(`?${params.toString()}`);
  };

  const handleReset = () => {
    setSearch("");
    setCategory("");
    setLanguage("");
    setStatus("");
    navigate("/librarian/books/advanced-search");
  };

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams);
    params.set("page", newPage.toString());
    navigate(`?${params.toString()}`);
  };

  const activeFiltersCount = [category, language, status].filter(Boolean).length;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Advanced Book Search</h2>
        <p className="text-muted-foreground">
          Search books with multiple filters and criteria
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Search Filters
            {activeFiltersCount > 0 && (
              <Badge variant="secondary">{activeFiltersCount} active</Badge>
            )}
          </CardTitle>
          <CardDescription>
            Use any combination of filters to find specific books
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-2">
              <Label htmlFor="search">Search Term</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  id="search"
                  placeholder="Title, author, ISBN, or code..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9"
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger id="category">
                  <SelectValue placeholder="All categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All categories</SelectItem>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id.toString()}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="language">Language</Label>
              <Select value={language} onValueChange={setLanguage}>
                <SelectTrigger id="language">
                  <SelectValue placeholder="All languages" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All languages</SelectItem>
                  <SelectItem value="uz">Uzbek</SelectItem>
                  <SelectItem value="ru">Russian</SelectItem>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="ja">Japanese</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger id="status">
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All statuses</SelectItem>
                  <SelectItem value="exist">Available</SelectItem>
                  <SelectItem value="taken">Taken</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex gap-2">
            <Button onClick={handleSearch} className="flex-1 md:flex-none">
              <Search className="mr-2 h-4 w-4" />
              Search
            </Button>
            <Button variant="outline" onClick={handleReset}>
              <X className="mr-2 h-4 w-4" />
              Reset
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>
            Search Results
            {total > 0 && <span className="ml-2 text-muted-foreground">({total} books)</span>}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={columns}
            data={books}
            isLoading={isLoading}
            pageCount={lastPage}
            currentPage={page}
            onPageChange={handlePageChange}
          />
        </CardContent>
      </Card>
    </div>
  );
}