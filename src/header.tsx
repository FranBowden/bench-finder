import React from 'react';
import { FaSearch } from 'react-icons/fa'; // Make sure you have react-icons installed

const HeaderComponent = () => { // Renamed for clarity, assuming this is your header
  return (
    // This div is the main header container
    <div className="bg-white shadow-lg p-3 z-50 flex items-center justify-between">
      {/* Title on the left */}
      <h1 className="ml-4 font-bold text-3xl">Bench Finder</h1>

      {/* Centered Search Bar */}
      {/* flex-grow allows this div to take up available space, then its own flex centers its content */}
      <div className="flex-grow flex items-center justify-center">
        <div className="bg-gray-100 rounded-full w-full max-w-lg flex items-center px-4 py-2 shadow-sm">
          <FaSearch className="text-gray-400 mr-2" />
          <input
            type="text"
            placeholder="Search for a bench..."
            className="bg-transparent w-full focus:outline-none"
          />
        </div>
      </div>

      {/* Right-aligned placeholder for visual balance
          This div ensures the search bar is truly centered by taking up
          approximately the same space as the 'Bench Finder' title on the left.
          Adjust the 'w-[...px]' value if needed to visually balance the layout.
      */}
      <div className="w-[180px] h-8 flex-shrink-0">
        {/* You could add user icons, settings, etc., here later if desired */}
      </div>
    </div>
  );
};

export default HeaderComponent; // Export if this is a standalone header component