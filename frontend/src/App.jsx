import React, { useState, useEffect } from 'react';
import SearchBar from './components/SearchBar';
import SuggestionList from './components/SuggestionList';
import { fetchSuggestions } from './services/api';
import './App.css';

function App() {
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch suggestions as user types
  useEffect(() => {
    const handleInputChange = async () => {
      setLoading(true);
      try {
        const results = await fetchSuggestions(searchQuery);
        setSuggestions(results);
      } catch (error) {
        console.error('Error fetching suggestions:', error);
        setSuggestions([]);
      } finally {
        setLoading(false);
      }
    };

    // Debounce the search
    const timer = setTimeout(handleInputChange, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleSearch = (query) => {
    console.log('Searching for:', query);
    // Implement search functionality
  };

  const handleSelectSuggestion = (suggestion) => {
    setSearchQuery(suggestion);
  };

  return (
    <div className="app">
      <div className="container">
        <div className="header-section">
          <h1>Search Autocomplete Engine</h1>
          <p className="subtitle">Find words with smart autocomplete suggestions</p>
        </div>

        <div className="search-section">
          <SearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            onSearch={handleSearch}
          />

          {loading && <p className="loading">Loading suggestions...</p>}

          {searchQuery && (
            <SuggestionList
              suggestions={suggestions}
              onSelect={handleSelectSuggestion}
            />
          )}
        </div>
      </div>

      <footer className="footer">
        <p>Developed by <strong>Rishaw Prabhakar</strong></p>
      </footer>
    </div>
  );
}

export default App;
