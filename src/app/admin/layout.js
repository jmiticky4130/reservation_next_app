import { auth } from "@/auth";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function AdminLayout({ children }) {
  const session = await auth();

  if (!session?.user?.isAdmin) {
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
                  Admin Dashboard
                </h1>
                <p className="text-sm text-gray-400">
                  Welcome back, {session?.user?.name}
                </p>
              </div>

              <div className="hidden md:flex space-x-5">
                <Link
                  href="/admin"
                  className="px-3 py-2 text-sm font-medium text-gray-300 hover:text-white hover:bg-gray-700 rounded-md transition-colors"
                >
                  Dashboard
                </Link>
                <Link
                  href="/admin/createBarber"
                  className="px-3 py-2 text-sm font-medium text-gray-300 hover:text-white hover:bg-gray-700 rounded-md transition-colors"
                >
                  Create Barber
                </Link>
                <Link
                  href="/admin/manage-barbers"
                  className="px-3 py-2 text-sm font-medium text-gray-300 hover:text-white hover:bg-gray-700 rounded-md transition-colors"
                >
                  Manage Barbers
                </Link>
                <Link
                  href="/admin/customers"
                  className="px-3 py-2 text-sm font-medium text-gray-300 hover:text-white hover:bg-gray-700 rounded-md transition-colors"
                >
                  Customers
                </Link>
                <Link
                  href="/barber"
                  className="px-3 py-2 text-sm font-medium text-gray-300 hover:text-white hover:bg-gray-700 rounded-md transition-colors"
                >
                  My Appointments
                </Link>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <Link
                href="/"
                className="px-4 py-2 text-sm font-medium text-gray-300 bg-gray-700 hover:bg-gray-600 rounded-md transition-colors border border-gray-600"
              >
                Back to Site
              </Link>

              <div className="md:hidden">
                <button className="text-gray-300 hover:text-white p-2">
                  <svg
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 6h16M4 12h16M4 18h16"
                    />
                  </svg>
                </button>
              </div>
            </div>
          </div>

          <div className="md:hidden pb-4">
            <div className="flex flex-col space-y-2">
              <Link
                href="/admin"
                className="px-3 py-2 text-sm font-medium text-gray-300 hover:text-white hover:bg-gray-700 rounded-md transition-colors"
              >
                Dashboard
              </Link>
              <Link
                href="/admin/createBarber"
                className="px-3 py-2 text-sm font-medium text-gray-300 hover:text-white hover:bg-gray-700 rounded-md transition-colors"
              >
                Create Barber
              </Link>
              <Link
                href="/admin/manage-barbers"
                className="px-3 py-2 text-sm font-medium text-gray-300 hover:text-white hover:bg-gray-700 rounded-md transition-colors"
              >
                Manage Barbers
              </Link>
              <Link
                href="/admin/customers"
                className="px-3 py-2 text-sm font-medium text-gray-300 hover:text-white hover:bg-gray-700 rounded-md transition-colors"
              >
                Customers
              </Link>
              <Link
                href="/barber"
                className="px-3 py-2 text-sm font-medium text-gray-300 hover:text-white hover:bg-gray-700 rounded-md transition-colors"
              >
                My Appointments
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <main>{children}</main>
    </div>
  );
}
