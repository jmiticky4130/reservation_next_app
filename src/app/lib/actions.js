"use server";

import bcrypt from "bcryptjs";
import postgres from "postgres";
import { signIn } from "@/auth";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";

const sql = postgres(process.env.DATABASE_URL, { ssl: "verify-full" });

export async function registerUser(name, email, password, barbershopName) {
  // Extract form data

  if (!name || !email || !password || !barbershopName) {
    return { error: "All fields are required" };
  }

  if (password.length < 6) {
    return { error: "Password must be at least 6 characters" };
  }
  const existingUsers = await sql`
      SELECT * FROM users WHERE email = ${email}
    `;

  if (existingUsers.length > 0) {
    return {
      error: "Email already in use. Please login or use a different email.",
    };
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    let id;
    let barbershopId;
    await sql.begin(async (sql) => {
      const newUser = await sql`
        INSERT INTO users (name, email, password_hash, role)
        VALUES (${name}, ${email}, ${hashedPassword}, 'admin')
        RETURNING id`;

      const userId = newUser[0].id;

      barbershopId = await sql`
        INSERT INTO barbershops (name, owner_id)
        VALUES (${barbershopName}, ${userId})
        RETURNING id`;

      id = barbershopId[0].id;
    });

    return { success: true, id };
  } catch (error) {
    console.error("Registration error:", error);
    return { error: "An unexpected error occurred during registration" };
  }
}

export async function registerAndLogin(name, email, password, barbershopName) {
  // First register the user
  const result = await registerUser(name, email, password, barbershopName);
  console.log("Registration result:", result);
  if (result.success) {
    try {
      await signIn("credentials", {
        email,
        password,
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

export async function handleLogin(formData) {
  const email = formData.get("email");
  const password = formData.get("password");

  if (!email || !password) {
    return { error: "Email and password are required" };
  }

  try {
    const response = await signIn("credentials", {
      email,
      password,
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
