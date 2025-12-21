import { createContext, useContext, useState, useEffect } from 'react';
import { auth, database } from '../../config/firebase';
import {
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signOut,
    onAuthStateChanged
} from 'firebase/auth';
import { ref, onValue, off } from 'firebase/database';
import { createUserProfile, getUserProfile } from '../../services/firebaseService';

const AuthContext = createContext();

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [userProfile, setUserProfile] = useState(null); // Thêm userProfile state
    const [loading, setLoading] = useState(true);

    // Lắng nghe thay đổi auth state
    useEffect(() => {
        if (!auth) {
            console.warn('⚠️ Firebase Auth not initialized');
            setLoading(false);
            return;
        }

        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            console.log('🔐 Auth state changed:', user ? user.email : 'Not logged in');
            setUser(user);

            // Load user profile từ Firebase nếu đã đăng nhập
            if (user) {
                try {
                    const profile = await getUserProfile(user.uid);
                    if (profile) {
                        setUserProfile(profile);
                        console.log('👤 User profile loaded:', {
                            email: profile.email,
                            coins: profile.coins
                        });
                    } else {
                        // Nếu chưa có profile, tạo mới (trường hợp đăng nhập lần đầu)
                        console.log('⚠️ Profile not found, creating...');
                        const newProfile = await createUserProfile(user.uid, user.email);
                        setUserProfile(newProfile);
                    }
                } catch (error) {
                    console.error('❌ Error loading user profile:', error);
                }
            } else {
                setUserProfile(null);
            }

            setLoading(false);
        });

        return unsubscribe;
    }, []);

    // Real-time listener cho user profile - tự động cập nhật khi có thay đổi trên Firebase
    useEffect(() => {
        if (!user || !database) return;

        const userRef = ref(database, `users/${user.uid}`);

        // Lắng nghe thay đổi real-time
        const unsubscribe = onValue(userRef, (snapshot) => {
            if (snapshot.exists()) {
                const data = snapshot.val();
                setUserProfile(data);
                console.log('🔄 User profile updated in real-time:', {
                    email: data.email,
                    coins: data.coins,
                    displayName: data.displayName
                });
            }
        }, (error) => {
            console.error('❌ Error listening to profile changes:', error);
        });

        // Cleanup listener khi user logout hoặc component unmount
        return () => {
            off(userRef);
            console.log('🔇 Real-time listener removed');
        };
    }, [user]);

    // Đăng nhập
    const login = async (email, password) => {
        if (!auth) throw new Error('Firebase Auth not initialized');
        return signInWithEmailAndPassword(auth, email, password);
    };

    // Đăng ký
    const register = async (email, password, displayName = null) => {
        if (!auth) throw new Error('Firebase Auth not initialized');

        // Tạo user trong Firebase Auth
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);

        // Tạo user profile trong Realtime Database (tặng 1000 xu)
        try {
            const newProfile = await createUserProfile(userCredential.user.uid, email, displayName);
            setUserProfile(newProfile); // Set profile ngay sau khi đăng ký
            console.log('✅ User registered with 1000 coins:', userCredential.user.email);
        } catch (error) {
            console.error('⚠️ Failed to create user profile:', error);
        }

        return userCredential;
    };

    // Đăng xuất
    const logout = async () => {
        if (!auth) throw new Error('Firebase Auth not initialized');
        setUserProfile(null); // Clear profile khi logout
        return signOut(auth);
    };

    // Hàm refresh user profile (dùng sau khi mua bài, thay đổi xu)
    const refreshUserProfile = async () => {
        if (!user) return;

        try {
            const profile = await getUserProfile(user.uid);
            setUserProfile(profile);
            console.log('🔄 User profile refreshed');
        } catch (error) {
            console.error('❌ Error refreshing profile:', error);
        }
    };

    const value = {
        user,
        userProfile, // Export userProfile
        loading,
        login,
        register,
        logout,
        refreshUserProfile // Export refresh function
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};
