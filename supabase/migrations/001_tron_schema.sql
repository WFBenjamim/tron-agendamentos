create extension if not exists "pgcrypto";

create table if not exists public.barbershops (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null unique references auth.users(id) on delete cascade,
  name text not null,
  slug text not null unique,
  custom_message text,
  whatsapp_number text,
  plan text not null default 'active' check (plan in ('active', 'inactive', 'trial')),
  plan_expires_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint barbershops_slug_format check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$')
);

create table if not exists public.available_slots (
  id uuid primary key default gen_random_uuid(),
  barbershop_id uuid not null references public.barbershops(id) on delete cascade,
  slot_datetime timestamptz not null,
  is_booked boolean not null default false,
  is_blocked boolean not null default false,
  created_at timestamptz not null default now(),
  constraint available_slots_unique_time unique (barbershop_id, slot_datetime)
);

create table if not exists public.clients (
  id uuid primary key default gen_random_uuid(),
  barbershop_id uuid not null references public.barbershops(id) on delete cascade,
  name text not null,
  whatsapp text not null,
  first_seen_at timestamptz not null default now(),
  last_seen_at timestamptz not null default now(),
  unique (barbershop_id, whatsapp)
);

create table if not exists public.appointments (
  id uuid primary key default gen_random_uuid(),
  barbershop_id uuid not null references public.barbershops(id) on delete cascade,
  slot_id uuid not null references public.available_slots(id) on delete restrict,
  client_id uuid not null references public.clients(id) on delete restrict,
  status text not null default 'confirmed' check (status in ('confirmed', 'cancelled', 'done')),
  created_at timestamptz not null default now()
);

create table if not exists public.transactions (
  id uuid primary key default gen_random_uuid(),
  barbershop_id uuid not null references public.barbershops(id) on delete cascade,
  amount decimal(10, 2) not null check (amount >= 0),
  type text not null check (type in ('income', 'expense')),
  description text,
  category text,
  transaction_date date not null default current_date,
  created_at timestamptz not null default now()
);

