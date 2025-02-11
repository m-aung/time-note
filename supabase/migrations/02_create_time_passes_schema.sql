-- Create time_passes table
CREATE TABLE IF NOT EXISTS public.time_passes (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  persona_id uuid REFERENCES public.personas(id) ON DELETE CASCADE NOT NULL,
  label text NOT NULL,
  duration integer NOT NULL,
  type text NOT NULL DEFAULT 'other',
  status text NOT NULL DEFAULT 'active',
  started_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  completed_at timestamp with time zone,
  paused_at timestamp with time zone,
  expire_at timestamp with time zone NOT NULL,
  remaining_time integer,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  
  -- Add constraints
  CONSTRAINT valid_type CHECK (type IN ('entertainment', 'education', 'exercise', 'other')),
  CONSTRAINT valid_status CHECK (status IN ('active', 'paused', 'expired', 'completed', 'cancelled')),
  CONSTRAINT valid_duration CHECK (duration > 0)
);

-- Enable RLS
ALTER TABLE public.time_passes ENABLE ROW LEVEL SECURITY;

-- Add RLS policies
CREATE POLICY "Users can view their own time passes"
  ON time_passes FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM personas 
      WHERE personas.id = time_passes.persona_id 
      AND personas.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert time passes for their personas"
  ON time_passes FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM personas 
      WHERE personas.id = time_passes.persona_id 
      AND personas.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their own time passes"
  ON time_passes FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM personas 
      WHERE personas.id = time_passes.persona_id 
      AND personas.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete their own time passes"
  ON time_passes FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM personas 
      WHERE personas.id = time_passes.persona_id 
      AND personas.user_id = auth.uid()
    )
  );

-- Add indexes
CREATE INDEX IF NOT EXISTS time_passes_persona_id_idx ON time_passes(persona_id);
CREATE INDEX IF NOT EXISTS time_passes_status_idx ON time_passes(status);
CREATE INDEX IF NOT EXISTS time_passes_expire_at_idx ON time_passes(expire_at);
CREATE INDEX IF NOT EXISTS time_passes_persona_status_idx ON time_passes(persona_id, status); 