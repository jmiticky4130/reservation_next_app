"use client";

import { formatTimeDisplay } from "@/app/util/formatFunctions";

export default function SuccessDisplay({ appointmentDetails }) {
    
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric'
    });
  };

  const formatTime = (timeString) => {
    if (!timeString) return 'N/A';
    return formatTimeDisplay(timeString);
  };

  return (
    <div className="bg-gray-800 rounded-lg shadow-lg p-8 border border-gray-700">
      {/* Success Icon */}
      <div className="text-center mb-6">
        <div className="mx-auto w-16 h-16 bg-green-900 rounded-full flex items-center justify-center mb-4">
          <svg 
            className="w-8 h-8 text-green-400" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M5 13l4 4L19 7" 
            />
          </svg>
        </div>
        
        <h1 className="text-2xl font-bold text-white mb-2">
          Appointment Confirmed!
        </h1>
        
        <p className="text-gray-300">
          An email has been sent to the customer.
        </p>
      </div>

      {/* Appointment Details */}
      <div className="space-y-4 mb-6">
        <div className="bg-gray-700 rounded-lg p-4 border border-gray-600">
          <h2 className="text-lg font-semibold text-white mb-3">
            Appointment Details
          </h2>
          
          <div className="space-y-2 text-sm">
            {appointmentDetails.customerName && (
              <div className="flex justify-between">
                <span className="text-gray-400">Customer:</span>
                <span className="font-medium text-gray-100">
                  {appointmentDetails.customerName}
                </span>
              </div>
            )}
            
            <div className="flex justify-between">
              <span className="text-gray-400">Date:</span>
              <span className="font-medium text-gray-100">
                {formatDate(appointmentDetails.date)}
              </span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-gray-400">Time:</span>
              <span className="font-medium text-gray-100">
                {formatTime(appointmentDetails.time)}
              </span>
            </div>
            
            {appointmentDetails.barberName && (
              <div className="flex justify-between">
                <span className="text-gray-400">Barber:</span>
                <span className="font-medium text-gray-100">
                  {appointmentDetails.barberName}
                </span>
              </div>
            )}
            
            {appointmentDetails.serviceName && (
              <div className="flex justify-between">
                <span className="text-gray-400">Service:</span>
                <span className="font-medium text-gray-100">
                  {appointmentDetails.serviceName}
                </span>
              </div>
            )}
            
            {appointmentDetails.duration && (
              <div className="flex justify-between">
                <span className="text-gray-400">Duration:</span>
                <span className="font-medium text-gray-100">
                  {appointmentDetails.duration} minutes
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}