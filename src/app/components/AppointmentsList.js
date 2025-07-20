"use client";
import { useState } from "react";
import AppointmentCard from "./AppointmentCard";

export default function AppointmentsList({ appointments, barberDetails }) {
  const [searchTerm, setSearchTerm] = useState("");

  // Filter appointments based on search
  const filteredAppointments = appointments.filter(appointment => 
    appointment.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    appointment.customer_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    appointment.day.includes(searchTerm)
  );

  // Group appointments by date
  const appointmentsByDate = filteredAppointments.reduce((acc, appointment) => {
    const date = appointment.day;
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(appointment);
    return acc;
  }, {});

  // Sort dates
  const sortedDates = Object.keys(appointmentsByDate).sort();

  return (
    <div className="bg-gray-800 rounded-lg shadow-lg border border-gray-700">
      {/* Header with Search */}
      <div className="px-6 py-4 border-b border-gray-700">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <h2 className="text-xl font-semibold text-gray-200">Your Appointments</h2>
          
          {/* Search */}
          <div className="relative">
            <input
              type="text"
              placeholder="Search appointments..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full sm:w-64 px-3 py-2 pl-10 bg-gray-700 border border-gray-600 rounded-md text-gray-200 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <svg className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>
      </div>

      {/* Appointments Content */}
      <div className="p-6">
        {filteredAppointments.length === 0 ? (
          <div className="text-center py-12">
            <svg className="mx-auto h-12 w-12 text-gray-500 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <h3 className="text-lg font-medium text-gray-300 mb-1">No appointments found</h3>
            <p className="text-gray-500">
              {searchTerm ? "Try adjusting your search criteria." : "You don't have any upcoming appointments."}
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {sortedDates.map((date) => {
              const dayAppointments = appointmentsByDate[date];
              const formattedDate = new Date(date).toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              });

              return (
                <div key={date} className="space-y-4">
                  <div className="flex items-center">
                    <div className="flex-grow">
                      <h3 className="text-lg font-semibold text-gray-200">{formattedDate}</h3>
                      <div className="h-px bg-gray-700 mt-2"></div>
                    </div>
                    <span className="ml-4 px-3 py-1 bg-gray-700 text-gray-300 text-sm rounded-full">
                      {dayAppointments.length} appointment{dayAppointments.length > 1 ? 's' : ''}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {dayAppointments
                      .sort((a, b) => a.start_time.localeCompare(b.start_time))
                      .map((appointment) => (
                        <AppointmentCard
                          key={`${appointment.day}-${appointment.start_time}-${appointment.customer_id}`}
                          appointment={appointment}
                          barberDetails={barberDetails}
                        />
                      ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}