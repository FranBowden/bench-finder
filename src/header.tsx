import React from 'react';
import { FaSearch } from 'react-icons/fa';
import { FaFilter } from "react-icons/fa";


const HeaderComponent = () => {
  return (
    <div className="bg-white shadow-lg p-3 grid grid-row-2 gap-3 items-center justify-between md:flex ">
      <h1 className="font-bold text-3xl">Bench Finder</h1>

      <div className=" col-span-2 items-center justify-center md:flex-grow">
        <div className="bg-gray-100 rounded-full w-full max-w-lg flex items-center px-4 py-2 shadow-sm">
          <FaSearch className="text-gray-400 mr-2" />
          <input
            type="text"
            placeholder="Search for a bench..."
            className="bg-transparent w-full focus:outline-none"
          />
        </div>
      </div>
    </div>
  );
};

export default HeaderComponent; // Export if this is a standalone header componenthttps://honestpaper.com.au/collections/new