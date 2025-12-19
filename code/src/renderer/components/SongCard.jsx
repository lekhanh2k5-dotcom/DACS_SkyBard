import { useApp } from '../contexts/AppContext';
import './SongCard.css';

export default function SongCard({ song, songKey, onPlay }) {
    const { buySong } = useApp();

    const handleClick = () => {
        if (song.isOwned) {
            // Gọi hàm onPlay được truyền từ parent component
            if (onPlay) {
                onPlay();
            }
        } else {
            buySong(songKey, song.price);
        }
    };

    return (
        <div className="song-card" onClick={handleClick}>
            <div className="card-img">🎵</div>

            <div className="card-info">
                <div className="card-title">{song.name}</div>
                <div className="card-meta">
                    <span title="Ca sĩ gốc">🎤 {song.author}</span>
                    <span title="Người soạn nhạc">✍️ {song.composer || 'Ẩn danh'}</span>
                </div>
            </div>

            <div className="card-action">
                {song.isOwned ? (
                    <span className="card-owned">✅ Đã sở hữu</span>
                ) : (
                    <span className="card-price">💰 {song.price} xu</span>
                )}
            </div>
        </div>
    );
}
