document.addEventListener('DOMContentLoaded', () => {
    // Canvas ve context ayarları
    const canvas = document.getElementById('tetris');
    const context = canvas.getContext('2d');
    const grid = 30; // Her bir bloğun boyutu
    
    // Next piece canvas
    const nextPieceCanvas = document.getElementById('nextPiece');
    const nextPieceContext = nextPieceCanvas.getContext('2d');
    
    // Skor ve süre elementleri
    const scoreElement = document.getElementById('score');
    const highScoreElement = document.getElementById('highScore');
    const timeElement = document.getElementById('time');
    const usernameElement = document.getElementById('username');
    
    // Modal elementleri
    const modal = document.getElementById('howToPlayModal');
    const howToPlayBtn = document.getElementById('howToPlay');
    const closeBtn = document.querySelector('.close');
    const usernameModal = document.getElementById('usernameModal');
    const usernameForm = document.getElementById('usernameForm');
    const usernameInput = document.getElementById('usernameInput');
    
    // Oyun değişkenleri
    let score = 0;
    let highScore = localStorage.getItem('tetrisHighScore') || 0;
    let username = localStorage.getItem('tetrisUsername') || 'Player';
    let gameOver = false;
    let gameActive = false;
    let gameTime = 120; // 2 dakika (saniye cinsinden)
    let gameTimer;
    let dropCounter = 0;
    let dropInterval = 1000; // Normal düşme hızı (ms)
    let fastDropInterval = 30; // Hızlı düşme hızı (ms) - çok daha hızlı düşme için 30ms
    let currentDropInterval = dropInterval; // Mevcut düşme hızı
    let lastTime = 0;
    let nextPiece = null;
    
    // Yüksek skoru ve kullanıcı adını göster
    highScoreElement.textContent = highScore;
    usernameElement.textContent = username;
    
    // Uzay karakterleri oluşturma
    createSpaceCharacters(8); // Tüm mevcut görselleri kullanmak için 8 karakter oluştur
    
    // Tetris parçaları ve renkleri
    const pieces = [
        // I parçası
        {
            matrix: [
                [0, 0, 0, 0],
                [1, 1, 1, 1],
                [0, 0, 0, 0],
                [0, 0, 0, 0]
            ],
            color: '#FF69B4' // Pembe
        },
        // L parçası
        {
            matrix: [
                [0, 0, 2],
                [2, 2, 2],
                [0, 0, 0]
            ],
            color: '#FF1493' // Koyu Pembe
        },
        // J parçası
        {
            matrix: [
                [3, 0, 0],
                [3, 3, 3],
                [0, 0, 0]
            ],
            color: '#FFB6C1' // Açık Pembe
        },
        // O parçası
        {
            matrix: [
                [4, 4],
                [4, 4]
            ],
            color: '#FFC0CB' // Pembe
        },
        // S parçası
        {
            matrix: [
                [0, 5, 5],
                [5, 5, 0],
                [0, 0, 0]
            ],
            color: '#DB7093' // Palevioletred
        },
        // T parçası
        {
            matrix: [
                [0, 6, 0],
                [6, 6, 6],
                [0, 0, 0]
            ],
            color: '#C71585' // Mediumvioletred
        },
        // Z parçası
        {
            matrix: [
                [7, 7, 0],
                [0, 7, 7],
                [0, 0, 0]
            ],
            color: '#FF00FF' // Magenta
        }
    ];
    
    // Oyun alanı oluşturma
    const arena = createMatrix(10, 17); // Oyun alanını kısalttık
    
    // Oyuncu nesnesi
    const player = {
        pos: {x: 0, y: 0},
        matrix: null,
        color: null
    };
    
    // Uzay karakterleri oluşturma fonksiyonu
    function createSpaceCharacters(count) {
        const body = document.querySelector('body');
        const characters = [];
        
        // Mevcut karakterleri temizle
        const existingCharacters = document.querySelectorAll('.space-character');
        existingCharacters.forEach(char => char.remove());
        
        // Karakterlerin hareketlerini takip etmek için
        const characterStates = [];
        
        // Kullanılacak görseller - sadece var olan dosyalar
        const images = [
            'yeni-gorsel.png', 
            'yeni-gorsel1.png', 
            'yeni-gorsel2.png', 
            'yeni-gorsel3.png', 
            'yeni-gorsel4.png',
            'yeni-gorsel5.png',
            'yeni-gorsel6.png',
            'yeni-gorsel7.png'
        ];
        
        // Her görselden sadece bir tane oluştur
        for (let i = 0; i < images.length && i < count; i++) {
            const character = document.createElement('div');
            character.className = 'space-character';
            
            // Görsel seç
            const image = images[i];
            
            // Boyut belirle: yeni-gorsel.png için 200px, diğerleri için 80px
            const characterSize = image === 'yeni-gorsel.png' ? 200 : 80;
            
            // Karakter için görsel
            character.innerHTML = `<img src="${image}" width="${characterSize}" height="${characterSize}">`;
            
            // Rastgele başlangıç pozisyonu
            const startX = Math.random() * (window.innerWidth - characterSize);
            const startY = Math.random() * (window.innerHeight - characterSize);
            character.style.left = startX + 'px';
            character.style.top = startY + 'px';
            
            // Rastgele hareket yönü ve hızı
            const state = {
                x: startX,
                y: startY,
                vx: (Math.random() - 0.5) * 2, // -1 ile 1 arasında hız
                vy: (Math.random() - 0.5) * 2,
                element: character,
                image: image, // Görsel bilgisini sakla
                size: characterSize // Boyut bilgisini sakla
            };
            
            characterStates.push(state);
            characters.push(character);
            body.appendChild(character);
        }
        
        // Karakterlerin hareketini güncelle
        function updateCharacters() {
            // Her karakterin pozisyonunu güncelle
            for (let i = 0; i < characterStates.length; i++) {
                const state = characterStates[i];
                const width = window.innerWidth - state.size;
                const height = window.innerHeight - state.size;
                
                // Yeni pozisyonu hesapla
                state.x += state.vx;
                state.y += state.vy;
                
                // Ekran sınırlarını kontrol et
                if (state.x <= 0 || state.x >= width) {
                    state.vx = -state.vx; // Yönü tersine çevir
                    state.x = Math.max(0, Math.min(state.x, width));
                }
                
                if (state.y <= 0 || state.y >= height) {
                    state.vy = -state.vy; // Yönü tersine çevir
                    state.y = Math.max(0, Math.min(state.y, height));
                }
                
                // Diğer karakterlerle çarpışma kontrolü
                for (let j = i + 1; j < characterStates.length; j++) {
                    const other = characterStates[j];
                    
                    // Basit çarpışma kontrolü
                    const dx = state.x - other.x;
                    const dy = state.y - other.y;
                    const distance = Math.sqrt(dx * dx + dy * dy);
                    const minDistance = (state.size + other.size) / 2;
                    
                    if (distance < minDistance) {
                        // Çarpışma oldu, yönleri değiştir
                        const tempVx = state.vx;
                        const tempVy = state.vy;
                        
                        state.vx = other.vx;
                        state.vy = other.vy;
                        
                        other.vx = tempVx;
                        other.vy = tempVy;
                        
                        // Hafif bir itme ekle
                        const pushFactor = 5;
                        if (dx > 0) {
                            state.x += pushFactor;
                            other.x -= pushFactor;
                        } else {
                            state.x -= pushFactor;
                            other.x += pushFactor;
                        }
                        
                        if (dy > 0) {
                            state.y += pushFactor;
                            other.y -= pushFactor;
                        } else {
                            state.y -= pushFactor;
                            other.y += pushFactor;
                        }
                    }
                }
                
                // Karakterin pozisyonunu güncelle
                state.element.style.left = state.x + 'px';
                state.element.style.top = state.y + 'px';
            }
            
            // Bir sonraki animasyon karesini planla
            requestAnimationFrame(updateCharacters);
        }
        
        // Animasyonu başlat
        updateCharacters();
    }
    
    // Rastgele parça seçme
    function playerReset() {
        // Eğer bir sonraki parça zaten seçilmişse, onu kullan
        if (nextPiece) {
            player.matrix = nextPiece.matrix;
            player.color = nextPiece.color;
        } else {
            // İlk parça için rastgele seç
            const piece = pieces[Math.floor(Math.random() * pieces.length)];
            player.matrix = piece.matrix;
            player.color = piece.color;
        }
        
        // Bir sonraki parçayı seç
        const nextPieceIndex = Math.floor(Math.random() * pieces.length);
        nextPiece = pieces[nextPieceIndex];
        
        // Bir sonraki parçayı göster
        drawNextPiece();
        
        player.pos.y = 0;
        player.pos.x = Math.floor(arena[0].length / 2) - Math.floor(player.matrix.length / 2);
        
        // Oyun alanı doldu mu kontrol et
        if (collide(arena, player)) {
            endGame();
        }
    }
    
    // Bir sonraki parçayı çiz
    function drawNextPiece() {
        // Canvas'ı temizle
        nextPieceContext.fillStyle = 'rgba(0, 0, 0, 0.8)';
        nextPieceContext.fillRect(0, 0, nextPieceCanvas.width, nextPieceCanvas.height);
        
        // Bir sonraki parçayı çiz
        if (nextPiece) {
            nextPiece.matrix.forEach((row, y) => {
                row.forEach((value, x) => {
                    if (value !== 0) {
                        nextPieceContext.fillStyle = nextPiece.color;
                        nextPieceContext.fillRect(
                            x * grid + 15,
                            y * grid + 15,
                            grid - 1,
                            grid - 1
                        );
                        
                        // Parlaklık efekti
                        nextPieceContext.strokeStyle = 'rgba(255, 255, 255, 0.5)';
                        nextPieceContext.lineWidth = 1;
                        nextPieceContext.strokeRect(
                            x * grid + 15,
                            y * grid + 15,
                            grid - 1,
                            grid - 1
                        );
                    }
                });
            });
        }
    }
    
    // Matris oluşturma fonksiyonu
    function createMatrix(width, height) {
        const matrix = [];
        while (height--) {
            matrix.push(new Array(width).fill(0));
        }
        return matrix;
    }
    
    // Çarpışma kontrolü
    function collide(arena, player) {
        const [m, o] = [player.matrix, player.pos];
        for (let y = 0; y < m.length; ++y) {
            for (let x = 0; x < m[y].length; ++x) {
                if (m[y][x] !== 0 &&
                    (arena[y + o.y] &&
                    arena[y + o.y][x + o.x]) !== 0) {
                    return true;
                }
            }
        }
        return false;
    }
    
    // Matrisi birleştirme
    function merge(arena, player) {
        player.matrix.forEach((row, y) => {
            row.forEach((value, x) => {
                if (value !== 0) {
                    arena[y + player.pos.y][x + player.pos.x] = value;
                }
            });
        });
    }
    
    // Matrisi temizleme (tamamlanan satırları silme)
    function arenaSweep() {
        let rowCount = 0;
        outer: for (let y = arena.length - 1; y >= 0; --y) {
            for (let x = 0; x < arena[y].length; ++x) {
                if (arena[y][x] === 0) {
                    continue outer;
                }
            }
            
            // Tamamlanan satırı sil
            const row = arena.splice(y, 1)[0].fill(0);
            arena.unshift(row);
            ++y;
            
            rowCount++;
        }
        
        // Skor güncelleme
        if (rowCount > 0) {
            // Satır sayısına göre skor hesaplama (daha fazla satır = daha fazla puan)
            score += rowCount * 100 * rowCount; // Örneğin: 1 satır = 100, 2 satır = 400, 3 satır = 900 puan
            scoreElement.textContent = score;
            
            // Yüksek skor kontrolü
            if (score > highScore) {
                highScore = score;
                highScoreElement.textContent = highScore;
                localStorage.setItem('tetrisHighScore', highScore);
            }
        }
    }
    
    // Oyuncuyu hareket ettirme
    function playerMove(dir) {
        player.pos.x += dir;
        if (collide(arena, player)) {
            player.pos.x -= dir;
        }
    }
    
    // Oyuncuyu döndürme
    function playerRotate(dir) {
        const pos = player.pos.x;
        let offset = 1;
        rotate(player.matrix, dir);
        
        // Döndürme sonrası çarpışma kontrolü ve düzeltme
        while (collide(arena, player)) {
            player.pos.x += offset;
            offset = -(offset + (offset > 0 ? 1 : -1));
            if (offset > player.matrix[0].length) {
                rotate(player.matrix, -dir);
                player.pos.x = pos;
                return;
            }
        }
    }
    
    // Matris döndürme
    function rotate(matrix, dir) {
        for (let y = 0; y < matrix.length; ++y) {
            for (let x = 0; x < y; ++x) {
                [
                    matrix[x][y],
                    matrix[y][x]
                ] = [
                    matrix[y][x],
                    matrix[x][y]
                ];
            }
        }
        
        if (dir > 0) {
            matrix.forEach(row => row.reverse());
        } else {
            matrix.reverse();
        }
    }
    
    // Oyuncuyu düşürme
    function playerDrop() {
        player.pos.y++;
        if (collide(arena, player)) {
            player.pos.y--;
            merge(arena, player);
            playerReset();
            arenaSweep();
        }
        dropCounter = 0;
    }
    
    // Hızlı düşürme
    function playerDropFast() {
        while (!collide(arena, player)) {
            player.pos.y++;
        }
        player.pos.y--;
        merge(arena, player);
        playerReset();
        arenaSweep();
        dropCounter = 0;
    }
    
    // Oyun alanını çiz
    function draw() {
        // Arka planı temizle
        context.fillStyle = 'rgba(0, 0, 0, 0.8)';
        context.fillRect(0, 0, canvas.width, canvas.height);
        
        // Oyun alanını çiz
        drawMatrix(arena, {x: 0, y: 0});
        
        // Aktif parçayı çiz
        drawMatrix(player.matrix, player.pos, player.color);
    }
    
    // Matrisi çiz
    function drawMatrix(matrix, offset, color, opacity = 1) {
        matrix.forEach((row, y) => {
            row.forEach((value, x) => {
                if (value !== 0) {
                    let fillColor = color || getColorForValue(value);
                    
                    // Opaklık ayarı
                    if (opacity < 1) {
                        // Rengi RGBA formatına dönüştür
                        const rgbMatch = fillColor.match(/^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i);
                        if (rgbMatch) {
                            const r = parseInt(rgbMatch[1], 16);
                            const g = parseInt(rgbMatch[2], 16);
                            const b = parseInt(rgbMatch[3], 16);
                            fillColor = `rgba(${r}, ${g}, ${b}, ${opacity})`;
                        }
                    }
                    
                    context.fillStyle = fillColor;
                    context.fillRect(
                        (x + offset.x) * grid,
                        (y + offset.y) * grid,
                        grid - 1,
                        grid - 1
                    );
                    
                    // Parlaklık efekti
                    context.strokeStyle = `rgba(255, 255, 255, ${opacity * 0.5})`;
                    context.lineWidth = 1;
                    context.strokeRect(
                        (x + offset.x) * grid,
                        (y + offset.y) * grid,
                        grid - 1,
                        grid - 1
                    );
                }
            });
        });
    }
    
    // Değere göre renk döndür
    function getColorForValue(value) {
        const colors = [
            null,
            '#FF69B4', // Pembe
            '#FF1493', // Koyu Pembe
            '#FFB6C1', // Açık Pembe
            '#FFC0CB', // Pembe
            '#DB7093', // Palevioletred
            '#C71585', // Mediumvioletred
            '#FF00FF'  // Magenta
        ];
        return colors[value];
    }
    
    // Oyun döngüsü
    function update(time = 0) {
        if (!gameActive) return;
        
        const deltaTime = time - lastTime;
        lastTime = time;
        
        dropCounter += deltaTime;
        if (dropCounter > currentDropInterval) {
            playerDrop();
        }
        
        draw();
        
        if (!gameOver) {
            requestAnimationFrame(update);
        }
    }
    
    // Süre güncelleme
    function updateTimer() {
        if (gameTime <= 0) {
            endGame();
            return;
        }
        
        gameTime--;
        const minutes = Math.floor(gameTime / 60);
        const seconds = gameTime % 60;
        timeElement.textContent = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
    }
    
    // Kullanıcı adı modalını göster
    function showUsernameModal() {
        usernameModal.style.display = 'block';
        usernameInput.value = username;
        usernameInput.focus();
    }
    
    // Kullanıcı adını kaydet
    function saveUsername(event) {
        event.preventDefault();
        const newUsername = usernameInput.value.trim();
        if (newUsername) {
            username = newUsername;
            localStorage.setItem('tetrisUsername', username);
            usernameElement.textContent = username;
            usernameModal.style.display = 'none';
            startGame();
        }
    }
    
    // Oyunu başlat
    function startGame() {
        if (gameActive) return;
        
        // Oyun alanını temizle
        arena.forEach(row => row.fill(0));
        
        // Değişkenleri sıfırla
        score = 0;
        scoreElement.textContent = '0';
        gameOver = false;
        gameActive = true;
        gameTime = 120;
        timeElement.textContent = '2:00';
        dropCounter = 0;
        currentDropInterval = dropInterval; // Düşme hızını normal değere sıfırla
        lastTime = 0;
        
        // Zamanlayıcıyı başlat
        gameTimer = setInterval(updateTimer, 1000);
        
        // İlk parçayı oluştur
        playerReset();
        
        // Oyun döngüsünü başlat
        update();
    }
    
    // Oyunu bitir
    function endGame() {
        gameOver = true;
        gameActive = false;
        clearInterval(gameTimer);
        
        // Arka plan görselleri matlaştır
        const spaceCharacters = document.querySelectorAll('.space-character');
        spaceCharacters.forEach(char => {
            char.style.opacity = '0.2'; // Görselleri matlaştır
        });
        
        // Oyun sonu overlay'i oluştur
        const overlay = document.createElement('div');
        overlay.id = 'game-over-overlay';
        overlay.style.position = 'fixed';
        overlay.style.top = '0';
        overlay.style.left = '0';
        overlay.style.width = '100%';
        overlay.style.height = '100%';
        overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
        overlay.style.zIndex = '1000';
        overlay.style.display = 'flex';
        overlay.style.justifyContent = 'center';
        overlay.style.alignItems = 'center';
        document.body.appendChild(overlay);
        
        // Oyun sonu mesaj kutusu
        const messageBox = document.createElement('div');
        messageBox.style.width = '400px';
        messageBox.style.padding = '30px';
        messageBox.style.backgroundColor = 'rgba(0, 0, 0, 0.9)';
        messageBox.style.border = '3px solid #FF69B4';
        messageBox.style.borderRadius = '10px';
        messageBox.style.textAlign = 'center';
        messageBox.style.boxShadow = '0 0 20px rgba(255, 105, 180, 0.7)';
        overlay.appendChild(messageBox);
        
        // Game Over yazısı
        const gameOverText = document.createElement('h1');
        gameOverText.textContent = 'GAME OVER';
        gameOverText.style.color = '#FF69B4';
        gameOverText.style.fontSize = '36px';
        gameOverText.style.marginBottom = '20px';
        messageBox.appendChild(gameOverText);
        
        // Skor
        const scoreText = document.createElement('p');
        scoreText.textContent = `Score: ${score}`;
        scoreText.style.color = '#FFF';
        scoreText.style.fontSize = '24px';
        scoreText.style.marginBottom = '20px';
        messageBox.appendChild(scoreText);
        
        // Yeniden başlatma mesajı
        const restartText = document.createElement('p');
        restartText.textContent = 'Click to play again';
        restartText.style.color = '#FF69B4';
        restartText.style.fontSize = '18px';
        restartText.style.cursor = 'pointer';
        messageBox.appendChild(restartText);
        
        // Tıklama olayı
        overlay.addEventListener('click', () => {
            // Overlay'i kaldır
            document.body.removeChild(overlay);
            
            // Görsellerin opaklığını geri getir
            spaceCharacters.forEach(char => {
                char.style.opacity = '1';
            });
            
            // Oyunu yeniden başlat
            startGame();
        });
        
        // Canvas içinde de oyun sonu mesajını göster (eski yöntem)
        context.fillStyle = 'rgba(0, 0, 0, 0.9)';
        context.fillRect(0, 0, canvas.width, canvas.height);
        drawMatrix(arena, {x: 0, y: 0}, null, 0.3);
    }
    
    // Klavye kontrolleri
    document.addEventListener('keydown', event => {
        if (!gameActive) return;
        
        switch (event.keyCode) {
            case 37: // Sol ok
                playerMove(-1);
                break;
            case 39: // Sağ ok
                playerMove(1);
                break;
            case 38: // Yukarı ok - Sola döndür
                playerRotate(-1);
                break;
            case 40: // Aşağı ok - Sağa döndür
                playerRotate(1);
                break;
            case 32: // Space tuşu - Hızlı düşürme
                currentDropInterval = fastDropInterval; // Hızlı düşme modunu aktifleştir
                break;
        }
    });
    
    // Space tuşu bırakıldığında normal hıza dön
    document.addEventListener('keyup', event => {
        if (!gameActive) return;
        
        if (event.keyCode === 32) { // Space tuşu
            currentDropInterval = dropInterval; // Normal düşme hızına dön
        }
    });
    
    // Canvas tıklama (oyunu başlatma/yeniden başlatma)
    canvas.addEventListener('click', () => {
        if (!gameActive && !gameOver) {
            // Oyun aktif değilse ve bitmemişse kullanıcı adı modalını göster
            showUsernameModal();
        }
    });
    
    // Modal kontrolleri
    howToPlayBtn.addEventListener('click', () => {
        modal.style.display = 'block';
    });
    
    closeBtn.addEventListener('click', () => {
        modal.style.display = 'none';
    });
    
    window.addEventListener('click', (event) => {
        if (event.target === modal) {
            modal.style.display = 'none';
        }
        if (event.target === usernameModal) {
            usernameModal.style.display = 'none';
        }
    });
    
    // Kullanıcı adı formu gönderme
    usernameForm.addEventListener('submit', saveUsername);
    
    // İlk başlangıçta kullanıcı adı modalını göster
    showUsernameModal();
}); 