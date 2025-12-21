import { createContext, useContext, useState, useEffect, useRef } from 'react';
import { mockSongs } from '../data/songs';
import { fetchSongsFromFirebase, listenToSongs } from '../../services/firebaseService';
import { useAuth } from './AuthContext';

const AppContext = createContext();

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
};

export const AppProvider = ({ children }) => {
  const { user, userProfile, refreshUserProfile } = useAuth(); // Lấy auth context
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
  const progressStartTimeRef = useRef(0);
  const progressInitialTimeRef = useRef(0);
  const [isMusicReady, setIsMusicReady] = useState(false);

  // Refs cho shortcuts
  const togglePlaybackRef = useRef(null);
  const playNextRef = useRef(null);
  const playPrevRef = useRef(null);

  useEffect(() => {
    if (window.api && window.api.onMusicReady) {
      window.api.onMusicReady(() => {
        console.log('🎵 Nhạc đã bắt đầu - bật thanh tiến trình!');
        progressStartTimeRef.current = Date.now();
        setIsMusicReady(true);
      });
    }

    // Đăng ký keyboard shortcuts
    if (window.api) {
      if (window.api.onShortcutPrev) {
        window.api.onShortcutPrev(() => {
          console.log('⌨️ Shortcut: Previous');
          playPrevRef.current?.(true);
        });
      }

      if (window.api.onShortcutTogglePlay) {
        window.api.onShortcutTogglePlay(() => {
          console.log('⌨️ Shortcut: Toggle Play');
          togglePlaybackRef.current?.();
        });
      }

      if (window.api.onShortcutNext) {
        window.api.onShortcutNext(() => {
          console.log('⌨️ Shortcut: Next');
          playNextRef.current?.(true);
        });
      }
    }
  }, []);

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
                  // Check if user owns this song
                  const isOwned = userProfile?.ownedSongs?.[song.id] === true;
                  updated[`firebase_${song.id}`] = {
                    ...song,
                    isFromFirebase: true,
                    isOwned: isOwned
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

          // Thêm bài Firebase mới với isOwned từ userProfile
          updatedFirebaseSongs.forEach(song => {
            const isOwned = userProfile?.ownedSongs?.[song.id] === true;
            newSongs[`firebase_${song.id}`] = {
              ...song,
              isFromFirebase: true,
              isOwned: isOwned
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

  // Sync isOwned từ userProfile khi userProfile thay đổi
  useEffect(() => {
    if (!userProfile || !userProfile.ownedSongs) return;

    setSongs(prev => {
      const updated = { ...prev };
      let hasChanges = false;

      Object.keys(updated).forEach(key => {
        if (key.startsWith('firebase_')) {
          const songId = key.replace('firebase_', '');
          const isOwned = userProfile.ownedSongs[songId] === true;

          if (updated[key].isOwned !== isOwned) {
            updated[key] = { ...updated[key], isOwned };
            hasChanges = true;
          }
        }
      });

      if (hasChanges) {
        console.log('🔄 Synced isOwned from userProfile');
        return updated;
      }
      return prev;
    });
  }, [userProfile?.ownedSongs]);

  // --- HÀM CHỌN BÀI HÁT: Chỉ load và set currentSong, không phát ---
  const selectSong = async (songKey) => {
    const songMetadata = songs[songKey];
    if (!songMetadata) return;

    try {
      let fullSongData;

      // 1. Bài từ local file hoặc imported
      if (songMetadata.isFromFile && songMetadata.fileName) {
        fullSongData = {
          ...songMetadata,
          key: songKey
        };
        console.log(`Chọn bài từ file: ${songMetadata.fileName}`);
      }
      // 2. Bài có sẵn songNotes (mockSongs hoặc local)
      else if (songMetadata.songNotes && songMetadata.songNotes.length > 0) {
        fullSongData = {
          ...songMetadata,
          key: songKey
        };
        console.log(`Chọn bài từ mockSongs: ${songMetadata.name}`);
      }
      // 3. Bài từ Firebase - chỉ load nếu đã sở hữu
      else if (songMetadata.isFromFirebase) {
        if (!songMetadata.isOwned) {
          alert('Vui lòng mua bài hát này trước khi phát!');
          return;
        }

        // Load songNotes từ Firebase Storage
        console.log(`🔐 Bài đã mua - đang load nội dung từ Firebase: ${songMetadata.name}`);

        if (songMetadata.txtFilePath) {
          try {
            const { getSongTxtContent } = await import('../../services/firebaseService');
            const content = await getSongTxtContent(songMetadata.txtFilePath);
            fullSongData = {
              ...songMetadata,
              ...content,
              key: songKey
            };
            console.log(`✅ Đã load songNotes cho: ${songMetadata.name}`);
          } catch (error) {
            console.error(`❌ Lỗi khi load songNotes:`, error);
            alert('Không thể tải nội dung bài hát!');
            return;
          }
        } else {
          alert('Bài hát này chưa có file nhạc!');
          return;
        }
      }
      // 4. Fallback: thử đọc file theo tên
      else {
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

    if (isPlaying && isMusicReady && currentSong) {
      interval = setInterval(() => {
        const elapsed = Date.now() - progressStartTimeRef.current;
        const newTime = progressInitialTimeRef.current + (elapsed * playbackSpeed);

        if (newTime >= duration) {
          setCurrentTime(duration);
          setIsPlaying(false);
          setIsMusicReady(false);
          if (window.api) {
            window.api.stopMusic();
          }
          // Xử lý chế độ phát khi hết bài
          handleSongEnd();
        } else {
          setCurrentTime(newTime);
        }
      }, 100);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isPlaying, isMusicReady, currentSong, duration, playbackSpeed]);

  // useEffect để phát lại với tốc độ mới khi thay đổi speed trong khi đang phát
  useEffect(() => {
    if (isPlaying && currentSong && window.api) {
      setIsMusicReady(false);
      window.api.stopMusic();
      progressInitialTimeRef.current = currentTime;

      const notesToPlay = currentSong.songNotes
        .filter(note => note.time >= currentTime)
        .map(note => ({
          ...note,
          time: (note.time - currentTime) / playbackSpeed
        }));

      const gameMode = localStorage.getItem('selectedGame') || 'sky';
      setTimeout(() => {
        window.api.playOnline(notesToPlay, gameMode);
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
      setIsMusicReady(false);
      progressInitialTimeRef.current = currentTime;

      if (window.api && currentSong.songNotes) {
        console.log(`Bắt đầu phát: ${currentSong.name} từ ${currentTime}ms với tốc độ ${playbackSpeed}x`);

        const notesToPlay = currentSong.songNotes
          .filter(note => note.time >= currentTime)
          .map(note => ({
            ...note,
            time: (note.time - currentTime) / playbackSpeed
          }));

        // Lấy game mode từ localStorage
        const gameMode = localStorage.getItem('selectedGame') || 'sky';
        window.api.playOnline(notesToPlay, gameMode);
        setStartTime(Date.now());
      }
    } else {
      setIsMusicReady(false);
      if (window.api) {
        console.log('Dừng phát nhạc');
        window.api.stopMusic();
      }
    }
  };

  // Gán vào ref để shortcuts có thể gọi
  togglePlaybackRef.current = togglePlayback;

  // Hàm tua đến vị trí cụ thể
  const seekTo = (timeMs) => {
    setCurrentTime(timeMs);

    if (isPlaying && window.api && currentSong) {
      setIsMusicReady(false);
      window.api.stopMusic();
      progressInitialTimeRef.current = timeMs;

      const notesToPlay = currentSong.songNotes
        .filter(note => note.time >= timeMs)
        .map(note => ({
          ...note,
          time: (note.time - timeMs) / playbackSpeed
        }));

      const gameMode = localStorage.getItem('selectedGame') || 'sky';
      setTimeout(() => {
        window.api.playOnline(notesToPlay, gameMode);
      }, 100);
    }
  };

  // Lấy danh sách bài hát có thể phát (owned songs)
  const getPlayableSongs = () => {
    return Object.keys(songs).filter(key => {
      const song = songs[key];
      return !song.isFromFirebase || song.isOwned;
    });
  };

  // Chuyển bài tiếp theo
  const playNext = async (autoPlay = false) => {
    if (!currentSong) return;

    const playableSongs = getPlayableSongs();
    if (playableSongs.length === 0) return;

    const currentIndex = playableSongs.findIndex(key => songs[key] === currentSong || key === currentSong.key);

    let nextIndex;
    if (playbackMode === 'shuffle') {
      // Random song
      nextIndex = Math.floor(Math.random() * playableSongs.length);
    } else {
      // Next in sequence
      nextIndex = (currentIndex + 1) % playableSongs.length;
    }

    const nextSongKey = playableSongs[nextIndex];
    await selectSong(nextSongKey);

    // Auto play nếu được yêu cầu
    if (autoPlay) {
      const gameMode = localStorage.getItem('selectedGame') || 'sky';
      setTimeout(() => {
        setIsPlaying(true);
        setIsMusicReady(false);
        progressInitialTimeRef.current = 0;

        if (window.api && songs[nextSongKey].songNotes) {
          const notesToPlay = songs[nextSongKey].songNotes.map(note => ({
            ...note,
            time: note.time / playbackSpeed
          }));
          window.api.playOnline(notesToPlay, gameMode);
        }
      }, 500);
    }
  };

  // Gán vào ref
  playNextRef.current = playNext;

  // Chuyển bài trước
  const playPrev = async (autoPlay = false) => {
    if (!currentSong) return;

    const playableSongs = getPlayableSongs();
    if (playableSongs.length === 0) return;

    const currentIndex = playableSongs.findIndex(key => songs[key] === currentSong || key === currentSong.key);

    let prevIndex;
    if (playbackMode === 'shuffle') {
      // Random song
      prevIndex = Math.floor(Math.random() * playableSongs.length);
    } else {
      // Previous in sequence
      prevIndex = currentIndex - 1;
      if (prevIndex < 0) prevIndex = playableSongs.length - 1;
    }

    const prevSongKey = playableSongs[prevIndex];
    await selectSong(prevSongKey);

    // Auto play nếu được yêu cầu
    if (autoPlay) {
      const gameMode = localStorage.getItem('selectedGame') || 'sky';
      setTimeout(() => {
        setIsPlaying(true);
        setIsMusicReady(false);
        progressInitialTimeRef.current = 0;

        if (window.api && songs[prevSongKey].songNotes) {
          const notesToPlay = songs[prevSongKey].songNotes.map(note => ({
            ...note,
            time: note.time / playbackSpeed
          }));
          window.api.playOnline(notesToPlay, gameMode);
        }
      }, 500);
    }
  };

  // Gán vào ref
  playPrevRef.current = playPrev;

  // Xử lý khi bài hát kết thúc
  const handleSongEnd = async () => {
    switch (playbackMode) {
      case 'once':
        // Dừng hẳn
        break;
      case 'repeat-one':
        // Phát lại bài hiện tại
        setCurrentTime(0);
        setIsMusicReady(false);
        progressInitialTimeRef.current = 0;
        const gameMode = localStorage.getItem('selectedGame') || 'sky';
        setTimeout(() => {
          setIsPlaying(true);
          if (window.api && currentSong.songNotes) {
            const notesToPlay = currentSong.songNotes.map(note => ({
              ...note,
              time: note.time / playbackSpeed
            }));
            window.api.playOnline(notesToPlay, gameMode);
          }
        }, 500);
        break;
      case 'sequence':
      case 'shuffle':
        // Phát bài tiếp theo với auto-play
        await playNext(true);
        break;
      default:
        break;
    }
  };

  const buySong = async (songKey, price) => {
    const song = songs[songKey];
    if (!song) return false;

    // Kiểm tra đăng nhập
    if (!user) {
      alert('Vui lòng đăng nhập để mua bài hát!');
      return false;
    }

    // Kiểm tra số xu
    if (!userProfile || userProfile.coins < price) {
      alert(`Không đủ xu! Bạn có ${userProfile?.coins || 0} xu, cần ${price} xu`);
      return false;
    }

    if (!confirm(`Mua bài "${song.name}" giá ${price} xu?`)) {
      return false;
    }

    try {
      // Gọi Firebase purchaseSong
      const { purchaseSong } = await import('../../services/firebaseService');
      const songId = songKey.replace('firebase_', ''); // Remove prefix

      const result = await purchaseSong(user.uid, songId, price);

      if (result.success) {
        // Cập nhật state local
        setSongs(prev => ({
          ...prev,
          [songKey]: { ...prev[songKey], isOwned: true }
        }));

        // Refresh user profile để cập nhật số xu
        await refreshUserProfile();

        alert(`✅ Mua thành công! Còn lại ${result.newCoins} xu`);
        console.log(`✅ Purchased ${song.name} for ${price} coins`);
        return true;
      }
    } catch (error) {
      console.error('❌ Purchase error:', error);
      alert(`Lỗi khi mua bài hát: ${error.message}`);
      return false;
    }
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

  // Xóa bài hát (chỉ local/imported songs)
  const deleteSong = async (songKey) => {
    const song = songs[songKey];

    if (!song) return;

    // Không cho xóa bài từ Firebase
    if (song.isFromFirebase) {
      alert('Không thể xóa bài hát trên đám mây!');
      return;
    }

    // Xác nhận xóa
    if (!confirm(`Bạn có chắc muốn xóa bài "${song.name}"?`)) {
      return;
    }

    // Nếu đang phát bài này thì dừng
    if (currentSong && (currentSong.key === songKey || currentSong === song)) {
      setIsPlaying(false);
      setCurrentSong(null);
      setCurrentTime(0);
      if (window.api) {
        window.api.stopMusic();
      }
    }

    // Xóa file nếu có fileName (imported/local file)
    if (song.fileName && window.api && window.api.deleteSongFile) {
      try {
        const result = await window.api.deleteSongFile(song.fileName);
        if (result.error) {
          console.error('Lỗi khi xóa file:', result.error);
        } else {
          console.log(`✅ Đã xóa file: ${song.fileName}`);
        }
      } catch (error) {
        console.error('Lỗi khi xóa file:', error);
      }
    }

    // Xóa khỏi danh sách state
    setSongs(prev => {
      const updated = { ...prev };
      delete updated[songKey];
      return updated;
    });

    console.log(`Đã xóa bài: ${song.name}`);
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
    playNext,        // Hàm phát bài tiếp theo
    playPrev,        // Hàm phát bài trước
    buySong,
    toggleFavorite,
    importSongFile,  // Hàm import file nhạc
    deleteSong,      // Hàm xóa bài hát
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};