<<<<<<< Updated upstream:src/header.tsx
import { FaSearch } from 'react-icons/fa';
=======
import { FaSearch } from "react-icons/fa";
import { FaFilter } from "react-icons/fa";
>>>>>>> Stashed changes:frontend/src/features/benches/components/header.tsx

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
<<<<<<< Updated upstream:src/header.tsx
=======

      <div className="flex items-center space-x-2 mr-4 cursor-pointer hover:text-gray-400">
        <h2 className="text-xl">Filter</h2>
        <FaFilter className="text-xl"></FaFilter>
      </div>
>>>>>>> Stashed changes:frontend/src/features/benches/components/header.tsx
    </div>
  );
};

<<<<<<< Updated upstream:src/header.tsx
export default HeaderComponent; // Export if this is a standalone header componenthttps://honestpaper.com.au/collections/new
=======
export default HeaderComponent; // Export if this is a standalone header component
>>>>>>> Stashed changes:frontend/src/features/benches/components/header.tsx
