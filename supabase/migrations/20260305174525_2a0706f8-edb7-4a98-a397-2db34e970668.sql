
-- Add INSERT policy for user_roles so the auto-assign trigger works
-- We'll use a trigger to assign default role on signup instead of client-side insert

-- Allow the trigger (security definer) to insert roles
-- Drop the need for client-side role insert entirely

-- Add a foreign key from audit_logs.auditor_id to profiles.id so PostgREST can join
ALTER TABLE public.audit_logs DROP CONSTRAINT IF EXISTS audit_logs_auditor_id_fkey;
ALTER TABLE public.audit_logs ADD CONSTRAINT audit_logs_auditor_id_profiles_fkey 
  FOREIGN KEY (auditor_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

-- Create a function to auto-assign role on signup based on user metadata
CREATE OR REPLACE FUNCTION public.handle_new_user_role()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _role app_role;
BEGIN
  _role := COALESCE(
    (NEW.raw_user_meta_data->>'role')::app_role,
    'auditor'::app_role
  );
  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, _role)
  ON CONFLICT (user_id, role) DO NOTHING;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created_role
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_role();
