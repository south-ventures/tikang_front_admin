import React from 'react';
import { FaBell, FaCog, FaUserCircle } from 'react-icons/fa';
import logo from '../assets/logo.png';
import { useAuth } from '../context/AuthContext';

export default function DashboardNavBar() {
  const { user, logout } = useAuth();

  return (
    <nav className="w-full bg-white shadow-md px-6 py-4 flex justify-center relative z-50">
      {/* Centered Group: Logo + Icons */}
      <div className="flex items-center gap-6 text-gray-700 text-sm font-medium">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <img src={logo} alt="Tikang Logo" className="h-8 object-contain" />
        </div>

        {/* Notification */}
        <FaBell className="text-xl cursor-pointer hover:text-blue-500 transition" />

        {/* Settings */}
        <FaCog className="text-xl cursor-pointer hover:text-blue-500 transition" />

        {/* Profile & Logout */}
        {user && (
          <div className="flex items-center gap-3">
            <FaUserCircle className="text-2xl" />
            <button
              onClick={logout}
              className="px-3 py-1 text-xs font-medium bg-red-100 text-red-600 rounded-full hover:bg-red-200 transition"
            >
              Logout
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}
