import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Cards from '../Components/Cards/Cards';
import SearchBar from '../Components/Search Box/SearchBox';
import './Home.css';

const targeturl="https://depl-1.onrender.com"

function Result() {
  const navigate = useNavigate();
  const [state, setState] = useState({ items: [], thumbnails: {} });
  const location = useLocation();

  const fetchThumbnail = async (url) => {
    try {
      const response = await axios.post(`${targeturl}/api/getThumbnail`, null, { headers: { url } });
      return response.data;
    } catch (error) {
      console.error('Error fetching thumbnail:', error);
      return null;
    }
  };

  const processItems = async (data) => {
    const items = JSON.parse(decodeURIComponent(data));
    const thumbnailsData = {};

    await Promise.all(items.map(async (item) => {
      const url = item.Key.substring(0, item.Key.indexOf(".")) + ".jpg";
      const thumbnail = await fetchThumbnail(url);
      thumbnailsData[item.Key] = thumbnail;
    }));

    return { items, thumbnailsData };
  };

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const data = queryParams.get('data');

    let parsedData;
    try {
      parsedData = JSON.parse(decodeURIComponent(data));
    } catch (error) {
      console.error('Error parsing data:', error);
      parsedData = [];
    }

    if (parsedData.length > 0) {
      processItems(data).then(({ items, thumbnailsData }) => {
        setState({ items, thumbnails: thumbnailsData });
      }).catch(error => {
        console.error('Error processing items:', error);
        navigate('/error');
      });
    }
  }, [location.search, navigate]);

  const handleCardClick = async (itemKey) => {
    try {
      const response = await axios.post(`${targeturl}/api/streamObject`, null, { headers: { url: itemKey } });
      navigate(`/stream?url=${encodeURIComponent(response.data)}`);
    } catch (error) {
      console.error('Error streaming object:', error);
      navigate('/error');
    }
  };

  return (
    <div className='Home'>
      <SearchBar />
      <div className='cardHolder'>
        {state.items.map((item) => (
          <Cards
            key={item.Key}
            title={item.Key.substring(0, item.Key.indexOf("."))}
            thumbnail={state.thumbnails[item.Key]}
            redirectFunction={() => handleCardClick(item.Key)}
          />
        ))}
      </div>
    </div>
  );
}

export default Result;