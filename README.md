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

## Supabase Bağlantısı

Supabase bağlantısı için gerçek değerleri repoya eklemeyin. Yerelde `.env.local` dosyası oluşturun ve `.env.example` içeriğini temel alın:

```bash
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your-publishable-key
```

`VITE_SUPABASE_URL` değerini Supabase proje URL'siyle, `VITE_SUPABASE_PUBLISHABLE_KEY` değerini ise yalnızca publishable key ile değiştirin.

Service role key, secret key veya database password kesinlikle kullanılmamalıdır. `.env.local` Git'e gönderilmez; sadece `.env.example` örnek değerlerle repoda tutulur.

## GitHub Pages Yayını

GitHub Pages yayını için proje `vite.config.ts` içinde `/dngcrm/` base path'iyle hazırlanmıştır.

1. GitHub repo sayfasında `Settings` bölümünü açın.
2. `Pages` menüsüne girin.
3. `Source` olarak `GitHub Actions` seçin.
4. `Settings > Secrets and variables > Actions` bölümünden repository secrets ekleyin:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_PUBLISHABLE_KEY`
5. `main` branch'e push sonrası `.github/workflows/deploy.yml` otomatik olarak build alır ve `dist` klasörünü GitHub Pages'e yayınlar.

## Yapı

- `src/components`: Ortak arayüz bileşenleri
- `src/layouts`: Admin panel yerleşimleri
- `src/pages`: İlk sayfalar
- `src/features`: Özellik bazlı modüller
- `src/lib`: Harici servis istemcileri
- `src/config`: Environment doğrulama dosyaları
- `src/types`: Paylaşılan TypeScript tipleri
- `src/hooks`: React hook'ları
- `src/utils`: Yardımcı fonksiyonlar
- `src/routes`: Rota tanımları
- `supabase`: Supabase dosyaları
- `.github/workflows`: CI iş akışları
