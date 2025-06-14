import { Suspense } from "react";
import SuccessDisplay from "@/app/components/SuccessDisplay";

export default async function SuccessPage({ searchParams }) {
  const params = await searchParams;
  
  // Extract appointment details from search parameters
  const appointmentDetails = {
    date: params?.date,
    time: params?.time,
    barberId: params?.barberId,
    barberName: params?.barberName,
    serviceName: params?.serviceName,
    duration: params?.duration,
    customerName: params?.customerName,
  };

  return (
    <main className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Suspense fallback={
          <div className="bg-gray-800 rounded-lg shadow-lg p-8 text-center border border-gray-700">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-700 rounded mb-4"></div>
              <div className="h-4 bg-gray-700 rounded mb-2"></div>
              <div className="h-4 bg-gray-700 rounded mb-2"></div>
            </div>
          </div>
        }>
          <SuccessDisplay appointmentDetails={appointmentDetails} />
        </Suspense>
      </div>
    </main>
  );
}