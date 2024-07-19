import React, { useState } from 'react';
import './SearchBox.css';
import search from '../../assets/Search-logo.svg';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';

function SearchBox() {
  const [searchContent, setSearchContent] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

  const searchHandler = async (event) => {
    event.preventDefault();
    try {
      const res = await axios.post(
        `https://depl-1.onrender.com/api/searchResult`,
        null,
        { headers: { searchWord: searchContent } }
      );
      console.log(res.data);

      const queryParams = new URLSearchParams({
        data: JSON.stringify(res.data)
      }).toString();

      if (location.pathname === '/result') {
        navigate(`${location.pathname}?${queryParams}`, { replace: true });
      } else {
        navigate(`/result?${queryParams}`);
      }
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