import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Cards from '../Components/Cards/Cards';
import SearchBar from '../Components/Search Box/SearchBox';
import './Home.css';

const targeturl = 'http://localhost:3000'; 

async function fetchThumbnail(url) {
  try {
    const response = await axios.post(`${targeturl}/api/getThumbnail`, null, { headers: { 'url': url } });
    return response.data;
  } catch (error) {
    console.error('Error fetching thumbnail:', error);
    return null;
  }
}

async function processItems(data) {
  const items = JSON.parse(decodeURIComponent(data));
  const thumbnailsData = {};

  await Promise.all(items.map(async (item) => {
    const url = item.Key.substring(0, item.Key.indexOf(".")) + ".jpg";
    const thumbnail = await fetchThumbnail(url);
    thumbnailsData[item.Key] = thumbnail;
  }));

  return { items, thumbnailsData };
}

function Result() {
  const navigate = useNavigate();
  const [state, setState] = useState({ items: [], thumbnails: {} });
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const data = queryParams.get('data');

  let parsedData;
  try {
    parsedData = JSON.parse(decodeURIComponent(data));
  } catch (error) {
    console.error('Error parsing data:', error);
    parsedData = [];
  }

  if (state.items.length === 0 && parsedData.length > 0) {
    processItems(data).then(({ items, thumbnailsData }) => {
      setState({ items, thumbnails: thumbnailsData });
    }).catch(error => {
      console.error('Error processing items:', error);
      navigate('/error');
    });
  }

  const handleCardClick = async (itemKey) => {
    try {
      const response = await axios.post(`${targeturl}/api/streamObject`, null, { headers: { 'url': itemKey } });
      navigate(`/stream?url=${encodeURIComponent(response.data)}`);
    } catch (error) {
      console.error('Error streaming object:', error);
      navigate('/error');
    }
  };

  return (
    <div className='Home'>
      <SearchBar />
      <div className='Container'>
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