-- Prompt 19: Payments, installments and collections RLS/schema update
-- Supabase SQL Editor icinde tek seferde calistirilabilir.
-- Tablo silmez, veri kaybina yol acmaz; eksik tablo/index/trigger/policy yapilarini tamamlar.

begin;

create table if not exists public.payment_installments (
  id uuid primary key default gen_random_uuid(),
  payment_id uuid references public.payments(id) on delete cascade,
  installment_no integer,
  amount numeric default 0,
  paid_amount numeric default 0,
  remaining_amount numeric default 0,
  due_date date,
  paid_date date,
  status text default 'bekliyor',
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.payment_installments
  add column if not exists payment_id uuid references public.payments(id) on delete cascade,
  add column if not exists installment_no integer,
  add column if not exists amount numeric default 0,
  add column if not exists paid_amount numeric default 0,
  add column if not exists remaining_amount numeric default 0,
  add column if not exists due_date date,
  add column if not exists paid_date date,
  add column if not exists status text default 'bekliyor',
  add column if not exists notes text,
  add column if not exists created_at timestamptz default now(),
  add column if not exists updated_at timestamptz default now();

create index if not exists idx_payments_registration_id on public.payments(registration_id);
create index if not exists idx_payments_parent_id on public.payments(parent_id);
create index if not exists idx_payments_payment_status on public.payments(payment_status);
create index if not exists idx_payments_due_date on public.payments(due_date);
create index if not exists idx_payment_installments_payment_id on public.payment_installments(payment_id);
create index if not exists idx_payment_installments_status on public.payment_installments(status);
create index if not exists idx_payment_installments_due_date on public.payment_installments(due_date);
create index if not exists idx_payment_installments_paid_date on public.payment_installments(paid_date);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_payment_installments_updated_at on public.payment_installments;

create trigger set_payment_installments_updated_at
before update on public.payment_installments
for each row
execute function public.set_updated_at();

create or replace function public.sales_can_access_payment(target_payment_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(public.is_sales(), false)
    and exists (
      select 1
      from public.payments p
      where p.id = target_payment_id
        and (
          public.sales_can_access_parent(p.parent_id)
          or public.sales_can_access_registration(p.registration_id)
        )
    );
$$;

create or replace function public.sales_can_access_payment_installment(target_installment_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(public.is_sales(), false)
    and exists (
      select 1
      from public.payment_installments pi
      where pi.id = target_installment_id
        and public.sales_can_access_payment(pi.payment_id)
    );
$$;

grant execute on function public.sales_can_access_payment(uuid) to authenticated;
grant execute on function public.sales_can_access_payment_installment(uuid) to authenticated;

alter table public.payments enable row level security;
alter table public.payment_installments enable row level security;
alter table public.notes enable row level security;

grant select, insert, update, delete on
  public.payments,
  public.payment_installments,
  public.notes
to authenticated;

drop policy if exists "admins_manage_payments" on public.payments;
drop policy if exists "sales_read_related_payments" on public.payments;

create policy "admins_manage_payments"
on public.payments
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy "sales_read_related_payments"
on public.payments
for select
to authenticated
using (
  public.is_sales()
  and public.sales_can_access_payment(id)
);

drop policy if exists "admins_manage_payment_installments" on public.payment_installments;
drop policy if exists "sales_read_related_payment_installments" on public.payment_installments;

create policy "admins_manage_payment_installments"
on public.payment_installments
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy "sales_read_related_payment_installments"
on public.payment_installments
for select
to authenticated
using (
  public.is_sales()
  and public.sales_can_access_payment_installment(id)
);

drop policy if exists "sales_read_related_notes" on public.notes;
drop policy if exists "sales_insert_own_notes" on public.notes;

create policy "sales_read_related_notes"
on public.notes
for select
to authenticated
using (
  public.is_sales()
  and (
    user_id = auth.uid()
    or (
      entity_type = 'parent'
      and public.sales_can_access_parent(entity_id)
    )
    or (
      entity_type = 'student'
      and public.sales_can_access_student(entity_id)
    )
    or (
      entity_type = 'program'
      and exists (
        select 1
        from public.programs p
        where p.id = entity_id
          and p.is_active = true
      )
    )
    or (
      entity_type = 'registration'
      and public.sales_can_access_registration(entity_id)
    )
    or (
      entity_type = 'payment'
      and public.sales_can_access_payment(entity_id)
    )
  )
);

create policy "sales_insert_own_notes"
on public.notes
for insert
to authenticated
with check (
  public.is_sales()
  and user_id = auth.uid()
  and (
    (
      entity_type = 'parent'
      and public.sales_can_access_parent(entity_id)
    )
    or (
      entity_type = 'student'
      and public.sales_can_access_student(entity_id)
    )
    or (
      entity_type = 'program'
      and exists (
        select 1
        from public.programs p
        where p.id = entity_id
          and p.is_active = true
      )
    )
    or (
      entity_type = 'registration'
      and public.sales_can_access_registration(entity_id)
    )
    or (
      entity_type = 'payment'
      and public.sales_can_access_payment(entity_id)
    )
  )
);

commit;
