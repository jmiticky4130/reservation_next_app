"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { formatDateISO, getWeekDates } from "@/app/util/formatFunctions";

export default function AppointmentCalendar({
  availableAppointments,
  selectedService,
  onAppointmentSelect,
  onClose,
  onCalendarScroll,
  isInline = true, // Default to inline for seamless integration
}) {
  // Get current week starting from today
  const [currentWeekStart, setCurrentWeekStart] = useState(new Date());
  const [isChangingWeek, setIsChangingWeek] = useState(false);
  const [slideDirection, setSlideDirection] = useState(0);
  const [selectedAppointment, setSelectedAppointment] = useState(null);

  // Generate 7 days for the current week
  const weekDays = useMemo(() => {
    return getWeekDates(currentWeekStart);
  }, [currentWeekStart]);

  // Group appointments by date
  const appointmentsByDate = useMemo(() => {
    const grouped = {};

    availableAppointments.forEach((appointment) => {
      const date = appointment.date;
      if (!grouped[date]) {
        grouped[date] = [];
      }
      grouped[date].push(appointment);
    });

    // Sort appointments by time for each date
    Object.keys(grouped).forEach((date) => {
      grouped[date].sort((a, b) => a.from.localeCompare(b.from));
    });

    return grouped;
  }, [availableAppointments]);

  // Helper function to check if a date is today
  const isToday = (date) => {
    const today = new Date();
    return formatDateISO(date) === formatDateISO(today);
  };

  // Helper function to get day name
  const getDayName = (date) => {
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    return days[date.getDay()];
  };

  // Helper function to get month name
  const getMonthName = (date) => {
    const months = [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December",
    ];
    return months[date.getMonth()];
  };

  const handlePrevWeek = async () => {
    if (onCalendarScroll) onCalendarScroll();
    setIsChangingWeek(true);
    setSlideDirection(-1);
    setSelectedAppointment(null);

    setTimeout(() => {
      setCurrentWeekStart((prev) => {
        const newDate = new Date(prev);
        newDate.setDate(prev.getDate() - 7);
        return newDate;
      });
      setIsChangingWeek(false);
    }, 150);
  };

  const handleNextWeek = async () => {
    if (onCalendarScroll) onCalendarScroll();
    setIsChangingWeek(true);
    setSlideDirection(1);
    setSelectedAppointment(null);

    setTimeout(() => {
      setCurrentWeekStart((prev) => {
        const newDate = new Date(prev);
        newDate.setDate(prev.getDate() + 7);
        return newDate;
      });
      setIsChangingWeek(false);
    }, 150);
  };

  const handleAppointmentClick = (appointment) => {
    if (onAppointmentSelect) {
      setSelectedAppointment(appointment);
      onAppointmentSelect(appointment);
    }
  };

  const isAppointmentSelected = (appointment) => {
    if (!selectedAppointment) return false;
    return (
      selectedAppointment.date === appointment.date &&
      selectedAppointment.from === appointment.from &&
      selectedAppointment.barberId === appointment.barberId
    );
  };

  // Calculate total appointments for current week
  const totalAppointmentsThisWeek = weekDays.reduce((total, day) => {
    const dayString = formatDateISO(day);
    const dayAppointments = appointmentsByDate[dayString] || [];
    return total + dayAppointments.length;
  }, 0);

  // Different container based on inline prop
  const Container = isInline ? "div" : motion.div;
  const containerProps = isInline
    ? { 
        className: "bg-gray-800 rounded-lg shadow-lg border border-gray-700",
        style: { width: "100%" } // Match service selector width
      }
    : {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        exit: { opacity: 0 },
        transition: { duration: 0.2 },
        className:
          "fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center p-2 sm:p-4 z-50 pt-4 sm:pt-8",
      };

  const ContentContainer = isInline ? "div" : motion.div;
  const contentProps = isInline
    ? { className: "w-full" }
    : {
        layout: true,
        initial: { scale: 0.95, y: -20 },
        animate: { scale: 1, y: 0, height: "auto" },
        exit: { scale: 0.95, y: -20 },
        transition: {
          duration: 0.3,
          type: "spring",
          stiffness: 300,
          damping: 30,
        },
        className:
          "bg-gray-800 rounded-lg shadow-xl max-w-6xl w-full overflow-hidden max-h-[95vh] flex flex-col border border-gray-700",
        style: {
          position: "relative",
          top: 0,
        },
      };

  return (
    <Container {...containerProps}>
      <ContentContainer {...contentProps}>
        {/* Header */}
        <div className="p-4 sm:p-6 border-b border-gray-700 flex-shrink-0">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-lg sm:text-2xl font-semibold text-gray-200">
                Available Appointments
              </h2>
              {selectedService && (
                <p className="text-sm text-gray-400 mt-1">
                  {selectedService.name} ({selectedService.duration_minutes} min)
                </p>
              )}
            </div>
            {!isInline && (
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-300 text-xl sm:text-2xl font-bold transition-colors p-1"
              >
                ×
              </button>
            )}
          </div>
        </div>

        {/* Week Navigation */}
        <div className="p-4 border-b border-gray-700 flex-shrink-0">
          <div className="flex justify-between items-center gap-2">
            <button
              onClick={handlePrevWeek}
              disabled={isChangingWeek}
              className="px-3 py-2 text-sm text-gray-300 bg-gray-700 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-md transition-colors flex-shrink-0 border border-gray-600"
            >
              <span className="hidden sm:inline">← Previous Week</span>
              <span className="sm:hidden">← Prev</span>
            </button>
            <motion.h3
              key={currentWeekStart.getTime()}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="text-sm sm:text-lg font-medium text-gray-200 text-center flex-1 min-w-0"
            >
              {getMonthName(currentWeekStart)} {currentWeekStart.getFullYear()}
            </motion.h3>
            <button
              onClick={handleNextWeek}
              disabled={isChangingWeek}
              className="px-3 py-2 text-sm text-gray-300 bg-gray-700 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-md transition-colors flex-shrink-0 border border-gray-600"
            >
              <span className="hidden sm:inline">Next Week →</span>
              <span className="sm:hidden">Next →</span>
            </button>
          </div>
        </div>

        {/* Calendar Grid Container - SCROLLABLE */}
        <div className="flex-1 overflow-hidden">
          <motion.div
            layout
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="h-full overflow-auto p-4"
            style={{
              minHeight: "300px",
              maxHeight: isInline ? "600px" : "none",
            }}
          >
            <AnimatePresence mode="wait">
              {!isChangingWeek && (
                <motion.div
                  key={currentWeekStart.getTime()}
                  initial={{
                    opacity: 0,
                    x: slideDirection * 50,
                    scale: 0.98,
                  }}
                  animate={{
                    opacity: 1,
                    x: 0,
                    scale: 1,
                  }}
                  exit={{
                    opacity: 0,
                    x: slideDirection * -50,
                    scale: 0.98,
                  }}
                  transition={{
                    duration: 0.3,
                    ease: "easeInOut",
                  }}
                  className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-7 gap-3"
                >
                  {weekDays.map((day, index) => {
                    const dayString = formatDateISO(day);
                    const dayAppointments = appointmentsByDate[dayString] || [];
                    const isCurrentDay = isToday(day);

                    return (
                      <motion.div
                        key={`${dayString}-${index}`}
                        layout
                        className={`border rounded-lg p-3 transition-all duration-300 ${
                          isCurrentDay
                            ? "bg-gray-700 border-blue-500"
                            : "bg-gray-750 border-gray-600"
                        }`}
                        style={{ 
                          minHeight: "150px",
                          backgroundColor: isCurrentDay ? "ffffff" : "#364153",
                          marginBottom: dayAppointments.length > 0 ? "8px" : "4px"
                        }}
                      >
                        {/* Day Header */}
                        <div className="text-center mb-3">
                          <div
                            className={`text-xs sm:text-sm font-medium ${
                              isCurrentDay ? "text-blue-400" : "text-gray-400"
                            }`}
                          >
                            {getDayName(day)}
                          </div>
                          <div
                            className={`text-base sm:text-lg font-semibold ${
                              isCurrentDay ? "text-blue-300" : "text-gray-200"
                            }`}
                          >
                            {day.getDate()}
                          </div>
                        </div>

                        {/* Appointments */}
                        <motion.div layout className="space-y-2">
                          <AnimatePresence>
                            {dayAppointments.length > 0 ? (
                              dayAppointments.map(
                                (appointment, appointmentIndex) => {
                                  const isSelected =
                                    isAppointmentSelected(appointment);

                                  return (
                                    <motion.button
                                      key={`${appointment.date}-${appointment.from}`}
                                      layout
                                      whileHover={{
                                        scale: 1.02,
                                        y: -1,
                                      }}
                                      whileTap={{ scale: 0.98 }}
                                      transition={{
                                        duration: 0.1,
                                        ease: "easeOut",
                                      }}
                                      onClick={() =>
                                        handleAppointmentClick(appointment)
                                      }
                                      className={`w-full text-xs sm:text-sm p-2 sm:p-3 rounded transition-all duration-200 text-center relative font-medium ${
                                        isSelected
                                          ? "bg-blue-600 hover:bg-blue-700 text-white border border-blue-500 shadow-md"
                                          : "bg-green-600 hover:bg-green-700 text-white border border-green-500 shadow-sm hover:shadow-md"
                                      }`}
                                    >
                                      <div className="font-semibold">
                                        {appointment.from}
                                      </div>
                                      {appointment.barberId && (
                                        <div className="opacity-90 text-[10px] sm:text-xs mt-1">
                                          Barber {appointment.barberId}
                                        </div>
                                      )}
                                    </motion.button>
                                  );
                                }
                              )
                            ) : (
                              <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.2 }}
                                className="text-xs text-gray-500 text-center py-4"
                              >
                                No slots
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </motion.div>
                      </motion.div>
                    );
                  })}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>

        {/* Footer */}
        <motion.div layout className="p-4 border-t border-gray-700 bg-gray-750 flex-shrink-0" >
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 text-xs sm:text-sm text-gray-300">
            <span className="order-2 sm:order-1">
              {selectedAppointment
                ? `Selected: ${selectedAppointment.date} at ${selectedAppointment.from}`
                : "Tap a time slot to book"}
            </span>
            <motion.span
              key={totalAppointmentsThisWeek}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.2 }}
              className="order-1 sm:order-2 font-medium text-gray-200"
            >
              {totalAppointmentsThisWeek} slots this week
            </motion.span>
          </div>
        </motion.div>
      </ContentContainer>
    </Container>
  );
}