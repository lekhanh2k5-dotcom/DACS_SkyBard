import { useApp } from '../contexts/AppContext';
import SongCard from '../components/SongCard';

export default function Store() {
    const { songs, playSong } = useApp();

    return (
        <div id="view-store" className="content-view active">
            <h2 className="view-title">🏪 Cửa hàng</h2>
            <p className="view-subtitle">Mua nhạc để tự động chơi trong Sky</p>

            <div id="storeList" className="song-grid">
                {Object.keys(songs).map((key) => (
                    <SongCard
                        key={key}
                        song={songs[key]}
                        songKey={key}
                        onPlay={() => playSong(key)}
                    />
                ))}
            </div>
        </div>
    );
}
