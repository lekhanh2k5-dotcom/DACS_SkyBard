import { createContext, useContext, useState, useEffect } from 'react';
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

  // Load tất cả bài hát từ thư mục songs khi khởi động
  useEffect(() => {
    const loadSongsFromFiles = async () => {
      if (window.api && window.api.getAllSongs) {
        try {
          const songsFromFiles = await window.api.getAllSongs();

          if (songsFromFiles && !songsFromFiles.error && Array.isArray(songsFromFiles)) {
            // Chuyển đổi array thành object với key
            const newSongs = {};
            let songIndex = Object.keys(mockSongs).length + 1;

            songsFromFiles.forEach((song, index) => {
              const songKey = `song_file_${songIndex++}`;
              newSongs[songKey] = {
                name: song.name || 'Unknown',
                author: song.author || 'Unknown',
                composer: song.transcribedBy || 'Unknown',
                fileName: song.fileName, // Lưu tên file để đọc sau
                price: 0,
                isOwned: true, // Tất cả bài từ file đều được sở hữu
                isFavorite: false,
                songNotes: song.songNotes || [],
                bpm: song.bpm,
                isFromFile: true // Đánh dấu đây là bài từ file
              };
            });

            // Merge với mockSongs
            setSongs(prev => ({ ...prev, ...newSongs }));
            console.log(`Đã load ${songsFromFiles.length} bài hát từ thư mục songs`);
          }
        } catch (error) {
          console.error('Error loading songs from files:', error);
        }
      }
    };

    loadSongsFromFiles();
  }, []);

  // --- HÀM PHÁT NHẠC: Xử lý cả bài từ mockSongs và từ file ---
  const playSong = async (songKey) => {
    const songMetadata = songs[songKey];
    if (!songMetadata) return;

    try {
      let fullSongData;

      // Kiểm tra xem bài hát có được load từ file không
      if (songMetadata.isFromFile && songMetadata.fileName) {
        // Nếu bài hát đã được load từ file, sử dụng data có sẵn
        fullSongData = {
          ...songMetadata,
          key: songKey
        };
        console.log(`Phát bài từ file: ${songMetadata.fileName}`);
      } else if (songMetadata.songNotes && songMetadata.songNotes.length > 0) {
        // Nếu bài hát có sẵn songNotes (từ mockSongs), phát luôn
        fullSongData = {
          ...songMetadata,
          key: songKey
        };
        console.log(`Phát bài từ mockSongs: ${songMetadata.name}`);
      } else {
        // Trường hợp khác: thử đọc file theo tên bài hát
        const fileName = `${songMetadata.name}.txt`;
        console.log(`Đang tải file: ${fileName}...`);

        const fileData = await window.api.readSong(fileName);

        if (fileData && !fileData.error) {
          const songContent = Array.isArray(fileData) ? fileData[0] : fileData;

          fullSongData = {
            ...songMetadata,
            ...songContent,
            key: songKey
          };
        } else {
          alert(`Không tìm thấy file nhạc: ${fileName}`);
          console.error("File error:", fileData?.error);
          return;
        }
      }

      // Cập nhật state và phát nhạc
      if (fullSongData && fullSongData.songNotes && fullSongData.songNotes.length > 0) {
        setCurrentSong(fullSongData);
        setIsPlaying(true);

        // Gửi lệnh phát xuống Main process
        if (window.api) {
          window.api.playOnline(fullSongData.songNotes);
        }
      } else {
        alert('Bài hát này chưa có nốt nhạc!');
      }

    } catch (error) {
      console.error("Lỗi khi phát nhạc:", error);
      alert('Có lỗi xảy ra khi phát nhạc!');
    }
  };

  const togglePlayback = () => {
    if (!currentSong) {
      alert('Vui lòng chọn bài hát trước!');
      return;
    }

    const newPlayingState = !isPlaying;
    setIsPlaying(newPlayingState);

    if (newPlayingState) {
      // Tiếp tục phát
      if (window.api && currentSong.songNotes) {
        window.api.playOnline(currentSong.songNotes);
      }
    } else {
      // Dừng phát
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
    playSong,        // <-- Xuất hàm mới này ra để Library dùng
    togglePlayback,
    buySong,
    toggleFavorite,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};