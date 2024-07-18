import React from 'react';
import './SearchBox.css';
import search from '../../assets/Search-logo.svg';

function SearchBox() {
  let searchHandler=(event)=>
    {
      console.log(document.getElementById("searchContent"))
    }
  return (
    <div className="container">
      <form className="searchBox" method='post' action=''>
        <input type="text" placeholder="Search here…" id='seachContent'/>
        <button className="searchBtn" type="submit" aria-label="Search" onClick={searchHandler}>
          <img src={search} alt="Search" />
        </button>
        </form>
    </div>
  );
}

export default SearchBox;
