-- Dongu CRM parents / students / notes RLS update
--
-- Kullanim:
-- 1. Supabase Dashboard > SQL Editor ekraninda yeni query acin.
-- 2. Bu dosyanin tamamini yapistirin.
-- 3. Run ile tek seferde calistirin.
--
-- Not:
-- - Bu migration tablo silmez ve veri kaybi olusturmaz.
-- - Mevcut parents ve students tablolarina created_by/source_lead_id alanlarini ekler.
-- - Admin tum kayitlari yonetebilir.
-- - satis_personeli kendi olusturdugu veya kendisine atanmis lead'den gelen veli/ogrenci kayitlarini gorebilir.
-- - Notes icin kullanici erisebildigi parent/student kaydina kendi notunu ekleyebilir.

begin;

alter table public.parents
  add column if not exists created_by uuid references public.profiles(id),
  add column if not exists source_lead_id uuid references public.leads(id);

alter table public.students
  add column if not exists created_by uuid references public.profiles(id),
  add column if not exists source_lead_id uuid references public.leads(id);

create index if not exists idx_parents_phone on public.parents(phone);
create index if not exists idx_parents_email on public.parents(email);
create index if not exists idx_parents_created_by on public.parents(created_by);
create index if not exists idx_parents_source_lead_id on public.parents(source_lead_id);

create index if not exists idx_students_parent_id on public.students(parent_id);
create index if not exists idx_students_full_name on public.students(full_name);
create index if not exists idx_students_created_by on public.students(created_by);
create index if not exists idx_students_source_lead_id on public.students(source_lead_id);

create index if not exists idx_notes_entity on public.notes(entity_type, entity_id);
create index if not exists idx_notes_user_id on public.notes(user_id);

alter table public.parents enable row level security;
alter table public.students enable row level security;
alter table public.notes enable row level security;

grant select, insert, update, delete on
  public.parents,
  public.students,
  public.notes
to authenticated;

create or replace function public.sales_can_access_parent(target_parent_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(public.is_sales(), false)
    and exists (
      select 1
      from public.parents p
      where p.id = target_parent_id
        and (
          p.created_by = auth.uid()
          or exists (
            select 1
            from public.leads l
            where l.id = p.source_lead_id
              and l.assigned_user_id = auth.uid()
          )
          or exists (
            select 1
            from public.students s
            where s.parent_id = p.id
              and (
                s.created_by = auth.uid()
                or exists (
                  select 1
                  from public.leads sl
                  where sl.id = s.source_lead_id
                    and sl.assigned_user_id = auth.uid()
                )
              )
          )
        )
    );
$$;

create or replace function public.sales_can_access_student(target_student_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(public.is_sales(), false)
    and exists (
      select 1
      from public.students s
      where s.id = target_student_id
        and (
          s.created_by = auth.uid()
          or exists (
            select 1
            from public.leads l
            where l.id = s.source_lead_id
              and l.assigned_user_id = auth.uid()
          )
          or public.sales_can_access_parent(s.parent_id)
        )
    );
$$;

grant execute on function public.sales_can_access_parent(uuid) to authenticated;
grant execute on function public.sales_can_access_student(uuid) to authenticated;

drop policy if exists "admins_manage_parents" on public.parents;
drop policy if exists "sales_read_related_parents" on public.parents;
drop policy if exists "sales_insert_own_parents" on public.parents;
drop policy if exists "sales_update_own_parents" on public.parents;

create policy "admins_manage_parents"
on public.parents
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy "sales_read_related_parents"
on public.parents
for select
to authenticated
using (public.sales_can_access_parent(id));

create policy "sales_insert_own_parents"
on public.parents
for insert
to authenticated
with check (
  public.is_sales()
  and created_by = auth.uid()
);

create policy "sales_update_own_parents"
on public.parents
for update
to authenticated
using (
  public.is_sales()
  and created_by = auth.uid()
)
with check (
  public.is_sales()
  and created_by = auth.uid()
);

drop policy if exists "admins_manage_students" on public.students;
drop policy if exists "sales_read_related_students" on public.students;
drop policy if exists "sales_insert_own_students" on public.students;
drop policy if exists "sales_update_own_students" on public.students;

create policy "admins_manage_students"
on public.students
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy "sales_read_related_students"
on public.students
for select
to authenticated
using (public.sales_can_access_student(id));

create policy "sales_insert_own_students"
on public.students
for insert
to authenticated
with check (
  public.is_sales()
  and created_by = auth.uid()
  and (
    parent_id is null
    or public.sales_can_access_parent(parent_id)
  )
);

create policy "sales_update_own_students"
on public.students
for update
to authenticated
using (
  public.is_sales()
  and created_by = auth.uid()
)
with check (
  public.is_sales()
  and created_by = auth.uid()
);

drop policy if exists "admins_manage_registrations" on public.registrations;
drop policy if exists "sales_read_related_registrations" on public.registrations;
drop policy if exists "sales_insert_related_registrations" on public.registrations;

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
using (
  public.is_sales()
  and (
    public.sales_can_access_parent(parent_id)
    or public.sales_can_access_student(student_id)
  )
);

create policy "sales_insert_related_registrations"
on public.registrations
for insert
to authenticated
with check (
  public.is_sales()
  and (
    public.sales_can_access_parent(parent_id)
    or public.sales_can_access_student(student_id)
  )
);

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
  and public.sales_can_access_parent(parent_id)
);

drop policy if exists "sales_insert_assigned_lead_call_logs" on public.call_logs;
drop policy if exists "sales_read_own_call_logs" on public.call_logs;
drop policy if exists "sales_read_assigned_lead_call_logs" on public.call_logs;
drop policy if exists "sales_update_own_call_logs" on public.call_logs;

create policy "sales_insert_assigned_lead_call_logs"
on public.call_logs
for insert
to authenticated
with check (
  public.is_sales()
  and user_id = auth.uid()
  and (
    exists (
      select 1
      from public.leads l
      where l.id = lead_id
        and l.assigned_user_id = auth.uid()
    )
    or public.sales_can_access_parent(parent_id)
  )
);

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
    or public.sales_can_access_parent(parent_id)
  )
);

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
    (
      lead_id is null
      or exists (
        select 1
        from public.leads l
        where l.id = lead_id
          and l.assigned_user_id = auth.uid()
      )
    )
    and (
      parent_id is null
      or public.sales_can_access_parent(parent_id)
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
