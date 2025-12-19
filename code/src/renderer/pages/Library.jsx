import React from 'react';
import { useApp } from '../contexts/AppContext';
import SongCard from '../components/SongCard';

export default function Library() {
    // Lấy hàm playSong từ Context
    const { songs, activeLibraryTab, setActiveLibraryTab, playSong } = useApp();

    const ownedSongs = Object.keys(songs)
        .filter(key => songs[key].isOwned)
        .reduce((obj, key) => ({ ...obj, [key]: songs[key] }), {});

    const favoriteSongs = Object.keys(songs)
        .filter(key => songs[key].isOwned && songs[key].isFavorite)
        .reduce((obj, key) => ({ ...obj, [key]: songs[key] }), {});

    const displaySongs = activeLibraryTab === 'all' ? ownedSongs : favoriteSongs;

    return (
        <div id="view-library" className="content-view active">
            <h2 className="view-title">📚 Thư viện</h2>
            <p className="view-subtitle">Các bài hát bạn đã sở hữu</p>

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
                            // --- GỌI HÀM playSong TỪ CONTEXT ---
                            onPlay={() => playSong(key)}
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