import React, { useState } from 'react';

// Accept props for search handlers
const Header = ({ onAddressSearch, onBlockHashSearch }) => {
  const [searchTerm, setSearchTerm] = useState('');

  // Handle input changes
  const handleChange = (event) => {
    setSearchTerm(event.target.value);
  };

  // Validate and perform search
  const handleSearch = () => {
    const term = searchTerm.trim();
    if (!term) return;

    // Basic Regex for Base58-like address (44/45 chars, excludes O, I, l, 0)
    // Note: This is a basic check, might not cover all edge cases perfectly.
    // A dedicated Base58 validation library would be more robust.
    const addressRegex = /^[1-9A-HJ-NP-Za-km-z]{44,45}$/;
    // Basic Regex for Hex hash (64 hex characters)
    const hashRegex = /^[a-f0-9]{64}$/i; // Case-insensitive

    if (addressRegex.test(term)) {
      console.log("Search Type: Address", term);
      if (onAddressSearch) {
          onAddressSearch(term); // Call parent handler
      } else {
          console.warn("onAddressSearch handler not provided to Header");
          alert(`Address search (no handler): ${term}`); 
      }
    } else if (hashRegex.test(term)) {
      console.log("Search Type: Block Hash", term);
      if (onBlockHashSearch) {
          onBlockHashSearch(term); // Call parent handler
      } else {
          console.warn("onBlockHashSearch handler not provided to Header");
          alert(`Block search (no handler): ${term}`); 
      }
    } else {
      console.log("Search Type: Invalid", term);
      // Use siteMessage for feedback
      if (window.siteMessage) {
        window.siteMessage("Unrecognised input", 3000); 
      } else {
        // Fallback if siteMessage isn't available
        console.warn("siteMessage function not found. Falling back to alert.");
        alert("Unrecognised input"); 
      }
    }
    
    // Clear search term after search is handled
    setSearchTerm(''); 
  };

  // Handle Enter key press in input
  const handleKeyDown = (event) => {
    if (event.key === 'Enter') {
      handleSearch();
    }
  };

  // Styles are defined in web/css/component-header.css
  return (
    <header className="saito-header">
      {/* Uncomment the Saito logo */}
      <img src="/saito/img/logo.svg" alt="Saito Logo" /> 
      <h1 className="saito-header-title">Block Explorer</h1>
      {/* Container for right-aligned items */}
      <div className="header-controls">
        {/* Placeholder for navigation, search bar */}
        {/* <nav className="saito-header-nav">
          {/* Navigation links go here */}
        {/* </nav> */}

        {/* Search Input and Icon */}
        <div className="header-search">
          <input 
            type="text" 
            placeholder="Search block hash or address..."
            className="search-input" 
            value={searchTerm}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
          />
          <span className="search-icon" onClick={handleSearch} style={{ cursor: 'pointer' }}>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
            </svg>
          </span>
        </div>
      </div>
    </header>
  );
};

export default Header; 