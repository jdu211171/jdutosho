import {createCookieSessionStorage, redirect} from "@remix-run/node";
import {User} from "~/types/auth";

export const sessionStorage = createCookieSessionStorage({
    cookie: {
        name: "auth_session",
        secure: process.env.NODE_ENV === "production",
        secrets: ["your-secret-key"], // Replace with your secret
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24 * 30, // 30 days
        httpOnly: true,
    },
});

export async function createUserSession(token: string, user: User) {
    const session = await sessionStorage.getSession();
    session.set("token", token);
    session.set("user", user);

    return redirect(user.role === 'librarian' ? '/librarian/books' : '/student/books', {
        headers: {
            "Set-Cookie": await sessionStorage.commitSession(session),
        },
    });
}