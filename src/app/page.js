import { getBarbersServices } from "@/app/lib/data";
import ServiceSelector from "@/app/components/serviceSelector";
import Navigation from "@/app/components/navBar";
import { Suspense } from "react";
import { fetchAppointmentSlots } from "@/app/lib/data";
import { auth } from "@/auth";

export default async function HomePage() {
  const session = await auth();
  const barberServicesPromise = getBarbersServices();
  const slots = fetchAppointmentSlots(0, new Date());

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Navigation Bar */}
      <Navigation session={session} />
      
      {/* Main Content */}
      <main className="py-12 px-4">
        <div className="max-w-4xl mx-auto">
          {!session && (<h1 className="text-3xl font-bold mb-8 text-center text-gray-200">
            Welcome! Book your appointment as an user.
          </h1>)}
          
          {session?.user ? (
            <div className="mb-6 text-center">
              <h1 className="text-2xl text-gray-300 font-bold mb-4">
                Select a service and book your appointment!
              </h1>
            </div>
          ) : (
            <div className="mb-6 text-center">
              <p className="text-gray-400">
                Login to book an appointment or browse our services.
              </p>
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
    </div>
  );
}