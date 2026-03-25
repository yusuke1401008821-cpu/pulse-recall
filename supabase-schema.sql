create extension if not exists pgcrypto;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null default '',
  display_name text not null default '',
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.shared_decks (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles (id) on delete cascade,
  name text not null,
  focus text not null default 'medical' check (focus in ('medical', 'english', 'general')),
  subject text not null default '',
  description text not null default '',
  share_token text not null unique,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.shared_cards (
  id uuid primary key default gen_random_uuid(),
  deck_id uuid not null references public.shared_decks (id) on delete cascade,
  front text not null,
  back text not null,
  hint text not null default '',
  topic text not null default '',
  tags text[] not null default '{}'::text[],
  note text not null default '',
  example text not null default '',
  order_index integer not null default 0,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.shared_card_media (
  id uuid primary key default gen_random_uuid(),
  shared_card_id uuid not null references public.shared_cards (id) on delete cascade,
  deck_id uuid not null references public.shared_decks (id) on delete cascade,
  side text not null check (side in ('front', 'back')),
  asset_id text not null default '',
  name text not null default '',
  mime_type text not null default '',
  size bigint not null default 0,
  width integer not null default 0,
  height integer not null default 0,
  storage_path text not null unique,
  sort_index integer not null default 0,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.deck_members (
  id uuid primary key default gen_random_uuid(),
  deck_id uuid not null references public.shared_decks (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  role text not null check (role in ('owner', 'editor', 'viewer')),
  created_at timestamptz not null default timezone('utc', now()),
  unique (deck_id, user_id)
);

create table if not exists public.deck_access_requests (
  id uuid primary key default gen_random_uuid(),
  deck_id uuid not null references public.shared_decks (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  requester_email text not null default '',
  requested_role text not null default 'viewer' check (requested_role in ('viewer', 'editor')),
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (deck_id, user_id)
);

create table if not exists public.user_card_progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  deck_id uuid not null references public.shared_decks (id) on delete cascade,
  shared_card_id uuid not null references public.shared_cards (id) on delete cascade,
  due_at bigint not null default 0,
  interval_days double precision not null default 0,
  ease double precision not null default 2.3,
  reps integer not null default 0,
  lapses integer not null default 0,
  last_reviewed_at bigint,
  mode text not null default 'new' check (mode in ('new', 'learning', 'review', 'relearning')),
  step_index integer not null default -1,
  recovery_days integer not null default 1,
  updated_at timestamptz not null default timezone('utc', now()),
  unique (user_id, shared_card_id)
);

create table if not exists public.user_review_log (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  deck_id uuid not null references public.shared_decks (id) on delete cascade,
  shared_card_id uuid not null references public.shared_cards (id) on delete cascade,
  rating text not null check (rating in ('again', 'hard', 'good')),
  timestamp_ms bigint not null,
  date_key text not null,
  mode text not null,
  interval_days double precision not null default 0,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.user_backup_snapshots (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  kind text not null default 'manual' check (kind in ('auto', 'manual', 'pre_restore')),
  snapshot_version integer not null default 4,
  storage_path text not null unique,
  summary_json jsonb not null default '{}'::jsonb,
  is_latest boolean not null default false,
  source_device text not null default '',
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index if not exists idx_shared_cards_deck_id on public.shared_cards (deck_id);
create index if not exists idx_shared_card_media_card_id on public.shared_card_media (shared_card_id, side, sort_index);
create index if not exists idx_deck_members_user_id on public.deck_members (user_id);
create index if not exists idx_access_requests_deck_id on public.deck_access_requests (deck_id);
create index if not exists idx_progress_user_id on public.user_card_progress (user_id, deck_id);
create index if not exists idx_review_log_user_id on public.user_review_log (user_id, deck_id);
create index if not exists idx_backup_snapshots_user_id on public.user_backup_snapshots (user_id, created_at desc);
create unique index if not exists idx_backup_snapshots_latest on public.user_backup_snapshots (user_id) where is_latest;

drop trigger if exists set_profiles_updated_at on public.profiles;
create trigger set_profiles_updated_at
before update on public.profiles
for each row execute procedure public.set_updated_at();

drop trigger if exists set_shared_decks_updated_at on public.shared_decks;
create trigger set_shared_decks_updated_at
before update on public.shared_decks
for each row execute procedure public.set_updated_at();

drop trigger if exists set_shared_cards_updated_at on public.shared_cards;
create trigger set_shared_cards_updated_at
before update on public.shared_cards
for each row execute procedure public.set_updated_at();

drop trigger if exists set_shared_card_media_updated_at on public.shared_card_media;
create trigger set_shared_card_media_updated_at
before update on public.shared_card_media
for each row execute procedure public.set_updated_at();

drop trigger if exists set_access_requests_updated_at on public.deck_access_requests;
create trigger set_access_requests_updated_at
before update on public.deck_access_requests
for each row execute procedure public.set_updated_at();

drop trigger if exists set_progress_updated_at on public.user_card_progress;
create trigger set_progress_updated_at
before update on public.user_card_progress
for each row execute procedure public.set_updated_at();

drop trigger if exists set_backup_snapshots_updated_at on public.user_backup_snapshots;
create trigger set_backup_snapshots_updated_at
before update on public.user_backup_snapshots
for each row execute procedure public.set_updated_at();

create or replace function public.is_deck_owner(target_deck_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.shared_decks
    where id = target_deck_id
      and owner_id = auth.uid()
  );
$$;

create or replace function public.is_accepted_member(target_deck_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.deck_members
    where deck_id = target_deck_id
      and user_id = auth.uid()
  );
$$;

create or replace function public.can_edit_shared_deck(target_deck_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.deck_members
    where deck_id = target_deck_id
      and user_id = auth.uid()
      and role in ('owner', 'editor')
  );
$$;

alter table public.profiles enable row level security;
alter table public.shared_decks enable row level security;
alter table public.shared_cards enable row level security;
alter table public.shared_card_media enable row level security;
alter table public.deck_members enable row level security;
alter table public.deck_access_requests enable row level security;
alter table public.user_card_progress enable row level security;
alter table public.user_review_log enable row level security;
alter table public.user_backup_snapshots enable row level security;

drop policy if exists "profiles_select_self" on public.profiles;
create policy "profiles_select_self"
on public.profiles
for select
to authenticated
using (id = auth.uid());

drop policy if exists "profiles_insert_self" on public.profiles;
create policy "profiles_insert_self"
on public.profiles
for insert
to authenticated
with check (id = auth.uid());

drop policy if exists "profiles_update_self" on public.profiles;
create policy "profiles_update_self"
on public.profiles
for update
to authenticated
using (id = auth.uid())
with check (id = auth.uid());

drop policy if exists "shared_decks_select_members" on public.shared_decks;
create policy "shared_decks_select_members"
on public.shared_decks
for select
to authenticated
using (public.is_accepted_member(id) or owner_id = auth.uid());

drop policy if exists "shared_decks_insert_owner" on public.shared_decks;
create policy "shared_decks_insert_owner"
on public.shared_decks
for insert
to authenticated
with check (owner_id = auth.uid());

drop policy if exists "shared_decks_update_editors" on public.shared_decks;
create policy "shared_decks_update_editors"
on public.shared_decks
for update
to authenticated
using (public.can_edit_shared_deck(id) or owner_id = auth.uid())
with check (public.can_edit_shared_deck(id) or owner_id = auth.uid());

drop policy if exists "shared_decks_delete_owner" on public.shared_decks;
create policy "shared_decks_delete_owner"
on public.shared_decks
for delete
to authenticated
using (owner_id = auth.uid());

drop policy if exists "shared_cards_select_members" on public.shared_cards;
create policy "shared_cards_select_members"
on public.shared_cards
for select
to authenticated
using (public.is_accepted_member(deck_id));

drop policy if exists "shared_cards_insert_editors" on public.shared_cards;
create policy "shared_cards_insert_editors"
on public.shared_cards
for insert
to authenticated
with check (public.can_edit_shared_deck(deck_id));

drop policy if exists "shared_cards_update_editors" on public.shared_cards;
create policy "shared_cards_update_editors"
on public.shared_cards
for update
to authenticated
using (public.can_edit_shared_deck(deck_id))
with check (public.can_edit_shared_deck(deck_id));

drop policy if exists "shared_cards_delete_editors" on public.shared_cards;
create policy "shared_cards_delete_editors"
on public.shared_cards
for delete
to authenticated
using (public.can_edit_shared_deck(deck_id));

drop policy if exists "shared_card_media_select_members" on public.shared_card_media;
create policy "shared_card_media_select_members"
on public.shared_card_media
for select
to authenticated
using (public.is_accepted_member(deck_id));

drop policy if exists "shared_card_media_insert_editors" on public.shared_card_media;
create policy "shared_card_media_insert_editors"
on public.shared_card_media
for insert
to authenticated
with check (public.can_edit_shared_deck(deck_id));

drop policy if exists "shared_card_media_update_editors" on public.shared_card_media;
create policy "shared_card_media_update_editors"
on public.shared_card_media
for update
to authenticated
using (public.can_edit_shared_deck(deck_id))
with check (public.can_edit_shared_deck(deck_id));

drop policy if exists "shared_card_media_delete_editors" on public.shared_card_media;
create policy "shared_card_media_delete_editors"
on public.shared_card_media
for delete
to authenticated
using (public.can_edit_shared_deck(deck_id));

drop policy if exists "deck_members_select_self_or_owner" on public.deck_members;
create policy "deck_members_select_self_or_owner"
on public.deck_members
for select
to authenticated
using (user_id = auth.uid() or public.is_deck_owner(deck_id));

drop policy if exists "deck_members_insert_owner_row" on public.deck_members;
create policy "deck_members_insert_owner_row"
on public.deck_members
for insert
to authenticated
with check (user_id = auth.uid() and role = 'owner' and public.is_deck_owner(deck_id));

drop policy if exists "deck_members_update_owner" on public.deck_members;
create policy "deck_members_update_owner"
on public.deck_members
for update
to authenticated
using (public.is_deck_owner(deck_id))
with check (public.is_deck_owner(deck_id));

drop policy if exists "deck_members_delete_owner_or_self" on public.deck_members;
create policy "deck_members_delete_owner_or_self"
on public.deck_members
for delete
to authenticated
using (
  (public.is_deck_owner(deck_id) and role <> 'owner')
  or (user_id = auth.uid() and role <> 'owner')
);

drop policy if exists "deck_access_requests_select_requester_or_owner" on public.deck_access_requests;
create policy "deck_access_requests_select_requester_or_owner"
on public.deck_access_requests
for select
to authenticated
using (user_id = auth.uid() or public.is_deck_owner(deck_id));

drop policy if exists "user_card_progress_select_self" on public.user_card_progress;
create policy "user_card_progress_select_self"
on public.user_card_progress
for select
to authenticated
using (user_id = auth.uid() and public.is_accepted_member(deck_id));

drop policy if exists "user_card_progress_insert_self" on public.user_card_progress;
create policy "user_card_progress_insert_self"
on public.user_card_progress
for insert
to authenticated
with check (user_id = auth.uid() and public.is_accepted_member(deck_id));

drop policy if exists "user_card_progress_update_self" on public.user_card_progress;
create policy "user_card_progress_update_self"
on public.user_card_progress
for update
to authenticated
using (user_id = auth.uid() and public.is_accepted_member(deck_id))
with check (user_id = auth.uid() and public.is_accepted_member(deck_id));

drop policy if exists "user_review_log_select_self" on public.user_review_log;
create policy "user_review_log_select_self"
on public.user_review_log
for select
to authenticated
using (user_id = auth.uid() and public.is_accepted_member(deck_id));

drop policy if exists "user_review_log_insert_self" on public.user_review_log;
create policy "user_review_log_insert_self"
on public.user_review_log
for insert
to authenticated
with check (user_id = auth.uid() and public.is_accepted_member(deck_id));

drop policy if exists "user_backup_snapshots_select_self" on public.user_backup_snapshots;
create policy "user_backup_snapshots_select_self"
on public.user_backup_snapshots
for select
to authenticated
using (user_id = auth.uid());

drop policy if exists "user_backup_snapshots_insert_self" on public.user_backup_snapshots;
create policy "user_backup_snapshots_insert_self"
on public.user_backup_snapshots
for insert
to authenticated
with check (user_id = auth.uid());

drop policy if exists "user_backup_snapshots_update_self" on public.user_backup_snapshots;
create policy "user_backup_snapshots_update_self"
on public.user_backup_snapshots
for update
to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

drop policy if exists "user_backup_snapshots_delete_self" on public.user_backup_snapshots;
create policy "user_backup_snapshots_delete_self"
on public.user_backup_snapshots
for delete
to authenticated
using (user_id = auth.uid());

create or replace function public.get_share_preview(target_token text)
returns table (
  deck_id uuid,
  deck_name text,
  focus text,
  subject text,
  description text,
  membership_role text,
  request_status text,
  request_id uuid
)
language plpgsql
security definer
set search_path = public
as $$
begin
  return query
  select
    d.id,
    d.name,
    d.focus,
    d.subject,
    d.description,
    m.role,
    r.status,
    r.id
  from public.shared_decks d
  left join public.deck_members m
    on m.deck_id = d.id
   and m.user_id = auth.uid()
  left join public.deck_access_requests r
    on r.deck_id = d.id
   and r.user_id = auth.uid()
  where d.share_token = target_token
  limit 1;
end;
$$;

create or replace function public.request_deck_access(target_token text, requested_role text default 'viewer')
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  target_deck public.shared_decks%rowtype;
  safe_role text;
  requester_email text;
begin
  if auth.uid() is null then
    raise exception 'Authentication required';
  end if;

  select *
  into target_deck
  from public.shared_decks
  where share_token = target_token
  limit 1;

  if target_deck.id is null then
    raise exception 'Shared deck not found';
  end if;

  if target_deck.owner_id = auth.uid() then
    return target_deck.id;
  end if;

  if exists (
    select 1
    from public.deck_members
    where deck_id = target_deck.id
      and user_id = auth.uid()
  ) then
    return target_deck.id;
  end if;

  safe_role := case
    when requested_role = 'editor' then 'editor'
    else 'viewer'
  end;

  requester_email := coalesce(nullif(auth.jwt() ->> 'email', ''), '');

  insert into public.deck_access_requests (
    deck_id,
    user_id,
    requester_email,
    requested_role,
    status
  )
  values (
    target_deck.id,
    auth.uid(),
    requester_email,
    safe_role,
    'pending'
  )
  on conflict (deck_id, user_id)
  do update set
    requester_email = excluded.requester_email,
    requested_role = excluded.requested_role,
    status = 'pending',
    updated_at = timezone('utc', now());

  return target_deck.id;
end;
$$;

create or replace function public.approve_deck_access(target_request_id uuid, approved_role text default null)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  request_row public.deck_access_requests%rowtype;
  safe_role text;
begin
  select r.*
  into request_row
  from public.deck_access_requests r
  join public.shared_decks d
    on d.id = r.deck_id
  where r.id = target_request_id
    and d.owner_id = auth.uid()
  limit 1;

  if request_row.id is null then
    raise exception 'Request not found';
  end if;

  safe_role := case
    when coalesce(approved_role, request_row.requested_role) = 'editor' then 'editor'
    else 'viewer'
  end;

  insert into public.deck_members (deck_id, user_id, role)
  values (request_row.deck_id, request_row.user_id, safe_role)
  on conflict (deck_id, user_id)
  do update set role = excluded.role;

  update public.deck_access_requests
  set
    status = 'approved',
    requested_role = safe_role,
    updated_at = timezone('utc', now())
  where id = request_row.id;

  return request_row.deck_id;
end;
$$;

create or replace function public.reject_deck_access(target_request_id uuid)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  request_row public.deck_access_requests%rowtype;
begin
  select r.*
  into request_row
  from public.deck_access_requests r
  join public.shared_decks d
    on d.id = r.deck_id
  where r.id = target_request_id
    and d.owner_id = auth.uid()
  limit 1;

  if request_row.id is null then
    raise exception 'Request not found';
  end if;

  update public.deck_access_requests
  set
    status = 'rejected',
    updated_at = timezone('utc', now())
  where id = request_row.id;

  return request_row.deck_id;
end;
$$;

grant execute on function public.get_share_preview(text) to authenticated;
grant execute on function public.request_deck_access(text, text) to authenticated;
grant execute on function public.approve_deck_access(uuid, text) to authenticated;
grant execute on function public.reject_deck_access(uuid) to authenticated;

insert into storage.buckets (id, name, public)
values ('shared-card-media', 'shared-card-media', true)
on conflict (id) do update
set public = excluded.public;

insert into storage.buckets (id, name, public)
values ('user-backup-snapshots', 'user-backup-snapshots', false)
on conflict (id) do update
set public = excluded.public;

drop policy if exists "shared_card_media_public_read" on storage.objects;
create policy "shared_card_media_public_read"
on storage.objects
for select
to public
using (
  bucket_id = 'shared-card-media'
  and public.is_accepted_member((storage.foldername(name))[1]::uuid)
);

drop policy if exists "shared_card_media_insert_editors" on storage.objects;
create policy "shared_card_media_insert_editors"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'shared-card-media'
  and public.can_edit_shared_deck((storage.foldername(name))[1]::uuid)
);

drop policy if exists "shared_card_media_update_editors" on storage.objects;
create policy "shared_card_media_update_editors"
on storage.objects
for update
to authenticated
using (
  bucket_id = 'shared-card-media'
  and public.can_edit_shared_deck((storage.foldername(name))[1]::uuid)
)
with check (
  bucket_id = 'shared-card-media'
  and public.can_edit_shared_deck((storage.foldername(name))[1]::uuid)
);

drop policy if exists "shared_card_media_delete_editors" on storage.objects;
create policy "shared_card_media_delete_editors"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'shared-card-media'
  and public.can_edit_shared_deck((storage.foldername(name))[1]::uuid)
);

drop policy if exists "user_backup_snapshots_select_self" on storage.objects;
create policy "user_backup_snapshots_select_self"
on storage.objects
for select
to authenticated
using (
  bucket_id = 'user-backup-snapshots'
  and (storage.foldername(name))[1] = auth.uid()::text
);

drop policy if exists "user_backup_snapshots_insert_self" on storage.objects;
create policy "user_backup_snapshots_insert_self"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'user-backup-snapshots'
  and (storage.foldername(name))[1] = auth.uid()::text
);

drop policy if exists "user_backup_snapshots_update_self" on storage.objects;
create policy "user_backup_snapshots_update_self"
on storage.objects
for update
to authenticated
using (
  bucket_id = 'user-backup-snapshots'
  and (storage.foldername(name))[1] = auth.uid()::text
)
with check (
  bucket_id = 'user-backup-snapshots'
  and (storage.foldername(name))[1] = auth.uid()::text
);

drop policy if exists "user_backup_snapshots_delete_self" on storage.objects;
create policy "user_backup_snapshots_delete_self"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'user-backup-snapshots'
  and (storage.foldername(name))[1] = auth.uid()::text
);

alter table public.deck_members
add column if not exists permissions jsonb not null default '{}'::jsonb;

create or replace function public.default_member_permissions(target_role text)
returns jsonb
language sql
immutable
as $$
  select case
    when target_role = 'owner' then jsonb_build_object(
      'edit_deck_meta', true,
      'add_cards', true,
      'edit_cards', true,
      'delete_cards', true,
      'upload_media', true,
      'manage_members', true,
      'approve_requests', true,
      'regenerate_share_link', true,
      'publish_copy_link', true
    )
    when target_role = 'editor' then jsonb_build_object(
      'edit_deck_meta', true,
      'add_cards', true,
      'edit_cards', true,
      'delete_cards', true,
      'upload_media', true,
      'manage_members', false,
      'approve_requests', false,
      'regenerate_share_link', false,
      'publish_copy_link', false
    )
    else jsonb_build_object(
      'edit_deck_meta', false,
      'add_cards', false,
      'edit_cards', false,
      'delete_cards', false,
      'upload_media', false,
      'manage_members', false,
      'approve_requests', false,
      'regenerate_share_link', false,
      'publish_copy_link', false
    )
  end;
$$;

update public.deck_members
set permissions = public.default_member_permissions(role)
where permissions = '{}'::jsonb;

create or replace function public.member_permissions(target_role text, overrides jsonb default '{}'::jsonb)
returns jsonb
language sql
immutable
as $$
  select public.default_member_permissions(target_role) || coalesce(overrides, '{}'::jsonb);
$$;

create or replace function public.has_deck_permission(target_deck_id uuid, permission_key text)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(
    (
      select ((public.member_permissions(role, permissions) ->> permission_key)::boolean)
      from public.deck_members
      where deck_id = target_deck_id
        and user_id = auth.uid()
      limit 1
    ),
    false
  );
$$;

create or replace function public.can_edit_shared_deck(target_deck_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.has_deck_permission(target_deck_id, 'edit_deck_meta');
$$;

create or replace function public.can_add_shared_cards(target_deck_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.has_deck_permission(target_deck_id, 'add_cards');
$$;

create or replace function public.can_edit_shared_cards(target_deck_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.has_deck_permission(target_deck_id, 'edit_cards');
$$;

create or replace function public.can_delete_shared_cards(target_deck_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.has_deck_permission(target_deck_id, 'delete_cards');
$$;

create or replace function public.can_upload_shared_media(target_deck_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.has_deck_permission(target_deck_id, 'upload_media');
$$;

create or replace function public.can_manage_deck_members(target_deck_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.has_deck_permission(target_deck_id, 'manage_members');
$$;

create or replace function public.can_approve_deck_requests(target_deck_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.has_deck_permission(target_deck_id, 'approve_requests');
$$;

create or replace function public.can_regenerate_deck_share_link(target_deck_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.has_deck_permission(target_deck_id, 'regenerate_share_link');
$$;

create or replace function public.can_publish_copy_link(target_deck_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.has_deck_permission(target_deck_id, 'publish_copy_link');
$$;

drop policy if exists "shared_decks_update_editors" on public.shared_decks;
create policy "shared_decks_update_editors"
on public.shared_decks
for update
to authenticated
using (public.can_edit_shared_deck(id) or owner_id = auth.uid())
with check (public.can_edit_shared_deck(id) or owner_id = auth.uid());

drop policy if exists "shared_cards_insert_editors" on public.shared_cards;
create policy "shared_cards_insert_editors"
on public.shared_cards
for insert
to authenticated
with check (public.can_add_shared_cards(deck_id));

drop policy if exists "shared_cards_update_editors" on public.shared_cards;
create policy "shared_cards_update_editors"
on public.shared_cards
for update
to authenticated
using (public.can_edit_shared_cards(deck_id))
with check (public.can_edit_shared_cards(deck_id));

drop policy if exists "shared_cards_delete_editors" on public.shared_cards;
create policy "shared_cards_delete_editors"
on public.shared_cards
for delete
to authenticated
using (public.can_delete_shared_cards(deck_id));

drop policy if exists "shared_card_media_insert_editors" on public.shared_card_media;
create policy "shared_card_media_insert_editors"
on public.shared_card_media
for insert
to authenticated
with check (public.can_upload_shared_media(deck_id));

drop policy if exists "shared_card_media_update_editors" on public.shared_card_media;
create policy "shared_card_media_update_editors"
on public.shared_card_media
for update
to authenticated
using (public.can_upload_shared_media(deck_id))
with check (public.can_upload_shared_media(deck_id));

drop policy if exists "shared_card_media_delete_editors" on public.shared_card_media;
create policy "shared_card_media_delete_editors"
on public.shared_card_media
for delete
to authenticated
using (public.can_upload_shared_media(deck_id));

drop policy if exists "deck_members_select_self_or_owner" on public.deck_members;
create policy "deck_members_select_self_or_owner"
on public.deck_members
for select
to authenticated
using (
  user_id = auth.uid()
  or public.can_manage_deck_members(deck_id)
  or public.can_approve_deck_requests(deck_id)
  or public.is_deck_owner(deck_id)
);

drop policy if exists "deck_members_update_owner" on public.deck_members;
create policy "deck_members_update_owner"
on public.deck_members
for update
to authenticated
using (public.can_manage_deck_members(deck_id) or public.is_deck_owner(deck_id))
with check (public.can_manage_deck_members(deck_id) or public.is_deck_owner(deck_id));

drop policy if exists "deck_members_delete_owner_or_self" on public.deck_members;
create policy "deck_members_delete_owner_or_self"
on public.deck_members
for delete
to authenticated
using (
  ((public.can_manage_deck_members(deck_id) or public.is_deck_owner(deck_id)) and role <> 'owner')
  or (user_id = auth.uid() and role <> 'owner')
);

drop policy if exists "deck_access_requests_select_requester_or_owner" on public.deck_access_requests;
create policy "deck_access_requests_select_requester_or_owner"
on public.deck_access_requests
for select
to authenticated
using (user_id = auth.uid() or public.can_approve_deck_requests(deck_id) or public.is_deck_owner(deck_id));

create table if not exists public.shared_edit_locks (
  id uuid primary key default gen_random_uuid(),
  deck_id uuid not null references public.shared_decks (id) on delete cascade,
  target_type text not null check (target_type in ('deck', 'card')),
  target_id text not null,
  holder_user_id uuid not null references public.profiles (id) on delete cascade,
  holder_email text not null default '',
  expires_at timestamptz not null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (target_type, target_id)
);

create table if not exists public.shared_deck_events (
  id uuid primary key default gen_random_uuid(),
  deck_id uuid not null references public.shared_decks (id) on delete cascade,
  actor_user_id uuid references public.profiles (id) on delete set null,
  actor_email text not null default '',
  event_type text not null,
  entity_type text not null default 'deck',
  entity_id text not null default '',
  summary text not null default '',
  meta_json jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.user_notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  deck_id uuid references public.shared_decks (id) on delete cascade,
  notification_type text not null,
  title text not null default '',
  body text not null default '',
  meta_json jsonb not null default '{}'::jsonb,
  read_at timestamptz,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.shared_copy_packages (
  id uuid primary key default gen_random_uuid(),
  deck_id uuid not null references public.shared_decks (id) on delete cascade,
  created_by uuid not null references public.profiles (id) on delete cascade,
  token text not null unique,
  storage_path text not null unique,
  summary_json jsonb not null default '{}'::jsonb,
  is_active boolean not null default true,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index if not exists idx_shared_edit_locks_deck_id on public.shared_edit_locks (deck_id, expires_at desc);
create index if not exists idx_shared_deck_events_deck_id on public.shared_deck_events (deck_id, created_at desc);
create index if not exists idx_user_notifications_user_id on public.user_notifications (user_id, created_at desc);
create index if not exists idx_shared_copy_packages_deck_id on public.shared_copy_packages (deck_id, updated_at desc);

drop trigger if exists set_shared_edit_locks_updated_at on public.shared_edit_locks;
create trigger set_shared_edit_locks_updated_at
before update on public.shared_edit_locks
for each row execute procedure public.set_updated_at();

drop trigger if exists set_shared_copy_packages_updated_at on public.shared_copy_packages;
create trigger set_shared_copy_packages_updated_at
before update on public.shared_copy_packages
for each row execute procedure public.set_updated_at();

alter table public.shared_edit_locks enable row level security;
alter table public.shared_deck_events enable row level security;
alter table public.user_notifications enable row level security;
alter table public.shared_copy_packages enable row level security;

drop policy if exists "shared_edit_locks_select_members" on public.shared_edit_locks;
create policy "shared_edit_locks_select_members"
on public.shared_edit_locks
for select
to authenticated
using (public.is_accepted_member(deck_id));

drop policy if exists "shared_deck_events_select_members" on public.shared_deck_events;
create policy "shared_deck_events_select_members"
on public.shared_deck_events
for select
to authenticated
using (public.is_accepted_member(deck_id));

drop policy if exists "shared_deck_events_insert_members" on public.shared_deck_events;
create policy "shared_deck_events_insert_members"
on public.shared_deck_events
for insert
to authenticated
with check (public.is_accepted_member(deck_id));

drop policy if exists "user_notifications_select_self" on public.user_notifications;
create policy "user_notifications_select_self"
on public.user_notifications
for select
to authenticated
using (user_id = auth.uid());

drop policy if exists "user_notifications_update_self" on public.user_notifications;
create policy "user_notifications_update_self"
on public.user_notifications
for update
to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

drop policy if exists "shared_copy_packages_select_members" on public.shared_copy_packages;
create policy "shared_copy_packages_select_members"
on public.shared_copy_packages
for select
to authenticated
using (public.is_accepted_member(deck_id) or public.can_publish_copy_link(deck_id) or public.is_deck_owner(deck_id));

drop policy if exists "shared_copy_packages_insert_publishers" on public.shared_copy_packages;
create policy "shared_copy_packages_insert_publishers"
on public.shared_copy_packages
for insert
to authenticated
with check (public.can_publish_copy_link(deck_id) or public.is_deck_owner(deck_id));

drop policy if exists "shared_copy_packages_update_publishers" on public.shared_copy_packages;
create policy "shared_copy_packages_update_publishers"
on public.shared_copy_packages
for update
to authenticated
using (public.can_publish_copy_link(deck_id) or public.is_deck_owner(deck_id))
with check (public.can_publish_copy_link(deck_id) or public.is_deck_owner(deck_id));

drop policy if exists "shared_copy_packages_delete_publishers" on public.shared_copy_packages;
create policy "shared_copy_packages_delete_publishers"
on public.shared_copy_packages
for delete
to authenticated
using (public.can_publish_copy_link(deck_id) or public.is_deck_owner(deck_id));

create or replace function public.claim_edit_lock(
  target_deck_id uuid,
  target_type text,
  target_id text,
  lease_seconds integer default 600
)
returns table (
  locked boolean,
  is_self boolean,
  lock_id uuid,
  holder_user_id uuid,
  holder_email text,
  expires_at timestamptz
)
language plpgsql
security definer
set search_path = public
as $$
declare
  existing_lock public.shared_edit_locks%rowtype;
  safe_expires timestamptz;
begin
  if auth.uid() is null then
    raise exception 'Authentication required';
  end if;

  if not public.is_accepted_member(target_deck_id) then
    raise exception 'Deck access denied';
  end if;

  safe_expires := timezone('utc', now()) + make_interval(secs => greatest(60, least(coalesce(lease_seconds, 600), 3600)));

  select *
  into existing_lock
  from public.shared_edit_locks
  where deck_id = target_deck_id
    and target_type = claim_edit_lock.target_type
    and target_id = claim_edit_lock.target_id
  limit 1;

  if existing_lock.id is not null
     and existing_lock.expires_at > timezone('utc', now())
     and existing_lock.holder_user_id <> auth.uid() then
    return query
    select false, false, existing_lock.id, existing_lock.holder_user_id, existing_lock.holder_email, existing_lock.expires_at;
    return;
  end if;

  insert into public.shared_edit_locks (
    deck_id,
    target_type,
    target_id,
    holder_user_id,
    holder_email,
    expires_at
  )
  values (
    target_deck_id,
    claim_edit_lock.target_type,
    claim_edit_lock.target_id,
    auth.uid(),
    coalesce(nullif(auth.jwt() ->> 'email', ''), ''),
    safe_expires
  )
  on conflict (target_type, target_id)
  do update set
    deck_id = excluded.deck_id,
    holder_user_id = excluded.holder_user_id,
    holder_email = excluded.holder_email,
    expires_at = excluded.expires_at,
    updated_at = timezone('utc', now())
  where public.shared_edit_locks.holder_user_id = auth.uid()
     or public.shared_edit_locks.expires_at <= timezone('utc', now());

  select *
  into existing_lock
  from public.shared_edit_locks
  where deck_id = target_deck_id
    and target_type = claim_edit_lock.target_type
    and target_id = claim_edit_lock.target_id
  limit 1;

  return query
  select
    (existing_lock.holder_user_id = auth.uid()),
    (existing_lock.holder_user_id = auth.uid()),
    existing_lock.id,
    existing_lock.holder_user_id,
    existing_lock.holder_email,
    existing_lock.expires_at;
end;
$$;

create or replace function public.release_edit_lock(target_deck_id uuid, target_type text, target_id text)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is null then
    return false;
  end if;

  delete from public.shared_edit_locks
  where deck_id = target_deck_id
    and target_type = release_edit_lock.target_type
    and target_id = release_edit_lock.target_id
    and holder_user_id = auth.uid();

  return true;
end;
$$;

create or replace function public.regenerate_deck_share_link(target_deck_id uuid)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  next_token text;
begin
  if auth.uid() is null then
    raise exception 'Authentication required';
  end if;

  if not (public.can_regenerate_deck_share_link(target_deck_id) or public.is_deck_owner(target_deck_id)) then
    raise exception 'Permission denied';
  end if;

  next_token := gen_random_uuid()::text;
  update public.shared_decks
  set share_token = next_token
  where id = target_deck_id;

  return next_token;
end;
$$;

create or replace function public.get_copy_package_preview(target_token text)
returns table (
  deck_id uuid,
  deck_name text,
  focus text,
  subject text,
  description text,
  storage_path text,
  summary_json jsonb
)
language plpgsql
security definer
set search_path = public
as $$
begin
  return query
  select
    d.id,
    d.name,
    d.focus,
    d.subject,
    d.description,
    p.storage_path,
    p.summary_json
  from public.shared_copy_packages p
  join public.shared_decks d
    on d.id = p.deck_id
  where p.token = target_token
    and p.is_active = true
  limit 1;
end;
$$;

create or replace function public.create_notifications_from_deck_event()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  target_user uuid;
  target_email text;
begin
  if new.event_type = 'request_created' then
    insert into public.user_notifications (user_id, deck_id, notification_type, title, body, meta_json)
    select
      d.owner_id,
      new.deck_id,
      new.event_type,
      '参加申請が届きました',
      coalesce(new.summary, '共有デッキに参加申請が届きました'),
      coalesce(new.meta_json, '{}'::jsonb)
    from public.shared_decks d
    where d.id = new.deck_id
      and d.owner_id <> coalesce(new.actor_user_id, d.owner_id);
    return new;
  end if;

  begin
    target_user := nullif(new.meta_json ->> 'targetUserId', '')::uuid;
  exception
    when others then
      target_user := null;
  end;
  target_email := coalesce(new.meta_json ->> 'targetEmail', '');

  if new.event_type in ('request_approved', 'request_rejected', 'role_changed', 'permissions_changed', 'member_removed') and target_user is not null then
    insert into public.user_notifications (user_id, deck_id, notification_type, title, body, meta_json)
    values (
      target_user,
      new.deck_id,
      new.event_type,
      case new.event_type
        when 'request_approved' then '参加申請が承認されました'
        when 'request_rejected' then '参加申請が拒否されました'
        when 'role_changed' then '共有権限が変更されました'
        when 'permissions_changed' then '詳細権限が更新されました'
        else '共有から外されました'
      end,
      coalesce(new.summary, target_email),
      coalesce(new.meta_json, '{}'::jsonb)
    );
    return new;
  end if;

  if new.event_type in ('deck_updated', 'card_added', 'card_updated', 'card_deleted', 'media_updated', 'share_link_regenerated', 'copy_link_refreshed') then
    insert into public.user_notifications (user_id, deck_id, notification_type, title, body, meta_json)
    select
      m.user_id,
      new.deck_id,
      new.event_type,
      '共有デッキが更新されました',
      coalesce(new.summary, '共有デッキに更新があります'),
      coalesce(new.meta_json, '{}'::jsonb)
    from public.deck_members m
    where m.deck_id = new.deck_id
      and m.user_id <> coalesce(new.actor_user_id, m.user_id);
  end if;

  return new;
end;
$$;

drop trigger if exists create_notifications_from_deck_event on public.shared_deck_events;
create trigger create_notifications_from_deck_event
after insert on public.shared_deck_events
for each row execute procedure public.create_notifications_from_deck_event();

create or replace function public.request_deck_access(target_token text, requested_role text default 'viewer')
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  target_deck public.shared_decks%rowtype;
  safe_role text;
  requester_email text;
  request_row public.deck_access_requests%rowtype;
begin
  if auth.uid() is null then
    raise exception 'Authentication required';
  end if;

  select *
  into target_deck
  from public.shared_decks
  where share_token = target_token
  limit 1;

  if target_deck.id is null then
    raise exception 'Shared deck not found';
  end if;

  if target_deck.owner_id = auth.uid() then
    return target_deck.id;
  end if;

  if exists (
    select 1
    from public.deck_members
    where deck_id = target_deck.id
      and user_id = auth.uid()
  ) then
    return target_deck.id;
  end if;

  safe_role := case
    when requested_role = 'editor' then 'editor'
    else 'viewer'
  end;

  requester_email := coalesce(nullif(auth.jwt() ->> 'email', ''), '');

  insert into public.deck_access_requests (
    deck_id,
    user_id,
    requester_email,
    requested_role,
    status
  )
  values (
    target_deck.id,
    auth.uid(),
    requester_email,
    safe_role,
    'pending'
  )
  on conflict (deck_id, user_id)
  do update set
    requester_email = excluded.requester_email,
    requested_role = excluded.requested_role,
    status = 'pending',
    updated_at = timezone('utc', now())
  returning * into request_row;

  insert into public.shared_deck_events (
    deck_id,
    actor_user_id,
    actor_email,
    event_type,
    entity_type,
    entity_id,
    summary,
    meta_json
  )
  values (
    target_deck.id,
    auth.uid(),
    requester_email,
    'request_created',
    'request',
    request_row.id::text,
    coalesce(requester_email, '参加申請') || ' が ' || safe_role || ' で参加申請しました',
    jsonb_build_object(
      'requestedRole', safe_role,
      'deckName', target_deck.name
    )
  );

  return target_deck.id;
end;
$$;

create or replace function public.approve_deck_access(target_request_id uuid, approved_role text default null)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  request_row public.deck_access_requests%rowtype;
  safe_role text;
  deck_name text;
begin
  select r.*
  into request_row
  from public.deck_access_requests r
  join public.shared_decks d
    on d.id = r.deck_id
  where r.id = target_request_id
    and (public.can_approve_deck_requests(d.id) or d.owner_id = auth.uid())
  limit 1;

  if request_row.id is null then
    raise exception 'Request not found';
  end if;

  select name
  into deck_name
  from public.shared_decks
  where id = request_row.deck_id
  limit 1;

  safe_role := case
    when coalesce(approved_role, request_row.requested_role) = 'editor' then 'editor'
    else 'viewer'
  end;

  insert into public.deck_members (deck_id, user_id, role, permissions)
  values (request_row.deck_id, request_row.user_id, safe_role, public.default_member_permissions(safe_role))
  on conflict (deck_id, user_id)
  do update set
    role = excluded.role,
    permissions = excluded.permissions;

  update public.deck_access_requests
  set
    status = 'approved',
    requested_role = safe_role,
    updated_at = timezone('utc', now())
  where id = request_row.id;

  insert into public.shared_deck_events (
    deck_id,
    actor_user_id,
    actor_email,
    event_type,
    entity_type,
    entity_id,
    summary,
    meta_json
  )
  values (
    request_row.deck_id,
    auth.uid(),
    coalesce(nullif(auth.jwt() ->> 'email', ''), ''),
    'request_approved',
    'request',
    request_row.id::text,
    coalesce(request_row.requester_email, '参加申請') || ' を ' || safe_role || ' で承認しました',
    jsonb_build_object(
      'targetUserId', request_row.user_id,
      'targetEmail', request_row.requester_email,
      'nextRole', safe_role,
      'deckName', deck_name
    )
  );

  return request_row.deck_id;
end;
$$;

create or replace function public.reject_deck_access(target_request_id uuid)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  request_row public.deck_access_requests%rowtype;
  deck_name text;
begin
  select r.*
  into request_row
  from public.deck_access_requests r
  join public.shared_decks d
    on d.id = r.deck_id
  where r.id = target_request_id
    and (public.can_approve_deck_requests(d.id) or d.owner_id = auth.uid())
  limit 1;

  if request_row.id is null then
    raise exception 'Request not found';
  end if;

  select name
  into deck_name
  from public.shared_decks
  where id = request_row.deck_id
  limit 1;

  update public.deck_access_requests
  set
    status = 'rejected',
    updated_at = timezone('utc', now())
  where id = request_row.id;

  insert into public.shared_deck_events (
    deck_id,
    actor_user_id,
    actor_email,
    event_type,
    entity_type,
    entity_id,
    summary,
    meta_json
  )
  values (
    request_row.deck_id,
    auth.uid(),
    coalesce(nullif(auth.jwt() ->> 'email', ''), ''),
    'request_rejected',
    'request',
    request_row.id::text,
    coalesce(request_row.requester_email, '参加申請') || ' を拒否しました',
    jsonb_build_object(
      'targetUserId', request_row.user_id,
      'targetEmail', request_row.requester_email,
      'deckName', deck_name
    )
  );

  return request_row.deck_id;
end;
$$;

grant execute on function public.claim_edit_lock(uuid, text, text, integer) to authenticated;
grant execute on function public.release_edit_lock(uuid, text, text) to authenticated;
grant execute on function public.regenerate_deck_share_link(uuid) to authenticated;
grant execute on function public.get_copy_package_preview(text) to anon, authenticated;
grant execute on function public.request_deck_access(text, text) to authenticated;
grant execute on function public.approve_deck_access(uuid, text) to authenticated;
grant execute on function public.reject_deck_access(uuid) to authenticated;

insert into storage.buckets (id, name, public)
values ('shared-copy-packages', 'shared-copy-packages', true)
on conflict (id) do update
set public = excluded.public;

drop policy if exists "shared_copy_packages_public_read" on storage.objects;
create policy "shared_copy_packages_public_read"
on storage.objects
for select
to public
using (bucket_id = 'shared-copy-packages');

drop policy if exists "shared_copy_packages_insert_publishers" on storage.objects;
create policy "shared_copy_packages_insert_publishers"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'shared-copy-packages'
  and (
    public.can_publish_copy_link((storage.foldername(name))[1]::uuid)
    or public.is_deck_owner((storage.foldername(name))[1]::uuid)
  )
);

drop policy if exists "shared_copy_packages_update_publishers" on storage.objects;
create policy "shared_copy_packages_update_publishers"
on storage.objects
for update
to authenticated
using (
  bucket_id = 'shared-copy-packages'
  and (
    public.can_publish_copy_link((storage.foldername(name))[1]::uuid)
    or public.is_deck_owner((storage.foldername(name))[1]::uuid)
  )
)
with check (
  bucket_id = 'shared-copy-packages'
  and (
    public.can_publish_copy_link((storage.foldername(name))[1]::uuid)
    or public.is_deck_owner((storage.foldername(name))[1]::uuid)
  )
);

drop policy if exists "shared_copy_packages_delete_publishers" on storage.objects;
create policy "shared_copy_packages_delete_publishers"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'shared-copy-packages'
  and (
    public.can_publish_copy_link((storage.foldername(name))[1]::uuid)
    or public.is_deck_owner((storage.foldername(name))[1]::uuid)
  )
);

alter table public.shared_decks
add column if not exists visibility text not null default 'link_only',
add column if not exists public_title text not null default '',
add column if not exists public_description text not null default '',
add column if not exists public_tags text[] not null default '{}'::text[],
add column if not exists public_target_grade text not null default '',
add column if not exists public_update_note text not null default '',
add column if not exists public_author_label text not null default '',
add column if not exists public_ai_assisted boolean not null default false,
add column if not exists public_published_at timestamptz,
add column if not exists public_version integer not null default 0,
add column if not exists public_is_hidden boolean not null default false,
add column if not exists public_follow_count integer not null default 0,
add column if not exists public_clone_count integer not null default 0,
add column if not exists public_favorite_count integer not null default 0,
add column if not exists public_rating_average double precision not null default 0,
add column if not exists public_rating_count integer not null default 0,
add column if not exists public_card_count integer not null default 0,
add column if not exists public_image_count integer not null default 0;

alter table public.shared_decks
drop constraint if exists shared_decks_visibility_check;

alter table public.shared_decks
add constraint shared_decks_visibility_check
check (visibility in ('private', 'link_only', 'public_listed'));

update public.shared_decks
set visibility = case
  when visibility in ('private', 'link_only', 'public_listed') then visibility
  else 'link_only'
end;

alter table public.deck_access_requests
add column if not exists request_kind text not null default 'share_access';

alter table public.deck_access_requests
drop constraint if exists deck_access_requests_request_kind_check;

alter table public.deck_access_requests
add constraint deck_access_requests_request_kind_check
check (request_kind in ('share_access', 'public_editor'));

create table if not exists public.public_deck_versions (
  id uuid primary key default gen_random_uuid(),
  deck_id uuid not null references public.shared_decks (id) on delete cascade,
  version_number integer not null,
  update_note text not null default '',
  summary_json jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.public_deck_follows (
  id uuid primary key default gen_random_uuid(),
  deck_id uuid not null references public.shared_decks (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  last_seen_version integer not null default 0,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (deck_id, user_id)
);

create table if not exists public.public_deck_favorites (
  id uuid primary key default gen_random_uuid(),
  deck_id uuid not null references public.shared_decks (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  created_at timestamptz not null default timezone('utc', now()),
  unique (deck_id, user_id)
);

create table if not exists public.public_deck_ratings (
  id uuid primary key default gen_random_uuid(),
  deck_id uuid not null references public.shared_decks (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  rating integer not null check (rating between 1 and 5),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (deck_id, user_id)
);

create table if not exists public.public_deck_clones (
  id uuid primary key default gen_random_uuid(),
  deck_id uuid not null references public.shared_decks (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  created_at timestamptz not null default timezone('utc', now()),
  unique (deck_id, user_id)
);

create table if not exists public.public_deck_reports (
  id uuid primary key default gen_random_uuid(),
  deck_id uuid not null references public.shared_decks (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  reason text not null default '',
  detail text not null default '',
  status text not null default 'open' check (status in ('open', 'reviewed', 'resolved', 'dismissed')),
  meta_json jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.public_moderators (
  user_id uuid primary key references public.profiles (id) on delete cascade,
  note text not null default '',
  created_at timestamptz not null default timezone('utc', now())
);

create index if not exists idx_public_deck_versions_deck_id on public.public_deck_versions (deck_id, version_number desc);
create index if not exists idx_public_deck_follows_deck_id on public.public_deck_follows (deck_id);
create index if not exists idx_public_deck_follows_user_id on public.public_deck_follows (user_id);
create index if not exists idx_public_deck_favorites_deck_id on public.public_deck_favorites (deck_id);
create index if not exists idx_public_deck_ratings_deck_id on public.public_deck_ratings (deck_id);
create index if not exists idx_public_deck_reports_status on public.public_deck_reports (status, created_at desc);

drop trigger if exists set_public_deck_follows_updated_at on public.public_deck_follows;
create trigger set_public_deck_follows_updated_at
before update on public.public_deck_follows
for each row
execute function public.set_updated_at();

drop trigger if exists set_public_deck_ratings_updated_at on public.public_deck_ratings;
create trigger set_public_deck_ratings_updated_at
before update on public.public_deck_ratings
for each row
execute function public.set_updated_at();

drop trigger if exists set_public_deck_reports_updated_at on public.public_deck_reports;
create trigger set_public_deck_reports_updated_at
before update on public.public_deck_reports
for each row
execute function public.set_updated_at();

alter table public.public_deck_versions enable row level security;
alter table public.public_deck_follows enable row level security;
alter table public.public_deck_favorites enable row level security;
alter table public.public_deck_ratings enable row level security;
alter table public.public_deck_clones enable row level security;
alter table public.public_deck_reports enable row level security;
alter table public.public_moderators enable row level security;

create or replace function public.is_public_deck_visible(target_deck_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.shared_decks
    where id = target_deck_id
      and visibility = 'public_listed'
      and public_is_hidden = false
  );
$$;

create or replace function public.is_public_moderator()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.public_moderators
    where user_id = auth.uid()
  );
$$;

create or replace function public.refresh_public_deck_stats(target_deck_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.shared_decks
  set
    public_follow_count = (select count(*)::integer from public.public_deck_follows where deck_id = target_deck_id),
    public_clone_count = (select count(*)::integer from public.public_deck_clones where deck_id = target_deck_id),
    public_favorite_count = (select count(*)::integer from public.public_deck_favorites where deck_id = target_deck_id),
    public_rating_count = (select count(*)::integer from public.public_deck_ratings where deck_id = target_deck_id),
    public_rating_average = coalesce((select round(avg(rating)::numeric, 2)::double precision from public.public_deck_ratings where deck_id = target_deck_id), 0)
  where id = target_deck_id;
end;
$$;

create or replace function public.refresh_public_deck_content_stats(target_deck_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.shared_decks
  set
    public_card_count = (select count(*)::integer from public.shared_cards where deck_id = target_deck_id),
    public_image_count = (select count(*)::integer from public.shared_card_media where deck_id = target_deck_id)
  where id = target_deck_id;
end;
$$;

create or replace function public.refresh_public_deck_stats_from_trigger()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  target_id uuid;
begin
  if tg_op = 'DELETE' then
    target_id := old.deck_id;
  else
    target_id := new.deck_id;
  end if;
  if target_id is not null then
    perform public.refresh_public_deck_stats(target_id);
  end if;
  return coalesce(new, old);
end;
$$;

create or replace function public.refresh_public_deck_content_stats_from_trigger()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  next_deck_id uuid;
  previous_deck_id uuid;
begin
  if tg_op = 'DELETE' then
    next_deck_id := null;
    previous_deck_id := old.deck_id;
  elsif tg_op = 'INSERT' then
    next_deck_id := new.deck_id;
    previous_deck_id := null;
  else
    next_deck_id := new.deck_id;
    previous_deck_id := old.deck_id;
  end if;

  if previous_deck_id is not null then
    perform public.refresh_public_deck_content_stats(previous_deck_id);
  end if;
  if next_deck_id is not null and next_deck_id is distinct from previous_deck_id then
    perform public.refresh_public_deck_content_stats(next_deck_id);
  end if;
  return coalesce(new, old);
end;
$$;

drop trigger if exists refresh_public_stats_on_follow on public.public_deck_follows;
create trigger refresh_public_stats_on_follow
after insert or update or delete on public.public_deck_follows
for each row
execute function public.refresh_public_deck_stats_from_trigger();

drop trigger if exists refresh_public_stats_on_favorite on public.public_deck_favorites;
create trigger refresh_public_stats_on_favorite
after insert or delete on public.public_deck_favorites
for each row
execute function public.refresh_public_deck_stats_from_trigger();

drop trigger if exists refresh_public_stats_on_rating on public.public_deck_ratings;
create trigger refresh_public_stats_on_rating
after insert or update or delete on public.public_deck_ratings
for each row
execute function public.refresh_public_deck_stats_from_trigger();

drop trigger if exists refresh_public_stats_on_clone on public.public_deck_clones;
create trigger refresh_public_stats_on_clone
after insert or delete on public.public_deck_clones
for each row
execute function public.refresh_public_deck_stats_from_trigger();

drop trigger if exists refresh_public_content_on_cards on public.shared_cards;
create trigger refresh_public_content_on_cards
after insert or update or delete on public.shared_cards
for each row
execute function public.refresh_public_deck_content_stats_from_trigger();

drop trigger if exists refresh_public_content_on_media on public.shared_card_media;
create trigger refresh_public_content_on_media
after insert or update or delete on public.shared_card_media
for each row
execute function public.refresh_public_deck_content_stats_from_trigger();

drop policy if exists "shared_decks_select_public_catalog" on public.shared_decks;
create policy "shared_decks_select_public_catalog"
on public.shared_decks
for select
to public
using (public.is_public_deck_visible(id));

drop policy if exists "shared_cards_select_public_catalog" on public.shared_cards;
create policy "shared_cards_select_public_catalog"
on public.shared_cards
for select
to public
using (public.is_public_deck_visible(deck_id));

drop policy if exists "shared_card_media_select_public_catalog" on public.shared_card_media;
create policy "shared_card_media_select_public_catalog"
on public.shared_card_media
for select
to public
using (public.is_public_deck_visible(deck_id));

drop policy if exists "public_deck_versions_select_visible" on public.public_deck_versions;
create policy "public_deck_versions_select_visible"
on public.public_deck_versions
for select
to public
using (public.is_public_deck_visible(deck_id));

drop policy if exists "public_deck_follows_select_self" on public.public_deck_follows;
create policy "public_deck_follows_select_self"
on public.public_deck_follows
for select
to authenticated
using (user_id = auth.uid());

drop policy if exists "public_deck_follows_insert_self" on public.public_deck_follows;
create policy "public_deck_follows_insert_self"
on public.public_deck_follows
for insert
to authenticated
with check (user_id = auth.uid() and public.is_public_deck_visible(deck_id));

drop policy if exists "public_deck_follows_update_self" on public.public_deck_follows;
create policy "public_deck_follows_update_self"
on public.public_deck_follows
for update
to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

drop policy if exists "public_deck_follows_delete_self" on public.public_deck_follows;
create policy "public_deck_follows_delete_self"
on public.public_deck_follows
for delete
to authenticated
using (user_id = auth.uid());

drop policy if exists "public_deck_favorites_select_self" on public.public_deck_favorites;
create policy "public_deck_favorites_select_self"
on public.public_deck_favorites
for select
to authenticated
using (user_id = auth.uid());

drop policy if exists "public_deck_favorites_insert_self" on public.public_deck_favorites;
create policy "public_deck_favorites_insert_self"
on public.public_deck_favorites
for insert
to authenticated
with check (user_id = auth.uid() and public.is_public_deck_visible(deck_id));

drop policy if exists "public_deck_favorites_delete_self" on public.public_deck_favorites;
create policy "public_deck_favorites_delete_self"
on public.public_deck_favorites
for delete
to authenticated
using (user_id = auth.uid());

drop policy if exists "public_deck_favorites_update_self" on public.public_deck_favorites;
create policy "public_deck_favorites_update_self"
on public.public_deck_favorites
for update
to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

drop policy if exists "public_deck_ratings_select_self" on public.public_deck_ratings;
create policy "public_deck_ratings_select_self"
on public.public_deck_ratings
for select
to authenticated
using (user_id = auth.uid());

drop policy if exists "public_deck_ratings_insert_self" on public.public_deck_ratings;
create policy "public_deck_ratings_insert_self"
on public.public_deck_ratings
for insert
to authenticated
with check (user_id = auth.uid() and public.is_public_deck_visible(deck_id));

drop policy if exists "public_deck_ratings_update_self" on public.public_deck_ratings;
create policy "public_deck_ratings_update_self"
on public.public_deck_ratings
for update
to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

drop policy if exists "public_deck_clones_insert_self" on public.public_deck_clones;
create policy "public_deck_clones_insert_self"
on public.public_deck_clones
for insert
to authenticated
with check (user_id = auth.uid() and public.is_public_deck_visible(deck_id));

drop policy if exists "public_deck_clones_update_self" on public.public_deck_clones;
create policy "public_deck_clones_update_self"
on public.public_deck_clones
for update
to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

drop policy if exists "public_deck_reports_select_moderators" on public.public_deck_reports;
create policy "public_deck_reports_select_moderators"
on public.public_deck_reports
for select
to authenticated
using (public.is_public_moderator());

drop policy if exists "public_deck_reports_insert_users" on public.public_deck_reports;
create policy "public_deck_reports_insert_users"
on public.public_deck_reports
for insert
to authenticated
with check (user_id = auth.uid() and public.is_public_deck_visible(deck_id));

drop policy if exists "public_deck_reports_update_moderators" on public.public_deck_reports;
create policy "public_deck_reports_update_moderators"
on public.public_deck_reports
for update
to authenticated
using (public.is_public_moderator())
with check (public.is_public_moderator());

drop policy if exists "public_moderators_select_self" on public.public_moderators;
create policy "public_moderators_select_self"
on public.public_moderators
for select
to authenticated
using (user_id = auth.uid());

create or replace function public.publish_shared_deck(
  target_deck_id uuid,
  next_visibility text,
  next_title text,
  next_description text,
  next_tags text[],
  next_target_grade text,
  next_update_note text,
  next_ai_assisted boolean default false,
  acknowledge_public_responsibility boolean default false
)
returns setof public.shared_decks
language plpgsql
security definer
set search_path = public
as $$
declare
  target_deck public.shared_decks%rowtype;
  profile_row public.profiles%rowtype;
  safe_visibility text;
  safe_title text;
  safe_description text;
  safe_tags text[];
  safe_target_grade text;
  safe_update_note text;
  safe_ai_assisted boolean;
  next_version integer;
  next_event_type text;
begin
  if auth.uid() is null then
    raise exception 'Authentication required';
  end if;

  select * into target_deck
  from public.shared_decks
  where id = target_deck_id
    and owner_id = auth.uid()
  limit 1;

  if target_deck.id is null then
    raise exception 'Only the owner can publish this deck';
  end if;

  safe_visibility := case
    when next_visibility in ('private', 'link_only', 'public_listed') then next_visibility
    else 'link_only'
  end;

  if safe_visibility = 'public_listed' and not acknowledge_public_responsibility then
    raise exception '公開責任への同意が必要です';
  end if;

  select * into profile_row
  from public.profiles
  where id = auth.uid()
  limit 1;

  safe_title := coalesce(nullif(trim(next_title), ''), target_deck.name);
  safe_description := coalesce(nullif(trim(next_description), ''), target_deck.description);
  safe_tags := coalesce(next_tags, '{}'::text[]);
  safe_target_grade := coalesce(trim(next_target_grade), '');
  safe_update_note := coalesce(trim(next_update_note), '');
  safe_ai_assisted := coalesce(next_ai_assisted, false);

  if safe_visibility = 'public_listed' then
    next_version := greatest(coalesce(target_deck.public_version, 0), 0) + 1;
    next_event_type := case
      when target_deck.visibility = 'public_listed' then 'public_updated'
      else 'public_published'
    end;
  else
    next_version := coalesce(target_deck.public_version, 0);
    next_event_type := 'deck_updated';
  end if;

  update public.shared_decks
  set
    visibility = safe_visibility,
    public_title = safe_title,
    public_description = safe_description,
    public_tags = safe_tags,
    public_target_grade = safe_target_grade,
    public_update_note = safe_update_note,
    public_author_label = coalesce(nullif(profile_row.display_name, ''), nullif(profile_row.email, ''), '公開ユーザー'),
    public_ai_assisted = safe_ai_assisted,
    public_published_at = case when safe_visibility = 'public_listed' then timezone('utc', now()) else public_published_at end,
    public_version = next_version,
    public_is_hidden = case when safe_visibility = 'public_listed' then false else public_is_hidden end,
    updated_at = timezone('utc', now())
  where id = target_deck_id;

  perform public.refresh_public_deck_content_stats(target_deck_id);
  perform public.refresh_public_deck_stats(target_deck_id);

  if safe_visibility = 'public_listed' then
    insert into public.public_deck_versions (
      deck_id,
      version_number,
      update_note,
      summary_json
    )
    values (
      target_deck_id,
      next_version,
      safe_update_note,
      jsonb_build_object(
        'cardCount', (select public_card_count from public.shared_decks where id = target_deck_id),
        'imageCount', (select public_image_count from public.shared_decks where id = target_deck_id),
        'title', safe_title,
        'targetGrade', safe_target_grade
      )
    );

    insert into public.shared_deck_events (
      deck_id,
      actor_user_id,
      actor_email,
      event_type,
      entity_type,
      entity_id,
      summary,
      meta_json
    )
    values (
      target_deck_id,
      auth.uid(),
      coalesce(nullif(auth.jwt() ->> 'email', ''), profile_row.email, ''),
      next_event_type,
      'public_catalog',
      target_deck_id::text,
      case
        when next_event_type = 'public_published' then '公開デッキとして掲載しました'
        else '公開デッキを更新しました'
      end,
      jsonb_build_object(
        'publicTitle', safe_title,
        'version', next_version,
        'updateNote', safe_update_note,
        'visibility', safe_visibility
      )
    );

    insert into public.user_notifications (user_id, deck_id, notification_type, title, body, meta_json)
    select
      f.user_id,
      target_deck_id,
      'public_update',
      safe_title || ' が更新されました',
      coalesce(nullif(safe_update_note, ''), '公開デッキに新しい更新があります。'),
      jsonb_build_object(
        'deckName', safe_title,
        'version', next_version
      )
    from public.public_deck_follows f
    where f.deck_id = target_deck_id
      and f.user_id <> auth.uid();
  end if;

  return query
  select *
  from public.shared_decks
  where id = target_deck_id;
end;
$$;

create or replace function public.request_public_deck_editor_access(target_deck_id uuid)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  target_deck public.shared_decks%rowtype;
  requester_email text;
  request_row public.deck_access_requests%rowtype;
begin
  if auth.uid() is null then
    raise exception 'Authentication required';
  end if;

  select * into target_deck
  from public.shared_decks
  where id = target_deck_id
    and visibility = 'public_listed'
    and public_is_hidden = false
  limit 1;

  if target_deck.id is null then
    raise exception 'Public deck not found';
  end if;

  if target_deck.owner_id = auth.uid() then
    return target_deck.id;
  end if;

  if exists (
    select 1
    from public.deck_members
    where deck_id = target_deck.id
      and user_id = auth.uid()
  ) then
    return target_deck.id;
  end if;

  requester_email := coalesce(nullif(auth.jwt() ->> 'email', ''), '');

  insert into public.deck_access_requests (
    deck_id,
    user_id,
    requester_email,
    requested_role,
    request_kind,
    status
  )
  values (
    target_deck.id,
    auth.uid(),
    requester_email,
    'editor',
    'public_editor',
    'pending'
  )
  on conflict (deck_id, user_id)
  do update set
    requester_email = excluded.requester_email,
    requested_role = 'editor',
    request_kind = 'public_editor',
    status = 'pending',
    updated_at = timezone('utc', now())
  returning * into request_row;

  insert into public.shared_deck_events (
    deck_id,
    actor_user_id,
    actor_email,
    event_type,
    entity_type,
    entity_id,
    summary,
    meta_json
  )
  values (
    target_deck.id,
    auth.uid(),
    requester_email,
    'public_edit_requested',
    'request',
    request_row.id::text,
    coalesce(requester_email, '公開ユーザー') || ' が公開デッキの編集参加を申請しました',
    jsonb_build_object(
      'requestKind', 'public_editor',
      'requestedRole', 'editor',
      'deckName', coalesce(nullif(target_deck.public_title, ''), target_deck.name)
    )
  );

  insert into public.user_notifications (user_id, deck_id, notification_type, title, body, meta_json)
  values (
    target_deck.owner_id,
    target_deck.id,
    'public_editor_request',
    coalesce(nullif(target_deck.public_title, ''), target_deck.name) || ' へ編集参加申請が届きました',
    coalesce(requester_email, '公開ユーザー') || ' が editor 権限を希望しています。',
    jsonb_build_object(
      'requestId', request_row.id,
      'requestKind', 'public_editor',
      'deckName', coalesce(nullif(target_deck.public_title, ''), target_deck.name)
    )
  );

  return target_deck.id;
end;
$$;

create or replace function public.moderate_public_deck(
  target_report_id uuid,
  next_status text default 'resolved',
  hide_public_deck boolean default null
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  report_row public.public_deck_reports%rowtype;
  target_deck public.shared_decks%rowtype;
  safe_status text;
begin
  if auth.uid() is null or not public.is_public_moderator() then
    raise exception 'Moderator access required';
  end if;

  select * into report_row
  from public.public_deck_reports
  where id = target_report_id
  limit 1;

  if report_row.id is null then
    raise exception 'Report not found';
  end if;

  select * into target_deck
  from public.shared_decks
  where id = report_row.deck_id
  limit 1;

  safe_status := case
    when next_status in ('open', 'reviewed', 'resolved', 'dismissed') then next_status
    else 'resolved'
  end;

  update public.public_deck_reports
  set
    status = safe_status,
    updated_at = timezone('utc', now())
  where id = report_row.id;

  if hide_public_deck is not null and target_deck.id is not null then
    update public.shared_decks
    set
      public_is_hidden = hide_public_deck,
      updated_at = timezone('utc', now())
    where id = target_deck.id;

    insert into public.shared_deck_events (
      deck_id,
      actor_user_id,
      actor_email,
      event_type,
      entity_type,
      entity_id,
      summary,
      meta_json
    )
    values (
      target_deck.id,
      auth.uid(),
      coalesce(nullif(auth.jwt() ->> 'email', ''), ''),
      case when hide_public_deck then 'public_hidden' else 'public_restored' end,
      'public_report',
      report_row.id::text,
      case when hide_public_deck then '通報対応で公開停止にしました' else '通報対応で公開へ戻しました' end,
      jsonb_build_object(
        'reason', report_row.reason,
        'status', safe_status
      )
    );
  end if;

  return report_row.deck_id;
end;
$$;

create or replace function public.get_share_preview(target_token text)
returns table (
  deck_id uuid,
  deck_name text,
  focus text,
  subject text,
  description text,
  membership_role text,
  request_status text,
  request_id uuid
)
language plpgsql
security definer
set search_path = public
as $$
begin
  return query
  select
    d.id,
    d.name,
    d.focus,
    d.subject,
    d.description,
    m.role,
    r.status,
    r.id
  from public.shared_decks d
  left join public.deck_members m
    on m.deck_id = d.id
   and m.user_id = auth.uid()
  left join public.deck_access_requests r
    on r.deck_id = d.id
   and r.user_id = auth.uid()
   and r.request_kind = 'share_access'
  where d.share_token = target_token
    and d.visibility = 'link_only'
  limit 1;
end;
$$;

create or replace function public.request_deck_access(target_token text, requested_role text default 'viewer')
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  target_deck public.shared_decks%rowtype;
  safe_role text;
  requester_email text;
  request_row public.deck_access_requests%rowtype;
begin
  if auth.uid() is null then
    raise exception 'Authentication required';
  end if;

  select *
  into target_deck
  from public.shared_decks
  where share_token = target_token
    and visibility = 'link_only'
  limit 1;

  if target_deck.id is null then
    raise exception 'Shared deck not found';
  end if;

  if target_deck.owner_id = auth.uid() then
    return target_deck.id;
  end if;

  if exists (
    select 1
    from public.deck_members
    where deck_id = target_deck.id
      and user_id = auth.uid()
  ) then
    return target_deck.id;
  end if;

  safe_role := case
    when requested_role = 'editor' then 'editor'
    else 'viewer'
  end;

  requester_email := coalesce(nullif(auth.jwt() ->> 'email', ''), '');

  insert into public.deck_access_requests (
    deck_id,
    user_id,
    requester_email,
    requested_role,
    request_kind,
    status
  )
  values (
    target_deck.id,
    auth.uid(),
    requester_email,
    safe_role,
    'share_access',
    'pending'
  )
  on conflict (deck_id, user_id)
  do update set
    requester_email = excluded.requester_email,
    requested_role = excluded.requested_role,
    request_kind = 'share_access',
    status = 'pending',
    updated_at = timezone('utc', now())
  returning * into request_row;

  insert into public.shared_deck_events (
    deck_id,
    actor_user_id,
    actor_email,
    event_type,
    entity_type,
    entity_id,
    summary,
    meta_json
  )
  values (
    target_deck.id,
    auth.uid(),
    requester_email,
    'request_created',
    'request',
    request_row.id::text,
    coalesce(requester_email, '参加申請') || ' が ' || safe_role || ' で参加申請しました',
    jsonb_build_object(
      'requestedRole', safe_role,
      'requestKind', 'share_access',
      'deckName', target_deck.name
    )
  );

  return target_deck.id;
end;
$$;

drop policy if exists "shared_card_media_public_read" on storage.objects;
create policy "shared_card_media_public_read"
on storage.objects
for select
to public
using (
  bucket_id = 'shared-card-media'
  and (
    public.is_accepted_member((storage.foldername(name))[1]::uuid)
    or public.is_public_deck_visible((storage.foldername(name))[1]::uuid)
  )
);

grant execute on function public.refresh_public_deck_stats(uuid) to authenticated;
grant execute on function public.refresh_public_deck_content_stats(uuid) to authenticated;
grant execute on function public.publish_shared_deck(uuid, text, text, text, text[], text, text, boolean, boolean) to authenticated;
grant execute on function public.request_public_deck_editor_access(uuid) to authenticated;
grant execute on function public.moderate_public_deck(uuid, text, boolean) to authenticated;
grant execute on function public.get_share_preview(text) to anon, authenticated;
grant execute on function public.request_deck_access(text, text) to authenticated;
