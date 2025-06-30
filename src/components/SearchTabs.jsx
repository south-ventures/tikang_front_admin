// src/components/SearchTabs.jsx
import React, { useState } from 'react';

const tabs = ['All', 'Homes', 'Apartment', 'Hotels', 'Condo'];

export default function SearchTabs() {
  const [activeTab, setActiveTab] = useState('All');
  const [destination, setDestination] = useState('');

  return (
    <div className="bg-white shadow-md p-6 rounded-lg max-w-screen-lg mx-auto mt-10">
      {/* Tabs */}
      <div className="flex gap-6 border-b pb-2">
        {tabs.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`text-sm font-semibold px-4 py-2 rounded-full transition ${
              activeTab === tab
                ? 'bg-blue-600 text-white'
                : 'text-gray-700 hover:bg-blue-100'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="mt-4 flex gap-4">
        <input
          type="text"
          placeholder="Enter a destination or property"
          className="flex-1 px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={destination}
          onChange={(e) => setDestination(e.target.value)}
        />
        <button className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700">
          SEARCH
        </button>
      </div>
    </div>
  );
}