import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import DashboardNavBar from "../../components/Navbar";
import DashboardTabs from "../dashboard/DashboardTabs";
import LoadingSpinner from "../../components/LoadingSpinner";
import { format } from "date-fns";

export default function Dashboard() {
  const { user, fetchUser, loading } = useAuth();
  const [stats, setStats] = useState(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [initializing, setInitializing] = useState(true);

  const navigate = useNavigate();
  const API_URL = process.env.REACT_APP_API_URL_ADMIN;

  const fetchDashboardStats = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/dashboard-stats`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("tikangToken")}`,
        },
      });
      const data = await res.json();
      if (res.ok) {
        setStats(data);
      } else {
        console.error("Failed to fetch dashboard stats:", data.message);
      }
    } catch (err) {
      console.error("Error fetching dashboard stats:", err);
    }
  }, [API_URL]);

  useEffect(() => {
    const init = async () => {
      if (!user && !loading) {
        const fetched = await fetchUser();
        if (!fetched) return navigate("/login");
      }
      await fetchDashboardStats();
      setInitializing(false);
    };
    init();
  }, [user, loading, fetchDashboardStats, fetchUser, navigate]);

  useEffect(() => {
    const interval = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  if (loading || initializing || !stats) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  const { admin, bookings, users, transactions, properties } = stats;

  return (
    <>
      <DashboardNavBar />
      <DashboardTabs />

      <div className="pt-36 pb-20 px-6 md:px-12 bg-gray-100 min-h-screen">
        {/* Header */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-800">
            Welcome, {admin?.full_name?.split(" ")[0] || "Admin"} 👋
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            {format(currentTime, "EEEE, MMMM d, yyyy")} — {format(currentTime, "hh:mm:ss a")}
          </p>
        </div>

        {/* Admin Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          {/* Profile Info */}
          <div className="bg-white shadow-xl rounded-2xl p-6 md:col-span-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-base">
            <p className="text-gray-700">
              <span className="font-semibold text-lg">👤 Name:</span> {admin.full_name}
            </p>
            <p className="text-gray-700">
              <span className="font-semibold text-lg">📧 Email:</span> {admin.email}
            </p>
            <p className="text-gray-700">
              <span className="font-semibold text-lg">📱 Phone:</span> {admin.phone}
            </p>
          </div>
        </div>

          {/* Tikang Cash Card */}
          <div className="bg-gradient-to-br from-green-400 to-green-600 text-white shadow-xl rounded-2xl p-6 flex flex-col items-center justify-center text-center">
            <h3 className="text-lg font-semibold mb-2">Tikang Wallet</h3>
            <div className="text-3xl md:text-4xl font-extrabold">
              ₱{parseFloat(admin.tikang_cash).toLocaleString()}
            </div>
            <p className="text-sm mt-2 opacity-90">Available Balance</p>
          </div>
        </div>

        {/* Masonry Tables */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <TableCard title="New Bookings" route="/admin/bookings" data={bookings} columns={["booking_id", "check_in_date", "check_out_date", "total_price"]} />
          <TableCard title="New Users" route="/admin/users" data={users} columns={["user_id", "full_name", "email", "created_at"]} />
          <TableCard title="New Properties" route="/admin/properties" data={properties} columns={["property_id", "title", "type", "created_at"]} />
          <TableCard title="New Transactions" route="/admin/transactions" data={transactions} columns={["transaction_id", "payment_method", "total_payment", "created_at"]} />
        </div>
      </div>
    </>
  );
}

// 🔳 Reusable TableCard component
const TableCard = ({ title, route, data, columns }) => {
  return (
    <div className="bg-white shadow-xl rounded-2xl p-6">
      <div className="flex justify-between items-center mb-4">
        <h4 className="text-lg font-bold text-gray-800">{title}</h4>
        <button
          onClick={() => window.location.href = route}
          className="text-sm text-blue-600 hover:underline"
        >
          Go to ({route})
        </button>
      </div>
      {data.length === 0 ? (
        <p className="text-gray-500 text-sm">No data in the last 7 days.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="border-b bg-gray-100 text-gray-600">
              <tr>
                {columns.map(col => (
                  <th key={col} className="p-2 capitalize">{col.replace(/_/g, " ")}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.slice(0, 5).map((item, index) => (
                <tr key={index} className="border-t">
                  {columns.map(col => (
                    <td key={col} className="p-2">
                      {col.includes("date")
                        ? format(new Date(item[col]), "MMM d, yyyy")
                        : col.includes("price") || col.includes("total")
                        ? `₱${parseFloat(item[col]).toLocaleString()}`
                        : item[col]}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
