import React, { useEffect, useState, useCallback } from "react";
import { format, isAfter, isWithinInterval } from "date-fns";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import DashboardNavBar from "../../components/Navbar";
import DashboardTabs from "./DashboardTabs";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import {
  FaClock, FaCalendarAlt, FaCheckCircle, FaTimesCircle, FaTimes,
} from "react-icons/fa";

const Bookings = () => {
  const { user, fetchUser, loading } = useAuth();
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showDeclineModal, setShowDeclineModal] = useState(false);
  const [declineReason, setDeclineReason] = useState("");

  const API_URL = process.env.REACT_APP_API_URL;
  const API_URL_ADMIN = process.env.REACT_APP_API_URL_ADMIN;

  const fetchBookings = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL_ADMIN}/bookings`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("tikangToken")}`,
        },
      });
      const data = await res.json();
      const sorted = data.bookings.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      setBookings(sorted);
    } catch (error) {
      console.error("Failed to fetch bookings:", error);
    }
  }, [API_URL_ADMIN]);

  useEffect(() => {
    const init = async () => {
      if (!user && !loading) {
        const fetched = await fetchUser();
        if (!fetched) return navigate("/login");
      }
      await fetchBookings();
    };
    init();
  }, [user, loading, fetchBookings, fetchUser, navigate]);

  const handleAcceptPayment = async (booking) => {
    const confirm = window.confirm("Confirm accepting this payment?");
    if (!confirm) return;
  
    try {
      const res = await fetch(`${API_URL_ADMIN}/accept-payment`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("tikangToken")}`,
        },
        body: JSON.stringify({ booking_id: booking.booking_id }),
      });
  
      const data = await res.json();
      if (res.ok) {
        alert("Payment accepted successfully.");
        fetchBookings(); // Refresh list
      } else {
        alert(data.error || "Failed to accept payment.");
      }
    } catch (err) {
      console.error("Accept payment error:", err);
      alert("Something went wrong.");
    }
  };

  const handleDeclinePayment = async () => {
    if (!declineReason.trim()) return alert("Please enter a reason.");
    try {
      const res = await fetch(`${API_URL_ADMIN}/decline-payment`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("tikangToken")}`,
        },
        body: JSON.stringify({
          booking_id: selectedBooking.booking_id,
          reason: declineReason,
        }),
      });
  
      const data = await res.json();
      if (res.ok) {
        alert("Payment declined.");
        setShowDeclineModal(false);
        setSelectedBooking(null);
        fetchBookings();
      } else {
        alert(data.error || "Failed to decline payment.");
      }
    } catch (err) {
      console.error("Decline payment error:", err);
      alert("Something went wrong.");
    }
  };

  const today = new Date();
  const isUpcoming = (checkIn) => isAfter(new Date(checkIn), today);
  const isOngoing = (checkIn, checkOut) =>
    isWithinInterval(today, {
      start: new Date(checkIn),
      end: new Date(checkOut),
    });

  const newBookings = bookings.filter(b => isUpcoming(b.check_in_date));
  const ongoingBookings = bookings.filter(b => isOngoing(b.check_in_date, b.check_out_date));
  const completedBookings = bookings.filter(b => b.booking_status === "completed");
  const cancelledBookings = bookings.filter(b => b.booking_status === "cancelled");

  const bookingsOnSelectedDate = bookings.filter(b =>
    new Date(b.check_in_date).toDateString() === selectedDate.toDateString()
  );

  const renderTable = (title, data) => (
    <div className="bg-white shadow rounded-xl p-5 w-full">
      <h3 className="text-lg font-bold mb-4 text-gray-700">{title}</h3>
      <div className="overflow-x-auto">
        <div className="max-h-[400px] overflow-y-auto">
          <table className="min-w-full text-sm text-left text-gray-700">
            <thead className="bg-gray-100 sticky top-0 z-10">
              <tr>
                <th className="px-4 py-2">Guest</th>
                <th className="px-4 py-2">Property</th>
                <th className="px-4 py-2">Total</th>
                <th className="px-4 py-2">Guests</th>
                <th className="px-4 py-2">Check-In</th>
                <th className="px-4 py-2">Check-Out</th>
                <th className="px-4 py-2">Status</th>
                <th className="px-4 py-2">Action</th>
              </tr>
            </thead>
            <tbody>
              {data.length === 0 ? (
                <tr>
                  <td colSpan="8" className="text-center py-4 text-gray-400">No bookings found.</td>
                </tr>
              ) : (
                data.map((b, i) => (
                  <tr key={i} className="border-b hover:bg-gray-100">
                    <td className="px-4 py-2">{b.guest_name}</td>
                    <td className="px-4 py-2">{b.title}</td>
                    <td className="px-4 py-2">₱{b.total_price}</td>
                    <td className="px-4 py-2">{b.num_adults + b.num_children}</td>
                    <td className="px-4 py-2">{format(new Date(b.check_in_date), "MMM dd, yyyy")}</td>
                    <td className="px-4 py-2">{format(new Date(b.check_out_date), "MMM dd, yyyy")}</td>
                    <td className="px-4 py-2 capitalize">{b.payment_status}</td>
                    <td className="px-4 py-2">
                      <button
                        onClick={() => setSelectedBooking(b)}
                        className="px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200 mr-2"
                      >
                        View
                      </button>
                      {b.payment_status === 'pending' && (
                        <button
                          onClick={() => handleAcceptPayment(b)}
                          className="px-3 py-1 text-xs bg-green-100 text-green-700 rounded hover:bg-green-200"
                        >
                          Accept Payment
                        </button>
                      )}
                      {b.payment_status === 'pending' && (
                        <button
                          onClick={() => {
                            setSelectedBooking(b);       // 🟢 Set the booking first
                            setShowDeclineModal(true);   // 🔴 Then open the modal
                          }}
                          className="px-3 py-1 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200"
                        >
                          Decline Payment
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const StatCard = ({ title, count, icon, color }) => (
    <div className={`bg-white border-l-4 shadow rounded-xl p-4 flex items-center gap-4 border-${color}-500`}>
      <div className={`text-${color}-500 text-2xl`}>{icon}</div>
      <div>
        <p className="text-sm text-gray-500">{title}</p>
        <h4 className="text-xl font-bold text-gray-700">{count}</h4>
      </div>
    </div>
  );

  return (
    <>
      <DashboardNavBar />
      <DashboardTabs />
      <div className="bg-gray-100 min-h-screen p-6 pt-36">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Bookings Overview</h1>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard title="New Bookings" count={newBookings.length} icon={<FaClock />} color="blue" />
          <StatCard title="Ongoing Bookings" count={ongoingBookings.length} icon={<FaCalendarAlt />} color="green" />
          <StatCard title="Completed Bookings" count={completedBookings.length} icon={<FaCheckCircle />} color="gray" />
          <StatCard title="Cancelled Bookings" count={cancelledBookings.length} icon={<FaTimesCircle />} color="red" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <div className="bg-white p-5 shadow rounded-xl">
            <h2 className="text-xl font-semibold mb-3">Booking Calendar</h2>
            <Calendar onChange={setSelectedDate} value={selectedDate} className="border rounded-xl" />
            <p className="mt-4 text-gray-600 text-sm">Selected: {format(selectedDate, "MMMM dd, yyyy")}</p>
            <div className="mt-4 space-y-1">
              {bookingsOnSelectedDate.length === 0 ? (
                <p className="text-gray-500 text-sm">No bookings for this date.</p>
              ) : (
                bookingsOnSelectedDate.map((b, i) => (
                  <div key={i} className="text-sm text-gray-700">{b.guest_name} - {b.title}</div>
                ))
              )}
            </div>
          </div>

          <div className="lg:col-span-2">{renderTable("New Bookings", newBookings)}</div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {renderTable("Ongoing Bookings", ongoingBookings)}
          {renderTable("Cancelled Bookings", cancelledBookings)}
        </div>

        <div className="mb-10">{renderTable("All Bookings", bookings)}</div>
      </div>

      {/* Booking Modal */}
      {selectedBooking && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
          <div className="bg-white rounded-xl shadow-xl w-[90%] md:w-[700px] max-h-[90vh] overflow-y-auto relative p-6">
            <button
              onClick={() => setSelectedBooking(null)}
              className="absolute top-3 right-4 text-gray-500 hover:text-red-500"
            >
              <FaTimes size={20} />
            </button>
            <h2 className="text-xl font-bold mb-4">Booking Details</h2>
            <div className="text-sm space-y-2">
              <p><strong>Guest:</strong> {selectedBooking.guest_name} ({selectedBooking.guest_email})</p>
              <p><strong>Phone:</strong> {selectedBooking.guest_phone}</p>
              <p><strong>Booking Status:</strong> {selectedBooking.booking_status}</p>
              <p><strong>Payment Status:</strong> {selectedBooking.payment_status}</p>
              {selectedBooking.booking_status === "cancelled" && (
                <p><strong>Reason for Declined Payment:</strong> {selectedBooking.cancel_reason || "No reason provided."}</p>
              )}
              <p><strong>Check-in:</strong> {format(new Date(selectedBooking.check_in_date), "PPP")}</p>
              <p><strong>Check-out:</strong> {format(new Date(selectedBooking.check_out_date), "PPP")}</p>
              <p><strong>Total Price:</strong> ₱{selectedBooking.total_price}</p>
              <p><strong>Room:</strong> {selectedBooking.room_name} ({selectedBooking.room_type})</p>
              <p><strong>Amenities:</strong> {selectedBooking.amenities?.join(", ")}</p>
              <p><strong>Property:</strong> {selectedBooking.title} - {selectedBooking.address}, {selectedBooking.city}, {selectedBooking.province}</p>
              <p><strong>Homeowners:</strong> {selectedBooking.lessor_name} ({selectedBooking.lessor_email})</p>
              <p><strong>Gcash Receipt:</strong>{" "}
                {selectedBooking.gcash_receipt ? (
                  <a
                    href={`${API_URL}${selectedBooking.gcash_receipt}`}
                    className="text-blue-500 underline"
                    target="_blank"
                    rel="noreferrer"
                  >
                    View Receipt
                  </a>
                ) : "None"}
              </p>

              <div className="mt-4">
                <h4 className="font-semibold mb-2">Room Images:</h4>
                <div className="grid grid-cols-3 gap-2">
                  {selectedBooking.room_images?.map((img, idx) => (
                    <img key={idx} src={`${API_URL}${img}`} alt={`room-${idx}`} className="w-full h-24 object-cover rounded" />
                  ))}
                </div>
              </div>

              <div className="mt-4">
                <h4 className="font-semibold mb-2">Property Images:</h4>
                <div className="grid grid-cols-3 gap-2">
                  {selectedBooking.thumbnail_url?.map((img, idx) => (
                    <img key={idx} src={`${API_URL}${img}`} alt={`property-${idx}`} className="w-full h-24 object-cover rounded" />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      {showDeclineModal && (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 px-4">
        <div className="bg-white p-6 rounded-xl w-full max-w-md shadow-lg relative">
          <button
            onClick={() => setShowDeclineModal(false)}
            className="absolute top-3 right-4 text-gray-500 hover:text-red-500"
          >
            <FaTimes size={20} />
          </button>
          <h2 className="text-lg font-bold text-gray-800 mb-4">Reason for Declined Payment</h2>
          <textarea
            rows="4"
            value={declineReason}
            onChange={(e) => setDeclineReason(e.target.value)}
            className="w-full border rounded-md p-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-red-300"
            placeholder="Enter reason..."
          />
          <button
            onClick={handleDeclinePayment}
            className="mt-4 w-full bg-red-600 text-white py-2 rounded hover:bg-red-700 text-sm"
          >
            Submit
          </button>
        </div>
      </div>
    )}
    </>
  );
};

export default Bookings;
