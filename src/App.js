import React from 'react';
import { Routes, Route, useLocation, Navigate } from 'react-router-dom';
import Dashboard from './pages/dashboard/Dashboard';
import Properties from './pages/dashboard/Properties';
import Bookings from './pages/dashboard/Bookings';
import Users from './pages/dashboard/Users';
import Login from './pages/logins/UserLogin';
import Transactions from './pages/dashboard/Transactions';
function App() {
  const location = useLocation(); // ✅ So we can use the key prop trick

  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} /> {/* ✅ redirect to /login */}
      <Route path="/login" element={<Login />} />
      <Route path="/dashboard" element={<Dashboard key={location.pathname} />} />
      <Route path="/dashboard/properties" element={<Properties key={location.pathname} />} />
      <Route path="/dashboard/bookings" element={<Bookings key={location.pathname} />} />
      <Route path="/dashboard/users" element={<Users key={location.pathname} />} />
      <Route path="/dashboard/transactions" element={<Transactions key={location.pathname} />} />
    </Routes>
  );
}

export default App;
