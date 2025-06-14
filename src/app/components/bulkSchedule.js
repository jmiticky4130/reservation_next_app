"use client";
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Button from "@/app/components/buttonfm";
import {
  generateTimeSlots,
  formatTimeDisplay,
  formatDateISO,
  timeToMinutes,
} from "@/app/util/formatFunctions";
import { saveAppointmentSlots } from "@/app/lib/actions";
import Select from "react-select";
import { useRouter } from "next/navigation";
import selectStyles from "@/app/util/selectStyles"; 

const BulkScheduler = ({ barberId }) => {
  // States for form fields
  const router = useRouter();
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [selectedDays, setSelectedDays] = useState({
    monday: false,
    tuesday: false,
    wednesday: false,
    thursday: false,
    friday: false,
    saturday: false,
    sunday: false,
  });
  const [numberOfWeeks, setNumberOfWeeks] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notification, setNotification] = useState({
    show: false,
    message: "",
    type: "",
  });

  const timeSlots = generateTimeSlots(9, 19, 15);

  const toggleDay = (day) => {
    setSelectedDays((prev) => ({
      ...prev,
      [day]: !prev[day],
    }));
  };

  const timeOptions = [
    { value: "", label: "Select time", isDisabled: true },
    ...timeSlots.map((time) => ({
      value: time,
      label: formatTimeDisplay(time),
    })),
  ];

  // Convert week options to react-select format
  const weekOptions = Array.from({ length: 12 }, (_, i) => ({
    value: i + 1,
    label: `${i + 1} ${i + 1 === 1 ? "week" : "weeks"}`,
  }));

  const getFutureDates = () => {
    const today = new Date();
    const dates = [];
    const dayIndices = {
      sunday: 0,
      monday: 1,
      tuesday: 2,
      wednesday: 3,
      thursday: 4,
      friday: 5,
      saturday: 6,
    };

    const selectedDayIndices = Object.entries(selectedDays)
      .filter(([_, isSelected]) => isSelected)
      .map(([day]) => dayIndices[day]);

    // Generate dates for the specified number of weeks
    for (let w = 0; w < numberOfWeeks; w++) {
      for (let d = 0; d < 7; d++) {
        if (selectedDayIndices.includes(d)) {
          const date = new Date(today);
          date.setDate(date.getDate() + d + 7 * w - today.getDay());
          dates.push(date);
        }
      }
    }

    return dates;
  };

  // Generate all time slots between start and end
  const generateTimeRange = (start, end) => {
    const result = [];
    const startMin = timeToMinutes(start);
    const endMin = timeToMinutes(end);

    // Use same interval as the main app
    const interval = 15;

    for (let mins = startMin; mins < endMin; mins += interval) {
      const hours = Math.floor(mins / 60);
      const minutes = mins % 60;
      result.push(
        `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`
      );
    }

    return result;
  };

  // Show notification
  const showNotification = (message, type) => {
    setNotification({ show: true, message, type });
    setTimeout(
      () => setNotification({ show: false, message: "", type: "" }),
      5000
    );
  };

  // Handle form submission
  const handleApply = async () => {
    if (!startTime || !endTime) {
      showNotification("Please select both start and end times", "error");
      return;
    }

    if (!Object.values(selectedDays).some(Boolean)) {
      showNotification("Please select at least one day", "error");
      return;
    }

    // Validate time range
    const startMinutes = timeToMinutes(startTime);
    const endMinutes = timeToMinutes(endTime);
    if (endMinutes <= startMinutes) {
      showNotification("End time must be after start time", "error");
      return;
    }

    setIsSubmitting(true);

    try {
      // 1. Get all future dates matching selected days
      const dates = getFutureDates();

      // 2. Generate all times in the range
      const times = generateTimeRange(startTime, endTime);

      // 3. Create slot objects for each date-time combination
      const slots = [];
      dates.forEach((date) => {
        const dateStr = formatDateISO(date);
        times.forEach((time) => {
          slots.push({ date: dateStr, time });
        });
      });

      // 4. Save slots using server action
      const result = await saveAppointmentSlots(slots, barberId);

      if (result.success) {
        showNotification(
          `Successfully added ${result.results.length} slots`,
          "success"
        );
      } else {
        showNotification(
          `Error: ${result.error || "Failed to save slots"}`,
          "error"
        );
      }
    } catch (error) {
      console.error("Error saving slots:", error);
      showNotification("An unexpected error occurred", "error");
    } finally {
      router.refresh();
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto mb-8">
      <div className="p-6 bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200 rounded-lg shadow-sm">
        <h2 className="text-xl font-bold mb-4 text-gray-800">
          Bulk Schedule Availability
        </h2>

        {/* Notification */}
        <AnimatePresence>
          {notification.show && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className={`mb-4 p-3 rounded-md ${
                notification.type === "success"
                  ? "bg-green-50 border border-green-500 text-green-700"
                  : "bg-red-50 border border-red-500 text-red-700"
              }`}
            >
              {notification.message}
            </motion.div>
          )}
        </AnimatePresence>

        <div className="space-y-6">
          {/* Time Range Selection */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Start Time
              </label>
              <Select
                options={timeOptions}
                value={
                  timeOptions.find((option) => option.value === startTime) ||
                  timeOptions[0]
                }
                onChange={(selected) => setStartTime(selected.value)}
                styles={selectStyles}
                className="text-base font-medium"
                placeholder="Select start time"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                End Time
              </label>
              <Select
                options={timeOptions}
                value={
                  timeOptions.find((option) => option.value === endTime) ||
                  timeOptions[0]
                }
                onChange={(selected) => setEndTime(selected.value)}
                styles={selectStyles}
                className="text-base font-medium"
                placeholder="Select end time"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Number of Weeks
              </label>
              <Select
                options={weekOptions}
                value={weekOptions.find(
                  (option) => option.value === numberOfWeeks
                )}
                onChange={(selected) => setNumberOfWeeks(selected.value)}
                styles={selectStyles}
                className="text-base font-medium"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Days
            </label>
            <div className="grid grid-cols-3 sm:grid-cols-7 gap-2">
              {Object.entries(selectedDays).map(([day, isSelected]) => (
                <motion.button
                  key={day}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => toggleDay(day)}
                  className={`p-3 rounded-md text-center font-medium transition-colors ${
                    isSelected
                      ? "bg-blue-600 text-white shadow-md"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {day.charAt(0).toUpperCase() + day.slice(1, 3)}
                </motion.button>
              ))}
            </div>
          </div>

          {/* Apply Button */}
          <div className="pt-2">
            <Button
              color="primary-gradient"
              size="large"
              onClick={handleApply}
              disabled={isSubmitting}
              isLoading={isSubmitting}
            >
              {isSubmitting ? "Processing..." : "Apply Bulk Schedule"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BulkScheduler;
