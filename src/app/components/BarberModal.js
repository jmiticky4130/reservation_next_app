"use client";
import { useState, useEffect } from "react";
import { getBarberAppointments } from "@/app/lib/data";
import BarberInfo from "./BarberInfo";
import BarberAppointments from "./BarberAppointments";

export default function BarberModal({ barber, onClose }) {
  const [activeTab, setActiveTab] = useState("info");
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (activeTab === "appointments") {
      loadAppointments();
    }
  }, [activeTab, barber.id]);

  const loadAppointments = async () => {
    setLoading(true);
    try {
      const data = await getBarberAppointments(barber.id);
      setAppointments(data);
    } catch (error) {
      console.error("Failed to load appointments:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
              <span className="text-white font-semibold text-lg">
                {barber.name.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="ml-4">
              <h2 className="text-2xl font-bold text-gray-200">{barber.name}</h2>
              <p className="text-gray-400">{barber.email}</p>
            </div>
            {barber.isadmin && (
              <span className="ml-4 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-900 text-yellow-300 border border-yellow-600">
                Admin
              </span>
            )}
          </div>
          
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-200 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-700">
          <button
            onClick={() => setActiveTab("info")}
            className={`px-6 py-3 text-sm font-medium transition-colors ${
              activeTab === "info"
                ? "text-blue-400 border-b-2 border-blue-400 bg-gray-750"
                : "text-gray-400 hover:text-gray-200"
            }`}
          >
            Barber Information
          </button>
          <button
            onClick={() => setActiveTab("appointments")}
            className={`px-6 py-3 text-sm font-medium transition-colors ${
              activeTab === "appointments"
                ? "text-blue-400 border-b-2 border-blue-400 bg-gray-750"
                : "text-gray-400 hover:text-gray-200"
            }`}
          >
            Appointments
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {activeTab === "info" && (
            <BarberInfo barber={barber} onUpdate={(updatedBarber) => {
              // Handle barber update - you could pass this up to parent
              console.log("Barber updated:", updatedBarber);
            }} />
          )}
          
          {activeTab === "appointments" && (
            <BarberAppointments 
              barber={barber} 
              appointments={appointments} 
              loading={loading}
              onRefresh={loadAppointments}
            />
          )}
        </div>
      </div>
    </div>
  );
}