"use server";
// NEED TO ADD ZOD VALIDATION
import bcrypt from "bcryptjs";
import postgres from "postgres";
import { signIn } from "@/auth";
import { auth } from "@/auth";
import {
  sendVerificationCode,
  sendBarberNotification,
  sendCustomerConfirmation,
  sendBarberCancellationNotification,
  sendCustomerCancellationNotification
} from "@/app/lib/emails";
import {
  groupSlotsByBarberAndDay,
  getAvailableCombinations,
} from "@/app/util/slotsToAppointments";
import { revalidatePath } from "next/cache";

const sql = postgres(process.env.DATABASE_URL, { ssl: "verify-full" });

export async function sendVerificationCodeAction(email) {
  try {
    const result = await sendVerificationCode(email);
    
    if (result.success) {
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes expiration

      await sql`
        INSERT INTO email_verification_codes (email, code, expires_at)
        VALUES (${email}, ${result.code}, ${expiresAt})
      `;

      return { success: true };
    }

    return result;
  } catch (error) {
    console.error("Error in sendVerificationCodeAction:", error);
    return {
      error: "Failed to send verification code. Please try again later.",
    };
  }
}

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

export async function createUserAppointment(userId, appointmentData) {
  try {
    const { selectedBarberId, date, from, to, serviceId } = appointmentData;


    const existingAppointment = await sql`
      SELECT COUNT(*) as count 
      FROM appointment_slots 
      WHERE customer_id = ${userId} 
        AND day = ${date}
    `;

    if (existingAppointment[0].count > 0) {
      return { 
        error: "You already have an appointment booked for this date. Only one appointment per day is allowed." 
      };
    }

    // Generate all time slots that need to be updated
    const timeSlots = generateTimeSlots(from, to);
    console.log("Time slots to update:", timeSlots);

    if (timeSlots.length === 0) {
      return { error: "Invalid time range - no slots to book" };
    }

    let updatedSlots;
    let customerInfo;
    let barberInfo;

    await sql.begin(async (sql) => {
      const results = [];

      // Update each time slot
      for (const timeSlot of timeSlots) {
        const result = await sql`
          UPDATE appointment_slots 
          SET customer_id = ${userId},service_id = ${serviceId}
          WHERE day = ${date} 
            AND barber_id = ${selectedBarberId} 
            AND start_time = ${timeSlot}
            AND customer_id IS NULL
          RETURNING *
        `;

        if (result.length === 0) {
          throw new Error(
            `Slot ${timeSlot} is not available or already booked`
          );
        }

        results.push(result[0]);
      }

      // Get customer information for the email
      const customerResult = await sql`
        SELECT id, name, email FROM customers WHERE id = ${userId}
      `;

      // Get barber information for the email
      const barberResult = await sql`
        SELECT id, name, email FROM barbers WHERE id = ${selectedBarberId}
      `;

      if (customerResult.length === 0 || barberResult.length === 0) {
        throw new Error("Customer or barber not found");
      }

      updatedSlots = results;
      customerInfo = customerResult[0];
      barberInfo = barberResult[0];
    });

    // Send both email notifications AFTER successful database transaction
    const appointmentDetails = {
      date,
      timeRange: `${from} - ${to}`,
      slotsCount: timeSlots.length,
      timeSlots,
    };

    try {
      // Send notification to barber
      await sendBarberNotification({
        barber: barberInfo,
        customer: customerInfo,
        appointmentDetails,
      });
      console.log("Barber notification sent successfully");

      // Send confirmation to customer - pass sql for database operations
      await sendCustomerConfirmation({
        customer: customerInfo,
        barber: barberInfo,
        appointmentDetails,
        sql, // Pass sql connection
      });
      console.log("Customer confirmation sent successfully");

    } catch (emailError) {
      console.error("Failed to send email notifications:", emailError);
    }

    console.log("Appointment slots updated:", updatedSlots);

    return {
      success: true,
      appointment: updatedSlots,
      slotsCount: timeSlots.length,
      timeRange: `${from} - ${to}`,
    };
  } catch (error) {
    console.error("Error booking appointment:", error);

    // Provide more specific error messages
    if (error.message.includes("not available")) {
      return { error: error.message };
    }

    return {
      error: "Failed to book appointment - some slots may not be available",
    };
  }
}

