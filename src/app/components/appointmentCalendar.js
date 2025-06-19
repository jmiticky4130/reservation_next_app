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
  isInline = false, // New prop to determine if it's inline or modal
}) {
  // Get current week starting from today
  const [currentWeekStart, setCurrentWeekStart] = useState(new Date());
  const [isChangingWeek, setIsChangingWeek] = useState(false);
  const [slideDirection, setSlideDirection] = useState(0); // -1 for prev, 1 for next
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
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];
    return months[date.getMonth()];
  };

  const handlePrevWeek = async () => {
    onCalendarScroll();
    setIsChangingWeek(true);
    setSlideDirection(-1);
    setSelectedAppointment(null);

    // Small delay to allow exit animation
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
    onCalendarScroll();
    setIsChangingWeek(true);
    setSlideDirection(1);
    setSelectedAppointment(null);

    // Small delay to allow exit animation
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
    ? { className: "bg-white rounded-lg shadow-lg border border-gray-200" }
    : {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        exit: { opacity: 0 },
        transition: { duration: 0.2 },
        className:
          "fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center p-4 z-50 pt-8",
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
          "bg-white rounded-lg shadow-xl max-w-6xl w-full overflow-hidden",
        style: {
          position: "relative",
          top: 0,
          maxHeight: "calc(100vh - 64px)",
        },
      };

  return (
    <Container {...containerProps}>
      <ContentContainer {...contentProps}>
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-semibold text-gray-800">
                Available Appointments
              </h2>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl font-bold transition-colors"
            >
              ×
            </button>
          </div>
        </div>

        {/* Week Navigation */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <button
              onClick={handlePrevWeek}
              disabled={isChangingWeek}
              className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed rounded-md transition-colors"
            >
              ← Previous Week
            </button>
            <motion.h3
              key={currentWeekStart.getTime()}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="text-lg font-medium text-gray-700"
            >
              {getMonthName(currentWeekStart)} {currentWeekStart.getFullYear()}
            </motion.h3>
            <button
              onClick={handleNextWeek}
              disabled={isChangingWeek}
              className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed rounded-md transition-colors"
            >
              Next Week →
            </button>
          </div>
        </div>

        {/* Calendar Grid Container */}
        <motion.div
          layout
          transition={{ duration: 0.3, ease: "easeInOut" }}
          className="p-2"
          style={
            isInline
              ? {}
              : {
                  minHeight: "400px",
                  maxHeight: "calc(100vh - 300px)",
                  overflowY: "auto",
                }
          }
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
                className="grid grid-cols-7 gap-2"
              >
                {weekDays.map((day, index) => {
                  const dayString = formatDateISO(day);
                  const dayAppointments = appointmentsByDate[dayString] || [];
                  const isCurrentDay = isToday(day);

                  return (
                    <motion.div
                      key={`${dayString}-${index}`}
                      layout
                      className={`border rounded-lg p-1 transition-all duration-300 ${
                        isCurrentDay
                          ? "bg-blue-50 border-blue-200"
                          : "bg-gray-50 border-gray-200"
                      }`}
                      style={{ minHeight: "200px" }}
                    >
                      {/* Day Header */}
                      <div className="text-center mb-3">
                        <div
                          className={`text-sm font-medium ${
                            isCurrentDay ? "text-blue-600" : "text-gray-600"
                          }`}
                        >
                          {getDayName(day)}
                        </div>
                        <div
                          className={`text-lg font-semibold ${
                            isCurrentDay ? "text-blue-800" : "text-gray-800"
                          }`}
                        >
                          {day.getDate()}
                        </div>
                      </div>

                      {/* Appointments */}
                      <motion.div layout className="space-y-3">
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
                                      scale: 1.06,
                                      y: -2,
                                    }}
                                    whileTap={{ scale: 0.95 }}
                                    transition={{
                                      duration: 0.1,
                                      ease: "easeOut",
                                    }}
                                    onClick={() =>
                                      handleAppointmentClick(appointment)
                                    }
                                    className={`w-full text-xs p-3 rounded transition-all duration-200 text-center relative ${
                                      isSelected
                                        ? "bg-blue-600 hover:bg-blue-700 text-white border border-transparent"
                                        : "bg-green-500 hover:bg-green-600 text-white border border-transparent"
                                    }`}
                                  >
                                    <div className={`font-medium 'text-sm'}`}>
                                      {appointment.from}
                                    </div>
                                    {appointment.barberId && (
                                      <div
                                        className={`opacity-90 text-[10px]'
                                    }`}
                                      >
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
                              className="text-xs text-gray-400 text-center py-4"
                            >
                              No slots available
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

        {/* Footer */}
        <motion.div layout className="p-4 border-t border-gray-200 bg-gray-50">
          <div className="flex justify-between items-center text-sm text-gray-600">
            <span>
              {selectedAppointment
                ? `Selected: ${selectedAppointment.date} at ${selectedAppointment.from}`
                : "Click on a time slot to book your appointment"}
            </span>{" "}
            <motion.span
              key={totalAppointmentsThisWeek}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.2 }}
            >
              {totalAppointmentsThisWeek} slots available this week
            </motion.span>
          </div>
        </motion.div>
      </ContentContainer>
    </Container>
  );
}
