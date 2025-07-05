import { ActionFunctionArgs, LoaderFunctionArgs, json } from "@remix-run/node";
import { Form, Link, useActionData, useNavigation } from "@remix-run/react";
import { AlertCircle, CheckCircle, Loader2, Mail } from "lucide-react";
import { z } from "zod";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { api } from "~/lib/api";
import { Alert, AlertDescription } from "~/components/ui/alert";

const forgotPasswordSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

export async function loader({ request }: LoaderFunctionArgs) {
  // Check if user is already authenticated
  return json({});
}

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const email = formData.get("email");

  try {
    const validatedData = forgotPasswordSchema.parse({ email });

    const response = await api.post("/auth/forgot-password", {
      email: validatedData.email,
    });

    return json({ 
      success: true, 
      message: response.data.message || "Password reset link sent to your email" 
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return json({ 
        error: error.errors[0].message 
      }, { status: 400 });
    }

    if (error.response?.data?.message) {
      return json({ 
        error: error.response.data.message 
      }, { status: 400 });
    }

    return json({ 
      error: "Failed to send password reset link. Please try again." 
    }, { status: 500 });
  }
}

export default function ForgotPasswordPage() {
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">
            Forgot Password
          </CardTitle>
          <CardDescription className="text-center">
            Enter your email address and we'll send you a password reset link
          </CardDescription>
        </CardHeader>
        <CardContent>
          {actionData?.success ? (
            <Alert className="mb-6">
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                {actionData.message}
              </AlertDescription>
            </Alert>
          ) : actionData?.error ? (
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {actionData.error}
              </AlertDescription>
            </Alert>
          ) : null}

          <Form method="post" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="you@example.com"
                  required
                  className="pl-10"
                  disabled={isSubmitting || actionData?.success}
                />
              </div>
            </div>

            <Button 
              type="submit" 
              className="w-full"
              disabled={isSubmitting || actionData?.success}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : (
                "Send Reset Link"
              )}
            </Button>
          </Form>

          <div className="mt-6 text-center text-sm">
            <span className="text-gray-600 dark:text-gray-400">
              Remember your password?{" "}
            </span>
            <Link 
              to="/login" 
              className="font-medium text-primary hover:underline"
            >
              Sign in
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}