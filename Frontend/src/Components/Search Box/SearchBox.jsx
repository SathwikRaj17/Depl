import React, { useState } from 'react';
import './SearchBox.css';
import search from '../../assets/Search-logo.svg';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function SearchBox() {
  const [searchContent, setSearchContent] = useState('');
  const navigate = useNavigate();

  const searchHandler = async (event) => {
    event.preventDefault();
    try {
      const res = await axios.post(
        `http://localhost:3000/api/searchResult`,
        null,
        { headers: { searchWord: searchContent } }
      );
      console.log(res.data);
      navigate(`/result?data=${encodeURIComponent(JSON.stringify(res.data))}`);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  return (
    <div className="container">
      <form className="searchBox" onSubmit={searchHandler}>
        <input
          type="text"
          placeholder="Search here…"
          id="searchContent"
          value={searchContent}
          onChange={(e) => setSearchContent(e.target.value)}
        />
        <button type="submit" className="searchBtn">
          <img src={search} alt="Search" />
        </button>
      </form>
    </div>
  );
}

export default SearchBox;