import { auth } from "@/auth";
import Link from "next/link";

export default async function HomePage() {
  const session = await auth();

  return (
    <main className="flex items-center justify-center min-h-screen">
      <div className="w-full max-w-md flex flex-col items-center">
        <h1 className="text-2xl font-bold mb-6 text-center">Reservation App</h1>
        {!session?.user ? (
          <div className="flex flex-col w-full gap-4">
            <Link
              href="/login"
              className="py-3 px-6 rounded-lg bg-white text-blue-600 font-medium hover:bg-opacity-90 transition w-full text-center text-lg"
            >
              Log in
            </Link>
            <Link
              href="/register"
              className="py-3 px-6 rounded-lg bg-transparent border border-white text-white font-medium hover:bg-white hover:bg-opacity-10 transition w-full text-center text-lg"
            >
              Sign up
            </Link>
          </div>
        ) : (
          <Link
            href="/reservations"
            className="py-3 px-6 rounded-lg bg-white text-blue-600 font-medium hover:bg-opacity-90 transition w-full text-center text-lg"
          >
            My Reservations
          </Link>
        )}
      </div>
    </main>
  );
}