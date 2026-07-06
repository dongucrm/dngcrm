-- Prompt 20: WhatsApp templates and message open logs
-- Supabase SQL Editor icinde tek seferde calistirilabilir.
-- Mevcut whatsapp_templates tablosunu silmez; eksik alan, index, log tablosu ve RLS policylerini tamamlar.

begin;

alter table public.whatsapp_templates
  add column if not exists title text,
  add column if not exists message text,
  add column if not exists category text,
  add column if not exists is_active boolean default true,
  add column if not exists created_at timestamptz default now();

create table if not exists public.whatsapp_message_logs (
  id uuid primary key default gen_random_uuid(),
  template_id uuid references public.whatsapp_templates(id) on delete set null,
  entity_type text,
  entity_id uuid,
  phone text,
  message text,
  user_id uuid references public.profiles(id),
  opened_at timestamptz default now()
);

alter table public.whatsapp_message_logs
  add column if not exists template_id uuid references public.whatsapp_templates(id) on delete set null,
  add column if not exists entity_type text,
  add column if not exists entity_id uuid,
  add column if not exists phone text,
  add column if not exists message text,
  add column if not exists user_id uuid references public.profiles(id),
  add column if not exists opened_at timestamptz default now();

create index if not exists idx_whatsapp_templates_category on public.whatsapp_templates(category);
create index if not exists idx_whatsapp_templates_is_active on public.whatsapp_templates(is_active);
create index if not exists idx_whatsapp_templates_created_at on public.whatsapp_templates(created_at);

create index if not exists idx_whatsapp_message_logs_template_id on public.whatsapp_message_logs(template_id);
create index if not exists idx_whatsapp_message_logs_entity on public.whatsapp_message_logs(entity_type, entity_id);
create index if not exists idx_whatsapp_message_logs_user_id on public.whatsapp_message_logs(user_id);
create index if not exists idx_whatsapp_message_logs_opened_at on public.whatsapp_message_logs(opened_at);

alter table public.whatsapp_templates enable row level security;
alter table public.whatsapp_message_logs enable row level security;

grant select, insert, update, delete on
  public.whatsapp_templates,
  public.whatsapp_message_logs
to authenticated;

drop policy if exists "admins_manage_whatsapp_templates" on public.whatsapp_templates;
drop policy if exists "authenticated_read_active_whatsapp_templates" on public.whatsapp_templates;
drop policy if exists "sales_read_active_whatsapp_templates" on public.whatsapp_templates;

create policy "admins_manage_whatsapp_templates"
on public.whatsapp_templates
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy "sales_read_active_whatsapp_templates"
on public.whatsapp_templates
for select
to authenticated
using (
  public.is_sales()
  and is_active = true
);

drop policy if exists "admins_manage_whatsapp_message_logs" on public.whatsapp_message_logs;
drop policy if exists "sales_read_own_whatsapp_message_logs" on public.whatsapp_message_logs;
drop policy if exists "sales_insert_own_whatsapp_message_logs" on public.whatsapp_message_logs;

create policy "admins_manage_whatsapp_message_logs"
on public.whatsapp_message_logs
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy "sales_read_own_whatsapp_message_logs"
on public.whatsapp_message_logs
for select
to authenticated
using (
  public.is_sales()
  and user_id = auth.uid()
);

create policy "sales_insert_own_whatsapp_message_logs"
on public.whatsapp_message_logs
for insert
to authenticated
with check (
  public.is_sales()
  and user_id = auth.uid()
);

insert into public.whatsapp_templates (title, message, category, is_active)
select v.title, v.message, v.category, true
from (
  values
    (
      'Lead Bilgi Mesaji',
      'Merhaba {{veli_adi}}, {{ogrenci_adi}} icin {{program_adi}} hakkinda bilgi almak istediginizi gorduk. Size yardimci olmaktan memnuniyet duyariz.',
      'lead'
    ),
    (
      'Deneme Dersi Hatirlatma',
      'Merhaba {{veli_adi}}, {{ogrenci_adi}} icin planlanan deneme dersimizi hatirlatmak isteriz. Katilim durumunuzu bizimle paylasabilir misiniz?',
      'deneme_dersi'
    ),
    (
      'Kayit Bilgilendirme',
      'Merhaba {{veli_adi}}, {{ogrenci_adi}} icin {{program_adi}} kayit sureciniz olusturulmustur. Detayli bilgi icin bizimle iletisime gecebilirsiniz.',
      'kayit'
    ),
    (
      'Odeme Hatirlatma',
      'Merhaba {{veli_adi}}, {{ogrenci_adi}} icin {{program_adi}} programina ait kalan odeme tutariniz {{kalan_tutar}} TL olarak gorunmektedir. Bilginize sunariz.',
      'odeme'
    ),
    (
      'Taksit Hatirlatma',
      'Merhaba {{veli_adi}}, {{program_adi}} icin {{taksit_no}}. taksit vade tarihiniz {{vade_tarihi}} olarak gorunmektedir.',
      'taksit'
    ),
    (
      'Genel Tesekkur',
      'Merhaba {{veli_adi}}, ilginiz icin tesekkur ederiz. Size en kisa surede yardimci olacagiz.',
      'genel'
    )
) as v(title, message, category)
where not exists (
  select 1
  from public.whatsapp_templates t
  where t.title = v.title
);

commit;
