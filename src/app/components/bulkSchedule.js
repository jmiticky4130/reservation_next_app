"use client";
import { useState } from "react";
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
  const [startDate, setStartDate] = useState(formatDateISO(new Date())); // Add start date state
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
    const baseDate = new Date(startDate + "T00:00:00");
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

    // For each week
    for (let week = 0; week < numberOfWeeks; week++) {
      // For each selected day of the week
      selectedDayIndices.forEach((dayIndex) => {
        // Calculate the date for this day in this week
        const date = new Date(baseDate);

        // Find the first occurrence of this day on or after the base date
        let daysToAdd = dayIndex - baseDate.getDay();
        if (daysToAdd < 0) {
          daysToAdd += 7; // Move to next week if day already passed
        }

        // Add the week offset
        daysToAdd += week * 7;

        date.setDate(baseDate.getDate() + daysToAdd);

        // Double check: only add if date is on or after start date
        if (date >= baseDate) {
          dates.push(date);
        }
      });
    }

    // Sort dates chronologically
    dates.sort((a, b) => a - b);

    return dates;
  };

  const generateTimeRange = (start, end) => {
    const result = [];
    const startMin = timeToMinutes(start);
    const endMin = timeToMinutes(end);

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

  const handleApply = async () => {
    if (!startTime || !endTime) {
      showNotification("Please select both start and end times", "error");
      return;
    }

    if (!startDate) {
      showNotification("Please select a start date", "error");
      return;
    }

    if (!Object.values(selectedDays).some(Boolean)) {
      showNotification("Please select at least one day", "error");
      return;
    }

    // Validate start date is not in the past
    const selectedDate = new Date(startDate + "T00:00:00");
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (selectedDate < today) {
      showNotification("Start date cannot be in the past", "error");
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
      const dates = getFutureDates();

      if (dates.length === 0) {
        showNotification(
          "No valid dates found for the selected criteria",
          "error"
        );
        setIsSubmitting(false);
        return;
      }

      const times = generateTimeRange(startTime, endTime);

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
          `Successfully added ${result.results.length} slots across ${dates.length} days`,
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

  // Helper function to get minimum date (today)
  const getMinDate = () => {
    return formatDateISO(new Date());
  };

  return (
    <div className="container mx-auto mb-8">
      <div className="p-6 bg-gray-800 border border-gray-700 rounded-lg shadow-lg">
        <h2 className="text-xl font-bold mb-4 text-gray-200">
          Bulk Schedule Availability
        </h2>

        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Start Date
              </label>
              <input
                type="date"
                value={startDate}
                min={getMinDate()}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-600 rounded-md shadow-sm bg-gray-700 text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base font-medium"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
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
              <label className="block text-sm font-medium text-gray-300 mb-2">
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
              <label className="block text-sm font-medium text-gray-300 mb-2">
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
            <label className="block text-sm font-medium text-gray-300 mb-2">
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
                      ? "bg-blue-600 text-white shadow-md border border-blue-500"
                      : "bg-gray-700 text-gray-300 hover:bg-gray-600 border border-gray-600"
                  }`}
                >
                  {day.charAt(0).toUpperCase() + day.slice(1, 3)}
                </motion.button>
              ))}
            </div>
          </div>

          {startDate && Object.values(selectedDays).some(Boolean) && (
            <div className="mt-4 p-4 bg-gray-700 rounded-lg border border-gray-600">
              <h3 className="text-sm font-medium text-gray-300 mb-2">
                Preview:
              </h3>
              <p className="text-sm text-gray-400">
                Starting from{" "}
                {new Date(startDate + "T00:00:00").toLocaleDateString("en-US", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
                , this will create slots for {numberOfWeeks} week
                {numberOfWeeks > 1 ? "s" : ""} on{" "}
                {Object.entries(selectedDays)
                  .filter(([_, isSelected]) => isSelected)
                  .map(([day]) => day.charAt(0).toUpperCase() + day.slice(1))
                  .join(", ")}
                {startTime &&
                  endTime &&
                  ` from ${formatTimeDisplay(startTime)} to ${formatTimeDisplay(
                    endTime
                  )}`}
                .
              </p>
            </div>
          )}

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

          <AnimatePresence>
            {notification.show && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className={`mb-4 p-3 rounded-md border ${
                  notification.type === "success"
                    ? "bg-green-900 border-green-600 text-green-300"
                    : "bg-red-900 border-red-600 text-red-300"
                }`}
              >
                {notification.message}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default BulkScheduler;
