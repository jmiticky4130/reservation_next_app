'use server';
import postgres from "postgres";
import { formatDateISO } from "../util/formatFunctions";

const sql = postgres(process.env.DATABASE_URL, { ssl: "verify-full" });

export async function fetchBarberByEmail(email) {
  try {
    const barber = await sql`
        SELECT * FROM barbers
        WHERE email = ${email}
        LIMIT 1
      `;
    return barber[0] || null;
  } catch (error) {
    console.error("Database error:", error);
    throw new Error("Failed to fetch users");
  }
}

export async function fetchBarberById(id) {
  try {
    const barber = await sql`
        SELECT name FROM barbers
        WHERE id = ${id}
        LIMIT 1
      `;
    return barber[0] || null;
  } catch (error) {
    console.error("Database error:", error);
    throw new Error("Failed to fetch users");
  }
}

export async function fetchAppointmentSlots(barberId, startDate = new Date()) {
  try {
    // Create a date range for the week
    const start = new Date(startDate);
    start.setHours(0, 0, 0, 0);
    
    const end = new Date(start);
    end.setDate(end.getDate() + 7);
    
    // Format dates for SQL query
    const startStr = formatDateISO(start);
    const endStr = formatDateISO(end);
    
    const slots = await sql`
      SELECT 
        day::text,
        barber_id, 
        customer_id, 
        start_time::text
      FROM appointment_slots
      WHERE barber_id = ${barberId}
      AND day >= ${startStr}
      AND day < ${endStr}
      ORDER BY day, start_time
    `;
    
    return slots || [];
  } catch (error) {
    console.error("Database error:", error);
    throw new Error("Failed to fetch appointment slots");
  }
}