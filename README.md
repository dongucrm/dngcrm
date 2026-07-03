# dongu-crm

Döngü CRM için React, Vite, TypeScript, Tailwind CSS, React Router ve Supabase JS ile hazırlanmış başlangıç projesi.

## Kurulum

```bash
npm install
npm run dev
```

## Komutlar

```bash
npm run dev
npm run build
npm run lint
npm run preview
```

## Ortam Değişkenleri

`.env.example` dosyasını temel alarak Supabase bilgilerini tanımlayın.

```bash
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
```

## Yapı

- `src/components`: Ortak arayüz bileşenleri
- `src/layouts`: Admin panel yerleşimleri
- `src/pages`: İlk sayfalar
- `src/features`: Özellik bazlı modüller
- `src/lib`: Harici servis istemcileri
- `src/types`: Paylaşılan TypeScript tipleri
- `src/hooks`: React hook'ları
- `src/utils`: Yardımcı fonksiyonlar
- `src/routes`: Rota tanımları
- `supabase`: Supabase dosyaları
- `.github/workflows`: CI iş akışları
