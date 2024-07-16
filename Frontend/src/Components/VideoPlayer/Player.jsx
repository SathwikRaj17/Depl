import React, { useEffect, useRef, useState } from 'react';
import muteicon from '../../assets/mute.svg';
import fullscreenicon from '../../assets/fullscreen.svg';
import exitfsicon from '../../assets/exitfs.svg';
import playicon from '../../assets/play.svg';
import pauseicon from '../../assets/pause.svg';
import unmuteicon from '../../assets/unmute.svg';
import './player.css';

const Player = ({ link }) => {
  const [fullscreeniconset, setFullscreenicon] = useState(fullscreenicon);
  const [soundicon, setSoundicon] = useState(unmuteicon);
  const [ppicons, seticons] = useState(pauseicon);
  const [prog, setProg] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const playerRef = useRef(null);
  const volumeRef = useRef(null);
  const setterRef = useRef(null);
  const containerRef = useRef(null);
  const hideControlsTimeoutRef = useRef(null);

  const togglePlayPause = () => {
    const player = playerRef.current;
    if (player.paused) {
      player.play();
      seticons(pauseicon);
    } else {
      player.pause();
      seticons(playicon);
    }
  };

  const toggleMute = () => {
    const player = playerRef.current;
    player.muted = !player.muted;
    setSoundicon(player.muted ? muteicon : unmuteicon);
  };

  const setVolume = () => {
    const player = playerRef.current;
    player.volume = volumeRef.current.value / 100;
    setSoundicon(player.volume > 0 ? unmuteicon : muteicon);
  };

  const handlePlaybackSpeed = (event) => {
    playerRef.current.playbackRate = event.target.value;
  };

  const toggleFullscreen = () => {
    if (!isFullscreen) {
      if (containerRef.current.requestFullscreen) {
        containerRef.current.requestFullscreen();
      } else if (containerRef.current.webkitRequestFullscreen) {
        containerRef.current.webkitRequestFullscreen();
      } else if (containerRef.current.msRequestFullscreen) {
        containerRef.current.msRequestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen();
      } else if (document.msExitFullscreen) {
        document.msExitFullscreen();
      }
    }
  };

  const setProgress = () => {
    const player = playerRef.current;
    player.currentTime = (setterRef.current.value / 100) * player.duration;
  };

  const showControlsTemporarily = () => {
    setShowControls(true);
    clearTimeout(hideControlsTimeoutRef.current);
    hideControlsTimeoutRef.current = setTimeout(() => setShowControls(false), 1000);
  };

  useEffect(() => {
    const player = playerRef.current;

    const updateProgress = () => {
      setProg((player.currentTime / player.duration) * 100);
    };

    const interval = setInterval(updateProgress, 1000);

    const handleKeyDown = (event) => {
      if (event.shiftKey && event.key === '>') {
        console.log('Shift and > were pressed together');
      } else if (event.key === ' ') {
        event.preventDefault();
        togglePlayPause();
      } else if (event.key === 'f' || event.key === 'F') {
        toggleFullscreen();
      } else if (event.key === 'ArrowRight') {
        player.currentTime += 10;
      } else if (event.key === 'ArrowLeft') {
        player.currentTime -= 10;
      } else if (event.key === 'm' || event.key === 'M') {
        toggleMute();
      } else if (event.key === 'Escape') {
        setIsFullscreen(false);
      }
    };

    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
      setFullscreenicon(!!document.fullscreenElement ? exitfsicon : fullscreenicon);
    };

    const handleMouseMove = () => {
      showControlsTemporarily();
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    containerRef.current.addEventListener('mousemove', handleMouseMove);

    return () => {
      clearInterval(interval);
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      containerRef.current.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  return (
    <div className={`videoPlayer ${isFullscreen ? 'fullscreen' : ''}`} ref={containerRef}>
      <video
        autoPlay
        src={link}
        id="player"
        ref={playerRef}
        onClick={togglePlayPause}
        controls={false}
      ></video>
      <div className={`controls ${showControls ? 'show' : 'hide'}`}>
        <button onClick={toggleMute}><img src={soundicon} alt="Sound Icon" /></button>
        <input
          type="range"
          id="audio"
          ref={volumeRef}
          onChange={setVolume}
          defaultValue="100"
          max="100"
          aria-label="Volume control"
        />
        <button onClick={togglePlayPause}><img src={ppicons} alt="Play/Pause Icon" /></button>
        <input
          type="range"
          onChange={setProgress}
          id="setter"
          ref={setterRef}
          value={prog}
          max="100"
          aria-label="Progress control"
        />
        <label>Playback Speed: <select className='playbackSpeed' onChange={handlePlaybackSpeed} defaultValue={1} >
          <option value={0.25}>0.25</option>
          <option value={0.5}>0.5</option>
          <option value={0.75}>0.75</option>
          <option value={1}>1</option>
          <option value={1.25}>1.25</option>
          <option value={1.5}>1.5</option>
          <option value={1.75}>1.75</option>
          <option value={2}>2</option>
        </select></label>
        <button onClick={toggleFullscreen}><img src={fullscreeniconset} alt="Fullscreen Icon" /></button>
      </div>
    </div>
  );
};

export default Player;
