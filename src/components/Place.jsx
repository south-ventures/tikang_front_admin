import React from 'react';

export default function Place({ home, onClose }) {
  if (!home) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-lg max-w-lg w-full overflow-hidden shadow-lg relative">
        {/* Close Button */}
        <button
          className="absolute top-2 right-2 text-gray-500 hover:text-black text-xl font-bold"
          onClick={onClose}
        >
          &times;
        </button>

        {/* Image */}
        <img
          src={home.image}
          alt={home.title}
          className="w-full h-64 object-cover"
        />

        {/* Content */}
        <div className="p-6 text-center">
          <h2 className="text-xl font-semibold text-gray-800 mb-2">{home.title}</h2>
          <p className="text-sm text-gray-500 mb-1">{home.location}</p>
          <p className="text-sm text-gray-600 mb-2">Rating: <strong>{home.rating}</strong></p>
          <p className="text-sm text-gray-600 mb-4">Price: <span className="text-red-500 font-semibold">{home.price}</span></p>

          <p className="text-sm text-gray-700 mb-4">
            Enjoy a relaxing stay with comfort, style, and convenience.
            Located in the heart of the city with easy access to top attractions.
            Perfect for families, couples, and business travelers.
          </p>

          <button
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md font-medium text-sm"
          >
            Click for more information
          </button>
        </div>
      </div>
    </div>
  );
}
