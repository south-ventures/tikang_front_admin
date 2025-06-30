import React, { useEffect, useState } from "react";
import { format } from "date-fns";
import DashboardNavBar from "../../components/Navbar";
import DashboardTabs from "./DashboardTabs";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { FaMoneyBillWave, FaTimes } from "react-icons/fa";
import LoadingSpinner from "../../components/LoadingSpinner";

const Transactions = () => {
  const { user, fetchUser, loading } = useAuth();
  const navigate = useNavigate();
  const API_URL_ADMIN = process.env.REACT_APP_API_URL_ADMIN;
  const API_URL = process.env.REACT_APP_API_URL;

  const [transactions, setTransactions] = useState([]);
  const [walletTx, setWalletTx] = useState([]);
  const [loadingTx, setLoadingTx] = useState(true);
  const [selectedTx, setSelectedTx] = useState(null);

  const fetchTransactions = async () => {
    try {
      const res = await fetch(`${API_URL_ADMIN}/transactions`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("tikangToken")}` },
      });
      const data = await res.json();
      if (res.ok) {
        const sorted = data.transactions.sort(
          (a, b) => new Date(b.created_at) - new Date(a.created_at)
        );
        setTransactions(sorted);
      }
    } catch (err) {
      console.error("Error fetching transactions:", err);
    }
  };

  const fetchWalletTransactions = async () => {
    try {
      const res = await fetch(`${API_URL_ADMIN}/wallet-transactions`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("tikangToken")}` },
      });
      const data = await res.json();
      if (res.ok) {
        const sorted = data.transactions
          .filter((tx) => tx.status === "pending")
          .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        setWalletTx(sorted);
      }
    } catch (err) {
      console.error("Error fetching wallet transactions:", err);
    } finally {
      setLoadingTx(false);
    }
  };

  const handleConfirmWallet = async (tx_id, amount, user_id, type) => {
    try {
      const res = await fetch(`${API_URL_ADMIN}/accept-wallet-transaction`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("tikangToken")}`,
        },
        body: JSON.stringify({
          transaction_id: tx_id,
          amount,
          user_id,
          type,
        }),
      });
  
      const data = await res.json();
      if (res.ok) {
        alert("Wallet transaction accepted.");
        await fetchWalletTransactions();
        await fetchTransactions(); // refresh all tx
      } else {
        alert(data.message || "Failed to accept wallet transaction.");
      }
    } catch (err) {
      console.error("Error accepting wallet transaction:", err);
    }
  };
  

  useEffect(() => {
    const init = async () => {
      if (!user && !loading) {
        const fetched = await fetchUser();
        if (!fetched) return navigate("/login");
      }
      await fetchTransactions();
      await fetchWalletTransactions();
    };
    init();
  }, [user, loading]);

  return (
    <div className="min-h-screen bg-gray-100">
      <DashboardNavBar />
      <DashboardTabs />
  
      <div className="pt-28 px-6 grid grid-cols-1 xl:grid-cols-5 gap-6 items-start">
        {/* Left Column - Wallet Transactions */}
        <div className="xl:col-span-2 flex flex-col gap-6">
          {/* Pending Wallet Transactions */}
          <div className="bg-white rounded-xl shadow-md p-4">
            <h3 className="text-lg font-bold mb-4 text-gray-700">Pending Wallet Transactions</h3>
            {walletTx.length === 0 ? (
              <p className="text-sm text-gray-400">No pending transactions</p>
            ) : (
              <table className="w-full text-sm">
                <thead className="bg-gray-100 text-left">
                  <tr>
                    <th className="px-3 py-2">ID</th>
                    <th className="px-3 py-2">User</th>
                    <th className="px-3 py-2">Amount</th>
                    <th className="px-3 py-2">Type</th>
                    <th className="px-3 py-2">Date</th>
                    <th className="px-3 py-2">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {walletTx.map((tx) => (
                    <tr key={tx.transaction_id} className="border-b hover:bg-gray-50">
                      <td className="px-3 py-2">{tx.transaction_id}</td>
                      <td className="px-3 py-2">{tx.user_id}</td>
                      <td className="px-3 py-2 text-green-600 font-bold">₱{tx.amount}</td>
                      <td className="px-3 py-2 capitalize">{tx.type}</td>
                      <td className="px-3 py-2">{format(new Date(tx.created_at), "PPP")}</td>
                      <td className="px-3 py-2">
                        <button
                        onClick={() =>
                            handleConfirmWallet(tx.transaction_id, tx.amount, tx.user_id, tx.type)
                        }
                          className="bg-blue-500 text-white px-3 py-1 rounded text-xs hover:bg-blue-600"
                        >
                          Confirm
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
  
          {/* All Wallet Transactions */}
          <div className="bg-white rounded-xl shadow-md p-4">
            <h3 className="text-lg font-bold mb-4 text-gray-700">All Wallet Transactions</h3>
            {transactions.filter(tx => tx.type === "deposit" || tx.type === "withdraw").length === 0 ? (
              <p className="text-sm text-gray-400">No wallet transactions</p>
            ) : (
              <table className="w-full text-sm">
                <thead className="bg-gray-100 text-left">
                  <tr>
                    <th className="px-3 py-2">ID</th>
                    <th className="px-3 py-2">User</th>
                    <th className="px-3 py-2">Amount</th>
                    <th className="px-3 py-2">Type</th>
                    <th className="px-3 py-2">Status</th>
                    <th className="px-3 py-2">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions
                    .filter(tx => tx.type === "deposit" || tx.type === "withdraw")
                    .map((tx) => (
                      <tr key={tx.transaction_id} className="border-b hover:bg-gray-50">
                        <td className="px-3 py-2">{tx.transaction_id}</td>
                        <td className="px-3 py-2">{tx.user_id}</td>
                        <td className="px-3 py-2 text-green-600 font-bold">₱{tx.amount}</td>
                        <td className="px-3 py-2 capitalize">{tx.type}</td>
                        <td className="px-3 py-2 capitalize">{tx.status}</td>
                        <td className="px-3 py-2">{format(new Date(tx.created_at), "PPP")}</td>
                      </tr>
                    ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
  
        {/* Right Column - All Booking Transactions */}
        <div className="xl:col-span-3 bg-white rounded-xl shadow-md p-4">
          <h2 className="text-2xl font-bold mb-4 text-gray-700">All Transactions</h2>
          {loadingTx ? (
            <LoadingSpinner />
          ) : (
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-4 py-3">Transaction ID</th>
                  <th className="px-4 py-3">Booking ID</th>
                  <th className="px-4 py-3">Payment Method</th>
                  <th className="px-4 py-3">Subtotal</th>
                  <th className="px-4 py-3">Service Charge</th>
                  <th className="px-4 py-3">Total</th>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Action</th>
                </tr>
              </thead>
              <tbody>
                {transactions.filter(tx => tx.booking_id).length === 0 ? (
                  <tr>
                    <td colSpan="8" className="text-center py-4 text-gray-400">
                      No booking transactions found.
                    </td>
                  </tr>
                ) : (
                  transactions
                    .filter(tx => tx.booking_id)
                    .map((tx) => (
                      <tr key={tx.transaction_id} className="border-b hover:bg-gray-50">
                        <td className="px-4 py-3">{tx.transaction_id}</td>
                        <td className="px-4 py-3">{tx.booking_id}</td>
                        <td className="px-4 py-3 capitalize">
                          <span className="inline-flex items-center gap-1">
                            <FaMoneyBillWave className="text-green-500" />
                            {tx.payment_method || "N/A"}
                          </span>
                        </td>
                        <td className="px-4 py-3">₱{tx.subtotal}</td>
                        <td className="px-4 py-3">₱{tx.service_charge}</td>
                        <td className="px-4 py-3 font-semibold text-blue-700">₱{tx.total_payment}</td>
                        <td className="px-4 py-3">{format(new Date(tx.created_at), "PPP p")}</td>
                        <td className="px-4 py-3">
                          <button
                            onClick={() => setSelectedTx(tx)}
                            className="px-2 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 text-xs"
                          >
                            View
                          </button>
                        </td>
                      </tr>
                    ))
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
  
      {/* Transaction Modal */}
      {selectedTx && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50 px-4">
          <div className="bg-white rounded-lg shadow-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto relative p-6">
            <button
              onClick={() => setSelectedTx(null)}
              className="absolute top-3 right-3 text-gray-500 hover:text-red-600"
            >
              <FaTimes />
            </button>
  
            <h3 className="text-xl font-bold text-gray-800 mb-4">Transaction Details</h3>
            <div className="grid grid-cols-2 gap-4 text-sm text-gray-700">
              <div><strong>Transaction ID:</strong> {selectedTx.transaction_id}</div>
              <div><strong>Booking ID:</strong> {selectedTx.booking_id}</div>
              <div><strong>Subtotal:</strong> ₱{selectedTx.subtotal}</div>
              <div><strong>Service Charge:</strong> ₱{selectedTx.service_charge}</div>
              <div><strong>Total Payment:</strong> ₱{selectedTx.total_payment}</div>
              <div><strong>Payment Method:</strong> {selectedTx.payment_method}</div>
              <div><strong>Payment Status:</strong> {selectedTx.payment_status}</div>
              <div><strong>Booking Status:</strong> {selectedTx.booking_status}</div>
              <div><strong>Check In:</strong> {format(new Date(selectedTx.check_in_date), "PPP")}</div>
              <div><strong>Check Out:</strong> {format(new Date(selectedTx.check_out_date), "PPP")}</div>
              <div><strong>Adults:</strong> {selectedTx.num_adults}</div>
              <div><strong>Children:</strong> {selectedTx.num_children}</div>
              <div><strong>Rooms:</strong> {selectedTx.num_rooms}</div>
            </div>
  
            <h4 className="font-semibold text-gray-800 mt-6 mb-2">Guest Info</h4>
            <p className="text-sm text-gray-700">
              {selectedTx.guest_name} ({selectedTx.guest_email}, {selectedTx.guest_phone})
            </p>
  
            <h4 className="font-semibold text-gray-800 mt-6 mb-2">Owner Info</h4>
            <p className="text-sm text-gray-700">
              {selectedTx.owner_name} ({selectedTx.owner_email}, {selectedTx.owner_phone})
            </p>
  
            <h4 className="font-semibold text-gray-800 mt-6 mb-2">Property Info</h4>
            <div className="text-sm text-gray-700">
              <p><strong>{selectedTx.property_title}</strong></p>
              <p>{selectedTx.city}, {selectedTx.province}, {selectedTx.country}</p>
              <div className="flex gap-2 mt-2 flex-wrap">
                {selectedTx.thumbnail_url.map((img, i) => (
                  <img
                    key={i}
                    src={`${API_URL}${img}`}
                    alt={`thumbnail-${i}`}
                    className="w-28 h-20 object-cover rounded border"
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Transactions;