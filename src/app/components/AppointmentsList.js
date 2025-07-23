"use client";
import { useState } from "react";
import { cancelBarberAppointment } from "@/app/lib/actions";

export default function AppointmentsList({ appointments, barberDetails }) {
  const [isLoading, setIsLoading] = useState(false);
  const [cancellingId, setCancellingId] = useState(null);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  };

  const handleCancelAppointment = async (appointment) => {
    if (!confirm(`Are you sure you want to cancel the appointment with ${appointment.customer_name}?`)) {
      return;
    }

    setCancellingId(appointment.id);
    setIsLoading(true);

    try {
      const result = await cancelBarberAppointment({
        customerId: appointment.customer_id,
        barberId: barberDetails.id,
        date: appointment.day,
        start_time: appointment.start_time,
        service_duration: appointment.service_duration,
        slotsCount: appointment.slots_count,
        serviceId: appointment.service_id,
      });

      if (result.success) {
        window.location.reload();
      } else {
        alert(result.error || "Failed to cancel appointment");
      }
    } catch (error) {
      console.error("Error cancelling appointment:", error);
      alert("Failed to cancel appointment");
    } finally {
      setIsLoading(false);
      setCancellingId(null);
    }
  };

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

  if (appointments.length === 0) {
    return (
      <div className="bg-gray-800 rounded-lg shadow-lg border border-gray-700 p-4 sm:p-8 text-center">
        <svg className="w-12 h-12 text-gray-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 002 2z" />
        </svg>
        <h3 className="text-lg font-medium text-gray-400 mb-2">No appointments found</h3>
        <p className="text-gray-500">You don&apos;t have any upcoming appointments.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-8">
      {sortedDates.map((date) => (
        <div key={date} className="bg-gray-800 rounded-lg shadow-lg border border-gray-700">
          <div className="px-4 sm:px-6 py-4 border-b border-gray-700">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-200">
              {formatDate(date)}
            </h2>
            <p className="text-sm text-gray-400">
              {groupedAppointments[date].length} appointment{groupedAppointments[date].length !== 1 ? 's' : ''}
            </p>
          </div>

          <div className="divide-y divide-gray-700">
            {groupedAppointments[date].map((appointment) => (
              <div key={appointment.id} className="p-4 sm:p-6">
                {/* Mobile Layout */}
                <div className="block sm:hidden">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-3 flex-1 min-w-0">
                      <div className="flex-shrink-0">
                        <div className="w-10 h-10 bg-blue-900 rounded-full flex items-center justify-center">
                          <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-base font-medium text-gray-200 truncate">
                          {appointment.customer_name}
                        </p>
                        <p className="text-sm text-gray-500 truncate">
                          {appointment.customer_email}
                        </p>
                      </div>
                    </div>
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-900 text-green-200 ml-2">
                      Confirmed
                    </span>
                  </div>

                  {/* Mobile Info Grid */}
                  <div className="grid grid-cols-2 gap-2 text-sm text-gray-400 mb-4">
                    <div className="flex items-center space-x-1">
                      <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="truncate">{appointment.time_range}</span>
                    </div>
                    
                    <div className="flex items-center space-x-1">
                      <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                      </svg>
                      <span className="truncate">{formatPrice(appointment.service_price)}</span>
                    </div>
                    
                    <div className="flex items-center space-x-1 col-span-2">
                      <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <span className="truncate">{appointment.service_name} ({appointment.service_duration} min)</span>
                    </div>
                  </div>

                  {/* Mobile Cancel Button */}
                  <button
                    onClick={() => handleCancelAppointment(appointment)}
                    disabled={isLoading}
                    className={`w-full px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                      cancellingId === appointment.id
                        ? "bg-red-700 text-red-200 cursor-not-allowed"
                        : "bg-red-600 text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                    } focus:ring-offset-gray-800`}
                  >
                    {cancellingId === appointment.id ? (
                      <div className="flex items-center justify-center space-x-2">
                        <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <span>Cancelling...</span>
                      </div>
                    ) : (
                      "Cancel Appointment"
                    )}
                  </button>
                </div>

                {/* Desktop Layout */}
                <div className="hidden sm:block">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-4">
                        <div className="flex-shrink-0">
                          <div className="w-10 h-10 bg-blue-900 rounded-full flex items-center justify-center">
                            <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                          </div>
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-3">
                            <p className="text-lg font-medium text-gray-200 truncate">
                              {appointment.customer_name}
                            </p>
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-900 text-green-200">
                              Confirmed
                            </span>
                          </div>
                          
                          <div className="mt-1 flex items-center space-x-6 text-sm text-gray-400">
                            <div className="flex items-center space-x-1">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              <span>{appointment.time_range}</span>
                            </div>
                            
                            <div className="flex items-center space-x-1">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                              </svg>
                              <span>{appointment.service_name}</span>
                            </div>
                            
                            <div className="flex items-center space-x-1">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              <span>{appointment.service_duration} min</span>
                            </div>
                            
                            <div className="flex items-center space-x-1">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                              </svg>
                              <span>{formatPrice(appointment.service_price)}</span>
                            </div>
                          </div>
                          
                          <div className="mt-2 text-sm text-gray-500">
                            <span>{appointment.customer_email}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      <button
                        onClick={() => handleCancelAppointment(appointment)}
                        disabled={isLoading}
                        className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                          cancellingId === appointment.id
                            ? "bg-red-700 text-red-200 cursor-not-allowed"
                            : "bg-red-600 text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                        } focus:ring-offset-gray-800`}
                      >
                        {cancellingId === appointment.id ? (
                          <div className="flex items-center space-x-2">
                            <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            <span>Cancelling...</span>
                          </div>
                        ) : (
                          "Cancel"
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}