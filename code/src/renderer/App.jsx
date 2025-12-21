import { AppProvider, useApp } from './contexts/AppContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Sidebar from './components/Sidebar';
import PlayerBar from './components/PlayerBar';
import Store from './pages/Store';
import Library from './pages/Library';
import Settings from './pages/Settings';

function AppContent() {
    const { activeTab, loading: appLoading } = useApp();
    const { loading: authLoading } = useAuth();

    // Hiển thị loading khi đang khởi tạo app
    if (authLoading || appLoading) {
        return (
            <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                height: '100vh',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                flexDirection: 'column',
                gap: '16px'
            }}>
                <div style={{ fontSize: '48px' }}>🎵</div>
                <h2>Đang tải SkyBard...</h2>
            </div>
        );
    }

    // Luôn hiển thị app chính (không cần đăng nhập)
    return (
        <>
            <div className="app-container">
                <Sidebar />

                <main className="main-content">
                    {activeTab === 'store' && <Store />}
                    {activeTab === 'library' && <Library />}
                    {activeTab === 'settings' && <Settings />}
                </main>
            </div>

            <PlayerBar />
        </>
    );
}

export default function App() {
    console.log('🎨 App component rendering...');

    return (
        <AuthProvider>
            <AppProvider>
                <AppContent />
            </AppProvider>
        </AuthProvider>
    );
}