create table if not exists public.notification_queue (
  id uuid primary key default gen_random_uuid(),
  barbershop_id uuid not null references public.barbershops(id) on delete cascade,
  client_id uuid references public.clients(id) on delete set null,
  message text not null,
  type text not null check (type in ('confirmation', 'promo', 'reminder')),
  status text not null default 'pending' check (status in ('pending', 'sent', 'failed')),
  scheduled_at timestamptz,
  sent_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists available_slots_lookup_idx
  on public.available_slots (barbershop_id, slot_datetime, is_booked);

create index if not exists appointments_barbershop_status_idx
  on public.appointments (barbershop_id, status, created_at desc);

create index if not exists transactions_barbershop_date_idx
  on public.transactions (barbershop_id, transaction_date desc);

create index if not exists notification_queue_pending_idx
  on public.notification_queue (status, scheduled_at)
  where status = 'pending';

create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists barbershops_touch_updated_at on public.barbershops;
create trigger barbershops_touch_updated_at
  before update on public.barbershops
  for each row execute function public.touch_updated_at();

alter table public.barbershops enable row level security;
alter table public.available_slots enable row level security;
alter table public.clients enable row level security;
alter table public.appointments enable row level security;
alter table public.transactions enable row level security;
alter table public.notification_queue enable row level security;

drop policy if exists "Owners can select own barbershop" on public.barbershops;
create policy "Owners can select own barbershop"
  on public.barbershops for select
  to authenticated
  using (owner_id = auth.uid());

drop policy if exists "Owners can insert own barbershop" on public.barbershops;
create policy "Owners can insert own barbershop"
  on public.barbershops for insert
  to authenticated
  with check (owner_id = auth.uid());

drop policy if exists "Owners can update own barbershop" on public.barbershops;
create policy "Owners can update own barbershop"
  on public.barbershops for update
  to authenticated
  using (owner_id = auth.uid())
  with check (owner_id = auth.uid());

drop policy if exists "Owners can delete own barbershop" on public.barbershops;
create policy "Owners can delete own barbershop"
  on public.barbershops for delete
  to authenticated
  using (owner_id = auth.uid());

drop policy if exists "Public can read active booking profiles" on public.barbershops;
create policy "Public can read active booking profiles"
  on public.barbershops for select
  to anon
  using (plan in ('active', 'trial'));

drop policy if exists "Owners can manage own slots" on public.available_slots;
create policy "Owners can manage own slots"
  on public.available_slots for all
  to authenticated
  using (
    exists (
      select 1 from public.barbershops
      where barbershops.id = available_slots.barbershop_id
        and barbershops.owner_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.barbershops
      where barbershops.id = available_slots.barbershop_id
        and barbershops.owner_id = auth.uid()
    )
  );

drop policy if exists "Public can read bookable slots for 30 days" on public.available_slots;
create policy "Public can read bookable slots for 30 days"
  on public.available_slots for select
  to anon
  using (
    slot_datetime between now() and now() + interval '30 days'
    and exists (
      select 1 from public.barbershops
      where barbershops.id = available_slots.barbershop_id
        and barbershops.plan in ('active', 'trial')
    )
  );

drop policy if exists "Owners can manage own clients" on public.clients;
create policy "Owners can manage own clients"
  on public.clients for all
  to authenticated
  using (
    exists (
      select 1 from public.barbershops
      where barbershops.id = clients.barbershop_id
        and barbershops.owner_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.barbershops
      where barbershops.id = clients.barbershop_id
        and barbershops.owner_id = auth.uid()
    )
  );

drop policy if exists "Owners can manage own appointments" on public.appointments;
create policy "Owners can manage own appointments"
  on public.appointments for all
  to authenticated
  using (
    exists (
      select 1 from public.barbershops
      where barbershops.id = appointments.barbershop_id
        and barbershops.owner_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.barbershops
      where barbershops.id = appointments.barbershop_id
        and barbershops.owner_id = auth.uid()
    )
  );

drop policy if exists "Owners can manage own transactions" on public.transactions;
create policy "Owners can manage own transactions"
  on public.transactions for all
  to authenticated
  using (
    exists (
      select 1 from public.barbershops
      where barbershops.id = transactions.barbershop_id
        and barbershops.owner_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.barbershops
      where barbershops.id = transactions.barbershop_id
        and barbershops.owner_id = auth.uid()
    )
  );

drop policy if exists "Owners can manage own notifications" on public.notification_queue;
create policy "Owners can manage own notifications"
  on public.notification_queue for all
  to authenticated
  using (
    exists (
      select 1 from public.barbershops
      where barbershops.id = notification_queue.barbershop_id
        and barbershops.owner_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.barbershops
      where barbershops.id = notification_queue.barbershop_id
        and barbershops.owner_id = auth.uid()
    )
  );

create or replace function public.normalize_slug(value text)
returns text
language sql
immutable
as $$
  select trim(both '-' from regexp_replace(lower(coalesce(value, '')), '[^a-z0-9]+', '-', 'g'));
$$;

create or replace function public.is_slug_available(p_slug text)
returns boolean
language sql
security definer
set search_path = public
as $$
  select not exists (
    select 1 from public.barbershops
    where slug = public.normalize_slug(p_slug)
  );
$$;

grant execute on function public.is_slug_available(text) to anon, authenticated;

create or replace function public.handle_new_user_barbershop()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  requested_name text := nullif(trim(new.raw_user_meta_data ->> 'barbershop_name'), '');
  requested_slug text := public.normalize_slug(new.raw_user_meta_data ->> 'barbershop_slug');
begin
  if requested_name is null or requested_slug is null or requested_slug = '' then
    return new;
  end if;

  insert into public.barbershops (
    owner_id,
    name,
    slug,
    custom_message,
    plan,
    plan_expires_at
  )
  values (
    new.id,
    requested_name,
    requested_slug,
    'Escolha seu horario e venha renovar o visual.',
    'trial',
    now() + interval '14 days'
  );

  return new;
exception
  when unique_violation then
    raise exception 'SLUG_ALREADY_EXISTS';
end;
$$;

drop trigger if exists on_auth_user_created_create_barbershop on auth.users;
create trigger on_auth_user_created_create_barbershop
  after insert on auth.users
  for each row execute function public.handle_new_user_barbershop();

create or replace function public.create_public_appointment(
  p_slug text,
  p_slot_id uuid,
  p_client_name text,
  p_whatsapp text
)
returns table (
  appointment_id uuid,
  client_id uuid,
  slot_datetime timestamptz,
  barbershop_name text
)
language plpgsql
security definer
set search_path = public
as $$
declare
  selected_barbershop public.barbershops%rowtype;
  selected_slot public.available_slots%rowtype;
  saved_client_id uuid;
  saved_appointment_id uuid;
begin
  select *
    into selected_barbershop
  from public.barbershops
  where slug = public.normalize_slug(p_slug)
    and plan in ('active', 'trial');

  if not found then
    raise exception 'BARBERSHOP_NOT_FOUND';
  end if;

  select *
    into selected_slot
  from public.available_slots
  where id = p_slot_id
    and barbershop_id = selected_barbershop.id
    and slot_datetime between now() and now() + interval '30 days'
  for update;

  if not found or selected_slot.is_booked or selected_slot.is_blocked then
    raise exception 'SLOT_UNAVAILABLE';
  end if;

  insert into public.clients (barbershop_id, name, whatsapp)
  values (selected_barbershop.id, trim(p_client_name), trim(p_whatsapp))
  on conflict (barbershop_id, whatsapp)
  do update set
    name = excluded.name,
    last_seen_at = now()
  returning id into saved_client_id;

  update public.available_slots
  set is_booked = true
  where id = selected_slot.id
    and is_booked = false
    and is_blocked = false;

  if not found then
    raise exception 'SLOT_UNAVAILABLE';
  end if;

  insert into public.appointments (barbershop_id, slot_id, client_id, status)
  values (selected_barbershop.id, selected_slot.id, saved_client_id, 'confirmed')
  returning id into saved_appointment_id;

  -- TODO: WhatsApp integration
  insert into public.notification_queue (
    barbershop_id,
    client_id,
    message,
    type,
    status,
    scheduled_at
  )
  values (
    selected_barbershop.id,
    saved_client_id,
    'Agendamento confirmado em ' || to_char(selected_slot.slot_datetime, 'DD/MM/YYYY HH24:MI') || '.',
    'confirmation',
    'pending',
    now()
  );

  return query
    select
      saved_appointment_id,
      saved_client_id,
      selected_slot.slot_datetime,
      selected_barbershop.name;
end;
$$;

grant execute on function public.create_public_appointment(text, uuid, text, text) to anon, authenticated;
