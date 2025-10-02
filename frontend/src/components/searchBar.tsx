
import { FaSearch } from "react-icons/fa";
import { useState, useEffect } from "react";
import { fetchSuggestions, resetSessionToken} from "../api/fetchSuggestions";

const SearchBar = ({ onSelect }: { onSelect: (id: string) => void }) => {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<any[]>([]);

   async function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setQuery(e.target.value);
    const results = await fetchSuggestions(e.target.value);
    setSuggestions(results);
  }
    function handleSelect(result: any) {
    console.log("User picked:", result);
    resetSessionToken(); // ready for next search session
    setQuery(result.place_name); // for example, fill input with selection
    setSuggestions([]);
  }

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
    <div className="relative w-full max-w-lg">
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
    <ul className="absolute top-full left-0 right-0 rounded-lg z-50 mt-1">
            {suggestions.map((s, i) => (
          <li className="m-1 bg-white rounded-full px-4 py-2 shadow-md cursor-pointer hover:bg-lime-600"
 key={i} onClick={() => handleSelect(s)}>
            {s.name}
          </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default SearchBar;

