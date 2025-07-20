"use client";
import { formatTimeDisplay } from "@/app/util/formatFunctions";

export default function BarberAppointments({ barber, appointments, loading, onRefresh }) {
  // Group appointments by date
  const groupedAppointments = appointments.reduce((groups, appointment) => {
    const date = appointment.day;
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(appointment);
    return groups;
  }, {});

  const sortedDates = Object.keys(groupedAppointments).sort();

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <svg className="animate-spin h-8 w-8 text-blue-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <span className="ml-2 text-gray-400">Loading appointments...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-200">
          Upcoming Appointments ({appointments.length})
        </h3>
        <button
          onClick={onRefresh}
          className="px-3 py-1 bg-gray-600 text-gray-200 text-sm rounded-md hover:bg-gray-500 transition-colors flex items-center"
        >
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Refresh
        </button>
      </div>

      {appointments.length === 0 ? (
        <div className="text-center py-12 bg-gray-700 rounded-lg border border-gray-600">
          <svg className="mx-auto h-12 w-12 text-gray-500 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <h3 className="text-lg font-medium text-gray-300 mb-1">No upcoming appointments</h3>
          <p className="text-gray-500">{barber.name} has no scheduled appointments in the next 30 days.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {sortedDates.map((date) => {
            const dateObj = new Date(date + 'T00:00:00');
            const formattedDate = dateObj.toLocaleDateString('en-US', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            });

            const dayAppointments = groupedAppointments[date].sort((a, b) => 
              a.start_time.localeCompare(b.start_time)
            );

            return (
              <div key={date} className="bg-gray-700 rounded-lg border border-gray-600 p-4">
                <h4 className="text-md font-semibold text-gray-200 mb-3 flex items-center">
                  <svg className="w-4 h-4 mr-2 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  {formattedDate}
                  <span className="ml-2 text-xs bg-blue-900 text-blue-300 px-2 py-1 rounded-full">
                    {dayAppointments.length} appointment{dayAppointments.length !== 1 ? 's' : ''}
                  </span>
                </h4>
                
                <div className="space-y-2">
                  {dayAppointments.map((appointment, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-gray-600 rounded-md border border-gray-500"
                    >
                      <div className="flex items-center">
                        <div className="w-2 h-2 bg-green-400 rounded-full mr-3"></div>
                        <div>
                          <p className="text-gray-200 font-medium">{appointment.customer_name}</p>
                          <p className="text-sm text-gray-400">{appointment.customer_email}</p>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <p className="text-gray-200 font-medium">
                          {formatTimeDisplay(appointment.start_time)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}