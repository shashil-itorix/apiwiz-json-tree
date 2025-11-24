import React, { useState } from 'react';

const SearchBar = ({ 
  onSearch, 
  searchResults, 
  currentResultIndex, 
  onNavigate,
  isSearching = false,
  totalMatches = 0,
  hasMoreResults = false
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    onSearch(value);
  };

  const handlePrevious = () => {
    if (searchResults.length > 0) {
      const newIndex = currentResultIndex > 0 
        ? currentResultIndex - 1 
        : searchResults.length - 1;
      onNavigate(newIndex);
    }
  };

  const handleNext = () => {
    if (searchResults.length > 0) {
      const newIndex = currentResultIndex < searchResults.length - 1 
        ? currentResultIndex + 1 
        : 0;
      onNavigate(newIndex);
    }
  };

  return (
    <div className="search-bar">
      <input
        type="text"
        className="search-input"
        placeholder="Search keys and values..."
        value={searchTerm}
        onChange={handleSearchChange}
      />
      
      {isSearching && (
        <div className="search-loading">
          <span className="loading-spinner">⌛</span>
          <span>Searching...</span>
        </div>
      )}
      
      {!isSearching && searchResults.length > 0 && (
        <div className="search-results-info">
          <span className="results-count">
            {currentResultIndex + 1} of {totalMatches}
            {hasMoreResults && <span className="more-indicator"> (100+ total)</span>}
          </span>
          <button 
            className="nav-button"
            onClick={handlePrevious}
            disabled={searchResults.length === 0}
            aria-label="Previous result"
          >
            ↑
          </button>
          <button 
            className="nav-button"
            onClick={handleNext}
            disabled={searchResults.length === 0}
            aria-label="Next result"
          >
            ↓
          </button>
        </div>
      )}
      
      {!isSearching && searchTerm && searchResults.length === 0 && (
        <span className="no-results">No results found</span>
      )}
    </div>
  );
};

export default SearchBar;
