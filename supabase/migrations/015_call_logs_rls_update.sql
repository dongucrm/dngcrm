-- Dongu CRM - Call logs RLS migration
-- Supabase SQL Editor icinde tek seferde calistirilabilir.
-- Tablo olusturmaz veya silmez; mevcut call_logs tablosu icin guvenli
-- index, RLS, grant ve policy guncellemelerini uygular.

create index if not exists idx_call_logs_lead_id on public.call_logs(lead_id);
create index if not exists idx_call_logs_parent_id on public.call_logs(parent_id);
create index if not exists idx_call_logs_user_id on public.call_logs(user_id);
create index if not exists idx_call_logs_call_date on public.call_logs(call_date);
create index if not exists idx_call_logs_next_call_date on public.call_logs(next_call_date);

alter table public.call_logs enable row level security;

grant select, insert, update, delete on public.call_logs to authenticated;

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
