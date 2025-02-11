-- Add indexes for better query performance
create index if not exists time_passes_persona_id_idx 
  on time_passes(persona_id);

create index if not exists time_passes_status_idx 
  on time_passes(status);

create index if not exists time_passes_expire_at_idx 
  on time_passes(expire_at);

create index if not exists personas_user_id_idx 
  on personas(user_id);

-- Add composite index for common queries
create index if not exists time_passes_persona_status_idx 
  on time_passes(persona_id, status); 