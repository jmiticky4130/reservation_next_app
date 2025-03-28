import { fetchReservations } from '../lib/data';
import Link from 'next/link';

// Reservation Card Component
function ReservationCard({ reservation }) {
  return (
    <div className="border rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start">
        <h2 className="text-lg font-semibold">Reservation #{reservation.id}</h2>
      </div>
      
      <div className="mt-3 space-y-2 text-sm text-gray-600">
        <p><span className="font-medium">Customer ID:</span> {reservation.customer_id}</p>
        <p><span className="font-medium">Appointment Slot:</span> {reservation.appointment_slot_id}</p>
        <p><span className="font-medium">Created:</span> {
          new Date(reservation.created_at).toLocaleString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          })
        }</p>
      </div>
      
      <div className="mt-4 flex justify-end space-x-2">
        <Link 
          href={`/reservations/${reservation.id}`}
          className="text-sm text-blue-500 hover:underline"
        >
          View Details
        </Link>
      </div>
    </div>
  );
}

export default async function ReservationsPage() {
  const reservations = await fetchReservations();

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Reservations</h1>
        <Link 
          href="/reservations/create" 
          className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
        >
          Book New Appointment
        </Link>
      </div>

      {reservations.length === 0 ? (
        <div className="text-center py-10 bg-gray-50 rounded-lg">
          <p className="text-gray-500">No reservations found</p>
          <Link href="/reservations/create"  className="text-blue-500 hover:underline mt-2 inline-block">
            Book your first appointment
          </Link>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {reservations.map((reservation) => (
            <ReservationCard key={reservation.id} reservation={reservation} />
          ))}
        </div>
      )}
    </div>
  );
}