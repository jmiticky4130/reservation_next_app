import CancelAppointmentForm from "@/app/components/CancelAppointmentForm";

export default async function CancelAppointmentPage({ searchParams }) {
  const params = await searchParams;
  const token = params.token;
  
  if (!token) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="bg-gray-800 p-8 rounded-lg border border-gray-700 max-w-md w-full">
          <h1 className="text-2xl font-bold text-red-400 mb-4">Invalid Link</h1>
          <p className="text-gray-300">
            This cancellation link is invalid or has expired.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <CancelAppointmentForm token={token} />
    </div>
  );
}