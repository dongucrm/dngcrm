-- Dongu CRM Supabase PostgreSQL schema
--
-- Kullanim:
-- 1. Supabase Dashboard > SQL Editor ekranini acin.
-- 2. Bu dosyanin tamamini yapistirin.
-- 3. Run ile calistirin.
--
-- Notlar:
-- - Bu dosya ilk kurulum icin idempotent olacak sekilde hazirlandi.
-- - Bu dosya seed verisi eklemez; ornek veriler icin supabase/seed.sql dosyasini calistirin.
-- - RLS tum tablolarda aktiftir.
-- - Admin rolu tum kayitlari yonetebilir.
-- - satis_personeli rolu kendisine atanmis leadleri ve gorevleri gorebilir.

begin;

create extension if not exists pgcrypto;

create table if not exists public.roles (
  id uuid primary key default gen_random_uuid(),
  name text unique not null,
  description text,
  created_at timestamptz default now()
);

create table if not exists public.profiles (
  id uuid primary key,
  full_name text,
  phone text,
  role_id uuid references public.roles(id),
  is_active boolean default true,
  created_at timestamptz default now()
);

create table if not exists public.programs (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  type text not null,
  description text,
  price numeric default 0,
  start_date date,
  end_date date,
  quota integer,
  is_active boolean default true,
  created_at timestamptz default now()
);

create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  phone text not null,
  email text,
  child_name text,
  child_age integer,
  source text,
  interested_program_id uuid references public.programs(id),
  status text default 'yeni_lead',
  priority text default 'orta',
  probability text default 'orta',
  assigned_user_id uuid references public.profiles(id),
  next_call_date timestamptz,
  last_contact_date timestamptz,
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.parents (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  phone text not null,
  email text,
  address text,
  notes text,
  created_at timestamptz default now()
);

create table if not exists public.students (
  id uuid primary key default gen_random_uuid(),
  parent_id uuid references public.parents(id) on delete cascade,
  full_name text not null,
  age integer,
  birth_date date,
  school text,
  notes text,
  created_at timestamptz default now()
);

create table if not exists public.registrations (
  id uuid primary key default gen_random_uuid(),
  parent_id uuid references public.parents(id),
  student_id uuid references public.students(id),
  program_id uuid references public.programs(id),
  status text default 'on_kayit',
  registration_date date default current_date,
  total_price numeric default 0,
  discount_amount numeric default 0,
  final_price numeric default 0,
  notes text,
  created_at timestamptz default now()
);

create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  registration_id uuid references public.registrations(id),
  parent_id uuid references public.parents(id),
  total_amount numeric default 0,
  paid_amount numeric default 0,
  remaining_amount numeric default 0,
  payment_method text,
  installment_count integer default 1,
  payment_status text default 'odenmedi',
  due_date date,
  payment_date date,
  notes text,
  created_at timestamptz default now()
);

create table if not exists public.call_logs (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid references public.leads(id),
  parent_id uuid references public.parents(id),
  user_id uuid references public.profiles(id),
  call_status text,
  call_date timestamptz default now(),
  next_call_date timestamptz,
  notes text,
  created_at timestamptz default now()
);

create table if not exists public.tasks (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  related_lead_id uuid references public.leads(id),
  related_parent_id uuid references public.parents(id),
  assigned_user_id uuid references public.profiles(id),
  created_by uuid references public.profiles(id),
  due_date timestamptz,
  status text default 'bekliyor',
  priority text default 'orta',
  created_at timestamptz default now()
);

create table if not exists public.whatsapp_templates (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  message text not null,
  category text,
  is_active boolean default true,
  created_at timestamptz default now()
);

create table if not exists public.notes (
  id uuid primary key default gen_random_uuid(),
  entity_type text not null,
  entity_id uuid not null,
  user_id uuid references public.profiles(id),
  note text not null,
  created_at timestamptz default now()
);

create table if not exists public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id),
  action text,
  table_name text,
  record_id uuid,
  old_data jsonb,
  new_data jsonb,
  created_at timestamptz default now()
);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_leads_updated_at on public.leads;

create trigger set_leads_updated_at
before update on public.leads
for each row
execute function public.set_updated_at();

