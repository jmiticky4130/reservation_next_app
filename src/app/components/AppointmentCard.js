"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { cancelBarberAppointment } from "@/app/lib/actions";

// Modal component for displaying cancellation results
function CancelResultModal({ isOpen, onClose, isSuccess, message }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4 border border-gray-600">
        <div className="flex items-center mb-4">
          {isSuccess ? (
            <svg className="w-8 h-8 text-green-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          ) : (
            <svg className="w-8 h-8 text-red-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          )}
          <h3 className={`text-lg font-semibold ${isSuccess ? 'text-green-400' : 'text-red-400'}`}>
            {isSuccess ? 'Success' : 'Error'}
          </h3>
        </div>
        <p className="text-gray-300 mb-6">{message}</p>
        <button
          onClick={onClose}
          className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          Close
        </button>
      </div>
    </div>
  );
}

export default function AppointmentCard({ appointment, barberDetails }) {
  const router = useRouter();
  const [modalState, setModalState] = useState({
    isOpen: false,
    isSuccess: false,
    message: ''
  });
  const [isCanceling, setIsCanceling] = useState(false);

  const handleCancel = async () => {
    const confirmMessage = `Are you sure you want to cancel the appointment with ${appointment.customer_name} on ${new Date(appointment.day).toLocaleDateString()} at ${appointment.start_time}?\n\nThe customer will be notified via email.`;
    
    if (!confirm(confirmMessage)) {
      return;
    }

    setIsCanceling(true);
    
    try {
      const result = await cancelBarberAppointment({
        barberId: barberDetails.id,
        customerId: appointment.customer_id,
        date: appointment.day,
        startTime: appointment.start_time
      });
      
      if (result && result.error) {
        setModalState({
          isOpen: true,
          isSuccess: false,
          message: result.error || 'Failed to cancel appointment. Please try again.'
        });
      } else {
        setModalState({
          isOpen: true,
          isSuccess: true,
          message: `Appointment with ${appointment.customer_name} has been successfully cancelled. The customer has been notified via email.`
        });
      }
    } catch (error) {
      setModalState({
        isOpen: true,
        isSuccess: false,
        message: 'An unexpected error occurred. Please try again.'
      });
    } finally {
      setIsCanceling(false);
    }
  };

  const closeModal = () => {
    setModalState({
      isOpen: false,
      isSuccess: false,
      message: ''
    });
    
    // If cancellation was successful, refresh the page when modal closes
    if (modalState.isSuccess) {
      router.refresh();
    }
  };

  // Check if appointment is today or in the past
  const appointmentDate = new Date(appointment.day);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const isToday = appointmentDate.getTime() === today.getTime();
  const isPast = appointmentDate < today;

  return (
    <>
      <div className={`bg-gray-700 rounded-lg border p-4 hover:border-gray-500 transition-colors ${
        isToday ? 'border-blue-500 bg-blue-900/20' : 
        isPast ? 'border-gray-600 opacity-75' : 'border-gray-600'
      }`}>
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center mr-3 ${
              isToday ? 'bg-blue-600' : isPast ? 'bg-gray-600' : 'bg-gradient-to-br from-green-500 to-blue-600'
            }`}>
              <span className="text-white font-semibold text-sm">
                {appointment.customer_name.charAt(0).toUpperCase()}
              </span>
            </div>
            <div>
              <h3 className="text-base font-semibold text-gray-200">{appointment.customer_name}</h3>
              <p className="text-sm text-gray-400">{appointment.customer_email}</p>
            </div>
          </div>
          {isToday && (
            <span className="px-2 py-1 bg-blue-600 text-white text-xs rounded-full">
              Today
            </span>
          )}
          {isPast && (
            <span className="px-2 py-1 bg-gray-600 text-white text-xs rounded-full">
              Past
            </span>
          )}
        </div>

        <div className="space-y-2 mb-4">
          <div className="flex items-center text-sm text-gray-400">
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {appointment.start_time}
          </div>
        </div>

        {!isPast && (
          <div className="flex justify-end">
            <button 
              className={`px-4 py-2 text-sm font-medium rounded-md transition-colors flex items-center ${
                isCanceling 
                  ? 'bg-gray-600 text-gray-400 cursor-not-allowed' 
                  : 'bg-red-600 text-white hover:bg-red-700'
              }`}
              onClick={handleCancel}
              disabled={isCanceling}
            >
              {isCanceling ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Canceling...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  Cancel
                </>
              )}
            </button>
          </div>
        )}
      </div>

      <CancelResultModal
        isOpen={modalState.isOpen}
        onClose={closeModal}
        isSuccess={modalState.isSuccess}
        message={modalState.message}
      />
    </>
  );
}