export async function registerAndLogin(name, email, password, role, code) {
  try {
    // First verify the email code
    const rows = await sql`
      SELECT * FROM email_verification_codes
      WHERE email = ${email} AND code = ${code}
      ORDER BY created_at DESC
      LIMIT 1
    `;

    const record = rows[0];

    if (!record) {
      return { error: "Invalid verification code" };
    }

    if (new Date() > record.expires_at) {
      return { error: "Verification code has expired" };
    }

    // Delete the verification code after successful verification
    await sql`
      DELETE FROM email_verification_codes WHERE email = ${email}
    `;

    // Register the user
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
      } catch (loginError) {
        console.error("Server-side login error:", loginError);
        return {
          success: true,
          autoLoginFailed: true,
          message:
            "Account created successfully but automatic login failed. Please login manually.",
        };
      }
    }

    return result;
  } catch (error) {
    console.error("Error in registerAndLogin:", error);

    // Handle specific database errors
    if (error.message.includes("duplicate key value")) {
      return { error: "Email already exists. Please use a different email." };
    }

    if (error.message.includes("connection")) {
      return { error: "Database connection error. Please try again later." };
    }

    // Generic error for any other issues
    return {
      error:
        "An unexpected error occurred during registration. Please try again.",
    };
  }
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
    let slots;
    
    if (barberId === 0) {
      slots = await sql`
        SELECT DISTINCT
          s.day, 
          s.barber_id, 
          s.start_time
        FROM appointment_slots s
        JOIN barbers b ON b.id = s.barber_id
        JOIN barber_services bs ON bs.barber_id = s.barber_id
        JOIN services srv ON srv.id = bs.service_id
        WHERE s.customer_id IS NULL
          AND s.day >= CURRENT_DATE
          AND srv.duration_minutes = ${actionMinutes}
        ORDER BY s.day, s.barber_id, s.start_time
      `;
    } else {
      slots = await sql`
        SELECT s.day, s.barber_id, s.start_time
        FROM appointment_slots s
        WHERE s.customer_id IS NULL
          AND s.day >= CURRENT_DATE
          AND s.barber_id = ${barberId}
        ORDER BY s.day, s.barber_id, s.start_time
      `;
    }

    // Convert database results to proper format
    const formattedSlots = slots.map(slot => ({
      day: slot.day.toISOString().split('T')[0], // Convert to YYYY-MM-DD
      barber_id: slot.barber_id,
      start_time: slot.start_time
    }));

    const groupedData = groupSlotsByBarberAndDay(formattedSlots);
    return getAvailableCombinations(groupedData, barberId, actionMinutes);
  } catch (error) {
    console.error("Error fetching appointment slots:", error);
    throw new Error("Failed to fetch appointment slots");
  }
}

function generateTimeSlots(fromTime, toTime) {
  const slots = [];

  // Parse time strings (e.g., "09:00" -> { hours: 9, minutes: 0 })
  const parseTime = (timeStr) => {
    const [hours, minutes] = timeStr.split(":").map(Number);
    return { hours, minutes };
  };

  // Convert time object to minutes since midnight for easier calculation
  const timeToMinutes = ({ hours, minutes }) => hours * 60 + minutes;

  // Convert minutes back to time string
  const minutesToTimeString = (totalMinutes) => {
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    return `${hours.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")}`;
  };

  const startTime = parseTime(fromTime);
  const endTime = parseTime(toTime);

  const startMinutes = timeToMinutes(startTime);
  const endMinutes = timeToMinutes(endTime);

  // Generate 15-minute slots
  for (
    let currentMinutes = startMinutes;
    currentMinutes < endMinutes;
    currentMinutes += 15
  ) {
    slots.push(minutesToTimeString(currentMinutes));
  }

  return slots;
}

