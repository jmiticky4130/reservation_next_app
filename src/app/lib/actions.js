"use server";
// NEED TO ADD ZOD VALIDATION
// NEED TO ADD ZOD VALIDATION
// NEED TO ADD ZOD VALIDATION
// NEED TO ADD ZOD VALIDATION
// NEED TO ADD ZOD VALIDATION
// NEED TO ADD ZOD VALIDATION
import bcrypt from "bcryptjs";
import postgres from "postgres";
import { signIn } from "@/auth";
import { auth } from "@/auth";
import {
  groupSlotsByBarberAndDay,
  getAvailableCombinations,
} from "@/app/util/slotsToAppointments";

const sql = postgres(process.env.DATABASE_URL, { ssl: "verify-full" });

export async function userEmailExists(email, role) {
  if (!email) {
    return { error: "Email is required" };
  }

  let emailExists;

  if (role === "barber") {
    emailExists = await sql`
      SELECT EXISTS(
        SELECT 1 FROM barbers WHERE email = ${email}
      ) AS exists
    `;
  } else {
    emailExists = await sql`
      SELECT EXISTS(
        SELECT 1 FROM customers WHERE email = ${email}
      ) AS exists
    `;
  }

  return { exists: emailExists[0].exists };
}


export async function registerUser(name, email, password, role) {
  if (!name || !email || !password) {
    return { error: "All fields are required" };
  }

  if (password.length < 6) {
    return { error: "Password must be at least 6 characters" };
  }
  const isBarber = role === "barber";
  const res = await userEmailExists(email, role);
  if (res.exists) {
    return { error: "Email already exists" };
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    let id;
    let newUser;
    if (isBarber) {

      await sql.begin(async (sql) => {
        newUser = await sql`
        INSERT INTO barbers (name, email, password_hash, role)
        VALUES (${name}, ${email}, ${hashedPassword}, 'admin')
        RETURNING id`;
      });

    } else {

      await sql.begin(async (sql) => {
        newUser = await sql`
        INSERT INTO customers (name, email, password_hash)
        VALUES (${name}, ${email}, ${hashedPassword})
        RETURNING id`;
      });
    }

    return { success: true, id: newUser[0].id };
  } catch (error) {
    console.error("Registration error:", error);
    return { error: "An unexpected error occurred during registration" };
  }
}

function generateTimeSlots(fromTime, toTime) {
  const slots = [];
  
  // Parse time strings (e.g., "09:00" -> { hours: 9, minutes: 0 })
  const parseTime = (timeStr) => {
    const [hours, minutes] = timeStr.split(':').map(Number);
    return { hours, minutes };
  };
  
  // Convert time object to minutes since midnight for easier calculation
  const timeToMinutes = ({ hours, minutes }) => hours * 60 + minutes;
  
  // Convert minutes back to time string
  const minutesToTimeString = (totalMinutes) => {
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  };
  
  const startTime = parseTime(fromTime);
  const endTime = parseTime(toTime);
  
  const startMinutes = timeToMinutes(startTime);
  const endMinutes = timeToMinutes(endTime);
  
  // Generate 15-minute slots
  for (let currentMinutes = startMinutes; currentMinutes < endMinutes; currentMinutes += 15) {
    slots.push(minutesToTimeString(currentMinutes));
  }
  
  return slots;
}

// Updated createUserAppointment function with multiple slot support
export async function createUserAppointment(userId, appointmentData) {
  try {
    const { selectedBarberId, date, from, to } = appointmentData;
    
    console.log("Creating appointment for user:", userId, "on", date, "from", from, "to", to, "barberId:", selectedBarberId);
    
    // Generate all time slots that need to be updated
    const timeSlots = generateTimeSlots(from, to);
    console.log("Time slots to update:", timeSlots);
    
    if (timeSlots.length === 0) {
      return { error: "Invalid time range - no slots to book" };
    }
    
    // Use transaction to ensure all slots are updated together
    let updatedSlots;
    
    await sql.begin(async (sql) => {
      const results = [];
      
      // Update each time slot
      for (const timeSlot of timeSlots) {
        const result = await sql`
          UPDATE appointment_slots 
          SET customer_id = ${userId}
          WHERE day = ${date} 
            AND barber_id = ${selectedBarberId} 
            AND start_time = ${timeSlot}
            AND customer_id IS NULL
          RETURNING *
        `;
        
        if (result.length === 0) {
          throw new Error(`Slot ${timeSlot} is not available or already booked`);
        }
        
        results.push(result[0]);
      }
      
      updatedSlots = results;
    });

    console.log("Appointment slots updated:", updatedSlots);

    return { 
      success: true, 
      appointment: updatedSlots,
      slotsCount: timeSlots.length,
      timeRange: `${from} - ${to}`
    };
    
  } catch (error) {
    console.error("Error booking appointment:", error);
    
    // Provide more specific error messages
    if (error.message.includes('not available')) {
      return { error: error.message };
    }
    
    return { error: "Failed to book appointment - some slots may not be available" };
  }
}

export async function registerAndLogin(name, email, password, role) {
  // First register the user
  const result = await registerUser(name, email, password, role);
  console.log("Registration result:", result);
  if (result.success) {
    try {
      await signIn("credentials", {
        email,
        password,
        role,
        redirect: false,
      });

      return { success: true, id: result.id };
    } catch (error) {
      console.error("Server-side login error:", error);
      return {
        success: true,
        autoLoginFailed: true,
        message: "Account created but login failed",
      };
    }
  }

  return result;
}

export async function handleLogin(formData, role) {
  const email = formData.get("email");
  const password = formData.get("password");

  if (!email || !password) {
    return { error: "Email and password are required" };
  }

  try {
    const response = await signIn("credentials", {
      email,
      password,
      role,
      redirect: false,
    });

    if (response?.error) {
      return { error: "Invalid email or password" };
    }

    return { success: true };
  } catch (error) {
    console.error("Login error:", error);
    return { error: "An unexpected error occurred" };
  }
}

// Save new appointment slots
export async function saveAppointmentSlots(slots, barberId) {
  const session = await auth();
  if (!session?.user || session.user.id !== barberId) {
    return { success: false, error: "Unauthorized" };
  }

  const results = [];
  for (const slot of slots) {
    const inserted = await sql`
      INSERT INTO appointment_slots (day, barber_id, start_time)
      VALUES (${slot.date}, ${barberId}, ${slot.time})
      ON CONFLICT (day, start_time, barber_id) DO NOTHING
      RETURNING *
    `;
    if (inserted.length) results.push(inserted[0]);
  }

  return {
    success: true,
    message: `Added ${results.length} slot(s)`,
    results,
  };
}

export async function removeAppointmentSlots(slots, barberId) {
  const session = await auth();
  if (!session?.user || session.user.id !== barberId) {
    return { success: false, error: "Unauthorized" };
  }

  const results = [];
  for (const slot of slots) {
    const removed = await sql`
      DELETE FROM appointment_slots
      WHERE day = ${slot.date}
        AND barber_id = ${barberId}
        AND start_time = ${slot.time}
      RETURNING *
    `;
    if (removed.length) results.push(removed[0]);
  }

  return {
    success: true,
    message: `Removed ${results.length} slot(s)`,
    results,
  };
}

export async function calculateAllAvailableAppointments(
  actionMinutes,
  barberId = 0
) {
  try {
    const startDate = new Date();

    const groupedData = groupSlotsByBarberAndDay(slots);
    return getAvailableCombinations(groupedData, barberId, actionMinutes);
  } catch (error) {
    console.error("Error fetching appointment slots:", error);
    throw new Error("Failed to fetch appointment slots");
  }
}
