import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import '../styles/auth.css';

export default function LoginWindow() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [displayName, setDisplayName] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [showRegister, setShowRegister] = useState(false);

    const { login, register, user } = useAuth();

    // Nếu đã đăng nhập, tự động đóng cửa sổ
    useEffect(() => {
        if (user && window.api && window.api.closeLoginWindow) {
            console.log('✅ Đã đăng nhập, đóng login window');
            setTimeout(() => {
                window.api.closeLoginWindow();
            }, 500);
        }
    }, [user]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            if (showRegister) {
                // Đăng ký
                if (!displayName.trim()) {
                    setError('Vui lòng nhập tên tài khoản');
                    setLoading(false);
                    return;
                }
                if (password.length < 6) {
                    setError('Mật khẩu phải có ít nhất 6 ký tự');
                    setLoading(false);
                    return;
                }
                await register(email, password, displayName);
                alert('✅ Đăng ký thành công! Bạn đã nhận 1000 xu');
                // Cửa sổ sẽ tự động đóng nhờ useEffect
            } else {
                // Đăng nhập
                await login(email, password);
                console.log('✅ Đăng nhập thành công');
                // Cửa sổ sẽ tự động đóng nhờ useEffect
            }
        } catch (err) {
            console.error('Auth error:', err);
            
            // Xử lý lỗi Firebase
            if (err.code === 'auth/configuration-not-found') {
                setError('⚠️ Firebase Authentication chưa được cấu hình. Vui lòng kiểm tra Firebase Console và bật Authentication.');
            } else if (err.code === 'auth/user-not-found') {
                setError('Email không tồn tại');
            } else if (err.code === 'auth/wrong-password') {
                setError('Mật khẩu không đúng');
            } else if (err.code === 'auth/email-already-in-use') {
                setError('Email đã được sử dụng');
            } else if (err.code === 'auth/invalid-email') {
                setError('Email không hợp lệ');
            } else if (err.code === 'auth/invalid-credential') {
                setError('Thông tin đăng nhập không hợp lệ');
            } else {
                setError(err.message || 'Đã xảy ra lỗi');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-box">
                <div className="auth-header">
                    <h1>🎵 SkyBard</h1>
                    <p className="auth-subtitle">
                        {showRegister ? 'Tạo tài khoản mới' : 'Đăng nhập để tiếp tục'}
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="auth-form">
                    {error && (
                    {showRegister && (
                        <div className="form-group">
                            <label htmlFor="displayName">Tên tài khoản</label>
                            <input
                                type="text"
                                id="displayName"
                                value={displayName}
                                onChange={(e) => setDisplayName(e.target.value)}
                                placeholder="Nhập tên của bạn"
                                required
                                disabled={loading}
                                autoFocus={showRegister}
                            />
                        </div>
                    )}

                    <div className="form-group">
                        <label htmlFor="email">Email</label>
                        <input
                            type="email"
                            id="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="your@email.com"
                            required
                            disabled={loading}
                            autoFocus={!showRegister}ail}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="your@email.com"
                            required
                            disabled={loading}
                            autoFocus
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="password">Mật khẩu</label>
                        <input
                            type="password"
                            id="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                            required
                            disabled={loading}
                            minLength={6}
                        />
                        {showRegister && (
                            <small className="form-hint">Tối thiểu 6 ký tự</small>
                        )}
                    </div>

                    <but    setDisplayName(''); // Clear display name khi chuyển mode
                        ton
                        type="submit"
                        className="btn-auth"
                        disabled={loading}
                    >
                        {loading ? '⏳ Đang xử lý...' : (showRegister ? '📝 Đăng ký' : '🔐 Đăng nhập')}
                    </button>
                </form>

                <div className="auth-footer">
                    <button
                        type="button"
                        className="btn-toggle"
                        onClick={() => {
                            setShowRegister(!showRegister);
                            setError('');
                        }}
                        disabled={loading}
                    >
                        {showRegister
                            ? 'Đã có tài khoản? Đăng nhập ngay'
                            : 'Chưa có tài khoản? Đăng ký ngay'}
                    </button>
                </div>
            </div>
        </div>
    );
}
