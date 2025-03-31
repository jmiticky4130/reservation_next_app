import postgres from 'postgres';

const sql = postgres(process.env.DATABASE_URL,  { ssl: 'verify-full' });

export async function getUser(name) {
    try {
      const user = await sql`
        SELECT * FROM users
        WHERE name = ${name}
        ORDER BY name DESC
      `;
      return user;
    } catch (error) {
      console.error('Database error:', error);
      throw new Error('Failed to fetch users');
    }
  }


export async function fetchAppointmentSlots() {

  try{
    const appointments = await sql`
      SELECT ap.id, ap.date, ap.start_time, ap.end_time, u.name as user_name 
      FROM appointment_slots ap
      JOIN barbers b ON ap.barber_id = b.id
      JOIN users u ON b.user_id = u.id
      WHERE ap.reservation_id IS NULL
    
    `;
    return appointments;
  } catch (error) {
    console.error('Database error:', error);
    throw new Error('Failed to fetch appointments');
  }

}
  

export async function fetchReservations() {
  try{
    const reservations = await sql`
      SELECT * FROM reservations`;
    return reservations;
  }catch (error) {
    console.error('Database error:', error);
    throw new Error('Failed to fetch reservations');
  }
}


export async function fetchUsers() {
  try {
    const users = await sql`SELECT * FROM users`;
    console.log("Users fetched:", users);
    return users; // Returns the first user found (if any)
  } catch (error) {
    console.error("Failed to fetch user:", error);
    throw new Error("Failed to fetch user.");
  }
}
