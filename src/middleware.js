import { NextResponse } from "next/server";
import { auth } from "@/auth";

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};

export default auth((req) => {
  const pathname = new URL(req.url).pathname;
  const session = req.auth;
  
  // Public paths that don't require authentication
  const publicPaths = ['/login', '/register', '/', '/cancel-appointment'];
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
  
  // Admin route protection - must be first to check
  if (pathname.startsWith('/admin')) {
    // Only users with isAdmin: true can access admin routes
    if (!session.user.isAdmin) {
      return NextResponse.redirect(new URL('/', req.url));
    }
  }
  
  // Role-based route protection for barbers
  if (pathname.startsWith('/barber')) {
    // Only barbers can access barber routes
    if (session.user.role !== 'barber') {
      return NextResponse.redirect(new URL('/', req.url));
    }
  }
  
  return NextResponse.next();
});