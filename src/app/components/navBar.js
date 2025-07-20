// src/app/components/Navigation.js
"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { signOut } from "next-auth/react";
import Button from "./buttonfm";
import { useState } from "react";

export default function Navigation({ session }) {
  const [isLoading, setIsLoading] = useState(false); // Replace with actual loading state if needed

  const handleLogout = async () => {
    setIsLoading(true); // Set loading state to true
    await signOut();
  };

  const handleClick = () => {
    setIsLoading((prev) => {
      const res = prev ? false : true; // Toggle loading state for demonstration
      return res;
    }); // Toggle loading state for demonstration
  };

  return (
    <nav className="bg-gray-800 border-b border-gray-700 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link href="/" className="flex items-center">
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="flex items-center space-x-2"
              >
                <div className="bg-blue-600 p-2 rounded-lg">
                  <svg
                    className="w-6 h-6 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  > 
                  </svg>
                </div>
                <h1 className="text-xl font-bold text-white">BarberShop</h1>
              </motion.div>
            </Link>
          </div>

          <div className="flex items-center space-x-4">
            {session?.user ? (
              <div className="flex items-center space-x-4 ">
                <span className="text-gray-300 text-sm sm: ml-3 text-2sm">
                  Signed in as: {session.user.name}
                </span>
                <Button
                  onClick={handleLogout}
                  color="danger"
                  size="small"
                  isLoading={isLoading}
                  disabled={isLoading}
                >
                  Logout
                </Button>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Link href="/login">
                  <Button
                    onClick={handleClick}
                    color="secondary"
                    size="small"
                    isLoading={isLoading}
                    disabled={isLoading}
                  >
                    Login
                  </Button>
                </Link>
                <Link href="/register">
                  <Button
                    onClick={handleClick}
                    color="primary"
                    size="small"
                    isLoading={isLoading}
                    disabled={isLoading}
                  >
                    Sign Up
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
