import { FaSearch } from "react-icons/fa";
import { useState, useEffect } from "react";
import { fetchSuggestions } from "../../../api/fetchSuggestions";

const SearchBar = ({ onSelect }: { onSelect: (id: string) => void }) => {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<any[]>([]);

  useEffect(() => {
    if (query.length < 2) {
      setSuggestions([]);
      return;
    }

    const timeout = setTimeout(async () => {
      const data = await fetchSuggestions(query);
      setSuggestions(data);
    }, 300);

    return () => clearTimeout(timeout);
  }, [query]);

  return (
    <div className="flex-grow flex items-center justify-center relative">
      <div className="bg-gray-100 rounded-full w-full max-w-lg flex items-center px-4 py-2 shadow-sm">
        <FaSearch className="text-gray-400 mr-2" />
        <input
          type="text"
          placeholder="Search for a bench..."
          className="bg-transparent w-full focus:outline-none"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      {suggestions.length > 0 && (
        <ul className="absolute bg-white shadow-md rounded-lg mt-2 w-full max-w-lg z-50">
          {suggestions.map((item) => (
            <li
              key={item.id}
              className="p-2 hover:bg-gray-200 cursor-pointer"
              onClick={() => {
                onSelect(item.id);
                setQuery(item.name);
                setSuggestions([]);
              }}
            >
              {item.name}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default SearchBar;
