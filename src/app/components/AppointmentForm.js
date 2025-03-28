import Link from "next/link";
import { createReservation } from "../lib/actions";

export default function AppointmentForm({ appointmentSlots }) {
  return (
    <form action={createReservation}> 
      <div className="rounded-md bg-gray-300 p-4 md:p-6">
        

        {/* Appointment Selection - REQUIRED */}
        <div className="mb-4">
          <label
            htmlFor="appointment"
            className="mb-2 block text-black font-medium"
          >
            Choose an appointment date and barber *
          </label>
          <div className="relative">
            <select
              id="appointment"
              name="appointmentId"
              className="peer block w-full cursor-pointer rounded-md border border-gray-900 py-2 pl-10 text-black outline-2 placeholder:text-gray-500"
              defaultValue=""
              required
            >
              <option value="" disabled>
                Options
              </option>
              {appointmentSlots.map((appointment) => (
                <option key={appointment.id} value={appointment.id}>
                  {/* Format date if available */}
                  {appointment.date
                    ? new Date(appointment.date).toLocaleDateString()
                    : ""}

                  {/* Show time if available */}
                  {appointment.start_time
                    ? ` at ${appointment.start_time}`
                    : ""}
                  {appointment.end_time ? ` at ${appointment.end_time}` : ""}

                  {/* Show type if available */}
                  {appointment.user_name ? ` - ${appointment.user_name}` : ""}

                  {/* Show status if available */}
                  {appointment.is_available !== undefined
                    ? appointment.is_available
                      ? " (Available)"
                      : " (Booked)"
                    : ""}

                  {/* Fallback to ID if no other information */}
                  {!appointment.date && !appointment.time && !appointment.type
                    ? `Appointment #${appointment.id}`
                    : ""}
                </option>
              ))}
            </select>
          </div>
        </div>

      
        
        <p className="text-sm text-gray-600 mt-3">* Required fields</p>
      </div>
      <div className="mt-6 flex justify-end gap-4">
        <Link
          href="/reservations"
          className="flex h-10 items-center rounded-lg bg-gray-100 px-4 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-200"
        >
          Cancel
        </Link>
        <button 
          type="submit"
          className="flex h-10 items-center rounded-lg bg-blue-500 px-4 text-sm font-medium text-white transition-colors hover:bg-blue-600"
        >
          Book Appointment
        </button>
      </div>
    </form>
  );
}