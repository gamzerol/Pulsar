# Pulsar

Kişisel antrenman takibine odaklanmış, modern ve hafif bir fitness tracker uygulaması. React 19 + TypeScript ile geliştirilmiş olup Supabase'i backend olarak kullanır.

---

## Tech Stack

| Katman | Teknoloji |
|---|---|
| UI Framework | React 19 + TypeScript |
| Styling | Tailwind CSS |
| Backend / DB | Supabase (PostgreSQL) |
| Grafikler | Recharts |
| İkonlar | Lucide React |
| Bootstrapper | Create React App |

---

## Özellikler

- Antrenman oluşturma, düzenleme ve listeleme
- Egzersiz kütüphanesi ve kategori bazlı filtreleme
- Şablon (template) ile hızlı antrenman başlatma
- Vücut ağırlığı ve hedef takibi
- Haftalık raporlar ve istatistikler
- Galaksi görünümü ile görsel ilerleme takibi
- Animasyonlu yıldız arka planı ile koyu tema arayüzü

---

## Proje Yapısı

```
src/
├── App.tsx                  # Uygulama kabuğu ve sekme yönlendirici (Router)
├── index.tsx                # React giriş noktası
├── index.css                # Global stiller ve CSS değişkenleri
│
├── types/
│   └── index.ts             # Tüm TypeScript tip tanımları
│
├── lib/
│   ├── AppContext.tsx        # Global state (useApp hook)
│   ├── supabase.ts          # Paylaşımlı Supabase client
│   └── utils.ts             # Yardımcı fonksiyonlar ve sabitler
│
├── pages/
│   ├── HomePage.tsx         # Ana sayfa — karşılama ve bağlantı durumu
│   ├── WorkoutPage.tsx      # Antrenman listesi
│   ├── WorkoutFormPage.tsx  # Antrenman oluşturma / düzenleme formu
│   ├── GalaxyPage.tsx       # Galaksi sekmesi
│   ├── ReportsPage.tsx      # Raporlar sekmesi
│   └── LibraryPage.tsx      # Egzersiz kütüphanesi
│
└── components/
    ├── layout/
    │   ├── BottomNavs.tsx   # Sabit alt navigasyon çubuğu (5 sekme)
    │   └── Screen.tsx       # Sayfa sarmalayıcı + Header bileşeni
    ├── ui/
    │   ├── index.tsx        # Tasarım sistemi (Card, Button, Badge, Input…)
    │   ├── StarBackground.tsx  # Animasyonlu yıldız arka planı
    │   └── Toast.tsx        # Geçici bildirim katmanı
    └── workout/
        ├── WorkoutCard.tsx          # Tek antrenman özet kartı
        ├── ExerciseRow.tsx          # Form içi egzersiz satırı
        ├── ExercisePickerModal.tsx  # Egzersiz seçim modali
        ├── ExerciseDetailModal.tsx  # Egzersiz detay modali
        └── TemplatePickerModal.tsx  # Şablon seçim modali
```

---

## Veri Modeli

| Model | Açıklama |
|---|---|
| `Workout` | `type`, `date`, `week_number`, `year`, opsiyonel `workout_exercises[]` |
| `WorkoutExercise` | Antrenman–egzersiz birleşim tablosu; set/tekrar/süre tutar |
| `Exercise` | `category` ve `is_default` alanlarına sahip egzersiz kaydı |
| `Template` | İç içe `TemplateExercise[]` barındıran yeniden kullanılabilir şablon |
| `BodyWeight` | Vücut ağırlığı takip kaydı |
| `Goal` | Hedef takip kaydı |

---

## Kurulum

### Gereksinimler

- Node.js 18+
- Bir Supabase projesi

### Adımlar

```bash
# Bağımlılıkları yükle
npm install

# Ortam değişkenlerini tanımla
cp .env.example .env
# .env dosyasını düzenleyerek Supabase bilgilerini ekle

# Geliştirme sunucusunu başlat
npm start
```

### Ortam Değişkenleri

`.env` dosyasında aşağıdaki değişkenler gereklidir:

```
REACT_APP_SUPABASE_URL=...
REACT_APP_SUPABASE_ANON_KEY=...
```

---

## Komutlar

```bash
npm start                          # Geliştirme sunucusu — http://localhost:3000
npm run build                      # Production build
npm test                           # Testleri izleme modunda çalıştır
npm test -- --watchAll=false       # Testleri tek seferlik çalıştır (CI)
npm test -- -t "test adı"          # Belirli bir testi çalıştır
```

---

## Mimari Notlar

- **Global State** — tüm uygulama durumu `src/lib/AppContext.tsx` içindedir. Bileşenler `useApp()` hook'u ile veriye erişmeli, doğrudan Supabase sorgusu yapmamalıdır.
- **Türkçe UI** — tüm kullanıcıya yönelik etiketler ve tarih formatları Türkçedir (`utils.ts`).
- **Renk Haritaları** — grafiklerde kullanılan `WORKOUT_TYPE_COLORS` ve `CATEGORY_COLORS` sabitleri `utils.ts` içinde tanımlıdır.
- **Supabase Client** — `src/lib/supabase.ts` içindeki tek örnek kullanılmalı, ek client oluşturulmamalıdır.
