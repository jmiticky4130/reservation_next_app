"use client";
import { SessionProvider } from "next-auth/react";
import { useSession } from "next-auth/react";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

function SessionHandler({ children }) {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    // If user is unauthenticated after loading, redirect to login
    if (status === "unauthenticated") {
      const currentPath = window.location.pathname;
      
      // Only redirect if not already on public pages
      const publicPaths = ["/", "/login", "/register"];
      if (!publicPaths.includes(currentPath)) {
        router.push("/login");
      }
    }
  }, [status, router]);

  // Show loading state while determining authentication status
  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  return children;
}

export default function AuthProvider({ children }) {
  return (
    <SessionProvider
      refetchInterval={2 * 60 * 60}
      refetchOnWindowFocus={false}
      refetchWhenOffline={false}
    >
      <SessionHandler>{children}</SessionHandler>
    </SessionProvider>
  );
}