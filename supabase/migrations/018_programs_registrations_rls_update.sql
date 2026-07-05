-- Prompt 18: Programs and registrations RLS/schema update
-- Supabase SQL Editor icinde tek seferde calistirilabilir.
-- Tablo silmez, veri kaybina yol acmaz; eksik kolon/index/policy yapilarini tamamlar.

begin;

alter table public.programs
  add column if not exists notes text;

alter table public.registrations
  add column if not exists created_by uuid references public.profiles(id),
  add column if not exists source_lead_id uuid references public.leads(id);

create index if not exists idx_programs_type on public.programs(type);
create index if not exists idx_programs_is_active on public.programs(is_active);
create index if not exists idx_programs_start_date on public.programs(start_date);
create index if not exists idx_programs_end_date on public.programs(end_date);

create index if not exists idx_registrations_parent_id on public.registrations(parent_id);
create index if not exists idx_registrations_student_id on public.registrations(student_id);
create index if not exists idx_registrations_program_id on public.registrations(program_id);
create index if not exists idx_registrations_status on public.registrations(status);
create index if not exists idx_registrations_registration_date on public.registrations(registration_date);
create index if not exists idx_registrations_created_by on public.registrations(created_by);
create index if not exists idx_registrations_source_lead_id on public.registrations(source_lead_id);

create or replace function public.sales_can_access_registration(target_registration_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(public.is_sales(), false)
    and exists (
      select 1
      from public.registrations r
      where r.id = target_registration_id
        and (
          r.created_by = auth.uid()
          or public.sales_can_access_parent(r.parent_id)
          or public.sales_can_access_student(r.student_id)
          or exists (
            select 1
            from public.leads l
            where l.id = r.source_lead_id
              and l.assigned_user_id = auth.uid()
          )
        )
    );
$$;

grant execute on function public.sales_can_access_registration(uuid) to authenticated;

alter table public.programs enable row level security;
alter table public.registrations enable row level security;
alter table public.notes enable row level security;

grant select, insert, update, delete on
  public.programs,
  public.registrations,
  public.notes
to authenticated;

drop policy if exists "admins_manage_programs" on public.programs;
drop policy if exists "authenticated_read_active_programs" on public.programs;

create policy "admins_manage_programs"
on public.programs
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy "authenticated_read_active_programs"
on public.programs
for select
to authenticated
using (is_active = true or public.is_admin());

drop policy if exists "admins_manage_registrations" on public.registrations;
drop policy if exists "sales_read_related_registrations" on public.registrations;
drop policy if exists "sales_insert_related_registrations" on public.registrations;
drop policy if exists "sales_update_own_registrations" on public.registrations;

create policy "admins_manage_registrations"
on public.registrations
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy "sales_read_related_registrations"
on public.registrations
for select
to authenticated
using (public.sales_can_access_registration(id));

create policy "sales_insert_related_registrations"
on public.registrations
for insert
to authenticated
with check (
  public.is_sales()
  and created_by = auth.uid()
  and (
    public.sales_can_access_parent(parent_id)
    or public.sales_can_access_student(student_id)
    or exists (
      select 1
      from public.leads l
      where l.id = source_lead_id
        and l.assigned_user_id = auth.uid()
    )
  )
);

create policy "sales_update_own_registrations"
on public.registrations
for update
to authenticated
using (
  public.is_sales()
  and created_by = auth.uid()
  and public.sales_can_access_registration(id)
)
with check (
  public.is_sales()
  and created_by = auth.uid()
  and (
    public.sales_can_access_parent(parent_id)
    or public.sales_can_access_student(student_id)
    or exists (
      select 1
      from public.leads l
      where l.id = source_lead_id
        and l.assigned_user_id = auth.uid()
    )
  )
);

drop policy if exists "admins_manage_notes" on public.notes;
drop policy if exists "sales_read_related_notes" on public.notes;
drop policy if exists "sales_insert_own_notes" on public.notes;
drop policy if exists "sales_update_own_notes" on public.notes;

create policy "admins_manage_notes"
on public.notes
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

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
  )
);

create policy "sales_update_own_notes"
on public.notes
for update
to authenticated
using (
  public.is_sales()
  and user_id = auth.uid()
)
with check (
  public.is_sales()
  and user_id = auth.uid()
);

commit;
