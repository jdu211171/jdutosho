import { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { json, useActionData, useLoaderData, Form, useNavigation } from "@remix-run/react";
import { api } from "~/lib/api";
import { requireLibrarianUser, makeAuthenticatedRequest } from "~/services/auth.server";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Button } from "~/components/ui/button";
import { Avatar, AvatarFallback } from "~/components/ui/avatar";
import { Alert, AlertDescription } from "~/components/ui/alert";
import { toast } from "~/hooks/use-toast";
import { User, Mail, Phone, Hash, Calendar, CheckCircle, AlertCircle, Shield } from "lucide-react";
import { format } from "date-fns";
import { Badge } from "~/components/ui/badge";

export function meta() {
  return [
    { title: "Profile Settings" },
    { description: "Manage your profile information" },
  ];
}

type UserProfile = {
  id: number;
  name: string;
  username: string;
  email: string;
  phone?: string;
  role: string;
  created_at: string;
};

type LoaderData = {
  profile: UserProfile;
};

type ActionData = {
  success?: boolean;
  error?: string;
  fieldErrors?: {
    name?: string;
    email?: string;
    phone?: string;
  };
};

export async function loader({ request }: LoaderFunctionArgs) {
  const { user } = await requireLibrarianUser(request);

  return await makeAuthenticatedRequest(request, async () => {
    const response = await api.get('/auth/profile');
    
    return json<LoaderData>({
      profile: response.data.user,
    });
  });
}

export async function action({ request }: ActionFunctionArgs) {
  const { user } = await requireLibrarianUser(request);
  const formData = await request.formData();
  
  const name = formData.get("name")?.toString();
  const email = formData.get("email")?.toString();
  const phone = formData.get("phone")?.toString();

  // Validation
  const fieldErrors: ActionData["fieldErrors"] = {};
  if (!name || name.trim().length < 2) {
    fieldErrors.name = "Name must be at least 2 characters";
  }
  if (!email || !email.includes("@")) {
    fieldErrors.email = "Please enter a valid email address";
  }
  if (phone && phone.length < 9) {
    fieldErrors.phone = "Please enter a valid phone number";
  }

  if (Object.keys(fieldErrors).length > 0) {
    return json<ActionData>({ fieldErrors }, { status: 400 });
  }

  return await makeAuthenticatedRequest(request, async () => {
    try {
      await api.put(`/users/${user.id}`, {
        name,
        email,
        phone: phone || null,
      });

      return json<ActionData>({ success: true });
    } catch (error: any) {
      return json<ActionData>(
        { error: error.response?.data?.message || "Failed to update profile" },
        { status: 400 }
      );
    }
  });
}

export default function LibrarianProfileSettingsPage() {
  const { profile } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  if (actionData?.success) {
    toast({
      title: "Profile Updated",
      description: "Your profile information has been updated successfully.",
    });
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h2 className="text-2xl font-bold">Profile Settings</h2>
        <p className="text-muted-foreground">
          Manage your personal information
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <Avatar className="h-20 w-20">
              <AvatarFallback className="text-lg">
                {getInitials(profile.name)}
              </AvatarFallback>
            </Avatar>
            <div>
              <CardTitle>{profile.name}</CardTitle>
              <CardDescription className="space-y-1">
                <div className="flex items-center gap-2">
                  <User className="h-3 w-3" />
                  <span>@{profile.username}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Shield className="h-3 w-3" />
                  <Badge variant="outline" className="text-xs">
                    {profile.role}
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                  <Hash className="h-3 w-3" />
                  <span>ID: {profile.id}</span>
                </div>
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {actionData?.success && (
            <Alert className="mb-6">
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                Profile updated successfully!
              </AlertDescription>
            </Alert>
          )}

          {actionData?.error && (
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{actionData.error}</AlertDescription>
            </Alert>
          )}

          <Form method="post" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                name="name"
                defaultValue={profile.name}
                placeholder="Enter your full name"
                disabled={isSubmitting}
              />
              {actionData?.fieldErrors?.name && (
                <p className="text-sm text-destructive">
                  {actionData.fieldErrors.name}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                value={profile.username}
                disabled
                className="bg-muted"
              />
              <p className="text-xs text-muted-foreground">
                Username cannot be changed
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  name="email"
                  type="email"
                  defaultValue={profile.email}
                  placeholder="your.email@example.com"
                  className="pl-10"
                  disabled={isSubmitting}
                />
              </div>
              {actionData?.fieldErrors?.email && (
                <p className="text-sm text-destructive">
                  {actionData.fieldErrors.email}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  defaultValue={profile.phone || ""}
                  placeholder="+998 90 123 45 67"
                  className="pl-10"
                  disabled={isSubmitting}
                />
              </div>
              {actionData?.fieldErrors?.phone && (
                <p className="text-sm text-destructive">
                  {actionData.fieldErrors.phone}
                </p>
              )}
            </div>

            <div className="pt-4 border-t space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Shield className="h-4 w-4" />
                <span>
                  Role: <Badge variant="secondary" className="ml-1">{profile.role}</Badge>
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span>
                  Member since {format(new Date(profile.created_at), "MMMM d, yyyy")}
                </span>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}