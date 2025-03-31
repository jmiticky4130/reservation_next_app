import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { z } from "zod";
import bcrypt from "bcryptjs";
import postgres from "postgres";
import { fetchUsers } from "@/app/lib/data";
// PostgreSQL Connection
const sql = postgres(process.env.POSTGRES_URL, { ssl: "require" });

// Function to fetch user from the database

const authOptions = {
    
  providers: [
    Credentials({
        pages:{
            signIn: "/login",
        },
      name: "Credentials",
      credentials: {
        email: { label: "Username", type: "text", placeholder: "jsmith" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const users = await fetchUsers();
        console.log("Users:", users);
        const user = users.find(
          (user) =>
            user.email === credentials.email &&
            bcrypt.compareSync(credentials.password, user.password_hash)
        );
        return user
          ? { id: user.id, name: user.name, email: user.email }
          : null;
      },
    }),
  ],
  secret: process.env.AUTH_SECRET,
};

export const { handlers, auth, signIn, signOut } = NextAuth(authOptions);
