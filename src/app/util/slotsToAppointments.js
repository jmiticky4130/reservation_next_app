/**
 * Utility: parse a "HH:mm:ss" or "HH:mm" string into minutes since midnight.
 */
function parseTimeToMinutes(timeStr) {
  // Supports "HH:mm" or "HH:mm:ss"
  const [hourStr, minuteStr] = timeStr.split(":");
  return parseInt(hourStr, 10) * 60 + parseInt(minuteStr, 10);
}

/**
 * Utility: convert minutes‐since‐midnight back to "HH:mm" format.
 */
function formatMinutesToHHMM(totalMinutes) {
  const hh = Math.floor(totalMinutes / 60).toString().padStart(2, "0");
  const mm = (totalMinutes % 60).toString().padStart(2, "0");
  return `${hh}:${mm}`;
}



export function groupSlotsByBarberAndDay(slots) {
  // Step A: bucket slots by "barber_id" + "day"
  const buckets = new Map();
  
  slots.forEach(({ day, barber_id, start_time }) => {
    const key = `${barber_id}||${day}`;
    if (!buckets.has(key)) {
      buckets.set(key, []);
    }
    // Store just the raw start_time string; we’ll parse/merge later
    buckets.get(key).push(start_time.slice(0, 5)); // take "HH:mm"
  });

  const result = [];

  // Step B: for each bucket, sort times and merge consecutive 15-min blocks
  for (const [key, times] of buckets.entries()) {
    const [barberIdStr, date] = key.split("||");
    const barberId = parseInt(barberIdStr, 10);

    // Convert "HH:mm" → minutes, sort ascending
    const minutesArray = times
      .map((t) => parseTimeToMinutes(t))
      .sort((a, b) => a - b);

    const intervals = [];
    let intervalStart = null;
    let previousStart = null;

    for (let i = 0; i < minutesArray.length; i++) {
      const current = minutesArray[i];

      if (intervalStart === null) {
        // first slot in a new interval
        intervalStart = current;
        previousStart = current;
      } else {
        // check if current slot is exactly 15 min after the previous
        if (current === previousStart + 15) {
          // still continuous; just extend
          previousStart = current;
        } else {
          // gap detected → close previous interval and start a new one
          intervals.push({
            from: formatMinutesToHHMM(intervalStart),
            to: formatMinutesToHHMM(previousStart + 15),
          });
          intervalStart = current;
          previousStart = current;
        }
      }
    }
    // after looping, close the last open interval (if any)
    if (intervalStart !== null) {
      intervals.push({
        from: formatMinutesToHHMM(intervalStart),
        to: formatMinutesToHHMM(previousStart + 15),
      });
    }

    result.push({ barberId, date, intervals });
  }

  return result;
}

export function getAvailableCombinations(groupedData, barberId, duration) {
  if (![15, 30, 45].includes(duration)) {
    throw new Error("Duration must be one of [15, 30, 45] minutes.");
  }

  const STEP = 15; // minutes
  const matches = [];

  if (barberId === null || barberId === 0) {
    // Handle "Any Barber" case - calculate for all barbers and resolve conflicts
    const allMatches = [];
    
    // First, collect all possible appointments from all barbers
    for (const entry of groupedData) {
      const { barberId: currentBarberId, date, intervals } = entry;

      intervals.forEach(({ from, to }) => {
        const fromMin = parseTimeToMinutes(from);
        const toMin = parseTimeToMinutes(to);

        // If the interval is shorter than requested duration, skip
        if (toMin - fromMin < duration) return;

        // Slide a window of size `duration` from `fromMin` up to `toMin - duration`
        for (
          let windowStart = fromMin;
          windowStart + duration <= toMin;
          windowStart += STEP
        ) {
          const windowEnd = windowStart + duration;
          allMatches.push({
            barberId: currentBarberId,
            date,
            from: formatMinutesToHHMM(windowStart),
            to: formatMinutesToHHMM(windowEnd),
          });
        }
      });
    }

    // Group by date and time to find conflicts
    const timeSlotMap = new Map();
    
    allMatches.forEach(match => {
      const key = `${match.date}-${match.from}-${match.to}`;
      
      if (!timeSlotMap.has(key)) {
        timeSlotMap.set(key, []);
      }
      
      timeSlotMap.get(key).push(match);
    });

    // Resolve conflicts by selecting barber with lower ID
    timeSlotMap.forEach(conflictingMatches => {
      if (conflictingMatches.length > 1) {
        // Sort by barberId and take the one with the lowest ID
        conflictingMatches.sort((a, b) => a.barberId - b.barberId);
        matches.push(conflictingMatches[0]);
      } else {
        // No conflict, add the single match
        matches.push(conflictingMatches[0]);
      }
    });

  } else {
    // Handle specific barber case (original logic)
    for (const entry of groupedData) {
      if (entry.barberId !== barberId) continue;

      const { date, intervals } = entry;

      intervals.forEach(({ from, to }) => {
        const fromMin = parseTimeToMinutes(from);
        const toMin = parseTimeToMinutes(to);

        // If the interval is shorter than requested duration, skip
        if (toMin - fromMin < duration) return;

        // Slide a window of size `duration` from `fromMin` up to `toMin - duration`
        for (
          let windowStart = fromMin;
          windowStart + duration <= toMin;
          windowStart += STEP
        ) {
          const windowEnd = windowStart + duration;
          matches.push({
            date,
            from: formatMinutesToHHMM(windowStart),
            to: formatMinutesToHHMM(windowEnd),
          });
        }
      });
    }
  }

  return matches;
}