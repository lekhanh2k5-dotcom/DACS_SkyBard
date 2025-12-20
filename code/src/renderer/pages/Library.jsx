import React, { useState, useMemo } from 'react';
import { useApp } from '../contexts/AppContext';
import SongCard from '../components/SongCard';

export default function Library() {
    // Lấy hàm selectSong và importSongFile từ Context
    const { songs, activeLibraryTab, setActiveLibraryTab, selectSong, importSongFile } = useApp();
    const [searchQuery, setSearchQuery] = useState('');

    // Hiển thị: local songs + imported songs + owned Firebase songs
    const ownedSongs = useMemo(() => {
        return Object.keys(songs)
            .filter(key => {
                const song = songs[key];
                // Local/imported songs hoặc Firebase songs đã mua
                return !song.isFromFirebase || song.isOwned;
            })
            .reduce((obj, key) => ({ ...obj, [key]: songs[key] }), {});
    }, [songs]);

    const favoriteSongs = useMemo(() => {
        return Object.keys(songs)
            .filter(key => songs[key].isOwned && songs[key].isFavorite)
            .reduce((obj, key) => ({ ...obj, [key]: songs[key] }), {});
    }, [songs]);

    const baseSongs = activeLibraryTab === 'all' ? ownedSongs : favoriteSongs;

    const displaySongs = useMemo(() => {
        return Object.keys(baseSongs).filter(key => {
            const song = baseSongs[key];
            const query = searchQuery.toLowerCase();
            return song.name.toLowerCase().includes(query) ||
                (song.artist && song.artist.toLowerCase().includes(query));
        }).reduce((obj, key) => ({ ...obj, [key]: baseSongs[key] }), {});
    }, [baseSongs, searchQuery]);

    return (
        <div id="view-library" className="content-view active">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <div>
                    <h2 className="view-title">📚 Thư viện</h2>
                </div>
                <input
                    type="text"
                    placeholder="🔍 Tìm kiếm bài hát..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    style={{
                        padding: '10px 15px',
                        borderRadius: '20px',
                        border: '1px solid var(--border)',
                        background: 'var(--card-bg)',
                        color: 'var(--text-main)',
                        width: '250px',
                        fontSize: '14px',
                        outline: 'none',
                        transition: 'border 0.2s',
                    }}
                    onFocus={(e) => e.target.style.border = '1px solid var(--primary)'}
                    onBlur={(e) => e.target.style.border = '1px solid var(--border)'}
                />
            </div>

            <div className="library-tabs">
                <button
                    id="tab-all"
                    className={`library-tab ${activeLibraryTab === 'all' ? 'active' : ''}`}
                    onClick={() => setActiveLibraryTab('all')}
                >
                    📁 Tất cả
                </button>
                <button
                    id="tab-favorites"
                    className={`library-tab ${activeLibraryTab === 'favorites' ? 'active' : ''}`}
                    onClick={() => setActiveLibraryTab('favorites')}
                >
                    ❤️ Yêu thích
                </button>
            </div>

            <div id="libList" className="song-grid">
                {Object.keys(displaySongs).length > 0 ? (
                    Object.keys(displaySongs).map((key) => (
                        <SongCard
                            key={key}
                            song={displaySongs[key]}
                            songKey={key}
                            // --- GỌI HÀM selectSong - CHỈ CHỌN BÀI, KHÔNG PHÁT ---
                            onPlay={() => selectSong(key)}
                        />
                    ))
                ) : (
                    <p style={{ color: 'var(--text-sub)', padding: '20px' }}>
                        {activeLibraryTab === 'favorites'
                            ? 'Chưa có bài hát yêu thích'
                            : 'Chưa có bài hát nào'}
                    </p>
                )}
            </div>
        </div>
    );
}