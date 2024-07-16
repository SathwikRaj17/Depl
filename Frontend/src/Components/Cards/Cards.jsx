import React from 'react';
import './Cards.css';
import pic from "../../assets/thumbnail.jpg"
function Cards({ title, thumbnail, redirectFunction }) {

  return (
    <button type='button' onClick={redirectFunction} className='card'>
      <div className='thumbnail'>
        <img src={pic} alt={`${title} thumbnail`} />
      </div>
      <div className='title'>
        <h3>{title}</h3>
      </div>
    </button>
  );
}

export default Cards;
