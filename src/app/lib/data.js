import postgres from 'postgres';

const sql = postgres(process.env.DATABASE_URL,  { ssl: 'verify-full' });

export async function getUsers() {
    try {
      const reservations = await sql`
        SELECT * FROM users
        ORDER BY name DESC
      `;
      return reservations;
    } catch (error) {
      console.error('Database error:', error);
      throw new Error('Failed to fetch users');
    }
  }
  
