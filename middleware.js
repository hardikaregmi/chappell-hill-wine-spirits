import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(request) {
  const { pathname } = request.nextUrl;

  // Allow NextAuth routes through
  if (pathname.startsWith("/api/auth")) {
    return NextResponse.next();
  }

  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });

  const isAdmin = token?.role === "admin";

  // Protect admin API routes (except login/logout which are now handled by NextAuth)
  if (pathname.startsWith("/api/admin")) {
    if (!isAdmin) {
      return NextResponse.json(
        { error: "Unauthorized." },
        { status: 401 },
      );
    }
  }

  // Protect upload route
  if (pathname.startsWith("/api/upload")) {
    if (!isAdmin) {
      return NextResponse.json(
        { error: "Unauthorized." },
        { status: 401 },
      );
    }
  }

  // Protect write operations on /api/items
  if (pathname.startsWith("/api/items") && request.method !== "GET") {
    if (!isAdmin) {
      return NextResponse.json(
        { error: "Unauthorized." },
        { status: 401 },
      );
    }
  }

  // Protect write operations on /api/inventory
  if (pathname.startsWith("/api/inventory") && request.method !== "GET") {
    if (!isAdmin) {
      return NextResponse.json(
        { error: "Unauthorized." },
        { status: 401 },
      );
    }
  }

  // Protect admin pages (redirect to login)
  if (pathname.startsWith("/admin") && pathname !== "/admin/login") {
    if (!isAdmin) {
      const url = new URL("/admin/login", request.url);
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/api/admin/:path*",
    "/api/auth/:path*",
    "/api/upload",
    "/api/items/:path*",
    "/api/inventory/:path*",
  ],
};
