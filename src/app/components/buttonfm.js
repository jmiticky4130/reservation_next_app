"use client";
import React from "react";
import { motion } from "framer-motion";

const Button = ({
  children,
  onClick,
  color = "primary",
  size = "medium",
  disabled = false,
  isLoading = false,
  leftIcon = null,
  className = "",
  ...props
}) => {
  // Color variants
  const colorVariants = {
    primary: "bg-blue-600 hover:bg-blue-700 text-white",
    secondary: "bg-gray-600 hover:bg-gray-700 text-white",
    danger: "bg-red-600 hover:bg-red-700 text-white",
    success: "bg-green-600 hover:bg-green-700 text-white",
    "primary-gradient": "bg-gradient-to-br from-blue-500 to-blue-600 text-white",
    "danger-gradient": "bg-gradient-to-br from-red-500 to-red-600 text-white",
  };

  // Size variants
  const sizeVariants = {
    small: "px-3 py-1.5 text-sm",
    medium: "px-4 py-2 text-base",
    large: "px-5 py-2.5 text-lg",
  };

  // Loading spinner
  const Spinner = () => (
    <svg
      className="animate-spin h-4 w-4 text-current"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      ></circle>
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      ></path>
    </svg>
  );

  return (
    <motion.button
      type="button"
      onClick={disabled || isLoading ? undefined : onClick}
      whileHover={!disabled && !isLoading ? { scale: 1.02 } : {}}
      whileTap={!disabled && !isLoading ? { scale: 0.98 } : {}}
      transition={{ duration: 0.2 }}
      className={`
        ${colorVariants[color] || colorVariants.primary}
        ${sizeVariants[size] || sizeVariants.medium}
        ${disabled || isLoading ? "cursor-not-allowed opacity-60" : ""}
        rounded-md shadow-md flex items-center justify-center gap-2 font-medium
        transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-opacity-50
        ${className}
      `}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading && <Spinner />}
      
      {!isLoading && leftIcon && <span className="inline-flex">{leftIcon}</span>}
      
      <span>{children}</span>
    </motion.button>
  );
};

export default Button;