import { useApp } from '../contexts/AppContext';
import { useAuth } from '../contexts/AuthContext';
import './Sidebar.css';

export default function Sidebar() {
    const { activeTab, setActiveTab } = useApp();
    const { user, userProfile } = useAuth();

    const navItems = [
        { id: 'store', label: '🏪 Cửa hàng', icon: '🏪' },
        { id: 'library', label: '📚 Thư viện', icon: '📚' },
        { id: 'settings', label: '⚙️ Cài đặt', icon: '⚙️' },
    ];

    return (
        <aside className="sidebar">
            <div className="brand">
                <span>🎵</span> SkyBard
            </div>

            <ul className="nav-menu">
                {navItems.map((item) => (
                    <li
                        key={item.id}
                        id={`nav-${item.id}`}
                        className={`nav-item ${activeTab === item.id ? 'active' : ''}`}
                        onClick={() => setActiveTab(item.id)}
                    >
                        <span>{item.icon}</span>
                        {item.label.replace(/^[^\s]+\s/, '')}
                    </li>
                ))}
            </ul>

            <div className="user-profile">
                <div className="user-avatar">
                    {user ? '👤' : '🔒'}
                </div>
                <div className="user-info">
                    <div className="user-name">
                        {user
                            ? (userProfile?.displayName || user.email.split('@')[0])
                            : 'Chưa đăng nhập'
                        }
                    </div>
                    <div className="user-balance">
                        💰 {userProfile ? `${userProfile.coins.toLocaleString()} xu` : '-- xu'}
                    </div>
                </div>
            </div>
        </aside>
    );
}
