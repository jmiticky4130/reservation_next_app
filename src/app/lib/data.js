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

export async function getAllBarbers() {
  try {
    const barbers = await sql`
      SELECT 
        id,
        name,
        email,
        isadmin
      FROM barbers
      ORDER BY id DESC
    `;
    return barbers || [];
  } catch (error) {
    console.error("Database error:", error);
    throw new Error("Failed to fetch barbers");
  }
}

export async function getBarberAppointments(barberId, startDate = new Date()) {
  try {
    const start = new Date(startDate);
    start.setHours(0, 0, 0, 0);
    
    const end = new Date(start);
    end.setDate(end.getDate() + 30); // 30 days from start date
    
    const startStr = formatDateISO(start);
    const endStr = formatDateISO(end);

    const appointmentSlots = await sql`
      SELECT 
        ap.day::text,
        ap.start_time::text,
        ap.customer_id,
        ap.service_id,
        s.name as service_name,
        s.duration_minutes as service_duration,
        s.price as service_price,
        c.name as customer_name,
        c.email as customer_email
      FROM appointment_slots ap
      JOIN customers c ON c.id = ap.customer_id
      JOIN services s ON s.id = ap.service_id
      WHERE ap.barber_id = ${barberId}
        AND ap.day >= ${startStr}
        AND ap.day < ${endStr}
        AND ap.customer_id IS NOT NULL
      ORDER BY ap.day, ap.start_time
    `;

    
    // Group slots by unique appointment (customer + day + service)
    const appointmentMap = new Map();
    
    for (const slot of appointmentSlots) {
      const appointmentKey = `${slot.customer_id}_${slot.day}_${slot.service_id}`;
      
      if (!appointmentMap.has(appointmentKey)) {
        appointmentMap.set(appointmentKey, {
          slots: [],
          ...slot
        });
      }
      
      appointmentMap.get(appointmentKey).slots.push(slot);
    }


    // Convert to final appointment format
    const appointments = [];
    
    for (const [key, appointmentData] of appointmentMap) {
      // Sort slots by time to get the earliest start time
      appointmentData.slots.sort((a, b) => a.start_time.localeCompare(b.start_time));
      
      const firstSlot = appointmentData.slots[0];
      const slotsNeeded = Math.ceil(appointmentData.service_duration / 15);
      
      // Calculate end time based on service duration
      const startTime = new Date(`1970-01-01T${firstSlot.start_time}`);
      const endTime = new Date(startTime.getTime() + (appointmentData.service_duration * 60 * 1000));
      const endTimeString = endTime.toTimeString().slice(0, 5);

      appointments.push({
        id: `${firstSlot.customer_id}_${firstSlot.day}_${firstSlot.start_time}`,
        day: firstSlot.day,
        start_time: firstSlot.start_time,
        end_time: endTimeString,
        time_range: `${firstSlot.start_time} - ${endTimeString}`,
        customer_id: firstSlot.customer_id,
        customer_name: firstSlot.customer_name,
        customer_email: firstSlot.customer_email,
        service_id: firstSlot.service_id,
        service_name: firstSlot.service_name,
        service_duration: appointmentData.service_duration,
        service_price: appointmentData.service_price,
        slots_count: slotsNeeded,
        actual_slots_found: appointmentData.slots.length
      });
    }


    return appointments || [];
  } catch (error) {
    console.error("Database error:", error);
    throw new Error("Failed to fetch barber appointments");
  }
}

export async function getBarberDetails(barberId) {
  try {
    const barber = await sql`
      SELECT 
        id,
        name,
        email,
        isadmin
      FROM barbers
      WHERE id = ${barberId}
      LIMIT 1
    `;
    return barber[0] || null;
  } catch (error) {
    console.error("Database error:", error);
    throw new Error("Failed to fetch barber details");
  }
}

export async function getAllCustomers() {
  try {
    const customers = await sql`
      SELECT 
        id,
        name,
        email
      FROM customers
      ORDER BY name ASC
    `;
    return customers || [];
  } catch (error) {
    console.error("Database error:", error);
    throw new Error("Failed to fetch customers");
  }
}

export async function getTodaysAppointments() {
  try {
    const today = new Date();
    const todayStr = formatDateISO(today);

    const appointments = await sql`
      SELECT 
        ap.day::text,
        ap.start_time::text,
        ap.customer_id,
        c.name as customer_name,
        c.email as customer_email,
        b.name as barber_name,
        b.id as barber_id
      FROM appointment_slots ap
      JOIN customers c ON c.id = ap.customer_id
      JOIN barbers b ON b.id = ap.barber_id
      WHERE ap.day = ${todayStr}
        AND ap.customer_id IS NOT NULL
      ORDER BY b.name, ap.start_time
    `;

    return appointments || [];
  } catch (error) {
    console.error("Database error:", error);
    throw new Error("Failed to fetch today's appointments");
  }
}


export async function getAllServices() {
  try {
    const services = await sql`
      SELECT id, name, duration_minutes, price, description
      FROM services
      ORDER BY name
    `;
    return services || [];
  } catch (error) {
    console.error("Database error:", error);
    throw new Error("Failed to fetch services");
  }
}

export async function getBarberServices(barberId) {
  try {
    const barberServices = await sql`
      SELECT bs.*, s.name, s.duration_minutes, s.price, s.description
      FROM barber_services bs
      JOIN services s ON s.id = bs.service_id
      WHERE bs.barber_id = ${barberId}
      ORDER BY s.name
    `;
    return barberServices || [];
  } catch (error) {
    console.error("Database error:", error);
    throw new Error("Failed to fetch barber services");
  }
}
