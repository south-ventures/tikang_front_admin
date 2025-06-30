import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import NavBar from '../../components/Navbar';
import DashboardTabs from './DashboardTabs';
import LoadingSpinner from '../../components/LoadingSpinner';
import { FaTimes } from 'react-icons/fa';

export default function Properties() {
  const { user, fetchUser, loading } = useAuth();
  const [properties, setProperties] = useState([]);
  const [loadingProperties, setLoadingProperties] = useState(true);
  const [selectedProperty, setSelectedProperty] = useState(null);
  const navigate = useNavigate();
  const API_URL = process.env.REACT_APP_API_URL;

  const fetchProperties = async () => {
    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL_ADMIN}/properties`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("tikangToken")}`,
        },
      });

      const data = await res.json();
      if (res.ok) {
        const sorted = data.properties.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        setProperties(sorted);
      } else {
        console.error('Failed to fetch properties:', data.message);
      }
    } catch (err) {
      console.error('Error:', err);
    } finally {
      setLoadingProperties(false);
    }
  };

  const handleVerify = async (property_id) => {
    const confirm = window.confirm("Are you sure you want to verify this property?");
    if (!confirm) return;

    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL_ADMIN}/verify-property/${property_id}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("tikangToken")}`,
        },
      });

      if (res.ok) {
        alert("Property verified successfully!");
        fetchProperties();
      } else {
        alert("Failed to verify property.");
      }
    } catch (err) {
      console.error('Verify error:', err);
    }
  };

  const handleDelete = async (property_id) => {
    const confirm = window.confirm("Are you sure you want to delete this property?");
    if (!confirm) return;

    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL_ADMIN}/delete-property/${property_id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("tikangToken")}`,
        },
      });

      if (res.ok) {
        alert("Property deleted.");
        fetchProperties();
      } else {
        alert("Failed to delete property.");
      }
    } catch (err) {
      console.error('Delete error:', err);
    }
  };

  useEffect(() => {
    const init = async () => {
      if (!user && !loading) {
        const fetched = await fetchUser();
        if (!fetched) return navigate("/login");
      }
      if (user) {
        await fetchProperties();
      }
    };
    init();
  }, [user, loading, fetchUser, navigate]);

  return (
    <div className="min-h-screen bg-gray-50">
      <NavBar />
      <DashboardTabs />

      <div className="pt-32 px-6">
        <h2 className="text-2xl font-bold mb-4 text-gray-700">All Properties</h2>
        {loadingProperties ? (
          <LoadingSpinner />
        ) : (
          <div className="overflow-x-auto max-h-[75vh] overflow-y-auto bg-white shadow-md rounded-lg">
            <table className="min-w-full text-sm text-left">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-4 py-3">Title</th>
                  <th className="px-4 py-3">Type</th>
                  <th className="px-4 py-3">Location</th>
                  <th className="px-4 py-3">Price</th>
                  <th className="px-4 py-3">Verify</th>
                  <th className="px-4 py-3">Owner</th>
                  <th className="px-4 py-3"># of Rooms</th>
                  <th className="px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {properties.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="text-center py-4 text-gray-400">
                      No properties found.
                    </td>
                  </tr>
                ) : (
                  properties.map((p) => (
                    <tr key={p.property_id} className="border-b hover:bg-gray-50">
                      <td className="px-4 py-3">{p.title}</td>
                      <td className="px-4 py-3 capitalize">{p.type}</td>
                      <td className="px-4 py-3">{p.city}, {p.province}</td>
                      <td className="px-4 py-3">₱{p.discount_price_per_night || p.price_per_night}</td>
                      <td className="px-4 py-3">
                        <span className={`text-xs font-semibold px-2 py-1 rounded ${
                          p.is_verify === 'yes' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                        }`}>
                          {p.is_verify === 'yes' ? 'Verified' : 'Pending'}
                        </span>
                      </td>
                      <td className="px-4 py-3">{p.lessor_name}</td>
                      <td className="px-4 py-3">{p.rooms?.length || 0}</td>
                      <td className="px-4 py-3 space-x-2">
                        <button
                          onClick={() => setSelectedProperty(p)}
                          className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                        >
                          View
                        </button>
                        {p.is_verify !== 'yes' && (
                          <button
                            onClick={() => handleVerify(p.property_id)}
                            className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded hover:bg-green-200"
                          >
                            Verify
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(p.property_id)}
                          className="px-2 py-1 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {selectedProperty && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-lg relative">
            <button
              className="absolute top-3 right-3 text-gray-500 hover:text-red-500"
              onClick={() => setSelectedProperty(null)}
            >
              <FaTimes size={18} />
            </button>
            <div className="p-6 space-y-4">
              <h3 className="text-xl font-bold text-gray-800">{selectedProperty.title}</h3>
              <div className="grid grid-cols-2 gap-2">
                {selectedProperty.thumbnail_url.map((img, i) => (
                  <img
                    key={i}
                    src={`${API_URL}${img}`}
                    alt={`property-img-${i}`}
                    className="w-full h-40 object-cover rounded"
                  />
                ))}
              </div>
              <p className="text-sm text-gray-700 whitespace-pre-line">{selectedProperty.description}</p>

              <div>
                <h4 className="font-semibold text-gray-700 mt-4">Location:</h4>
                <p className="text-sm text-gray-600">{selectedProperty.address}, {selectedProperty.city}, {selectedProperty.province}, {selectedProperty.country}</p>
              </div>

              <div>
                <h4 className="font-semibold text-gray-700 mt-4">Owner Info:</h4>
                <p className="text-sm text-gray-600">Name: {selectedProperty.lessor_name}</p>
                <p className="text-sm text-gray-600">Email: {selectedProperty.lessor_email}</p>
                <p className="text-sm text-gray-600">Phone: {selectedProperty.lessor_phone}</p>
                <p className="text-sm text-gray-600">Tikang Cash: ₱{selectedProperty.tikang_cash}</p>
              </div>

              <div>
                <h4 className="font-semibold text-gray-700 mt-4">Rooms:</h4>
                {selectedProperty.rooms?.length === 0 ? (
                  <p className="text-sm text-gray-500">No rooms added yet.</p>
                ) : (
                  selectedProperty.rooms.map((room) => (
                    <div key={room.room_id} className="border p-3 rounded-md mb-3 bg-gray-50">
                      <h5 className="font-medium text-gray-800">{room.room_name} ({room.room_type})</h5>
                      <p className="text-sm text-gray-600">₱{room.discount_price_per_night || room.price_per_night} / night</p>
                      <p className="text-sm text-gray-600">Max Guests: {room.max_guests}</p>
                      <p className="text-sm text-gray-600">Total Rooms: {room.total_rooms}</p>
                      <p className="text-sm text-gray-600">Amenities: {room.amenities?.join(', ')}</p>
                      <div className="flex gap-2 mt-2 flex-wrap">
                        {room.room_images.map((img, i) => (
                          <img
                            key={i}
                            src={`${API_URL}${img}`}
                            alt={`room-img-${i}`}
                            className="w-24 h-16 object-cover rounded"
                          />
                        ))}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
