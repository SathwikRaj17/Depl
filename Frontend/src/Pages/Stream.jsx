import React from 'react'
import { useLocation } from 'react-router-dom'; 
import Player from '../Components/VideoPlayer/Player'
import SearchBox from '../Components/Search Box/SearchBox';
import "./Stream.css"
function Stream() {
let location = useLocation();
  return (
    <>
    <SearchBox />
    <div className='Streaming'><Player link={location.state.url}/></div>
    </>
  )
}

export default Stream