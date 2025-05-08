import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import postgres from "postgres";
import { fetchBarberByEmail } from "@/app/lib/data";

const sql = postgres(process.env.POSTGRES_URL, { ssl: "require" });

const authOptions = {
    
  providers: [
    Credentials({
        pages:{
            signIn: "/login",
        },
      name: "Credentials",
      credentials: {
        email: { label: "Username", type: "text", placeholder: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {

        const barber = await fetchBarberByEmail(credentials.email);
        if (!barber) {
          throw new Error("No user found with the email provided");
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          barber.password_hash // Assuming your DB field is named password_hash
        );
      
        if (!isPasswordValid) {
          return null;
        }
        return barber
          ? {
              id: barber.id,
              name: barber.name,
              email: barber.email,
              barbershopId: barber.barbershop_id,
            }
          : null;
      },
    }),
  ],
  callbacks: {
    jwt: ({ token, user }) => {
      if (user) {
        // Just pass the user ID to the token
        token.userId = user.id;
      }
      return token;
    },
    session: ({ session, token }) => {
      // Add the user ID to the session from the token
      if (session?.user) {
        session.user.id = token.sub;
      }
      return session;
    }
  },
  secret: process.env.AUTH_SECRET,
};

export const { handlers, auth, signIn, signOut } = NextAuth(authOptions);
