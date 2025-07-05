import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import DashboardNavBar from '../../components/Navbar';

const API_ADMIN_URL = process.env.REACT_APP_API_URL_ADMIN || '';
export default function Account() {
  const { user } = useAuth();

  // Toggle edit state per section
  const [editPassword, setEditPassword] = useState(false);
  const [editLogo, setEditLogo] = useState(false);
  const [editBanners, setEditBanners] = useState(false);
  const [editGcashQR, setEditGcashQR] = useState(false);

  // Form states
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [logoFile, setLogoFile] = useState(null);

  const [bannerFiles, setBannerFiles] = useState([null, null, null, null, null]);

  const [gcashQRFile, setGcashQRFile] = useState(null);

  // Handle banner input change for each banner
  const handleBannerChange = (index, e) => {
    const file = e.target.files[0];
    setBannerFiles((prev) => {
      const newFiles = [...prev];
      newFiles[index] = file;
      return newFiles;
    });
  };

  const submitPasswordChange = async () => {
    if (!newPassword) {
      alert('Enter new password');
      return;
    }
    if (newPassword !== confirmPassword) {
      alert('Passwords do not match');
      return;
    }
  
    try {
      const token = localStorage.getItem('tikangToken');
      if (!token) throw new Error('No auth token found, please login again.');
  
      const res = await fetch(`${API_ADMIN_URL}/admin-change-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`, // use the token here
        },
        body: JSON.stringify({ new_password: newPassword }),
      });
  
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Failed to change password');
      }
  
      alert('Password changed successfully');
      setEditPassword(false);
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      alert(`Error: ${err.message}`);
    }
  };

  const submitLogoChange = async () => {
    if (!logoFile) {
      alert('Select a logo image');
      return;
    }
  
    if (logoFile.type !== 'image/png') {
      alert('Only PNG files are allowed for the logo.');
      return;
    }
  
    try {
      const token = localStorage.getItem('tikangToken');
      if (!token) throw new Error('No auth token found, please login again.');
  
      const formData = new FormData();
      formData.append('logo', logoFile);
  
      const res = await fetch(`${API_ADMIN_URL}/admin/change-logo`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`, // Auth header, no Content-Type for FormData
        },
        body: formData,
      });
  
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Failed to upload logo');
      }
  
      alert('Logo updated successfully');
      setEditLogo(false);
      setLogoFile(null);
    } catch (err) {
      alert(`Error: ${err.message}`);
    }
  };
  

  const submitBannersChange = async () => {
    // Check at least one banner selected
    if (!bannerFiles.some(file => file !== null)) {
      alert('Select at least one banner image');
      return;
    }
  
    // Validate all selected files are PNG
    for (const file of bannerFiles) {
      if (file && file.type !== 'image/png') {
        alert('Only PNG files are allowed for banners.');
        return;
      }
    }
  
    try {
      const token = localStorage.getItem('tikangToken');
      if (!token) throw new Error('Authentication token missing');
  
      const formData = new FormData();
  
      bannerFiles.forEach((file, index) => {
        if (file) {
          formData.append(`banner${index + 1}`, file);
        }
      });
  
      const response = await fetch(`${API_ADMIN_URL}/admin/change-banners`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`, // Auth header
          // Do NOT set Content-Type for FormData
        },
        body: formData,
      });
  
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to update banners');
      }
  
      alert('Banners updated successfully');
      setEditBanners(false);
      setBannerFiles([null, null, null, null, null]);
    } catch (err) {
      alert(`Error: ${err.message}`);
    }
  };
  

  const submitGcashQRChange = async () => {
    if (!gcashQRFile) {
      alert('Select a GCash QR image');
      return;
    }
  
    try {
      const token = localStorage.getItem('tikangToken');
      if (!token) throw new Error('Authentication token missing');
  
      const formData = new FormData();
      formData.append('gcash_qr', gcashQRFile);
  
      // Append user_id from your auth context or state (make sure you have user info)
      // Example: assuming you have user from useAuth
      formData.append('user_id', user?.user_id || user?.userId); 
  
      const response = await fetch(`${API_ADMIN_URL}/admin/change-gcash-qr`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          // Do NOT set Content-Type header when using FormData; browser sets it automatically
        },
        body: formData,
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update GCash QR');
      }
  
      alert('GCash QR updated successfully');
      setEditGcashQR(false);
      setGcashQRFile(null);
    } catch (err) {
      alert(`Error: ${err.message}`);
    }
  };
  
  return (
    <>
      <DashboardNavBar />

      <div className="p-6 max-w-3xl mx-auto bg-white shadow rounded-md space-y-8">
        {/* User greeting */}
        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Welcome, {user?.full_name || 'Loading...'}
          </h2>
        </section>

        {/* Tikang Cash (read only) */}
        <section className="border rounded-md p-4">
          <h3 className="text-xl font-semibold mb-2">💰 Tikang Cash Balance</h3>
          <p className="text-lg font-medium text-green-700">
            {user?.tikang_cash !== undefined
              ? `₱ ${Number(user.tikang_cash).toFixed(2)}`
              : 'Loading...'}
          </p>
        </section>

        {/* Change Password */}
        <section className="border rounded-md p-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-semibold">🔐 Change Password</h3>
            <button
              onClick={() => setEditPassword(!editPassword)}
              className="text-blue-600 hover:underline text-sm"
            >
              {editPassword ? 'Cancel' : 'Edit'}
            </button>
          </div>
          {editPassword && (
            <div className="space-y-3">
              <input
                type="password"
                placeholder="New Password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full border px-4 py-2 rounded-md"
              />
              <input
                type="password"
                placeholder="Confirm New Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full border px-4 py-2 rounded-md"
              />
              <button
                onClick={submitPasswordChange}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
              >
                Save Password
              </button>
            </div>
          )}
        </section>

       {/* Change Logo */}
        <section className="border rounded-md p-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-semibold">🖼️ Change Logo</h3>
            <button
              onClick={() => setEditLogo(!editLogo)}
              className="text-blue-600 hover:underline text-sm"
            >
              {editLogo ? 'Cancel' : 'Edit'}
            </button>
          </div>

          {/* Display current logo */}
          <img
            src={`${process.env.REACT_APP_API_URL}/uploads/logo/logo.png`}
            alt="Current Logo"
            className="w-32 h-auto mb-4 object-contain border rounded"
          />

          {editLogo ? (
            <>
              <input
                type="file"
                accept="image/png" // accept only PNG files
                onChange={(e) => setLogoFile(e.target.files[0])}
                className="block mb-1"
              />
              {/* Red warning text */}
              <p className="text-red-600 text-xs mb-3">* Only accepts PNG file</p>

              {logoFile && (
                <p className="text-sm text-gray-600">Selected: {logoFile.name}</p>
              )}
              <button
                onClick={submitLogoChange}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
              >
                Save Logo
              </button>
            </>
          ) : (
            <p className="text-gray-600">Upload a new logo image to update.</p>
          )}
        </section>

        {/* Change Banners */}
        <section className="border rounded-md p-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-semibold">📸 Change Banners</h3>
            <button
              onClick={() => setEditBanners(!editBanners)}
              className="text-blue-600 hover:underline text-sm"
            >
              {editBanners ? 'Cancel' : 'Edit'}
            </button>
          </div>

          {!editBanners && (
            <div className="flex flex-wrap gap-4 mb-4">
              {[1, 2, 3, 4, 5].map((num) => (
                <div key={num} className="w-32 h-20 border rounded overflow-hidden">
                  <img
                    src={`${process.env.REACT_APP_API_URL}/uploads/banners/banner${num}.png`}
                    alt={`Banner ${num}`}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.src = '/placeholder-banner.png'; // fallback image if missing
                    }}
                  />
                </div>
              ))}
            </div>
          )}

          {editBanners ? (
            <>
              {[0, 1, 2, 3, 4].map((idx) => (
                <div key={idx}>
                  <label className="block mb-1 font-medium">{`Banner ${idx + 1}`}</label>
                  <input
                    type="file"
                    accept="image/png" // accept only PNG files
                    onChange={(e) => handleBannerChange(idx, e)}
                    className="block"
                  />
                  {/* Red warning text */}
                  <p className="text-red-600 text-xs mb-1">* Only accepts PNG file</p>
                  {bannerFiles[idx] && (
                    <p className="text-sm text-gray-600">Selected: {bannerFiles[idx].name}</p>
                  )}
                </div>
              ))}
              {/* Hint text about recommended size */}
              <p className="text-gray-500 text-xs mb-3 italic">
                Recommended image size is 826x551 for better display.
              </p>
              <button
                onClick={submitBannersChange}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
              >
                Save Banners
              </button>
            </>
          ) : (
            <p className="text-gray-600">Upload up to 5 banner images.</p>
          )}
        </section>


        {/* Change Banners */}
        <section className="border rounded-md p-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-semibold">📸 Change Banners</h3>
            <button
              onClick={() => setEditBanners(!editBanners)}
              className="text-blue-600 hover:underline text-sm"
            >
              {editBanners ? 'Cancel' : 'Edit'}
            </button>
          </div>

          {!editBanners && (
            <div className="flex flex-wrap gap-4 mb-4">
              {[1, 2, 3, 4, 5].map((num) => (
                <div key={num} className="w-32 h-20 border rounded overflow-hidden">
                  <img
                    src={`${process.env.REACT_APP_API_URL}/uploads/banners/banner${num}.png`}
                    alt={`Banner ${num}`}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.src = '/placeholder-banner.png'; // fallback image if missing
                    }}
                  />
                </div>
              ))}
            </div>
          )}

          {editBanners ? (
            <div className="space-y-3">
                {/* Banner file inputs */}
                {[0, 1, 2, 3, 4].map((idx) => (
                  <div key={idx}>
                    <label className="block mb-1 font-medium">{`Banner ${idx + 1}`}</label>
                    <input
                      type="file"
                      accept="image/png"        // accept only PNG files
                      onChange={(e) => handleBannerChange(idx, e)}
                      className="block"
                    />
                    {bannerFiles[idx] && (
                      <p className="text-sm text-gray-600">Selected: {bannerFiles[idx].name}</p>
                    )}
                  </div>
                ))}
              <button
                onClick={submitBannersChange}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
              >
                Save Banners
              </button>
            </div>
          ) : (
            <p className="text-gray-600">Upload up to 5 banner images.</p>
          )}
        </section>


        {/* Change GCash QR */}
        <section className="border rounded-md p-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-semibold">💰 Change GCash QR</h3>
            <button
              onClick={() => setEditGcashQR(!editGcashQR)}
              className="text-blue-600 hover:underline text-sm"
            >
              {editGcashQR ? 'Cancel' : 'Edit'}
            </button>
          </div>

          {/* Display current QR */}
          {user?.gcash_qr ? (
            <img
              src={`${process.env.REACT_APP_API_URL}${user.gcash_qr}`}
              alt="Current GCash QR"
              className="w-48 h-48 object-contain border rounded-md mb-4"
            />
          ) : (
            <p className="text-gray-500 mb-4">No GCash QR uploaded yet.</p>
          )}

          {editGcashQR ? (
            <>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setGcashQRFile(e.target.files[0])}
                className="block mb-3"
              />
              {gcashQRFile && (
                <p className="text-sm text-gray-600">Selected: {gcashQRFile.name}</p>
              )}
              <button
                onClick={submitGcashQRChange}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
              >
                Save GCash QR
              </button>
            </>
          ) : (
            <p className="text-gray-600">Upload a new GCash QR image to update.</p>
          )}
        </section>
      </div>
    </>
  );
}
