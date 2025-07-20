"use client";
import { useState, use, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useSearchParams } from "next/navigation";
import AppointmentCalendar from "./appointmentCalendar";
import { createUserAppointment } from "@/app/lib/actions";
import Button from "./buttonfm";
import {
  getAvailableCombinations,
  groupSlotsByBarberAndDay,
} from "@/app/util/slotsToAppointments";

import RegisterLoginModal from "./RegisterLoginModal";

export default function ServiceSelector({
  barberServicesPromise,
  slotsPromise,
  session,
}) {
  const router = useRouter();
  const { services, barberServices } = use(barberServicesPromise);
  const slots = use(slotsPromise);

  const searchParams = useSearchParams();

  // State for client-side rendering only
  const [isClient, setIsClient] = useState(false);
  const [selectedBarberOption, setSelectedBarberOption] = useState(null);
  const [filteredServices, setFilteredServices] = useState([]);
  const [groupedData, setGroupedData] = useState({});

  // New state for appointment calendar
  const [showAppointmentCalendar, setShowAppointmentCalendar] = useState(false);
  const [availableAppointments, setAvailableAppointments] = useState([]);
  const [selectedService, setSelectedService] = useState(null);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [appointmentData, setAppointmentData] = useState(null);
  const [isBookingAppointment, setIsBookingAppointment] = useState(false);

  const uniqueBarbers = {};

  barberServices.forEach((bs) => {
    if (!uniqueBarbers[bs.barber_id]) {
      uniqueBarbers[bs.barber_id] = bs.name;
    }
  });

  const barberOptions = [
    { value: 0, label: "Any Barber" },
    ...Object.entries(uniqueBarbers).map(([id, name]) => ({
      value: parseInt(id),
      label: name,
    })),
  ];

  // Effect to set isClient to true on mount
  useEffect(() => {
    setIsClient(true);

    // Get barberId from URL
    const urlBarberId = searchParams.get("barberId")
      ? parseInt(searchParams.get("barberId"))
      : 0;

    // Find barber option
    const option =
      barberOptions.find((opt) => opt.value === urlBarberId) ||
      barberOptions[0];
    setSelectedBarberOption(option);

    // Filter services
    filterServicesByBarber(urlBarberId);
  }, []);

  useEffect(() => {
    setGroupedData(groupSlotsByBarberAndDay(slots));
    console.log("Grouped data:", groupedData);
  }, []);

  function filterServicesByBarber(barberId) {
    if (barberId === 0) {
      setFilteredServices(services);
    } else {
      // Get service IDs for the selected barber
      const barberServiceIds = barberServices
        .filter((bs) => bs.barber_id === barberId)
        .map((bs) => bs.service_id);

      // Filter services that match these IDs
      const availableServices = services.filter((service) =>
        barberServiceIds.includes(service.id)
      );

      setFilteredServices(availableServices);
    }
  }

  const handleBarberSelect = (option) => {
    const barberId = option.value;
    router.push(`?barberId=${barberId}`, { scroll: false });
    filterServicesByBarber(barberId);
    setSelectedBarberOption(option);
    // Hide calendar and reset selected service when changing barber
    setShowAppointmentCalendar(false);
    setSelectedService(null);
    setAppointmentData(null);
  };

  const handleBookService = async (service) => {
    try {
      // Import the action function
      const { calculateAllAvailableAppointments } = await import(
        "@/app/lib/actions"
      );

      // Use the server action instead of client-side calculation
      const availableCombinations = await calculateAllAvailableAppointments(
        service.duration_minutes,
        selectedBarberOption.value
      );

      console.log("Available combinations for booking:", availableCombinations);

      // Set state to show appointment calendar
      setAvailableAppointments(availableCombinations);
      setSelectedService(service);
      setShowAppointmentCalendar(true);
    } catch (error) {
      console.error("Error fetching available appointments:", error);
      // Fallback to client-side calculation if server action fails
      const availableCombinations = getAvailableCombinations(
        groupedData,
        selectedBarberOption.value,
        service.duration_minutes
      );
      setAvailableAppointments(availableCombinations);
      setSelectedService(service);
      setShowAppointmentCalendar(true);
    }
  };

  const handleAppointmentSelect = (appointment) => {
    console.log("Selected appointment:", appointment);
    console.log("For service:", selectedService);
    console.log("With barber:", selectedBarberOption);

    // Extract barberId and remove it from the appointment object
    const { barberId, ...appointmentWithoutBarberId } = appointment;

    // Use the actual barberId from the appointment slot when "Any Barber" is selected
    const actualBarberId =
      selectedBarberOption.value === 0 ? barberId : selectedBarberOption.value;

    setAppointmentData({
      selectedBarberId: actualBarberId,
      ...appointmentWithoutBarberId,
    });

    console.log("Appointment data:", {
      selectedBarberId: actualBarberId,
      ...appointmentWithoutBarberId,
    });

    setShowRegisterModal(true);
  };

  const handleLoggedInReservation = async (appointmentData, userId) => {
    setIsBookingAppointment(true); // Start loading

    try {
      const result = await createUserAppointment(userId, appointmentData);

      if (result.error) {
        alert("Error creating appointment: " + result.error);
      } else {
        // Get barber name from the selected barber option or appointment data
        const barberName =
          selectedBarberOption?.value === 0
            ? uniqueBarbers[appointmentData.selectedBarberId] || "Your Barber"
            : selectedBarberOption?.label || "Your Barber";

        // Create query parameters for success page
        const searchParams = new URLSearchParams({
          date: appointmentData.date,
          time: appointmentData.from,
          barberId: appointmentData.selectedBarberId.toString(),
          barberName: barberName,
          serviceName: selectedService?.name || "Service",
          duration: selectedService?.duration_minutes?.toString() || "30",
          customerName: session?.user?.name || "Customer",
        });

        console.log(
          "Redirecting to success with params:",
          searchParams.toString()
        );
        router.push(`/success?${searchParams.toString()}`);
      }
    } catch (error) {
      console.error("Error in handleLoggedInReservation:", error);
      alert("Error creating appointment: " + error.message);
    } finally {
      setIsBookingAppointment(false); // Stop loading
    }
  };

  const handleCloseCalendar = () => {
    setShowAppointmentCalendar(false);
    setSelectedService(null);
  };

  // Show a loading state or nothing until client-side rendering takes over
  if (!isClient) {
    return <div className="p-4">Loading services...</div>;
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Barber Selection */}
        <div className="lg:col-span-1">
          <h3 className="text-lg font-semibold mb-4 text-gray-200">
            Choose your barber
          </h3>
          <div className="space-y-3">
            {barberOptions.map((option) => (
              <motion.button
                key={option.value}
                onClick={() => handleBarberSelect(option)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.99 }}
                className={`w-full p-4 text-left rounded-lg border-2 ${
                  selectedBarberOption?.value === option.value
                    ? "border-green-400 bg-gray-600 text-gray-200"
                    : "border-gray-200 bg-gray-600 text-gray-200 hover:border-gray-300 hover:bg-gray-500"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium">{option.label}</span>
                  {selectedBarberOption?.value === option.value && (
                    <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                  )}
                </div>
              </motion.button>
            ))}
          </div>
        </div>

        {/* Right Column - Services */}
        <div className="lg:col-span-2">
          <h3 className="text-lg font-semibold mb-4 text-gray-200">
            Available Services
          </h3>
          {filteredServices.length === 0 ? (
            <p className="text-gray-700 italic">
              No services available for this barber.
            </p>
          ) : (
            <div className="grid gap-4">
              {filteredServices.map((service) => (
                <motion.button
                  key={service.id}
                  layout
                  onClick={() => handleBookService(service)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ duration: 0.3 }}
                  className={`w-full text-left rounded-lg p-4 border-2 cursor-pointer ${
                    selectedService?.id === service.id
                      ? "border-green-400 bg-gray-600 text-gray-200"
                    : "border-gray-200 bg-gray-600 text-gray-200 hover:border-gray-300 hover:bg-gray-500"
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex justify-between items-start mb-2">
                        <h4
                          className={`font-semibold text-lg ${
                            selectedService?.id === service.id
                              ? "text-gray-200"
                              : "text-gray-300"
                          }`}
                        >
                          {service.name}
                        </h4>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-gray-200">
                            ${service.price}
                          </span>
                          {selectedService?.id === service.id && (
                            <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                          )}
                        </div>
                      </div>
                      <p
                        className={`mt-1 ${
                          selectedService?.id === service.id
                            ? "text-gray-200"
                              : "text-gray-300"
                        }`}
                      >
                        {service.description}
                      </p>
                      <div className="mt-3">
                        <span
                          className={`text-sm ${
                            selectedService?.id === service.id
                              ? "text-gray-200"
                              : "text-gray-300"
                          }`}
                        >
                          {service.duration_minutes} minutes
                        </span>
                      </div>
                    </div>
                  </div>
                </motion.button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Appointment Calendar - Shows below when book now is clicked */}
      <AnimatePresence>
        {showAppointmentCalendar && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="mt-8 overflow-hidden"
          >
            <AppointmentCalendar
              onCalendarScroll={() => setAppointmentData(null)}
              availableAppointments={availableAppointments}
              selectedService={selectedService}
              onAppointmentSelect={handleAppointmentSelect}
              onClose={handleCloseCalendar}
              isInline={true}
            />
          </motion.div>
        )}
      </AnimatePresence>
      {!session && (
        <RegisterLoginModal
          isOpen={showRegisterModal}
          onClose={() => setShowRegisterModal(false)}
        />
      )}
      {session?.user.role === "customer" && appointmentData && (
        <div className="mt-6">
          <Button
            onClick={() =>
              handleLoggedInReservation(appointmentData, session.user.id)
            }
            color="primary"
            size="large"
            isLoading={isBookingAppointment}
            disabled={isBookingAppointment}
            className="w-full"
          >
            {isBookingAppointment
              ? "Booking Appointment..."
              : "Book Appointment"}
          </Button>
        </div>
      )}
      {session?.user.role === "barber" && (
        <div className="mt-6">
          <p className="w-full py-4 px-4 bg-red-500 text-black rounded-md">
            Cannot book an appointment as a barber. Please log in as a customer
            to book appointments.
          </p>
        </div>
      )}
    </div>
  );
}
