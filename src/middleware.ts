
import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
    function middleware(req) {
        const token = req.nextauth.token;
        const path = req.nextUrl.pathname;

        // 1. Redirect unauthenticated users to login
        if (!token) {
            return NextResponse.redirect(new URL("/login", req.url));
        }

        const userRole = token.role as string;

        // 2. Protect Admin Routes
        if (path.startsWith("/admin")) {
            if (userRole !== "admin") {
                return NextResponse.redirect(new URL("/", req.url));
            }
        }

        // 3. Protect Teacher Routes
        if (path.startsWith("/teacher")) {
            if (userRole !== "teacher" && userRole !== "admin") {
                return NextResponse.redirect(new URL("/", req.url));
            }
        }

        // 4. Protect Student Routes
        if (path.startsWith("/student")) {
            if (userRole !== "student" && userRole !== "admin") {
                return NextResponse.redirect(new URL("/", req.url));
            }
        }

        return NextResponse.next();
    },
    {
        callbacks: {
            authorized: ({ token }) => !!token,
        },
    }
);

export const config = {
    matcher: ["/admin/:path*", "/teacher/:path*", "/student/:path*"],
};
