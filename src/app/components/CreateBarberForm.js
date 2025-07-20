"use client";
import { useState } from "react";
import { createBarber } from "@/app/lib/actions";
import { useRouter } from "next/navigation";

export default function CreateBarberForm({ services }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState(null);
  const [messageType, setMessageType] = useState(null);
  const [selectedServices, setSelectedServices] = useState(new Set());
  const router = useRouter();

  const handleServiceToggle = (serviceId) => {
    const newSelected = new Set(selectedServices);
    if (newSelected.has(serviceId)) {
      newSelected.delete(serviceId);
    } else {
      newSelected.add(serviceId);
    }
    setSelectedServices(newSelected);
  };

  const handleSubmit = async (formData) => {
    setIsSubmitting(true);
    setMessage(null);

    // Add selected services to form data
    selectedServices.forEach(serviceId => {
      formData.append('services', serviceId);
    });

    try {
      const result = await createBarber(formData);

      if (result.success) {
        setMessage(result.message);
        setMessageType("success");
        // Reset form
        document.getElementById("create-barber-form").reset();
        setSelectedServices(new Set());
        // Refresh the page to update any server-side data
        router.refresh();

        // Optional: Redirect to manage barbers page after 3 seconds
        setTimeout(() => {
          router.push("/admin/manage-barbers");
        }, 3000);
      } else {
        setMessage(result.error);
        setMessageType("error");
      }
    } catch (error) {
      setMessage("An unexpected error occurred");
      setMessageType("error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  };

  return (
    <div className="bg-gray-800 rounded-lg shadow-lg border border-gray-700">
      <div className="px-6 py-4 border-b border-gray-700">
        <h2 className="text-xl font-semibold text-gray-200">
          Barber Information
        </h2>
        <p className="text-sm text-gray-400 mt-1">
          Enter the details for the new barber account
        </p>
      </div>

      <div className="p-6">
        {/* Success/Error Message */}
        {message && (
          <div
            className={`mb-6 p-4 rounded-md border ${
              messageType === "success"
                ? "bg-green-900 border-green-600 text-green-300"
                : "bg-red-900 border-red-600 text-red-300"
            }`}
          >
            <div className="flex">
              <div className="flex-shrink-0">
                {messageType === "success" ? (
                  <svg
                    className="h-5 w-5 text-green-400"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                ) : (
                  <svg
                    className="h-5 w-5 text-red-400"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                      clipRule="evenodd"
                    />
                  </svg>
                )}
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium">{message}</p>
                {messageType === "success" && (
                  <p className="text-xs mt-1 opacity-80">
                    Redirecting to manage barbers page...
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        <form
          id="create-barber-form"
          action={handleSubmit}
          className="space-y-6"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-gray-300 mb-2"
              >
                Barber Name *
              </label>
              <input
                type="text"
                id="name"
                name="name"
                required
                disabled={isSubmitting}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-gray-200 placeholder-gray-400"
                placeholder="Enter barber's full name"
              />
            </div>

            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-300 mb-2"
              >
                Email Address *
              </label>
              <input
                type="email"
                id="email"
                name="email"
                required
                disabled={isSubmitting}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-gray-200 placeholder-gray-400"
                placeholder="barber@example.com"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-300 mb-2"
            >
              Password *
            </label>
            <input
              type="password"
              id="password"
              name="password"
              required
              minLength="6"
              disabled={isSubmitting}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-gray-200 placeholder-gray-400"
              placeholder="Minimum 6 characters"
            />
          </div>

          {/* Services Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-3">
              Services * (Select at least one)
            </label>
            <div className="bg-gray-700 border border-gray-600 rounded-md p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-60 overflow-y-auto">
                {services.map((service) => (
                  <div
                    key={service.id}
                    className={`flex items-start p-3 rounded-md border cursor-pointer transition-all ${
                      selectedServices.has(service.id)
                        ? "bg-blue-900 border-blue-600 shadow-md"
                        : "bg-gray-600 border-gray-500 hover:bg-gray-550"
                    }`}
                    onClick={() => handleServiceToggle(service.id)}
                  >
                    <div className="flex items-center h-5">
                      <input
                        type="checkbox"
                        id={`service-${service.id}`}
                        checked={selectedServices.has(service.id)}
                        onChange={() => handleServiceToggle(service.id)}
                        disabled={isSubmitting}
                        className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500 focus:ring-2"
                        onClick={(e) => e.stopPropagation()}
                      />
                    </div>
                    <div className="ml-3 flex-1">
                      <label
                        htmlFor={`service-${service.id}`}
                        className="text-sm font-medium text-gray-200 cursor-pointer"
                      >
                        {service.name}
                      </label>
                      <div className="text-xs text-gray-400 mt-1">
                        {service.duration_minutes} min • {formatPrice(service.price)}
                      </div>
                      {service.description && (
                        <div className="text-xs text-gray-500 mt-1">
                          {service.description}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Selected Services Summary */}
              {selectedServices.size > 0 && (
                <div className="mt-3 pt-3 border-t border-gray-600">
                  <div className="text-xs text-gray-400">
                    Selected {selectedServices.size} service{selectedServices.size > 1 ? 's' : ''}:
                  </div>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {Array.from(selectedServices).map(serviceId => {
                      const service = services.find(s => s.id === serviceId);
                      return (
                        <span
                          key={serviceId}
                          className="inline-flex items-center px-2 py-1 text-xs bg-blue-900 text-blue-200 rounded-full"
                        >
                          {service?.name}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleServiceToggle(serviceId);
                            }}
                            className="ml-1 text-blue-400 hover:text-blue-300"
                          >
                            ×
                          </button>
                        </span>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="bg-blue-900 border border-blue-600 rounded-md p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg
                  className="h-5 w-5 text-blue-400"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-blue-300">
                  Default Settings
                </h3>
                <div className="mt-2 text-sm text-blue-200">
                  <ul className="list-disc pl-5 space-y-1">
                    <li>
                      Admin status will be set to <strong>false</strong> by
                      default
                    </li>
                    <li>
                      Barber will be able to log in and manage their schedule
                    </li>
                    <li>
                      Selected services will be available for booking
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => window.history.back()}
              disabled={isSubmitting}
              className="px-6 py-2 bg-gray-600 text-gray-200 text-sm font-medium rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus:ring-offset-gray-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || selectedServices.size === 0}
              className="px-6 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center focus:ring-offset-gray-800"
            >
              {isSubmitting ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Creating...
                </>
              ) : (
                "Create Barber"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}