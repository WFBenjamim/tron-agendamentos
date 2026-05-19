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
  where barbershops.slug = public.normalize_slug(p_slug)
    and barbershops.plan in ('active', 'trial');

  if not found then
    raise exception 'BARBERSHOP_NOT_FOUND';
  end if;

  select *
    into selected_slot
  from public.available_slots
  where available_slots.id = p_slot_id
    and available_slots.barbershop_id = selected_barbershop.id
    and available_slots.slot_datetime between now() and now() + interval '30 days'
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
  returning clients.id into saved_client_id;

  update public.available_slots
  set is_booked = true
  where available_slots.id = selected_slot.id
    and available_slots.is_booked = false
    and available_slots.is_blocked = false;

  if not found then
    raise exception 'SLOT_UNAVAILABLE';
  end if;

  insert into public.appointments (barbershop_id, slot_id, client_id, status)
  values (selected_barbershop.id, selected_slot.id, saved_client_id, 'confirmed')
  returning appointments.id into saved_appointment_id;

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
