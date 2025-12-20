import { useState, useEffect } from 'react';

export default function Settings() {
    const [selectedGame, setSelectedGame] = useState('sky');

    // Load game selection từ localStorage
    useEffect(() => {
        const saved = localStorage.getItem('selectedGame');
        if (saved) {
            setSelectedGame(saved);
        }
    }, []);

    // Save game selection
    const handleGameChange = (game) => {
        setSelectedGame(game);
        localStorage.setItem('selectedGame', game);
        console.log(`Đã chuyển sang chế độ: ${game === 'sky' ? 'Sky: Children of the Light' : 'Genshin Impact'}`);
    };

    return (
        <div id="view-settings" className="content-view active">
            <h2 className="view-title">⚙️ Cài đặt</h2>
            <p className="view-subtitle">Tùy chỉnh ứng dụng</p>

            <div style={{ padding: '20px' }}>
                <div className="setting-group">
                    <h3>🎮 Chọn trò chơi</h3>
                    <p style={{ color: 'var(--text-sub)', fontSize: '14px', marginBottom: '15px' }}>
                        Chọn trò chơi để tối ưu hóa phím bấm tự động
                    </p>

                    <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
                        <div
                            onClick={() => handleGameChange('sky')}
                            style={{
                                flex: '1',
                                minWidth: '200px',
                                padding: '20px',
                                border: selectedGame === 'sky' ? '2px solid var(--primary)' : '2px solid var(--border)',
                                borderRadius: '10px',
                                background: selectedGame === 'sky' ? 'rgba(76, 175, 80, 0.1)' : 'var(--card-bg)',
                                cursor: 'pointer',
                                transition: 'all 0.3s',
                                textAlign: 'center'
                            }}
                            onMouseEnter={(e) => {
                                if (selectedGame !== 'sky') {
                                    e.currentTarget.style.borderColor = 'var(--primary)';
                                    e.currentTarget.style.transform = 'translateY(-2px)';
                                }
                            }}
                            onMouseLeave={(e) => {
                                if (selectedGame !== 'sky') {
                                    e.currentTarget.style.borderColor = 'var(--border)';
                                    e.currentTarget.style.transform = 'translateY(0)';
                                }
                            }}
                        >
                            <div style={{ fontSize: '48px', marginBottom: '10px' }}>🕊️</div>
                            <div style={{ fontWeight: 'bold', fontSize: '16px', marginBottom: '5px' }}>
                                Sky: Children of the Light
                            </div>
                            <div style={{ fontSize: '12px', color: 'var(--text-sub)' }}>
                                15 phím (1Key0-1Key14)
                            </div>
                            {selectedGame === 'sky' && (
                                <div style={{ marginTop: '10px', color: 'var(--primary)', fontWeight: 'bold' }}>
                                    ✓ Đang sử dụng
                                </div>
                            )}
                        </div>

                        <div
                            onClick={() => handleGameChange('genshin')}
                            style={{
                                flex: '1',
                                minWidth: '200px',
                                padding: '20px',
                                border: selectedGame === 'genshin' ? '2px solid var(--primary)' : '2px solid var(--border)',
                                borderRadius: '10px',
                                background: selectedGame === 'genshin' ? 'rgba(76, 175, 80, 0.1)' : 'var(--card-bg)',
                                cursor: 'pointer',
                                transition: 'all 0.3s',
                                textAlign: 'center'
                            }}
                            onMouseEnter={(e) => {
                                if (selectedGame !== 'genshin') {
                                    e.currentTarget.style.borderColor = 'var(--primary)';
                                    e.currentTarget.style.transform = 'translateY(-2px)';
                                }
                            }}
                            onMouseLeave={(e) => {
                                if (selectedGame !== 'genshin') {
                                    e.currentTarget.style.borderColor = 'var(--border)';
                                    e.currentTarget.style.transform = 'translateY(0)';
                                }
                            }}
                        >
                            <div style={{ fontSize: '48px', marginBottom: '10px' }}>⚔️</div>
                            <div style={{ fontWeight: 'bold', fontSize: '16px', marginBottom: '5px' }}>
                                Genshin Impact
                            </div>
                            <div style={{ fontSize: '12px', color: 'var(--text-sub)' }}>
                                21 phím (Z, X, C, V, A, S, D, Q, W, E, R...)
                            </div>
                            {selectedGame === 'genshin' && (
                                <div style={{ marginTop: '10px', color: 'var(--primary)', fontWeight: 'bold' }}>
                                    ✓ Đang sử dụng
                                </div>
                            )}
                        </div>

                        <div
                            onClick={() => handleGameChange('genshin')}
                            style={{
                                flex: '1',
                                minWidth: '200px',
                                padding: '20px',
                                border: '2px solid var(--border)',
                                borderRadius: '10px',
                                background: 'var(--card-bg)',
                                cursor: 'pointer',
                                transition: 'all 0.3s',
                                textAlign: 'center',
                                opacity: selectedGame === 'genshin' ? 0.8 : 1
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.borderColor = 'var(--primary)';
                                e.currentTarget.style.transform = 'translateY(-2px)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.borderColor = 'var(--border)';
                                e.currentTarget.style.transform = 'translateY(0)';
                            }}
                        >
                            <div style={{ fontSize: '48px', marginBottom: '10px' }}>🏯</div>
                            <div style={{ fontWeight: 'bold', fontSize: '16px', marginBottom: '5px' }}>
                                Where Winds Meet
                            </div>
                            <div style={{ fontSize: '12px', color: 'var(--text-sub)' }}>
                                Dùng chung với Genshin Impact
                            </div>
                            <div style={{ fontSize: '11px', color: 'var(--text-sub)', marginTop: '5px', fontStyle: 'italic' }}>
                                (Cùng cấu trúc đàn)
                            </div>
                        </div>
                    </div>
                </div>

                <div className="setting-group">
                    <h3>👤 Tài khoản</h3>
                    <button className="btn-setting">Đăng nhập</button>
                    <button className="btn-setting">Đăng ký</button>
                </div>

                <div className="setting-group">
                    <h3>ℹ️ Về ứng dụng</h3>
                    <p style={{ color: 'var(--text-sub)' }}>
                        SkyBard v1.0.0<br />
                        Trợ lý chơi nhạc tự động cho Sky, Genshin Impact & Where Winds Meet
                    </p>
                </div>
            </div>
        </div>
    );
}
