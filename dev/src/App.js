// src/App.js
import React, { useState, useEffect, useRef } from 'react';
import './App.css';

const AudioTrack = ({ name, audioFile, onRemove }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.5);
  const [isLooping, setIsLooping] = useState(false);
  const audioRef = useRef(null);

  useEffect(() => {
    audioRef.current = new Audio(URL.createObjectURL(audioFile));
    audioRef.current.volume = volume;
    audioRef.current.loop = isLooping;
    
    audioRef.current.addEventListener('ended', handleAudioEnd);
    
    return () => {
      audioRef.current.removeEventListener('ended', handleAudioEnd);
      audioRef.current.pause();
      URL.revokeObjectURL(audioRef.current.src);
      audioRef.current = null;
    };
  }, [audioFile]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.loop = isLooping;
    }
  }, [isLooping]);

  const handleAudioEnd = () => {
    if (!isLooping) {
      setIsPlaying(false);
    }
  };

  const togglePlay = () => {
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const toggleLoop = () => {
    setIsLooping(!isLooping);
  };

  const handleVolumeChange = (e) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    audioRef.current.volume = newVolume;
  };

  return (
    <div className="track-container">
      <div className="track-info">
        <span className="track-name">{name}</span>
      </div>
      <div className="track-controls">
        <button 
          className={`play-button ${isPlaying ? 'playing' : ''}`}
          onClick={togglePlay}
        >
          {isPlaying ? '⏸' : '▶'}
        </button>
        <button 
          className={`loop-button ${isLooping ? 'active' : ''}`}
          onClick={toggleLoop}
          title="リピート再生"
        >
          🔁
        </button>
        <input
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={volume}
          onChange={handleVolumeChange}
          className="volume-slider"
        />
        <span className="volume-label">{Math.round(volume * 100)}%</span>
        <button 
          className="remove-button"
          onClick={() => onRemove(name)}
        >
          ✕
        </button>
      </div>
    </div>
  );
};

const FileUpload = ({ onFileUpload }) => {
  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    files.forEach(file => {
      if (file.type.startsWith('audio/')) {
        onFileUpload(file);
      }
    });
  };

  return (
    <div className="file-upload">
      <input
        type="file"
        accept="audio/*"
        multiple
        onChange={handleFileChange}
        id="file-input"
        className="file-input"
      />
      <label htmlFor="file-input" className="file-label">
        オーディオファイルを選択
      </label>
    </div>
  );
};

const App = () => {
  const [tracks, setTracks] = useState([]);

  const handleFileUpload = (file) => {
    setTracks(prev => [...prev, {
      name: file.name,
      audioFile: file
    }]);
  };

  const handleRemoveTrack = (name) => {
    setTracks(prev => prev.filter(track => track.name !== name));
  };

  return (
    <div className="app-container">
      <h1>マルチトラックプレイヤー</h1>
      <FileUpload onFileUpload={handleFileUpload} />
      <div className="tracks-container">
        {tracks.map((track, index) => (
          <AudioTrack
            key={index}
            name={track.name}
            audioFile={track.audioFile}
            onRemove={handleRemoveTrack}
          />
        ))}
      </div>
    </div>
  );
};

export default App;