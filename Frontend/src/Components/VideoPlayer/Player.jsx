import React, { useEffect, useRef } from 'react';
import './player.css';

const Player = ({ link }) => {
  const playerRef = useRef(null);

  const togglePlayPause = () => {
    const player = playerRef.current;
      if (player.paused) {
        player.play();
      } else {
        player.pause();
      }
  };

  useEffect(() => {
    const handleKeyDown = (event) => {
      const player = playerRef.current;
      if (event.key === "f" && player) {
        if (!document.fullscreenElement) {
          player.requestFullscreen();
        } else {
          document.exitFullscreen();
        }
      }
      if (event.key === " " && player) {
        event.preventDefault(); 
        togglePlayPause();
      }
      if(event.key==="ArrowRight" && player)
      {
        player.currentTime+=10;
      }
      if(event.key==="ArrowLeft" && player)
        {
          player.currentTime-=10;
        }
      if(event.key==="ArrowUp" && player.volume<1 && player )
        {
          player.volume+=0.1;
        }
      if(event.key==="ArrowDown" && player.volume>0 && player )
       {
          player.volume-=0.1;
       } 
      
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  return (
    <video
      autoPlay
      src={link}
      controlsList="nodownload"
      controls
      id='player'
      ref={playerRef}
    ></video>
  );
};

export default Player;
