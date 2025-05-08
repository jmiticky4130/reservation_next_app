/**
 * Generates an array of Date objects for the 7 days starting from the given date.
 * @param {Date} startDate - The starting date for the week.
 * @returns {Date[]} An array of 7 Date objects.
 */
export function getWeekDates(startDate) {
    const dates = [];
    const current = new Date(startDate);
    current.setHours(0, 0, 0, 0); // Normalize to start of day
    for (let i = 0; i < 7; i++) {
        const date = new Date(current);
        date.setDate(current.getDate() + i);
        dates.push(date);
    }
    return dates;
}

/**
 * Generates time slots in HH:MM format for a given range and interval.
 * @param {number} startHour - The starting hour (e.g., 7 for 7 AM).
 * @param {number} endHour - The ending hour (exclusive, e.g., 19 for up to 6:45 PM).
 * @param {number} intervalMinutes - The interval in minutes (e.g., 15).
 * @returns {string[]} An array of time strings (e.g., ["07:00", "07:15", ...]).
 */
export function generateTimeSlots(startHour = 7, endHour = 19, intervalMinutes = 90) {
    const slots = [];
    const startTime = startHour * 60;
    const endTime = endHour * 60;
    for (let minutes = startTime; minutes < endTime; minutes += intervalMinutes) {
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        const timeString = `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;
        slots.push(timeString);
    }
    return slots;
}

/**
 * Formats a Date object into 'YYYY-MM-DD' string format.
 * @param {Date} date - The date object.
 * @returns {string} The formatted date string.
 */
export function formatDateISO(date) {
    // Use local time, not UTC
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

/**
 * Formats a time string 'HH:MM' or 'HH:MM:SS' into a display format (e.g., "7:15 AM").
 * @param {string} timeString - The time string.
 * @returns {string} The formatted time string for display.
 */
export function formatTimeDisplay(timeString) {
    if (!timeString) return '';
    const [hours, minutes] = timeString.split(':');
    const hourNum = parseInt(hours, 10);
    const isPM = hourNum >= 12;
    const displayHour = hourNum % 12 || 12;
    return `${displayHour}:${minutes} ${isPM ? 'PM' : 'AM'}`;
}

/**
 * Converts a time string 'HH:MM:SS' or 'HH:MM' to minutes since midnight.
 * @param {string} timeStr - The time string.
 * @returns {number} Minutes since midnight.
 */
export function timeToMinutes(timeStr) {
    if (!timeStr) return 0;
    const [hours = 0, minutes = 0] = timeStr.split(':').map(Number);
    return hours * 60 + minutes;
}

/**
 * Converts a PostgreSQL interval string 'HH:MM:SS' to total minutes.
 * @param {string} intervalStr - The interval string.
 * @returns {number} Total minutes in the interval.
 */
export function intervalToMinutes(intervalStr) {
    if (!intervalStr) return 0;
    const [hours = 0, minutes = 0] = intervalStr.split(':').map(Number);
    return hours * 60 + minutes;
}