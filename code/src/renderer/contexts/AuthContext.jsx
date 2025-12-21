import { createContext, useContext, useState, useEffect } from 'react';
import { auth } from '../../config/firebase';
import {
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signOut,
    onAuthStateChanged
} from 'firebase/auth';
import { createUserProfile } from '../../services/firebaseService';

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
    const [loading, setLoading] = useState(true);

    // Lắng nghe thay đổi auth state
    useEffect(() => {
        if (!auth) {
            console.warn('⚠️ Firebase Auth not initialized');
            setLoading(false);
            return;
        }

        const unsubscribe = onAuthStateChanged(auth, (user) => {
            console.log('🔐 Auth state changed:', user ? user.email : 'Not logged in');
            setUser(user);
            setLoading(false);
        });

        return unsubscribe;
    }, []);

    // Đăng nhập
    const login = async (email, password) => {
        if (!auth) throw new Error('Firebase Auth not initialized');
        return signInWithEmailAndPassword(auth, email, password);
    };

    // Đăng ký
    const register = async (email, password) => {
        if (!auth) throw new Error('Firebase Auth not initialized');
        
        // Tạo user trong Firebase Auth
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        
        // Tạo user profile trong Realtime Database (tặng 1000 xu)
        try {
            await createUserProfile(userCredential.user.uid, email);
            console.log('✅ User registered with 1000 coins:', userCredential.user.email);
        } catch (error) {
            console.error('⚠️ Failed to create user profile:', error);
            // Vẫn cho phép đăng ký, sẽ tạo profile sau
        }
        
        return userCredential;
    };

    // Đăng xuất
    const logout = async () => {
        if (!auth) throw new Error('Firebase Auth not initialized');
        return signOut(auth);
    };

    const value = {
        user,
        loading,
        login,
        register,
        logout
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};
