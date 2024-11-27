// src/App.js
import React, { useState, useEffect, useRef } from 'react';
import './App.css';

const AudioTrack = ({ name, audioFile, onRemove, trackId }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.5);
  const [isLooping, setIsLooping] = useState(false);
  const [waitTime, setWaitTime] = useState(0);
  const audioRef = useRef(null);
  const timeoutRef = useRef(null);

  useEffect(() => {
    // 新しいAudioインスタンスを作成
    const newAudio = new Audio(URL.createObjectURL(audioFile));
    newAudio.volume = volume;
    newAudio.loop = false;
    
    // エンドイベントリスナーを設定
    const handleEnd = () => {
      if (isLooping) {
        setIsPlaying(false);
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
        timeoutRef.current = setTimeout(() => {
          newAudio.currentTime = 0;
          newAudio.play().then(() => {
            setIsPlaying(true);
          }).catch(error => console.error('再生エラー:', error));
        }, waitTime);
      } else {
        setIsPlaying(false);
      }
    };

    newAudio.addEventListener('ended', handleEnd);
    audioRef.current = newAudio;
    
    return () => {
      newAudio.removeEventListener('ended', handleEnd);
      newAudio.pause();
      URL.revokeObjectURL(newAudio.src);
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [audioFile, isLooping, waitTime]); // 依存配列を修正

  const togglePlay = () => {
    if (isPlaying) {
      audioRef.current.pause();
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    } else {
      audioRef.current.play().catch(error => console.error('再生エラー:', error));
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

  const handleWaitTimeChange = (e) => {
    const newWaitTime = parseInt(e.target.value, 10);
    setWaitTime(newWaitTime);
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
        <div className="wait-time-control">
          <input
            type="number"
            min="0"
            step="100"
            value={waitTime}
            onChange={handleWaitTimeChange}
            className="wait-time-input"
            title="リピート前の待機時間(ms)"
          /> ms
        </div>
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
  const trackCounter = useRef(0);  // トラックの一意のIDを生成するためのカウンター

  const handleFileUpload = (file) => {
    setTracks(prev => [...prev, {
      id: trackCounter.current++,  // 一意のIDを割り当て
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
        {tracks.map((track) => (
          <AudioTrack
            key={track.id}  // keyを一意のIDに変更
            trackId={track.id}
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