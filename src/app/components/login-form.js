"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { useActionState } from "react";
import { handleLogin } from "../lib/actions";

export default function LoginForm({ role, showRoleSwitch = true, showRegisterLink = true }) {
  const router = useRouter();

  // Use useActionState hook for form submission
  const [state, formAction, isPending] = useActionState(
    async (prevState, formData) => {
      try {
        const response = await handleLogin(formData, role);
        if (response?.error) {
          // Authentication failed
          return "Invalid email or passwords";
        }

        // Redirect based on role
        if (role === "barber") {
          router.push("/barber");
        } else {
          router.push("/");
        }
        return null;
      } catch (error) {
        console.error("Login error:", error);
        return "An unexpected error occurred";
      }
    },
    null
  );

  const handleRoleSwitch = () => {
    const newRole = role === "customer" ? "barber" : "customer";
    router.push(`/login?role=${newRole}`);
  };

  return (
    <div>
      {/* Role Switch Button */}
      {showRoleSwitch && (<div className="mb-4">
        <button
          type="button"
          onClick={handleRoleSwitch}
          className="w-full py-2 px-4 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors text-sm"
        >
          Login as {role === "customer" ? "Barber" : "Customer"}
        </button>
      </div>)}

      <form action={formAction} className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
          />
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium">
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
          />
        </div>

        {state && <div className="text-red-500 text-sm">{state}</div>}

        <div>
          <button
            type="submit"
            disabled={isPending}
            className="w-full py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-gray-300 hover:text-blue-600 border border-blue-600 hover:border-blue-600 hover:scale-105 transition-all duration-200 disabled:opacity-50"
          >
            {isPending
              ? "Signing in..."
              : `Sign In as ${role === "barber" ? "Barber" : "Customer"}`}
          </button>
        </div>

        {showRegisterLink && (<div className="text-center text-sm">
          Don&apos;t have an account?{" "}
          <Link
            href={`/register?role=${role}`}
            className="text-blue-600 hover:underline"
            onClick={() =>
              console.log(`Navigating to: /register-user?role=${role}`)
            }
          >
            Create an account
          </Link>
        </div>)}
      </form>
    </div>
  );
}
