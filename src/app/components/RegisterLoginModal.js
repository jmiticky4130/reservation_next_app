"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import RegisterForm from "./register-form";
import LoginForm from "./login-form";

export default function RegisterLoginModal({ 
  isOpen, 
  onClose, 
  appointmentData
}) {
  const [authMode, setAuthMode] = useState('login'); // 'login' or 'register'

  const handleSwitchAuthMode = () => {
    setAuthMode(authMode === 'login' ? 'register' : 'login');
  };

  const handleClose = () => {
    setAuthMode('login'); // Reset to login mode when closing
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-20 flex items-center justify-center z-50 p-4" // Changed from bg-opacity-50 to bg-opacity-30
        onClick={handleClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-gray-800 rounded-lg p-6 w-full max-w-md border border-gray-700 max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Modal Header */}
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-white">
              {authMode === 'login' ? 'Login Required' : 'Create Account'}
            </h2>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-200 text-2xl font-bold leading-none"
              aria-label="Close modal"
            >
              ×
            </button>
          </div>

          {/* Auth Form Content */}
          <div className="space-y-4">
            {authMode === 'login' ? (
              <>
                <p className="text-gray-300 mb-4">
                  Please login to book your appointment.
                </p>
                <LoginForm role="customer" showRegisterLink={false} showRoleSwitch={false} />
                <div className="mt-4 text-center">
                  <p className="text-gray-400 text-sm">
                    Don't have an account?{" "}
                    <button
                      onClick={handleSwitchAuthMode}
                      className="text-blue-400 hover:text-blue-300 hover:underline transition-colors"
                    >
                      Create one here
                    </button>
                  </p>
                </div>
              </>
            ) : (
              <>
                <p className="text-gray-300 mb-4">
                  Create an account to book your appointment.
                </p>
                <RegisterForm role="customer" />
                <div className="mt-4 text-center">
                  <p className="text-gray-400 text-sm">
                    Already have an account?{" "}
                    <button
                      onClick={handleSwitchAuthMode}
                      className="text-blue-400 hover:text-blue-300 hover:underline transition-colors"
                    >
                      Login here
                    </button>
                  </p>
                </div>
              </>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}