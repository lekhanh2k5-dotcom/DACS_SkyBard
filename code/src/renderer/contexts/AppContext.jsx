import { createContext, useContext, useState, useEffect } from 'react';
import { mockSongs } from '../data/songs';
import { fetchSongsFromFirebase, listenToSongs } from '../../services/firebaseService';

const AppContext = createContext();

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
};

export const AppProvider = ({ children }) => {
  const [songs, setSongs] = useState({});
  const [loading, setLoading] = useState(true);
  const [currentSong, setCurrentSong] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeTab, setActiveTab] = useState('store');
  const [activeLibraryTab, setActiveLibraryTab] = useState('all');
  const [playbackMode, setPlaybackMode] = useState('once');
  const [playbackSpeed, setPlaybackSpeed] = useState(1.0);
  const [currentTime, setCurrentTime] = useState(0); // Thời gian hiện tại (ms)
  const [duration, setDuration] = useState(0); // Tổng thời gian bài hát (ms)
  const [startTime, setStartTime] = useState(0); // Thời điểm bắt đầu phát

  // Load bài hát từ 3 nguồn: mockSongs + local files + Firebase
  useEffect(() => {
    const loadAllSongs = async () => {
      try {
        setLoading(true);
        console.log('🚀 Bắt đầu load songs...');
        let allSongs = { ...mockSongs }; // Bắt đầu với mockSongs
        console.log('✅ mockSongs loaded:', Object.keys(mockSongs).length);

        // 1. Load từ file local (nếu có window.api)
        if (window.api && window.api.getAllSongs) {
          try {
            console.log('📂 Đang load từ file local...');
            const localSongs = await window.api.getAllSongs();

            if (localSongs && !localSongs.error && Array.isArray(localSongs)) {
              let songIndex = Object.keys(allSongs).length + 1;
              localSongs.forEach((song) => {
                const songKey = `song_local_${songIndex++}`;
                allSongs[songKey] = {
                  name: song.name || 'Unknown',
                  author: song.author || 'Unknown',
                  composer: song.transcribedBy || 'Unknown',
                  fileName: song.fileName,
                  price: 0,
                  isOwned: true,
                  isFavorite: false,
                  songNotes: song.songNotes || [],
                  bpm: song.bpm,
                  isFromFile: true
                };
              });
              console.log(`✅ Đã load ${localSongs.length} bài từ file local`);
            }
          } catch (error) {
            console.error('⚠️ Lỗi khi load file local:', error);
          }
        }

        // 2. Load từ Firebase (KHÔNG block render nếu lỗi)
        fetchSongsFromFirebase()
          .then(firebaseSongs => {
            if (firebaseSongs && firebaseSongs.length > 0) {
              setSongs(prev => {
                const updated = { ...prev };
                firebaseSongs.forEach(song => {
                  updated[`firebase_${song.id}`] = {
                    ...song,
                    isFromFirebase: true
                  };
                });
                console.log(`✅ Đã load ${firebaseSongs.length} bài từ Firebase`);
                return updated;
              });
            } else {
              console.log('⚠️ Firebase trống hoặc chưa có dữ liệu');
            }
          })
          .catch(error => {
            console.error('⚠️ Lỗi khi load Firebase:', error);
          });

        setSongs(allSongs);
        console.log(`🎵 Tổng cộng: ${Object.keys(allSongs).length} bài hát`);
      } catch (error) {
        console.error('❌ Lỗi khi load songs:', error);
        setSongs(mockSongs); // Fallback
      } finally {
        setLoading(false);
      }
    };

    loadAllSongs();

    // Setup realtime listener cho Firebase (optional) - KHÔNG block
    try {
      const unsubscribe = listenToSongs((updatedFirebaseSongs) => {
        setSongs(prev => {
          const newSongs = { ...prev };

          // Xóa các bài Firebase cũ
          Object.keys(newSongs).forEach(key => {
            if (key.startsWith('firebase_')) {
              delete newSongs[key];
            }
          });

          // Thêm bài Firebase mới
          updatedFirebaseSongs.forEach(song => {
            newSongs[`firebase_${song.id}`] = {
              ...song,
              isFromFirebase: true
            };
          });

          console.log('🔄 Firebase realtime update');
          return newSongs;
        });
      });

      return () => {
        if (unsubscribe) unsubscribe();
      };
    } catch (error) {
      console.error('⚠️ Không thể setup Firebase listener:', error);
    }
  }, []);

  // --- HÀM CHỌN BÀI HÁT: Chỉ load và set currentSong, không phát ---
  const selectSong = async (songKey) => {
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
        console.log(`Chọn bài từ file: ${songMetadata.fileName}`);
      } else if (songMetadata.songNotes && songMetadata.songNotes.length > 0) {
        // Nếu bài hát có sẵn songNotes (từ mockSongs)
        fullSongData = {
          ...songMetadata,
          key: songKey
        };
        console.log(`Chọn bài từ mockSongs: ${songMetadata.name}`);
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

      // Chỉ cập nhật currentSong, KHÔNG phát nhạc
      if (fullSongData && fullSongData.songNotes && fullSongData.songNotes.length > 0) {
        setCurrentSong(fullSongData);
        setIsPlaying(false); // Đặt về trạng thái dừng

        // Tính tổng thời gian bài hát (lấy time của note cuối cùng)
        const lastNote = fullSongData.songNotes[fullSongData.songNotes.length - 1];
        const totalDuration = lastNote ? lastNote.time + 1000 : 0; // +1s buffer
        setDuration(totalDuration);
        setCurrentTime(0);

        // Dừng nhạc đang phát (nếu có)
        if (window.api) {
          window.api.stopMusic();
        }

        console.log(`Đã chọn bài: ${fullSongData.name}, Duration: ${totalDuration}ms`);
      } else {
        alert('Bài hát này chưa có nốt nhạc!');
      }

    } catch (error) {
      console.error("Lỗi khi chọn bài hát:", error);
      alert('Có lỗi xảy ra khi chọn bài hát!');
    }
  };

  // useEffect để cập nhật thời gian khi đang phát
  useEffect(() => {
    let interval;

    if (isPlaying && currentSong) {
      // Lưu thời điểm bắt đầu
      const playStartTime = Date.now();
      const initialTime = currentTime;

      interval = setInterval(() => {
        const elapsed = Date.now() - playStartTime;
        // Áp dụng playbackSpeed vào thời gian
        const newTime = initialTime + (elapsed * playbackSpeed);

        if (newTime >= duration) {
          // Hết bài
          setCurrentTime(duration);
          setIsPlaying(false);
          if (window.api) {
            window.api.stopMusic();
          }
        } else {
          setCurrentTime(newTime);
        }
      }, 100); // Update mỗi 100ms
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isPlaying, currentSong, duration, playbackSpeed]);

  // useEffect để phát lại với tốc độ mới khi thay đổi speed trong khi đang phát
  useEffect(() => {
    if (isPlaying && currentSong && window.api) {
      // Dừng và phát lại với tốc độ mới
      window.api.stopMusic();

      const notesToPlay = currentSong.songNotes
        .filter(note => note.time >= currentTime)
        .map(note => ({
          ...note,
          time: (note.time - currentTime) / playbackSpeed
        }));

      setTimeout(() => {
        window.api.playOnline(notesToPlay);
      }, 50);
    }
  }, [playbackSpeed]); // Chỉ trigger khi thay đổi playbackSpeed

  const togglePlayback = () => {
    if (!currentSong) {
      alert('Vui lòng chọn bài hát trước!');
      return;
    }

    const newPlayingState = !isPlaying;
    setIsPlaying(newPlayingState);

    if (newPlayingState) {
      // Phát nhạc từ vị trí hiện tại
      if (window.api && currentSong.songNotes) {
        console.log(`Bắt đầu phát: ${currentSong.name} từ ${currentTime}ms với tốc độ ${playbackSpeed}x`);

        // Lọc notes từ thời điểm hiện tại và áp dụng tốc độ
        const notesToPlay = currentSong.songNotes
          .filter(note => note.time >= currentTime)
          .map(note => ({
            ...note,
            time: (note.time - currentTime) / playbackSpeed // Adjust time với speed
          }));

        window.api.playOnline(notesToPlay);
        setStartTime(Date.now());
      }
    } else {
      // Dừng phát
      if (window.api) {
        console.log('Dừng phát nhạc');
        window.api.stopMusic();
      }
    }
  };

  // Hàm tua đến vị trí cụ thể
  const seekTo = (timeMs) => {
    setCurrentTime(timeMs);

    if (isPlaying && window.api && currentSong) {
      // Nếu đang phát, dừng và phát lại từ vị trí mới
      window.api.stopMusic();

      const notesToPlay = currentSong.songNotes
        .filter(note => note.time >= timeMs)
        .map(note => ({
          ...note,
          time: (note.time - timeMs) / playbackSpeed // Áp dụng speed khi tua
        }));

      setTimeout(() => {
        window.api.playOnline(notesToPlay);
      }, 100);
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

  // Hàm import file nhạc từ máy tính
  const importSongFile = async () => {
    if (!window.api || !window.api.importSongFile) {
      alert('Tính năng import không khả dụng!');
      return;
    }

    try {
      const result = await window.api.importSongFile();

      if (result.canceled) {
        return; // Người dùng hủy
      }

      if (result.error) {
        alert(`Lỗi khi import file: ${result.error}`);
        return;
      }

      if (result.success && result.songData) {
        // Tạo key mới cho bài hát
        const songKey = `song_imported_${Date.now()}`;
        const newSong = {
          name: result.songData.name || 'Unknown',
          author: result.songData.author || 'Unknown',
          composer: result.songData.transcribedBy || 'Unknown',
          fileName: result.fileName,
          price: 0,
          isOwned: true,
          isFavorite: false,
          songNotes: result.songData.songNotes || [],
          bpm: result.songData.bpm,
          isFromFile: true,
          isImported: true
        };

        // Thêm bài hát mới vào danh sách
        setSongs(prev => ({
          ...prev,
          [songKey]: newSong
        }));

        // Tự động chọn bài vừa import
        await selectSong(songKey);

        alert(`Đã import thành công: ${newSong.name}`);
        console.log(`Imported song: ${newSong.name}`);
      }
    } catch (error) {
      console.error('Error in importSongFile:', error);
      alert('Có lỗi xảy ra khi import file!');
    }
  };

  const value = {
    songs,
    loading,         // Thêm loading state
    currentSong,
    isPlaying,
    activeTab,
    activeLibraryTab,
    playbackMode,
    playbackSpeed,
    currentTime,     // Thời gian hiện tại
    duration,        // Tổng thời gian
    setActiveTab,
    setActiveLibraryTab,
    setPlaybackMode,
    setPlaybackSpeed,
    selectSong,      // Hàm chọn bài (không phát)
    togglePlayback,  // Hàm phát/dừng
    seekTo,          // Hàm tua
    buySong,
    toggleFavorite,
    importSongFile,  // Hàm import file nhạc
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};