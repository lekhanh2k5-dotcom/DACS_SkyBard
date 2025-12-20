import { useApp } from '../contexts/AppContext';
import './SongCard.css';

export default function SongCard({ song, songKey, onPlay }) {
    const { buySong, deleteSong } = useApp();

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

    const handleDelete = (e) => {
        e.stopPropagation(); // Ngăn trigger handleClick
        deleteSong(songKey);
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
                {song.isFromFirebase ? (
                    // Bài từ Firebase: hiện owned hoặc giá
                    song.isOwned ? (
                        <span className="card-owned">✅ Đã sở hữu</span>
                    ) : (
                        <span className="card-price">💰 {song.price} xu</span>
                    )
                ) : (
                    // Bài local/imported: hiện nút xóa
                    <button
                        className="btn-delete-song"
                        onClick={handleDelete}
                        title="Xóa bài hát"
                    >
                        <span>🗑️</span>
                        <span>Xóa</span>
                    </button>
                )}
            </div>
        </div>
    );
}
