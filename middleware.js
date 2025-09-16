import { NextResponse } from "next/server";

const COOKIE = "first_seen";

export function middleware(req) {
  const res = NextResponse.next();

  // If no cookie yet, set a header to indicate first visit
  // Let the layout handle setting the actual cookie
  if (!req.cookies.get(COOKIE)) {
    res.headers.set("x-first-visit", "1");
  }

  return res;
}

export const config = {
  // run on all routes except Next static assets
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
