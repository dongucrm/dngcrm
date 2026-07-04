-- Döngü CRM Supabase seed data
--
-- Kullanım:
-- 1. Önce supabase/schema.sql dosyasını Supabase SQL Editor içinde çalıştırın.
-- 2. Ardından bu dosyanın tamamını SQL Editor'e yapıştırıp çalıştırın.
--
-- Not:
-- - Bu dosyada gerçek kişisel veri yoktur.
-- - Örnek telefonlar ve e-posta adresleri test amaçlıdır.
-- - Dosya tekrar çalıştırıldığında aynı seed verileri çoğaltmamaya çalışır.

begin;

insert into public.roles (name, description)
values
  ('admin', 'Sistem yöneticisi'),
  ('satis_personeli', 'Satış personeli')
on conflict (name) do update
set description = excluded.description;

insert into public.programs (name, type, description, price, quota)
select v.name, v.type, v.description, v.price, v.quota
from (
  values
    ('Orion Kamp', 'kamp', 'Çocuklar için bilim, teknoloji ve keşif kampı.', 0::numeric, 25),
    ('Dron Atölyesi', 'atolye', 'Dron teknolojileri ve temel uçuş prensipleri atölyesi.', 0::numeric, 16),
    ('Python Eğitimi', 'egitim', 'Python ile programlamaya giriş eğitimi.', 0::numeric, 20),
    ('Robotik Kodlama', 'egitim', 'Robotik ve blok tabanlı kodlama eğitimi.', 0::numeric, 18),
    ('3D Tasarım', 'atolye', '3D modelleme ve tasarım atölyesi.', 0::numeric, 15)
) as v(name, type, description, price, quota)
where not exists (
  select 1
  from public.programs p
  where p.name = v.name
);

insert into public.whatsapp_templates (title, message, category)
select v.title, v.message, v.category
from (
  values
    (
      'İlk İletişim',
      'Merhaba {{veli_adi}}, Döngü CRM üzerinden başvurunuz bize ulaştı. Size en kısa sürede detaylı bilgi vermek isteriz.',
      'lead'
    ),
    (
      'Görüşme Hatırlatma',
      'Merhaba {{veli_adi}}, {{program_adi}} hakkında planladığımız görüşmeyi hatırlatmak isteriz. Uygun olduğunuzda bizimle iletişime geçebilirsiniz.',
      'arama'
    ),
    (
      'Kayıt Bilgilendirme',
      'Merhaba {{veli_adi}}, {{ogrenci_adi}} için {{program_adi}} ön kayıt süreci başlatılmıştır. Detaylar için bize ulaşabilirsiniz.',
      'kayit'
    ),
    (
      'Ödeme Hatırlatma',
      'Merhaba {{veli_adi}}, {{program_adi}} kaydınız için ödeme hatırlatması yapmak isteriz. Yardımcı olmamız için bize yazabilirsiniz.',
      'odeme'
    ),
    (
      'Teşekkür Mesajı',
      'Merhaba {{veli_adi}}, Döngü CRM ile iletişime geçtiğiniz için teşekkür ederiz. Size yardımcı olmaktan mutluluk duyarız.',
      'genel'
    )
) as v(title, message, category)
where not exists (
  select 1
  from public.whatsapp_templates t
  where t.title = v.title
);

insert into public.parents (full_name, phone, email, address, notes)
select v.full_name, v.phone, v.email, v.address, v.notes
from (
  values
    ('Örnek Veli 1', '0500 000 00 01', 'veli1@example.com', 'Örnek Mahalle, Test Sokak No:1', 'Seed test velisi.'),
    ('Örnek Veli 2', '0500 000 00 02', 'veli2@example.com', 'Örnek Mahalle, Test Sokak No:2', 'Seed test velisi.'),
    ('Örnek Veli 3', '0500 000 00 03', 'veli3@example.com', 'Örnek Mahalle, Test Sokak No:3', 'Seed test velisi.')
) as v(full_name, phone, email, address, notes)
where not exists (
  select 1
  from public.parents p
  where p.phone = v.phone
);

insert into public.students (parent_id, full_name, age, birth_date, school, notes)
select p.id, v.student_name, v.age, v.birth_date::date, v.school, v.notes
from (
  values
    ('0500 000 00 01', 'Örnek Öğrenci 1', 10, '2016-04-12', 'Örnek İlkokul', 'Robotik kodlamaya ilgili.'),
    ('0500 000 00 02', 'Örnek Öğrenci 2', 12, '2014-09-03', 'Örnek Ortaokul', 'Python eğitimini denemek istiyor.'),
    ('0500 000 00 03', 'Örnek Öğrenci 3', 9, '2017-01-24', 'Örnek İlkokul', '3D tasarım atölyesi için aday.')
) as v(parent_phone, student_name, age, birth_date, school, notes)
join public.parents p on p.phone = v.parent_phone
where not exists (
  select 1
  from public.students s
  where s.parent_id = p.id
    and s.full_name = v.student_name
);

insert into public.leads (
  full_name,
  phone,
  email,
  child_name,
  child_age,
  source,
  interested_program_id,
  status,
  priority,
  probability,
  next_call_date,
  notes
)
select
  v.full_name,
  v.phone,
  v.email,
  v.child_name,
  v.child_age,
  v.source,
  p.id,
  v.status,
  v.priority,
  v.probability,
  v.next_call_date::timestamptz,
  v.notes
from (
  values
    (
      'Örnek Lead 1',
      '0500 100 00 01',
      'lead1@example.com',
      'Örnek Çocuk 1',
      10,
      'web_form',
      'Orion Kamp',
      'yeni_lead',
      'orta',
      'orta',
      '2026-07-06 10:00:00+03',
      'İlk arama bekleniyor.'
    ),
    (
      'Örnek Lead 2',
      '0500 100 00 02',
      'lead2@example.com',
      'Örnek Çocuk 2',
      12,
      'instagram',
      'Python Eğitimi',
      'aranacak',
      'yuksek',
      'yuksek',
      '2026-07-06 14:00:00+03',
      'Program detayları sorulacak.'
    ),
    (
      'Örnek Lead 3',
      '0500 100 00 03',
      'lead3@example.com',
      'Örnek Çocuk 3',
      9,
      'telefon',
      'Dron Atölyesi',
      'ulasilamadi',
      'dusuk',
      'orta',
      '2026-07-07 11:30:00+03',
      'Tekrar aranacak.'
    )
) as v(
  full_name,
  phone,
  email,
  child_name,
  child_age,
  source,
  program_name,
  status,
  priority,
  probability,
  next_call_date,
  notes
)
left join public.programs p on p.name = v.program_name
where not exists (
  select 1
  from public.leads l
  where l.phone = v.phone
);

commit;
