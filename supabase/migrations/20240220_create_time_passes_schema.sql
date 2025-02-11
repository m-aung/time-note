-- Create personas table if it doesn't exist
create table if not exists public.personas (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  image_url text,
  user_id uuid references auth.users(id) on delete cascade,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create time_passes table
create table if not exists public.time_passes (
  id uuid default gen_random_uuid() primary key,
  label text not null,
  expire_at timestamp with time zone not null,
  persona_id uuid references public.personas(id) on delete cascade not null,
  status text check (status in ('active', 'expired', 'paused')) not null default 'active',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create RLS policies
alter table public.time_passes enable row level security;

create policy "Users can view their own time passes"
  on public.time_passes for select
  using (
    persona_id in (
      select id from public.personas
      where user_id = auth.uid()
    )
  );

create policy "Users can insert their own time passes"
  on public.time_passes for insert
  with check (
    persona_id in (
      select id from public.personas
      where user_id = auth.uid()
    )
  );

create policy "Users can update their own time passes"
  on public.time_passes for update
  using (
    persona_id in (
      select id from public.personas
      where user_id = auth.uid()
    )
  );

create policy "Users can delete their own time passes"
  on public.time_passes for delete
  using (
    persona_id in (
      select id from public.personas
      where user_id = auth.uid()
    )
  );

-- Create function to update updated_at timestamp
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Create trigger for time_passes
create trigger handle_updated_at
  before update on public.time_passes
  for each row
  execute function public.handle_updated_at(); 