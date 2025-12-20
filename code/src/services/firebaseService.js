import { ref, get, onValue, set, push } from 'firebase/database';
import { ref as storageRef, getDownloadURL, uploadString, getBytes } from 'firebase/storage';
import { database, storage } from '../config/firebase.js';

/**
 * Firebase Service để quản lý dữ liệu bài hát
 * Lưu file .txt (songNotes) lên Storage và metadata lên Realtime Database
 */

// Lấy tất cả bài hát từ Realtime Database
export const fetchSongsFromFirebase = async () => {
    if (!database) {
        console.warn('⚠️ Firebase database not initialized');
        return [];
    }

    try {
        console.log('☁️ Fetching from Realtime Database...');
        const songsRef = ref(database, 'songs');
        const snapshot = await get(songsRef);

        if (snapshot.exists()) {
            const songsData = snapshot.val();
            console.log('📦 Raw data from Firebase:', songsData);

            // Convert object to array - CHỈ LẤY METADATA, KHÔNG LOAD SONG NOTES
            const songsArray = Object.keys(songsData).map(key => ({
                id: key,
                ...songsData[key],
                songNotes: [] // Không load songNotes ban đầu
            }));

            console.log(`📋 Loaded metadata for ${songsArray.length} songs (no songNotes yet)`);
            return songsArray;
        } else {
            console.log('Không có dữ liệu bài hát trên Firebase');
            return [];
        }
    } catch (error) {
        console.error('Lỗi khi fetch songs:', error);
        return [];
    }
};

// Lắng nghe thay đổi realtime
export const listenToSongs = (callback) => {
    if (!database) {
        console.warn('Firebase database not initialized - listener disabled');
        return () => { }; // Return empty unsubscribe function
    }

    const songsRef = ref(database, 'songs');

    const unsubscribe = onValue(songsRef, async (snapshot) => {
        if (snapshot.exists()) {
            const songsData = snapshot.val();
            const songsArray = Object.keys(songsData).map(key => ({
                id: key,
                ...songsData[key],
                songNotes: [] // Không load songNotes trong realtime listener
            }));

            callback(songsArray);
        } else {
            callback([]);
        }
    }, (error) => {
        console.error('Lỗi khi listen songs:', error);
    });

    // Return unsubscribe function
    return unsubscribe;
};

// Lấy nội dung file .txt từ Storage (dùng Electron main process để bypass CORS)
export const getSongTxtContent = async (txtPath) => {
    if (!storage) {
        throw new Error('Firebase storage not initialized');
    }

    try {
        console.log(`🔍 Đang tải file: ${txtPath}`);
        const txtRef = storageRef(storage, txtPath);

        // Lấy download URL
        const url = await getDownloadURL(txtRef);
        console.log(`🔗 URL: ${url}`);

        // Dùng Electron main process để fetch (bypass CORS)
        if (window.api && window.api.fetchUrl) {
            const result = await window.api.fetchUrl(url);
            if (result.error) {
                throw new Error(result.error);
            }

            // Remove BOM (Byte Order Mark) nếu có
            let cleanData = result.data;
            if (cleanData.charCodeAt(0) === 0xFEFF) {
                cleanData = cleanData.substring(1);
            }
            // Remove UTF-8 BOM
            if (cleanData.startsWith('\uFEFF')) {
                cleanData = cleanData.substring(1);
            }

            const songData = JSON.parse(cleanData);
            console.log(`✅ Đã tải và parse file: ${txtPath}`);
            return Array.isArray(songData) ? songData[0] : songData;
        } else {
            throw new Error('Electron API not available');
        }
    } catch (error) {
        console.error(`❌ Lỗi khi lấy txt content (${txtPath}):`, error.message);
        throw error;
    }
};

// Lấy một bài hát theo ID
export const getSongById = async (songId) => {
    try {
        const songRef = ref(database, `songs/${songId}`);
        const snapshot = await get(songRef);

        if (snapshot.exists()) {
            return {
                id: songId,
                ...snapshot.val()
            };
        } else {
            console.log('Không tìm thấy bài hát');
            return null;
        }
    } catch (error) {
        console.error('Lỗi khi lấy bài hát:', error);
        throw error;
    }
};

// Lấy cover image URL từ Storage
export const getCoverImageURL = async (imagePath) => {
    try {
        const imageRef = storageRef(storage, imagePath);
        const url = await getDownloadURL(imageRef);
        return url;
    } catch (error) {
        console.error('Lỗi khi lấy cover image:', error);
        throw error;
    }
};

// Upload file .txt lên Storage và lưu metadata lên Database
export const uploadSongToFirebase = async (songData, txtContent) => {
    try {
        // 1. Upload file .txt lên Storage
        const fileName = `${songData.name.replace(/[^a-z0-9]/gi, '_')}.txt`;
        const txtPath = `songs/txt/${fileName}`;
        const txtRef = storageRef(storage, txtPath);

        // Convert songData thành JSON string (giống format file .txt local)
        const txtString = JSON.stringify([txtContent]);
        await uploadString(txtRef, txtString);

        // 2. Lưu metadata lên Realtime Database
        const songsRef = ref(database, 'songs');
        const newSongRef = push(songsRef);

        await set(newSongRef, {
            name: songData.name,
            author: songData.author || 'Unknown',
            composer: songData.composer || songData.transcribedBy || 'Unknown',
            price: songData.price || 0,
            isOwned: songData.isOwned || false,
            isFavorite: false,
            bpm: songData.bpm || 120,
            txtFilePath: txtPath, // Đường dẫn tới file .txt trên Storage
            coverImage: songData.coverImage || null,
            createdAt: Date.now(),
            isFromFirebase: true
        });

        console.log(`✅ Uploaded ${songData.name} to Firebase`);
        return { success: true, id: newSongRef.key };
    } catch (error) {
        console.error('❌ Lỗi khi upload song:', error);
        throw error;
    }
};
