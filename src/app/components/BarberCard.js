"use client";

import { useState } from "react";
import { deleteBarber } from "../lib/actions";
import { useRouter } from "next/navigation";

// Modal component for displaying deletion results
function DeleteResultModal({ isOpen, onClose, isSuccess, message }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50  flex items-center justify-center z-50">
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

export default function BarberCard({ barber, onViewDetails }) {

  const router = useRouter();
  const [modalState, setModalState] = useState({
    isOpen: false,
    isSuccess: false,
    message: ''
  });
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    
    try {
      const result = await deleteBarber(barber.id);
      
      if (result && result.error) {
        setModalState({
          isOpen: true,
          isSuccess: false,
          message: result.error || 'Failed to delete barber. Please try again.'
        });
      } else {
        setModalState({
          isOpen: true,
          isSuccess: true,
          message: `Barber ${barber.name} has been successfully deleted.`
        });
      }
    } catch (error) {
      setModalState({
        isOpen: true,
        isSuccess: false,
        message: 'An unexpected error occurred. Please try again.'
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const closeModal = () => {
    setModalState({
      isOpen: false,
      isSuccess: false,
      message: ''
    });

    router.refresh();

  };

  return (
    <>
      <div className="bg-gray-700 rounded-lg border border-gray-600 p-6 hover:border-gray-500 transition-colors">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
              <span className="text-white font-semibold text-lg">
                {barber.name.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="ml-3">
              <h3 className="text-lg font-semibold text-gray-200">{barber.name}</h3>
              <p className="text-sm text-gray-400">{barber.email}</p>
            </div>
          </div>
          
          {barber.isadmin && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-900 text-yellow-300 border border-yellow-600">
              Admin
            </span>
          )}
        </div>

        <div className="space-y-2 mb-4">
          <div className="flex items-center text-sm text-gray-400">
          </div>
          
          <div className="flex items-center text-sm text-gray-400">
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {barber.isadmin ? 'Admin Access' : 'Regular Barber'}
          </div>
        </div>

        <div className="flex space-x-2">
          <button
            onClick={onViewDetails}
            className="flex-1 px-3 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center"
          >
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            View Details
          </button>

          <button 
            className={`flex-1 px-3 py-2 items-center text-sm font-medium  bg-blue-800 hover:text-gray-400 rounded-md  ${isDeleting ? 'text-gray-200 cursor-not-allowed' : 'text-gray-200'}`}
            onClick={handleDelete}
            disabled={isDeleting}
          >
            {isDeleting ? 'Removing...' : 'Remove Barber'}
          </button>
        </div>
      </div>

      <DeleteResultModal
        isOpen={modalState.isOpen}
        onClose={closeModal}
        isSuccess={modalState.isSuccess}
        message={modalState.message}
      />
    </>
  );
}