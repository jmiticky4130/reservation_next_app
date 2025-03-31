import { fetchReservations } from '../lib/data';
import Link from 'next/link';
import { signOut } from '@/auth';

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
      <form
          action={async () => {
            'use server';
            await signOut({ redirectTo: '/' });
          }}
        >
          <button className="flex h-[48px] grow items-center justify-center gap-2 rounded-md bg-gray-50 p-3 text-sm font-medium hover:bg-sky-100 hover:text-blue-600 md:flex-none md:justify-start md:p-2 md:px-3">
            <div className="hidden md:block">Sign Out</div>
          </button>
        </form>
      {reservations.length !== 0 &&
       ( <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {reservations.map((reservation) => (
            <ReservationCard key={reservation.id} reservation={reservation} />
          ))}
        </div>)
      }
    </div>
  );
}