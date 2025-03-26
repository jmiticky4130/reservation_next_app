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
  
