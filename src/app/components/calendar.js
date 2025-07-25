"use client";
import React, { useState, useEffect } from "react";
import {
  formatDateISO,
  formatTimeDisplay,
  getWeekDates,
  generateTimeSlots,
} from "@/app/util/formatFunctions";
import {
  saveAppointmentSlots,
  removeAppointmentSlots,
} from "@/app/lib/actions";
import { fetchAppointmentSlots } from "@/app/lib/data";
import { AnimatePresence, motion } from "framer-motion";
import cellVariants from "../util/cellVariants";
import Button from "@/app/components/buttonfm";
import BulkScheduler from "@/app/components/bulkSchedule";

const DURATION_MINUTES = 15;

export default function Calendar({
  initialWeekDates,
  initialAppointmentSlots,
  barberId,
}) {
  const [currentWeekStart, setCurrentWeekStart] = useState(initialWeekDates[0]);
  const [weekDates, setWeekDates] = useState(initialWeekDates);
  const [appointmentSlots, setAppointmentSlots] = useState(
    initialAppointmentSlots
  );
  const [timeSlots] = useState(() =>
    generateTimeSlots(9, 19, DURATION_MINUTES)
  );
  const [availabilityMap, setAvailabilityMap] = useState({});
  const [selectedSlots, setSelectedSlots] = useState(new Set());
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [bookedAlert, setBookedAlert] = useState(false);

  useEffect(() => {
    setWeekDates(initialWeekDates);
    setCurrentWeekStart(initialWeekDates[0]);
  }, [initialWeekDates]);

  useEffect(() => {
    setAppointmentSlots(initialAppointmentSlots);
  }, [initialAppointmentSlots]);

  // 3) rebuild the availability map whenever weekDates or slots change
  useEffect(() => {
    const map = {};
    weekDates.forEach((d) => {
      const ds = formatDateISO(d);
      map[ds] = {};
      timeSlots.forEach((t) => {
        map[ds][t] = { status: "empty", slotData: null };
      });
    });
    appointmentSlots.forEach((slot) => {
      const ds = slot.day;
      const ts = slot.start_time.slice(0, 5);
      if (map[ds]?.[ts]) {
        map[ds][ts] = {
          status: slot.customer_id ? "booked" : "available",
          slotData: slot,
        };
      }
    });
    setAvailabilityMap(map);
  }, [weekDates, appointmentSlots, timeSlots]);

  const handleTimeRowClick = (time) => {
    const newSelectedSlots = new Set(selectedSlots);

    // For each day in the week, toggle slots with this time
    weekDates.forEach((date) => {
      const dateStr = formatDateISO(date);
      const slotId = `${dateStr}-${time}`;

      // Skip already selected slots
      if (!newSelectedSlots.has(slotId)) {
        // Only add non-booked slots
        const cellInfo = availabilityMap[dateStr]?.[time];
        if (cellInfo && cellInfo.status !== "booked") {
          newSelectedSlots.add(slotId);
        }
      } else {
        // If already selected, remove it
        newSelectedSlots.delete(slotId);
      }
    });

    setSelectedSlots(newSelectedSlots);
  };

  // Select all slots in a column (same day, all times)
  const handleDayColumnClick = (date) => {
    const dateStr = formatDateISO(date);
    const newSelectedSlots = new Set(selectedSlots);

    // For each time slot, toggle slots for this date
    timeSlots.forEach((time) => {
      const slotId = `${dateStr}-${time}`;

      // Skip already selected slots
      if (!newSelectedSlots.has(slotId)) {
        // Only add non-booked slots
        const cellInfo = availabilityMap[dateStr]?.[time];
        if (cellInfo && cellInfo.status !== "booked") {
          newSelectedSlots.add(slotId);
        }
      } else {
        // If already selected, remove it
        newSelectedSlots.delete(slotId);
      }
    });

    setSelectedSlots(newSelectedSlots);
  };

  // Navigation functions
  const navigateWeek = async (direction) => {
    const newDate = new Date(currentWeekStart);
    newDate.setDate(newDate.getDate() + direction * 7); // +7 for next week, -7 for previous

    // Start loading state
    setIsLoading(true);

    // Safety timeout to reset loading state after 10 seconds
    const loadingTimeout = setTimeout(() => {
      setIsLoading(false);
    }, 1000);

    try {
      // Update the current week date
      setCurrentWeekStart(newDate);

      // Generate new week dates
      const newWeekDates = getWeekDates(newDate);
      setWeekDates(newWeekDates);

      // Fetch new appointment slots using the server action
      const newSlots = await fetchAppointmentSlots(barberId, newDate);

      // Update appointment slots state
      setAppointmentSlots(newSlots);
    } catch (error) {
      console.error("Failed to fetch appointments for new week:", error);
      alert("Failed to load appointments for the selected week.");
    } finally {
      // Clear the safety timeout
      clearTimeout(loadingTimeout);
      // Ensure loading state is reset
      setIsLoading(false);
    }
  };

  const bookedAlertHandle = () => {
    setBookedAlert(true);
    setTimeout(() => {
      setBookedAlert(false);
    }, 3000); // Hide alert after 3 seconds
  };

  // Handle click on a time slot
  const handleSlotClick = (dateStr, time) => {
    // Create unique identifier for this slot
    const slotId = `${dateStr}-${time}`;

    // Toggle selection
    const newSelectedSlots = new Set(selectedSlots);
    if (newSelectedSlots.has(slotId)) {
      newSelectedSlots.delete(slotId);
    } else {
      newSelectedSlots.add(slotId);
    }
    setSelectedSlots(newSelectedSlots);
  };

  // Check if slot is selected
  const isSelected = (dateStr, time) => {
    return selectedSlots.has(`${dateStr}-${time}`);
  };

  const handleSaveSlots = async ({
    addAvailable = false,
    removeAvailable = false,
  }) => {
    if (selectedSlots.size === 0) return;

    setIsSaving(true);

    // Create a copy of the current availability map for rollback
    const previousAvailabilityMap = { ...availabilityMap };

    try {
      const slotsToSave = [];
      const slotsToRemove = [];
      const bookedSlots = [];

      // Separate slots to save and remove based on their current status
      selectedSlots.forEach((slotId) => {
        const lastDash = slotId.lastIndexOf("-");
        const date = slotId.slice(0, lastDash); // "YYYY-MM-DD"
        const time = slotId.slice(lastDash + 1); // "HH:MM"

        const cellInfo = availabilityMap[date]?.[time];
        if (addAvailable && cellInfo?.status === "empty") {
          slotsToSave.push({ date, time });
          // Optimistically mark as available
          availabilityMap[date][time] = { status: "available", slotData: null };
        } else if (removeAvailable && cellInfo?.status === "available") {
          slotsToRemove.push({ date, time });
          // Optimistically mark as empty
          availabilityMap[date][time] = { status: "empty", slotData: null };
        } else if (cellInfo?.status === "booked") {
          bookedSlots.push({ date, time });
          bookedAlertHandle();
        }
      });

      // Update the state optimistically
      setAvailabilityMap({ ...availabilityMap });
      setSelectedSlots(new Set());

      // Call the appropriate server actions
      if (slotsToSave.length > 0) {
        const saveResult = await saveAppointmentSlots(slotsToSave, barberId);
        if (!saveResult.success) {
          throw new Error(`Failed to save slots: ${saveResult.error}`);
        }
      }

      if (slotsToRemove.length > 0) {
        const removeResult = await removeAppointmentSlots(
          slotsToRemove,
          barberId
        );
        if (!removeResult.success) {
          throw new Error(`Failed to remove slots: ${removeResult.error}`);
        }
      }
    } catch (error) {
      console.error("Error saving/removing slots:", error);
      alert("Failed to save/remove slots. Rolling back changes.");
      // Rollback optimistic updates
      setAvailabilityMap(previousAvailabilityMap);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-4xl font-bold mb-6 text-gray-200 ">Calendar</h1>

      {/* Week navigation with loading state */}
      <div className="flex justify-between items-center mb-4 bg-gray-800 p-3 rounded-lg border border-gray-700 shadow-sm">
        <Button
          color="secondary"
          size="small"
          onClick={() => navigateWeek(-1)}
          disabled={isLoading}
          isLoading={isLoading}
        >
          Previous Week
        </Button>

        <div className="font-medium flex flex-col items-center sm: text-sm ml-6">
          {weekDates.length > 0 && (
            <span className="text-gray-200">
              {weekDates[0].toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
              })}{" "}
              -
              {weekDates[6].toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </span>
          )}
        </div>

        <Button
          color="primary-gradient"
          size="small"
          onClick={() => navigateWeek(1)}
          disabled={isLoading}
          isLoading={isLoading}
        >
          Next Week
        </Button>
      </div>

      {/* Calendar grid */}
      <div className="overflow-x-auto relative border border-gray-600 rounded-lg bg-gray-800">
        <div className="grid grid-cols-[70px_repeat(7,minmax(100px,1fr))]">
          {/* Header Row: Empty corner + Days */}
          <div className="sticky top-0 left-0 z-20 bg-gray-700 border-b border-r border-gray-600"></div>
          {weekDates.map((date) => (
            <div
              key={date.toISOString()}
              className="sticky top-0 z-10 bg-gray-700 p-2 text-center text-gray-200 font-semibold border-b border-r border-gray-600 last:border-r-0 cursor-pointer hover:bg-gray-600 transition-colors"
              onClick={() => handleDayColumnClick(date)}
            >
              <div>
                {date.toLocaleDateString("en-US", { weekday: "short" })}
              </div>
              <div className="text-xs font-normal text-gray-400">
                {date.toLocaleDateString("en-US", {
                  month: "numeric",
                  day: "numeric",
                })}
              </div>
            </div>
          ))}

          {/* Time Slot Rows */}
          {timeSlots.map((time) => (
            <React.Fragment key={time}>
              {/* Time Label Column */}
              <div
                className="sticky left-0 z-10 bg-gray-700 p-1 text-center text-xs text-gray-200 font-medium border-r border-b border-gray-600 flex items-center justify-center cursor-pointer hover:bg-gray-600 transition-colors"
                onClick={() => handleTimeRowClick(time)}
              >
                {formatTimeDisplay(time)}
              </div>

              {/* Calendar Cells for this time slot */}
              {weekDates.map((date) => {
                const dateStr = formatDateISO(date);
                const cellInfo = availabilityMap[dateStr]?.[time] || {
                  status: "empty",
                };

                // Check if this slot is selected
                const slotSelected = isSelected(dateStr, time);

                // Determine animation state
                let animationState = cellInfo.status;
                if (slotSelected) {
                  animationState = "selected";
                }

                return (
                  <motion.div
                    key={`${dateStr}-${time}`}
                    className={`h-8 border-b border-r border-gray-600 last:border-r-0 flex items-center justify-center cursor-pointer ${
                      cellInfo.status === "empty"
                        ? "bg-gray-750 hover:bg-gray-700"
                        : cellInfo.status === "available"
                        ? "bg-green-900 hover:bg-green-800"
                        : "bg-red-900 hover:bg-red-800"
                    }`}
                    onClick={() => handleSlotClick(dateStr, time)}
                    title={`Click to select ${formatTimeDisplay(
                      time
                    )} on ${dateStr}`}
                    initial={false}
                    animate={animationState}
                    variants={cellVariants}
                    layoutId={`cell-${dateStr}-${time}`}
                  >
                    <AnimatePresence mode="wait">
                      {cellInfo.status === "available" && (
                        <motion.span
                          key="available"
                          className="text-xs text-green-300 font-medium"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                        >
                          Available
                        </motion.span>
                      )}
                      {cellInfo.status === "booked" && (
                        <motion.span
                          key="booked"
                          className="text-xs text-red-300 font-medium"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                        >
                          Booked
                        </motion.span>
                      )}
                      {slotSelected && cellInfo.status === "empty" && (
                        <motion.span
                          key="selected-dot"
                          className="h-2 w-2 rounded-full bg-blue-400"
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          exit={{ scale: 0 }}
                        />
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              })}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Action buttons for selected slots */}
      <div className="mb-6 p-4 bg-gray-800 border border-gray-700 rounded-lg shadow-sm">
        <div className="flex items-center mb-4">
          <div className="bg-gray-700 px-3 py-1.5 rounded-full shadow-sm border border-gray-600 flex items-center">
            <span className="text-lg font-medium text-blue-400">
              {selectedSlots.size}
            </span>
            <span className="ml-2 text-sm text-gray-300">
              time slot{selectedSlots.size !== 1 ? "s" : ""} selected
            </span>
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          <Button
            color="primary-gradient"
            size="medium"
            onClick={() => handleSaveSlots({ addAvailable: true })}
            disabled={isSaving}
            isLoading={isSaving}
            leftIcon={
              <svg
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                />
              </svg>
            }
          >
            Add Selected Slots
          </Button>

          <Button
            color="danger-gradient"
            size="medium"
            onClick={() => handleSaveSlots({ removeAvailable: true })}
            disabled={isSaving}
            isLoading={isSaving}
            leftIcon={
              <svg
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                />
              </svg>
            }
          >
            Remove Selected Slots
          </Button>

          <Button
            color="secondary"
            size="medium"
            onClick={() => setSelectedSlots(new Set())}
            disabled={isSaving}
            leftIcon={
              <svg
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            }
          >
            Clear Selection
          </Button>
        </div>
      </div>

      <AnimatePresence>
        {bookedAlert && (
          <motion.div
            key="booked-alert"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="mb-4 p-2 bg-red-900 border border-red-600 rounded-md"
          >
            <p className="mb-2 text-red-300">You cannot remove booked slots.</p>
          </motion.div>
        )}
      </AnimatePresence>
      <div suppressHydrationWarning>
        <BulkScheduler barberId={barberId}></BulkScheduler>
      </div>
    </div>
  );
}
