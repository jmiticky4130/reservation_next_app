import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { getBarberAppointments, getAllBarbers } from "@/app/lib/data";

export default async function AdminPage() {
  const session = await auth();

  if (!session?.user?.isAdmin) {
    redirect("/");
  }

  // Get all barbers and their appointments
  const barbers = await getAllBarbers();
  const today = new Date().toISOString().split('T')[0];
  
  // Get appointments for all barbers and filter for today
  let allTodaysAppointments = [];
  
  for (const barber of barbers) {
    try {
      const barberAppointments = await getBarberAppointments(barber.id);
      const todaysAppointments = barberAppointments.filter(appointment => 
        appointment.day === today
      );
      
      // Add barber info to each appointment
      todaysAppointments.forEach(appointment => {
        appointment.barber_name = barber.name;
        appointment.barber_id = barber.id;
      });
      
      allTodaysAppointments.push(...todaysAppointments);
    } catch (error) {
      console.error(`Error fetching appointments for barber ${barber.name}:`, error);
    }
  }

  // Sort appointments by barber name and then by start time
  allTodaysAppointments.sort((a, b) => {
    if (a.barber_name !== b.barber_name) {
      return a.barber_name.localeCompare(b.barber_name);
    }
    return a.start_time.localeCompare(b.start_time);
  });

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-200">Admin Dashboard</h1>
        <p className="text-gray-400 mt-2">
          Manage your application settings and user accounts
        </p>
      </div>

      <div className="bg-gray-800 rounded-lg shadow-lg border border-gray-700 mb-8">
        <div className="px-6 py-4 border-b border-gray-700">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-200">Today&apos;s Appointments</h2>
            <div className="text-sm text-gray-400">
              {new Date().toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </div>
          </div>
        </div>

        <div className="p-6">
          {allTodaysAppointments.length === 0 ? (
            <div className="text-center py-8">
              <svg className="mx-auto h-12 w-12 text-gray-500 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <h3 className="text-lg font-medium text-gray-300 mb-1">No appointments today</h3>
              <p className="text-gray-500">All barbers are free today.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Group appointments by barber */}
              {Object.entries(
                allTodaysAppointments.reduce((acc, appointment) => {
                  const barberName = appointment.barber_name;
                  if (!acc[barberName]) {
                    acc[barberName] = [];
                  }
                  acc[barberName].push(appointment);
                  return acc;
                }, {})
              ).map(([barberName, appointments]) => (
                <div key={barberName} className="bg-gray-700 rounded-lg p-4 border border-gray-600">
                  <div className="flex items-center mb-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mr-3">
                      <span className="text-white font-semibold text-sm">
                        {barberName.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-200">{barberName}</h3>
                    <span className="ml-auto text-sm text-gray-400">
                      {appointments.length} appointment{appointments.length > 1 ? 's' : ''}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {appointments
                      .sort((a, b) => a.start_time.localeCompare(b.start_time))
                      .map((appointment) => (
                        <div key={appointment.id} className="bg-gray-800 rounded-md p-4 border border-gray-600">
                          <div className="space-y-2">
                            {/* Time */}
                            <div className="flex items-center">
                              <svg className="w-4 h-4 text-blue-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              <span className="text-blue-400 font-medium text-sm">
                                {appointment.time_range}
                              </span>
                            </div>
                            
                            {/* Customer */}
                            <div className="flex items-center">
                              <svg className="w-4 h-4 text-gray-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                              </svg>
                              <span className="text-gray-200 font-medium text-sm">
                                {appointment.customer_name}
                              </span>
                            </div>
                            
                            {/* Service */}
                            <div className="flex items-center">
                              <svg className="w-4 h-4 text-green-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                              </svg>
                              <span className="text-green-400 font-medium text-sm">
                                {appointment.service_name}
                              </span>
                            </div>
                            
                            {/* Duration and Price */}
                            <div className="flex items-center justify-between text-xs text-gray-500">
                              <span>{appointment.service_duration} min</span>
                              <span className="text-yellow-400 font-medium">
                                {formatPrice(appointment.service_price)}
                              </span>
                            </div>
                            
                            {/* Email */}
                            <div className="flex items-center">
                              <svg className="w-4 h-4 text-gray-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                              <span className="text-gray-400 text-xs truncate">
                                {appointment.customer_email}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-700">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-green-900 rounded-md flex items-center justify-center">
                <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-400 truncate">Today&apos;s Appointments</dt>
                <dd className="text-lg font-medium text-gray-200">{allTodaysAppointments.length}</dd>
              </dl>
            </div>
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-700">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-blue-900 rounded-md flex items-center justify-center">
                <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-400 truncate">Active Barbers</dt>
                <dd className="text-lg font-medium text-gray-200">
                  {new Set(allTodaysAppointments.map(app => app.barber_name)).size}
                </dd>
              </dl>
            </div>
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-700">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-purple-900 rounded-md flex items-center justify-center">
                <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              </div>
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-400 truncate">Today&apos;s Revenue</dt>
                <dd className="text-lg font-medium text-gray-200">
                  {formatPrice(
                    allTodaysAppointments.reduce((sum, app) => sum + parseFloat(app.service_price), 0)
                  )}
                </dd>
              </dl>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}