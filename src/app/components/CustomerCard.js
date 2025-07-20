"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { deleteCustomer } from "@/app/lib/actions";

// Modal component for displaying deletion results
function DeleteResultModal({ isOpen, onClose, isSuccess, message }) {
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

export default function CustomerCard({ customer }) {
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
      const result = await deleteCustomer(customer.id);
      
      if (result && result.error) {
        setModalState({
          isOpen: true,
          isSuccess: false,
          message: result.error || 'Failed to delete customer. Please try again.'
        });
      } else {
        setModalState({
          isOpen: true,
          isSuccess: true,
          message: `Customer ${customer.name} has been successfully deleted.`
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
    
    // If deletion was successful, refresh the page when modal closes
    if (modalState.isSuccess) {
      router.refresh();
    }
  };

  return (
    <>
      <div className="bg-gray-700 rounded-lg border border-gray-600 p-6 hover:border-gray-500 transition-colors">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center">
              <span className="text-white font-semibold text-lg">
                {customer.name.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="ml-3">
              <h3 className="text-lg font-semibold text-gray-200">{customer.name}</h3>
              <p className="text-sm text-gray-400">{customer.email}</p>
            </div>
          </div>
        </div>

        <div className="space-y-2 mb-4">
          <div className="flex items-center text-sm text-gray-400">
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            Customer Account
          </div>
        </div>

        <div className="flex justify-end">
          <button 
            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors flex items-center ${
              isDeleting 
                ? 'bg-gray-600 text-gray-400 cursor-not-allowed' 
                : 'bg-red-600 text-white hover:bg-red-700'
            }`}
            onClick={handleDelete}
            disabled={isDeleting}
          >
            {isDeleting ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Deleting...
              </>
            ) : (
              <>
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Delete
              </>
            )}
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