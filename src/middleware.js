import { NextResponse } from "next/server";
import { auth } from "@/auth";

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};

export default auth((req) => {
  const pathname = new URL(req.url).pathname;
  
  // Public paths that don't require authentication
  if (['/login', '/register', '/'].includes(pathname)) {
    return NextResponse.next();
  }
  
  // Redirect to login if not authenticated
  if (!req.auth) {
    return NextResponse.redirect(new URL('/login', req.url));
  }
  
  return NextResponse.next();
});