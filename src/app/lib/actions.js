"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation"; 
import bcrypt from 'bcryptjs';
import postgres from "postgres";
import { signIn } from "@/auth";

const sql = postgres(process.env.DATABASE_URL, { ssl: "verify-full" });

export async function createReservation(formData) {
  const rawFormData = {
    appointment_slot_id: Number(formData.get("appointmentId")),
    customerId: 4,
  };

  const created_at = new Date().toISOString().split("T")[0];

  try {

    await sql.begin(async (sql) => {
      const newReservation = await sql`
                INSERT INTO reservations (customer_id, appointment_slot_id, created_at)
                VALUES (${rawFormData.customerId}, ${rawFormData.appointment_slot_id}, ${created_at})
                RETURNING id
            `;

      const reservationId = newReservation[0].id;

      await sql`
                UPDATE appointment_slots 
                SET reservation_id = ${reservationId}
                WHERE id = ${rawFormData.appointment_slot_id}
            `;
    });
    console.log("Transaction completed successfully");

  } catch (error) {
    console.error("Error creating reservation:", error);
    throw new Error("Failed to create reservation");
  }
  revalidatePath("/reservations");
  redirect("/reservations");
}

export async function registerUser(name, email, password) {
  // Extract form data
 
  if (!name || !email || !password) {
    return { error: "All fields are required" };
  }
  
  if (password.length < 6) {
    return { error: "Password must be at least 6 characters" };
  }
  
  try {
    const existingUsers = await sql`
      SELECT * FROM users WHERE email = ${email}
    `;
    
    if (existingUsers.length > 0) {
      return { error: "Email already in use. Please login or use a different email." };
    }
    
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const result = await sql`
      INSERT INTO users (name, email, password_hash, role)
      VALUES (${name}, ${email}, ${hashedPassword}, 'customer')
      RETURNING id, name, email
    `;
    
    if (result && result.length > 0) {
      return { success: true, user: result[0] };
    } else {
      return { error: "Failed to create user" };
    }
  } catch (error) {
    console.error("Registration error:", error);
    return { error: "An unexpected error occurred during registration" };
  }
}

export async function registerAndLogin(name, email, password) {
  // First register the user
  const result = await registerUser(name, email, password);
  console.log("Registration result:", result);
  if (result.success) {

    try {
      await signIn('credentials', {
        email,
        password,
        redirect: false,
      });
      console.log("User logged in successfully");
      return { success: true, message: "Account created and logged in" };
    } catch (error) {
      console.error("Server-side login error:", error);
      return { success: true, autoLoginFailed: true, message: "Account created but login failed" };
    }
  }
  
  return result;
}