export async function cancelAppointmentWithToken(token) {
  try {
    // Verify the token and get appointment details
    const tokenResult = await sql`
      SELECT act.*, c.name as customer_name, c.email as customer_email
      FROM appointment_cancellation_tokens act
      JOIN customers c ON c.id = act.customer_id
      WHERE act.token = ${token} 
        AND act.used = FALSE 
        AND act.expires_at > NOW()
    `;

    if (tokenResult.length === 0) {
      return { error: "Invalid or expired cancellation link" };
    }

    const tokenData = tokenResult[0];
    const { appointment_id, customer_id } = tokenData;

    // Parse appointment ID to get details
    const [customerId, date, timeRange] = appointment_id.split('_');
    const [startTime, endTime] = timeRange.split(' - ');

    // Generate time slots to clear
    const timeSlots = generateTimeSlots(startTime, endTime);

    let barberInfo;
    let cancelledSlots;

    await sql.begin(async (sql) => {
      // Clear the appointment slots
      const results = [];
      for (const timeSlot of timeSlots) {
        const result = await sql`
          UPDATE appointment_slots 
          SET customer_id = NULL, service_id = NULL
          WHERE day = ${date} 
            AND customer_id = ${customer_id}
            AND start_time = ${timeSlot}
          RETURNING *
        `;
        results.push(...result);
      }

      // Get barber info for notification
      if (results.length > 0) {
        const barberResult = await sql`
          SELECT name, email FROM barbers WHERE id = ${results[0].barber_id}
        `;
        barberInfo = barberResult[0];
      }

      // Mark token as used
      await sql`
        UPDATE appointment_cancellation_tokens 
        SET used = TRUE 
        WHERE token = ${token}
      `;

      cancelledSlots = results;
    });

    // Send cancellation notification to barber
    if (barberInfo && cancelledSlots.length > 0) {
      try {
        await sendBarberCancellationNotification({
          barber: barberInfo,
          customer: { name: tokenData.customer_name, email: tokenData.customer_email },
          appointmentDetails: {
            date,
            timeRange,
            slotsCount: timeSlots.length
          }
        });
      } catch (emailError) {
        console.error("Failed to send cancellation notification:", emailError);
      }
    }

    return {
      success: true,
      appointmentDetails: {
        date: new Date(date).toLocaleDateString('en-US', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        }),
        timeRange,
        barberName: barberInfo?.name || 'Unknown'
      }
    };

  } catch (error) {
    console.error("Error cancelling appointment:", error);
    return { error: "Failed to cancel appointment" };
  }
}

export async function createBarber(formData) {
  const session = await auth();
  
  // Only admins can create barbers
  if (!session?.user?.isAdmin) {
    return { error: "Unauthorized - Admin access required" };
  }

  const name = formData.get("name");
  const email = formData.get("email");
  const password = formData.get("password");
  const serviceIds = formData.getAll("services"); // Get all selected service IDs

  // Validation
  if (!name || !email || !password) {
    return { error: "All fields are required" };
  }

  if (password.length < 6) {
    return { error: "Password must be at least 6 characters" };
  }

  if (!serviceIds || serviceIds.length === 0) {
    return { error: "At least one service must be selected" };
  }

  // Email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { error: "Please enter a valid email address" };
  }

  try {
    // Check if email already exists in barbers table
    const existingBarber = await sql`
      SELECT id FROM barbers WHERE email = ${email}
    `;

    if (existingBarber.length > 0) {
      return { error: "Email already exists in barbers table" };
    }

    // Check if email exists in customers table
    const existingCustomer = await sql`
      SELECT id FROM customers WHERE email = ${email}
    `;

    if (existingCustomer.length > 0) {
      return { error: "Email already exists in customers table" };
    }

    // Validate that all service IDs exist
    const validServices = await sql`
      SELECT id FROM services WHERE id = ANY(${serviceIds.map(id => parseInt(id))})
    `;

    if (validServices.length !== serviceIds.length) {
      return { error: "One or more selected services are invalid" };
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    let newBarber;

    // Use transaction to create barber and assign services
    await sql.begin(async (sql) => {
      // Insert new barber
      const barberResult = await sql`
        INSERT INTO barbers (name, email, password_hash, isadmin)
        VALUES (${name}, ${email}, ${hashedPassword}, false)
        RETURNING id, name, email, isadmin
      `;

      newBarber = barberResult[0];

      // Insert barber-service relationships
      for (const serviceId of serviceIds) {
        await sql`
          INSERT INTO barber_services (barber_id, service_id)
          VALUES (${newBarber.id}, ${parseInt(serviceId)})
        `;
      }
    });

    // Get service names for confirmation message
    const assignedServices = await sql`
      SELECT s.name FROM services s
      JOIN barber_services bs ON s.id = bs.service_id
      WHERE bs.barber_id = ${newBarber.id}
    `;

    const serviceNames = assignedServices.map(s => s.name).join(', ');

    return {
      success: true,
      barber: newBarber,
      message: `Barber ${name} created successfully with services: ${serviceNames}`
    };

  } catch (error) {
    console.error("Error creating barber:", error);

    // Handle specific database errors
    if (error.message.includes("duplicate key")) {
      if (error.message.includes("name")) {
        return { error: "Barber name already exists" };
      }
      if (error.message.includes("email")) {
        return { error: "Email already exists" };
      }
    }

    return { error: "Failed to create barber. Please try again." };
  }
}

