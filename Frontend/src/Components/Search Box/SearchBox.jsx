import React from 'react';
import './SearchBox.css';
import search from '../../assets/Search-logo.svg';

function SearchBox() {
  return (
    <div className="container">
      <div className="searchBox">
        <input type="text" placeholder="Search here…" />
        <button className="searchBtn" type="submit" aria-label="Search">
          <img src={search} alt="Search" />
        </button>
      </div>
    </div>
  );
}

export default SearchBox;
