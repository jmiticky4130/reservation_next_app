import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { getBarberAppointments, getBarberDetails } from "@/app/lib/data";
import AppointmentsList from "@/app/components/AppointmentsList";


export default async function ManageAppointmentsPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  // Get barber details and appointments
  const barberDetails = await getBarberDetails(session.user.id);
  const appointments = await getBarberAppointments(session.user.id);

  if (!barberDetails) {
    redirect("/login");
  }

  const today = new Date().toISOString().split('T')[0];
  const todaysAppointments = appointments.filter(app => app.day === today);
  
  const thisWeekStart = new Date();
  const thisWeekEnd = new Date();
  thisWeekEnd.setDate(thisWeekStart.getDate() + 7);
  
  const thisWeekAppointments = appointments.filter(app => {
    const appDate = new Date(app.day);
    return appDate >= thisWeekStart && appDate <= thisWeekEnd;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Page Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-200">Manage Appointments</h1>
            <p className="text-gray-400 mt-2">
              View and manage your upcoming appointments
            </p>
          </div>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-700">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-blue-900 rounded-md flex items-center justify-center">
                <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 002 2z" />
                </svg>
              </div>
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-400 truncate">Total Appointments</dt>
                <dd className="text-lg font-medium text-gray-200">{appointments.length}</dd>
              </dl>
            </div>
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-700">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-green-900 rounded-md flex items-center justify-center">
                <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-400 truncate">Today's Appointments</dt>
                <dd className="text-lg font-medium text-gray-200">
                  {todaysAppointments.length}
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
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-400 truncate">This Week</dt>
                <dd className="text-lg font-medium text-gray-200">
                  {thisWeekAppointments.length}
                </dd>
              </dl>
            </div>
          </div>
        </div>
      </div>

      <AppointmentsList 
        appointments={appointments}
        barberDetails={barberDetails}
      />
    </div>
  );
}