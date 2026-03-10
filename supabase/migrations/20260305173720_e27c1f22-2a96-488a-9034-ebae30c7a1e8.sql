
-- Create app_role enum
CREATE TYPE public.app_role AS ENUM ('manager', 'auditor');

-- Create profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL DEFAULT '',
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own profile" ON public.profiles FOR SELECT TO authenticated USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id);

-- Create user_roles table
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  UNIQUE (user_id, role)
);
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role
  )
$$;

-- RLS for user_roles: users can read their own roles, managers can read all
CREATE POLICY "Users can read own roles" ON public.user_roles FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Managers can read all roles" ON public.user_roles FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'manager'));

-- Assets table
CREATE TABLE public.assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  asset_id TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  location TEXT NOT NULL DEFAULT '',
  building TEXT NOT NULL DEFAULT '',
  floor TEXT NOT NULL DEFAULT '',
  room TEXT NOT NULL DEFAULT '',
  department TEXT NOT NULL DEFAULT '',
  vendor TEXT NOT NULL DEFAULT '',
  model TEXT NOT NULL DEFAULT '',
  serial_number TEXT NOT NULL DEFAULT '',
  purchase_date DATE,
  condition TEXT NOT NULL DEFAULT 'Good',
  audit_status TEXT NOT NULL DEFAULT 'Pending',
  last_audit_date DATE,
  last_audited_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.assets ENABLE ROW LEVEL SECURITY;

-- Everyone authenticated can read assets
CREATE POLICY "Authenticated users can read assets" ON public.assets FOR SELECT TO authenticated USING (true);
-- Managers can insert/update/delete
CREATE POLICY "Managers can insert assets" ON public.assets FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'manager'));
CREATE POLICY "Managers can update assets" ON public.assets FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'manager'));
CREATE POLICY "Managers can delete assets" ON public.assets FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'manager'));
-- Auditors can update audit_status and last_audit_date
CREATE POLICY "Auditors can update audit fields" ON public.assets FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'auditor'));

-- Audit logs table
CREATE TABLE public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  asset_id UUID REFERENCES public.assets(id) ON DELETE CASCADE NOT NULL,
  auditor_id UUID REFERENCES auth.users(id) NOT NULL,
  previous_status TEXT,
  new_status TEXT NOT NULL,
  notes TEXT DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read audit logs" ON public.audit_logs FOR SELECT TO authenticated USING (true);
CREATE POLICY "Auditors can insert audit logs" ON public.audit_logs FOR INSERT TO authenticated WITH CHECK (
  public.has_role(auth.uid(), 'auditor') OR public.has_role(auth.uid(), 'manager')
);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', ''));
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Enable realtime for audit_logs
ALTER PUBLICATION supabase_realtime ADD TABLE public.audit_logs;
ALTER PUBLICATION supabase_realtime ADD TABLE public.assets;
