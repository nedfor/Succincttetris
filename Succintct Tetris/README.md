# Uzay Tetris Oyunu

Bu proje, HTML, CSS ve JavaScript kullanılarak oluşturulmuş basit bir Tetris oyunudur. Oyun, uzay temalı bir arka plana sahiptir ve yön tuşları ile oynanır.

## Özellikler

- Uzay temalı arka plan ve dolaşan uzay karakteri
- 2 dakikalık oyun süresi
- Skor ve yüksek skor takibi
- "Nasıl Oynanır" popup'ı
- Pembe renk teması
- Yön tuşları ve space tuşu ile kontrol
- Mobil uyumlu tasarım

## Nasıl Oynanır

- **← → Tuşları**: Blokları sağa veya sola hareket ettirin
- **↑ Tuşu**: Bloğu sola döndürün
- **↓ Tuşu**: Bloğu sağa döndürün
- **Space Tuşu**: Bloğu hızlıca aşağı indirin

## Kurulum

1. Bu depoyu bilgisayarınıza klonlayın veya ZIP olarak indirin.
2. İndirdiğiniz klasörü bir web sunucusunda çalıştırın veya doğrudan `index.html` dosyasını tarayıcınızda açın.
3. Uzay karakteri için kendi resminizi eklemek isterseniz, tetris.js dosyasındaki createSpaceCharacter fonksiyonunu düzenleyebilirsiniz.

## Oyun Amacı

Oyunun amacı, düşen blokları yönlendirerek tam satırlar oluşturmak ve mümkün olduğunca yüksek puan almaktır. Bir satır tamamen doldurulduğunda, o satır kaybolur ve üzerindeki bloklar aşağı kayar. Oyun 2 dakika sürer ve bu süre içinde en yüksek puanı almaya çalışmalısınız.

## Teknolojiler

- HTML5 Canvas
- CSS3
- JavaScript (ES6+)
- LocalStorage (yüksek skor kaydetme)

## Özelleştirme

Uzay karakteri için kendi resminizi eklemek için:
1. Resminizi projeye ekleyin
2. tetris.js dosyasındaki createSpaceCharacter fonksiyonunda şu satırı değiştirin:
   ```javascript
   character.innerHTML = '👾'; // Bu satırı değiştirin
   ```
   Şu şekilde:
   ```javascript
   character.innerHTML = '<img src="karakter.png" width="50" height="50">'; // karakter.png yerine kendi resminizin adını yazın
   ```

## Geliştirici

Bu oyun, basit ve eğlenceli bir Tetris deneyimi sunmak için tasarlanmıştır. İyi eğlenceler! 