import { LoaderFunctionArgs } from "@remix-run/node";
import { json, useLoaderData } from "@remix-run/react";
import { api } from "~/lib/api";
import { requireLibrarianUser, makeAuthenticatedRequest } from "~/services/auth.server";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { Input } from "~/components/ui/input";
import { useState } from "react";
import { Search } from "lucide-react";

export function meta() {
  return [
    { title: "Available Book Codes" },
    { description: "View all available book codes in the library" },
  ];
}

type AvailableCode = {
  code: string;
  book_id: number;
  book_name: string;
  author: string;
  category: string;
};

type LoaderData = {
  availableCodes: AvailableCode[];
};

export async function loader({ request }: LoaderFunctionArgs) {
  await requireLibrarianUser(request);

  return await makeAuthenticatedRequest(request, async () => {
    const response = await api.get("/books/available-codes");
    
    return json<LoaderData>({
      availableCodes: response.data.data || [],
    });
  });
}

export default function AvailableCodesPage() {
  const { availableCodes } = useLoaderData<typeof loader>();
  const [searchTerm, setSearchTerm] = useState("");

  const filteredCodes = availableCodes.filter(
    (item) =>
      item.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.book_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const groupedByBook = filteredCodes.reduce((acc, item) => {
    const key = `${item.book_id}-${item.book_name}`;
    if (!acc[key]) {
      acc[key] = {
        book_id: item.book_id,
        book_name: item.book_name,
        author: item.author,
        category: item.category,
        codes: [],
      };
    }
    acc[key].codes.push(item.code);
    return acc;
  }, {} as Record<string, { book_id: number; book_name: string; author: string; category: string; codes: string[] }>);

  const totalAvailable = availableCodes.length;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Available Book Codes</h2>
          <p className="text-muted-foreground">
            Total available codes: {totalAvailable}
          </p>
        </div>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
        <Input
          type="text"
          placeholder="Search by code, book title, author, or category..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {Object.keys(groupedByBook).length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">
              {searchTerm ? "No codes found matching your search." : "No available codes at the moment."}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Object.values(groupedByBook).map((book) => (
            <Card key={book.book_id}>
              <CardHeader>
                <CardTitle className="text-lg">{book.book_name}</CardTitle>
                <CardDescription>
                  {book.author} • {book.category}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">
                    Available codes ({book.codes.length}):
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {book.codes.map((code) => (
                      <Badge key={code} variant="secondary">
                        {code}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}