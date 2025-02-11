-- Enable realtime for personas and time_passes tables
alter publication supabase_realtime add table personas;
alter publication supabase_realtime add table time_passes;

-- Add realtime security policies
create policy "Enable realtime for users personas"
  on personas
  for select
  using (auth.uid() = user_id);

create policy "Enable realtime for users time passes"
  on time_passes
  for select
  using (
    exists (
      select 1 from personas
      where personas.id = time_passes.persona_id
      and personas.user_id = auth.uid()
    )
  );

-- Create function to handle time pass expiration
create or replace function handle_time_pass_expiration()
returns trigger as $$
begin
  if new.expire_at <= now() and new.status = 'active' then
    new.status = 'expired';
  end if;
  return new;
end;
$$ language plpgsql;

-- Create trigger for time pass expiration
create trigger check_time_pass_expiration
  before insert or update on time_passes
  for each row
  execute function handle_time_pass_expiration(); 