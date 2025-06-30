import React, { useState } from "react";

const WarningPop = ({ message, type, onClose, onConfirm, onCancel }) => {
  const isConfirm = typeof onConfirm === "function" && typeof onCancel === "function";
  const [loading, setLoading] = useState(false);

  const handleConfirm = async () => {
    if (loading) return;
    setLoading(true);
    try {
      await onConfirm();
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async () => {
    if (loading) return;
    setLoading(true);
    try {
      await onCancel();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="z-30 fixed bottom-8 right-8 bg-white border border-gray-300 rounded-lg shadow-xl w-72 p-4">
      <p className={`text-${type === "success" ? "green" : type === "error" ? "red" : "gray"}-700 text-sm mb-4`}>
        {message}
      </p>
      <div className="flex justify-end gap-2">
        {isConfirm ? (
          <>
            <button
              onClick={handleCancel}
              disabled={loading}
              className={`px-3 py-1 rounded text-sm ${loading ? "bg-gray-300" : "bg-gray-200"}`}
            >
              No
            </button>
            <button
              onClick={handleConfirm}
              disabled={loading}
              className={`px-3 py-1 text-white rounded text-sm ${loading ? "bg-red-400" : "bg-red-600"}`}
            >
              {loading ? "Processing..." : "Yes"}
            </button>
          </>
        ) : (
          <button
            onClick={onClose}
            className="px-3 py-1 bg-blue-600 text-white rounded text-sm"
          >
            OK
          </button>
        )}
      </div>
    </div>
  );
};

export default WarningPop;
