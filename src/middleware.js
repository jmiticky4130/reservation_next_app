import { NextResponse } from "next/server";
import { auth } from "@/auth";

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};

export default auth((req) => {
  const pathname = new URL(req.url).pathname;
  const session = req.auth;
  
  // Public paths that don't require authentication
  const publicPaths = ['/login', '/register', '/'];
  if (publicPaths.includes(pathname)) {
    return NextResponse.next();
  }
  
  // Redirect to login if not authenticated
  if (!session?.user) {
    // Add role parameter for barber routes
    if (pathname.startsWith('/barber')) {
      return NextResponse.redirect(new URL('/login?role=barber', req.url));
    }
    return NextResponse.redirect(new URL('/login', req.url));
  }
  
  // Role-based route protection
  if (pathname.startsWith('/barber')) {
    // Only barbers can access barber routes
    if (session.user.role !== 'barber') {
      return NextResponse.redirect(new URL('/', req.url));
    }
  }
  
  // Future: Add customer-only routes if needed
  // if (pathname.startsWith('/customer')) {
  //   if (session.user.role !== 'customer') {
  //     return NextResponse.redirect(new URL('/', req.url));
  //   }
  // }
  
  return NextResponse.next();
});