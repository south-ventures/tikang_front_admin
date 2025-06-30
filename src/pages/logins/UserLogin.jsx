import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import WarningPopup from '../../components/WarningPopup';
import { useAuth } from '../../context/AuthContext';
import { motion } from 'framer-motion';
import { FaEye, FaEyeSlash } from 'react-icons/fa';

const API_BASE = process.env.REACT_APP_API_URL_ADMIN;

export default function AdminLogin() {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();
  const { login, fetchUser } = useAuth();

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
  
    try {
      const res = await fetch(`${API_BASE}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
  
      const isJson = res.headers.get('content-type')?.includes('application/json');
      const data = isJson ? await res.json() : null;
  
      if (!res.ok) {
        throw new Error(data?.message || 'Login failed. Please try again.');
      }
  
      login(data.token);         // Save token in context/localStorage
      await fetchUser();         // Load admin user details
      setSuccess('Login successful!');
      setTimeout(() => navigate('/dashboard'), 1000); // 👈 Redirect after success
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {error && <WarningPopup message={error} type="error" onClose={() => setError('')} />}
      {success && <WarningPopup message={success} type="success" onClose={() => setSuccess('')} />}

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-300 flex items-center justify-center px-4 py-10"
      >
        <div className="bg-white/90 shadow-xl rounded-2xl w-full max-w-md p-10">
          <div className="text-center mb-6">
            <img src="/assets/logo.png" alt="Tikang Logo" className="h-16 mx-auto mb-2" />
            <h2 className="text-2xl font-bold text-gray-800">Admin Portal</h2>
            <p className="text-sm text-gray-500 mt-1">Log in to manage the Tikang system</p>
          </div>

          <form className="space-y-5" onSubmit={handleSubmit}>
            <input
              type="email"
              name="email"
              placeholder="Admin Email"
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />

            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Password"
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="button"
                onClick={() => setShowPassword(prev => !prev)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-xl transition duration-200"
            >
              {loading ? 'Logging in...' : 'Log In as Admin'}
            </button>
          </form>
        </div>
      </motion.div>
    </>
  );
}
