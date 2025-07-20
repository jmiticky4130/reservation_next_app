"use client";
import { useState } from "react";
import { updateBarberInfo } from "@/app/lib/actions";

export default function BarberInfo({ barber, onUpdate }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    name: barber.name,
    email: barber.email,
    isadmin: barber.isadmin
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage(null);

    try {
      const result = await updateBarberInfo(barber.id, editData);
      if (result.success) {
        setMessage({ type: "success", text: "Barber information updated successfully" });
        setIsEditing(false);
        onUpdate(result.barber);
      } else {
        setMessage({ type: "error", text: result.error });
      }
    } catch (error) {
      setMessage({ type: "error", text: "Failed to update barber information" });
    } finally {
      setIsSubmitting(false);
    }
  };


  return (
    <div className="space-y-6">
      {/* Success/Error Message */}
      {message && (
        <div className={`p-4 rounded-md border ${
          message.type === "success" 
            ? "bg-green-900 border-green-600 text-green-300" 
            : "bg-red-900 border-red-600 text-red-300"
        }`}>
          <p className="text-sm font-medium">{message.text}</p>
        </div>
      )}

      {/* Basic Information */}
      <div className="bg-gray-700 rounded-lg p-6 border border-gray-600">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-200">Basic Information</h3>
          {!isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              className="px-3 py-1 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition-colors flex items-center"
            >
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Edit
            </button>
          )}
        </div>

        {isEditing ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Name
                </label>
                <input
                  type="text"
                  value={editData.name}
                  onChange={(e) => setEditData({...editData, name: e.target.value})}
                  className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded-md text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={editData.email}
                  onChange={(e) => setEditData({...editData, email: e.target.value})}
                  className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded-md text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
            </div>

            <div>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={editData.isadmin}
                  onChange={(e) => setEditData({...editData, isadmin: e.target.checked})}
                  className="w-4 h-4 text-blue-600 bg-gray-600 border-gray-500 rounded focus:ring-blue-500 focus:ring-2"
                />
                <span className="ml-2 text-sm text-gray-300">
                  Admin privileges (can access admin dashboard)
                </span>
              </label>
            </div>

            <div className="flex space-x-3">
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              >
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Saving...
                  </>
                ) : (
                  "Save Changes"
                )}
              </button>
              
              <button
                type="button"
                onClick={() => {
                  setIsEditing(false);
                  setEditData({
                    name: barber.name,
                    email: barber.email,
                    isadmin: barber.isadmin
                  });
                  setMessage(null);
                }}
                className="px-4 py-2 bg-gray-600 text-gray-200 text-sm font-medium rounded-md hover:bg-gray-500 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="text-sm font-medium text-gray-400 mb-1">Full Name</h4>
              <p className="text-gray-200">{barber.name}</p>
            </div>
            
            <div>
              <h4 className="text-sm font-medium text-gray-400 mb-1">Email Address</h4>
              <p className="text-gray-200">{barber.email}</p>
            </div>
            
            <div>
              <h4 className="text-sm font-medium text-gray-400 mb-1">Role</h4>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                barber.isadmin 
                  ? "bg-yellow-900 text-yellow-300 border border-yellow-600"
                  : "bg-blue-900 text-blue-300 border border-blue-600"
              }`}>
                {barber.isadmin ? "Admin" : "Regular Barber"}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Additional Stats */}
      <div className="bg-gray-700 rounded-lg p-6 border border-gray-600">
        <h3 className="text-lg font-semibold text-gray-200 mb-4">Account Statistics</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-400">-</div>
            <div className="text-sm text-gray-400">Total Appointments</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-400">-</div>
            <div className="text-sm text-gray-400">This Month</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-400">-</div>
            <div className="text-sm text-gray-400">Available Slots</div>
          </div>
        </div>
      </div>
    </div>
  );
}