import React, { useState } from 'react';
import { useApp } from '../contexts/AppContext';
import SongCard from '../components/SongCard';

const REGIONS = {
    all: { label: '🌏 Tất cả', icon: '🌏' },
    vietnam: { label: '🇻🇳 Việt Nam', icon: '🇻🇳' },
    japanese: { label: '🇯🇵 Nhật Bản', icon: '🇯🇵' },
    korean: { label: '🇰🇷 Hàn Quốc', icon: '🇰🇷' },
    chinese: { label: '🇨🇳 Trung Quốc', icon: '🇨🇳' },
    world: { label: '🌍 Thế giới', icon: '🌍' }
};

export default function Store() {
    const { songs, selectSong } = useApp();
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedRegion, setSelectedRegion] = useState('all');

    // Add custom CSS for dropdown options
    React.useEffect(() => {
        const style = document.createElement('style');
        style.textContent = `
            #store-region-select option {
                background-color: #1a1a1a;
                color: white;
                padding: 10px;
            }
            #store-region-select option:hover {
                background-color: #2a2a2a;
            }
        `;
        document.head.appendChild(style);
        return () => document.head.removeChild(style);
    }, []);

    // Chỉ hiển thị bài từ Firebase (cloud) - CHỈ HIỂN THỊ BÀI CHƯA MUA
    const filteredSongs = Object.keys(songs).filter(key => {
        const song = songs[key];
        // Chỉ lấy bài từ Firebase
        if (!song.isFromFirebase) return false;

        // Ẩn bài đã mua
        if (song.isOwned) return false;

        // Lọc theo region
        if (selectedRegion !== 'all' && song.region !== selectedRegion) return false;

        const query = searchQuery.toLowerCase();
        return song.name.toLowerCase().includes(query) ||
            (song.artist && song.artist.toLowerCase().includes(query)) ||
            (song.author && song.author.toLowerCase().includes(query));
    });

    return (
        <div id="view-store" className="content-view active">
            {/* Row 1: Title and Search */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                <h2 className="view-title" style={{ margin: 0 }}>🏪 Cửa hàng</h2>
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

            {/* Row 2: Song Count and Region Filter */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <p style={{ fontSize: '14px', color: 'var(--text-sub)', margin: 0 }}>
                    {filteredSongs.length} bài hát
                </p>
                <select
                    id="store-region-select"
                    value={selectedRegion}
                    onChange={(e) => setSelectedRegion(e.target.value)}
                    style={{
                        padding: '10px 15px',
                        borderRadius: '12px',
                        border: '1px solid var(--border)',
                        background: 'var(--card-bg)',
                        color: 'var(--text-main)',
                        fontSize: '14px',
                        fontWeight: '500',
                        cursor: 'pointer',
                        outline: 'none',
                        minWidth: '200px',
                        transition: 'border 0.2s'
                    }}
                    onFocus={(e) => e.target.style.border = '1px solid var(--primary)'}
                    onBlur={(e) => e.target.style.border = '1px solid var(--border)'}
                >
                    {Object.keys(REGIONS).map(regionKey => (
                        <option key={regionKey} value={regionKey}>
                            {REGIONS[regionKey].label}
                        </option>
                    ))}
                </select>
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
