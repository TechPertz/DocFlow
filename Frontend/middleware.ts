import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
  const userCookie = request.cookies.get("user")

  // Allow access to login page and API routes
  if (request.nextUrl.pathname === "/login" || request.nextUrl.pathname.startsWith("/api")) {
    return NextResponse.next()
  }

  // If there's no user cookie and we're not on the login page, redirect to login
  if (!userCookie) {
    return NextResponse.redirect(new URL("/login", request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
}

