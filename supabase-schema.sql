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

create index if not exists idx_shared_cards_deck_id on public.shared_cards (deck_id);
create index if not exists idx_deck_members_user_id on public.deck_members (user_id);
create index if not exists idx_access_requests_deck_id on public.deck_access_requests (deck_id);
create index if not exists idx_progress_user_id on public.user_card_progress (user_id, deck_id);
create index if not exists idx_review_log_user_id on public.user_review_log (user_id, deck_id);

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

drop trigger if exists set_access_requests_updated_at on public.deck_access_requests;
create trigger set_access_requests_updated_at
before update on public.deck_access_requests
for each row execute procedure public.set_updated_at();

drop trigger if exists set_progress_updated_at on public.user_card_progress;
create trigger set_progress_updated_at
before update on public.user_card_progress
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
alter table public.deck_members enable row level security;
alter table public.deck_access_requests enable row level security;
alter table public.user_card_progress enable row level security;
alter table public.user_review_log enable row level security;

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