export async function deleteBarber(barberId) {
  const session = await auth();

  if (!session?.user?.isAdmin) {
    return { error: "Unauthorized - Admin access required" };
  }

  try{
    // Check if barber exists
    const barber = await sql`
      SELECT id, name FROM barbers WHERE id = ${barberId}
    `;

    if (barber.length === 0) {
      return { error: "Barber not found" };
    }

    // Delete the barber
    await sql`
      DELETE FROM barbers WHERE id = ${barberId}
    `;

    return {
      success: true,
      message: `Barber ${barber[0].name} deleted successfully`
    };
  } catch (error) {
    console.error("Error deleting barber:", error);
    return { error: "Failed to delete barber. Please try again." };
  }
}

export async function updateBarberInfo(barberId, updateData) {
  const session = await auth();
  
  if (!session?.user?.isAdmin) {
    return { error: "Unauthorized - Admin access required" };
  }

  const { name, email, isadmin } = updateData;

  if (!name || !email) {
    return { error: "Name and email are required" };
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { error: "Please enter a valid email address" };
  }

  try {
    const existingBarber = await sql`
      SELECT id FROM barbers WHERE email = ${email} AND id != ${barberId}
    `;

    if (existingBarber.length > 0) {
      return { error: "Email already exists for another barber" };
    }

    const existingCustomer = await sql`
      SELECT id FROM customers WHERE email = ${email}
    `;

    if (existingCustomer.length > 0) {
      return { error: "Email already exists in customers table" };
    }

    // Update barber information
    const result = await sql`
      UPDATE barbers 
      SET name = ${name}, email = ${email}, isadmin = ${isadmin}
      WHERE id = ${barberId}
      RETURNING id, name, email, isadmin
    `;

    if (result.length === 0) {
      return { error: "Barber not found" };
    }

    return {
      success: true,
      barber: result[0],
      message: "Barber information updated successfully"
    };

  } catch (error) {
    console.error("Error updating barber:", error);

    // Handle specific database errors
    if (error.message.includes("duplicate key")) {
      if (error.message.includes("name")) {
        return { error: "Barber name already exists" };
      }
      if (error.message.includes("email")) {
        return { error: "Email already exists" };
      }
    }

    return { error: "Failed to update barber information. Please try again." };
  }
}

export async function updateBarberServices(barberId, serviceIds) {
  const session = await auth();
  
  if (!session?.user?.isAdmin) {
    return { error: "Unauthorized - Admin access required" };
  }

  if (!serviceIds || serviceIds.length === 0) {
    return { error: "At least one service must be selected" };
  }

  try {
    // Validate that all service IDs exist
    const validServices = await sql`
      SELECT id, name FROM services WHERE id = ANY(${serviceIds})
    `;

    if (validServices.length !== serviceIds.length) {
      return { error: "One or more selected services are invalid" };
    }

    // Check if barber exists
    const barber = await sql`
      SELECT id FROM barbers WHERE id = ${barberId}
    `;

    if (barber.length === 0) {
      return { error: "Barber not found" };
    }

    await sql.begin(async (sql) => {
      // Delete all existing barber-service relationships
      await sql`
        DELETE FROM barber_services WHERE barber_id = ${barberId}
      `;

      // Insert new barber-service relationships
      for (const serviceId of serviceIds) {
        await sql`
          INSERT INTO barber_services (barber_id, service_id)
          VALUES (${barberId}, ${serviceId})
        `;
      }
    });

    // Get updated services with details
    const updatedServices = await sql`
      SELECT s.id, s.name, s.duration_minutes, s.price, s.description
      FROM services s
      JOIN barber_services bs ON s.id = bs.service_id
      WHERE bs.barber_id = ${barberId}
    `;

    const serviceNames = updatedServices.map(s => s.name).join(', ');

    return {
      success: true,
      services: updatedServices,
      message: `Barber services updated successfully: ${serviceNames}`
    };

  } catch (error) {
    console.error("Error updating barber services:", error);
    return { error: "Failed to update barber services. Please try again." };
  }
}


