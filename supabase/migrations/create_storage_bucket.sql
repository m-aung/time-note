-- Create a new storage bucket for persona images
insert into storage.buckets (id, name, public)
values ('persona-images', 'persona-images', true);

-- Allow authenticated users to upload images
create policy "Authenticated users can upload persona images"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'persona-images' AND
  auth.role() = 'authenticated'
);

-- Allow public access to view images
create policy "Public access to persona images"
on storage.objects for select
to public
using ( bucket_id = 'persona-images' );

-- Create a bucket for storing profile images
insert into storage.buckets (id, name, public)
values ('profile-images', 'profile-images', true);

-- Allow public access to profile images
create policy "Public Access"
on storage.objects for select
using ( bucket_id = 'profile-images' );

-- Allow authenticated users to upload profile images
create policy "Users can upload profile images"
on storage.objects for insert
with check (
  bucket_id = 'profile-images' 
  and auth.role() = 'authenticated'
);

-- Allow users to update their own profile images
create policy "Users can update their profile images"
on storage.objects for update
using (
  bucket_id = 'profile-images'
  and auth.uid() = owner
); 