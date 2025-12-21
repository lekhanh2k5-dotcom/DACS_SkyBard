import React, { useState } from 'react';
import { useApp } from '../contexts/AppContext';
import SongCard from '../components/SongCard';

export default function Store() {
    const { songs, selectSong } = useApp();
    const [searchQuery, setSearchQuery] = useState('');

    // Chỉ hiển thị bài từ Firebase (cloud) - CHỈ HIỂN THỊ BÀI CHƯA MUA
    const filteredSongs = Object.keys(songs).filter(key => {
        const song = songs[key];
        // Chỉ lấy bài từ Firebase
        if (!song.isFromFirebase) return false;
        
        // Ẩn bài đã mua
        if (song.isOwned) return false;

        const query = searchQuery.toLowerCase();
        return song.name.toLowerCase().includes(query) ||
            (song.artist && song.artist.toLowerCase().includes(query));
    });

    return (
        <div id="view-store" className="content-view active">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <div>
                    <h2 className="view-title">🏪 Cửa hàng</h2>
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

            <div id="storeList" className="song-grid">
                {filteredSongs.length > 0 ? (
                    filteredSongs.map((key) => (
                        <SongCard
                            key={key}
                            song={songs[key]}
                            songKey={key}
                            onPlay={() => selectSong(key)}
                        />
                    ))
                ) : (
                    <p style={{ color: 'var(--text-sub)', padding: '20px' }}>
                        Không tìm thấy bài hát nào
                    </p>
                )}
            </div>
        </div>
    );
}
