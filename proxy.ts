import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PUBLIC_PATHS = ["/signin", "/about", "unauthorized"];

export function proxy(request: NextRequest) {

  // INTEGRATION: PUBLIC AND PRIVATE ROUTES
  // This middleware checks if the incoming request is for a public or private route.
  // For private routes, it verifies the presence of an auth token cookie.
  // If the token is missing, it redirects to the /unauthorized page with a redirect query param.

  // const { pathname } = request.nextUrl;

  // // Allow public paths
  // const isPublic = PUBLIC_PATHS.some(
  //   (path) => pathname === path || pathname.startsWith(path + "/"),
  // );

  // if (isPublic) return NextResponse.next();

  // Check token cookie
  // const token = request.cookies.get("token")?.value;

  // if (!token) {
  //   const unauthorizedUrl = new URL("/unauthorized", request.url);
  //   unauthorizedUrl.searchParams.set("redirect", pathname);
  //   return NextResponse.redirect(unauthorizedUrl);
  // }


// BYPASS
// Remove this bypass in production to enforce auth checks.

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all paths EXCEPT:
     * - _next/static  (Next.js assets)
     * - _next/image   (Next.js image optimization)
     * - favicon.ico
     * - public files (images, fonts, etc.)
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|jpeg|gif|svg|ico|webp|woff2?|ttf)).*)",
  ],
};
