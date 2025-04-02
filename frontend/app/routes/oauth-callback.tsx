import { json, redirect } from "@remix-run/node";
import type { LoaderFunctionArgs } from "@remix-run/node";
import { createUserSession } from "~/services/auth.server";
import type { User } from "~/types/auth";

export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const token = url.searchParams.get('token');
  const encodedUser = url.searchParams.get('user');
  const provider = url.searchParams.get('provider');
  
  if (!token || !encodedUser || !provider) {
    return redirect('/login?error=Invalid%20authentication%20response');
  }
  
  try {
    // Decode base64-encoded user data
    const userJson = atob(encodedUser);
    const user = JSON.parse(userJson) as User;
    
    // Create user session and redirect to the appropriate dashboard
    return createUserSession(token, user);
  } catch (error) {
    console.error("Error processing OAuth callback:", error);
    return redirect('/login?error=Authentication%20failed');
  }
}

// This route is just a processor, it doesn't render anything
export default function OAuthCallbackRoute() {
  return null;
}
