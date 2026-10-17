# Executive Summary: Flight Offer Validation System

## 1. Mimari Hedef ve Kapsam Sınırları
Bu sistem ticari bir biletleme operasyonu değildir. Temel amacı; modern yazılım mühendisliği pratiklerini, katı durum yönetimini (state management) ve sistemler arası deterministik sözleşmeleri kanıtlamaktır. Kapsam sentetik verilerle sınırlandırılmış; veritabanı kalıcılığı (persistence), kullanıcı yönetimi ve ödeme altyapısı bilinçli bir pragmatizmle dışarıda bırakılarak doğrudan iş mantığına odaklanılmıştır.

## 2. Kalite Nitelikleri (Quality Attributes)
Sistem, "Girdi -> Sistem -> Çıktı" determinizmine göre inşa edilmiştir. Şans veya öngörülemeyen davranış yoktur; yalnızca kontrol edilen değişkenler vardır.
* **Determinizm ve Tekrarlanabilirlik:** Yerel makine illüzyonları reddedilmiştir. `engine-strict=true` ile çalışma zamanı (Node v24) kilitlenmiştir. Sistemin başarısı, yalnızca izole ve temiz CI/CD ortamında kanıtlanır.
* **Veri Bütünlüğü (Data Integrity):** İstemci bir karar mercii değil, aptal bir terminaldir. Negatif fiyatlar, zaman yolculuğu paradoksu içeren uçuş segmentleri ve geçersiz para birimleri, arayüze sızmadan önce istemci sınırında (client boundary) mutlak olarak reddedilir.
* **Güvenilirlik ve Yarış Durumu (Race Condition) İzolasyonu:** Asenkron ağ gecikmelerinden kaynaklanan geçici ve bayat yanıtların (stale responses) arayüz durumunu manipüle etmesi engellenmiştir. Her arama ve seçim işlemi, artan mutlak kimliklerle (ID) kilitlenir.

## 3. Gereksinim ve Sözleşme Güvencesi (Requirements Assurance)
* **Tek Yetkili Kaynak (Source of Truth):** Karar mekanizması sunucuya (Spring Boot) aittir. İstemci `version 1` üzerinden işlem yapmaya çalıştığında, sunucunun güncel kaydı `version 2` ise işlem `409 OFFER_STALE` ile reddedilir. İstemci, sunucunun gerçekliğine boyun eğer.
* **Erişilebilirlik (Accessibility):** DOM mutasyonları ve asenkron durum geçişleri (`aria-live`, `aria-expanded`, dinamik odak yönetimi) yapısal olarak garanti altına alınmıştır. Ancak fiziksel donanım testi (VoiceOver) otomatize edilemeyeceği için sahte bir başarı üretilmemiş, denetim raporunda dürüstçe `Not run` olarak işaretlenmiştir.

## 4. Yazılım Kalite Güvencesi (SQA)
Sistem, hataların üretim ortamına geçmesini imkansız kılan agresif bir savunma hattına sahiptir.
* **Test İzolasyonu:** İstemcide 56, sunucuda 7 bağımsız test bulunur. Testler yalnızca başarılı durumları (happy path) değil, yanlış veri girişlerini ve sistem hatalarını da (red path) doğrular.
* **Sürekli Entegrasyon (CI):** Kod, GitHub Actions üzerinde sıfırdan inşa edilir. Statik analiz, birim testleri ve paketlenmiş JAR dosyası üzerinden gerçekleştirilen gerçek HTTP duman testleri (smoke tests) başarıyla geçmeden hiçbir değişiklik sisteme entegre edilemez.

**Sonuç:** Sistem optimize edilmiştir. Zayıflıklar ortadan kaldırılmış, mimari sınırlar net olarak çizilmiş ve her kural otomatik ortamda kanıtlanmıştır. Mimari denetime hazırdır.
