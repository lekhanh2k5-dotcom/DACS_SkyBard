import { useApp } from '../contexts/AppContext';
import './PlayerBar.css';

export default function PlayerBar() {
    const {
        currentSong,
        isPlaying,
        playbackMode,
        playbackSpeed,
        setPlaybackMode,
        setPlaybackSpeed,
        togglePlayback
    } = useApp();

    const playbackModes = ['once', 'sequence', 'shuffle', 'repeat-one'];
    const modeNames = {
        'once': 'Phát 1 bài rồi dừng',
        'sequence': 'Phát lần lượt',
        'shuffle': 'Phát ngẫu nhiên',
        'repeat-one': 'Lặp 1 bài'
    };

    const toggleMode = () => {
        const currentIndex = playbackModes.indexOf(playbackMode);
        const nextIndex = (currentIndex + 1) % playbackModes.length;
        setPlaybackMode(playbackModes[nextIndex]);
    };

    const handleSpeedChange = (e) => {
        const value = parseFloat(e.target.value);
        if (value >= 0.5 && value <= 2.0) {
            setPlaybackSpeed(value);
        }
    };

    const renderModeIcon = () => {
        switch (playbackMode) {
            case 'once':
                return <path d="M17 17H7v-3l-4 4 4 4v-3h12v-6h-2v4zM7 7h10v3l4-4-4-4v3H5v6h2V7z" />;
            case 'sequence':
                return <path d="M17 17H7v-3l-4 4 4 4v-3h12v-6h-2v4zM7 7h10v3l4-4-4-4v3H5v6h2V7z" />;
            case 'shuffle':
                return <path d="M10.59 9.17L5.41 4 4 5.41l5.17 5.17 1.42-1.41zM14.5 4l2.04 2.04L4 18.59 5.41 20 17.96 7.46 20 9.5V4h-5.5zm.33 9.41l-1.41 1.41 3.13 3.13L14.5 20H20v-5.5l-2.04 2.04-3.13-3.13z" />;
            case 'repeat-one':
                return (
                    <>
                        <path d="M17 17H7v-3l-4 4 4 4v-3h12v-6h-2v4zM7 7h10v3l4-4-4-4v3H5v6h2V7z" />
                        <text x="10" y="13" fontSize="7" fontWeight="bold" fill="currentColor" textAnchor="middle">1</text>
                    </>
                );
            default:
                return null;
        }
    };

    return (
        <div className="player-bar">
            <div className="player-left">
                <div className="song-thumbnail">🎵</div>
                <div className="song-details">
                    <div className="song-title" id="statusTitle">
                        {currentSong ? currentSong.title : 'Chưa chọn bài'}
                    </div>
                    <div className="song-artist" id="statusSub">
                        {currentSong ? currentSong.artist : 'Chọn bài hát để bắt đầu'}
                    </div>
                </div>
            </div>

            <div className="player-center">
                <div className="player-actions">
                    <button
                        className="btn-mode"
                        data-mode={playbackMode}
                        title={modeNames[playbackMode]}
                        onClick={toggleMode}
                    >
                        <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                            {renderModeIcon()}
                        </svg>
                    </button>

                    <button className="btn-control" title="Bài trước">
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                            <path d="M3 2h2v12H3V2zm3 6l8-6v12l-8-6z" />
                        </svg>
                    </button>

                    <button id="btnMainPlay" className="btn-control btn-play" onClick={togglePlayback}>
                        <svg width="24" height="24" viewBox="0 0 16 16" fill="currentColor">
                            {isPlaying ? (
                                <path d="M5 2h2v12H5V2zm4 0h2v12H9V2z" />
                            ) : (
                                <path d="M3 2l10 6-10 6V2z" />
                            )}
                        </svg>
                    </button>

                    <button className="btn-control" title="Bài tiếp">
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                            <path d="M11 2h2v12h-2V2zM2 2l8 6-8 6V2z" />
                        </svg>
                    </button>

                    <div className="speed-control">
                        <label htmlFor="speedInput">Tốc độ:</label>
                        <input
                            type="number"
                            id="speedInput"
                            min="0.5"
                            max="2.0"
                            step="0.1"
                            value={playbackSpeed}
                            onChange={handleSpeedChange}
                        />
                        <span className="speed-unit">×</span>
                    </div>
                </div>

                <div className="progress-section">
                    <span className="time-current">0:00</span>
                    <div className="progress-container">
                        <div className="progress-bar" style={{ width: '0%' }}></div>
                    </div>
                    <span className="time-total">0:00</span>
                </div>
            </div>

            <div className="player-right">
                <button className="btn-add" title="Thêm vào playlist">
                    ➕
                </button>
            </div>
        </div>
    );
}
