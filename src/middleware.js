import { NextResponse } from "next/server";
import { auth } from "@/auth";

export const config = {
  matcher: [
    // Include all paths
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
    
  ],
};
export default auth((req) => {
  const reqUrl = new URL(req.url);
  const pathname = reqUrl.pathname;
  
  // Define public paths that don't require authentication
  const publicPaths = ['/login', '/register'];
  const isPublicPath = publicPaths.some(path => pathname === path);
  
  // If it's a public path, allow access without authentication
  if (isPublicPath) {
    console.log("Public path accessed:", pathname);
    return NextResponse.next();
  }
  if (!req.auth) {
    return NextResponse.redirect(
      new URL(
        '/login',
        req.url
      )
    );
  }
});