create or replace function public.current_user_role_name()
returns text
language sql
stable
security definer
set search_path = public
as $$
  select r.name
  from public.profiles p
  join public.roles r on r.id = p.role_id
  where p.id = auth.uid()
    and p.is_active = true
  limit 1;
$$;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(public.current_user_role_name() = 'admin', false);
$$;

create or replace function public.is_sales()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(public.current_user_role_name() = 'satis_personeli', false);
$$;

create or replace function public.prevent_sales_lead_restricted_update()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if public.is_sales() and not public.is_admin() then
    if old.full_name is distinct from new.full_name
      or old.phone is distinct from new.phone
      or old.email is distinct from new.email
      or old.child_name is distinct from new.child_name
      or old.child_age is distinct from new.child_age
      or old.source is distinct from new.source
      or old.interested_program_id is distinct from new.interested_program_id
      or old.priority is distinct from new.priority
      or old.probability is distinct from new.probability
      or old.assigned_user_id is distinct from new.assigned_user_id
      or old.created_at is distinct from new.created_at
    then
      raise exception 'Satış personeli yalnızca lead durumu, notu, son görüşme tarihi ve sonraki arama tarihini güncelleyebilir.';
    end if;
  end if;

  return new;
end;
$$;

drop trigger if exists protect_sales_lead_update on public.leads;

create trigger protect_sales_lead_update
before update on public.leads
for each row
execute function public.prevent_sales_lead_restricted_update();

create or replace function public.prevent_sales_task_restricted_update()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if public.is_sales() and not public.is_admin() then
    if old.assigned_user_id is distinct from new.assigned_user_id
      or old.created_by is distinct from new.created_by
    then
      raise exception 'Satis personeli gorev atamasini veya olusturan kullaniciyi degistiremez.';
    end if;

    if old.created_by = auth.uid() then
      return new;
    end if;

    if old.assigned_user_id = auth.uid() then
      if new.status = 'tamamlandi'
        and old.title is not distinct from new.title
        and old.description is not distinct from new.description
        and old.related_lead_id is not distinct from new.related_lead_id
        and old.related_parent_id is not distinct from new.related_parent_id
        and old.due_date is not distinct from new.due_date
        and old.priority is not distinct from new.priority
        and old.created_at is not distinct from new.created_at
      then
        return new;
      end if;
    end if;

    raise exception 'Satis personeli yalnizca kendi olusturdugu gorevleri duzenleyebilir veya kendisine atanmis gorevi tamamlandi yapabilir.';
  end if;

  return new;
end;
$$;

drop trigger if exists protect_sales_task_update on public.tasks;

create trigger protect_sales_task_update
before update on public.tasks
for each row
execute function public.prevent_sales_task_restricted_update();

create index if not exists idx_profiles_role_id on public.profiles(role_id);
create index if not exists idx_profiles_is_active on public.profiles(is_active);

create index if not exists idx_programs_type on public.programs(type);
create index if not exists idx_programs_is_active on public.programs(is_active);
create index if not exists idx_programs_start_date on public.programs(start_date);

create index if not exists idx_leads_interested_program_id on public.leads(interested_program_id);
create index if not exists idx_leads_assigned_user_id on public.leads(assigned_user_id);
create index if not exists idx_leads_status on public.leads(status);
create index if not exists idx_leads_priority on public.leads(priority);
create index if not exists idx_leads_next_call_date on public.leads(next_call_date);
create index if not exists idx_leads_created_at on public.leads(created_at);

create index if not exists idx_parents_phone on public.parents(phone);
create index if not exists idx_parents_email on public.parents(email);

create index if not exists idx_students_parent_id on public.students(parent_id);
create index if not exists idx_students_full_name on public.students(full_name);

create index if not exists idx_registrations_parent_id on public.registrations(parent_id);
create index if not exists idx_registrations_student_id on public.registrations(student_id);
create index if not exists idx_registrations_program_id on public.registrations(program_id);
create index if not exists idx_registrations_status on public.registrations(status);
create index if not exists idx_registrations_registration_date on public.registrations(registration_date);

