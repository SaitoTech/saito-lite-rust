import React from 'react';

const Header = () => {
  // Styles are defined in web/css/component-header.css
  return (
    <header className="saito-header">
      <img src="/saito/img/logo.svg" alt="Saito Logo" />
      <h1 className="saito-header-title">Saito Block Explorer</h1>
      {/* Placeholder for navigation, search bar */}
      <nav className="saito-header-nav">
        {/* Links can go here */}
      </nav>
    </header>
  );
};

export default Header; 