import React from 'react';
import './SearchBar.css';

const SearchBar = ({ value, onChange, onSearch }) => {
  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      onSearch(value);
    }
  };

  return (
    <div className="search-bar-container">
      <input
        type="text"
        className="search-input"
        placeholder="Search for programming languages, frameworks, tools..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
      />
      <button 
        className="search-button" 
        onClick={() => onSearch(value)}
      >
        Search
      </button>
    </div>
  );
};

export default SearchBar;
