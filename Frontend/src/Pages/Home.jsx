import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import SearchBar from '../Components/Search Box/SearchBox';
import Cards from '../Components/Cards/Cards';
import './Home.css';

const targeturl="https://depl-1.onrender.com"

async function fetchThumbnail(url) {
  try {
    const response = await axios.post(`${targeturl}/api/getThumbnail`, null, { headers: { 'url': url } });
    return response.data;
  } catch (error) {
    console.error('Error fetching thumbnail:', error);
    return null;
  }
}

function Home() {
  const nav = useNavigate();
  const [items, setItems] = useState([]);
  const [thumbnails, setThumbnails] = useState({});

  useEffect(() => {
    const fetchItemsAndThumbnails = async () => {
      try {
        const response = await axios.get(`${targeturl}/api/objectlist`);
        const items = response.data;
        setItems(items);

        const thumbnailsData = {};
        await Promise.all(items.map(async (item) => {
          const url = item.Key.substring(0, item.Key.indexOf(".")) + ".jpg";
          const thumbnail = await fetchThumbnail(url);
          thumbnailsData[item.Key] = thumbnail;
        }));
        setThumbnails(thumbnailsData);
      } catch (error) {
        console.error('Error fetching items:', error);
        nav('/error');
      }
    };

    fetchItemsAndThumbnails();
  }, [nav]);

  const handleCardClick = async (itemKey) => {
    try {
      const response = await axios.post(`${targeturl}/api/streamObject`, null, { headers: { 'url': itemKey } });
      nav(`/stream?url=${encodeURIComponent(response.data)}`);
    } catch (error) {
      console.error('Error streaming object:', error);
      nav('/error');
    }
  };

  return (
    <div className='Home'>
      <SearchBar />
      <div className='Container'>
        {items.map((item) => (
          <Cards
            key={item.Key}
            title={item.Key.substring(0, item.Key.indexOf("."))}
            thumbnail={thumbnails[item.Key]}
            redirectFunction={() => handleCardClick(item.Key)}
          />
        ))}
      </div>
    </div>
  );
}

export default Home;