create index if not exists idx_payments_registration_id on public.payments(registration_id);
create index if not exists idx_payments_parent_id on public.payments(parent_id);
create index if not exists idx_payments_payment_status on public.payments(payment_status);
create index if not exists idx_payments_due_date on public.payments(due_date);

create index if not exists idx_call_logs_lead_id on public.call_logs(lead_id);
create index if not exists idx_call_logs_parent_id on public.call_logs(parent_id);
create index if not exists idx_call_logs_user_id on public.call_logs(user_id);
create index if not exists idx_call_logs_call_date on public.call_logs(call_date);
create index if not exists idx_call_logs_next_call_date on public.call_logs(next_call_date);

create index if not exists idx_tasks_related_lead_id on public.tasks(related_lead_id);
create index if not exists idx_tasks_related_parent_id on public.tasks(related_parent_id);
create index if not exists idx_tasks_assigned_user_id on public.tasks(assigned_user_id);
create index if not exists idx_tasks_created_by on public.tasks(created_by);
create index if not exists idx_tasks_status on public.tasks(status);
create index if not exists idx_tasks_priority on public.tasks(priority);
create index if not exists idx_tasks_due_date on public.tasks(due_date);

create index if not exists idx_whatsapp_templates_category on public.whatsapp_templates(category);
create index if not exists idx_whatsapp_templates_is_active on public.whatsapp_templates(is_active);

create index if not exists idx_notes_entity on public.notes(entity_type, entity_id);
create index if not exists idx_notes_user_id on public.notes(user_id);

create index if not exists idx_audit_logs_user_id on public.audit_logs(user_id);
create index if not exists idx_audit_logs_table_name on public.audit_logs(table_name);
create index if not exists idx_audit_logs_record_id on public.audit_logs(record_id);
create index if not exists idx_audit_logs_created_at on public.audit_logs(created_at);

alter table public.roles enable row level security;
alter table public.profiles enable row level security;
alter table public.programs enable row level security;
alter table public.leads enable row level security;
alter table public.parents enable row level security;
alter table public.students enable row level security;
alter table public.registrations enable row level security;
alter table public.payments enable row level security;
alter table public.call_logs enable row level security;
alter table public.tasks enable row level security;
alter table public.whatsapp_templates enable row level security;
alter table public.notes enable row level security;
alter table public.audit_logs enable row level security;

grant usage on schema public to authenticated;

grant select, insert, update, delete on
  public.roles,
  public.profiles,
  public.programs,
  public.leads,
  public.parents,
  public.students,
  public.registrations,
  public.payments,
  public.call_logs,
  public.tasks,
  public.whatsapp_templates,
  public.notes,
  public.audit_logs
to authenticated;

grant execute on function public.current_user_role_name() to authenticated;
grant execute on function public.is_admin() to authenticated;
grant execute on function public.is_sales() to authenticated;
grant execute on function public.prevent_sales_lead_restricted_update() to authenticated;
grant execute on function public.prevent_sales_task_restricted_update() to authenticated;

drop policy if exists "admins_manage_roles" on public.roles;
create policy "admins_manage_roles"
on public.roles
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "authenticated_read_roles" on public.roles;
create policy "authenticated_read_roles"
on public.roles
for select
to authenticated
using (true);

drop policy if exists "admins_manage_profiles" on public.profiles;
create policy "admins_manage_profiles"
on public.profiles
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "users_read_own_profile" on public.profiles;
create policy "users_read_own_profile"
on public.profiles
for select
to authenticated
using (id = auth.uid());

drop policy if exists "admins_manage_programs" on public.programs;
create policy "admins_manage_programs"
on public.programs
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "authenticated_read_active_programs" on public.programs;
create policy "authenticated_read_active_programs"
on public.programs
for select
to authenticated
using (is_active = true);

drop policy if exists "admins_manage_leads" on public.leads;
create policy "admins_manage_leads"
on public.leads
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "sales_read_assigned_leads" on public.leads;
create policy "sales_read_assigned_leads"
on public.leads
for select
to authenticated
using (
  public.is_sales()
  and assigned_user_id = auth.uid()
);

