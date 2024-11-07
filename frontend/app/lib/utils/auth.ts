import {redirect} from "@remix-run/node";
import {User} from "~/types/auth";
import {sessionStorage} from "~/lib/utils/auth.server";

export const AUTH_COOKIE_NAME = 'user_session';

// Client-side logout function
export function logout() {
    // Clear session cookie
    document.cookie = `${AUTH_COOKIE_NAME}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;

    // Redirect to login page
    window.location.href = '/login';
}

// Server-side logout handler
export async function serverLogout() {
    // Clear session and redirect
    return redirect('/login', {
        headers: {
            'Set-Cookie': `${AUTH_COOKIE_NAME}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; HttpOnly; SameSite=Strict`
        }
    });
}

export async function requireLibrarianAuth(request: Request) {
    const user = await getCurrentUser(request);
    if (!user || user.role !== 'librarian') {
        throw redirect("/login");
    }
    return {user};
}

export async function requireStudentAuth(request: Request) {
    const user = await getCurrentUser(request);
    if (!user || user.role !== 'student') {
        throw redirect("/login");
    }
    return {user};
}

async function getCurrentUser(request: Request): Promise<User | null> {
    const session = await sessionStorage.getSession(request.headers.get("Cookie"));
    const user = session.get("user");
    return user ? user : null;
}