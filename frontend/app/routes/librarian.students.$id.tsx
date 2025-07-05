import { LoaderFunctionArgs } from "@remix-run/node";
import { json, useLoaderData, Link } from "@remix-run/react";
import { api } from "~/lib/api";
import { requireLibrarianUser, makeAuthenticatedRequest } from "~/services/auth.server";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Avatar, AvatarFallback } from "~/components/ui/avatar";
import { ArrowLeft, Book, Calendar, Mail, Phone, User, Hash, Clock, BookOpen } from "lucide-react";
import { format } from "date-fns";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { DataTable } from "~/components/book-table/data-table";
import type { ColumnDef } from "@tanstack/react-table";

export function meta() {
  return [
    { title: "Student Profile" },
    { description: "View student details and rental history" },
  ];
}

type StudentData = {
  id: number;
  name: string;
  username: string;
  email: string;
  phone?: string;
  role: string;
  created_at: string;
  updated_at: string;
};

type RentalHistory = {
  id: number;
  book_code: string;
  book_name: string;
  author: string;
  taken_at: string;
  returned_at?: string;
  status: 'active' | 'returned' | 'pending';
};

type LoaderData = {
  student: StudentData;
  activeRentals: RentalHistory[];
  rentalHistory: RentalHistory[];
  stats: {
    totalRented: number;
    currentlyBorrowed: number;
    overdue: number;
  };
};

export async function loader({ request, params }: LoaderFunctionArgs) {
  await requireLibrarianUser(request);

  return await makeAuthenticatedRequest(request, async () => {
    // Get student details
    const studentResponse = await api.get(`/users/${params.id}`);
    const student = studentResponse.data.data;

    // Get rental history
    const rentalsResponse = await api.get('/rents', {
      params: {
        student_id: params.id,
      },
    });

    const rentals = rentalsResponse.data.data || [];
    
    const activeRentals = rentals.filter((r: any) => r.status === 'taken');
    const rentalHistory = rentals.map((rental: any) => ({
      id: rental.id,
      book_code: rental.book_code,
      book_name: rental.book_name,
      author: rental.book_author || 'Unknown',
      taken_at: rental.taken_at,
      returned_at: rental.returned_at,
      status: rental.status === 'taken' ? 'active' : rental.status === 'returned' ? 'returned' : 'pending',
    }));

    const stats = {
      totalRented: rentals.length,
      currentlyBorrowed: activeRentals.length,
      overdue: 0, // TODO: Calculate overdue books based on library policy
    };

    return json<LoaderData>({
      student,
      activeRentals,
      rentalHistory,
      stats,
    });
  });
}

const rentalColumns: ColumnDef<RentalHistory>[] = [
  {
    accessorKey: "book_code",
    header: "Code",
    cell: ({ row }) => <Badge variant="outline">{row.getValue("book_code")}</Badge>,
  },
  {
    accessorKey: "book_name",
    header: "Book Title",
    cell: ({ row }) => (
      <div>
        <div className="font-medium">{row.getValue("book_name")}</div>
        <div className="text-sm text-muted-foreground">{row.original.author}</div>
      </div>
    ),
  },
  {
    accessorKey: "taken_at",
    header: "Borrowed Date",
    cell: ({ row }) => format(new Date(row.getValue("taken_at")), "MMM d, yyyy"),
  },
  {
    accessorKey: "returned_at",
    header: "Returned Date",
    cell: ({ row }) => {
      const returnedAt = row.getValue("returned_at") as string | undefined;
      return returnedAt ? format(new Date(returnedAt), "MMM d, yyyy") : "-";
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as string;
      const variant = status === "active" ? "default" : status === "returned" ? "secondary" : "outline";
      return <Badge variant={variant}>{status}</Badge>;
    },
  },
];

export default function StudentProfilePage() {
  const { student, activeRentals, rentalHistory, stats } = useLoaderData<typeof loader>();

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link to="/librarian/students">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Students
          </Button>
        </Link>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Profile Card */}
        <Card className="md:col-span-1">
          <CardHeader>
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16">
                <AvatarFallback>{getInitials(student.name)}</AvatarFallback>
              </Avatar>
              <div>
                <CardTitle>{student.name}</CardTitle>
                <CardDescription>@{student.username}</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span>{student.email}</span>
              </div>
              {student.phone && (
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span>{student.phone}</span>
                </div>
              )}
              <div className="flex items-center gap-2 text-sm">
                <Hash className="h-4 w-4 text-muted-foreground" />
                <span>ID: {student.id}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <User className="h-4 w-4 text-muted-foreground" />
                <Badge variant="outline">{student.role}</Badge>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span>Joined {format(new Date(student.created_at), "MMM d, yyyy")}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats Cards */}
        <div className="md:col-span-2 grid gap-4 sm:grid-cols-3">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Total Books Rented</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Book className="h-8 w-8 text-muted-foreground" />
                <span className="text-3xl font-bold">{stats.totalRented}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Currently Borrowed</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <BookOpen className="h-8 w-8 text-primary" />
                <span className="text-3xl font-bold">{stats.currentlyBorrowed}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Overdue Books</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Clock className="h-8 w-8 text-destructive" />
                <span className="text-3xl font-bold">{stats.overdue}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Rental Information */}
      <Card>
        <CardHeader>
          <CardTitle>Rental Information</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="active">
            <TabsList>
              <TabsTrigger value="active">
                Active Rentals ({activeRentals.length})
              </TabsTrigger>
              <TabsTrigger value="history">
                Rental History ({rentalHistory.length})
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="active" className="mt-4">
              {activeRentals.length > 0 ? (
                <DataTable
                  columns={rentalColumns}
                  data={activeRentals}
                />
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No active rentals
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="history" className="mt-4">
              {rentalHistory.length > 0 ? (
                <DataTable
                  columns={rentalColumns}
                  data={rentalHistory}
                />
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No rental history
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}