import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Player from '../Components/VideoPlayer/Player';
import SearchBox from '../Components/Search Box/SearchBox';
import "./Stream.css";

function Stream() {
  const location = useLocation();
  const navigate = useNavigate();
  const queryParams = new URLSearchParams(location.search);
  const videoUrl = queryParams.get('url');

  const [url, setUrl] = useState(null);

  useEffect(() => {
    if (videoUrl) {
      setUrl(videoUrl);
    } else {
      navigate('/error');
    }
  }, [videoUrl, navigate]);

  if (!url) {
    return <div>Error: No video URL provided</div>;
  }

  return (
    <>
      <SearchBox />
      <div className='Streaming'>
        <Player link={url} />
      </div>
    </>
  );
}

export default Stream;
