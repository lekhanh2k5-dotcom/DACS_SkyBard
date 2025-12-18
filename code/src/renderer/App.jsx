import { AppProvider, useApp } from './contexts/AppContext';
import Sidebar from './components/Sidebar';
import PlayerBar from './components/PlayerBar';
import Store from './pages/Store';
import Library from './pages/Library';
import Settings from './pages/Settings';

function AppContent() {
    const { activeTab } = useApp();

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
    return (
        <AppProvider>
            <AppContent />
        </AppProvider>
    );
}
