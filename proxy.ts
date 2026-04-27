// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PUBLIC_PATHS = ["/signin", "/login", "/about", "/unauthorized"];
const API_PUBLIC_PATHS = ["/api/auth/login", "/api/auth/logout"];

export default function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow public paths
  const isPublic = PUBLIC_PATHS.some(
    (path) => pathname === path || pathname.startsWith(path + "/"),
  );

  if (isPublic) return NextResponse.next();

  // Allow public API endpoints
  const isPublicApi = API_PUBLIC_PATHS.some(
    (path) => pathname === path || pathname.startsWith(path + "/"),
  );

  if (isPublicApi) return NextResponse.next();

  // Check token cookie for protected routes
  const token = request.cookies.get("token")?.value;

  // For API routes, return 401
  if (pathname.startsWith("/api/")) {
    if (!token) {
      return NextResponse.json(
        { error: "Unauthorized", message: "Session Expired", retCode: "104" },
        { status: 401 },
      );
    }
    return NextResponse.next();
  }

  // For pages, redirect to unauthorized
  if (!token) {
    const unauthorizedUrl = new URL("/unauthorized", request.url);
    unauthorizedUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(unauthorizedUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|jpeg|gif|svg|ico|webp|woff2?|ttf)).*)",
  ],
};
