"use client";

import { useState } from "react";
import { FaSearch } from "react-icons/fa";

interface SearchBarProps {
  onSearch: (value: string) => void;
}

const SearchBar = ({ onSearch }: SearchBarProps) => {
  const [query, setQuery] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    onSearch(value); // dispara a busca na Home
  };

  return (
    <div className="flex items-center justify-center w-full max-w-lg mx-auto mt-6">
      <div className="relative w-full">
        <input
          type="text"
          value={query}
          onChange={handleChange}
          placeholder="🔍 Buscar acessórios..."
          className="w-full px-5 py-3 pr-12 rounded-lg border-2 border-[#ffa9df] shadow-lg
          focus:ring-2 focus:ring-[#9061fa] focus:outline-none text-gray-700 font-medium
          placeholder-gray-400 bg-white"
        />
        <FaSearch className="absolute right-4 top-1/2 transform -translate-y-1/2 text-[#9061fa]" />
      </div>
    </div>
  );
};

export default SearchBar;
