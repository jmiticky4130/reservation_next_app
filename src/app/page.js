import { getUser } from "@/app/lib/data";
import Link from "next/link";
import { auth } from "@/auth";

export default async function Home() {
  const session = await auth();
  
  if (session?.user) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Link href="/searchPage">SearchPage</Link>
        <Link href="/reservations">Reservations</Link>
      </div>
    );
  } else{
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Link href="/login">Login</Link>
        <Link href="/register">Register</Link>
      </div>
    );
  }
}
