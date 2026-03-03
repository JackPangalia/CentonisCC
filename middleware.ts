import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const sessionCookie = request.cookies.get("mvp_session")?.value;
  const isAuthed = sessionCookie === "1";
  const pathname = request.nextUrl.pathname;

  const appRoutes = [
    "/dashboard",
    "/daily",
    "/weekly",
    "/monthly",
    "/quarterly",
    "/yearly",
    "/projects",
    "/notes",
    "/entry",
    "/settings",
    "/onboarding",
  ];

  const appRoute = appRoutes.some((r) => pathname.startsWith(r));
  const authRoute =
    pathname.startsWith("/login") || pathname.startsWith("/signup");

  if (pathname === "/") {
    if (isAuthed) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    } else {
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  if (appRoute && !isAuthed) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (authRoute && isAuthed) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/",
    "/dashboard/:path*",
    "/daily/:path*",
    "/weekly/:path*",
    "/monthly/:path*",
    "/quarterly/:path*",
    "/yearly/:path*",
    "/projects/:path*",
    "/notes/:path*",
    "/entry/:path*",
    "/settings/:path*",
    "/onboarding/:path*",
    "/login",
    "/signup",
  ],
};
