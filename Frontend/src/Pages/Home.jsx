import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import SearchBar from '../Components/Search Box/SearchBox';
import Cards from '../Components/Cards/Cards';
import './Home.css';

const API_BASE_URL = "https://depl-1.onrender.com/api";

function fetchThumbnail(url) {
  return axios.post(`${API_BASE_URL}/getObject`, null, { headers: { 'url': url } })
    .then(response => response.data)
    .catch(error => {
      console.error('Error fetching thumbnail:', error);
      return null;
    });
}

function Home() {
  const nav = useNavigate();
  const [items, setItems] = useState([]);
  const [thumbnails, setThumbnails] = useState({});

  useEffect(() => {
    axios.get(`${API_BASE_URL}/objectList`)
      .then(response => {
        const items = response.data;
        setItems(items);

        const fetchThumbnails = async () => {
          const thumbnailsData = {};
          for (const item of items) {
            const url = await fetchThumbnail(item.Key);
            thumbnailsData[item.Key] = url;
          }
          setThumbnails(thumbnailsData);
        };

        fetchThumbnails();
      })
      .catch(error => {
        console.error('Error fetching items:', error);
        nav('/error');
      });
  }, [nav]);

  return (
    <div className='Home'>
      <SearchBar />
      <div className='Container'>
        {items.map((item) => (
          <Cards
            key={item.Key}
            title={item.Key}
            thumbnail={thumbnails[item.Key]}
            redirectFunction={() => {
              axios.post(`${API_BASE_URL}/streamObject`, null, { headers: { 'url': item.Key } })
                .then((response) => {
                  console.log(response.data);
                  nav('/stream', { state: { url: response.data } });
                })
                .catch(error => {
                  console.error('Error streaming object:', error);
                  nav('/error');
                });
            }}
          />
        ))}
      </div>
    </div>
  );
}

export default Home;