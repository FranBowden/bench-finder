import { FaSearch, FaTimes, FaMapMarkerAlt } from "react-icons/fa";
import { useState, useEffect, useRef } from "react";
import { fetchSuggestions, type Suggestion } from "../api/fetchSuggestions";
import type { Place } from "@shared/types/place";

type SearchBarProps = {
  onSelect: (place: Place) => void;
};

export const SearchBar = ({ onSelect }: SearchBarProps) => {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Selecting a suggestion sets `query` to its full place name, which would
  // otherwise re-trigger the suggestions effect below and reopen the
  // dropdown ~300ms later. Set right before that query change, and
  // consumed (reset) by the very next effect run.
  const skipNextSuggestionsFetch = useRef(false);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setQuery(e.target.value);
  }

  function handleSelect(result: Suggestion) {
    skipNextSuggestionsFetch.current = true;
    setQuery(result.place_name || result.name || ""); // always string
    setSuggestions([]);
    onSelect(result);
  }

  function handleClear() {
    setQuery("");
    setSuggestions([]);
  }

  useEffect(() => {
    if (skipNextSuggestionsFetch.current) {
      skipNextSuggestionsFetch.current = false;
      return;
    }

    if (!query || query.length < 2) {
      setSuggestions([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    const timeout = setTimeout(async () => {
      try {
        const data = await fetchSuggestions(query);
        setSuggestions(data);
      } catch (err) {
        console.error("Failed to fetch suggestions:", err);
      } finally {
        setIsLoading(false);
      }
    }, 300);
    return () => clearTimeout(timeout);
  }, [query]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setSuggestions([]);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative w-full" ref={containerRef}>
      <div className="flex items-center w-full bg-[var(--color-bg)] border border-[var(--color-border)] rounded-full pl-4 pr-3 py-2.5 gap-2 transition-shadow focus-within:border-[var(--color-primary)] focus-within:ring-4 focus-within:ring-[var(--color-primary-100)]">
        <FaSearch className="text-[var(--color-text-muted)] shrink-0" size={14} />
        <input
          type="text"
          placeholder="Search a town or city for a bench"
          className="bg-transparent w-full text-sm text-[var(--color-text)] placeholder:text-[var(--color-text-muted)] focus:outline-none"
          value={query || ""}
          onChange={handleChange}
        />
        {isLoading && (
          <span
            className="w-3.5 h-3.5 border-2 border-[var(--color-border)] border-t-[var(--color-primary)] rounded-full animate-spin shrink-0"
            aria-hidden="true"
          />
        )}
        {!isLoading && query && (
          <button
            type="button"
            onClick={handleClear}
            aria-label="Clear search"
            className="text-[var(--color-text-muted)] hover:text-[var(--color-text)] shrink-0 p-1 -mr-1"
          >
            <FaTimes size={12} />
          </button>
        )}
      </div>

      {suggestions.length > 0 && (
        <ul className="absolute top-full left-0 right-0 mt-2 bg-[var(--color-surface)] rounded-2xl shadow-[var(--shadow-lg)] border border-[var(--color-border)] overflow-hidden z-50 max-h-72 overflow-y-auto scrollbar-thin">
          {suggestions.map((s) => (
            <li key={s.id}>
              <button
                type="button"
                onClick={() => handleSelect(s)}
                className="w-full flex items-start gap-2.5 text-left px-4 py-3 hover:bg-[var(--color-primary-50)] transition-colors border-b border-[var(--color-border)] last:border-b-0"
              >
                <FaMapMarkerAlt className="text-[var(--color-primary)] mt-0.5 shrink-0" size={13} />
                <span className="text-sm text-[var(--color-text)] leading-snug">{s.place_name}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
