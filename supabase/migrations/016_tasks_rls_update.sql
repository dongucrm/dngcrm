-- Dongu CRM tasks RLS update
--
-- Kullanim:
-- 1. Supabase Dashboard > SQL Editor ekraninda yeni query acin.
-- 2. Bu dosyanin tamamini yapistirin.
-- 3. Run ile tek seferde calistirin.
--
-- Not:
-- - Bu migration tablo silmez ve veri kaybi olusturmaz.
-- - Mevcut tasks tablosuna gorev olusturan kullaniciyi izlemek icin created_by ekler.
-- - Admin tum gorevleri yonetebilir.
-- - satis_personeli kendisine atanmis gorevleri gorur, kendi olusturdugu gorevleri duzenler,
--   kendisine atanmis baskasinin gorevini sadece tamamlandi yapabilir.

begin;

alter table public.tasks
  add column if not exists created_by uuid references public.profiles(id);

create index if not exists idx_tasks_related_lead_id on public.tasks(related_lead_id);
create index if not exists idx_tasks_related_parent_id on public.tasks(related_parent_id);
create index if not exists idx_tasks_assigned_user_id on public.tasks(assigned_user_id);
create index if not exists idx_tasks_created_by on public.tasks(created_by);
create index if not exists idx_tasks_status on public.tasks(status);
create index if not exists idx_tasks_priority on public.tasks(priority);
create index if not exists idx_tasks_due_date on public.tasks(due_date);

alter table public.tasks enable row level security;

grant select, insert, update, delete on public.tasks to authenticated;

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

grant execute on function public.prevent_sales_task_restricted_update() to authenticated;

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

commit;
