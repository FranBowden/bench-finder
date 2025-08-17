import React from 'react';
import { FaSearch } from 'react-icons/fa';
import { FaFilter } from "react-icons/fa";


const HeaderComponent = () => {
  return (
    <div className="bg-white shadow-lg p-3 z-50 flex items-center justify-between">
      <h1 className="ml-4 font-bold text-3xl">Bench Finder</h1>

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

      <div className="flex items-center space-x-2 mr-4 cursor-pointer hover:text-gray-400">
        <h2 className='text-xl'>Filter</h2>
       <FaFilter className='text-xl'></FaFilter>
      </div>
    </div>
  );
};

export default HeaderComponent; // Export if this is a standalone header component