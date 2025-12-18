import { createContext, useContext, useState } from 'react';
import { mockSongs } from '../data/songs';

const AppContext = createContext();

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
};

export const AppProvider = ({ children }) => {
  const [songs, setSongs] = useState(mockSongs);
  const [currentSong, setCurrentSong] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeTab, setActiveTab] = useState('store');
  const [activeLibraryTab, setActiveLibraryTab] = useState('all');
  const [playbackMode, setPlaybackMode] = useState('once');
  const [playbackSpeed, setPlaybackSpeed] = useState(1.0);

  const selectSong = (songData) => {
    setCurrentSong(songData);
    setIsPlaying(false);
  };

  const togglePlayback = () => {
    if (!currentSong) {
      alert('Vui lòng chọn bài hát trước!');
      return;
    }
    
    const newPlayingState = !isPlaying;
    setIsPlaying(newPlayingState);

    if (newPlayingState) {
      if (window.api && currentSong.songNotes) {
        window.api.playOnline(currentSong.songNotes);
      }
    } else {
      if (window.api) {
        window.api.stopMusic();
      }
    }
  };

  const buySong = (songKey, price) => {
    if (confirm(`Mua bài "${songs[songKey].name}" giá ${price} xu?`)) {
      setSongs(prev => ({
        ...prev,
        [songKey]: { ...prev[songKey], isOwned: true }
      }));
      return true;
    }
    return false;
  };

  const toggleFavorite = (songKey) => {
    setSongs(prev => ({
      ...prev,
      [songKey]: { ...prev[songKey], isFavorite: !prev[songKey].isFavorite }
    }));
  };

  const value = {
    songs,
    currentSong,
    isPlaying,
    activeTab,
    activeLibraryTab,
    playbackMode,
    playbackSpeed,
    setActiveTab,
    setActiveLibraryTab,
    setPlaybackMode,
    setPlaybackSpeed,
    selectSong,
    togglePlayback,
    buySong,
    toggleFavorite,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};
