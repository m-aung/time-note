-- Enable realtime for tables
ALTER PUBLICATION supabase_realtime ADD TABLE personas;
ALTER PUBLICATION supabase_realtime ADD TABLE time_passes;

-- Create function to handle time pass expiration
CREATE OR REPLACE FUNCTION handle_time_pass_expiration()
RETURNS trigger AS $$
BEGIN
  IF NEW.expire_at <= now() AND NEW.status = 'active' THEN
    NEW.status = 'expired';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for time pass expiration
CREATE TRIGGER check_time_pass_expiration
  BEFORE INSERT OR UPDATE ON time_passes
  FOR EACH ROW
  EXECUTE FUNCTION handle_time_pass_expiration();

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION handle_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER handle_personas_updated_at
  BEFORE UPDATE ON personas
  FOR EACH ROW
  EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER handle_time_passes_updated_at
  BEFORE UPDATE ON time_passes
  FOR EACH ROW
  EXECUTE FUNCTION handle_updated_at();

-- Refresh schema cache
NOTIFY pgrst, 'reload schema'; 