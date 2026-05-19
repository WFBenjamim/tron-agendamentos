insert into storage.buckets (id, name, public)
values ('barbershop-logos', 'barbershop-logos', true)
on conflict (id) do update set public = true;

drop policy if exists "Authenticated users can read logos" on storage.objects;
create policy "Authenticated users can read logos"
  on storage.objects for select
  to authenticated, anon
  using (bucket_id = 'barbershop-logos');

drop policy if exists "Authenticated users can upload logos" on storage.objects;
create policy "Authenticated users can upload logos"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'barbershop-logos');

drop policy if exists "Authenticated users can update logos" on storage.objects;
create policy "Authenticated users can update logos"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'barbershop-logos')
  with check (bucket_id = 'barbershop-logos');

drop policy if exists "Authenticated users can delete logos" on storage.objects;
create policy "Authenticated users can delete logos"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'barbershop-logos');
