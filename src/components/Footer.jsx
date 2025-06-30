// src/components/Footer.jsx
import React from 'react';

export default function Footer() {
  return (
    <footer className="bg-[#1a1a1a] text-gray-200 px-6 py-10 mt-16 border-t border-gray-700">
      <div className="max-w-screen-xl mx-auto flex flex-col md:flex-row justify-between gap-10">
        {/* Left Side */}
        <div className="max-w-sm">
          <img src="/assets/logo.png" alt="Tikang Logo" className="h-10 mb-2" />
          <h2 className="text-xl font-bold text-white">Tikang</h2>
          <p className="text-sm mt-2 text-gray-300">
            Find places that feel like home. Whether you're traveling or renting, Tikang makes it easy.
          </p>
          <p className="text-xs mt-4 text-gray-400">© 2025 Tikang. All rights reserved.</p>
        </div>

        {/* Right Side Sections */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6 text-sm">
          <div>
            <h3 className="font-semibold mb-2 text-white">Help</h3>
            <ul className="space-y-1 text-gray-300">
              <li>Help center</li>
              <li>FAQs</li>
              <li>Privacy policy</li>
              <li>Terms of use</li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold mb-2 text-white">Company</h3>
            <ul className="space-y-1 text-gray-300">
              <li>About us</li>
              <li>Careers</li>
              <li>Press</li>
              <li>Blog</li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold mb-2 text-white">Destinations</h3>
            <ul className="space-y-1 text-gray-300">
              <li>Countries</li>
              <li>Popular Routes</li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold mb-2 text-white">Partner with Us</h3>
            <ul className="space-y-1 text-gray-300">
              <li>Advertise</li>
              <li>Affiliates</li>
              <li>API Access</li>
            </ul>
          </div>
        </div>
      </div>
    </footer>
  );
}