export async function deleteCustomer(customerId) {
  const session = await auth();

  if (!session?.user?.isAdmin) {
    return { error: "Unauthorized - Admin access required" };
  }

  try {
    const appointments = await sql`
      SELECT COUNT(*) as count 
      FROM appointment_slots 
      WHERE customer_id = ${customerId}
    `;

    if (appointments[0].count > 0) {
      return { error: "Cannot delete customer with existing appointments" };
    }

    const customer = await sql`
      SELECT id, name FROM customers WHERE id = ${customerId}
    `;

    if (customer.length === 0) {
      return { error: "Customer not found" };
    }

    await sql`
      DELETE FROM customers WHERE id = ${customerId}
    `;

    return {
      success: true,
      message: `Customer ${customer[0].name} deleted successfully`
    };
  } catch (error) {
    console.error("Error deleting customer:", error);
    return { error: "Failed to delete customer. Please try again." };
  }
}

export async function cancelBarberAppointment({ barberId, customerId, date, start_time, service_duration, serviceId }) {
  const session = await auth();

  // Check if the logged-in user is the barber or an admin
  if (!session?.user || (session.user.id !== barberId && !session.user.role === 'barber')) {
    return { error: "Unauthorized - You can only cancel your own appointments" };
  }

  try {
    let customerInfo;
    let barberInfo;
    let cancelledSlots;

    await sql.begin(async (sql) => {
      // Get customer and barber information before cancelling
      const customerResult = await sql`
        SELECT id, name, email FROM customers WHERE id = ${customerId}
      `;

      const barberResult = await sql`
        SELECT id, name, email FROM barbers WHERE id = ${barberId}
      `;

      if (customerResult.length === 0 || barberResult.length === 0) {
        throw new Error("Customer or barber not found");
      }

      customerInfo = customerResult[0];
      barberInfo = barberResult[0];

      // Calculate number of slots needed based on service duration
      const slotsNeeded = Math.ceil(service_duration / 15); // Each slot is 15 minutes
      
      // Generate consecutive time slots to cancel
      const timeSlots = [];
      const startTime = new Date(`1970-01-01T${start_time}`);
      
      for (let i = 0; i < slotsNeeded; i++) {
        const currentSlotTime = new Date(startTime.getTime() + (i * 15 * 60 * 1000));
        const timeString = currentSlotTime.toTimeString().slice(0, 5);
        timeSlots.push(timeString);
      }

      console.log(`Cancelling ${slotsNeeded} slots:`, timeSlots);

      // Cancel all consecutive slots for this appointment
      const results = [];
      for (const timeSlot of timeSlots) {
        const result = await sql`
          UPDATE appointment_slots 
          SET customer_id = NULL, service_id = NULL
          WHERE day = ${date} 
            AND barber_id = ${barberId}
            AND customer_id = ${customerId}
            AND service_id = ${serviceId}
            AND start_time = ${timeSlot}
          RETURNING *
        `;
        
        if (result.length > 0) {
          results.push(...result);
        }
      }

      if (results.length === 0) {
        throw new Error("Appointment not found or already cancelled");
      }

      cancelledSlots = results;
      
      console.log(`Successfully cancelled ${results.length} appointment slots`);
    });

    // Calculate end time for notification
    const endTime = new Date(`1970-01-01T${start_time}`);
    endTime.setMinutes(endTime.getMinutes() + service_duration);
    const endTimeString = endTime.toTimeString().slice(0, 5);
    const timeRange = `${start_time} - ${endTimeString}`;

    // Send cancellation notification to customer
    try {
      await sendCustomerCancellationNotification({
        customer: customerInfo,
        barber: barberInfo,
        appointmentDetails: {
          date,
          timeRange: timeRange,
          formattedDate: new Date(date).toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          }),
          serviceName: cancelledSlots[0].service_name || 'Service',
          duration: service_duration
        }
      });
    } catch (emailError) {
      console.error("Failed to send cancellation email to customer:", emailError);
    }

    return {
      success: true,
      message: `Appointment with ${customerInfo.name} has been cancelled successfully`,
      cancelledSlots: cancelledSlots.length,
      timeRange: timeRange
    };

  } catch (error) {
    console.error("Error cancelling appointment:", error);
    return { error: error.message || "Failed to cancel appointment. Please try again." };
  }
}
