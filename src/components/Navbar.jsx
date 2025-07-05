import React from 'react';
import { FaCog } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

const API_URL = process.env.REACT_APP_API_URL;

export default function DashboardNavBar() {
  const { user, logout } = useAuth();

  return (
    <nav className="w-full bg-white shadow-md px-6 py-4 flex justify-center relative z-50">
      <div className="flex items-center gap-6 text-gray-700 text-sm font-medium">
        {/* Logo fetched dynamically */}
        <Link to="/dashboard" className="flex items-center gap-2">
          <img
            src={`${API_URL}/uploads/logo/logo.png`}
            alt="Tikang Logo"
            className="h-16 object-contain cursor-pointer"
            onError={e => { e.currentTarget.src = '/fallback-logo.png'; }} // optional fallback
          />
        </Link>

        {/* Settings */}
        <Link to="/account">
          <FaCog className="text-xl cursor-pointer hover:text-blue-500 transition" />
        </Link>

        {/* Profile & Logout */}
        {user && (
          <div className="flex items-center gap-3">
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
