import { getBarbersServices } from "@/app/lib/data";
import ServiceSelector from "@/app/components/serviceSelector";
import { Suspense } from "react";
import { fetchAppointmentSlots } from "@/app/lib/data";
import { auth, signOut } from "@/auth";
import Link from "next/link";

export default async function HomePage() {
  const session = await auth();
  const barberServicesPromise = getBarbersServices();
  const slots = fetchAppointmentSlots(0, new Date());

  return (
    <main className="min-h-screen bg-gray-900 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-center text-white">Book Your Appointment</h1>
        
        {session?.user.role ? (
          <div className="mb-6 text-center">
            <div className="flex justify-between items-center mb-4">
              <div></div> {/* Empty div for spacing */}
              <form
                action={async () => {
                  "use server";
                  await signOut();
                    
                }}
              >
                <button
                  type="submit"
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors text-sm"
                >
                  Logout
                  
                </button>
              </form>
            </div>
            <p className="text-lg text-white">Welcome, Logged In as: {session.user.name}!</p>
            <p className="text-gray-400">Select a service and book your appointment.</p>
          </div>
        ) : (
          <div className="mb-6 text-center">
            <div className="flex justify-between items-center mb-4">
              <div></div> {/* Empty div for spacing */}
              <Link 
                href="/login"
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm"
              >
                Login
              </Link>
            </div>
            <p className="text-gray-400">Login to book an appointment or browse our services.</p>
          </div>
        )}

        <div className="bg-gray-300 rounded-lg shadow-lg p-6 border border-gray-700">
          <Suspense fallback={
            <div className="text-center text-gray-400">Loading...</div>
          }>
            <ServiceSelector 
              barberServicesPromise={barberServicesPromise}
              slotsPromise={slots}
              session={session}
            />
          </Suspense>
        </div>
      </div>
    </main>
  );
}