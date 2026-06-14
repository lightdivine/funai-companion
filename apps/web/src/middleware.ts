import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const isAuth = !!token;
    const pathname = req.nextUrl.pathname;

    // 1. If trying to access admin routes, check for ADMIN role
    if (pathname.startsWith("/admin") && token?.role !== "ADMIN") {
      return NextResponse.redirect(new URL("/", req.url));
    }

    // 2. If trying to access staff routes, check for STAFF or ADMIN role
    if (pathname.startsWith("/staff") && token?.role !== "STAFF" && token?.role !== "ADMIN") {
      return NextResponse.redirect(new URL("/", req.url));
    }

    // 3. If logged in and trying to access auth pages (like sign-in), redirect to dashboard
    if (pathname.startsWith("/login") && isAuth) {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      // This ensures the middleware function above only runs if authorized check passes
      authorized: ({ token, req }) => {
        const pathname = req.nextUrl.pathname;
        
        // Define public routes that anyone can see without logging in
        const isPublicRoute = 
          pathname === "/" || 
          pathname === "/login" || 
          pathname.startsWith("/api/auth");

        if (isPublicRoute) return true;

        // If it's not a public route, user MUST have a valid token (be logged in)
        return !!token;
      },
    },
  }
);

// This controls exactly which paths Next.js sends through this guard
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder assets
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};