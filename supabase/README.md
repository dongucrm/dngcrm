# Supabase Kurulumu

Bu klasor Dongu CRM icin Supabase veritabani kurulum dosyalarini icerir.

## 1. Supabase Projesi Olusturma

1. https://supabase.com adresine girin.
2. Yeni bir proje olusturun.
3. Proje bolgesi, proje adi ve veritabani sifresini belirleyin.
4. Proje hazir olana kadar bekleyin.

## 2. SQL Editor Kullanimi

1. Supabase Dashboard icinde projenizi acin.
2. Sol menuden SQL Editor ekranina girin.
3. Yeni bir query olusturun.

## 3. schema.sql Calistirma

1. `supabase/schema.sql` dosyasinin tamamini kopyalayin.
2. SQL Editor icine yapistirin.
3. Run butonuna basin.

Bu adim tablolar, indexler, trigger fonksiyonlari, RLS ve policy yapilarini olusturur.

## 4. seed.sql Calistirma

1. `supabase/seed.sql` dosyasinin tamamini kopyalayin.
2. SQL Editor icinde yeni bir query acin.
3. Icerigi yapistirip Run butonuna basin.

Bu adim baslangic rolleri, ornek programlar, ornek WhatsApp sablonlari, ornek leadler, ornek veli ve ogrenci verileri ekler. Seed veriler gercek kisisel veri icermez.

## 5. Migration Dosyalarini Calistirma

Mevcut veritabani uzerinde sonradan eklenen guvenli guncellemeler icin migration dosyalari kullanilir.

Call logs RLS guncellemesi icin:

1. `supabase/migrations/015_call_logs_rls_update.sql` dosyasinin tamamini kopyalayin.
2. Supabase SQL Editor icinde yeni bir query acin.
3. Icerigi yapistirip Run butonuna basin.

Bu migration tablo silmez ve veri kaybi olusturmaz. Sadece `call_logs` icin gerekli index, RLS ve policy guncellemelerini uygular.

Tasks / gorev RLS guncellemesi icin:

1. `supabase/migrations/016_tasks_rls_update.sql` dosyasinin tamamini kopyalayin.
2. Supabase SQL Editor icinde yeni bir query acin.
3. Icerigi yapistirip Run butonuna basin.

Bu migration tablo silmez ve veri kaybi olusturmaz. `tasks` tablosuna `created_by` alanini ekler, gorev indexlerini tamamlar ve admin / satis personeli RLS kurallarini gunceller.

Parents / students / notes RLS guncellemesi icin:

1. `supabase/migrations/017_parents_students_notes_rls_update.sql` dosyasinin tamamini kopyalayin.
2. Supabase SQL Editor icinde yeni bir query acin.
3. Icerigi yapistirip Run butonuna basin.

Bu migration tablo silmez ve veri kaybi olusturmaz. `parents` ve `students` tablolarina `created_by` / `source_lead_id` alanlarini ekler, parent-student-note RLS kurallarini ve ilgili registration/payment okuma policylerini gunceller.

Programs / registrations RLS guncellemesi icin:

1. `supabase/migrations/018_programs_registrations_rls_update.sql` dosyasinin tamamini kopyalayin.
2. Supabase SQL Editor icinde yeni bir query acin.
3. Icerigi yapistirip Run butonuna basin.

Bu migration tablo silmez ve veri kaybi olusturmaz. `programs.notes`, `registrations.created_by` ve `registrations.source_lead_id` alanlarini ekler; program, kayit ve ilgili not RLS kurallarini gunceller.

## 6. Project URL ve Publishable Key Alma

1. Supabase Dashboard icinde Project Settings ekranina girin.
2. API Keys bolumunu acin.
3. Project URL degerini kopyalayin.
4. Publishable Key degerini kopyalayin.

## 7. .env.local Dosyasina Ekleme

Proje kok dizininde `.env.local` dosyasi olusturun:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your-publishable-key
```

Gercek degerleri sadece lokal `.env.local` dosyasina yazin. `.env.local` git'e gonderilmemelidir.

## Guvenlik

- `service_role` key frontend projede kesinlikle kullanilmaz.
- Secret key frontend projede kesinlikle kullanilmaz.
- Database password repoya veya frontend koduna eklenmez.
- GitHub Actions icin degerler Repository Secrets uzerinden verilmelidir.
