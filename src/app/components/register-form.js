"use client";

import { useActionState, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  registerAndLogin,
  sendVerificationCode,
  userEmailExists,
} from "../lib/actions";
import { set } from "zod";

export default function RegisterForm({ role, showLoginLink = true }) {
  const router = useRouter();
  const [showVerificationCodeField, setShowVerificationCodeField] =
    useState(false);
  const [state, formAction, isPending] = useActionState(
    async (prevState, formData) => {
      const name = formData.get("name");
      const email = formData.get("email");
      const password = formData.get("password");
      const confirmPassword = formData.get("confirmPassword");

      if (password !== confirmPassword) {
        return "Passwords do not match";
      }

      const emailCheck = await userEmailExists(email);

      if (emailCheck.exists) {
        return "Email already exists. Please use a different email.";
      }

      if (role === "customer") {
        if (!showVerificationCodeField) {
          const res = await sendVerificationCode(email);
          if (res.success) {
            setShowVerificationCodeField(true);
            return "Verification code sent to your email. Please enter it to continue.";
          }
        } else {
          const verificationCode = formData.get("verificationField");
          if (!verificationCode) {
            return "Please enter the verification code sent to your email.";
          }

          const res = await registerAndLogin(
            name,
            email,
            password,
            role,
            verificationCode
          );
          if (res.error) {
            return res.error;
          }

          setShowVerificationCodeField(false);
          router.push("/");
        }
      }
    }
  );

  return (
    <form action={formAction} className="space-y-4">
      <div>
        <label htmlFor="name" className="block text-sm font-medium">
          Full Name
        </label>
        <input
          id="name"
          name="name"
          type="text"
          required
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
        />
      </div>

      <div>
        <label htmlFor="email" className="block text-sm font-medium">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
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
          required
          minLength={6}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
        />
      </div>

      <div>
        <label htmlFor="confirmPassword" className="block text-sm font-medium">
          Confirm Password
        </label>
        <input
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          required
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
        />
      </div>

      {showVerificationCodeField && (
        <div>
          <label
            htmlFor="verificationField"
            className="block text-sm font-medium"
          >
            verificationField
          </label>
          <input
            id="verificationField"
            name="verificationField"
            type="text"
            required
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
          />
        </div>
      )}

      {state &&
        state !==
          "Verification code sent to your email. Please enter it to continue." && (
          <div className="text-red-500 text-sm">{state}</div>
        )}
      {state &&
        state ===
          "Verification code sent to your email. Please enter it to continue." && (
          <div className="text-green-500 text-sm">{state}</div>
        )}

      <div>
        <button
          type="submit"
          disabled={isPending}
          className="w-full py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
        >
          {isPending ? "Creating Account..." : "Create Account"}
        </button>
      </div>

      {showLoginLink && (
        <div className="text-center text-sm">
          Already have an account?{" "}
          <Link href="/login" className="text-blue-600 hover:underline">
            Log in
          </Link>
        </div>
      )}
    </form>
  );
}
