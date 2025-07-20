import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { fetchBarberByEmail,  fetchCustomerByEmail } from "@/app/lib/data";


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
        role:     { label: "Role",     type: "text" } 
      },
      async authorize(credentials) {

        const isBarber = credentials.role === "barber";
        const actor = isBarber ? 
          await fetchBarberByEmail(credentials.email):
          await fetchCustomerByEmail(credentials.email);
        
        if (!actor) {
          throw new Error("No user found with the email provided");
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          actor.password_hash 
        );
      
        if (!isPasswordValid) {
          return null;
        }
        return {
              id: actor.id,
              name: actor.name,
              email: actor.email,
              role: credentials.role,
              isAdmin: actor.isadmin || false,
            }
         
      },
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.userId = user.id;
        token.role   = user.role;
        token.isAdmin = user.isAdmin || false;
      }
      return token;
    },

    session({ session, token }) {
      if (session.user) {
        session.user.id   = token.userId;
        session.user.role = token.role;
        session.user.isAdmin = token.isAdmin || false;
      }
      return session;
    },
  },

  secret: process.env.AUTH_SECRET,
};

export const { handlers, auth, signIn, signOut } = NextAuth(authOptions);
