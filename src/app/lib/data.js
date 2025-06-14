"use server";
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

export async function fetchCustomerByEmail(email) {
  try {
    const customer = await sql`
    SELECT * FROM customers
    WHERE email = ${email}
    LIMIT 1
  `;
    return customer[0] || null;
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
    if (barberId === 0) {
      end.setDate(end.getDate() + 60); // 60 days in advance for all possible appointment
    } else {
      end.setDate(end.getDate() + 7); // 7 days in advance for a specific barber for barber calendar
    }

    // Format dates for SQL query
    const startStr = formatDateISO(start);
    const endStr = formatDateISO(end);
    let slots;
    if (barberId === 0) {
      slots = await sql`
      SELECT 
        day::text,
        barber_id, 
        customer_id, 
        start_time::text
      FROM appointment_slots
      WHERE day >= ${startStr}
      AND day < ${endStr}
      AND customer_id IS NULL
      ORDER BY day, start_time
    `;
    } else {
      slots = await sql`
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
    }

    return slots || [];
  } catch (error) {
    console.error("Database error:", error);
    throw new Error("Failed to fetch appointment slots");
  }
}

export async function getBarbersServices() {
  try {
    const services = await sql`
      SELECT * FROM services
      ORDER BY duration_minutes ASC
    `;

    const barberServices = await sql`
      SELECT bs.* , b.name FROM barber_services bs
      join barbers b on b.id = bs.barber_id
      `;

    return {
      services: services || [],
      barberServices: barberServices || [],
    };
  } catch (error) {
    console.error("Database error:", error);
    throw new Error("Failed to fetch services");
  }
}
