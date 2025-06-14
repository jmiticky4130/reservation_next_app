import LoginForm from "@/app/components/login-form";
import { Suspense } from "react";
import { auth } from "@/auth";

export default async function LoginPage({ searchParams }) {
  // Access search parameters directly
  const session = await auth();
    if (session?.user) {
        // If user is already logged in, redirect to home page
        return redirect("/");
    }
  const params = await searchParams;
  const role = params?.role || "customer"; // Default to "customer"
  return (
    <main className="flex items-center justify-center min-h-screen">
      <div className="w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6 text-center">
          {role === "barber" ? "Barber Login" : "Customer Login"}
        </h1>
        <Suspense fallback={<div className="text-center">Loading...</div>}>
          <LoginForm role={role} />
        </Suspense>
      </div>
    </main>
  );
}
