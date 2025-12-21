import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import LoginModal from '../components/LoginModal';

export default function Settings() {
    const [selectedGame, setSelectedGame] = useState('sky');
    const [showLoginModal, setShowLoginModal] = useState(false);
    const { user, logout } = useAuth();

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

                {/* User Profile Section */}
                <div className="setting-group" style={{ marginTop: '30px' }}>
                    <h3>👤 Tài khoản người dùng</h3>
                    
                    {user ? (
                        // Đã đăng nhập
                        <div style={{
                            padding: '20px',
                            background: 'var(--card-bg)',
                            borderRadius: '12px',
                            border: '2px solid var(--border)'
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '15px' }}>
                                <div style={{
                                    width: '50px',
                                    height: '50px',
                                    borderRadius: '50%',
                                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: '24px'
                                }}>
                                    👤
                                </div>
                                <div>
                                    <div style={{ fontWeight: 'bold', fontSize: '16px', marginBottom: '4px' }}>
                                        {user.email}
                                    </div>
                                    <div style={{ fontSize: '14px', color: 'var(--text-sub)' }}>
                                        💰 <span style={{ color: 'var(--primary)', fontWeight: 'bold' }}>
                                            Đang tải xu...
                                        </span>
                                    </div>
                                </div>
                            </div>
                            
                            <button
                                onClick={async () => {
                                    if (confirm('Bạn có chắc muốn đăng xuất?')) {
                                        await logout();
                                        console.log('✅ Đã đăng xuất');
                                    }
                                }}
                                style={{
                                    width: '100%',
                                    padding: '12px',
                                    background: '#f44336',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '8px',
                                    cursor: 'pointer',
                                    fontWeight: 'bold',
                                    transition: 'all 0.2s'
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.background = '#d32f2f';
                                    e.currentTarget.style.transform = 'translateY(-2px)';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.background = '#f44336';
                                    e.currentTarget.style.transform = 'translateY(0)';
                                }}
                            >
                                🚪 Đăng xuất
                            </button>
                        </div>
                    ) : (
                        // Chưa đăng nhập
                        <div style={{
                            padding: '30px',
                            background: 'var(--card-bg)',
                            borderRadius: '12px',
                            border: '2px dashed var(--border)',
                            textAlign: 'center'
                        }}>
                            <div style={{ fontSize: '48px', marginBottom: '15px' }}>🔒</div>
                            <p style={{ color: 'var(--text-sub)', marginBottom: '20px' }}>
                                Bạn chưa đăng nhập<br />
                                Đăng nhập để mua bài hát và đồng bộ dữ liệu
                            </p>
                            <button
                                onClick={() => setShowLoginModal(true)}
                                style={{
                                    padding: '14px 32px',
                                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '10px',
                                    cursor: 'pointer',
                                    fontWeight: 'bold',
                                    fontSize: '16px',
                                    transition: 'all 0.2s'
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.transform = 'translateY(-2px)';
                                    e.currentTarget.style.boxShadow = '0 6px 20px rgba(102, 126, 234, 0.4)';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.transform = 'translateY(0)';
                                    e.currentTarget.style.boxShadow = 'none';
                                }}
                            >
                                🔐 Đăng nhập / Đăng ký
                            </button>
                        </div>
                    )}
                </div>

                <div className="setting-group">
                    <h3>ℹ️ Về ứng dụng</h3>
                    <p style={{ color: 'var(--text-sub)' }}>
                        SkyBard v1.0.0<br />
                        Trợ lý chơi nhạc tự động cho Sky, Genshin Impact & Where Winds Meet
                    </p>
                </div>
            </div>

            {/* Login Modal */}
            <LoginModal isOpen={showLoginModal} onClose={() => setShowLoginModal(false)} />
```
        </div>
    );
}
