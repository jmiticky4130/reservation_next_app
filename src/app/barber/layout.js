import { auth } from "@/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import LogoutButton from "@/app/components/LogoutButton";

export default async function BarberLayout({ children }) {
  const session = await auth();

  if (session?.user?.role !== "barber") {
    redirect("/");
  }

  return (
    <div className="min-h-screen bg-gray-900">
      <nav className="bg-gray-800 shadow-sm border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-8">
              <div>
                <h1 className="text-2xl font-bold text-gray-200">
                  Barber Dashboard
                </h1>
                <p className="text-sm text-gray-400">
                  Welcome back, {session?.user?.name}
                </p>
              </div>

              <div className="hidden md:flex space-x-5">
                <Link
                  href="/barber"
                  className="px-3 py-2 text-sm font-medium text-gray-300 hover:text-white hover:bg-gray-700 rounded-md transition-colors"
                >
                  Calendar
                </Link>
                <Link
                  href="/barber/manage-appointments"
                  className="px-3 py-2 text-sm font-medium text-gray-300 hover:text-white hover:bg-gray-700 rounded-md transition-colors"
                >
                  Manage Appointments
                </Link>
                {session?.user?.isAdmin && (
                  <Link
                    href="/admin"
                    className="px-3 py-2 text-sm font-medium text-gray-300 hover:text-white hover:bg-gray-700 rounded-md transition-colors"
                  >
                    Admin Dashboard
                </Link>)}
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <Link
                href="/"
                className="hidden md:block px-4 py-2 text-sm font-medium text-gray-300 bg-gray-700 hover:bg-gray-600 rounded-md transition-colors border border-gray-600"
              >
                Back to Site
              </Link>
              <LogoutButton />

              
            </div>
          </div>

          <div className="md:hidden pb-4">
            <div className="flex flex-col space-y-2">
              <Link
                  href="/barber"
                  className="px-3 py-2 text-sm font-medium text-gray-300 hover:text-white hover:bg-gray-700 rounded-md transition-colors"
                >
                  Calendar
                </Link>
                <Link
                  href="/barber/manage-appointments"
                  className="px-3 py-2 text-sm font-medium text-gray-300 hover:text-white hover:bg-gray-700 rounded-md transition-colors"
                >
                  Manage Appointments
                </Link>
                {session?.user?.isAdmin && (
                  <Link
                    href="/admin"
                    className="px-3 py-2 text-sm font-medium text-gray-300 hover:text-white hover:bg-gray-700 rounded-md transition-colors"
                  >
                    Admin Dashboard
                </Link>)}
            </div>
          </div>
        </div>
      </nav>

      <main>{children}</main>
    </div>
  );
}
