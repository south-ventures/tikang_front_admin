import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaUsers,
  FaChevronRight,
  FaTimes,
  FaSearch,
  FaUserTie,
  FaHome,
  FaSuitcaseRolling
} from "react-icons/fa";
import DashboardNavBar from "../../components/Navbar";
import DashboardTabs from "./DashboardTabs";
import { useAuth } from "../../context/AuthContext";
import { formatDistanceToNow } from "date-fns";

const MetricCard = ({ icon, label, value, color }) => (
  <div className="bg-white rounded-2xl p-5 shadow-md flex items-center space-x-4 border-l-4 border-blue-500">
    <div className={`text-${color}-600 text-3xl`}>{icon}</div>
    <div>
      <p className="text-sm text-gray-500">{label}</p>
      <h4 className="text-xl font-semibold">{value}</h4>
    </div>
  </div>
);

const ActiveUserTable = ({ users, onViewMore }) => {
  const sortedUsers = [...users].sort((a, b) => new Date(b.login_time) - new Date(a.login_time));

  return (
    <div className="bg-white rounded-xl shadow-lg mb-10 w-full max-w-xs">
      <h3 className="text-lg font-semibold text-gray-700 px-6 pt-4">Active Users</h3>
      <div className="overflow-x-auto max-h-[80vh] overflow-y-auto">
        <table className="min-w-full divide-y divide-gray-200 mt-2">
          <thead className="bg-gray-100 sticky top-0 z-10">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Last Login</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {sortedUsers.map((user, idx) => (
              <tr key={idx}>
                <td className="px-4 py-2 text-sm font-medium text-gray-900">{user.full_name}</td>
                <td className="px-4 py-2 text-sm text-gray-600 capitalize">{user.user_type}</td>
                <td className="px-4 py-2 text-sm text-gray-600">
                  {formatDistanceToNow(new Date(user.login_time), { addSuffix: true })}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};


const AllUserTable = ({ users, onViewMore }) => {
  // Filter out admin users
  const nonAdminUsers = users.filter(u => u.user_type !== "admin");

  // Sort by unverified first
  const sortedUsers = [...nonAdminUsers].sort((a, b) => {
    return Number(a.user_verify) - Number(b.user_verify); // false (0) comes before true (1)
  });

  return (
    <div className="bg-white rounded-xl shadow-lg mb-10 w-full">
      <h3 className="text-lg font-semibold text-gray-700 px-6 pt-4">All Users</h3>
      <div className="overflow-x-auto max-h-[80vh] overflow-y-auto">
        <table className="min-w-full divide-y divide-gray-200 mt-2">
          <thead className="bg-gray-100 sticky top-0 z-10">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Phone</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {sortedUsers.map((user, idx) => {
              const isUnverified = !user.user_verify;

              return (
                <tr
                  key={idx}
                  className={isUnverified ? "bg-red-50" : "bg-white"}
                >
                  <td className="px-6 py-3 text-sm font-medium text-gray-900">
                    {user.full_name}
                  </td>
                  <td className="px-6 py-3 text-sm text-gray-600">{user.email}</td>
                  <td className="px-6 py-3 text-sm text-gray-600">{user.phone}</td>
                  <td className="px-6 py-3 text-right space-y-1">
                    <button
                      onClick={() => onViewMore(user)}
                      className="flex items-center gap-1 px-3 py-1.5 bg-blue-100 text-blue-800 hover:bg-blue-200 rounded text-xs font-medium"
                    >
                      <FaChevronRight className="text-xs" /> View
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const UserDetailsModal = ({ user, onClose }) => {
  if (!user) return null;

  const API_URL = process.env.REACT_APP_API_URL;
  const ADMIN_URL = process.env.REACT_APP_API_URL_ADMIN;

  const profileImage = user.profile_picture
    ? `${API_URL}/uploads/profile/${user.profile_picture}`
    : "/default-avatar.png";

  const handleVerifyPhone = async () => {
    const confirm = window.confirm("Clicking this will label the phone number as verified, continue?");
    if (!confirm) return;

    try {
      const res = await fetch(`${ADMIN_URL}/verify-phone`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("tikangToken")}`,
        },
        body: JSON.stringify({ user_id: user.user_id }),
      });

      const json = await res.json();
      if (res.ok) {
        alert("Phone number marked as verified.");
        window.location.reload();
      } else {
        alert(json.message || "Failed to verify phone number.");
      }
    } catch (error) {
      console.error("Verify phone error:", error);
      alert("Server error.");
    }
  };

  const handleVerifyEmail = async () => {
    const confirm = window.confirm("Clicking this will label the email as verified, continue?");
    if (!confirm) return;

    try {
      const res = await fetch(`${ADMIN_URL}/verify-email`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("tikangToken")}`,
        },
        body: JSON.stringify({ user_id: user.user_id }),
      });

      const json = await res.json();
      if (res.ok) {
        alert("Email marked as verified.");
        window.location.reload();
      } else {
        alert(json.message || "Failed to verify email.");
      }
    } catch (error) {
      console.error("Verify email error:", error);
      alert("Server error.");
    }
  };

  const handleBlockUser = async () => {
    const confirm = window.confirm("This will block the user from logging in. Continue?");
    if (!confirm) return;

    try {
      const res = await fetch(`${ADMIN_URL}/block-user`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("tikangToken")}`,
        },
        body: JSON.stringify({ user_id: user.user_id }),
      });

      const json = await res.json();
      if (res.ok) {
        alert("User blocked successfully.");
        window.location.reload();
      } else {
        alert(json.message || "Failed to block user.");
      }
    } catch (error) {
      console.error("Block user error:", error);
      alert("Server error.");
    }
  };

  const handleDeleteUser = async () => {
    const confirm = window.confirm("This will permanently delete the user. Continue?");
    if (!confirm) return;

    try {
      const res = await fetch(`${ADMIN_URL}/delete-user`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("tikangToken")}`,
        },
        body: JSON.stringify({ user_id: user.user_id }),
      });

      const json = await res.json();
      if (res.ok) {
        alert("User deleted successfully.");
        window.location.reload();
      } else {
        alert(json.message || "Failed to delete user.");
      }
    } catch (error) {
      console.error("Delete user error:", error);
      alert("Server error.");
    }
  };

  const handleUnblockUser = async () => {
    const confirm = window.confirm("This will unblock the user. Continue?");
    if (!confirm) return;
  
    try {
      const res = await fetch(`${ADMIN_URL}/unblock-user`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("tikangToken")}`,
        },
        body: JSON.stringify({ user_id: user.user_id }),
      });
  
      const json = await res.json();
      if (res.ok) {
        alert("User unblocked successfully.");
        window.location.reload();
      } else {
        alert(json.message || "Failed to unblock user.");
      }
    } catch (error) {
      console.error("Unblock user error:", error);
      alert("Server error.");
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 px-4">
      <div className="bg-white p-6 rounded-xl max-w-2xl w-full relative shadow-xl max-h-[90vh] overflow-y-auto">
        <button onClick={onClose} className="absolute top-3 right-3 text-gray-600 hover:text-red-500">
          <FaTimes size={20} />
        </button>

        {/* Profile Picture */}
        <div className="flex justify-center mb-4">
          <img
            src={profileImage}
            alt="Profile"
            className="w-28 h-28 rounded-full object-cover border border-gray-300 shadow-sm"
          />
        </div>

        <h2 className="text-2xl font-bold mb-4 text-gray-800 text-center">User Details</h2>

        <div className="grid grid-cols-2 gap-4 text-sm text-gray-700">
          <p><strong>Full Name:</strong> {user.full_name}</p>
          <p><strong>Email:</strong> {user.email}</p>
          <p><strong>Phone:</strong> {user.phone}</p>
          <p><strong>User Type:</strong> {user.user_type}</p>
          <p><strong>First Name:</strong> {user.first_name}</p>
          <p><strong>Last Name:</strong> {user.last_name}</p>
          <p><strong>Address:</strong> {user.address}</p>
          <p><strong>City:</strong> {user.city}</p>
          <p><strong>Province:</strong> {user.province}</p>
          <p><strong>Country:</strong> {user.country}</p>
          <p><strong>Age:</strong> {user.age}</p>
          <p><strong>Email Verified:</strong> {user.email_verify === 'yes' ? 'Yes' : 'No'}</p>
          <p><strong>Phone Verified:</strong> {user.phone_verify ? 'Yes' : 'No'}</p>
          <p><strong>User Verified:</strong> {user.user_verify ? 'Yes' : 'No'}</p>
        </div>

        <div className="mt-6 flex flex-wrap justify-end gap-3 border-t pt-4">
          {user.email_verify === 'no' && (
            <button
              onClick={handleVerifyEmail}
              className="px-4 py-2 bg-yellow-100 text-yellow-700 hover:bg-yellow-200 rounded text-sm font-medium"
            >
              Verify Email
            </button>
          )}
          {!user.phone_verify && (
            <button
              onClick={handleVerifyPhone}
              className="px-4 py-2 bg-indigo-100 text-indigo-700 hover:bg-indigo-200 rounded text-sm font-medium"
            >
              Verify Phone Number
            </button>
          )}
          {user.blocked === true || user.blocked === "true" || user.blocked === "t" ? (
            <button
              onClick={handleUnblockUser}
              className="px-4 py-2 bg-green-100 text-green-700 hover:bg-green-200 rounded text-sm font-medium"
            >
              Unblock User
            </button>
          ) : (
            <button
              onClick={handleBlockUser}
              className="px-4 py-2 bg-red-100 text-red-700 hover:bg-red-200 rounded text-sm font-medium"
            >
              Block User
            </button>
          )}
          <button
            onClick={handleDeleteUser}
            className="px-4 py-2 bg-gray-200 text-gray-800 hover:bg-gray-300 rounded text-sm font-medium"
          >
            Delete User
          </button>
        </div>
      </div>
    </div>
  );
};

const ReportedUserTable = ({ reports, onView }) => (
  <div className="bg-white rounded-xl shadow-lg w-full max-w-xs mb-10">
    <h3 className="text-lg font-semibold text-gray-700 px-6 pt-4">Reported Users</h3>
    <div className="overflow-x-auto max-h-[80vh] overflow-y-auto">
      <table className="min-w-full divide-y divide-gray-200 mt-2">
        <thead className="bg-gray-100 sticky top-0 z-10">
          <tr>
            <th className="px-4 py-2 text-xs text-left text-gray-500 uppercase">Reported</th>
            <th className="px-4 py-2 text-xs text-left text-gray-500 uppercase">Sender</th>
            <th className="px-4 py-2 text-xs text-left text-gray-500 uppercase">Time</th>
            <th className="px-4 py-2 text-xs text-right text-gray-500 uppercase">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {reports.map((r) => (
            <tr key={r.report_id}>
              <td className="px-4 py-2 text-sm text-gray-800">{r.reported_name}</td>
              <td className="px-4 py-2 text-sm text-gray-600">{r.sender_name}</td>
              <td className="px-4 py-2 text-sm text-gray-600 whitespace-nowrap">
                {formatDistanceToNow(new Date(r.created_at), { addSuffix: true })}
              </td>
              <td className="px-4 py-2 text-right space-x-2">
                <button
                  onClick={() => onView(r)}
                  className="text-xs px-2 py-1 bg-blue-100 text-blue-700 hover:bg-blue-200 rounded"
                >
                  View
                </button>
                {r.status === "pending" && (
                  <button className="text-xs px-2 py-1 bg-green-100 text-green-700 hover:bg-green-200 rounded">
                    Resolve
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

// const ReportDetailsModal = ({ report, onClose }) => {
//   if (!report) return null;

//   return (
//     <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 px-4">
//       <div className="bg-white p-6 rounded-xl max-w-lg w-full relative shadow-xl max-h-[90vh] overflow-y-auto">
//         <button onClick={onClose} className="absolute top-3 right-3 text-gray-600 hover:text-red-500">
//           <FaTimes size={20} />
//         </button>
//         <h2 className="text-xl font-bold mb-4 text-gray-800">Report Details</h2>
//         <div className="space-y-2 text-sm text-gray-700">
//           <p><strong>Report ID:</strong> {report.report_id}</p>
//           <p><strong>Reported User ID:</strong> {report.user_id}</p>
//           <p><strong>Reported Name:</strong> {report.reported_name}</p>
//           <p><strong>Sender ID:</strong> {report.sender_id}</p>
//           <p><strong>Sender Name:</strong> {report.sender_name}</p>
//           <p><strong>Status:</strong> {report.status}</p>
//           <p><strong>Time:</strong> {new Date(report.created_at).toLocaleString()}</p>
//           <p><strong>Comments:</strong></p>
//           <div className="bg-gray-50 p-3 rounded text-sm text-gray-800 border">
//             {report.comments}
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };


const BlockedUsersTable = ({ users = [], onViewMore, onUnblock }) => {
  const blockedUsers = users.filter(
    (u) => u.blocked === true || u.blocked === "true" || u.blocked === 1 || u.blocked === "t"
  );

  return (
    <div className="bg-white rounded-xl shadow-lg mb-10 w-full max-w-xs">
      <h3 className="text-lg font-semibold text-gray-700 px-6 pt-4">Blocked Users</h3>

      {blockedUsers.length === 0 ? (
        <div className="text-center text-gray-400 py-6">No blocked users.</div>
      ) : (
        <div className="overflow-x-auto max-h-[80vh] overflow-y-auto">
          <table className="min-w-full divide-y divide-gray-200 mt-2">
            <thead className="bg-gray-100 sticky top-0 z-10">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {blockedUsers.map((user, idx) => (
                <tr key={idx}>
                  <td className="px-4 py-2 text-sm text-gray-800">{user.full_name}</td>
                  <td className="px-4 py-2 text-sm text-gray-600">{user.email}</td>
                  <td className="px-4 py-2 text-right space-x-1">
                    <button
                      onClick={() => onViewMore(user)}
                      className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                    >
                      View
                    </button>
                    <button
                      onClick={() => onUnblock?.(user)}
                      className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded hover:bg-green-200"
                    >
                      Unblock
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

const NewUsersTable = ({ users }) => {
  const today = new Date();
  const sevenDaysAgo = new Date(today);
  sevenDaysAgo.setDate(today.getDate() - 7);

  const newUsers = users.filter((u) => {
    const createdAt = new Date(u.created_at);
    return (
      u.user_type !== "admin" &&
      createdAt >= sevenDaysAgo &&
      createdAt <= today
    );
  });

  return (
    <div className="bg-white rounded-xl shadow-lg mb-10 w-full max-w-xs">
      <h3 className="text-lg font-semibold text-gray-700 px-6 pt-4">New Users (Last 7 Days)</h3>

      {newUsers.length === 0 ? (
        <div className="text-center text-gray-400 py-6">No new users in the past 7 days.</div>
      ) : (
        <div className="overflow-x-auto max-h-[80vh] overflow-y-auto">
          <table className="min-w-full divide-y divide-gray-200 mt-2">
            <thead className="bg-gray-100 sticky top-0 z-10">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Joined</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {newUsers.map((user, idx) => (
                <tr key={idx}>
                  <td className="px-4 py-2 text-sm text-gray-800">{user.full_name}</td>
                  <td className="px-4 py-2 text-sm capitalize text-gray-600">{user.user_type}</td>
                  <td className="px-4 py-2 text-sm text-gray-600 whitespace-nowrap">
                    {formatDistanceToNow(new Date(user.created_at), { addSuffix: true })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default function Users() {
  const { user, fetchUser, loading } = useAuth();
  const [initializing, setInitializing] = useState(true);
  const [allUsers, setAllUsers] = useState([]);
  const [activeUsers, setActiveUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const [reportedUsers, setReportedUsers] = useState([]);
  const [setSelectedReport] = useState(null);
  const navigate = useNavigate();

  const loadAllUsers = async () => {
    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL_ADMIN}/all-users`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("tikangToken")}`,
        },
      });
      const json = await res.json();
      if (json?.users) setAllUsers(json.users);
    } catch (err) {
      console.error("Failed to load all users:", err);
    }
  };

  
  const loadReportedUsers = async () => {
    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL_ADMIN}/reported-users`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("tikangToken")}`,
        },
      });
      const json = await res.json();
      if (json?.reports) {
        const sorted = [...json.reports].sort(
          (a, b) => new Date(b.created_at) - new Date(a.created_at)
        );
        setReportedUsers(sorted);
      }
    } catch (err) {
      console.error("Failed to load reported users:", err);
    }
  };

  const loadActiveUsers = async () => {
    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL_ADMIN}/active-users`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("tikangToken")}`,
        },
      });
      const json = await res.json();
      if (json?.users) setActiveUsers(json.users);
    } catch (err) {
      console.error("Failed to load active users:", err);
    }
  };

  useEffect(() => {
    const init = async () => {
      if (!user && !loading) {
        const fetched = await fetchUser();
        if (!fetched) return navigate("/login");
      }
      await Promise.all([loadAllUsers(), loadActiveUsers(), loadReportedUsers()]);
      setInitializing(false);
    };
    init();
  }, [user, loading, fetchUser, navigate]);

  const filteredUsers = allUsers.filter((u) => {
    const query = searchQuery.toLowerCase();
    return (
      u.full_name.toLowerCase().includes(query) ||
      u.email.toLowerCase().includes(query) ||
      (u.phone || "").toLowerCase().includes(query)
    );
  });

  if (initializing || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="w-12 h-12 border-4 border-blue-500 border-dashed rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <>
      <DashboardNavBar />
      <DashboardTabs />
      <div className="pt-36 px-6 pb-16 bg-gray-100 min-h-screen flex flex-col lg:flex-row gap-8">
      {/* Left Sidebar - New and Active Users */}
      <div className="w-full lg:w-[320px] space-y-6">
        <NewUsersTable users={allUsers} />
        <ActiveUserTable users={activeUsers} />
        <ReportedUserTable reports={reportedUsers} onView={setSelectedReport} />
        <BlockedUsersTable
          users={allUsers}
          onViewMore={setSelectedUser}
          onUnblock={async (user) => {
            const confirm = window.confirm("Unblock this user?");
            if (!confirm) return;

            try {
              const res = await fetch(`${process.env.REACT_APP_API_URL_ADMIN}/unblock-user`, {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${localStorage.getItem("tikangToken")}`,
                },
                body: JSON.stringify({ user_id: user.user_id }),
              });

              const json = await res.json();
              if (res.ok) {
                alert("User unblocked.");
                window.location.reload();
              } else {
                alert(json.message || "Failed to unblock.");
              }
            } catch (err) {
              console.error("Unblock error:", err);
              alert("Server error.");
            }
          }}
        />
      </div>

        {/* Main Content - All Users */}
        <div className="flex-1">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-xl font-bold text-gray-700">User Overview</h1>
            <div className="relative">
              <input
                type="text"
                placeholder="Search users..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm" />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          <MetricCard
            icon={<FaUsers />}
            label="Total Users"
            value={allUsers.length}
            color="blue"
          />
          <MetricCard
            icon={<FaUserTie />}
            label="Admins"
            value={allUsers.filter((u) => u.user_type === "admin").length}
            color="green"
          />
          <MetricCard
            icon={<FaHome />}
            label="Owners"
            value={allUsers.filter((u) => u.user_type === "owner").length}
            color="gray"
          />
          <MetricCard
            icon={<FaSuitcaseRolling />}
            label="Guests"
            value={allUsers.filter((u) => u.user_type === "guest").length}
            color="red"
          />
        </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <h2 className="text-lg font-bold text-gray-700 mb-2">Guests</h2>
            <AllUserTable
              users={filteredUsers.filter(u => u.user_type === "guest")}
              onViewMore={setSelectedUser}
            />
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-700 mb-2">Owners</h2>
            <AllUserTable
              users={filteredUsers.filter(u => u.user_type === "owner")}
              onViewMore={setSelectedUser}
            />
          </div>
        </div>

          {selectedUser && (
            <UserDetailsModal user={selectedUser} onClose={() => setSelectedUser(null)} />
          )}
        </div>
      </div>
    </>
  );
}
