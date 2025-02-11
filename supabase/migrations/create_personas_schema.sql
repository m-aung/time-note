-- Create personas table
create table public.personas (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  image_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create time_passes table
create table public.time_passes (
  id uuid default uuid_generate_v4() primary key,
  persona_id uuid references public.personas(id) on delete cascade not null,
  label text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  expire_at timestamp with time zone not null,
  is_active boolean default true not null
);

-- Add RLS policies
alter table public.personas enable row level security;
alter table public.time_passes enable row level security;

-- Personas policies
create policy "Users can view their own personas"
  on personas for select
  using (auth.uid() = user_id);

create policy "Users can insert their own personas"
  on personas for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own personas"
  on personas for update
  using (auth.uid() = user_id);

create policy "Users can delete their own personas"
  on personas for delete
  using (auth.uid() = user_id);

-- Time passes policies
create policy "Users can view time passes for their personas"
  on time_passes for select
  using (
    exists (
      select 1 from personas
      where personas.id = time_passes.persona_id
      and personas.user_id = auth.uid()
    )
  );

create policy "Users can insert time passes for their personas"
  on time_passes for insert
  with check (
    exists (
      select 1 from personas
      where personas.id = time_passes.persona_id
      and personas.user_id = auth.uid()
    )
  );

create policy "Users can update time passes for their personas"
  on time_passes for update
  using (
    exists (
      select 1 from personas
      where personas.id = time_passes.persona_id
      and personas.user_id = auth.uid()
    )
  );

create policy "Users can delete time passes for their personas"
  on time_passes for delete
  using (
    exists (
      select 1 from personas
      where personas.id = time_passes.persona_id
      and personas.user_id = auth.uid()
    )
  );

-- Add functions to update timestamps
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Add triggers for updated_at
create trigger handle_personas_updated_at
  before update on personas
  for each row
  execute function handle_updated_at(); 