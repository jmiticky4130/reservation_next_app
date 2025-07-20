// src/app/components/CancelAppointmentForm.js
"use client";

import { useState } from "react";
import { cancelAppointmentWithToken } from "@/app/lib/actions";
import Button from "./buttonfm";
import Link from "next/link";

export default function CancelAppointmentForm({ token }) {
  const [status, setStatus] = useState('idle'); // idle, loading, success, error
  const [message, setMessage] = useState('');
  const [appointmentDetails, setAppointmentDetails] = useState(null);

  const handleCancel = async () => {
    setStatus('loading');
    
    try {
      const result = await cancelAppointmentWithToken(token);
      
      if (result.success) {
        setStatus('success');
        setMessage('Your appointment has been successfully cancelled.');
        setAppointmentDetails(result.appointmentDetails);
      } else {
        setStatus('error');
        setMessage(result.error || 'Failed to cancel appointment.');
      }
    } catch (error) {
      setStatus('error');
      setMessage('An unexpected error occurred.');
    }
  };

  if (status === 'success') {
    return (
      <div className="bg-gray-800 p-8 rounded-lg border border-gray-700 max-w-md w-full">
        <div className="text-center">
          <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-green-400 mb-4">Cancelled Successfully</h1>
          <p className="text-gray-300 mb-6">{message}</p>
          
          {appointmentDetails && (
            <div className="bg-gray-700 p-4 rounded-lg mb-6 text-left">
              <h3 className="font-semibold text-white mb-2">Cancelled Appointment:</h3>
              <p className="text-gray-300 text-sm">Date: {appointmentDetails.date}</p>
              <p className="text-gray-300 text-sm">Time: {appointmentDetails.timeRange}</p>
              <p className="text-gray-300 text-sm">Barber: {appointmentDetails.barberName}</p>
            </div>
          )}
          
          <Link
            href="/"
            className="inline-block bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors"
          >
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="bg-gray-800 p-8 rounded-lg border border-gray-700 max-w-md w-full">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-red-400 mb-4">Cancellation Failed</h1>
          <p className="text-gray-300 mb-6">{message}</p>
          <Link
            href="/"
            className="inline-block bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors"
          >
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-800 p-8 rounded-lg border border-gray-700 max-w-md w-full">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-white mb-4">Cancel Appointment</h1>
        <p className="text-gray-300 mb-6">
          Are you sure you want to cancel your appointment? This action cannot be undone.
        </p>
        
        <div className="space-y-4">
          <Button
            onClick={handleCancel}
            color="danger"
            size="large"
            isLoading={status === 'loading'}
            disabled={status === 'loading'}
            className="w-full"
          >
            {status === 'loading' ? 'Cancelling...' : 'Yes, Cancel Appointment'}
          </Button>
          
          <Link
            href="/"
            className="block w-full py-2.5 px-4 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors text-center"
          >
            Keep Appointment
          </Link>
        </div>
      </div>
    </div>
  );
}