export default function Settings() {
    return (
        <div id="view-settings" className="content-view active">
            <h2 className="view-title">⚙️ Cài đặt</h2>
            <p className="view-subtitle">Tùy chỉnh ứng dụng</p>

            <div style={{ padding: '20px' }}>
                <div className="setting-group">
                    <h3>Tài khoản</h3>
                    <button className="btn-setting">Đăng nhập</button>
                    <button className="btn-setting">Đăng ký</button>
                </div>

                <div className="setting-group">
                    <h3>Giao diện</h3>
                    <label>
                        <input type="checkbox" /> Chế độ tối
                    </label>
                </div>

                <div className="setting-group">
                    <h3>Âm thanh</h3>
                    <label>
                        <input type="range" min="0" max="100" defaultValue="50" />
                        Âm lượng
                    </label>
                </div>

                <div className="setting-group">
                    <h3>Về ứng dụng</h3>
                    <p style={{ color: 'var(--text-sub)' }}>
                        SkyBard v1.0.0<br />
                        Trợ lý chơi nhạc tự động cho Sky: Children of the Light
                    </p>
                </div>
            </div>
        </div>
    );
}
