
import { FaSearch } from "react-icons/fa";
import { useState, useEffect } from "react";
import { fetchSuggestions} from "../api/fetchSuggestions";
import { fetchBenches } from '../api/fetchBenches'
import {Place} from '../../../shared/types/place'

type SearchBarProps = {
  onSelect: (place: Place) => void;
  radius: number | 500;
  setCachedBenches: any | undefined;
};

const SearchBar = ({ onSelect, radius, setCachedBenches }: SearchBarProps) => {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<any[]>([]);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setQuery(e.target.value);
  }
 
  async function updateLocation(location: Place) {
    
      const benches = await fetchBenches({ lat: location.lat, lng: location.lng }, radius);
       setCachedBenches(benches);
  }

  function handleSelect(result: any) {
    console.log("User picked:", result);

    setQuery(result.place_name || result.name || ""); // always string
    setSuggestions([]);
    onSelect(result);
    updateLocation(result);
  }
  
    useEffect(() => {
    if (!query || query.length < 2) {
      setSuggestions([]);
      return;
    }
    //  console.log(suggestions)

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
          placeholder="Search town or city for a bench"
          className="bg-transparent w-full focus:outline-none"
          value={query || ""}  
          onChange={handleChange}

        />
      </div>
      {suggestions.length > 0 && (
      <ul className="absolute top-full left-0 right-0 rounded-lg z-50 mt-1">
            {suggestions.map((s, i) => (
          <li className="m-1 bg-white rounded-full px-4 py-2 shadow-md cursor-pointer hover:bg-lime-600"
            key={i} onClick={() => {
           // console.log("Selected:", s.name);
           // console.log("Latitude:", s.lat, "Longitude:", s.lng);

            handleSelect(s);
              
            }}>
            {s.place_name}
          </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default SearchBar;

