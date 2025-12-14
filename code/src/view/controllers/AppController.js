export class AppController {
    constructor() {
        this.songs = {};
        this.isPlaying = false;

        this.loadMockData();
        this.renderSongLists();
        this.initEventListeners();
    }

    loadMockData() {
        this.songs = {
            "song_1": {
                name: "Chúng ta của hiện tại (Test Auto)",
                author: "Sơn Tùng MTP",
                price: 500,
                isOwned: true,
                isFavorite: true,
                songNotes: [
                    { "time": 0, "key": "1Key0" }, { "time": 200, "key": "1Key2" }, { "time": 400, "key": "1Key4" },
                    { "time": 600, "key": "1Key0" }, { "time": 800, "key": "1Key2" }, { "time": 1000, "key": "1Key4" },
                    { "time": 1200, "key": "1Key5" }, { "time": 1400, "key": "1Key7" }, { "time": 1600, "key": "1Key9" }
                ]
            },
            "song_2": { name: "Nấu ăn cho em", author: "Đen Vâu", price: 0, isOwned: true, isFavorite: false, songNotes: [] },
            "song_3": { name: "Cắt đôi nỗi sầu", author: "Tăng Duy Tân", price: 200, isOwned: false, isFavorite: false, songNotes: [] }
        };
    }

    renderSongLists() {
        const storeEl = document.getElementById('storeList');
        const libEl = document.getElementById('libList');
        if (storeEl) storeEl.innerHTML = "";
        if (libEl) libEl.innerHTML = "";

        Object.keys(this.songs).forEach(key => {
            const song = this.songs[key];
            const card = this.createSongCard(song, key);

            if (storeEl) storeEl.appendChild(card.cloneNode(true));

            if (song.isOwned && libEl) {
                const libCard = this.createSongCard(song, key, true);
                libEl.appendChild(libCard);
            }
        });
    }

    createSongCard(song, key, isPlayable = false) {
        const card = document.createElement('div');
        card.className = 'song-card';

        let subText = `<span class="card-price">💰 ${song.price} xu</span>`;
        if (song.isOwned) subText = `<span class="card-owned">✅ Đã sở hữu</span>`;

        card.innerHTML = `
            <div class="card-img">🎵</div>
            <div class="card-title">${song.name}</div>
            <div style="font-size:12px; color:#888; margin-bottom:5px;">${song.author}</div>
            ${subText}
        `;

        card.onclick = () => {
            if (isPlayable || song.isOwned) {
                this.playMusic(song);
            } else {
                if (confirm(`Mua bài "${song.name}" giá ${song.price} xu?`)) {
                    this.songs[key].isOwned = true;
                    this.renderSongLists();
                }
            }
        };
        return card;
    }

    playMusic(song) {
        this.isPlaying = true;

        document.getElementById('statusTitle').innerText = song.name;
        document.getElementById('statusSub').innerText = "Đang chạy Auto...";

        if (window.api && song.songNotes) {
            console.log("Gửi lệnh chơi:", song.songNotes.length, "nốt");
            window.api.playOnline(song.songNotes);
        } else {
            console.error("Lỗi: Không tìm thấy API hoặc nốt nhạc.");
        }
    }

    initEventListeners() {
        const btnStop = document.getElementById('btnStop');
        if (btnStop) btnStop.onclick = () => {
            if (window.api) window.api.stopMusic();
            document.getElementById('statusSub').innerText = "Đã dừng.";
        };
    }
}