drop policy if exists "sales_insert_own_leads" on public.leads;
create policy "sales_insert_own_leads"
on public.leads
for insert
to authenticated
with check (
  public.is_sales()
  and assigned_user_id = auth.uid()
);

drop policy if exists "sales_update_assigned_lead_followup" on public.leads;
create policy "sales_update_assigned_lead_followup"
on public.leads
for update
to authenticated
using (
  public.is_sales()
  and assigned_user_id = auth.uid()
)
with check (
  public.is_sales()
  and assigned_user_id = auth.uid()
);

drop policy if exists "admins_manage_parents" on public.parents;
create policy "admins_manage_parents"
on public.parents
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "admins_manage_students" on public.students;
create policy "admins_manage_students"
on public.students
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "admins_manage_registrations" on public.registrations;
create policy "admins_manage_registrations"
on public.registrations
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "admins_manage_payments" on public.payments;
create policy "admins_manage_payments"
on public.payments
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "admins_manage_call_logs" on public.call_logs;
create policy "admins_manage_call_logs"
on public.call_logs
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "sales_insert_assigned_lead_call_logs" on public.call_logs;
create policy "sales_insert_assigned_lead_call_logs"
on public.call_logs
for insert
to authenticated
with check (
  public.is_sales()
  and user_id = auth.uid()
  and exists (
    select 1
    from public.leads l
    where l.id = lead_id
      and l.assigned_user_id = auth.uid()
  )
);

drop policy if exists "sales_read_own_call_logs" on public.call_logs;
drop policy if exists "sales_read_assigned_lead_call_logs" on public.call_logs;
create policy "sales_read_assigned_lead_call_logs"
on public.call_logs
for select
to authenticated
using (
  public.is_sales()
  and (
    user_id = auth.uid()
    or exists (
      select 1
      from public.leads l
      where l.id = lead_id
        and l.assigned_user_id = auth.uid()
    )
  )
);

drop policy if exists "sales_update_own_call_logs" on public.call_logs;
create policy "sales_update_own_call_logs"
on public.call_logs
for update
to authenticated
using (
  public.is_sales()
  and user_id = auth.uid()
)
with check (
  public.is_sales()
  and user_id = auth.uid()
  and (
    lead_id is null
    or exists (
      select 1
      from public.leads l
      where l.id = lead_id
        and l.assigned_user_id = auth.uid()
    )
  )
);

drop policy if exists "admins_manage_tasks" on public.tasks;
drop policy if exists "sales_read_assigned_tasks" on public.tasks;
drop policy if exists "sales_insert_assigned_lead_tasks" on public.tasks;
drop policy if exists "sales_insert_own_tasks" on public.tasks;
drop policy if exists "sales_update_own_tasks" on public.tasks;
drop policy if exists "sales_update_own_or_assigned_tasks" on public.tasks;

create policy "admins_manage_tasks"
on public.tasks
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy "sales_read_assigned_tasks"
on public.tasks
for select
to authenticated
using (
  public.is_sales()
  and assigned_user_id = auth.uid()
);

create policy "sales_insert_own_tasks"
on public.tasks
for insert
to authenticated
with check (
  public.is_sales()
  and assigned_user_id = auth.uid()
  and created_by = auth.uid()
);

create policy "sales_update_own_or_assigned_tasks"
on public.tasks
for update
to authenticated
using (
  public.is_sales()
  and (
    assigned_user_id = auth.uid()
    or created_by = auth.uid()
  )
)
with check (
  public.is_sales()
  and (
    assigned_user_id = auth.uid()
    or created_by = auth.uid()
  )
);

drop policy if exists "admins_manage_whatsapp_templates" on public.whatsapp_templates;
create policy "admins_manage_whatsapp_templates"
on public.whatsapp_templates
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "authenticated_read_active_whatsapp_templates" on public.whatsapp_templates;
create policy "authenticated_read_active_whatsapp_templates"
on public.whatsapp_templates
for select
to authenticated
using (is_active = true);

drop policy if exists "admins_manage_notes" on public.notes;
create policy "admins_manage_notes"
on public.notes
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "admins_manage_audit_logs" on public.audit_logs;
create policy "admins_manage_audit_logs"
on public.audit_logs
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

commit;
