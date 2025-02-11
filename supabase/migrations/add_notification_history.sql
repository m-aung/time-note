-- Create notification history table
create table public.notification_history (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  time_pass_id uuid references public.time_passes(id) on delete cascade not null,
  title text not null,
  body text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  read_at timestamp with time zone
);

-- Add RLS policies
alter table public.notification_history enable row level security;

create policy "Users can view their own notification history"
  on notification_history for select
  using (auth.uid() = user_id);

create policy "Users can insert their own notification history"
  on notification_history for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own notification history"
  on notification_history for update
  using (auth.uid() = user_id); 