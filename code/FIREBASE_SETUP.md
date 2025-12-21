# 🔥 HƯỚNG DẪN SETUP FIREBASE AUTHENTICATION

## ❌ Lỗi: "Firebase: Error (auth/configuration-not-found)"

Lỗi này xảy ra vì **Firebase Authentication chưa được bật** trong Firebase Console.

---

## 📝 CÁCH FIX (5 PHÚT)

### **Bước 1: Mở Firebase Console**
1. Truy cập: https://console.firebase.google.com/
2. Chọn project: **sky-piano-test-21615**
3. Nếu chưa có project → Tạo project mới

### **Bước 2: Bật Authentication**
1. Click vào **"Build"** (menu bên trái)
2. Click vào **"Authentication"**
3. Click nút **"Get started"** (nếu chưa setup)
4. Tab **"Sign-in method"**
5. Click vào **"Email/Password"**
6. Bật (Enable) **"Email/Password"** provider
7. Click **"Save"**

### **Bước 3: Kiểm tra Realtime Database**
1. Click vào **"Realtime Database"** (menu bên trái)
2. Nếu chưa có → Click **"Create Database"**
3. Chọn location: **asia-southeast1** (Singapore)
4. Start in **test mode** (để test, sau sẽ setup rules)
5. Click **"Enable"**

### **Bước 4: Kiểm tra Storage**
1. Click vào **"Storage"** (menu bên trái)
2. Nếu chưa có → Click **"Get started"**
3. Start in **test mode**
4. Click **"Done"**

### **Bước 5: Verify Config trong .env**
Kiểm tra file `.env` có đúng thông tin:
```env
VITE_FIREBASE_API_KEY=AIzaSyBlc7v_nR3TF7LJB0Nbv15Fk2DdxGc12lg
VITE_FIREBASE_AUTH_DOMAIN=sky-piano-test-21615.firebaseapp.com
VITE_FIREBASE_DATABASE_URL=https://sky-piano-test-21615-default-rtdb.firebaseio.com
VITE_FIREBASE_PROJECT_ID=sky-piano-test-21615
VITE_FIREBASE_STORAGE_BUCKET=sky-piano-test-21615.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=375774105042
VITE_FIREBASE_APP_ID=1:375774105042:web:9e6b8165348e08a5b00c0b
```

### **Bước 6: Restart App**
```bash
# Stop app (Ctrl+C)
npm run dev
```

---

## ✅ KIỂM TRA ĐÃ SETUP ĐÚNG

Sau khi setup xong, mở Console (F12) trong app, sẽ thấy:
```
✅ Firebase initialized successfully
📊 Config: { projectId: 'sky-piano-test-21615', authDomain: '...' }
```

Nếu vẫn lỗi → Check lại Authentication đã bật Email/Password chưa.

---

## 🎯 TEST ĐĂNG KÝ

1. Vào Settings → Click "Đăng nhập / Đăng ký"
2. Cửa sổ login mở ra
3. Click "Chưa có tài khoản? Đăng ký ngay"
4. Nhập email test: `test@example.com`
5. Nhập password: `123456`
6. Click "Đăng ký"
7. ✅ Thành công → Alert "Đã đăng ký thành công! Bạn đã nhận 1000 xu"

---

## 📞 VẪN GẶP VẤN ĐỀ?

Gửi screenshot console (F12) để debug!
